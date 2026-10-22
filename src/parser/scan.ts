import type { Account, CatalogEntry, ScanOptions } from '../types';
import { accountsFromAggregate, addMail, createAggregate } from './aggregate';
import { MailStreamParser } from './mail-stream';
import { isZip, scanZipStream } from './zip-stream';
import { strings } from '../strings';

export interface ScanListener {
  onProgress?: (update: { bytesRead: number; messages: number; accounts: Account[] }) => void;
}

export interface LocalScanResult {
  accounts: Account[];
  messages: number;
  skipped: number;
  warnings: string[];
  bytesRead: number;
}

function streamFrom(
  head: Uint8Array,
  reader: ReadableStreamDefaultReader<Uint8Array>,
): ReadableStream<Uint8Array> {
  let queued = head.length > 0;
  return new ReadableStream({
    async pull(controller) {
      if (queued) {
        queued = false;
        controller.enqueue(head);
        return;
      }
      const next = await reader.read();
      if (next.done) controller.close();
      else controller.enqueue(next.value);
    },
  });
}

export async function scanReadable(
  source: ReadableStream<Uint8Array>,
  options: ScanOptions,
  catalog: Pick<CatalogEntry, 'id' | 'name' | 'domains'>[],
  listener: ScanListener = {},
  signal?: AbortSignal,
): Promise<LocalScanResult> {
  const reader = source.getReader();
  const parts: Uint8Array[] = [];
  let headLength = 0;
  while (headLength < 4) {
    const next = await reader.read();
    if (next.done) break;
    parts.push(next.value);
    headLength += next.value.length;
  }
  const head = new Uint8Array(headLength);
  let offset = 0;
  for (const part of parts) {
    head.set(part, offset);
    offset += part.length;
  }
  if (signal?.aborted) throw new DOMException('The scan was cancelled.', 'AbortError');
  if (isZip(head)) {
    const aggregate = createAggregate();
    const zipped = await scanZipStream(
      streamFrom(head, reader),
      (mail) => addMail(aggregate, mail, options, catalog),
      signal,
      (update) => {
        listener.onProgress?.({
          bytesRead: update.compressed,
          messages: update.messages,
          accounts: accountsFromAggregate(aggregate),
        });
      },
    );
    const accounts = accountsFromAggregate(aggregate);
    if (aggregate.ignoredMarketing > 0) zipped.warnings.push(strings.warnings.newsletters);
    listener.onProgress?.({
      bytesRead: zipped.compressed,
      messages: zipped.messages,
      accounts,
    });
    return {
      accounts,
      messages: zipped.messages,
      skipped: zipped.skipped,
      warnings: zipped.warnings,
      bytesRead: zipped.compressed,
    };
  }

  const aggregate = createAggregate();
  const parser = new MailStreamParser((mail) => addMail(aggregate, mail, options, catalog));
  const decoder = new TextDecoder('utf-8', { fatal: false });
  let bytesRead = 0;
  let lastReport = 0;
  const report = () => {
    listener.onProgress?.({
      bytesRead,
      messages: parser.stats.messages,
      accounts: accountsFromAggregate(aggregate),
    });
  };
  const consume = (bytes: Uint8Array) => {
    if (!bytes.length) return;
    bytesRead += bytes.length;
    parser.pushText(decoder.decode(bytes, { stream: true }), false);
    const now = Date.now();
    if (now - lastReport > 200) {
      lastReport = now;
      report();
    }
  };
  if (head.length) consume(head);
  while (!signal?.aborted) {
    const next = await reader.read();
    if (next.done) break;
    consume(next.value);
  }
  if (signal?.aborted) {
    await reader.cancel();
    throw new DOMException('The scan was cancelled.', 'AbortError');
  }
  parser.pushText(decoder.decode(), true);
  report();
  const warnings = [...parser.stats.warnings];
  if (aggregate.ignoredMarketing > 0) warnings.push(strings.warnings.newsletters);
  return {
    accounts: accountsFromAggregate(aggregate),
    messages: parser.stats.messages,
    skipped: parser.stats.skipped,
    warnings,
    bytesRead,
  };
}
