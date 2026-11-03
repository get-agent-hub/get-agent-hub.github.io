import { readFile, writeFile } from 'node:fs/promises';
import { docsPages } from './docs.mjs';

// Markdown snapshots stay convenient to review; all rendered copy is locale-owned.
const file = new URL('../locales/en.json', import.meta.url);
const locale = JSON.parse(await readFile(file, 'utf8'));
locale.docs.content = Object.fromEntries(
  await Promise.all(
    docsPages.map(async (page) => [
      page.label,
      await readFile(new URL(`../docs/${page.file}`, import.meta.url), 'utf8'),
    ]),
  ),
);
await writeFile(file, JSON.stringify(locale, null, 2) + '\n');
console.log(
  `Updated English locale with ${docsPages.length} documentation pages.`,
);
