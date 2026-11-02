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
      'status',
      'init',
      'import',
      'sync',
      'replace',
      'doctor',
      'health',
      'restore',
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
    /Without it/,
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
    ['clean', 'conflict', 'offline', 'stale', 'reset'],
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

test('all internal navigation, static assets and source download resolve', async () => {
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
    else if (!target.includes(':'))
      assert.ok(
        (await stat(new URL(`../dist/${target}`, import.meta.url))).isFile(),
        target,
      );
  }
  const archive = await readFile(
    new URL(`../dist/${source.archive}`, import.meta.url),
  );
  assert.equal(archive.readUInt32LE(0), 0x04034b50, 'valid ZIP header');
  assert.ok(
    archive.includes(Buffer.from(source.revision)),
    'git archive records the exact source commit',
  );
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
  assert.match(
    (await fetch(`${origin}/app.js`)).headers.get('content-type'),
    /javascript/,
  );
  assert.equal((await fetch(`${origin}/absent`)).status, 404);
  assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${origin}/%E0%A4%A`)).status, 400);
  assert.equal((await fetch(`${origin}/..%2Fpackage.json`)).status, 403);
});
