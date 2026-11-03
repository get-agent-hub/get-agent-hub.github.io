import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { docsPages } from '../scripts/docs.mjs';
import locale from '../dist/locale.js';

const pagePath = (slug) =>
  new URL(
    slug === 'overview'
      ? '../dist/docs/index.html'
      : `../dist/docs/${slug}/index.html`,
    import.meta.url,
  );

test('every documentation page builds with sidebar, content, pager and no placeholders', async () => {
  assert.equal(docsPages.length, 15);
  assert.equal(
    new Set(docsPages.map(({ slug }) => slug)).size,
    docsPages.length,
  );
  for (const page of docsPages) {
    const html = await readFile(pagePath(page.slug), 'utf8');
    assert.ok(!/\{\{[\w.]+\}\}/.test(html), `${page.slug}: placeholder left`);
    assert.ok(html.includes('docs-sidebar'), `${page.slug}: sidebar missing`);
    assert.ok(html.includes('docs-pager'), `${page.slug}: pager missing`);
    assert.ok(
      html.includes('aria-current="page"'),
      `${page.slug}: current page not marked`,
    );
    for (const other of docsPages) {
      const label =
        other.slug === 'usecases-and-demand'
          ? 'Use cases &amp; demand'
          : locale.docs.pages[other.label].replace('&', '&amp;');
      assert.ok(
        html.includes(`>${label}</a>`),
        `${page.slug}: navigation lacks ${other.slug}`,
      );
    }
  }
});

test('all documentation links and anchors resolve', async () => {
  const cache = new Map();
  const load = async (url) => {
    if (!cache.has(url.href)) cache.set(url.href, await readFile(url, 'utf8'));
    return cache.get(url.href);
  };
  for (const page of docsPages) {
    const url = pagePath(page.slug);
    const html = await load(url);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${page.slug}: duplicate IDs`);
    for (const [, target] of html.matchAll(/href="([^"]+)"/g)) {
      if (/^[a-z][\w+.-]*:/i.test(target)) continue;
      const [file, fragment] = target.split('#');
      if (!file) {
        assert.ok(
          ids.includes(fragment),
          `${page.slug}: missing anchor ${target}`,
        );
        continue;
      }
      let resolved = new URL(file, url);
      if (file.endsWith('/')) resolved = new URL('index.html', resolved);
      assert.ok(
        (await stat(resolved)).isFile(),
        `${page.slug}: broken link ${target}`,
      );
      if (fragment) {
        const targetHtml = await load(resolved);
        assert.ok(
          targetHtml.includes(`id="${fragment}"`),
          `${page.slug}: missing anchor ${target}`,
        );
      }
    }
  }
});

test('documentation renders markdown tables, code blocks and cross-page links', async () => {
  const automation = await readFile(pagePath('automation'), 'utf8');
  assert.ok(automation.includes('<table>'), 'automation: table missing');
  assert.ok(
    automation.includes('class="language-sh"'),
    'automation: fenced code missing',
  );
  assert.ok(
    automation.includes(
      'docs/memory/#discover-and-import-existing-client-memory',
    ),
    'automation: cross-page anchor not rewritten',
  );
  const workingGuide = await readFile(pagePath('working-guide'), 'utf8');
  assert.ok(
    workingGuide.includes('<pre><code>export AHUB_SOURCE'),
    'working guide: indented code block missing',
  );
  const overview = await readFile(pagePath('overview'), 'utf8');
  assert.ok(
    !overview.includes('ui/mockups/README.md'),
    'overview: unresolvable repository link must be dropped',
  );
});

test('documentation is English, locale-owned and linked to the short first-run route', async () => {
  for (const page of docsPages) {
    const markdown = locale.docs.content[page.label];
    assert.ok(markdown?.startsWith('# '), page.slug);
    assert.equal(/[А-Яа-яЁё]/.test(markdown), false, page.slug);
    assert.equal(
      markdown,
      await readFile(new URL(`../docs/${page.file}`, import.meta.url), 'utf8'),
      `${page.slug}: run npm run docs:sync`,
    );
  }
  const quick = await readFile(pagePath('quickstart'), 'utf8');
  assert.ok(
    quick.includes('ahub quick') &&
      quick.includes('project connect /path/to/project'),
  );
  assert.ok(quick.includes('staged workflow'));
  assert.ok(quick.includes('first baseline'));
  const landing = await readFile(
    new URL('../dist/index.html', import.meta.url),
    'utf8',
  );
  assert.ok(landing.includes('href="docs/quickstart/"'));
});
