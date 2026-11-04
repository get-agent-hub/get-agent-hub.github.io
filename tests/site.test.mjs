import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { commands, getScenario, scenarios, source } from '../dist/content.js';
import { handleRequest } from '../scripts/serve.mjs';
import locale from '../dist/locale.js';
import { escapeHtml } from '../scripts/render.mjs';

const english = JSON.parse(
  await readFile(new URL('../locales/en.json', import.meta.url), 'utf8'),
);

test('every working command has an explanation of reads, writes, output and limitations', () => {
  assert.deepEqual(
    commands.map(({ id }) => id),
    [
      'quick',
      'project-connect',
      'project-disconnect',
      'status',
      'init',
      'import',
      'sync',
      'replace',
      'skills',
      'context',
      'init-repo',
      'memory-project',
      'memory-records',
      'memory-onboard',
      'memory-serve',
      'memory-auto',
      'memory-conflict',
      'doctor',
      'health',
      'restore',
      'undo',
      'reset',
      'mcp',
      'ui',
    ],
  );
  assert.equal(new Set(commands.map(({ id }) => id)).size, commands.length);
  for (const command of commands) {
    for (const field of [
      'name',
      'description',
      'command',
      'reads',
      'writes',
      'result',
      'detail',
    ]) {
      assert.ok(command[field]?.length > 0, `${command.id}: missing ${field}`);
    }
  }
  assert.match(
    english.commands.find(({ id }) => id === 'import').writes,
    /Preview writes nothing/,
  );
  assert.match(
    english.commands.find(({ id }) => id === 'doctor').writes,
    /starts/,
  );
  assert.match(
    english.commands.find(({ id }) => id === 'reset').detail,
    /without a baseline/,
  );
  assert.match(
    english.commands.find(({ id }) => id === 'replace').detail,
    /does not restrict/,
  );
});

test('demonstrations cover common failures and never provide a real apply revision', () => {
  assert.deepEqual(
    scenarios.map(({ id }) => id),
    [
      'quick',
      'clean',
      'conflict',
      'offline',
      'stale',
      'reset',
      'memory-import',
      'checkpoint',
      'memory-conflict',
    ],
  );
  for (const scenario of scenarios)
    assert.equal(getScenario(scenario.id), scenario);
  assert.equal(getScenario('unknown'), scenarios[0]);
  assert.match(
    english.scenarios.find(({ id }) => id === 'offline').explanation,
    /does not call tools/,
  );
  assert.match(getScenario('stale').lines.join(' '), /WRITE 0 files/);
  assert.match(
    english.scenarios.find(({ id }) => id === 'reset').explanation,
    /refuses without a baseline/,
  );
});

test('internal navigation and assets resolve, with source and releases hosted on GitHub', async () => {
  const html = await readFile(
    new URL('../dist/index.html', import.meta.url),
    'utf8',
  );
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate DOM IDs');
  for (const [, target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (target === '#') continue;
    if (target.startsWith('#'))
      assert.ok(ids.includes(target.slice(1)), `missing anchor ${target}`);
    else if (!target.includes(':')) {
      let asset = new URL(`../dist/${target}`, import.meta.url);
      if (target.endsWith('/')) asset = new URL('index.html', asset);
      assert.ok((await stat(asset)).isFile(), target);
    }
  }
  assert.match(source.revision, /^[a-f0-9]{40}$/);
  assert.equal(source.releases, `${source.repository}/releases`);
  assert.ok(html.includes(`href="${source.repository}"`));
  assert.ok(html.includes(`href="${source.releases}"`));
  assert.doesNotMatch(html, /downloads\/|source-.*\.zip/);
  assert.ok(locale.start.release.includes(source.version));
  assert.ok(locale.start.release.includes(source.revision.slice(0, 7)));
  assert.ok(html.includes('id="memory"'));
  assert.ok(html.includes(escapeHtml(locale.memory.boundary)));
  assert.ok(html.includes(escapeHtml(locale.lab.disclaimer)));
  assert.ok(html.includes(escapeHtml(locale.start.release)));
});

test('preview serves assets with correct MIME and rejects unsupported methods and malformed paths', async (t) => {
  const server = createServer(handleRequest);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const origin = `http://127.0.0.1:${server.address().port}`;
  const html = await fetch(origin);
  assert.equal(html.status, 200);
  assert.ok((await html.text()).includes(`<html lang="${locale.language}">`));
  const docs = await fetch(`${origin}/docs/`);
  assert.equal(docs.status, 200);
  assert.ok((await docs.text()).includes('docs-sidebar'));
  for (const route of [
    '/ru/',
    '/ru/docs/',
    '/ru/docs/quickstart/',
    '/ru/docs/cli/',
  ]) {
    const response = await fetch(`${origin}${route}`);
    assert.equal(response.status, 200, route);
    assert.ok((await response.text()).includes('<html lang="ru">'), route);
  }
  const russianData = await (await fetch(`${origin}/ru/locale.js`)).text();
  assert.ok(russianData.includes('Ваши агенты.'));
  const docsPage = await fetch(`${origin}/docs/memory/`);
  assert.equal(docsPage.status, 200);
  assert.ok((await docsPage.text()).includes('id="scopes-and-storage"'));
  assert.match(
    (await fetch(`${origin}/app.js`)).headers.get('content-type'),
    /javascript/,
  );
  const absent = await fetch(`${origin}/nested/absent`);
  assert.equal(absent.status, 404);
  assert.ok((await absent.text()).includes('Page not found'));
  const absentHead = await fetch(`${origin}/nested/absent`, { method: 'HEAD' });
  assert.equal(absentHead.status, 404);
  assert.equal(await absentHead.text(), '');
  assert.match(
    (await fetch(`${origin}/sitemap.xml`)).headers.get('content-type'),
    /xml/,
  );
  assert.match(
    (await fetch(`${origin}/robots.txt`)).headers.get('content-type'),
    /text\/plain/,
  );
  assert.match(
    (await fetch(`${origin}/social-card.png`)).headers.get('content-type'),
    /image\/png/,
  );
  assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${origin}/%E0%A4%A`)).status, 400);
  assert.equal((await fetch(`${origin}/..%2Fpackage.json`)).status, 403);
});

test('first-run and command examples use the globally installed ahub CLI', () => {
  assert.ok(locale.start.steps[0].code.includes('npm run install:global'));
  for (const command of commands)
    assert.match(command.command, /^ahub /, command.id);
  assert.ok(locale.start.steps.some((step) => step.code === 'ahub ui'));
  assert.equal(
    locale.docs.content.quickstart.includes('node dist/cli.js'),
    false,
  );
  assert.ok(
    locale.docs.content.quickstart.includes('npm uninstall --global agent-hub'),
  );
});

test('shared Hub and optional project setup have distinct commands and explanations', () => {
  assert.equal(
    commands.find((entry) => entry.id === 'quick').command,
    'ahub quick',
  );
  assert.equal(
    commands.find((entry) => entry.id === 'project-connect').command,
    'ahub project connect /path/to/project',
  );
  assert.equal(locale.start.steps[1].code, 'ahub quick');
  assert.match(locale.start.steps[1].note, /does not set up project/);
  assert.ok(
    locale.start.steps.some(
      (step) => step.code === 'ahub project connect /path/to/project',
    ),
  );
  assert.match(locale.docs.content.quickstart, /not the Hub directory/);
});

test('every command declares a caller and is classified for ordinary users or integrations', () => {
  for (const command of commands) {
    assert.ok(command.audience.length > 12, command.id);
    assert.ok(
      ['everyday', 'advanced', 'integration'].includes(command.level),
      command.id,
    );
  }
  assert.deepEqual(
    commands
      .filter((command) => command.level === 'everyday')
      .map((command) => command.id)
      .sort(),
    [
      'doctor',
      'project-connect',
      'project-disconnect',
      'quick',
      'status',
      'ui',
      'undo',
    ],
  );
});
