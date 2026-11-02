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
