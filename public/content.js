import locale from './locale.js';

export const source = {
  revision: '239a8940e9ae0561b1650e04e4170a47ff5524d5',
  archive: 'downloads/agent-hub-source-239a894.zip',
  minimumNode: '22.13',
};

export const commands = locale.commands;
export const scenarios = locale.scenarios;

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}
