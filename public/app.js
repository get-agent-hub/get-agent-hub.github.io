import { commands, scenarios, getScenario } from './content.js';
import locale from './locale.js';

const messages = locale.ui;

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function showScenario(id) {
  const scenario = getScenario(id);
  document.querySelector('#demo-command').textContent = scenario.command;
  document.querySelector('#demo-output').textContent =
    scenario.lines.join('\n');
  const explanation = document.querySelector('#demo-explanation');
  explanation.replaceChildren(
    element('strong', '', scenario.title),
    element('p', '', scenario.explanation),
  );
  for (const button of document.querySelectorAll('[data-scenario]')) {
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.scenario === scenario.id),
    );
  }
}

let statusTimer;
async function copyCommand(command) {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(command);
    status.textContent = messages.copied;
    if (command.includes('npm run install:global'))
      document.dispatchEvent(new Event('ahub-install-command-copied'));
  } catch {
    status.textContent = messages.copyFallback;
  }
  status.classList.add('visible');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove('visible'), 3000);
}

function showCommand(id) {
  const command = commands.find((item) => item.id === id) ?? commands[0];
  const detail = document.querySelector('#command-detail');
  const block = element('div', 'code-block');
  block.append(element('code', '', command.command));
  if (!command.template) {
    const copy = element('button', 'copy-button', messages.copy);
    copy.type = 'button';
    copy.setAttribute(
      'aria-label',
      messages.copyLabel.replace('{name}', command.name),
    );
    copy.addEventListener('click', () => copyCommand(command.command));
    block.append(copy);
  }
  const facts = element('dl', 'command-facts');
  for (const [title, value] of [
    [messages.audience, command.audience],
    [messages.reads, command.reads],
    [messages.writes, command.writes],
  ]) {
    const group = element('div');
    group.append(element('dt', '', title), element('dd', '', value));
    facts.append(group);
  }
  const result = element('div', 'command-result');
  result.append(
    element('strong', '', messages.result),
    element('p', '', command.result),
  );
  const technical = element('details', 'deep-detail');
  technical.append(
    element('summary', '', messages.details),
    element('p', '', command.detail),
  );
  detail.replaceChildren(
    element('span', 'command-badge', command.badge),
    element('h3', '', command.title),
    element('p', '', command.description),
    block,
    facts,
    result,
    technical,
  );
  for (const button of document.querySelectorAll('[data-command]')) {
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.command === command.id),
    );
  }
}

for (const scenario of scenarios) {
  const button = element('button', '', scenario.label);
  button.type = 'button';
  button.dataset.scenario = scenario.id;
  button.setAttribute('aria-controls', 'demo-explanation');
  button.addEventListener('click', () => showScenario(scenario.id));
  document.querySelector('#scenario-tabs').append(button);
}
function showCommandLevel(level) {
  const navigation = document.querySelector('#command-nav');
  navigation.replaceChildren();
  const selected = commands.filter((command) => command.level === level);
  for (const command of selected) {
    const button = element('button', '', command.name);
    button.type = 'button';
    button.dataset.command = command.id;
    button.setAttribute('aria-controls', 'command-detail');
    button.append(element('span', '', command.group));
    button.addEventListener('click', () => showCommand(command.id));
    navigation.append(button);
  }
  showCommand(selected[0].id);
}
document
  .querySelector('#command-level')
  .addEventListener('change', (event) => showCommandLevel(event.target.value));

showCommandLevel('everyday');

showScenario('quick');

for (const button of document.querySelectorAll('[data-install-copy]')) {
  button.addEventListener('click', () => {
    const command =
      button.previousElementSibling.querySelector('code').textContent;
    void copyCommand(command);
  });
}
