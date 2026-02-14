import type { Tool } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { getInput, getElement } from '../utils/dom';

const WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'perspiciatis',
  'unde',
  'omnis',
  'iste',
  'natus',
  'error',
  'voluptatem',
  'accusantium',
  'doloremque',
  'laudantium',
  'totam',
  'rem',
  'aperiam',
  'eaque',
  'ipsa',
  'quae',
  'ab',
  'illo',
  'inventore',
  'veritatis',
  'quasi',
  'architecto',
  'beatae',
  'vitae',
  'dicta',
  'explicabo',
  'nemo',
  'ipsam',
  'voluptas',
  'aspernatur',
  'aut',
  'odit',
  'fugit',
];

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function generateSentence(wordCount?: number): string {
  const count = wordCount || Math.floor(Math.random() * 10) + 5;
  const words = Array.from({ length: count }, randomWord);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

export function generateParagraph(sentenceCount?: number): string {
  const count = sentenceCount || Math.floor(Math.random() * 4) + 3;
  return Array.from({ length: count }, () => generateSentence()).join(' ');
}

export function generateLorem(type: 'words' | 'sentences' | 'paragraphs', count: number): string {
  switch (type) {
    case 'words':
      return Array.from({ length: count }, randomWord).join(' ');
    case 'sentences':
      return Array.from({ length: count }, () => generateSentence()).join(' ');
    case 'paragraphs':
      return Array.from({ length: count }, () => generateParagraph()).join('\n\n');
  }
}

export const loremTool: Tool = {
  id: 'lorem',
  name: 'Lorem Ipsum',

  render() {
    return `
      <div class="tool-header">
        <h2>Lorem Ipsum</h2>
        <p>Generate placeholder text</p>
      </div>
      <div class="tool-section">
        <div class="inline-row">
          <input type="number" id="lorem-count" value="3" min="1" max="100" style="width: 80px" />
          <select id="lorem-type" style="width: 140px">
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
          <button id="lorem-generate" class="primary">Generate</button>
          <button id="lorem-copy">Copy</button>
        </div>
      </div>
      <div class="tool-section">
        <div class="output-box" id="lorem-output" style="min-height: 120px"></div>
      </div>
    `;
  },

  init() {
    const output = getElement('lorem-output');

    getElement('lorem-generate').addEventListener('click', () => {
      const count = parseInt((getInput('lorem-count') as HTMLInputElement).value) || 3;
      const type = (getElement('lorem-type') as HTMLSelectElement).value as
        | 'words'
        | 'sentences'
        | 'paragraphs';
      output.textContent = generateLorem(type, Math.min(count, 100));
    });

    getElement('lorem-copy').addEventListener('click', (e) => {
      copyToClipboard(output.textContent || '', e.currentTarget as HTMLElement);
    });

    output.textContent = generateLorem('paragraphs', 3);
  },
};
