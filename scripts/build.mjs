import { addAnalytics } from './analytics.mjs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { buildDocs, docsPages } from './docs.mjs';
import { readLocales } from './locales.mjs';
import { escapeHtml, render } from './render.mjs';
import { source } from '../public/source.js';
import { pageMetadata, siteOrigin, sitemap } from './seo.mjs';
import { buildUseCases, useCaseLinks, useCases } from './use-cases.mjs';

const config = JSON.parse(
  await readFile(new URL('../site.config.json', import.meta.url), 'utf8'),
);
const locales = await readLocales();
const origin = siteOrigin(config.url);
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
      'source.js',
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
    assetBase: base,
    docsBase: 'docs/',
    sourceRepository: source.repository,
    sourceReleases: source.releases,
    languageSwitcher: switcher(locale, base),
    useCaseCards: useCaseLinks(locale),
    pageMetadata: pageMetadata({
      origin,
      locale,
      defaultLanguage: config.locale,
      languages: active,
      title: locale.meta.title,
      description: locale.meta.description,
    }),
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
    (path, title, description) =>
      pageMetadata({
        origin,
        locale,
        defaultLanguage: config.locale,
        languages: active,
        path,
        title,
        description,
      }),
  );
  await buildUseCases(
    locale,
    output,
    (path) => switcher(locale, `${base}../`, path),
    (path, title, description) =>
      pageMetadata({
        origin,
        locale,
        defaultLanguage: config.locale,
        languages: active,
        path,
        title,
        description,
      }),
    `${base}../`,
  );
}
const notFoundTemplate = await readFile(
  new URL('../src/404.html', import.meta.url),
  'utf8',
);
await writeFile(
  new URL('404.html', target),
  render(notFoundTemplate, locales.get(config.locale), {
    notFoundTranslations: active
      .map((tag) => {
        const locale = locales.get(tag);
        const home = `/${directory(tag)}`;
        return `<section lang="${escapeHtml(tag)}"><h1>${escapeHtml(locale.notFound.title)}</h1><p>${escapeHtml(locale.notFound.description)}</p><p><a class="button dark" href="${home}">${escapeHtml(locale.notFound.home)}</a> <a class="text-link" href="${home}docs/">${escapeHtml(locale.notFound.docs)}</a></p></section>`;
      })
      .join('\n'),
  }),
);
const paths = [
  '',
  ...useCases.map((page) => `${page.slug}/`),
  ...docsPages.map((page) =>
    page.slug === 'overview' ? 'docs/' : `docs/${page.slug}/`,
  ),
];
for (const tag of active) {
  const output = new URL(directory(tag) || './', target);
  for (const path of paths)
    await addAnalytics(
      output,
      locales.get(tag),
      path,
      origin,
      directory(tag) ? '../' : '',
    );
}
await writeFile(
  new URL('sitemap.xml', target),
  sitemap(origin, active, config.locale, paths),
);
await writeFile(
  new URL('robots.txt', target),
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile(new URL('.nojekyll', target), '');
console.log(
  `Static site ready in dist/ (${active.join(', ')}; translated documentation for every active locale)`,
);
