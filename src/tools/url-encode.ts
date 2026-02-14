import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

export const urlEncodeTool: Tool = {
  id: 'url',
  name: 'URL Encode',

  render() {
    return `
      <div class="tool-header">
        <h2>URL Encode / Decode</h2>
        <p>Encode and decode URL components</p>
      </div>
      <div class="tool-section">
        <label>Decoded text</label>
        <textarea id="url-decoded" rows="4" placeholder="Enter text to encode"></textarea>
      </div>
      <div class="tool-section">
        <div class="btn-row">
          <button id="url-encode" class="primary">Encode</button>
          <button id="url-decode" class="primary">Decode</button>
          <button id="url-copy">Copy encoded</button>
        </div>
      </div>
      <div class="tool-section">
        <label>Encoded text</label>
        <textarea id="url-encoded" rows="4" placeholder="Enter URL-encoded text to decode"></textarea>
      </div>
    `;
  },

  init() {
    const decoded = getInput('url-decoded') as HTMLTextAreaElement;
    const encoded = getInput('url-encoded') as HTMLTextAreaElement;

    getElement('url-encode').addEventListener('click', () => {
      encoded.value = encodeURIComponent(decoded.value);
    });

    getElement('url-decode').addEventListener('click', () => {
      try {
        decoded.value = decodeURIComponent(encoded.value);
      } catch {
        decoded.value = 'Error: invalid encoded string';
      }
    });

    getElement('url-copy').addEventListener('click', (e) => {
      copyToClipboard(encoded.value, e.currentTarget as HTMLElement);
    });
  },
};
