# Contributing

Keep explanations precise, approachable and consistent with the referenced Agent Hub source. Prefer concrete inputs, side effects and outcomes over marketing claims.

## Translation PRs

English and Russian are shipped. English is the reference schema in `locales/en.json`; Russian is in `locales/ru.json`. All user-facing copy belongs in the locale files, including page metadata, navigation, accessibility labels, copy feedback, command details, demo output and the Markdown documentation in `docs.content`. The HTML template and components contain structure and technical identifiers.

To propose a language:

1. Copy `locales/en.json` to `locales/<language-tag>.json`, for example `locales/de.json`.
2. Change `language` and `docs.language` to the matching tag, and add its display name under `languages.names` in every locale. Use a two-letter code, optionally followed by a region such as `pt-BR`.
3. Translate every prose string, including documentation bodies in `docs.content`. Documentation values use Markdown; preserve fenced/indented code blocks, inline code and the sequence and levels of headings. Heading prose is translated; the build derives stable anchor IDs from English. Keep the existing keys, array order and array lengths. Do not add HTML: translation values are escaped and rendered as text.
4. Keep command `id`, `name`, `command` and `level`, scenario `id` and `command`, quick-start `code`, scope `kind` values and the `{name}` interpolation unchanged. Keep paths, flags, environment names, products and source revisions technically accurate within prose.
5. Run `npm ci` and `npm run check`. Include the new locale in your PR; leave the default `locale` and active `locales` in `site.config.json` unchanged unless activation is agreed.

The default locale is served at `/`; other active languages are served at `/<tag>/`, including all documentation under `/<tag>/docs/`. English and Russian currently build to `/` and `/ru/`. To preview a contributed language, temporarily add its tag to the config's `locales` array and run `npm run dev`. Check long prose, tables, keyboard focus and a narrow viewport. Restore the active configuration for a translation-only PR.

Every locale is validated against English, even when inactive. Missing/extra keys, blank required strings, changed technical values or altered executable documentation code fail with a useful path. Documentation heading structure must match so cross-language anchors stay stable. A language switch preserves the current documentation page and fragment. There is no remote translation service, automatic browser-language redirect or silent English fallback. Every active language must have complete landing and documentation content.

## Content changes

Update the English file first. Keep other contributed locales in sync with its structure. Never claim that planned session indexing or MCP registry stub commands are implemented. Project-gated lifecycle checkpoints are implemented; OS background services and archived-conversation extraction are not. Never add real credentials, personal machine paths or real user inventories to examples.

English operational Markdown snapshots live in `docs/` for review. Refresh them from the main repository, then run `npm run docs:sync` to update the English locale bodies. Research pages are English editorial notes rather than a current competitor comparison. The build renders documentation from the selected locale only, with no hidden English fallback. Translation PRs change their locale JSON, leaving English snapshots untouched.

## Checks

`npm run check` formats, lints, builds and tests the repository. For intentional formatting changes, run `npm run format`. Browser QA should cover the quick scenario and representative conflict/recovery scenarios, command switching, copying, disclosures and a narrow viewport. Automated tests do not replace visual review.
