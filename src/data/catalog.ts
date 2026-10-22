import catalogJson from './catalog.json';
import type { CatalogEntry } from '../types';

export const serviceCatalog = catalogJson as CatalogEntry[];

const guideStatuses = new Set(['verified', 'restricted', 'unverified']);
const categories = new Set([
  'Cloud storage',
  'Development',
  'Design & creation',
  'Productivity',
  'Learning',
  'Entertainment',
  'Shopping & finance',
  'Campus',
]);
const educationStatuses = new Set(['yes', 'no', 'unverified']);

function httpsUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.includes('.');
  } catch {
    return false;
  }
}

function realDate(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function catalogProblems(value: unknown): string[] {
  if (!Array.isArray(value)) return ['catalog'];
  const problems: string[] = [];
  const domains = new Set<string>();
  const ids = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      problems.push('entry');
      continue;
    }
    const item = entry as Partial<CatalogEntry>;
    if (typeof item.id !== 'string' || item.id.length === 0 || ids.has(item.id))
      problems.push('id');
    else ids.add(item.id);
    if (typeof item.name !== 'string' || item.name.length === 0) problems.push('name');
    if (typeof item.category !== 'string' || !categories.has(item.category))
      problems.push('category');
    if (!realDate(item.verifiedAt)) problems.push('verifiedAt');
    if (!item.education || typeof item.education !== 'object') problems.push('education');
    else {
      if (!educationStatuses.has(item.education.available)) problems.push('education');
      if (typeof item.education.impact !== 'string' || item.education.impact.length === 0) {
        problems.push('education');
      }
      if (item.education.url !== undefined && !httpsUrl(item.education.url)) problems.push('url');
    }
    if (!Array.isArray(item.domains) || item.domains.length === 0) problems.push('domains');
    else {
      for (const domain of item.domains) {
        if (typeof domain !== 'string' || !domain.includes('.') || domains.has(domain)) {
          problems.push(`domain:${String(domain)}`);
        } else domains.add(domain);
      }
    }
    if (!Array.isArray(item.sources) || item.sources.length === 0) problems.push('sources');
    else if (item.sources.some((source) => !httpsUrl(source))) problems.push('sources');
    for (const guide of [item.email, item.export, item.deletion]) {
      if (!guide || typeof guide !== 'object') {
        problems.push('guide');
        continue;
      }
      if (
        !guideStatuses.has(guide.status) ||
        !Array.isArray(guide.steps) ||
        guide.steps.length === 0 ||
        guide.steps.some((step) => typeof step !== 'string' || step.length === 0)
      ) {
        problems.push('guide');
      }
      if (guide.status !== 'unverified' && !httpsUrl(guide.url)) problems.push('url');
      else if (guide.url !== undefined && !httpsUrl(guide.url)) problems.push('url');
    }
  }
  return problems;
}

export function guideSteps(
  entry: CatalogEntry | undefined,
  kind: 'email' | 'export' | 'deletion',
): string[] {
  if (!entry) return [];
  return entry[kind].steps;
}
