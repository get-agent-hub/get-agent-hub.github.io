import locale from './locale.js';

export const source = {
  revision: 'e83651dc192dbc5fa6409bcb58ff3d402441078d',
  archive: 'downloads/agent-hub-source-e83651d.zip',
  minimumNode: '22.13',
};

export const commands = locale.commands;
export const scenarios = locale.scenarios;

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}
