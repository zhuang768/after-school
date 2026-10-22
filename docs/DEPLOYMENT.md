# Cloudflare deployment

Public application: **https://after-school.ziz81503.workers.dev/**

Source repository: https://github.com/zhuang768/after-school

The owner authorized public Cloudflare deployment on 2026-10-22. The active deployment uses Workers Static Assets, configured in `wrangler.jsonc`. No custom domain was purchased. The earlier Pages hostname redirects to this application.

## Open privacy gate

Live responses on both Cloudflare-managed hostnames contain `NEL` and `Report-To` headers pointing to Cloudflare's network-error endpoint. Removal entries in `_headers` were not honored by the outer hosting edge. Normal application traffic observed during the smoke test stayed on the application origin, but that does **not** prove that browser-level NEL reports can never be sent.

The owner chose to retain the original strict privacy requirement, has no custom domain, and requested another Cloudflare attempt. Workers Static Assets was tried and measured separately; its managed hostname still adds NEL. This limitation remains unresolved and was not accepted as an exception. Do not describe the public deployment as having passed the absolute zero-external-traffic requirement.

Cloudflare documents NEL opt-out through a zone setting or Support. A customer-controlled zone has not been supplied here. See the [official NEL documentation](https://developers.cloudflare.com/network-error-logging/). No Support message was sent, domain purchased, or unrelated account setting changed.

## Static hosting

There is no application request handler, server-side mail processing, database binding, app secret, analytics script, or OAuth integration. Mail and workspace content remain browser inputs. Workers observability and preview URLs are disabled in the configuration.

The document and application assets retain the existing CSP, including `connect-src 'none'`. The service worker separately uses `connect-src 'self'` so it can cache same-origin static assets. Other headers disable framing and MIME sniffing and set `Referrer-Policy: no-referrer`.

HTML handling is `none`. The initial Pages host redirected `/index.html` to `/`; its redirected cached response caused a real service-worker navigation failure. Workers serves `/index.html` directly with HTTP 200. The tested cached index has `redirected: false`; offline reload then succeeded. Application code and the generated application JavaScript were unchanged.

## Reproduce a release

Use an authenticated Wrangler v4 CLI. Keep credentials in Wrangler's local authentication store.

```bash
npm ci --ignore-scripts
npm run check
cp deploy/cloudflare/_headers dist/_headers
WRANGLER_SEND_METRICS=false wrangler deploy --config wrangler.jsonc
```

Copy `_headers` **after** building. Cloudflare interprets the file instead of serving it as an asset; it must not enter the service-worker precache list. Pushing to GitHub alone does not redeploy the website.

The legacy Pages project `after-school` can publish the static redirect in `deploy/cloudflare/pages-redirect/`. Its old deployments remain available as historical releases, not as the supported application URL.

## Live verification

On 2026-10-22 a real automated Chromium session completed 11 explicit smoke checks: demo display, completing a task, JSON and calendar downloads, offline reload with saved progress, offline synthetic mbox parsing, offline ZIP parsing, persistence after another offline reload, 390px layout, a post-scan JSON download, and clearing user stores/caches/service-worker registration.

The application request observer recorded 21 same-origin GET requests, zero external requests, zero failed requests, and zero page errors during those checks. This observer did not measure browser-level NEL transport. NEL remains enabled in the HTTP response, so the wider privacy gate is still open.

The two-message mbox produced a new scanned GitHub row with High confidence and count 2. A subsequent ZIP containing those messages increased that scanned row to 4. The separate synthetic demo GitHub row was not merged; an earlier test assumption about its ID was corrected rather than reported as a product bug. A filechooser-event automation timeout was retried through the actual file input with `setInputFiles`; this is not a native OS chooser test.

Evidence and synthetic downloads are retained in ignored `output/cloudflare-deploy-2026-10-22/` and `output/playwright/`. No real mailbox was used. The prior local acceptance result remains historical: 10 of 13 P0 areas fully verified. Real calendar/reminder, installed physical-device offline use, screen-reader and phone checks remain outstanding. The public host adds the NEL privacy limitation above; deployment is not full acceptance.
