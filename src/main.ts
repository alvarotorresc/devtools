import { tools } from './registry';
import type { Tool } from './types';
import './style.css';

let activeTool: Tool = tools[0];

function renderNav(): void {
  const nav = document.getElementById('nav')!;
  nav.innerHTML = tools
    .map(
      (t) =>
        `<button class="nav-item${t.id === activeTool.id ? ' active' : ''}" data-tool="${t.id}">${t.name}</button>`,
    )
    .join('');
}

function renderTool(): void {
  const content = document.getElementById('tool-content')!;
  content.innerHTML = activeTool.render();
  activeTool.init();
}

function switchTool(id: string): void {
  const tool = tools.find((t) => t.id === id);
  if (!tool || tool.id === activeTool.id) return;
  activeTool.destroy?.();
  activeTool = tool;
  window.location.hash = id;
  renderNav();
  renderTool();
}

const hash = window.location.hash.slice(1);
const initial = tools.find((t) => t.id === hash);
if (initial) activeTool = initial;

renderNav();
renderTool();

document.getElementById('nav')!.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('[data-tool]') as HTMLElement | null;
  if (btn?.dataset.tool) switchTool(btn.dataset.tool);
});

window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  if (id) switchTool(id);
});
