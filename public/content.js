import locale from './locale.js';

export const source = {
  revision: '5438c15a62896fc83d6b191c57effd1ff3a1fb37',
  archive: 'downloads/agent-hub-source-5438c15.zip',
  minimumNode: '22.13',
};

export const commands = locale.commands;
export const scenarios = locale.scenarios;

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}
