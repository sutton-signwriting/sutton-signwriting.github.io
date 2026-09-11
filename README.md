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

## Developer tools catalog

`/developers/` groups tools under JavaScript, PHP, Python, and external processing
and research. `site/developer-tools.json` owns the catalog and community extension
proposal. Its npm entries resolve versions from `site/packages.json`; Python and PHP
entries retain explicitly checked registry versions. `site/developers.mjs` renders
the page, and the build emits the same resolved records at `/tools.json`.

`/packages/`, `/tools/`, and `/machine-learning/` are static redirects to this page
or its environment sections. They are absent from primary navigation and sitemap.
Cloud-maker, hello-world, and portable are removed from the development catalog.

The ssw-ext feature links to the author's demo and font-ttf issue 13, including the
maintainer response favoring standalone development. Possible core/font-ttf/font-db
review scopes are proposals and do not claim accepted or released integration.

The Back Office overview links to `iswa.signwriting.org`. GitHub Pages deployment
and valid HTTPS have been verified at GitHub. Some DNS caches still reach the old
host; the development overview records that propagation window.

The `/spec/` compatibility doorway now introduces the Formal SignWriting Zenodo
archive, immutable GitHub source, living edition, and Front Office publication
library. Practical FSW/SWU guidance remains under `/characters/`.
