import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

export function convertBase(value: string, fromBase: number): Record<string, string> | null {
  const num = parseInt(value, fromBase);
  if (isNaN(num)) return null;
  return {
    Binary: num.toString(2),
    Octal: num.toString(8),
    Decimal: num.toString(10),
    Hex: num.toString(16).toUpperCase(),
  };
}

export const numberBaseTool: Tool = {
  id: 'number-base',
  name: 'Number Base',

  render() {
    return `
      <div class="tool-header">
        <h2>Number Base Converter</h2>
        <p>Convert between binary, octal, decimal, and hexadecimal</p>
      </div>
      <div class="tool-section">
        <label>Input</label>
        <div class="inline-row">
          <input type="text" id="base-input" placeholder="255" />
          <select id="base-from" style="width: 140px">
            <option value="10">Decimal</option>
            <option value="2">Binary</option>
            <option value="8">Octal</option>
            <option value="16">Hexadecimal</option>
          </select>
        </div>
      </div>
      <div id="base-results"></div>
    `;
  },

  init() {
    function convert() {
      const value = getInput('base-input').value.trim();
      const fromBase = parseInt((getElement('base-from') as HTMLSelectElement).value);
      const results = getElement('base-results');

      if (!value) {
        results.innerHTML = '';
        return;
      }

      const converted = convertBase(value, fromBase);
      if (!converted) {
        results.innerHTML = '<div class="output-box error">Invalid number for selected base</div>';
        return;
      }

      results.innerHTML = Object.entries(converted)
        .map(
          ([name, val]) => `
          <div class="result-item">
            <div>
              <div class="label">${name}</div>
              <div class="value">${val}</div>
            </div>
            <button class="base-copy" data-value="${val}">Copy</button>
          </div>
        `,
        )
        .join('');

      results.querySelectorAll('.base-copy').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const el = e.currentTarget as HTMLElement;
          copyToClipboard(el.dataset.value || '', el);
        });
      });
    }

    getInput('base-input').addEventListener('input', convert);
    (getElement('base-from') as HTMLSelectElement).addEventListener('change', convert);
  },
};
