import { escapeHtml } from './render.mjs';

export function siteOrigin(value) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error(
      'Site URL must be an HTTPS origin without a path or credentials.',
    );
  return url.origin;
}

export const localizedPath = (language, defaultLanguage, path = '') =>
  `${language === defaultLanguage ? '' : `${language}/`}${path}`;

export const pageUrl = (origin, language, defaultLanguage, path = '') =>
  new URL(localizedPath(language, defaultLanguage, path), `${origin}/`).href;

export function pageMetadata({
  origin,
  locale,
  defaultLanguage,
  languages,
  path = '',
  title,
  description,
}) {
  const canonical = pageUrl(origin, locale.language, defaultLanguage, path);
  const image = new URL('/social-card.png', origin).href;
  const alternate = (language, href) =>
    `<link rel="alternate" hreflang="${escapeHtml(language)}" href="${escapeHtml(href)}" />`;
  return [
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    ...languages.map((language) =>
      alternate(language, pageUrl(origin, language, defaultLanguage, path)),
    ),
    alternate(
      'x-default',
      pageUrl(origin, defaultLanguage, defaultLanguage, path),
    ),
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${escapeHtml(locale.brand.name)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${escapeHtml(locale.meta.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(locale.meta.imageAlt)}" />`,
  ].join('\n');
}

export function sitemap(origin, languages, defaultLanguage, paths) {
  const urls = paths.flatMap((path) =>
    languages.map((language) => {
      const links = languages.map(
        (tag) =>
          `<xhtml:link rel="alternate" hreflang="${escapeHtml(tag)}" href="${escapeHtml(pageUrl(origin, tag, defaultLanguage, path))}" />`,
      );
      return `<url><loc>${escapeHtml(pageUrl(origin, language, defaultLanguage, path))}</loc>${links.join('')}</url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>\n`;
}
