import { calendarDate, decodeHeader, extractAddresses, headerMap, stripMarkup } from './headers';
import type { ParsedMail } from './aggregate';
import { strings } from '../strings';

const MAX_CARRY = 1_000_000;
const MAX_STORED_HEADERS = 80;
const MAX_HEADER_LINE = 8_000;
const RAW_BODY_CAP = 8_000;

function isMboxSeparator(line: string): boolean {
  return /^From \S+@\S+ /.test(line) || /^From \S+ (?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) /.test(line);
}

function charsetOf(type: string): string {
  const match = /charset\s*=\s*(?:"([^"]+)"|([^;\s]+))/i.exec(type);
  const label = (match?.[1] ?? match?.[2] ?? 'utf-8').trim().toLowerCase();
  return label === 'utf8' ? 'utf-8' : label;
}

function boundaryOf(type: string): string {
  const match = /boundary\s*=\s*(?:"([^"]+)"|([^;\s]+))/i.exec(type);
  return (match?.[1] ?? match?.[2] ?? '').trim();
}

function decodeBytes(bytes: Uint8Array, charset: string): string {
  try {
    return new TextDecoder(charset, { fatal: false }).decode(bytes);
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }
}

function decodeTransfer(body: string, encoding: string, charset: string): string {
  const method = encoding.toLowerCase();
  if (method.includes('base64')) {
    const compact = body.replace(/\s/g, '').slice(0, 12_000);
    const usable = compact.slice(0, compact.length - (compact.length % 4));
    if (!usable) return '';
    try {
      const binary = atob(usable);
      const bytes = new Uint8Array(Math.min(binary.length, 6_000));
      for (let index = 0; index < bytes.length; index += 1) bytes[index] = binary.charCodeAt(index);
      return decodeBytes(bytes, charset);
    } catch {
      return '';
    }
  }
  if (method.includes('quoted-printable')) {
    const raw = body.slice(0, 12_000);
    const bytes: number[] = [];
    for (let index = 0; index < raw.length && bytes.length < 8_000; index += 1) {
      const char = raw[index] ?? '';
      if (char === '=' && (raw[index + 1] === '\n' || raw[index + 1] === '\r')) {
        index += raw[index + 1] === '\r' && raw[index + 2] === '\n' ? 2 : 1;
        continue;
      }
      const hex = raw.slice(index + 1, index + 3);
      if (char === '=' && /^[0-9A-Fa-f]{2}$/.test(hex)) {
        bytes.push(Number.parseInt(hex, 16));
        index += 2;
        continue;
      }
      if (char === '\r') continue;
      if (char === '\n') {
        bytes.push(0x0a);
        continue;
      }
      bytes.push(char.charCodeAt(0) & 0xff);
    }
    return decodeBytes(Uint8Array.from(bytes), charset);
  }
  return body;
}

function multipartText(body: string, boundary: string, depth = 0): string {
  if (!boundary || depth > 4) return '';
  const parts = body.split(`--${boundary}`);
  const texts: string[] = [];
  for (const part of parts) {
    const split = part.search(/\r?\n\r?\n/);
    if (split < 0) continue;
    const headerText = part.slice(0, split);
    const raw = part.slice(split).replace(/^\r?\n\r?\n/, '');
    const headers = headerMap(headerText.split(/\r?\n/));
    const type = headers.get('content-type') ?? '';
    const disposition = headers.get('content-disposition') ?? '';
    if (/attachment/i.test(disposition)) continue;
    if (/multipart\//i.test(type)) {
      texts.push(multipartText(raw, boundaryOf(type), depth + 1));
    } else if (/^text\//i.test(type || 'text/plain')) {
      texts.push(
        decodeTransfer(raw, headers.get('content-transfer-encoding') ?? '', charsetOf(type)),
      );
    }
    if (texts.join('\n').length > 600) break;
  }
  return texts.join('\n');
}

function messagePreview(headers: Map<string, string>, body: string): string {
  const disposition = headers.get('content-disposition') ?? '';
  if (/attachment/i.test(disposition)) return '';
  const contentType = headers.get('content-type') ?? '';
  if (/multipart\//i.test(contentType)) {
    const boundary = boundaryOf(contentType);
    return boundary ? stripMarkup(multipartText(body, boundary)).slice(0, 600) : '';
  }
  if (/^application\//i.test(contentType) || /^image\//i.test(contentType)) return '';
  return stripMarkup(
    decodeTransfer(body, headers.get('content-transfer-encoding') ?? '', charsetOf(contentType)),
  ).slice(0, 600);
}

export interface MailScanStats {
  messages: number;
  skipped: number;
  warnings: string[];
}

export class MailStreamParser {
  private carry = '';
  private skippingLongLine = false;
  private mode: 'detect' | 'mbox' | 'eml' = 'detect';
  private inHeaders = false;
  private headers: string[] = [];
  private headerOverflow = false;
  private body = '';
  private sawMessage = false;
  readonly stats: MailScanStats = { messages: 0, skipped: 0, warnings: [] };

  constructor(private readonly onMessage: (mail: ParsedMail) => void) {}

  pushText(chunk: string, final: boolean): void {
    let text = chunk;
    if (this.skippingLongLine) {
      const newline = text.indexOf('\n');
      if (newline === -1) {
        if (final) this.finish();
        return;
      }
      this.skippingLongLine = false;
      text = text.slice(newline + 1);
    }
    const combined = this.carry + text;
    if (!combined.includes('\n') && combined.length > MAX_CARRY && !final) {
      this.carry = '';
      this.skippingLongLine = true;
      this.note(strings.warnings.longLine);
      this.stats.skipped += 1;
      return;
    }
    const lines = combined.split('\n');
    this.carry = final ? '' : (lines.pop() ?? '');
    if (this.carry.length > MAX_CARRY) {
      this.carry = '';
      this.skippingLongLine = true;
      this.note(strings.warnings.longLine);
      this.stats.skipped += 1;
    }
    for (const raw of lines) this.consume(raw.replace(/\r$/, ''));
    if (final && this.carry) this.consume(this.carry.replace(/\r$/, ''));
    if (final) this.finish();
  }

  private note(warning: string): void {
    if (!this.stats.warnings.includes(warning)) this.stats.warnings.push(warning);
  }

  private consume(line: string): void {
    if (this.mode === 'detect') {
      if (line.trim() === '') return;
      this.mode = isMboxSeparator(line) ? 'mbox' : 'eml';
      if (this.mode === 'mbox') return;
    }
    if (this.mode === 'mbox' && isMboxSeparator(line)) {
      this.finish();
      this.begin();
      return;
    }
    if (!this.sawMessage) this.begin();
    if (this.inHeaders) {
      if (line === '') {
        this.inHeaders = false;
        return;
      }
      if (/^[ \t]/.test(line) && this.headers.length > 0) {
        const last = this.headers.length - 1;
        this.headers[last] = `${this.headers[last]} ${line.trim()}`.slice(0, MAX_HEADER_LINE);
        return;
      }
      if (this.headers.length >= MAX_STORED_HEADERS) {
        this.headerOverflow = true;
        return;
      }
      this.headers.push(line.slice(0, MAX_HEADER_LINE));
      return;
    }
    if (this.body.length < RAW_BODY_CAP) {
      this.body = `${this.body}${line}\n`.slice(0, RAW_BODY_CAP);
    }
  }

  private begin(): void {
    this.finish();
    this.sawMessage = true;
    this.inHeaders = true;
    this.headers = [];
    this.headerOverflow = false;
    this.body = '';
  }

  private finish(): void {
    if (!this.sawMessage || this.headers.length === 0) {
      this.sawMessage = false;
      return;
    }
    if (this.headerOverflow) this.note(strings.warnings.headerOverflow);
    const headers = headerMap(this.headers);
    const from = headers.get('from') ?? '';
    const recipients = [
      ...extractAddresses(headers.get('to') ?? ''),
      ...extractAddresses(headers.get('cc') ?? ''),
      ...extractAddresses(headers.get('delivered-to') ?? ''),
      ...extractAddresses(headers.get('x-original-to') ?? ''),
      ...extractAddresses(headers.get('envelope-to') ?? ''),
      ...extractAddresses(headers.get('resent-to') ?? ''),
      ...extractAddresses(headers.get('x-forwarded-to') ?? ''),
    ];
    const mail: ParsedMail = {
      from,
      replyTo: headers.get('reply-to') ?? '',
      listId: headers.get('list-id') ?? '',
      recipients,
      date: calendarDate(headers.get('date') ?? ''),
      subject: decodeHeader(headers.get('subject') ?? '').slice(0, 180),
      listUnsubscribe: headers.has('list-unsubscribe'),
      preview: messagePreview(headers, this.body),
    };
    if (!from && recipients.length === 0 && !mail.subject) this.stats.skipped += 1;
    else {
      this.stats.messages += 1;
      this.onMessage(mail);
    }
    this.sawMessage = false;
    this.headers = [];
    this.body = '';
  }
}
