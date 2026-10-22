import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(`/${relative('dist', path).split('\\').join('/')}`);
  }
  return acc;
}

const assets = walk('dist').filter((path) => path !== '/sw.js');
const cache = `after-school-${Date.now()}`;
const source = `const CACHE = ${JSON.stringify(cache)};
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const cached = await cache.match(path, { ignoreSearch: true });
    if (cached) return cached;
    if (event.request.mode === 'navigate') {
      const index = await cache.match('/index.html');
      if (index) return index;
    }
    return fetch(event.request);
  })());
});
`;
writeFileSync('dist/sw.js', source);
