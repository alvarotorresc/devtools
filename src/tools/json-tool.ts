import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

export function formatJSON(input: string, spaces: number = 2): string {
  return JSON.stringify(JSON.parse(input), null, spaces);
}

export function minifyJSON(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

export function validateJSON(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export const jsonTool: Tool = {
  id: 'json',
  name: 'JSON',

  render() {
    return `
      <div class="tool-header">
        <h2>JSON Formatter</h2>
        <p>Format, minify, and validate JSON</p>
      </div>
      <div class="tool-section">
        <label>Input</label>
        <textarea id="json-input" rows="12" placeholder='{"key": "value"}'></textarea>
      </div>
      <div class="tool-section">
        <div class="btn-row">
          <button id="json-format" class="primary">Format</button>
          <button id="json-minify">Minify</button>
          <button id="json-validate">Validate</button>
          <button id="json-copy">Copy output</button>
        </div>
      </div>
      <div class="tool-section">
        <label>Output</label>
        <div class="output-box" id="json-output" style="min-height: 120px"></div>
      </div>
    `;
  },

  init() {
    const input = getInput('json-input') as HTMLTextAreaElement;
    const output = getElement('json-output');

    getElement('json-format').addEventListener('click', () => {
      try {
        output.textContent = formatJSON(input.value);
        output.className = 'output-box';
      } catch (e) {
        output.textContent = (e as Error).message;
        output.className = 'output-box error';
      }
    });

    getElement('json-minify').addEventListener('click', () => {
      try {
        output.textContent = minifyJSON(input.value);
        output.className = 'output-box';
      } catch (e) {
        output.textContent = (e as Error).message;
        output.className = 'output-box error';
      }
    });

    getElement('json-validate').addEventListener('click', () => {
      const result = validateJSON(input.value);
      if (result.valid) {
        output.textContent = 'Valid JSON';
        output.className = 'output-box success';
      } else {
        output.textContent = result.error || 'Invalid JSON';
        output.className = 'output-box error';
      }
    });

    getElement('json-copy').addEventListener('click', (e) => {
      copyToClipboard(output.textContent || '', e.currentTarget as HTMLElement);
    });
  },
};
