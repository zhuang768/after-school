import { describe, expect, it } from 'vitest';
import { zipSync } from 'fflate';
import { classifyText, confidenceFor } from '../src/parser/classify';
import { scanReadable } from '../src/parser/scan';
import { serviceCatalog } from '../src/data/catalog';

function mail(lines: string[]): ReadableStream<Uint8Array> {
  return new Blob([lines.join('\n')]).stream();
}

describe('classification', () => {
  it('covers the six signals and ignores a newsletter by itself', () => {
    expect(classifyText('Welcome to GitHub', '', false)).toContain('welcome');
    expect(classifyText('Your verification code', '', false)).toContain('verification');
    expect(classifyText('Reset your password', '', false)).toContain('password');
    expect(classifyText('Your receipt', '', false)).toContain('receipt');
    expect(classifyText('Security alert', '', false)).toContain('security');
    expect(classifyText('Weekly newsletter', '', true)).toEqual(['marketing']);
    expect(classifyText('歡迎加入', '', false)).toContain('welcome');
    expect(classifyText('驗證碼', '', false)).toContain('verification');
    expect(classifyText('重設密碼', '', false)).toContain('password');
  });

  it('does not treat markup as an instruction', () => {
    const signals = classifyText(
      'Welcome to Example',
      '<script>alert(1)</script><img src="https://evil.test/a.png">',
      false,
    );
    expect(signals).toContain('welcome');
    expect(signals.join(' ')).not.toContain('<script');
  });
});

describe('mailbox scan', () => {
  const catalog = serviceCatalog.map((entry) => ({
    id: entry.id,
    name: entry.name,
    domains: entry.domains,
  }));

  it('merges a school-address welcome into a known service and skips marketing', async () => {
    const result = await scanReadable(
      mail([
        'From sender@example.test Mon Oct 19 00:00:00 2026',
        'From: GitHub <noreply@github.com>',
        'To: ada@school.example',
        'Date: Tue, 11 Feb 2023 10:00:00 +0000',
        'Subject: Welcome to GitHub',
        '',
        'Thanks for signing up',
        'From sender@example.test Mon Oct 19 00:00:00 2026',
        'From: News <news@github.com>',
        'To: ada@school.example',
        'Date: Tue, 12 Feb 2023 10:00:00 +0000',
        'Subject: Your verification code is 123456',
        'List-Unsubscribe: <mailto:gone@github.com>',
        '',
        'code',
        'From sender@example.test Mon Oct 19 00:00:00 2026',
        'From: Ads <ads@letters.test>',
        'To: ada@school.example',
        'Subject: Weekly newsletter',
        'List-Unsubscribe: <mailto:off@letters.test>',
        '',
        'unsubscribe',
      ]),
      { schoolDomains: ['school.example'], saveSubjects: false },
      catalog,
    );
    expect(result.accounts.map((account) => account.name)).toEqual(['GitHub']);
    expect(result.accounts[0]?.confidence).toBe('High');
    expect(result.accounts[0]?.evidence[0]?.subject).toBeUndefined();
    expect(result.warnings.some((warning) => warning.includes('Newsletters'))).toBe(true);
  });

  it('reads one eml and a zip of eml files, and rejects a zip bomb', async () => {
    const eml = new TextEncoder().encode(
      [
        'From: Notion <team@notion.so>',
        'To: ada@school.example',
        'Date: Tue, 02 Apr 2024 10:00:00 +0000',
        'Subject: Welcome to Notion',
        '',
        'Hello',
      ].join('\r\n'),
    );
    const single = await scanReadable(
      new Blob([eml]).stream(),
      { schoolDomains: ['school.example'], saveSubjects: true },
      catalog,
    );
    expect(single.accounts[0]?.name).toBe('Notion');
    expect(single.accounts[0]?.evidence[0]?.subject).toContain('Welcome');
    const zipped = zipSync({ 'note.eml': eml });
    const fromZip = await scanReadable(
      new Blob([zipped]).stream(),
      { schoolDomains: ['school.example'], saveSubjects: false },
      catalog,
    );
    expect(fromZip.accounts[0]?.domain).toBe('notion.so');
    const bomb = zipSync({ 'big.eml': new Uint8Array(40 * 1024 * 1024) });
    await expect(
      scanReadable(new Blob([bomb]).stream(), { schoolDomains: [], saveSubjects: false }, catalog),
    ).rejects.toThrow(/expanded too far/);
  });

  it('keeps memory bounded while skipping a long attachment body', async () => {
    const header = [
      'From sender@example.test Mon Oct 19 00:00:00 2026',
      'From: Billing <billing@spotify.com>',
      'To: ada@home.example',
      'Subject: Your receipt from Spotify',
      '',
      '',
    ].join('\n');
    const blob = new Blob([header, 'A'.repeat(2_000_000)]);
    const before = process.memoryUsage().heapUsed;
    const result = await scanReadable(
      blob.stream(),
      { schoolDomains: [], saveSubjects: false },
      catalog,
    );
    const after = process.memoryUsage().heapUsed;
    expect(result.accounts[0]?.confidence).toBe('Low');
    expect(after - before).toBeLessThan(20_000_000);
  });
});

describe('confidence', () => {
  it('returns null for marketing only', () => {
    expect(confidenceFor({ marketing: 3 }, true)).toBeNull();
  });
});
