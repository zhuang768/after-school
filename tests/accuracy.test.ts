import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { scanReadable } from '../src/parser/scan';
import { serviceCatalog } from '../src/data/catalog';

const catalog = serviceCatalog.map((entry) => ({
  id: entry.id,
  name: entry.name,
  domains: entry.domains,
}));

function message(headers: string[], body: string): string {
  return ['From sender@example.test Mon Oct 19 00:00:00 2026', ...headers, '', body, ''].join('\n');
}

describe('accuracy on a synthetic labeled mailbox', () => {
  it('records precision and recall for account detection', async () => {
    const expected = new Set([
      'github.com',
      'notion.so',
      'spotify.com',
      'dropbox.com',
      'figma.com',
      'canva.com',
    ]);
    const junkHeaders = Array.from(
      { length: 90 },
      (_item, index) => `X-Padding-${index}: ${'x'.repeat(40)}`,
    );
    const mailbox = [
      message(
        [
          'From: GitHub <noreply@github.com>',
          'To: ada@school.example',
          'Date: Tue, 11 Feb 2023 10:00:00 +0000',
          'Subject: Welcome to GitHub',
        ],
        'Thanks for signing up',
      ),
      message(
        [
          'From: GitHub <noreply@github.com>',
          'To: ada@school.example',
          'Date: Tue, 12 Feb 2023 10:00:00 +0000',
          'Subject: Your verification code',
        ],
        '123456',
      ),
      message(
        [
          'From: Notion <team@notion.so>',
          'To: ada@school.example',
          'Date: Tue, 02 Apr 2024 10:00:00 +0000',
          'Subject: Welcome to Notion',
        ],
        'Hello',
      ),
      message(
        [
          'From: Spotify <no-reply@spotify.com>',
          'To: ada@school.example',
          'Date: Tue, 12 Jan 2025 10:00:00 +0000',
          'Subject: Your receipt from Spotify',
        ],
        'Thanks',
      ),
      message(
        [
          'From: Dropbox <no-reply@dropbox.com>',
          'To: ada@school.example',
          'Date: Tue, 01 Oct 2022 10:00:00 +0000',
          'Subject: Welcome to Dropbox',
        ],
        '<script>alert(1)</script><img src="https://evil.example/pixel.png">Welcome',
      ),
      message(
        [
          'From: Figma <team@figma.com>',
          'To: ada@school.example',
          'Subject: Welcome to Figma',
          ...junkHeaders,
        ],
        'Hello',
      ),
      message(
        ['From: Canva <welcome@canva.com>', 'To: ada@school.example', 'Subject: 歡迎加入 Canva'],
        '帳號已建立',
      ),
      message(
        ['From: Shop <billing@personal.example>', 'To: ada@home.example', 'Subject: Your receipt'],
        'Thanks',
      ),
      message(
        [
          'From: Ads <ads@letters.test>',
          'To: ada@school.example',
          'Subject: Weekly newsletter',
          'List-Unsubscribe: <mailto:off@letters.test>',
        ],
        'unsubscribe',
      ),
      'this line is not a message \u0000\u0001\n',
    ].join('');
    const result = await scanReadable(
      new Blob([mailbox]).stream(),
      { schoolDomains: ['school.example'], saveSubjects: false },
      catalog,
    );
    const predicted = new Set(result.accounts.map((account) => account.domain));
    const truePositive = [...predicted].filter((domain) => expected.has(domain));
    const falsePositive = [...predicted].filter((domain) => !expected.has(domain));
    const falseNegative = [...expected].filter((domain) => !predicted.has(domain));
    const precision = truePositive.length / (truePositive.length + falsePositive.length);
    const recall = truePositive.length / (truePositive.length + falseNegative.length);
    const report = {
      method:
        'One synthetic mbox. A labeled service is a true positive when its registrable domain is listed. Newsletters and corrupt lines are expected to add no account.',
      messages: result.messages,
      expected: [...expected],
      predicted: [...predicted],
      truePositive,
      falsePositive,
      falseNegative,
      precision,
      recall,
    };
    mkdirSync('output', { recursive: true });
    writeFileSync('output/accuracy.json', JSON.stringify(report, null, 2));
    expect(JSON.stringify(result)).not.toContain('<script');
    expect(falsePositive).toEqual([]);
    expect(falseNegative).toEqual([]);
    expect(precision).toBe(1);
    expect(recall).toBe(1);
  });
});
