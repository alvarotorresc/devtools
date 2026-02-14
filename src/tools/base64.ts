import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return btoa(binString);
}

export function decodeBase64(encoded: string): string {
  const binString = atob(encoded);
  const bytes = Uint8Array.from(binString, (c) => c.codePointAt(0)!);
  return new TextDecoder().decode(bytes);
}

export const base64Tool: Tool = {
  id: 'base64',
  name: 'Base64',

  render() {
    return `
      <div class="tool-header">
        <h2>Base64</h2>
        <p>Encode and decode Base64 strings (UTF-8 safe)</p>
      </div>
      <div class="tool-section">
        <label>Text</label>
        <textarea id="base64-text" rows="6" placeholder="Enter text to encode"></textarea>
      </div>
      <div class="tool-section">
        <div class="btn-row">
          <button id="base64-encode" class="primary">Encode</button>
          <button id="base64-decode" class="primary">Decode</button>
          <button id="base64-copy">Copy encoded</button>
        </div>
      </div>
      <div class="tool-section">
        <label>Base64</label>
        <textarea id="base64-encoded" rows="6" placeholder="Enter Base64 to decode"></textarea>
      </div>
      <div class="output-box" id="base64-error" style="display: none"></div>
    `;
  },

  init() {
    const text = getInput('base64-text') as HTMLTextAreaElement;
    const encoded = getInput('base64-encoded') as HTMLTextAreaElement;
    const error = getElement('base64-error');

    function clearError() {
      error.style.display = 'none';
      error.className = 'output-box';
    }

    getElement('base64-encode').addEventListener('click', () => {
      clearError();
      try {
        encoded.value = encodeBase64(text.value);
      } catch (e) {
        error.textContent = (e as Error).message;
        error.className = 'output-box error';
        error.style.display = 'block';
      }
    });

    getElement('base64-decode').addEventListener('click', () => {
      clearError();
      try {
        text.value = decodeBase64(encoded.value);
      } catch {
        error.textContent = 'Invalid Base64 string';
        error.className = 'output-box error';
        error.style.display = 'block';
      }
    });

    getElement('base64-copy').addEventListener('click', (e) => {
      copyToClipboard(encoded.value, e.currentTarget as HTMLElement);
    });
  },
};
