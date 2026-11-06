import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';
import { useCases } from '../scripts/use-cases.mjs';
import { docsPages } from '../scripts/docs.mjs';

const source = (
  await readFile(new URL('../public/analytics.js', import.meta.url), 'utf8')
)
  .replace('export function', 'function')
  .replace('initializeAnalytics();', 'globalThis.start = initializeAnalytics;');
const key = 'agent-hub-website-analytics';
function target(properties = {}) {
  const handlers = new Map();
  return {
    ...properties,
    addEventListener(name, handler) {
      handlers.set(name, handler);
    },
    fire(name, event = {}) {
      handlers.get(name)?.(event);
    },
  };
}
function fixture({
  storage = new Map(),
  dnt,
  gpc,
  origin = 'https://getahub.dev',
  referrer = '',
  unavailable = false,
  pending = false,
} = {}) {
  const calls = [];
  const toggle = target({ checked: false, disabled: true });
  const status = { dataset: { on: 'On', off: 'Off', blocked: 'Blocked' } };
  const root = {
    dataset: {
      origin: 'https://getahub.dev',
      endpoint: 'https://metrics.getahub.dev/v1/events',
      page: 'home',
    },
    querySelector: (selector) =>
      selector === '[data-analytics-enabled]' ? toggle : status,
  };
  const document = target({
    referrer,
    documentElement: { lang: 'ru' },
    querySelector: (selector) =>
      selector === '[data-website-analytics]' ? root : null,
  });
  const window = target();
  const context = {
    document,
    window,
    location: {
      origin,
      hostname: 'getahub.dev',
      href: origin + '/?private=ignored#fragment',
    },
    navigator: { doNotTrack: dnt, globalPrivacyControl: gpc },
    localStorage: {
      getItem: (key) => {
        if (unavailable) throw new Error('blocked');
        return storage.get(key) ?? null;
      },
      setItem: (key, value) => {
        if (unavailable) throw new Error('blocked');
        storage.set(key, value);
      },
    },
    crypto: { randomUUID },
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
    fetch: (url, options) => {
      calls.push({ url, options, body: JSON.parse(options.body) });
      return pending
        ? new Promise((_resolve, reject) =>
            options.signal.addEventListener(
              'abort',
              () => reject(new Error('aborted')),
              { once: true },
            ),
          )
        : Promise.resolve();
    },
  };
  vm.runInNewContext(source, context);
  return {
    ...context,
    calls,
    storage,
    toggle,
    status,
    root,
    api: context.start(root),
  };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('default website collection sends only reviewed metadata and opt-out persists without a banner', async () => {
  const f = fixture({
    referrer: 'https://github.com/example/private?token=secret',
  });
  await tick();
  assert.equal(f.calls.length, 1);
  assert.equal(f.toggle.checked, true);
  assert.equal(f.calls[0].body.source, 'github');
  assert.equal(f.calls[0].body.language, 'ru');
  assert.equal(f.calls[0].body.enabled, true);
  assert.deepEqual(
    Object.keys(f.calls[0].body).sort(),
    [
      'enabled',
      'surface',
      'event',
      'distinct_id',
      'language',
      'page',
      'source',
    ].sort(),
  );
  assert.equal(f.calls[0].options.credentials, 'omit');
  assert.equal(f.calls[0].options.referrerPolicy, 'no-referrer');
  assert.ok(!JSON.stringify(f.calls[0].body).includes('secret'));
  const old = f.calls[0].body.distinct_id;
  f.toggle.checked = false;
  f.toggle.fire('change');
  assert.deepEqual(JSON.parse(f.storage.get(key)), {
    version: 1,
    enabled: false,
  });
  const reload = fixture({ storage: f.storage });
  await tick();
  assert.equal(reload.calls.length, 0);
  reload.api.track('install_command_copied');
  assert.equal(reload.calls.length, 0);
  reload.toggle.checked = true;
  reload.toggle.fire('change');
  reload.api.track('install_command_copied');
  await tick();
  assert.equal(reload.calls.length, 1);
  assert.notEqual(reload.calls[0].body.distinct_id, old);
});

test('DNT, GPC, unreadable/corrupt storage and local previews create no identity or traffic', async () => {
  for (const options of [
    { dnt: '1' },
    { gpc: true },
    { unavailable: true },
    { origin: 'http://127.0.0.1:3084' },
  ]) {
    const f = fixture(options);
    f.api?.track('demo_played');
    await tick();
    assert.equal(f.calls.length, 0);
    assert.equal(f.storage.size, 0);
  }
  for (const text of [
    'bad',
    '{"version":2,"enabled":true}',
    '{"version":1,"enabled":true,"id":"machine-name"}',
  ]) {
    const storage = new Map([[key, text]]);
    const f = fixture({ storage });
    await tick();
    assert.equal(f.calls.length, 0);
    assert.equal(storage.get(key), text);
  }
});

test('revocation aborts pending sends in this tab and other tabs; arbitrary event names are rejected', async () => {
  const f = fixture({ pending: true });
  assert.equal(f.calls.length, 1);
  f.api.track('private text');
  assert.equal(f.calls.length, 1);
  f.storage.set(key, JSON.stringify({ version: 1, enabled: false }));
  f.window.fire('storage', { key });
  assert.equal(f.calls[0].options.signal.aborted, true);
  f.api.track('demo_played');
  await tick();
  assert.equal(f.calls.length, 1);
  assert.equal(f.toggle.checked, false);
});

test('traffic-source categories never mistake lookalike domains for search engines', async () => {
  for (const [referrer, expected] of [
    ['https://google.com.evil.example/?private=x', 'other'],
    ['https://www.google.com/search?q=private', 'search'],
    ['https://news.ycombinator.com/item?id=123', 'hn'],
    ['https://getahub.dev/ru/docs/?secret=x', 'direct'],
  ]) {
    const f = fixture({ referrer });
    await tick();
    assert.equal(f.calls[0].body.source, expected);
  }
});

test('all 60 localized routes have localized settings and only a reviewed page group', async () => {
  const paths = [
    '',
    ...useCases.map((page) => page.slug + '/'),
    ...docsPages.map((page) =>
      page.slug === 'overview' ? 'docs/' : `docs/${page.slug}/`,
    ),
  ];
  for (const lang of ['en', 'ru']) {
    const prefix = lang === 'en' ? '' : 'ru/';
    const locale = JSON.parse(
      await readFile(
        new URL(`../locales/${lang}.json`, import.meta.url),
        'utf8',
      ),
    );
    for (const page of paths) {
      const html = await readFile(
        new URL(`../dist/${prefix}${page}index.html`, import.meta.url),
        'utf8',
      );
      assert.ok(html.includes(locale.analytics.title));
      assert.ok(html.includes(locale.analytics.label));
      assert.match(
        html,
        /data-page="(home|docs|quickstart|history|handoff|mcp|skills|comparison)"/,
      );
      assert.equal((html.match(/src="[^"]*analytics.js"/g) ?? []).length, 1);
    }
  }
});
