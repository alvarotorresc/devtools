import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function toCamelCase(text: string): string {
  return text
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

export function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

export function countText(text: string): {
  chars: number;
  words: number;
  lines: number;
  bytes: number;
} {
  return {
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split('\n').length,
    bytes: new TextEncoder().encode(text).length,
  };
}

export const textTool: Tool = {
  id: 'text',
  name: 'Text',

  render() {
    return `
      <div class="tool-header">
        <h2>Text Utilities</h2>
        <p>Case conversion, counting, sorting, and more</p>
      </div>
      <div class="tool-section">
        <label>Input</label>
        <textarea id="text-input" rows="8" placeholder="Enter your text here"></textarea>
      </div>
      <div class="tool-section">
        <label>Stats</label>
        <div class="output-box" id="text-stats" style="min-height: 20px"></div>
      </div>
      <div class="tool-section">
        <label>Case conversion</label>
        <div class="btn-row">
          <button class="text-action" data-action="upper">UPPER</button>
          <button class="text-action" data-action="lower">lower</button>
          <button class="text-action" data-action="title">Title Case</button>
          <button class="text-action" data-action="camel">camelCase</button>
          <button class="text-action" data-action="snake">snake_case</button>
          <button class="text-action" data-action="kebab">kebab-case</button>
        </div>
      </div>
      <div class="tool-section">
        <label>Transform</label>
        <div class="btn-row">
          <button class="text-action" data-action="sort">Sort lines</button>
          <button class="text-action" data-action="reverse">Reverse</button>
          <button class="text-action" data-action="dedupe">Remove duplicates</button>
          <button class="text-action" data-action="trim">Trim lines</button>
          <button class="text-action" data-action="remove-empty">Remove empty lines</button>
        </div>
      </div>
      <div class="tool-section">
        <div class="btn-row">
          <button id="text-copy">Copy</button>
        </div>
      </div>
    `;
  },

  init() {
    const input = getInput('text-input') as HTMLTextAreaElement;
    const stats = getElement('text-stats');

    function updateStats() {
      const c = countText(input.value);
      stats.textContent = `${c.chars} chars \u00b7 ${c.words} words \u00b7 ${c.lines} lines \u00b7 ${c.bytes} bytes`;
    }

    input.addEventListener('input', updateStats);
    updateStats();

    const actions: Record<string, (text: string) => string> = {
      upper: (t) => t.toUpperCase(),
      lower: (t) => t.toLowerCase(),
      title: toTitleCase,
      camel: toCamelCase,
      snake: toSnakeCase,
      kebab: toKebabCase,
      sort: (t) => t.split('\n').sort().join('\n'),
      reverse: (t) => t.split('').reverse().join(''),
      dedupe: (t) => [...new Set(t.split('\n'))].join('\n'),
      trim: (t) =>
        t
          .split('\n')
          .map((l) => l.trim())
          .join('\n'),
      'remove-empty': (t) =>
        t
          .split('\n')
          .filter((l) => l.trim())
          .join('\n'),
    };

    document.querySelectorAll('.text-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = (btn as HTMLElement).dataset.action!;
        if (actions[action]) {
          input.value = actions[action](input.value);
          updateStats();
        }
      });
    });

    getElement('text-copy').addEventListener('click', (e) => {
      copyToClipboard(input.value, e.currentTarget as HTMLElement);
    });
  },
};
