import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { useCases } from '../scripts/use-cases.mjs';
import { escapeHtml } from '../scripts/render.mjs';

test('standalone landing pages are localized, distinct from guides and reachable without JavaScript', async () => {
  for (const language of ['en', 'ru']) {
    const locale = JSON.parse(
      await readFile(new URL(`../locales/${language}.json`, import.meta.url)),
    );
    const prefix = language === 'en' ? '' : 'ru/';
    const home = await readFile(
      new URL(`../dist/${prefix}index.html`, import.meta.url),
      'utf8',
    );
    const titles = new Set();
    const descriptions = new Set();
    for (const page of useCases) {
      const copy = locale.useCases.pages[page.key];
      const html = await readFile(
        new URL(`../dist/${prefix}${page.slug}/index.html`, import.meta.url),
        'utf8',
      );
      assert.ok(home.includes(`href="${page.slug}/"`), page.slug);
      assert.equal([...html.matchAll(/<h1\b/g)].length, 1, page.slug);
      assert.ok(html.includes(escapeHtml(copy.heading)));
      assert.ok(html.includes(`<title>${escapeHtml(copy.title)}</title>`));
      assert.ok(html.includes(escapeHtml(copy.lead)));
      assert.ok(!html.includes('docs-sidebar'));
      assert.ok(!html.includes('{{'));
      assert.ok(html.includes(`href="../docs/${page.guide}/"`));
      for (const section of [...copy.benefits, ...copy.steps]) {
        assert.ok(html.includes(escapeHtml(section.title)));
        assert.ok(html.includes(escapeHtml(section.body)));
      }
      for (const question of copy.questions) {
        assert.ok(html.includes(escapeHtml(question.question)));
        assert.ok(html.includes(escapeHtml(question.answer)));
      }
      titles.add(copy.title);
      descriptions.add(copy.description);
    }
    assert.equal(titles.size, useCases.length);
    assert.equal(descriptions.size, useCases.length);
  }
});

test('landing page assets, cross-links and language routes resolve at both route depths', async () => {
  for (const prefix of ['', 'ru/'])
    for (const page of useCases) {
      const url = new URL(
        `../dist/${prefix}${page.slug}/index.html`,
        import.meta.url,
      );
      const html = await readFile(url, 'utf8');
      for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (/^https?:/.test(href)) continue;
        const [path, anchor] = href.split('#');
        let destination = new URL(path || 'index.html', url);
        if (path.endsWith('/'))
          destination = new URL('index.html', destination);
        assert.ok((await stat(destination)).isFile(), href);
        if (anchor)
          assert.ok(
            (await readFile(destination, 'utf8')).includes(`id="${anchor}"`),
            href,
          );
      }
    }
});
