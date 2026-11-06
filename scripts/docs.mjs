import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { markdownToHtml } from './markdown.mjs';
import { escapeHtml, render } from './render.mjs';

export const docsGroups = [
  {
    id: 'getStarted',
    pages: [
      { slug: 'overview', file: 'overview.md', label: 'overview' },
      { slug: 'quickstart', file: 'QUICKSTART.md', label: 'quickstart' },
      { slug: 'design', file: 'DESIGN.md', label: 'design' },
    ],
  },
  {
    id: 'tasks',
    pages: [
      { slug: 'search-chats', file: 'SEARCH_CHATS.md', label: 'searchChats' },
      { slug: 'share-mcp', file: 'SHARE_MCP.md', label: 'shareMcp' },
      {
        slug: 'continue-in-another-client',
        file: 'CONTINUE_CHAT.md',
        label: 'continueChat',
      },
      {
        slug: 'preserve-chat-history',
        file: 'PRESERVE_HISTORY.md',
        label: 'preserveHistory',
      },
      {
        slug: 'share-skills-and-instructions',
        file: 'SHARE_SKILLS.md',
        label: 'shareSkills',
      },
      {
        slug: 'agent-hub-vs-hansard',
        file: 'HANSARD.md',
        label: 'hansard',
      },
    ],
  },
  {
    id: 'guides',
    pages: [
      {
        slug: 'working-guide',
        file: 'WORKING_GUIDE.md',
        label: 'workingGuide',
      },
      { slug: 'cli', file: 'CLI.md', label: 'cli' },
      { slug: 'content', file: 'CONTENT.md', label: 'content' },
      { slug: 'memory', file: 'MEMORY.md', label: 'memory' },
      { slug: 'automation', file: 'AUTOMATION.md', label: 'automation' },
      { slug: 'ui', file: 'UI.md', label: 'ui' },
      { slug: 'history', file: 'HISTORY.md', label: 'history' },
    ],
  },
  {
    id: 'operations',
    pages: [
      { slug: 'release', file: 'RELEASE.md', label: 'release' },
      { slug: 'recovery', file: 'RECOVERY.md', label: 'recovery' },
      { slug: 'migrations', file: 'MIGRATIONS.md', label: 'migrations' },
      { slug: 'edge-cases', file: 'EDGE_CASES.md', label: 'edgeCases' },
      { slug: 'qa', file: 'QA.md', label: 'qa' },
    ],
  },
  {
    id: 'project',
    pages: [
      { slug: 'code-review', file: 'CODE_REVIEW.md', label: 'codeReview' },
      { slug: 'research', file: 'RESEARCH.md', label: 'research' },
      {
        slug: 'usecases-and-demand',
        file: 'usecases-and-demand.md',
        label: 'usecases',
      },
    ],
  },
];

export const docsPages = docsGroups.flatMap((group) =>
  group.pages.map((page) => ({ ...page, group: group.id })),
);

const fileToSlug = new Map(docsPages.map((page) => [page.file, page.slug]));

const pageUrl = (base, slug) =>
  slug === 'overview' ? `${base}docs/` : `${base}docs/${slug}/`;

const resolveLink = (base) => (label, href) => {
  const text = escapeHtml(label);
  if (/^https?:\/\//i.test(href))
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${text}</a>`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return text;
  const [file, anchor] = href.split('#');
  const slug = fileToSlug.get(file.split('/').pop());
  if (file && !slug) return text;
  const target = file ? pageUrl(base, slug) : '';
  const fragment = anchor ? `#${anchor}` : '';
  return `<a href="${target}${fragment}">${text}</a>`;
};

const buildNav = (locale, base, current) =>
  docsGroups
    .map((group) => {
      const links = group.pages
        .map((page) => {
          const label = escapeHtml(locale.docs.pages[page.label]);
          const currentAttr =
            page.slug === current ? ' aria-current="page" class="active"' : '';
          return `<a href="${pageUrl(base, page.slug)}"${currentAttr}>${label}</a>`;
        })
        .join('');
      return `<div class="docs-nav-group"><p>${escapeHtml(locale.docs.groups[group.id])}</p>${links}</div>`;
    })
    .join('');

const buildToc = (headings) =>
  headings
    .filter((heading) => heading.level === 2)
    .map(
      (heading) =>
        `<a href="#${heading.id}">${escapeHtml(heading.text.replace(/`/g, ''))}</a>`,
    )
    .join('');

const buildPager = (locale, base, current) => {
  const index = docsPages.findIndex((page) => page.slug === current);
  const link = (page, key, className) =>
    page
      ? `<a class="${className}" href="${pageUrl(base, page.slug)}"><span>${escapeHtml(locale.docs[key])}</span>${escapeHtml(locale.docs.pages[page.label])}</a>`
      : '<span></span>';
  return (
    link(docsPages[index - 1], 'previous', 'pager-prev') +
    link(docsPages[index + 1], 'next', 'pager-next')
  );
};

export async function buildDocs(
  locale,
  languageSwitcher = () => '',
  outputRoot = new URL('../dist/', import.meta.url),
  reference = locale,
  metadata = () => '',
) {
  const template = await readFile(
    new URL('../src/docs.html', import.meta.url),
    'utf8',
  );
  const written = [];
  for (const page of docsPages) {
    const base = page.slug === 'overview' ? '../' : '../../';
    const markdown = locale.docs.content[page.label];
    const { html, headings } = markdownToHtml(
      markdown,
      resolveLink(base),
      reference.docs.content[page.label],
    );
    const output = render(template, locale, {
      base,
      languageSwitcher: languageSwitcher(base, page.slug),
      pageTitle: escapeHtml(locale.docs.pages[page.label]),
      pageDescription: escapeHtml(
        locale.docs.descriptions?.[page.label] ?? locale.docs.metaDescription,
      ),
      pageMetadata: metadata(
        page.slug === 'overview' ? 'docs/' : `docs/${page.slug}/`,
        `${locale.docs.pages[page.label]} · ${locale.brand.name}`,
        locale.docs.descriptions?.[page.label] ?? locale.docs.metaDescription,
      ),
      docsNav: buildNav(locale, base, page.slug),
      docsContent: html,
      docsToc: buildToc(headings),
      docsPager: buildPager(locale, base, page.slug),
    });
    const directory = new URL(
      page.slug === 'overview' ? 'docs/' : `docs/${page.slug}/`,
      outputRoot,
    );
    await mkdir(directory, { recursive: true });
    const target = new URL('index.html', directory);
    await writeFile(target, output);
    written.push(page.slug);
  }
  return written;
}
