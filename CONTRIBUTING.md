# Contributing

Keep explanations precise, approachable and consistent with the referenced Agent Hub source. Prefer concrete inputs, side effects and outcomes over marketing claims.

## Translation PRs

English is the active and only shipped language for now. All user-facing copy is in `locales/en.json`, including page metadata, navigation, accessibility labels, copy feedback, command details and demo output. The HTML template and components contain structure and technical identifiers.

To propose a language:

1. Copy `locales/en.json` to `locales/<language-tag>.json`, for example `locales/de.json`.
2. Change the top-level `language` to the matching tag. Use a two-letter code, optionally followed by a region such as `pt-BR`.
3. Translate every prose string. Keep the existing keys, array order and array lengths. Do not add HTML: translation values are escaped and rendered as text.
4. Keep command `id`, `name` and `command`, scenario `id` and `command`, quick-start `code`, scope `kind` values and the `{name}` interpolation unchanged. Keep paths, flags, environment names, products and source revisions technically accurate within prose.
5. Run `npm ci` and `npm run check`. Include the new locale in your PR; leave `site.config.json` on `en` unless activation is part of the agreed change.

To preview a translated page, temporarily set `locale` in `site.config.json` to its tag, then run `npm run dev`. Check wrapping, table scrolling, long command lines, keyboard focus and mobile layouts. Restore the active locale before submitting a translation-only PR.

Every JSON locale is validated against English, even when it is not active. Missing, extra or empty required fields fail with a key path. CLI syntax changes fail independently. The build bundles only the selected locale into `dist/locale.js`, generates the document language and metadata, and renders static content into `dist/index.html`. There is no runtime language menu, remote translation service or silent English fallback.

## Content changes

Update the English file first. Keep other contributed locales in sync with its structure. Never claim that planned skills delivery, session indexing or stub commands are implemented. Never add real credentials, personal machine paths or real user inventories to examples.

## Checks

`npm run check` formats, lints, builds and tests the repository. For intentional formatting changes, run `npm run format`. Browser QA should cover all five scenarios, command switching, copying, disclosures and a narrow viewport. Automated tests do not replace visual review.
