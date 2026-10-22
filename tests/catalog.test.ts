import { describe, expect, it } from 'vitest';
import { serviceCatalog } from '../src/data/catalog';
import { catalogProblems } from '../src/data/catalog';

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

describe('catalog', () => {
  it('has 40 sourced services with unique domains', () => {
    expect(serviceCatalog.length).toBeGreaterThanOrEqual(40);
    const domains = serviceCatalog.flatMap((entry) => entry.domains);
    expect(new Set(domains).size).toBe(domains.length);
    for (const entry of serviceCatalog) {
      expect(categories.has(entry.category)).toBe(true);
      expect(entry.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.sources.length).toBeGreaterThan(0);
      expect(entry.sources.every((source) => source.startsWith('https://'))).toBe(true);
      expect(entry.email.steps.length).toBeGreaterThan(0);
      expect(entry.export.steps.length).toBeGreaterThan(0);
    }
    expect(catalogProblems(serviceCatalog)).toEqual([]);
    const youtube = serviceCatalog.find((entry) => entry.id === 'youtube');
    const onenote = serviceCatalog.find((entry) => entry.id === 'onenote');
    const spotify = serviceCatalog.find((entry) => entry.id === 'spotify');
    expect(youtube?.sources).toContain('https://support.google.com/accounts/answer/19870?hl=en');
    expect(onenote?.sources).toContain(onenote?.email.url);
    expect(spotify?.sources).toContain(
      'https://support.spotify.com/us/article/changing-how-you-log-into-spotify/',
    );
  });

  it('rejects a catalog entry with a non-https source', () => {
    expect(
      catalogProblems([{ id: 'x', domains: ['x.test'], sources: ['http://x.test'] }]).length,
    ).toBeGreaterThan(0);
  });
});
