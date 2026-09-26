import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function validateUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function formatUUID(uuid: string, withDashes: boolean): string {
  const clean = uuid.replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/i.test(clean)) return uuid;
  if (withDashes) {
    return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
  }
  return clean;
}

export const uuidTool: Tool = {
  id: 'uuid',
  name: 'UUID',

  render() {
    return `
      <div class="tool-header">
        <h2>UUID Generator</h2>
        <p>Generate and validate UUIDs (v4)</p>
      </div>
      <div class="tool-section">
        <label>Generate</label>
        <div class="inline-row">
          <input type="number" id="uuid-count" value="1" min="1" max="100" style="width: 80px" />
          <button id="uuid-generate" class="primary">Generate</button>
        </div>
      </div>
      <div class="tool-section">
        <label>Result</label>
        <div class="output-box" id="uuid-output"></div>
        <div class="btn-row" style="margin-top: 8px">
          <button id="uuid-copy">Copy</button>
          <button id="uuid-dashes">Remove dashes</button>
          <button id="uuid-upper">Uppercase</button>
        </div>
      </div>
      <div class="tool-section">
        <label>Validate</label>
        <div class="inline-row">
          <input type="text" id="uuid-validate-input" placeholder="Paste a UUID to validate" />
          <button id="uuid-validate-btn">Validate</button>
        </div>
        <div class="output-box" id="uuid-validate-output" style="margin-top: 8px; min-height: 20px"></div>
      </div>
    `;
  },

  init() {
    const output = getElement('uuid-output');
    let currentUUIDs: string[] = [];
    let dashesRemoved = false;
    let isUppercase = false;

    function updateDisplay() {
      let uuids = currentUUIDs;
      if (dashesRemoved) uuids = uuids.map((u) => formatUUID(u, false));
      if (isUppercase) uuids = uuids.map((u) => u.toUpperCase());
      output.textContent = uuids.join('\n');
    }

    getElement('uuid-generate').addEventListener('click', () => {
      const count = parseInt((getInput('uuid-count') as HTMLInputElement).value) || 1;
      currentUUIDs = Array.from({ length: Math.min(count, 100) }, () => generateUUID());
      dashesRemoved = false;
      isUppercase = false;
      getElement('uuid-dashes').textContent = 'Remove dashes';
      getElement('uuid-upper').textContent = 'Uppercase';
      updateDisplay();
    });

    getElement('uuid-copy').addEventListener('click', (e) => {
      copyToClipboard(output.textContent || '', e.currentTarget as HTMLElement);
    });

    getElement('uuid-dashes').addEventListener('click', () => {
      dashesRemoved = !dashesRemoved;
      getElement('uuid-dashes').textContent = dashesRemoved ? 'Add dashes' : 'Remove dashes';
      updateDisplay();
    });

    getElement('uuid-upper').addEventListener('click', () => {
      isUppercase = !isUppercase;
      getElement('uuid-upper').textContent = isUppercase ? 'Lowercase' : 'Uppercase';
      updateDisplay();
    });

    getElement('uuid-validate-btn').addEventListener('click', () => {
      const input = getInput('uuid-validate-input').value.trim();
      const result = getElement('uuid-validate-output');
      if (!input) {
        result.textContent = '';
        result.className = 'output-box';
        return;
      }
      if (validateUUID(input)) {
        result.textContent = 'Valid UUID';
        result.className = 'output-box success';
      } else {
        result.textContent = 'Invalid UUID';
        result.className = 'output-box error';
      }
    });

    currentUUIDs = [generateUUID()];
    updateDisplay();
  },
};
