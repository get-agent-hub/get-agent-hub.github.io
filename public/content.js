import locale from './locale.js';

export const source = {
  revision: '1fdcb4b7e2b0561083dce3976aa3a134a0c00b02',
  archive: 'downloads/agent-hub-source-1fdcb4b.zip',
  minimumNode: '22.13',
};

export const commands = locale.commands;
export const scenarios = locale.scenarios;

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}
