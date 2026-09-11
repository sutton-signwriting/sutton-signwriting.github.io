# Sutton SignWriting technology website

Source repository for `www.sutton-signwriting.io` (the apex redirects here).
The redesign is a development review, not a production deployment.

Run `npm run build` to generate `dist/technology/` and `dist/back-office/`, then
`npm run check`. There are no runtime package dependencies. Authoritative content
is in `site/`; generators and validation are in `scripts/`.

The historical root HTML/CSS and auxiliary pages are generated MkDocs 1.4.2 output
preserved from the existing site. Do not hand-edit that output. Its upstream source
pipeline has not been recovered. The redesign introduces a documented source tree.
The existing production publishing configuration remains untouched for review.

`site/status.json` is a dated, manually reviewed snapshot, not a live health monitor.
`site/packages.json` records npm release evidence and pinned versions. Updating it is
an explicit editorial operation: verify registry metadata, review the result, build,
and test the affected links. The build does not silently upgrade packages.

`site/publications.json` is generated from the canonical publication exporter in
`steveslevinski-me/scripts/publishing/export-office-publications.mjs`. It contains
archival metadata and immutable sources, not a second editable publication corpus.

Back Office is a separate static output and planned hostname. It is a public-safe
coordination-door proposal, with no operator access or private development content.
Local runtime mapping is documented in the owning platform's design review record.

Before production: Steve reviews content, translations, contacts, exact Git commits,
deployment behavior, preservation of existing package-documentation paths, and the
rollback plan. The baseline tag is `baseline-2026-09-11`.
