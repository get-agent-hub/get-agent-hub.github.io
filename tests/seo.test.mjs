import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { docsPages } from '../scripts/docs.mjs';
import { pageMetadata, pageUrl, siteOrigin } from '../scripts/seo.mjs';
import { escapeHtml } from '../scripts/render.mjs';
import { useCases } from '../scripts/use-cases.mjs';
import { source } from '../public/source.js';

const config = JSON.parse(
  await readFile(new URL('../site.config.json', import.meta.url), 'utf8'),
);
const origin = siteOrigin(config.url);
const paths = [
  '',
  ...useCases.map((page) => `${page.slug}/`),
  ...docsPages.map((page) =>
    page.slug === 'overview' ? 'docs/' : `docs/${page.slug}/`,
  ),
];

test('practical guides have localized task-specific descriptions and discoverable routes', async () => {
  const tasks = docsPages.filter((page) => page.group === 'tasks');
  assert.equal(tasks.length, 6);
  for (const language of config.locales) {
    const locale = JSON.parse(
      await readFile(
        new URL(`../locales/${language}.json`, import.meta.url),
        'utf8',
      ),
    );
    const prefix = language === config.locale ? '' : `${language}/`;
    const landing = await readFile(
      new URL(`../dist/${prefix}index.html`, import.meta.url),
      'utf8',
    );
    const descriptions = new Set();
    for (const page of tasks) {
      const description = locale.docs.descriptions[page.label];
      assert.ok(description && description !== locale.docs.metaDescription);
      descriptions.add(description);
      const html = await readFile(
        new URL(
          `../dist/${prefix}docs/${page.slug}/index.html`,
          import.meta.url,
        ),
        'utf8',
      );
      assert.ok(
        html.includes(
          `name="description" content="${escapeHtml(description)}"`,
        ),
      );
      assert.ok(
        html.includes(
          `property="og:description" content="${escapeHtml(description)}"`,
        ),
      );
      assert.ok(landing.includes(`href="docs/${page.slug}/"`));
    }
    assert.equal(descriptions.size, tasks.length);
  }
});

test('every landing and documentation page has its own canonical and complete language alternatives', async () => {
  for (const language of config.locales) {
    const locale = JSON.parse(
      await readFile(
        new URL(`../locales/${language}.json`, import.meta.url),
        'utf8',
      ),
    );
    for (const path of paths) {
      const url = pageUrl(origin, language, config.locale, path);
      const file = new URL(
        `../dist${new URL(url).pathname}index.html`,
        import.meta.url,
      );
      const html = await readFile(file, 'utf8');
      const data = JSON.parse(
        html.match(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
        )[1],
      );
      assert.equal(data['@context'], 'https://schema.org');
      const website = data['@graph'].find(
        (item) => item['@type'] === 'WebSite',
      );
      const webpage = data['@graph'].find(
        (item) => item['@type'] === 'WebPage',
      );
      assert.equal(website.url, `${origin}/`);
      assert.equal(webpage.url, url);
      assert.equal(webpage.inLanguage, language);
      assert.equal(webpage.isPartOf['@id'], website['@id']);
      assert.ok(
        html.includes(`<title>${escapeHtml(webpage.name)}</title>`),
        url,
      );
      assert.ok(
        html.includes(`content="${escapeHtml(webpage.description)}"`),
        url,
      );
      const repositoryLink = html.match(
        /<a class="github-link"[^>]*>[\s\S]*?<\/a>/,
      )?.[0];
      assert.ok(repositoryLink, `${url}: missing header repository link`);
      assert.ok(repositoryLink.includes(`href="${source.repository}"`), url);
      assert.ok(
        repositoryLink.includes(
          `aria-label="${escapeHtml(locale.nav.github)}"`,
        ),
        url,
      );
      assert.ok(repositoryLink.includes('aria-hidden="true"'), url);
      if (path === '') {
        for (const label of [
          locale.start.download,
          locale.start.releases,
          locale.footer.download,
        ]) {
          assert.ok(
            [
              ...html.matchAll(
                /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a\s*>/g,
              ),
            ].some(
              ([, href, body]) =>
                href === source.releases &&
                body.trim().startsWith(escapeHtml(label)),
            ),
            `${url}: ${label} must open releases`,
          );
        }
      }
      assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1, url);
      assert.ok(html.includes(`rel="canonical" href="${url}"`), url);
      for (const alternate of config.locales) {
        assert.ok(
          html.includes(
            `hreflang="${alternate}" href="${pageUrl(origin, alternate, config.locale, path)}"`,
          ),
          url,
        );
      }
      assert.ok(
        html.includes(
          `hreflang="x-default" href="${pageUrl(origin, config.locale, config.locale, path)}"`,
        ),
        url,
      );
      assert.ok(html.includes(`property="og:url" content="${url}"`), url);
      assert.ok(
        html.includes(
          `property="og:image" content="${origin}/social-card.png"`,
        ),
        url,
      );
      assert.ok(
        html.includes('name="twitter:card" content="summary_large_image"'),
        url,
      );
    }
  }
});

test('sitemap indexes exactly the shipped language routes and robots advertises it', async () => {
  const xml = await readFile(
    new URL('../dist/sitemap.xml', import.meta.url),
    'utf8',
  );
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  const expected = config.locales.flatMap((tag) =>
    paths.map((path) => pageUrl(origin, tag, config.locale, path)),
  );
  assert.deepEqual(urls.sort(), expected.sort());
  assert.equal(urls.length, 80);
  assert.equal([...xml.matchAll(/hreflang="x-default"/g)].length, urls.length);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(!urls.some((url) => url.includes('404')));
  for (const url of urls) {
    assert.ok(
      (
        await stat(
          new URL(`../dist${new URL(url).pathname}index.html`, import.meta.url),
        )
      ).isFile(),
      url,
    );
  }
  assert.equal(
    await readFile(new URL('../dist/robots.txt', import.meta.url), 'utf8'),
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  );
  await stat(new URL('../dist/.nojekyll', import.meta.url));
});

test('localized browser manifests and bookmark icons resolve to real square assets', async () => {
  for (const language of config.locales) {
    const prefix = language === config.locale ? '' : `${language}/`;
    const manifest = JSON.parse(
      await readFile(
        new URL(`../dist/${prefix}site.webmanifest`, import.meta.url),
        'utf8',
      ),
    );
    assert.equal(manifest.lang, language);
    assert.equal(manifest.start_url, `/${prefix}`);
    assert.equal(manifest.scope, `/${prefix}`);
    assert.equal(manifest.display, 'browser');
    assert.deepEqual(
      manifest.icons.map((icon) => icon.sizes),
      ['192x192', '512x512'],
    );
    for (const icon of manifest.icons) {
      const png = await readFile(
        new URL(`../dist${icon.src}`, import.meta.url),
      );
      assert.equal(png.subarray(1, 4).toString(), 'PNG');
      assert.equal(
        `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`,
        icon.sizes,
      );
    }
  }
  for (const [name, size] of [
    ['favicon.png', 96],
    ['apple-touch-icon.png', 180],
  ]) {
    const png = await readFile(new URL(`../dist/${name}`, import.meta.url));
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});

test('structured data cannot close its script through translated page copy', () => {
  const locale = {
    language: 'en',
    brand: { name: 'Agent Hub' },
    meta: { imageAlt: 'Preview' },
  };
  const unsafe = '</script><script>unexpected()</script>';
  const html = pageMetadata({
    origin,
    locale,
    defaultLanguage: 'en',
    languages: ['en', 'ru'],
    title: unsafe,
    description: unsafe,
    breadcrumb: unsafe,
    path: 'example/',
  });
  const scripts = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ];
  assert.equal(scripts.length, 1);
  assert.ok(!scripts[0][1].includes('<'));
  const graph = JSON.parse(scripts[0][1])['@graph'];
  assert.equal(graph.find((item) => item['@type'] === 'WebPage').name, unsafe);
});

test('404 works from unknown nested routes and the social image is a real raster asset', async () => {
  const html = await readFile(
    new URL('../dist/404.html', import.meta.url),
    'utf8',
  );
  assert.ok(html.includes('name="robots" content="noindex"'));
  assert.ok(html.includes('href="/styles.css"'));
  for (const tag of config.locales) {
    const locale = JSON.parse(
      await readFile(
        new URL(`../locales/${tag}.json`, import.meta.url),
        'utf8',
      ),
    );
    assert.ok(html.includes(locale.notFound.title));
  }
  const png = await readFile(
    new URL('../dist/social-card.png', import.meta.url),
  );
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});

test('publication origin rejects credentials, non-HTTPS and unsupported base paths', () => {
  for (const value of [
    'http://example.com',
    'https://user:secret@example.com',
    'https://example.com/site/',
    'https://example.com/?x=1',
    'https://example.com/#x',
  ]) {
    assert.throws(() => siteOrigin(value), /HTTPS origin/);
  }
  assert.equal(siteOrigin('https://example.com/'), 'https://example.com');
});
