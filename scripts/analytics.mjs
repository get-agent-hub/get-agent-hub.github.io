import { readFile, writeFile } from 'node:fs/promises';
import { escapeHtml } from './render.mjs';
import { useCases } from './use-cases.mjs';

export async function addAnalytics(
  output,
  locale,
  path,
  origin,
  rootBase = '',
) {
  const page = !path
    ? 'home'
    : path === 'docs/quickstart/'
      ? 'quickstart'
      : path.startsWith('docs/')
        ? 'docs'
        : useCases.find((item) => path === item.slug + '/')?.key;
  if (!page) throw new Error('Unreviewed analytics page group.');
  const copy = locale.analytics;
  const assetBase =
    rootBase + '../'.repeat(path.split('/').filter(Boolean).length);
  const markup = `<section class="analytics-settings wrap" data-website-analytics data-page="${page}" data-origin="${escapeHtml(origin)}" data-endpoint="https://metrics.getahub.dev/v1/events">
    <details><summary>${escapeHtml(copy.title)}</summary><p>${escapeHtml(copy.details)}</p>
    <label><input type="checkbox" data-analytics-enabled disabled> ${escapeHtml(copy.label)}</label>
    <p data-analytics-status role="status" data-on="${escapeHtml(copy.on)}" data-off="${escapeHtml(copy.off)}" data-blocked="${escapeHtml(copy.blocked)}"></p></details>
  </section><script type="module" src="${assetBase}analytics.js"></script>`;
  const file = new URL(path + 'index.html', output);
  await writeFile(
    file,
    (await readFile(file, 'utf8')).replace('</body>', markup + '\n</body>'),
  );
}
