const ENCODED_WORD = /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g;

function bytesFromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bytesFromQuotedPrintable(value: string): Uint8Array {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '=' && /^[0-9A-Fa-f]{2}$/.test(value.slice(index + 1, index + 3))) {
      bytes.push(Number.parseInt(value.slice(index + 1, index + 3), 16));
      index += 2;
    } else bytes.push(value.charCodeAt(index) & 0xff);
  }
  return Uint8Array.from(bytes);
}

/** Decode RFC 2047 encoded-words. Unknown charsets fall back to UTF-8. */
export function decodeHeader(value: string): string {
  const joined = value.replace(/(\?=\s*=\?)/g, '?==?');
  return joined.replace(ENCODED_WORD, (_match, charset: string, encoding: string, data: string) => {
    try {
      const bytes =
        encoding.toLowerCase() === 'b'
          ? bytesFromBase64(data)
          : bytesFromQuotedPrintable(data.replace(/_/g, ' '));
      const label = charset.trim().toLowerCase() || 'utf-8';
      return new TextDecoder(label === 'utf8' ? 'utf-8' : label, { fatal: false }).decode(bytes);
    } catch {
      return data;
    }
  });
}

export function stripMarkup(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_match, code: string) => {
      const point = Number(code);
      return point > 0 && point < 0x110000 ? String.fromCodePoint(point) : ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();
}

const ENCODED_WORD_TOKEN = /=\?[^\s?]*\?[BbQq]\?[^\s?]*\?=/g;
const DOMAIN = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
/** RFC 5322 atext. Dot is only legal between atoms. */
const ATEXT = /[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]/;

function isAtext(char: string): boolean {
  return ATEXT.test(char);
}

function readQuoted(value: string, start: number): { local: string; next: number } | null {
  let local = '';
  let index = start + 1;
  while (index < value.length) {
    const char = value[index] ?? '';
    if (char === '\\') {
      local += value[index + 1] ?? '';
      index += 2;
      continue;
    }
    if (char === '"') return { local, next: index + 1 };
    local += char;
    index += 1;
  }
  return null;
}

function skipComment(value: string, start: number): number {
  let depth = 1;
  let index = start + 1;
  while (index < value.length && depth > 0) {
    const char = value[index] ?? '';
    if (char === '\\') {
      index += 2;
      continue;
    }
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    index += 1;
  }
  return index;
}

function readDotAtom(value: string, start: number): { text: string; next: number } | null {
  if (!isAtext(value[start] ?? '')) return null;
  let index = start;
  let text = '';
  while (index < value.length) {
    const char = value[index] ?? '';
    if (isAtext(char)) {
      text += char;
      index += 1;
      continue;
    }
    if (char === '.' && isAtext(value[index + 1] ?? '')) {
      text += '.';
      index += 1;
      continue;
    }
    break;
  }
  return { text, next: index };
}

function readDomain(value: string, start: number): { text: string; next: number } | null {
  const atom = readDotAtom(value, start);
  if (!atom || !DOMAIN.test(atom.text)) return null;
  return atom;
}

function skipSpaceAndComments(value: string, start: number): number {
  let index = start;
  while (index < value.length) {
    const char = value[index] ?? '';
    if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
      index += 1;
      continue;
    }
    if (char === '(') {
      index = skipComment(value, index);
      continue;
    }
    break;
  }
  return index;
}

function readAddrSpec(value: string, start: number): { address: string; next: number } | null {
  const index = skipSpaceAndComments(value, start);
  if (value[index] === '"') {
    const quoted = readQuoted(value, index);
    if (!quoted) return null;
    const at = skipSpaceAndComments(value, quoted.next);
    if (value[at] !== '@') return null;
    const domain = readDomain(value, skipSpaceAndComments(value, at + 1));
    if (!domain) return null;
    return { address: `"${quoted.local}"@${domain.text}`.toLowerCase(), next: domain.next };
  }
  const local = readDotAtom(value, index);
  if (!local) return null;
  const at = skipSpaceAndComments(value, local.next);
  if (value[at] !== '@') return null;
  const domain = readDomain(value, skipSpaceAndComments(value, at + 1));
  if (!domain) return null;
  return { address: `${local.text}@${domain.text}`.toLowerCase(), next: domain.next };
}

/** Addr-spec values only. Display text, including encoded-words and comments, is not an address. */
export function extractAddresses(value: string): string[] {
  const source = value.replace(ENCODED_WORD_TOKEN, ' ');
  const found: string[] = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index] ?? '';
    if (char === '\\') {
      index += 2;
      continue;
    }
    if (char === '(') {
      index = skipComment(source, index);
      continue;
    }
    if (char === '"') {
      const address = readAddrSpec(source, index);
      if (address) {
        found.push(address.address);
        index = address.next;
        continue;
      }
      const quoted = readQuoted(source, index);
      index = quoted ? quoted.next : index + 1;
      continue;
    }
    if (char === '<') {
      const address = readAddrSpec(source, index + 1);
      const end = source.indexOf('>', index + 1);
      if (address && end >= address.next) found.push(address.address);
      index = end < 0 ? source.length : end + 1;
      continue;
    }
    const address = readAddrSpec(source, index);
    if (address && address.next > index) {
      found.push(address.address);
      index = address.next;
      continue;
    }
    index += 1;
  }
  return [...new Set(found)];
}

export function domainOfAddress(address: string): string {
  const at = address.lastIndexOf('@');
  return at >= 0 ? address.slice(at + 1).toLowerCase() : '';
}

/** Unfold continuation lines, then keep the raw field value. Decode display text separately. */
export function headerMap(lines: string[]): Map<string, string> {
  const unfolded: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && unfolded.length > 0) {
      const joined = `${unfolded[unfolded.length - 1]} ${line.trim()}`;
      unfolded[unfolded.length - 1] = joined.slice(0, 8_000);
      continue;
    }
    if (unfolded.length >= 80) continue;
    unfolded.push(line.slice(0, 8_000));
  }
  const map = new Map<string, string>();
  for (const line of unfolded) {
    const split = line.indexOf(':');
    if (split <= 0) continue;
    const name = line.slice(0, split).trim().toLowerCase();
    const value = line.slice(split + 1).trim();
    const previous = map.get(name);
    map.set(name, previous ? `${previous}, ${value}` : value);
  }
  return map;
}

export function calendarDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}
