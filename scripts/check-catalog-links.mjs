import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const catalog = JSON.parse(
  readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8'),
);
const strings = readFileSync(new URL('../src/strings.ts', import.meta.url), 'utf8');
const urls = [
  ...new Set([
    ...catalog.flatMap((entry) =>
      [
        ...entry.sources,
        entry.email.url,
        entry.export.url,
        entry.deletion.url,
        entry.education.url,
      ].filter(Boolean),
    ),
    ...[...strings.matchAll(/https:\/\/[^'"\s)]+/g)].map((match) => match[0]),
  ]),
];
const results = [];
for (const url of urls) {
  const started = Date.now();
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    results.push({ url, status: response.status, ms: Date.now() - started, final: response.url });
  } catch (error) {
    results.push({
      url,
      status: 0,
      ms: Date.now() - started,
      error: error instanceof Error ? error.name : 'error',
    });
  }
}
mkdirSync('output', { recursive: true });
writeFileSync(
  'output/link-audit.json',
  JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2),
);
const failed = results.filter((item) => item.status < 200 || item.status >= 400);
console.log(`checked ${results.length}; failed ${failed.length}`);
for (const item of failed) console.log(item.status, item.url, item.error ?? '');
if (failed.length) process.exitCode = 1;
