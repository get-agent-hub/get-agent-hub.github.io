export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  );

export function render(template, locale) {
  const text = escapeHtml;
  const list = (values) =>
    values.map((value) => `<li>${text(value)}</li>`).join('');
  const slots = {
    flow: locale.overview.steps
      .map(
        (step, index) =>
          `<article><span class="step-number">0${index + 1}</span><h3>${text(step.title)}</h3><p>${text(step.body)}</p><small>${text(step.note)}</small></article>`,
      )
      .join(''),
    quickstart: locale.start.steps
      .map(
        (step) =>
          `<article><span class="quick-num">${text(step.number)}</span><div><h3>${text(step.title)}</h3>${step.intro ? `<p>${text(step.intro)}</p>` : ''}<pre><code>${text(step.code)}</code></pre><small>${text(step.note)}</small></div></article>`,
      )
      .join(''),
    restorePoints: list(locale.recovery.restorePoints),
    resetPoints: list(locale.recovery.resetPoints),
    recoveryDetails: locale.recovery.details
      .map((value) => `<p>${text(value)}</p>`)
      .join(''),
    scopeHeaders: locale.scope.headers
      .map((value) => `<th scope="col">${text(value)}</th>`)
      .join(''),
    scopeRows: locale.scope.rows
      .map(
        (row) =>
          `<tr><th scope="row">${text(row.name)}</th><td><span class="state ${text(row.kind)}">${text(row.state)}</span></td><td>${text(row.detail)}</td></tr>`,
      )
      .join(''),
    faq: locale.faq.items
      .map(
        (item) =>
          `<details><summary>${text(item.question)}</summary><p>${text(item.answer)}</p></details>`,
      )
      .join(''),
  };
  return template.replace(
    /\{\{\{([\w]+)\}\}\}|\{\{([\w.]+)\}\}/g,
    (_, slot, path) => {
      if (slot) {
        if (!(slot in slots)) throw new Error(`Unknown template slot: ${slot}`);
        return slots[slot];
      }
      const value = path
        .split('.')
        .reduce((object, key) => object?.[key], locale);
      if (typeof value !== 'string')
        throw new Error(`Missing template translation: ${path}`);
      return text(value);
    },
  );
}
