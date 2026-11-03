import locale from './locale.js';

export const source = {
  revision: 'd66ea3ec033b53a6bf0e08694e5f8634f7594a4d',
  archive: 'downloads/agent-hub-source-d66ea3e.zip',
  minimumNode: '22.13',
};

export const commands = locale.commands;
export const scenarios = locale.scenarios;

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}
