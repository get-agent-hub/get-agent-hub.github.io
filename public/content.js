import locale from './locale.js';

export const source = {
  revision: 'ad311136236e0a7872c266d6323902a178d7d2be',
  archive: 'downloads/agent-hub-source-ad31113.zip',
  minimumNode: '22.13',
};

export const commands = locale.commands;
export const scenarios = locale.scenarios;

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}
