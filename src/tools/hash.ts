import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

export async function computeHash(algorithm: string, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashAll(text: string): Promise<Record<string, string>> {
  const [sha1, sha256, sha384, sha512] = await Promise.all([
    computeHash('SHA-1', text),
    computeHash('SHA-256', text),
    computeHash('SHA-384', text),
    computeHash('SHA-512', text),
  ]);
  return { 'SHA-1': sha1, 'SHA-256': sha256, 'SHA-384': sha384, 'SHA-512': sha512 };
}

export const hashTool: Tool = {
  id: 'hash',
  name: 'Hash',

  render() {
    return `
      <div class="tool-header">
        <h2>Hash Generator</h2>
        <p>Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes</p>
      </div>
      <div class="tool-section">
        <label>Input</label>
        <textarea id="hash-input" rows="4" placeholder="Enter text to hash"></textarea>
      </div>
      <div class="tool-section">
        <button id="hash-generate" class="primary">Generate hashes</button>
      </div>
      <div id="hash-results"></div>
    `;
  },

  init() {
    const input = getInput('hash-input') as HTMLTextAreaElement;
    const results = getElement('hash-results');

    getElement('hash-generate').addEventListener('click', async () => {
      const text = input.value;
      const hashes = await hashAll(text);
      results.innerHTML = Object.entries(hashes)
        .map(
          ([algo, value]) => `
          <div class="result-item">
            <div>
              <div class="label">${algo}</div>
              <div class="value">${value}</div>
            </div>
            <button class="hash-copy" data-value="${value}">Copy</button>
          </div>
        `,
        )
        .join('');

      results.querySelectorAll('.hash-copy').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const el = e.currentTarget as HTMLElement;
          copyToClipboard(el.dataset.value || '', el);
        });
      });
    });
  },
};
