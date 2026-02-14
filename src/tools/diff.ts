import type { Tool } from '../types';
import { getInput, getElement, escapeHtml } from '../utils/dom';

interface DiffLine {
  type: 'add' | 'remove' | 'equal';
  text: string;
}

export function computeDiff(a: string[], b: string[]): DiffLine[] {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'equal', text: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', text: b[j - 1] });
      j--;
    } else {
      result.unshift({ type: 'remove', text: a[i - 1] });
      i--;
    }
  }

  return result;
}

export const diffTool: Tool = {
  id: 'diff',
  name: 'Diff',

  render() {
    return `
      <div class="tool-header">
        <h2>Text Diff</h2>
        <p>Compare two texts and see the differences</p>
      </div>
      <div class="grid-2">
        <div class="tool-section">
          <label>Original</label>
          <textarea id="diff-a" rows="10" placeholder="Paste original text"></textarea>
        </div>
        <div class="tool-section">
          <label>Modified</label>
          <textarea id="diff-b" rows="10" placeholder="Paste modified text"></textarea>
        </div>
      </div>
      <div class="tool-section">
        <button id="diff-compare" class="primary">Compare</button>
      </div>
      <div class="tool-section">
        <label>Diff output</label>
        <div class="output-box" id="diff-output" style="min-height: 100px; padding: 0; overflow: auto"></div>
      </div>
    `;
  },

  init() {
    getElement('diff-compare').addEventListener('click', () => {
      const a = (getInput('diff-a') as HTMLTextAreaElement).value.split('\n');
      const b = (getInput('diff-b') as HTMLTextAreaElement).value.split('\n');
      const diff = computeDiff(a, b);
      const output = getElement('diff-output');

      if (diff.every((d) => d.type === 'equal')) {
        output.innerHTML = '<div class="diff-line equal">No differences</div>';
        return;
      }

      output.innerHTML = diff
        .map((line) => {
          const prefix = line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  ';
          return `<div class="diff-line ${line.type}">${prefix}${escapeHtml(line.text)}</div>`;
        })
        .join('');
    });
  },
};
