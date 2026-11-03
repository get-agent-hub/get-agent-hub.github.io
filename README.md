# Agent Hub · Field Guide

An English landing page and interactive guide for new and experienced Agent Hub users. This is a separate static repository with no runtime dependencies or backend. The demo never executes commands or reads a visitor's local files.

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

Runs Prettier, ESLint, content and localization tests, static link and source archive checks, HTTP preview tests and the static build. Serve `dist/` on any static host. `.openai/hosting.json` associates this checkout with its private Site and contains no credentials. GitHub Actions CI is included for use if you connect a GitHub remote.

## Source map

- `locales/en.json`: all English presentation copy, metadata, accessibility labels, commands and fictional scenarios.
- `site.config.json`: active locale. English is the only included locale; no language switcher is shown.
- `src/index.html`: semantic page structure with translation keys, not page copy.
- `public/content.js`: source revision and locale-backed command/scenario access.
- `public/app.js`: accessible controls and command copying. Content enters the DOM through textContent.
- `public/styles.css`: responsive layout, focus styles and reduced-motion support.
- `public/downloads/`: a Git source archive of the reviewed Agent Hub commit.
- `scripts/`: locale validation, escaped HTML rendering, build and loopback preview.
- `tests/`: content, translation, rendering and HTTP checks. Browser QA is a separate step.

See [CONTRIBUTING.md](CONTRIBUTING.md) for translation PRs. Adding a language does not require component changes. Missing or extra keys, blank required translations and changed CLI syntax fail the build. Only the selected locale is bundled; there are no automatic browser-language changes or silent translation fallbacks.

## Keeping the guide accurate

Current Agent Hub source: `dbeff7f95fcba85ebbad0f2f3251bb221462ce99`. Check the CLI, README and docs/RECOVERY.md in the main repository before changing claims. Each command needs its reads, side effects, output and limitations.

When updating the snapshot, create a `git archive --format=zip --prefix=agent-hub/` of the chosen commit. Update the download filename in the template, `source` in content.js, the revision copy in the locale and this README. Package only tracked source. Never bundle a user's Hub, .env, recovery files, logs or .tmp. Use generic paths and fictional server names in examples.

Key boundaries: import without --dry-run writes; doctor starts real MCP; plain sync delivers MCP; explicit areas deliver skills and shared context; init-repo preserves existing notes; reset returns to the first recorded state, not an unknown past. No public npm release or GitHub URL is advertised. All interactive terminal results are fictional.

The site uses no analytics, cookies, accounts, remote APIs or external fonts. With JavaScript disabled, the main guide remains readable; demo and command switching require JavaScript. The download includes the full Agent Hub CLI README.

## Tooling audit

The initial npm audit reported five moderate entries in one ESLint → minimatch chain (GHSA-g3hv-75wg-m249). These are development tools and are excluded from the static deployment. npm's suggested downgrade to ESLint 4 is incompatible with this configuration; no forced downgrade or dependency override was applied. Recheck compatible upstream updates separately.

## Deployment

Deployment is maintainer-managed and deferred. Build with `npm run build` and serve `dist/` on the hosting platform chosen by the maintainers. Do not deploy to GPT/Sites, push to its hosting repository or publish elsewhere without an explicit user request.

The existing `.openai/hosting.json` records a previously created private preview; it does not authorize further publication. CI validates the repository only and has no deployment job. Never store hosting credentials in this repository.

License: MIT. The Agent Hub source download includes its own MIT license.
