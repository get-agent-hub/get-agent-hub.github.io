import locale from './locale.js';

export const source = {
  revision: 'e71a518bbb93f7a214d692ac59f6b0578dc807e4',
  archive: 'downloads/agent-hub-source-e71a518.zip',
  minimumNode: '22.13',
};

export const commands = locale.commands;
export const scenarios = locale.scenarios;

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}
