import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('demo flow stays on this origin and can be cleared', async ({ page }) => {
  const external: string[] = [];
  const consoleProblems: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') external.push(request.url());
  });
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text());
  });
  page.on('pageerror', (error) => consoleProblems.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Keep the accounts/ })).toBeVisible();
  await page.getByRole('button', { name: 'Try the demo' }).click();
  await expect(page.getByText('Demo data uses synthetic examples')).toBeVisible();
  await page.getByRole('link', { name: 'Accounts' }).click();
  await page.getByRole('link', { name: 'GitHub', exact: true }).click();
  await page.getByRole('button', { name: 'Mine', exact: true }).click();
  await page.getByRole('link', { name: 'Today' }).click();
  await page.getByRole('link', { name: 'Change login email: GitHub' }).click();
  await page.getByRole('button', { name: 'Mark done' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Download calendar' }).click();
  expect(external).toEqual([]);
  expect(consoleProblems).toEqual([]);
  const violations = await new AxeBuilder({ page }).analyze();
  expect(violations.violations).toEqual([]);
  await page.evaluate(async () => {
    localStorage.setItem('after-school-test', '1');
    sessionStorage.setItem('after-school-test', '1');
    const cache = await caches.open('after-school-test');
    await cache.put('/test-cache', new Response('cached'));
  });
  await page.getByRole('button', { name: 'Delete all my data' }).click();
  await page
    .getByRole('button', {
      name: 'Delete the notes, mailbox results, and files After School stored on this device? A wipe marker with no personal text stays so another open tab cannot restore the deleted copy.',
    })
    .click();
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const databases = indexedDB.databases ? await indexedDB.databases() : [];
        const names = databases.map((database) => database.name);
        const cacheNames = await caches.keys();
        return {
          local: localStorage.getItem('after-school-test'),
          session: sessionStorage.getItem('after-school-test'),
          databases: names.filter((name) => name === 'after-school'),
          caches: cacheNames,
          registrations: (await navigator.serviceWorker.getRegistrations()).length,
        };
      }),
    )
    .toEqual({ local: null, session: null, databases: [], caches: [], registrations: 0 });
});

test('offline reload serves the installed page', async ({ page, context }) => {
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null), {
      timeout: 15000,
    })
    .toBe(true);
  await context.setOffline(true);
  const response = await page.reload();
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: /Keep the accounts/ })).toBeVisible();
});
test('production page has no external connections in CSP', async ({ page }) => {
  const response = await page.goto('/');
  const html = await response?.text();
  expect(html).toContain("connect-src 'none'");
});
