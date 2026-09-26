import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

let interval: number | undefined;

export const timestampTool: Tool = {
  id: 'timestamp',
  name: 'Timestamp',

  render() {
    return `
      <div class="tool-header">
        <h2>Timestamp Converter</h2>
        <p>Convert between Unix timestamps and human-readable dates</p>
      </div>
      <div class="tool-section">
        <label>Current time</label>
        <div class="result-item">
          <div>
            <div class="value" id="ts-current"></div>
          </div>
          <button id="ts-current-copy">Copy</button>
        </div>
      </div>
      <div class="tool-section">
        <label>Unix timestamp &rarr; Date</label>
        <div class="inline-row">
          <input type="text" id="ts-unix-input" placeholder="1700000000" />
          <select id="ts-unit" style="width: 130px">
            <option value="s">Seconds</option>
            <option value="ms">Milliseconds</option>
          </select>
          <button id="ts-to-date" class="primary">Convert</button>
        </div>
        <div class="output-box" id="ts-date-output" style="margin-top: 8px"></div>
      </div>
      <div class="tool-section">
        <label>Date &rarr; Unix timestamp</label>
        <div class="inline-row">
          <input type="text" id="ts-date-input" placeholder="2024-01-15T12:00:00Z" />
          <button id="ts-to-unix" class="primary">Convert</button>
        </div>
        <div class="output-box" id="ts-unix-output" style="margin-top: 8px"></div>
      </div>
    `;
  },

  init() {
    const currentEl = getElement('ts-current');

    function updateCurrent() {
      const now = new Date();
      currentEl.textContent = `${Math.floor(now.getTime() / 1000)} (${now.toISOString()})`;
    }

    updateCurrent();
    interval = window.setInterval(updateCurrent, 1000);

    getElement('ts-current-copy').addEventListener('click', (e) => {
      const ts = Math.floor(Date.now() / 1000).toString();
      copyToClipboard(ts, e.currentTarget as HTMLElement);
    });

    getElement('ts-to-date').addEventListener('click', () => {
      const input = getInput('ts-unix-input').value.trim();
      const unit = (getElement('ts-unit') as HTMLSelectElement).value;
      const output = getElement('ts-date-output');

      const num = parseInt(input);
      if (isNaN(num)) {
        output.textContent = 'Invalid timestamp';
        output.className = 'output-box error';
        return;
      }

      const ms = unit === 's' ? num * 1000 : num;
      const date = new Date(ms);
      output.textContent = `UTC:   ${date.toUTCString()}\nISO:   ${date.toISOString()}\nLocal: ${date.toLocaleString()}`;
      output.className = 'output-box';
    });

    getElement('ts-to-unix').addEventListener('click', () => {
      const input = getInput('ts-date-input').value.trim();
      const output = getElement('ts-unix-output');

      const date = new Date(input);
      if (isNaN(date.getTime())) {
        output.textContent = 'Invalid date';
        output.className = 'output-box error';
        return;
      }

      const seconds = Math.floor(date.getTime() / 1000);
      output.textContent = `Seconds:      ${seconds}\nMilliseconds: ${date.getTime()}`;
      output.className = 'output-box';
    });
  },

  destroy() {
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
  },
};
