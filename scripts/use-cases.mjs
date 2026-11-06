import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { escapeHtml, render } from './render.mjs';

export const useCases = [
  {
    slug: 'claude-code-codex-chat-history',
    key: 'history',
    guide: 'search-chats',
    image: 'hub-chat.png',
  },
  {
    slug: 'continue-claude-code-in-codex',
    key: 'handoff',
    guide: 'continue-in-another-client',
    image: 'hub-handoff.png',
  },
  {
    slug: 'share-mcp-config',
    key: 'mcp',
    guide: 'share-mcp',
    image: 'hub-overview.png',
  },
  {
    slug: 'share-agent-skills',
    key: 'skills',
    guide: 'share-skills-and-instructions',
    image: 'hub-overview.png',
  },
  {
    slug: 'agent-hub-vs-hansard',
    key: 'comparison',
    guide: 'agent-hub-vs-hansard',
    image: 'hub-archive.png',
  },
];

export function useCaseLinks(locale, base = '', exclude) {
  return useCases
    .filter((page) => page.key !== exclude)
    .map((page) => {
      const copy = locale.useCases.pages[page.key];
      return `<a class="use-case-card" href="${base}${page.slug}/"><h3>${escapeHtml(copy.cardTitle)}</h3><p>${escapeHtml(copy.cardBody)}</p><span aria-hidden="true">↗</span></a>`;
    })
    .join('');
}

export async function buildUseCases(
  locale,
  output,
  switcher,
  metadata,
  assetBase,
) {
  const template = await readFile(
    new URL('../src/use-case.html', import.meta.url),
    'utf8',
  );
  for (const page of useCases) {
    const copy = locale.useCases.pages[page.key];
    const sections = (values) =>
      values
        .map(
          (item) =>
            `<li><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></li>`,
        )
        .join('');
    const html = render(
      template,
      { ...locale, useCase: copy },
      {
        pageMetadata: metadata(`${page.slug}/`, copy.title, copy.description),
        languageSwitcher: switcher(`${page.slug}/`),
        guideUrl: `../docs/${page.guide}/`,
        imageUrl: `${assetBase}images/${page.image}`,
        benefits: sections(copy.benefits),
        steps: sections(copy.steps),
        questions: copy.questions
          .map(
            (item) =>
              `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`,
          )
          .join(''),
        related: useCaseLinks(locale, '../', page.key),
      },
    );
    const directory = new URL(`${page.slug}/`, output);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL('index.html', directory), html);
  }
}
