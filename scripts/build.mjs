import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { buildDocs } from './docs.mjs';
import { readLocales } from './locales.mjs';
import { escapeHtml, render } from './render.mjs';

const config = JSON.parse(
  await readFile(new URL('../site.config.json', import.meta.url), 'utf8'),
);
const locales = await readLocales();
const active = config.locales ?? [config.locale];
if (!active.includes(config.locale) || new Set(active).size !== active.length)
  throw new Error('Choose one default locale and unique active locales.');
for (const tag of active)
  if (!locales.has(tag)) throw new Error(`Unavailable locale: ${tag}`);
const reference = locales.get('en');
const template = await readFile(
  new URL('../src/index.html', import.meta.url),
  'utf8',
);
const target = new URL('../dist/', import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(new URL('../public/', import.meta.url), target, { recursive: true });
const directory = (tag) => (tag === config.locale ? '' : `${tag}/`);
const switcher = (locale, base, page = '') =>
  `<nav class="language-switcher" aria-label="${escapeHtml(locale.languages.label)}">${active.map((tag) => `<a href="${base}${directory(tag)}${page || './'}" lang="${tag}" hreflang="${tag}"${tag === locale.language ? ' aria-current="true"' : ''}>${escapeHtml(locale.languages.names[tag])}</a>`).join('')}</nav>`;
for (const tag of active) {
  const locale = locales.get(tag);
  const prefix = directory(tag);
  const output = new URL(prefix || './', target);
  const base = prefix ? '../' : '';
  await mkdir(output, { recursive: true });
  if (prefix) {
    for (const file of [
      'app.js',
      'content.js',
      'styles.css',
      'favicon.svg',
      'languages.js',
    ])
      await cp(
        new URL(`../public/${file}`, import.meta.url),
        new URL(file, output),
      );
  }
  const html = render(template, locale, {
    docsBase: 'docs/',
    downloadsBase: `${base}downloads/`,
    languageSwitcher: switcher(locale, base),
    languageAlternates: active
      .map(
        (language) =>
          `<link rel="alternate" hreflang="${language}" href="${base}${directory(language) || './'}" />`,
      )
      .join(''),
  });
  await writeFile(new URL('index.html', output), html);
  // Each route loads only its selected locale; documentation is rendered statically.
  await writeFile(
    new URL('locale.js', output),
    `export default ${JSON.stringify(locale)};\n`,
  );
  await buildDocs(
    locale,
    (home, slug) =>
      switcher(
        locale,
        `${base}${home}`,
        slug === 'overview' ? 'docs/' : `docs/${slug}/`,
      ),
    output,
    reference,
  );
}
console.log(
  `Static site ready in dist/ (${active.join(', ')}; translated documentation for every active locale)`,
);
