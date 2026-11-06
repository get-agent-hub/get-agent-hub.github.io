# Website development

[Repository overview](README.md) · [Translation contributions](CONTRIBUTING.md) · [Deployment](DEPLOYMENT.md)

Requires Node.js 22.13+ and npm. Run `npm ci`, then `npm run dev` for a loopback preview at http://127.0.0.1:3084. Use `PORT=4000 npm run dev` to choose another port. The preview serves `dist/`; rebuild with `npm run build` after source edits and reload.

`npm run check` runs Prettier, ESLint, content/localization tests, link/source metadata checks, HTTP tests and the static build. Browser QA is separate: inspect the main scenario, conflicts, recovery, language switching, keyboard navigation and narrow layouts.

## Source map

- `locales/en.json` and `locales/ru.json`: English/Russian copy, metadata, accessibility labels, caller/purpose descriptions, fictional scenarios and all documentation.
- `site.config.json`: English default and both active languages. `/` and `/docs/` are English; `/ru/` and `/ru/docs/` are Russian. The switcher preserves the documentation page and section.
- `src/index.html`: semantic page structure with translation keys, not page copy.
- `src/docs.html`: documentation page layout rendered once per entry in `docs/`.
- `src/use-case.html` and `scripts/use-cases.mjs`: standalone task landing pages outside `/docs/`, with real product screenshots, concise workflows and links to detailed guides. Their copy lives under `useCases` in each locale. The route registry feeds both the landing cards and sitemap; preserve existing URLs.
- `docs/`: reviewable English Markdown snapshots. Operational reference pages mirror upstream; the overview is a standalone product guide, not a copy of the short repository README; research pages are historical English editorial notes. Run `npm run docs:sync` after refreshing snapshots.
- `locales/en.json` → `docs.content`: the documentation bodies rendered by the build. Translation PRs translate these alongside the site copy; code blocks and inline code are protected.
- `public/source.js`: reviewed core version/revision and canonical GitHub repository/Releases links.
- `public/content.js`: locale-backed command/scenario access.
- `public/app.js`: accessible controls and command copying. Content enters the DOM through textContent.
- `public/styles.css`: responsive layout, focus styles and reduced-motion support.
- `scripts/`: locale validation, escaped HTML rendering, Markdown conversion, documentation build and loopback preview.
- `tests/`: content, translation, rendering and HTTP checks. Browser QA is a separate step.

The six practical guides in `scripts/docs.mjs` each need a unique localized description, a link from the landing page and links to the relevant reference pages. Keep these task guides distinct: finding history, preserving history, carrying context, sharing MCP, sharing skills/instructions and choosing between tools. The Hansard comparison is maintainer-written, dated and linked to its official source; recheck claims before updating it. Do not add unsupported keyword variants or claim search traffic without evidence.

See [CONTRIBUTING.md](CONTRIBUTING.md) for translation PRs. Adding a language does not require component changes. Missing or extra keys, blank required translations and changed CLI syntax fail the build. Each route bundles its own locale; there are no automatic browser-language changes or silent translation fallbacks.

## Keeping the guide accurate

End-user examples use the globally installed `ahub` executable after `npm run install:global` from the source directory. No public registry installation is advertised. The primary first-run route is **shared Hub setup and optional project connection**, documented in `docs/QUICKSTART.md` and linked from the documentation sidebar. Landing quick start, the command explorer and a fictional first-run scenario describe the same staged workflow. Individual area commands remain available.

Current Agent Hub source: `3786d65bfc475eb615de5894a363bacb3871510a`. Check the CLI, README and docs/MEMORY.md, docs/AUTOMATION.md, docs/WORKING_GUIDE.md and docs/RECOVERY.md in the main repository before changing claims. Each command needs its reads, side effects, output and limitations.

When updating the guide, refresh the English operational snapshots and both locale bodies from the reviewed core commit. Update the version/revision in `public/source.js`, the locale release/footer copy and this guide. Source code, installable packages and checksums are downloaded from GitHub; the website does not bundle a ZIP. Never include a user's Hub, .env, recovery files, logs, .tmp or private hosting bindings in public source. Use generic paths and fictional server names in examples.

Key boundaries: import previews by default and requires exact reviewed application; doctor starts real MCP; plain sync delivers MCP; explicit areas deliver skills and shared context; init-repo preserves existing notes; reset returns to the first recorded state, not an unknown past. Memory discovery/onboarding supports Markdown sources and inline MEMORY.md knowledge; native SQLite is reported but unsupported. Memory automation needs an enabled project policy and lifecycle hooks or a foreground watcher for file imports. No public npm registry installation is advertised. Canonical source and release links point to GitHub; publication is maintainer-managed. All interactive terminal results are fictional.

The site has default-on basic PostHog analytics through the first-party metrics relay, with a localized footer off switch and no banner. Browser DNT/GPC and unavailable storage suppress collection. No cookies, accounts, session replay, full referrer URLs or query strings are collected. Local previews never send events; browser QA must use an intercepted/fake collector. With JavaScript disabled, the main guide remains readable; demo and command switching require JavaScript. The repository and release downloads on GitHub include the Agent Hub CLI README.

## Tooling advisories

The initial npm audit reported five moderate entries in the ESLint → minimatch development-tool chain (GHSA-g3hv-75wg-m249). These tools are excluded from the static deployment. No incompatible downgrade or unexplained override was applied; recheck compatible upstream updates before a release.

The header GitHub mark links to the source repository; download links go to GitHub Releases. The local Octicons SVG and its MIT license are included in public assets. Release archives/checksums are built by the core repository's release workflow, not by the website.
