import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { readLocales } from './locales.mjs';
import { render } from './render.mjs';

const config = JSON.parse(
  await readFile(new URL('../site.config.json', import.meta.url), 'utf8'),
);
const locales = await readLocales();
const locale = locales.get(config.locale);
if (!locale) throw new Error(`Unavailable locale: ${config.locale}`);
const template = await readFile(
  new URL('../src/index.html', import.meta.url),
  'utf8',
);
const html = render(template, locale);

await rm(new URL('../dist/', import.meta.url), {
  recursive: true,
  force: true,
});
await mkdir(new URL('../dist/', import.meta.url));
await cp(
  new URL('../public/', import.meta.url),
  new URL('../dist/', import.meta.url),
  { recursive: true },
);
await writeFile(new URL('../dist/index.html', import.meta.url), html);
await writeFile(
  new URL('../dist/locale.js', import.meta.url),
  `export default ${JSON.stringify(locale)};\n`,
);
console.log('Static site ready in dist/');
