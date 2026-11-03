import locale from './locale.js';

export const source = {
  revision: 'dbeff7f95fcba85ebbad0f2f3251bb221462ce99',
  archive: 'downloads/agent-hub-source-dbeff7f.zip',
  minimumNode: '22.13',
};

export const commands = locale.commands;
export const scenarios = locale.scenarios;

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}
