import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { scanReadable } from '../src/parser/scan';
import { serviceCatalog } from '../src/data/catalog';

const TARGET = 300 * 1024 * 1024;

function repeatingMbox(targetBytes: number): {
  stream: ReadableStream<Uint8Array>;
  peaks: () => { peakHeap: number; peakRss: number };
} {
  const unit = new TextEncoder().encode(
    [
      'From sender@example.test Mon Oct 19 00:00:00 2026',
      'From: Billing <billing@spotify.com>',
      'To: ada@school.example',
      'Date: Tue, 11 Feb 2023 10:00:00 +0000',
      'Subject: Your receipt from Spotify',
      '',
      'Thanks',
      '',
    ].join('\n'),
  );
  let sent = 0;
  let peakHeap = 0;
  let peakRss = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      const usage = process.memoryUsage();
      peakHeap = Math.max(peakHeap, usage.heapUsed);
      peakRss = Math.max(peakRss, usage.rss);
      if (sent >= targetBytes) {
        controller.close();
        return;
      }
      const size = Math.min(1024 * 1024, targetBytes - sent);
      const chunk = new Uint8Array(size);
      for (let offset = 0; offset < size; offset += unit.length)
        chunk.set(unit.subarray(0, Math.min(unit.length, size - offset)), offset);
      sent += size;
      controller.enqueue(chunk);
    },
  });
  return { stream, peaks: () => ({ peakHeap, peakRss }) };
}

describe('large mailbox', () => {
  it('scans 300 MB from a stream and records memory', async () => {
    const catalog = serviceCatalog.map((entry) => ({
      id: entry.id,
      name: entry.name,
      domains: entry.domains,
    }));
    const before = process.memoryUsage();
    const source = repeatingMbox(TARGET);
    const started = Date.now();
    const result = await scanReadable(
      source.stream,
      { schoolDomains: ['school.example'], saveSubjects: false },
      catalog,
    );
    const after = process.memoryUsage();
    const elapsedMs = Date.now() - started;
    const peaks = source.peaks();
    const report = {
      targetBytes: TARGET,
      bytesRead: result.bytesRead,
      messages: result.messages,
      accounts: result.accounts.map((account) => account.domain),
      elapsedMs,
      heapBefore: before.heapUsed,
      heapAfter: after.heapUsed,
      heapPeak: Math.max(peaks.peakHeap, after.heapUsed),
      rssBefore: before.rss,
      rssAfter: after.rss,
      rssPeak: Math.max(peaks.peakRss, after.rss),
      note: 'Measured in the test process by calling the parser directly. The app runs this parser in a worker.',
    };
    mkdirSync('output', { recursive: true });
    writeFileSync('output/large-scan.json', JSON.stringify(report, null, 2));
    expect(result.bytesRead).toBeGreaterThanOrEqual(TARGET);
    expect(result.accounts.map((account) => account.domain)).toEqual(['spotify.com']);
    expect(report.heapPeak).toBeLessThan(200 * 1024 * 1024);
    expect(report.rssPeak).toBeLessThan(500 * 1024 * 1024);
  }, 180_000);
});
