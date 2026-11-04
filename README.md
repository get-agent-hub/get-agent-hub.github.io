# Agent Hub · Field Guide

An English/Russian landing page and interactive guide for new and experienced Agent Hub users. This is a separate static repository with no runtime dependencies or backend. The demo never executes commands or reads a visitor's local files.

## Development

Requires Node.js ≥22.13 and npm.

```sh
npm ci
npm run dev
```

Preview: http://127.0.0.1:3084. Choose another port with `PORT=4000 npm run dev`. The preview serves `dist/`; run `npm run build` after editing source files, then reload the page.

```sh
npm run check
```

Runs Prettier, ESLint, content and localization tests, static link and GitHub source metadata checks, HTTP preview tests and the static build. Serve `dist/` on any static host. Local `.openai/` preview bindings are ignored and are not part of the public source. GitHub Actions validates the site and scans full Git history with pinned Gitleaks when a GitHub remote is connected.

## Source map

- `locales/en.json` and `locales/ru.json`: English/Russian copy, metadata, accessibility labels, caller/purpose descriptions, fictional scenarios and all documentation.
- `site.config.json`: English default and both active languages. `/` and `/docs/` are English; `/ru/` and `/ru/docs/` are Russian. The switcher preserves the documentation page and section.
- `src/index.html`: semantic page structure with translation keys, not page copy.
- `src/docs.html`: documentation page layout rendered once per entry in `docs/`.
- `docs/`: reviewable English Markdown snapshots. Operational pages mirror upstream; research pages are historical English editorial notes. Run `npm run docs:sync` after refreshing snapshots.
- `locales/en.json` → `docs.content`: the documentation bodies rendered by the build. Translation PRs translate these alongside the site copy; code blocks and inline code are protected.
- `public/source.js`: reviewed core version/revision and canonical GitHub repository/Releases links.
- `public/content.js`: locale-backed command/scenario access.
- `public/app.js`: accessible controls and command copying. Content enters the DOM through textContent.
- `public/styles.css`: responsive layout, focus styles and reduced-motion support.
- `scripts/`: locale validation, escaped HTML rendering, Markdown conversion, documentation build and loopback preview.
- `tests/`: content, translation, rendering and HTTP checks. Browser QA is a separate step.

See [CONTRIBUTING.md](CONTRIBUTING.md) for translation PRs. Adding a language does not require component changes. Missing or extra keys, blank required translations and changed CLI syntax fail the build. Each route bundles its own locale; there are no automatic browser-language changes or silent translation fallbacks.

## Keeping the guide accurate

End-user examples use the globally installed `ahub` executable after `npm run install:global` from the source directory. No public registry installation is advertised. The primary first-run route is **shared Hub setup and optional project connection**, documented in `docs/QUICKSTART.md` and linked from the documentation sidebar. Landing quick start, the command explorer and a fictional first-run scenario describe the same staged workflow. Individual area commands remain available.

Current Agent Hub source: `d49b29d07ae16bf55ed879c94cba0e8dd39d20fe`. Check the CLI, README and docs/MEMORY.md, docs/AUTOMATION.md, docs/WORKING_GUIDE.md and docs/RECOVERY.md in the main repository before changing claims. Each command needs its reads, side effects, output and limitations.

When updating the guide, refresh the English operational snapshots and both locale bodies from the reviewed core commit. Update the version/revision in `public/source.js`, the locale release/footer copy and this README. Source code, installable packages and checksums are downloaded from GitHub; the website does not bundle a ZIP. Never include a user's Hub, .env, recovery files, logs, .tmp or private hosting bindings in public source. Use generic paths and fictional server names in examples.

Key boundaries: import previews by default and requires exact reviewed application; doctor starts real MCP; plain sync delivers MCP; explicit areas deliver skills and shared context; init-repo preserves existing notes; reset returns to the first recorded state, not an unknown past. Memory discovery/onboarding supports Markdown sources and inline MEMORY.md knowledge; native SQLite is reported but unsupported. Memory automation needs an enabled project policy and lifecycle hooks or a foreground watcher for file imports. No public npm registry installation is advertised. Canonical source and release links point to GitHub; publication is maintainer-managed. All interactive terminal results are fictional.

The site uses no analytics, cookies, accounts, remote APIs or external fonts. With JavaScript disabled, the main guide remains readable; demo and command switching require JavaScript. The repository and release downloads on GitHub include the Agent Hub CLI README.

## Latest local verification

The guide documents shared Hub setup, optional project connection, evidence-based readiness, exact item directions, disconnection and per-workflow undo. The documentation renders 17 pages in each of English and Russian from locale-owned Markdown bodies. Automated site checks cover translation shape/code safeguards, source metadata consistency, static assets, navigation, cross-page anchors and HTTP behavior. The sanitized core candidate passed its 205-test quality gate on Node 22.13.0. Package and actual installer checks use isolated profiles; the release verification report records the final candidate results. A fresh visual browser pass and the maintainer's real-client usefulness trial remain manual checks. No hosting synchronization or deployment was performed.

## Tooling audit

The initial npm audit reported five moderate entries in one ESLint → minimatch chain (GHSA-g3hv-75wg-m249). These are development tools and are excluded from the static deployment. npm's suggested downgrade to ESLint 4 is incompatible with this configuration; no forced downgrade or dependency override was applied. Recheck compatible upstream updates separately.

## Deployment

Deployment is maintainer-managed and deferred. Build with `npm run build` and serve `dist/` on the hosting platform chosen by the maintainers. Do not deploy to GPT/Sites, push to its hosting repository or publish elsewhere without an explicit user request.

Any local `.openai/hosting.json` belongs to a previous private preview and stays outside the public source; it does not authorize publication. CI validates the repository only and has no deployment job. Never store hosting credentials in this repository.

License: MIT. The Agent Hub source download includes its own MIT license.
