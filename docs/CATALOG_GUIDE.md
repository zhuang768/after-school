# Catalog guide

The service catalog is `src/data/catalog.json`. The app imports it from `src/data/catalog.ts`. User-facing sentences live in `src/strings.ts`. Do not invent a step to fill a gap.

## Fields

Each entry has a name, category, unique registrable domains, and guides for email change, export, education impact, and deletion. A guide is `verified`, `restricted`, or `unverified`.

- `verified`: the steps were read from the official page in `url`.
- `restricted`: the official page says the person cannot do this themselves, or an admin has to do it.
- `unverified`: the procedure was not confirmed. The app must say so and use the generic fallback.

`verifiedAt` is the date those pages were read. `sources` lists the pages used. Domains must not repeat across entries.

## How to change an entry

1. Open the official help page yourself.
2. Write only the steps that page supports. If a button label was not in the page text, do not guess it.
3. If the page is missing, blocked, or is about a different task, set that guide to `unverified` and say what was not confirmed.
4. Set `verifiedAt` to the day you read it.
5. Run `npm test` and `npm run catalog:links`.
6. A live `403` does not by itself make a previously read step false, and a live `200` does not add steps you did not read. Record the audit. Do not treat a blocked request as a pass.

School Drive, mail, contacts, and recovery wording is in `strings.schoolGuides`, from Google and Microsoft help pages that were read for those tasks. School policy still varies. The app asks the student to keep their own IT note.

## Formats this app parses

The parser reads `.mbox` and `.eml`, including those files inside one zip. It does not read `.pst`. Do not write that a vendor’s export is `.mbox` unless that vendor’s own page said so.
