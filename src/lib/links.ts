import type { CatalogEntry } from '../types';

export function httpsUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}

export function officialLinkAllowed(url: string, entry: CatalogEntry): boolean {
  const target = httpsUrl(url);
  if (!target) return false;
  const hosts = new Set<string>();
  for (const source of [
    entry.email.url,
    entry.export.url,
    entry.deletion.url,
    entry.education.url,
    ...entry.sources,
  ]) {
    if (!source) continue;
    const parsed = httpsUrl(source);
    if (parsed) hosts.add(parsed.hostname);
  }
  return hosts.has(target.hostname);
}
