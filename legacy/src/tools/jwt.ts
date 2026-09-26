import type { Tool } from '../types';
import { getInput, getElement } from '../utils/dom';

export function decodeJWT(
  token: string,
): { header: object; payload: object; signature: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { header, payload, signature: parts[2] };
  } catch {
    return null;
  }
}

function formatTimeDiff(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function getExpirationInfo(payload: Record<string, unknown>): string {
  if (typeof payload.exp !== 'number') return 'No expiration';
  const exp = new Date(payload.exp * 1000);
  const now = new Date();
  if (exp < now) {
    return `Expired: ${exp.toISOString()} (${formatTimeDiff(now.getTime() - exp.getTime())} ago)`;
  }
  return `Expires: ${exp.toISOString()} (in ${formatTimeDiff(exp.getTime() - now.getTime())})`;
}

export const jwtTool: Tool = {
  id: 'jwt',
  name: 'JWT',

  render() {
    return `
      <div class="tool-header">
        <h2>JWT Decoder</h2>
        <p>Decode JSON Web Tokens (does not verify signatures)</p>
      </div>
      <div class="tool-section">
        <label>Token</label>
        <textarea id="jwt-input" rows="4" placeholder="Paste a JWT token"></textarea>
      </div>
      <div class="tool-section">
        <button id="jwt-decode" class="primary">Decode</button>
      </div>
      <div id="jwt-result" style="display: none">
        <div class="tool-section">
          <label>Header</label>
          <div class="output-box" id="jwt-header"></div>
        </div>
        <div class="tool-section">
          <label>Payload</label>
          <div class="output-box" id="jwt-payload"></div>
        </div>
        <div class="tool-section">
          <label>Expiration</label>
          <div class="output-box" id="jwt-expiration"></div>
        </div>
        <div class="tool-section">
          <label>Signature</label>
          <div class="output-box" id="jwt-signature" style="color: var(--text-muted)"></div>
        </div>
      </div>
      <div class="output-box error" id="jwt-error" style="display: none"></div>
    `;
  },

  init() {
    const input = getInput('jwt-input') as HTMLTextAreaElement;

    getElement('jwt-decode').addEventListener('click', () => {
      const result = decodeJWT(input.value.trim());
      const resultDiv = getElement('jwt-result');
      const errorDiv = getElement('jwt-error');

      if (!result) {
        resultDiv.style.display = 'none';
        errorDiv.textContent = 'Invalid JWT token';
        errorDiv.style.display = 'block';
        return;
      }

      errorDiv.style.display = 'none';
      resultDiv.style.display = 'block';
      getElement('jwt-header').textContent = JSON.stringify(result.header, null, 2);
      getElement('jwt-payload').textContent = JSON.stringify(result.payload, null, 2);
      getElement('jwt-expiration').textContent = getExpirationInfo(
        result.payload as Record<string, unknown>,
      );
      getElement('jwt-signature').textContent = result.signature;
    });
  },
};
