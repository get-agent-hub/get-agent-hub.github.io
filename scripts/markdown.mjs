import { escapeHtml } from './render.mjs';

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[`*[\]]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

const slugger = () => {
  const seen = new Map();
  return (text) => {
    const base = slugify(text) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
};

const inlineSegment = (text, resolveLink) =>
  text
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) =>
      resolveLink(label, href),
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>');

const inline = (source, resolveLink) =>
  escapeHtml(source)
    .split(/`([^`]+)`/)
    .map((segment, index) =>
      index % 2 === 1
        ? `<code>${segment}</code>`
        : inlineSegment(segment, resolveLink),
    )
    .join('');

const isFence = (line) => /^```/.test(line);
const isTableLine = (line) => /^\s*\|/.test(line);
const isTableDivider = (line) => /^\s*\|[\s:|-]+\|\s*$/.test(line);
const listItem = (line) => line.match(/^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/);

function parseList(lines, start, resolveLink) {
  const items = [];
  let index = start;
  while (index < lines.length) {
    const match = listItem(lines[index]);
    if (!match) break;
    items.push({
      indent: match[1].length,
      text: match[2],
      ordered: /^\d/.test(lines[index].trim()),
    });
    index += 1;
  }
  const build = (from, indent) => {
    const nodes = [];
    let cursor = from;
    while (cursor < items.length && items[cursor].indent >= indent) {
      if (items[cursor].indent > indent) {
        const [child, next] = build(cursor, items[cursor].indent);
        nodes[nodes.length - 1] += child;
        cursor = next;
        continue;
      }
      nodes.push(inline(items[cursor].text, resolveLink));
      cursor += 1;
    }
    const tag = items[from].ordered ? 'ol' : 'ul';
    const listHtml = `<${tag}>${nodes.map((node) => `<li>${node}</li>`).join('')}</${tag}>`;
    return [listHtml, cursor];
  };
  const [listHtml, consumed] = build(0, items[0].indent);
  return [listHtml, start + consumed];
}

export function markdownToHtml(source, resolveLink) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const nextSlug = slugger();
  const headings = [];
  const html = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (isFence(line)) {
      const language = line.slice(3).trim();
      const body = [];
      index += 1;
      while (index < lines.length && !isFence(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      const className = language
        ? ` class="language-${escapeHtml(language)}"`
        : '';
      html.push(
        `<pre><code${className}>${escapeHtml(body.join('\n'))}</code></pre>`,
      );
      continue;
    }

    if (/^( {4}|\t)/.test(line)) {
      const body = [];
      while (index < lines.length) {
        const current = lines[index];
        if (/^( {4}|\t)/.test(current)) {
          body.push(current.replace(/^( {4}|\t)/, ''));
          index += 1;
        } else if (
          !current.trim() &&
          /^( {4}|\t)/.test(lines[index + 1] ?? '')
        ) {
          body.push('');
          index += 1;
        } else break;
      }
      html.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const content = inline(heading[2].trim(), resolveLink);
      const id = nextSlug(heading[2].trim());
      if (level > 1) headings.push({ level, id, text: heading[2].trim() });
      html.push(`<h${level} id="${id}">${content}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*(?:---|\*\*\*|___)\s*$/.test(line)) {
      html.push('<hr />');
      index += 1;
      continue;
    }

    if (isTableLine(line) && isTableDivider(lines[index + 1] ?? '')) {
      const row = (value) =>
        value
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim());
      const header = row(line);
      const rows = [];
      index += 2;
      while (index < lines.length && isTableLine(lines[index])) {
        rows.push(row(lines[index]));
        index += 1;
      }
      const head = header
        .map((cell) => `<th>${inline(cell, resolveLink)}</th>`)
        .join('');
      const body = rows
        .map(
          (cells) =>
            `<tr>${cells.map((cell) => `<td>${inline(cell, resolveLink)}</td>`).join('')}</tr>`,
        )
        .join('');
      html.push(
        `<div class="table-scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`,
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const body = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        body.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      html.push(
        `<blockquote><p>${inline(body.join(' '), resolveLink)}</p></blockquote>`,
      );
      continue;
    }

    if (listItem(line)) {
      const [listHtml, next] = parseList(lines, index, resolveLink);
      html.push(listHtml);
      index = next;
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !isFence(lines[index]) &&
      !/^(#{1,6})\s/.test(lines[index]) &&
      !/^( {4}|\t)/.test(lines[index]) &&
      !/^>\s?/.test(lines[index]) &&
      !listItem(lines[index]) &&
      !(isTableLine(lines[index]) && isTableDivider(lines[index + 1] ?? '')) &&
      !/^\s*(?:---|\*\*\*|___)\s*$/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${inline(paragraph.join(' '), resolveLink)}</p>`);
  }

  return { html: html.join('\n'), headings };
}
