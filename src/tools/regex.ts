import type { Tool } from '../types';
import { getInput, getElement, escapeHtml } from '../utils/dom';

export const regexTool: Tool = {
  id: 'regex',
  name: 'Regex',

  render() {
    return `
      <div class="tool-header">
        <h2>Regex Tester</h2>
        <p>Test regular expressions with live matching</p>
      </div>
      <div class="tool-section">
        <label>Pattern</label>
        <div class="inline-row">
          <input type="text" id="regex-pattern" placeholder="[a-z]+@[a-z]+\\.[a-z]+" />
          <input type="text" id="regex-flags" placeholder="gi" value="g" style="width: 60px" />
        </div>
      </div>
      <div class="tool-section">
        <label>Test string</label>
        <textarea id="regex-input" rows="6" placeholder="Enter text to test against"></textarea>
      </div>
      <div class="tool-section">
        <label>Result</label>
        <div class="output-box" id="regex-output" style="min-height: 60px"></div>
      </div>
      <div class="tool-section">
        <label>Matches</label>
        <div class="output-box" id="regex-matches"></div>
      </div>
    `;
  },

  init() {
    function runTest() {
      const pattern = getInput('regex-pattern').value;
      const flags = getInput('regex-flags').value;
      const input = (getInput('regex-input') as HTMLTextAreaElement).value;
      const output = getElement('regex-output');
      const matches = getElement('regex-matches');

      if (!pattern) {
        output.innerHTML = escapeHtml(input);
        matches.textContent = '';
        return;
      }

      try {
        const regex = new RegExp(pattern, flags);
        const allMatches: string[] = [];
        let highlighted = '';
        let lastIndex = 0;

        if (flags.includes('g')) {
          let match;
          while ((match = regex.exec(input)) !== null) {
            highlighted += escapeHtml(input.slice(lastIndex, match.index));
            highlighted += `<span class="match-highlight">${escapeHtml(match[0])}</span>`;
            lastIndex = match.index + match[0].length;
            allMatches.push(match[0]);
            if (match[0].length === 0) {
              regex.lastIndex++;
            }
          }
          highlighted += escapeHtml(input.slice(lastIndex));
        } else {
          const match = regex.exec(input);
          if (match) {
            highlighted = escapeHtml(input.slice(0, match.index));
            highlighted += `<span class="match-highlight">${escapeHtml(match[0])}</span>`;
            highlighted += escapeHtml(input.slice(match.index + match[0].length));
            allMatches.push(match[0]);
          } else {
            highlighted = escapeHtml(input);
          }
        }

        output.innerHTML = highlighted || escapeHtml(input);
        matches.textContent =
          allMatches.length > 0
            ? `${allMatches.length} match${allMatches.length > 1 ? 'es' : ''}:\n${allMatches.map((m, i) => `${i + 1}: ${m}`).join('\n')}`
            : 'No matches';
        output.className = 'output-box';
      } catch (e) {
        output.textContent = (e as Error).message;
        output.className = 'output-box error';
        matches.textContent = '';
      }
    }

    getInput('regex-pattern').addEventListener('input', runTest);
    getInput('regex-flags').addEventListener('input', runTest);
    getInput('regex-input').addEventListener('input', runTest);
  },
};
