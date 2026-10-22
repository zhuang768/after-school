# Public source publication

Date: 2026-10-22 (Asia/Taipei).

Repository: https://github.com/zhuang768/after-school

The project owner explicitly authorized a public GitHub repository, then separately authorized public deployment to Cloudflare on 2026-10-22. Neither approval marks the remaining acceptance tests as passed.

## Privacy of the public snapshot

- Public source starts from the verified application contents at local revision `53253a5`, plus the latest acceptance documents and publication notes.
- Application code, dependencies, formal tests and service data were not changed for publication.
- The public branch is `codex/public-release`, pushed as GitHub `main`. Its initial commit has no parents and uses `188769719+zhuang768@users.noreply.github.com`.
- Earlier commits remain on local `feat/local-migration-workspace`; their author identities are not part of the public branch. No existing local history was rewritten or deleted.
- Personal home-directory prefixes in two historical handoff documents were replaced by `<HOME>`; local originals remain in ignored output.
- `.env`, dependencies, build artifacts, browser storage, mail fixtures and raw acceptance output are excluded. Only source files and documentation are published.

## Verification scope

The latest acceptance status is 10 of 13 P0 areas verified. Publishing does not resolve the three remaining areas. Local large-file measurements retain their actual dates and sampling limits; they were not repeated for publication. The public workflow runs formatting, lint, type checks, unit tests, build and the Chromium browser suite.

## Future changes

Continue public development from `codex/public-release`. Push that branch to GitHub `main`; do not push the private local history or use `git push --all`. The project-specific remote push mapping selects only the public branch.

GitHub Actions results and the canonical commit are visible on the repository. The hosted application is [after-school.ziz81503.workers.dev](https://after-school.ziz81503.workers.dev/). See [deployment instructions](./DEPLOYMENT.md) for the static hosting configuration and the unresolved Cloudflare NEL reporting policy. Public deployment does not count as passing that privacy requirement.
