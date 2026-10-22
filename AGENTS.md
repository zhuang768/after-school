# After School project instructions

Use npm, TypeScript strict mode, React and Vite. All user-facing copy belongs in src/strings.ts; catalog guidance is versioned English content in src/data/catalog.json. Never render mail HTML or fetch user-supplied URLs. Runtime network traffic must remain same-origin static assets only; CSP connect-src is none in production.

Directories: src/parser for bounded streaming worker parsing; src/lib for pure domain logic and persistence; src/data for verified catalog; tests for unit and browser acceptance tests; scripts for fixtures, link audit and service worker generation. Keep generated synthetic mail and performance artifacts in ignored output/.

Validation: npm run check; npm run test:e2e against the production build. npm run catalog:links is the explicit network maintenance audit. Do not bypass failed checks. Use the browser E2E suite to verify no external requests, offline, persistence, import/export and accessibility.

No push, publication or deployment without explicit user approval. Never use actual personal email as a development fixture. Document unverified policies explicitly.
