import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  readLocales,
  validateLocale,
  validateTechnicalValues,
} from '../scripts/locales.mjs';
import { escapeHtml, render } from '../scripts/render.mjs';

const english = JSON.parse(
  await readFile(new URL('../locales/en.json', import.meta.url), 'utf8'),
);

test('all contributed locales have complete keys and preserve executable syntax', async () => {
  const locales = await readLocales();
  assert.ok(locales.has('en'));
  assert.ok(locales.has('ru'));
  for (const locale of locales.values()) {
    validateLocale(english, locale);
    validateTechnicalValues(english, locale);
  }
});

test('missing, extra and blank translation keys fail with a useful path', () => {
  const missing = structuredClone(english);
  delete missing.ui.copy;
  assert.throws(() => validateLocale(english, missing), /keys mismatch: ui/);
  const extra = structuredClone(english);
  extra.ui.unknown = 'extra';
  assert.throws(() => validateLocale(english, extra), /keys mismatch: ui/);
  const blank = structuredClone(english);
  blank.ui.copy = ' ';
  assert.throws(() => validateLocale(english, blank), /ui.copy/);
});

test('translations cannot accidentally alter CLI commands, status keys or interpolation', () => {
  const changed = structuredClone(english);
  changed.commands[0].command = 'translated command';
  assert.throws(
    () => validateTechnicalValues(english, changed),
    /technical syntax/,
  );
  const missingInterpolation = structuredClone(english);
  missingInterpolation.ui.copyLabel = 'Copy';
  assert.throws(
    () => validateTechnicalValues(english, missingInterpolation),
    /\{name\}/,
  );
});

test('translated content is HTML escaped in text and attributes', () => {
  const translated = structuredClone(english);
  translated.hero.title1 = '<script>alert("unsafe")</script>';
  const html = render('<h1>{{hero.title1}}</h1>', translated);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.equal(escapeHtml('"<&'), '&quot;&lt;&amp;');
  assert.throws(
    () => render('{{missing.key}}', english),
    /Missing template translation/,
  );
  assert.throws(
    () => render('{{{unknown}}}', english),
    /Unknown template slot/,
  );
});

test('English source and rendered page have no untranslated placeholders', async () => {
  const html = await readFile(
    new URL('../dist/index.html', import.meta.url),
    'utf8',
  );
  assert.ok(!/\{\{[\w.]+\}\}/.test(html));
  assert.ok(!/\p{Script=Cyrillic}/u.test(JSON.stringify(english)));
  assert.equal(english.language, 'en');
});

test('documentation translations preserve executable code while prose can be translated', () => {
  const translated = structuredClone(english);
  translated.docs.content.quickstart =
    translated.docs.content.quickstart.replace(
      'npm ci',
      'npm install something-else',
    );
  assert.throws(
    () => validateTechnicalValues(english, translated),
    /documentation code/,
  );
});

test('Russian landing and every documentation route are localized with stable links and code', async () => {
  const { docsPages } = await import('../scripts/docs.mjs');
  const { markdownToHtml } = await import('../scripts/markdown.mjs');
  const locales = await readLocales();
  const russian = locales.get('ru');
  const landing = await readFile(
    new URL('../dist/ru/index.html', import.meta.url),
    'utf8',
  );
  assert.ok(landing.includes('<html lang="ru">'));
  assert.ok(landing.includes(russian.hero.title1));
  assert.ok(landing.includes('href="docs/"'));
  assert.ok(landing.includes('href="../downloads/'));
  assert.ok(!landing.includes('Technical documentation is currently'));
  assert.ok(landing.includes('aria-current="true">Русский'));
  for (const page of docsPages) {
    const prose = russian.docs.content[page.label];
    assert.match(prose, /[А-Яа-яЁё]/, page.slug);
    assert.notEqual(prose, english.docs.content[page.label], page.slug);
    const local = page.slug === 'overview' ? 'docs/' : `docs/${page.slug}/`;
    const html = await readFile(
      new URL(`../dist/ru/${local}index.html`, import.meta.url),
      'utf8',
    );
    assert.ok(html.includes('<html lang="ru">'), page.slug);
    assert.ok(
      html.includes('<article class="docs-content" lang="ru">'),
      page.slug,
    );
    const before = markdownToHtml(
      english.docs.content[page.label],
      (label) => label,
    ).headings;
    const after = markdownToHtml(
      prose,
      (label) => label,
      english.docs.content[page.label],
    ).headings;
    assert.deepEqual(
      after.map((heading) => heading.id),
      before.map((heading) => heading.id),
      page.slug,
    );
    assert.ok(
      html.includes(`/${local}" lang="en"`),
      `${page.slug}: language switch must preserve page`,
    );
  }
});

test('translated heading structure and indented executable code cannot drift', () => {
  const changed = structuredClone(english);
  changed.docs.content.quickstart += '\n## Extra heading\n';
  assert.throws(
    () => validateTechnicalValues(english, changed),
    /heading structure/,
  );
  const changedCode = structuredClone(english);
  changedCode.docs.content.workingGuide =
    changedCode.docs.content.workingGuide.replace(
      'export AHUB_SOURCE',
      'export DIFFERENT_SOURCE',
    );
  assert.throws(
    () => validateTechnicalValues(english, changedCode),
    /documentation code/,
  );
});
