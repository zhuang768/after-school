import { describe, expect, it } from 'vitest';
import { classifyText } from '../src/parser/classify';
import { domainOfAddress, extractAddresses } from '../src/parser/headers';
import { scanReadable } from '../src/parser/scan';
import { buildPdf } from '../src/lib/report';
import { parseWorkspace } from '../src/lib/workspace';

function mail(lines: string[]): ReadableStream<Uint8Array> {
  return new Blob([lines.join('\r\n')]).stream();
}

const catalog = [{ id: 'school', name: 'School', domains: ['school.example'] }];

describe('round 3 parser and backup bounds', () => {
  it('ignores an encoded-word display name and keeps a quoted local-part', () => {
    expect(
      extractAddresses('From: =?utf-8?q?=3Cteam=40github=2Ecom=3E?= <team@unrelated.example>'),
    ).toEqual(['team@unrelated.example']);
    expect(extractAddresses('To: "ada@alias"@school.example')).toEqual([
      '"ada@alias"@school.example',
    ]);
    expect(extractAddresses('To: <"ada@alias"@school.example>')).toEqual([
      '"ada@alias"@school.example',
    ]);
    expect(domainOfAddress('"ada@alias"@school.example')).toBe('school.example');
  });

  it('finds a school address when the local-part is quoted and contains @', async () => {
    const result = await scanReadable(
      mail([
        'From: Office <office@school.example>',
        'To: "ada@alias"@school.example',
        'Subject: notes',
        'Date: Mon, 19 Oct 2026 00:00:00 +0000',
        '',
        'Please verify your email',
      ]),
      { schoolDomains: ['school.example'], saveSubjects: false },
      catalog,
    );
    expect(result.accounts.length).toBeGreaterThan(0);
  });

  it('unfolds an inner content-type and keeps a quoted-printable hard break', async () => {
    const folded = await scanReadable(
      mail([
        'From: Office <office@folded.example>',
        'To: ada@school.example',
        'Subject: notes',
        'MIME-Version: 1.0',
        'Content-Type: multipart/mixed; boundary="outer"',
        '',
        '--outer',
        'Content-Type: multipart/alternative;',
        ' boundary="inner"',
        '',
        '--inner',
        'Content-Type: text/plain; charset="utf-8"',
        '',
        'Please verify your email',
        '--inner--',
        '--outer--',
      ]),
      { schoolDomains: ['school.example'], saveSubjects: false },
      catalog,
    );
    expect(folded.accounts.map((account) => account.domain)).toContain('folded.example');
    const hard = await scanReadable(
      mail([
        'From: Office <office@hard.example>',
        'To: ada@school.example',
        'Subject: notes',
        'Content-Transfer-Encoding: quoted-printable',
        'Content-Type: text/plain; charset="utf-8"',
        '',
        'Please verify your',
        'email',
      ]),
      { schoolDomains: ['school.example'], saveSubjects: false },
      catalog,
    );
    expect(hard.accounts.map((account) => account.domain)).toContain('hard.example');
    expect(classifyText('Please verify your', 'email', false)).toContain('verification');
  });

  it('wraps every supported ASCII glyph inside the text measure', () => {
    const ascii = Array.from({ length: 95 }, (_, index) => String.fromCharCode(32 + index)).join(
      '',
    );
    const pdf = new TextDecoder().decode(buildPdf(`${'@'.repeat(200)}\n${'%'.repeat(200)}`));
    const atLines = [...pdf.matchAll(/\((@+)\) Tj/g)].map((match) => match[1]?.length ?? 0);
    const percentLines = [...pdf.matchAll(/\((%+)\) Tj/g)].map((match) => match[1]?.length ?? 0);
    expect(atLines.reduce((sum, length) => sum + length, 0)).toBe(200);
    expect(Math.max(...atLines)).toBeLessThanOrEqual(44);
    expect(percentLines.reduce((sum, length) => sum + length, 0)).toBe(200);
    expect(Math.max(...percentLines)).toBeLessThanOrEqual(51);
    expect(buildPdf(ascii).byteLength).toBeGreaterThan(100);
  });

  it('imports a backup the scanner and the notes field can produce', () => {
    const accounts = Array.from({ length: 5001 }, (_, index) => ({
      id: `a${index}`,
      name: 'N',
      domain: 'example.test',
      confidence: 'Low',
      ownership: 'unsure',
      count: 1,
      firstSeen: '2026-01-01',
      lastSeen: '2026-01-01',
      signals: {},
      evidence: [],
      source: 'manual',
    }));
    const notes = 'n'.repeat(4001);
    const raw = JSON.stringify({
      version: 1,
      accounts,
      tasks: [
        {
          id: 't1',
          title: 'T',
          type: 'email',
          status: 'not-started',
          notes,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      preferences: {},
    });
    const workspace = parseWorkspace(raw);
    expect(workspace.accounts).toHaveLength(5001);
    expect(workspace.tasks[0]?.notes).toBe(notes);
  });
});
