import { readFile, readdir } from 'node:fs/promises';

export function validateLocale(reference, candidate, path = '') {
  if (typeof reference === 'string') {
    if (
      typeof candidate !== 'string' ||
      (reference.length > 0 && !candidate.trim())
    )
      throw new Error(`Missing translation: ${path}`);
    return;
  }
  if (Array.isArray(reference)) {
    if (!Array.isArray(candidate) || candidate.length !== reference.length)
      throw new Error(`Array shape mismatch: ${path}`);
    reference.forEach((value, index) =>
      validateLocale(value, candidate[index], `${path}[${index}]`),
    );
    return;
  }
  if (reference && typeof reference === 'object') {
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      Array.isArray(candidate) ||
      Object.keys(reference).sort().join('|') !==
        Object.keys(candidate).sort().join('|')
    )
      throw new Error(`Translation keys mismatch: ${path || 'root'}`);
    for (const key of Object.keys(reference))
      validateLocale(
        reference[key],
        candidate[key],
        path ? `${path}.${key}` : key,
      );
    return;
  }
  if (reference !== candidate)
    throw new Error(`Structural value mismatch: ${path}`);
}

export function validateTechnicalValues(reference, candidate) {
  const groups = [
    ['commands', ['id', 'name', 'command']],
    ['scenarios', ['id', 'command']],
  ];
  for (const [group, keys] of groups)
    for (let index = 0; index < reference[group].length; index++)
      for (const key of keys) {
        if (reference[group][index][key] !== candidate[group][index][key])
          throw new Error(
            `Do not translate technical syntax: ${group}[${index}].${key}`,
          );
      }
  reference.start.steps.forEach((step, index) => {
    if (step.code !== candidate.start.steps[index].code)
      throw new Error(`Do not translate code: start.steps[${index}]`);
  });
  for (const [page, markdown] of Object.entries(reference.docs.content)) {
    const code = (value) => value.match(/```[\s\S]*?```|`[^`\n]+`/g) ?? [];
    if (
      JSON.stringify(code(markdown)) !==
      JSON.stringify(code(candidate.docs.content[page]))
    )
      throw new Error(
        `Do not translate documentation code: docs.content.${page}`,
      );
  }
  reference.scope.rows.forEach((row, index) => {
    if (row.kind !== candidate.scope.rows[index].kind)
      throw new Error(`Do not translate status keys: scope.rows[${index}]`);
  });
  if (!/^[a-z]{2}(?:-[A-Za-z]{2,8})?$/.test(candidate.language))
    throw new Error('Invalid language tag');
  if (!candidate.ui.copyLabel.includes('{name}'))
    throw new Error('Keep the {name} interpolation in ui.copyLabel');
}

export async function readLocales() {
  const directory = new URL('../locales/', import.meta.url);
  const reference = JSON.parse(
    await readFile(new URL('en.json', directory), 'utf8'),
  );
  const locales = new Map();
  for (const filename of await readdir(directory)) {
    if (!filename.endsWith('.json')) continue;
    const candidate = JSON.parse(
      await readFile(new URL(filename, directory), 'utf8'),
    );
    validateLocale(reference, candidate);
    validateTechnicalValues(reference, candidate);
    if (filename !== `${candidate.language}.json`)
      throw new Error(`Locale filename mismatch: ${filename}`);
    locales.set(candidate.language, candidate);
  }
  return locales;
}
