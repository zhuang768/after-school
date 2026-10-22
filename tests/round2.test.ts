import { describe, expect, it } from 'vitest';
import { serviceCatalog, catalogProblems } from '../src/data/catalog';
import { classifyText, confidenceFor } from '../src/parser/classify';
import { extractAddresses } from '../src/parser/headers';
import { scanReadable } from '../src/parser/scan';
import { buildPdf } from '../src/lib/report';
import { emptyWorkspace, parseWorkspace } from '../src/lib/workspace';
import type { CatalogEntry } from '../src/types';

function mail(lines: string[]): ReadableStream<Uint8Array> {
  return new Blob([lines.join('\r\n')]).stream();
}

const catalog = serviceCatalog.map((entry) => ({
  id: entry.id,
  name: entry.name,
  domains: entry.domains,
}));

describe('round 2 addresses and mail', () => {
  it('keeps quoted display names out of the address list', () => {
    expect(extractAddresses('To: "Contact ada@school.example" <ada@personal.example>')).toEqual([
      'ada@personal.example',
    ]);
    expect(extractAddresses('From: "GitHub team@github.com" <team@unrelated.example>')).toEqual([
      'team@unrelated.example',
    ]);
  });

  it('drops a newsletter or mailing list that has no stronger account signal', () => {
    expect(classifyText('歡迎加入電子報', '', true)).toEqual(['marketing']);
    expect(classifyText('Welcome to the mailing list', 'unsubscribe', true)).toEqual(['marketing']);
    expect(classifyText('Your verification code', 'unsubscribe from this list', true)).toContain(
      'verification',
    );
  });

  it('reads a nested multipart, a spaced boundary, and a truncated base64 prefix', async () => {
    const welcome = btoa('Thanks for signing up');
    const truncated = `${welcome}A`;
    const nested = await scanReadable(
      mail([
        'From sender@example.test Mon Oct 19 00:00:00 2026',
        'From: Ada <ada@nested.example>',
        'To: student@school.example',
        'Subject: hello',
        'MIME-Version: 1.0',
        'Content-Type: multipart/mixed; boundary="outer"',
        '',
        '--outer',
        'Content-Type: multipart/alternative; boundary = "inner"',
        '',
        '--inner',
        'Content-Type: text/plain; charset="utf-8"',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        '=E6=AD=A1=E8=BF=8E=E5=8A=A0=E5=85=A5',
        '--inner--',
        '--outer--',
      ]),
      { schoolDomains: ['school.example'], saveSubjects: false },
      catalog,
    );
    expect(nested.accounts.map((account) => account.domain)).toContain('nested.example');
    const encoded = await scanReadable(
      mail([
        'From sender@example.test Mon Oct 19 00:00:00 2026',
        'From: Ada <ada@encoded.example>',
        'To: student@school.example',
        'Subject: notes',
        'Content-Transfer-Encoding: base64',
        'Content-Type: text/plain; charset="utf-8"',
        '',
        truncated,
      ]),
      { schoolDomains: ['school.example'], saveSubjects: false },
      catalog,
    );
    expect(encoded.accounts.map((account) => account.domain)).toContain('encoded.example');
  });

  it('recomputes high confidence from two strong signals without a school match', () => {
    expect(confidenceFor({ welcome: 1, verification: 1 }, false)).toBe('High');
    expect(confidenceFor({ welcome: 1 }, false)).toBe('Low');
    expect(confidenceFor({ receipt: 1 }, true)).toBe('Medium');
  });
});

describe('round 2 backup and catalog', () => {
  it('round-trips a scanner-sized count', () => {
    const workspace = emptyWorkspace();
    workspace.accounts = [
      {
        id: 'scan:large.example',
        name: 'Large',
        domain: 'large.example',
        confidence: 'Low',
        ownership: 'unsure',
        count: 1_655_647,
        firstSeen: '2020-01-01',
        lastSeen: '2026-10-19',
        signals: { welcome: 1_655_647 },
        evidence: [],
        source: 'scan',
      },
    ];
    const parsed = parseWorkspace(JSON.stringify(workspace));
    expect(parsed.accounts[0]?.count).toBe(1_655_647);
    expect(parsed.accounts[0]?.signals.welcome).toBe(1_655_647);
  });

  it('rejects one illegal field at a time and still accepts Google', () => {
    const google = (): CatalogEntry => structuredClone(serviceCatalog[0]!);
    expect(catalogProblems([google()])).toEqual([]);
    const cases: Array<(entry: CatalogEntry) => void> = [
      (entry) => {
        entry.name = '';
      },
      (entry) => {
        entry.category = 'Unknown' as CatalogEntry['category'];
      },
      (entry) => {
        entry.verifiedAt = '';
      },
      (entry) => {
        entry.verifiedAt = '2026-02-31';
      },
      (entry) => {
        entry.education.available = 'potato' as 'yes';
      },
      (entry) => {
        entry.export.status = 'verified';
        entry.export.url = undefined;
      },
      (entry) => {
        entry.email.status = 'restricted';
        entry.email.url = undefined;
      },
      (entry) => {
        entry.email.steps = [1 as unknown as string];
      },
      (entry) => {
        entry.sources = [];
      },
      (entry) => {
        entry.id = '';
      },
      (entry) => {
        entry.domains = ['com'];
      },
      (entry) => {
        entry.email.url = 'https://';
      },
    ];
    for (const mutate of cases) {
      const entry = google();
      mutate(entry);
      expect(catalogProblems([entry]).length).toBeGreaterThan(0);
    }
    expect(catalogProblems([{ ...google(), sources: [42] as unknown as string[] }])).toContain(
      'sources',
    );
    expect(catalogProblems([{ ...google(), domains: {} as unknown as string[] }])).toContain(
      'domains',
    );
    expect(serviceCatalog.find((entry) => entry.id === 'zotero')?.education.available).toBe(
      'unverified',
    );
  });

  it('keeps a run of W glyphs inside the page', () => {
    const bytes = buildPdf(`Note\n${'W'.repeat(200)}`);
    const text = new TextDecoder().decode(bytes);
    const lines = [...text.matchAll(/\(([^)]*)\) Tj/g)].map((match) => match[1] ?? '');
    const glyphs = lines.join('');
    expect(glyphs).toContain('W'.repeat(200));
    for (const line of lines) {
      const width = [...line].reduce((sum, char) => sum + (char === 'W' ? 10.384 : 7), 0);
      expect(50 + width).toBeLessThan(612);
    }
  });
});
