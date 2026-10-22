import { Unzip, UnzipInflate, UnzipPassThrough, type UnzipFile } from 'fflate';
import { MailStreamParser } from './mail-stream';
import type { ParsedMail } from './aggregate';
import { strings } from '../strings';

export const ZIP_LIMITS = {
  maxFiles: 2_000,
  maxUncompressed: 8 * 1024 * 1024 * 1024,
  maxRatio: 100,
  ratioFloor: 32 * 1024 * 1024,
  maxDepth: 0,
  tailBytes: 8 * 1024 * 1024,
};

export class ZipRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZipRejected';
  }
}

export function isZip(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 3 || bytes[2] === 5 || bytes[2] === 7)
  );
}

const CRC_TABLE = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  CRC_TABLE[index] = value >>> 0;
}

function crc32Update(seed: number, bytes: Uint8Array): number {
  let crc = seed;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return crc >>> 0;
}

function u16(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function u32(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
}

interface CentralEntry {
  name: string;
  crc: number;
}

function centralDirectory(tail: Uint8Array, tailStart: number): CentralEntry[] | null {
  let end = -1;
  const earliest = Math.max(0, tail.length - 65557);
  for (let offset = tail.length - 22; offset >= earliest; offset -= 1) {
    if (u32(tail, offset) === 0x06054b50) {
      end = offset;
      break;
    }
  }
  if (end < 0 || end + 22 > tail.length) return null;
  const declaredCount = u16(tail, end + 10);
  const size = u32(tail, end + 12);
  const absolute = u32(tail, end + 16);
  const start = absolute - tailStart;
  if (start < 0 || start + size > tail.length) return null;
  const entries: CentralEntry[] = [];
  let cursor = start;
  const stop = start + size;
  while (cursor + 46 <= stop) {
    if (u32(tail, cursor) !== 0x02014b50) return null;
    const nameLength = u16(tail, cursor + 28);
    const extraLength = u16(tail, cursor + 30);
    const commentLength = u16(tail, cursor + 32);
    const nameBytes = tail.subarray(cursor + 46, cursor + 46 + nameLength);
    entries.push({
      name: new TextDecoder().decode(nameBytes),
      crc: u32(tail, cursor + 16),
    });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (declaredCount !== 0xffff && entries.length !== declaredCount) return null;
  return entries;
}

function safeEntry(name: string): boolean {
  const normalized = name.replace(/\\/g, '/');
  return !normalized.startsWith('/') && !normalized.split('/').includes('..');
}

function extension(name: string): string {
  const base = name.split('/').pop() ?? '';
  const dot = base.lastIndexOf('.');
  return dot === -1 ? '' : base.slice(dot + 1).toLowerCase();
}

function declaredTooLarge(file: UnzipFile): boolean {
  const uncompressed = file.originalSize ?? 0;
  const compressed = file.size ?? 0;
  if (uncompressed > ZIP_LIMITS.maxUncompressed) return true;
  if (
    uncompressed > ZIP_LIMITS.ratioFloor &&
    compressed > 0 &&
    uncompressed / compressed > ZIP_LIMITS.maxRatio
  ) {
    return true;
  }
  return false;
}

export interface ZipProgress {
  compressed: number;
  messages: number;
}

export async function scanZipStream(
  stream: ReadableStream<Uint8Array>,
  onMessage: (mail: ParsedMail) => void,
  signal?: AbortSignal,
  onProgress?: (update: ZipProgress) => void,
): Promise<{
  messages: number;
  skipped: number;
  warnings: string[];
  uncompressed: number;
  compressed: number;
}> {
  const warnings: string[] = [];
  const note = (warning: string) => {
    if (!warnings.includes(warning)) warnings.push(warning);
  };
  let files = 0;
  let uncompressed = 0;
  let compressed = 0;
  let failed: Error | null = null;
  const parsers = new Map<UnzipFile, MailStreamParser>();
  const extracted = new Map<string, number>();
  const tailParts: Uint8Array[] = [];
  let tailLength = 0;
  const remember = (chunk: Uint8Array) => {
    tailParts.push(chunk);
    tailLength += chunk.length;
    while (tailLength > ZIP_LIMITS.tailBytes && tailParts.length > 1) {
      const removed = tailParts.shift();
      if (removed) tailLength -= removed.length;
    }
  };

  const unzip = new Unzip();
  unzip.register(UnzipInflate);
  unzip.register(UnzipPassThrough);
  unzip.onfile = (file) => {
    files += 1;
    if (files > ZIP_LIMITS.maxFiles) {
      failed = new ZipRejected(strings.warnings.zipTooMany);
      return;
    }
    if (declaredTooLarge(file)) {
      failed = new ZipRejected(strings.warnings.zipExpanded);
      return;
    }
    if (!safeEntry(file.name)) {
      note(strings.warnings.zipUnsafe);
      return;
    }
    const ext = extension(file.name);
    if (ext === 'zip') {
      note(strings.warnings.zipNested);
      return;
    }
    if (file.name.endsWith('/') || (ext !== 'mbox' && ext !== 'eml')) {
      note(strings.warnings.zipSkipped);
      return;
    }
    if (file.compression !== 0 && file.compression !== 8) {
      note(strings.warnings.zipMethod);
      return;
    }
    const parser = new MailStreamParser(onMessage);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    parsers.set(file, parser);
    let crc = 0xffffffff;
    file.ondata = (error, data, final) => {
      if (failed) return;
      if (error) {
        failed = new ZipRejected(strings.warnings.zipDamaged);
        return;
      }
      uncompressed += data.length;
      crc = crc32Update(crc, data);
      const ratio = compressed === 0 ? uncompressed : uncompressed / compressed;
      if (
        uncompressed > ZIP_LIMITS.maxUncompressed ||
        (uncompressed > ZIP_LIMITS.ratioFloor && ratio > ZIP_LIMITS.maxRatio)
      ) {
        failed = new ZipRejected(strings.warnings.zipExpanded);
        return;
      }
      parser.pushText(decoder.decode(data, { stream: !final }), false);
      if (final) {
        parser.pushText(decoder.decode(), true);
        extracted.set(file.name, ~crc >>> 0);
      }
    };
    try {
      file.start();
    } catch {
      failed = new ZipRejected(strings.warnings.zipDamaged);
    }
  };

  const reader = stream.getReader();
  let lastReport = 0;
  const report = () => {
    let messages = 0;
    for (const parser of parsers.values()) messages += parser.stats.messages;
    onProgress?.({ compressed, messages });
  };
  try {
    while (!signal?.aborted && !failed) {
      const next = await reader.read();
      if (next.done) break;
      compressed += next.value.length;
      const owned = next.value.slice();
      remember(owned);
      for (let index = 0; index < owned.length; index += 8_192) {
        unzip.push(owned.subarray(index, index + 8_192).slice(), false);
        if (failed) break;
      }
      const now = Date.now();
      if (now - lastReport > 200) {
        lastReport = now;
        report();
      }
    }
    if (!failed && !signal?.aborted) unzip.push(new Uint8Array(), true);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    failed =
      message.startsWith('This archive') || message.startsWith('Nested')
        ? (error as Error)
        : new ZipRejected(strings.warnings.zipDamaged);
  } finally {
    reader.releaseLock();
  }
  if (signal?.aborted) throw new DOMException('The scan was cancelled.', 'AbortError');
  report();
  const tail = new Uint8Array(tailLength);
  let offset = 0;
  for (const part of tailParts) {
    tail.set(part, offset);
    offset += part.length;
  }
  const directory = centralDirectory(tail, compressed - tailLength);
  if (!directory) failed = failed ?? new ZipRejected(strings.warnings.zipIncomplete);
  else {
    for (const [name, crc] of extracted) {
      const listed = directory.find((entry) => entry.name === name);
      if (!listed || listed.crc !== crc) failed = new ZipRejected(strings.warnings.zipDamaged);
    }
  }
  if (failed) throw failed;
  let messages = 0;
  let skipped = 0;
  for (const parser of parsers.values()) {
    messages += parser.stats.messages;
    skipped += parser.stats.skipped;
    for (const warning of parser.stats.warnings) note(warning);
  }
  return { messages, skipped, warnings, uncompressed, compressed };
}
