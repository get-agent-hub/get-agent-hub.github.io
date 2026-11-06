import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { escapeHtml, render } from './render.mjs';

export const useCases = [
  {
    slug: 'claude-code-codex-chat-history',
    key: 'history',
    guide: 'search-chats',
    image: 'hub-chat.png',
    featured: true,
    related: ['backup', 'export', 'toolSearch'],
  },
  {
    slug: 'continue-claude-code-in-codex',
    key: 'handoff',
    guide: 'continue-in-another-client',
    image: 'hub-handoff.png',
    featured: true,
    related: ['history', 'memory', 'export'],
  },
  {
    slug: 'share-mcp-config',
    key: 'mcp',
    guide: 'share-mcp',
    image: 'hub-overview.png',
    featured: true,
    related: ['mcpConflicts', 'recovery', 'instructions'],
  },
  {
    slug: 'share-agent-skills',
    key: 'skills',
    guide: 'share-skills-and-instructions',
    image: 'hub-overview.png',
    featured: true,
    related: ['instructions', 'memory', 'nativeMemory'],
  },
  {
    slug: 'agent-hub-vs-hansard',
    key: 'comparison',
    guide: 'agent-hub-vs-hansard',
    image: 'hub-archive.png',
    featured: true,
    related: ['history', 'handoff', 'mcp'],
  },
  {
    slug: 'local-ai-chat-backup',
    key: 'backup',
    guide: 'preserve-chat-history',
    image: 'hub-archive.png',
    analyticsPage: 'history',
    related: ['background', 'export', 'history'],
  },
  {
    slug: 'export-ai-chat-history',
    key: 'export',
    guide: 'search-chats',
    image: 'hub-chat.png',
    analyticsPage: 'history',
    related: ['handoff', 'backup', 'toolSearch'],
  },
  {
    slug: 'search-ai-tool-results',
    key: 'toolSearch',
    guide: 'search-chats',
    image: 'hub-chat.png',
    analyticsPage: 'history',
    related: ['history', 'export', 'projects'],
  },
  {
    slug: 'organize-ai-coding-projects',
    key: 'projects',
    guide: 'history',
    image: 'hub-overview.png',
    analyticsPage: 'docs',
    related: ['memory', 'history', 'recovery'],
  },
  {
    slug: 'share-project-memory',
    key: 'memory',
    guide: 'memory',
    image: 'hub-overview.png',
    analyticsPage: 'docs',
    related: ['nativeMemory', 'instructions', 'handoff'],
  },
  {
    slug: 'import-agent-memory',
    key: 'nativeMemory',
    guide: 'memory',
    image: 'hub-overview.png',
    analyticsPage: 'docs',
    related: ['memory', 'projects', 'recovery'],
  },
  {
    slug: 'sync-ai-agent-instructions',
    key: 'instructions',
    guide: 'share-skills-and-instructions',
    image: 'hub-overview.png',
    analyticsPage: 'skills',
    related: ['skills', 'mcp', 'memory'],
  },
  {
    slug: 'resolve-mcp-config-conflicts',
    key: 'mcpConflicts',
    guide: 'share-mcp',
    image: 'hub-overview.png',
    analyticsPage: 'mcp',
    related: ['mcp', 'recovery', 'instructions'],
  },
  {
    slug: 'restore-ai-agent-settings',
    key: 'recovery',
    guide: 'recovery',
    image: 'hub-overview.png',
    analyticsPage: 'docs',
    related: ['mcpConflicts', 'backup', 'mcp'],
  },
  {
    slug: 'automatic-chat-history-backup',
    key: 'background',
    guide: 'preserve-chat-history',
    image: 'hub-archive.png',
    analyticsPage: 'history',
    related: ['backup', 'history', 'projects'],
  },
];

export function useCaseLinks(locale, base = '', exclude, pages = useCases) {
  return pages
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
        pageMetadata: metadata(
          `${page.slug}/`,
          copy.title,
          copy.description,
          copy.cardTitle,
        ),
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
        related: useCaseLinks(
          locale,
          '../',
          page.key,
          useCases.filter((other) => page.related.includes(other.key)),
        ),
      },
    );
    const directory = new URL(`${page.slug}/`, output);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL('index.html', directory), html);
  }
}
