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
  breadcrumb,
}) {
  const canonical = pageUrl(origin, locale.language, defaultLanguage, path);
  const home = pageUrl(origin, locale.language, defaultLanguage);
  const base = '../'.repeat(
    new URL(canonical).pathname.split('/').filter(Boolean).length,
  );
  const manifest = localizedPath(
    locale.language,
    defaultLanguage,
    'site.webmanifest',
  );
  const image = new URL('/social-card.png', origin).href;
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: `${origin}/`,
      name: locale.brand.name,
      inLanguage: languages,
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      inLanguage: locale.language,
      isPartOf: { '@id': `${origin}/#website` },
    },
  ];
  if (breadcrumb)
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale.brand.name,
          item: home,
        },
        { '@type': 'ListItem', position: 2, name: breadcrumb, item: canonical },
      ],
    });
  const alternate = (language, href) =>
    `<link rel="alternate" hreflang="${escapeHtml(language)}" href="${escapeHtml(href)}" />`;
  return [
    `<link rel="icon" href="${base}favicon.png" sizes="96x96" type="image/png" />`,
    `<link rel="apple-touch-icon" href="${base}apple-touch-icon.png" sizes="180x180" />`,
    `<link rel="manifest" href="${base}${manifest}" />`,
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
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`,
  ].join('\n');
}

export function sitemap(origin, languages, defaultLanguage, paths) {
  const urls = paths.flatMap((path) =>
    languages.map((language) => {
      const links = languages.map(
        (tag) =>
          `<xhtml:link rel="alternate" hreflang="${escapeHtml(tag)}" href="${escapeHtml(pageUrl(origin, tag, defaultLanguage, path))}" />`,
      );
      links.push(
        `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(pageUrl(origin, defaultLanguage, defaultLanguage, path))}" />`,
      );
      return `<url><loc>${escapeHtml(pageUrl(origin, language, defaultLanguage, path))}</loc>${links.join('')}</url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>\n`;
}

export function webManifest(locale, defaultLanguage) {
  const home = '/' + localizedPath(locale.language, defaultLanguage);
  return (
    JSON.stringify(
      {
        id: home,
        name: locale.meta.title,
        short_name: locale.brand.name,
        description: locale.meta.description,
        lang: locale.language,
        start_url: home,
        scope: home,
        display: 'browser',
        theme_color: '#f7f6f2',
        background_color: '#f7f6f2',
        icons: [192, 512].map((size) => ({
          src: `/icons/icon-${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
          purpose: 'any',
        })),
      },
      null,
      2,
    ) + '\n'
  );
}
