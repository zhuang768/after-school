# Cloudflare deployment

Public application: **https://after-school-ug9.pages.dev/**

Source repository: https://github.com/zhuang768/after-school

The project owner authorized public Cloudflare deployment on 2026-10-22. The Cloudflare Pages project is `after-school`, with production branch `main`. Cloudflare allocated the hostname above. No custom domain was purchased or configured.

## Hosting scope

This is a static Pages deployment. There are no Pages Functions, server-side mail processing, application secrets, database bindings, analytics scripts, or OAuth integration. Mail and workspace content are processed in the browser. Hosting necessarily serves the public HTML, scripts, styles, icon, manifest and service worker over HTTPS.

The app's existing CSP remains unchanged. The deployment additionally sends it as an HTTP header, including `connect-src 'none'` and `frame-ancestors 'none'`. The header configuration also disables framing and MIME sniffing, uses a no-referrer policy, and requests revalidation of the page and service worker.

## Build and publish

Use an authenticated Wrangler v4 CLI. Credentials belong in Wrangler's local authentication store; do not commit them or put them in commands.

```bash
npm ci --ignore-scripts
npm run check
cp deploy/cloudflare/_headers dist/_headers
WRANGLER_SEND_METRICS=false wrangler pages deploy dist --project-name after-school --branch main
```

Copy `_headers` **after** the build. Cloudflare interprets that file instead of serving it as an asset, so it must not enter the generated service-worker precache list. Do not move it into `public/` without updating and verifying the precache generation.

This project uses Direct Upload. Pushing to GitHub alone does not redeploy the website. Future releases must run the checks, build and upload command above. A change to Cloudflare's native Git integration would require a separate project; see the [official Direct Upload guide](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Verification and limits

The initial source publication's [GitHub check](https://github.com/zhuang768/after-school/actions/runs/39766241066) passed formatting, lint, type checks, unit tests, build and Chromium E2E. The Cloudflare deployment build also completed locally. Application code, dependencies, catalog data and formal tests were unchanged by the hosting configuration.

After publishing, inspect the live response headers, service-worker caching, demo flow, synthetic mailbox import, local persistence/export/deletion and runtime requests. Keep the dated live measurements in ignored `output/cloudflare-deploy-2026-10-22/`. An automated browser offline check does not substitute for a real installed PWA on a disconnected physical device.

The product remains a release candidate with **10 of 13 P0 areas fully verified**. Real calendar imports and reminder delivery, the complete installed offline mailbox flow, screen-reader use and physical mobile-device checks retain their documented limits. See [acceptance status](./FINAL_ACCEPTANCE_STATUS.md) and [manual steps](./USER_VERIFICATION_CHECKLIST.md).
