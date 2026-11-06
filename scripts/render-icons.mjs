import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Render this site's simple rectangle/path SVG with ImageMagick's drawing engine.
// Its internal SVG decoder can omit path strokes; keep geometry in the SVG only.
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const svg = await readFile(path.join(publicRoot, 'favicon.svg'), 'utf8');
const attributes = (tag) =>
  Object.fromEntries(
    [
      ...svg
        .match(new RegExp(`<${tag}\\b[^>]*>`))[0]
        .matchAll(/([\w-]+)="([^"]*)"/g),
    ].map(([, key, value]) => [key, value]),
  );
const box = attributes('svg').viewBox.split(/\s+/).map(Number);
assert.ok(
  box.length === 4 &&
    box[0] === 0 &&
    box[1] === 0 &&
    box[2] > 0 &&
    box[2] === box[3],
);
const rect = attributes('rect');
const mark = attributes('path');
const draw = `scale ${1024 / box[2]},${1024 / box[3]} fill '${rect.fill}' roundrectangle 0,0 ${rect.width},${rect.height} ${rect.rx},${rect.rx} fill none stroke '${mark.stroke}' stroke-width ${mark['stroke-width']} path '${mark.d}'`;
const temporary = await mkdtemp(path.join(os.tmpdir(), 'ahub-site-icons-'));
const render = (...args) => execFileSync('magick', args, { stdio: 'inherit' });
try {
  const source = path.join(temporary, 'source.png');
  render('-size', '1024x1024', 'xc:none', '-draw', draw, source);
  await mkdir(path.join(publicRoot, 'icons'), { recursive: true });
  for (const [name, size] of [
    ['favicon.png', 96],
    ['apple-touch-icon.png', 180],
    ['icons/icon-192.png', 192],
    ['icons/icon-512.png', 512],
  ]) {
    render(
      source,
      '-resize',
      `${size}x${size}`,
      '-background',
      '#f7f6f2',
      ...(size === 180 ? ['-alpha', 'remove'] : []),
      '-strip',
      '-depth',
      '8',
      '-define',
      'png:compression-level=9',
      path.join(publicRoot, name),
    );
  }
  render(
    source,
    '-define',
    'icon:auto-resize=48,32,16',
    path.join(publicRoot, 'favicon.ico'),
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
