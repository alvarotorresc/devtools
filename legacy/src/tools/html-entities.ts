import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

export function encodeHtmlEntities(text: string): string {
  return text.replace(/[&<>"']/g, (c) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[c] || c;
  });
}

export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export const htmlEntitiesTool: Tool = {
  id: 'html-entities',
  name: 'HTML Entities',

  render() {
    return `
      <div class="tool-header">
        <h2>HTML Entities</h2>
        <p>Encode and decode HTML entities</p>
      </div>
      <div class="tool-section">
        <label>Text</label>
        <textarea id="html-text" rows="6" placeholder='<div class="example">Hello & world</div>'></textarea>
      </div>
      <div class="tool-section">
        <div class="btn-row">
          <button id="html-encode" class="primary">Encode</button>
          <button id="html-decode" class="primary">Decode</button>
          <button id="html-copy">Copy encoded</button>
        </div>
      </div>
      <div class="tool-section">
        <label>Encoded</label>
        <textarea id="html-encoded" rows="6" placeholder="&lt;div class=&quot;example&quot;&gt;"></textarea>
      </div>
    `;
  },

  init() {
    const text = getInput('html-text') as HTMLTextAreaElement;
    const encoded = getInput('html-encoded') as HTMLTextAreaElement;

    getElement('html-encode').addEventListener('click', () => {
      encoded.value = encodeHtmlEntities(text.value);
    });

    getElement('html-decode').addEventListener('click', () => {
      text.value = decodeHtmlEntities(encoded.value);
    });

    getElement('html-copy').addEventListener('click', (e) => {
      copyToClipboard(encoded.value, e.currentTarget as HTMLElement);
    });
  },
};
