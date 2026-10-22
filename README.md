# After School

Use the app: **[after-school-ug9.pages.dev](https://after-school-ug9.pages.dev/)**.

After School is a local web app for students who are about to lose a school email address. It helps you list accounts that likely used that address, change the login email, export files, and plan the work before access ends. It does not transfer ownership of an account, and it does not promise that a school can restore data.

Your mailbox export, notes, and progress stay in this browser. The app has no account, no analytics, and no server.

## What you can do

- Try **Try the demo** with synthetic examples. That is not your mail.
- Import `.mbox`, `.eml`, or a `.zip` of those files. Scanning runs in a worker on this device.
- Pick services from the catalog, or add a name and an `https` URL.
- Save one or more school domains so mail to those addresses can be recognized, including mail forwarded to a personal inbox.
- Mark each row **Mine**, **Not mine**, or **Not sure**.
- Follow per-service steps, or a generic fallback and an English support message when the service is unknown or the procedure was not confirmed.
- Track school Drive, mail, and contacts tasks.
- See Today, a timeline, and an already-expired path when the school date is in the past.
- Download an `.ics` calendar, a text report, or a simple PDF. Print from the browser if you want.
- Export or import the workspace JSON. Optional encryption uses a password that stays in memory for the session. Forgetting it means the only recovery is **Delete all my data**.
- Install the page and use the demo flow offline after the app copy is cached.

## Privacy check you can do yourself

The production page sends `Content-Security-Policy` with `connect-src 'none'`. Official help links open only when you choose them. See [PRIVACY.md](PRIVACY.md).

## Build and test

```bash
npm ci --ignore-scripts
npm run check
npm run test:e2e
npm run catalog:links
npx vitest run --config vitest.large.config.ts
```

`npm ci` uses `--ignore-scripts` so install does not change git config. Hooks live in `.githooks`; enabling them is your choice.

`catalog:links` calls the official URLs from this machine. A `403` means the site blocked the script, not that the step was invented. The result is written to `output/link-audit.json`.

The large-file measurement is not part of `npm test`. It writes `output/large-scan.json`.

## License

MIT. Service names belong to their owners. Steps are summaries of public help pages and can go out of date.

Runtime packages, read from the installed `package.json` license field: React and React DOM (interface, MIT), tldts (registrable domains, MIT), fflate (ZIP inflate, MIT). `idb` (ISC) and `lucide-react` (ISC) are installed and unused by the interface. Dev tools: Vite (MIT), TypeScript (Apache-2.0), Vitest (MIT), ESLint (MIT), Prettier (MIT), Playwright (Apache-2.0), axe-core Playwright (MPL-2.0).

## Release status

Source repository: [zhuang768/after-school](https://github.com/zhuang768/after-school).

This is a release candidate with **10 of 13 P0 acceptance areas fully verified**. Real Google/Apple/Outlook calendar import and reminder delivery, the complete installed offline mailbox flow, screen-reader use, and physical mobile-device checks still need verification. See [current acceptance status](docs/FINAL_ACCEPTANCE_STATUS.md) and [manual verification steps](docs/USER_VERIFICATION_CHECKLIST.md).

The public website is hosted as static assets on Cloudflare Pages. See [deployment instructions](docs/DEPLOYMENT.md). Publication does not mark the remaining acceptance tests as passed. Only synthetic mail was used during development. Raw local acceptance artifacts remain in ignored `output/` and are not included in this repository.

The public branch starts with a clean source snapshot and a GitHub noreply author address. Earlier local Git history and personal home-directory paths were not published. See [publication notes](docs/PUBLICATION.md).
