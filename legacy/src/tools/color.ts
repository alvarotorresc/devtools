import type { Tool } from '../types';
import { getInput, getElement } from '../utils/dom';

export function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  const match = clean.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) return null;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

export const colorTool: Tool = {
  id: 'color',
  name: 'Color',

  render() {
    return `
      <div class="tool-header">
        <h2>Color Converter</h2>
        <p>Convert between HEX, RGB, and HSL color formats</p>
      </div>
      <div class="tool-section">
        <div class="color-preview" id="color-preview"></div>
      </div>
      <div class="tool-section">
        <label>HEX</label>
        <input type="text" id="color-hex" placeholder="#58a6ff" />
      </div>
      <div class="tool-section">
        <label>RGB</label>
        <div class="inline-row">
          <input type="number" id="color-r" placeholder="R" min="0" max="255" />
          <input type="number" id="color-g" placeholder="G" min="0" max="255" />
          <input type="number" id="color-b" placeholder="B" min="0" max="255" />
        </div>
      </div>
      <div class="tool-section">
        <label>HSL</label>
        <div class="inline-row">
          <input type="number" id="color-h" placeholder="H" min="0" max="360" />
          <input type="number" id="color-s" placeholder="S" min="0" max="100" />
          <input type="number" id="color-l" placeholder="L" min="0" max="100" />
        </div>
      </div>
    `;
  },

  init() {
    const hexInput = getInput('color-hex') as HTMLInputElement;
    const rInput = getInput('color-r') as HTMLInputElement;
    const gInput = getInput('color-g') as HTMLInputElement;
    const bInput = getInput('color-b') as HTMLInputElement;
    const hInput = getInput('color-h') as HTMLInputElement;
    const sInput = getInput('color-s') as HTMLInputElement;
    const lInput = getInput('color-l') as HTMLInputElement;
    const preview = getElement('color-preview');

    function updateFromHex() {
      const rgb = hexToRgb(hexInput.value);
      if (!rgb) return;
      const [r, g, b] = rgb;
      rInput.value = r.toString();
      gInput.value = g.toString();
      bInput.value = b.toString();
      const [h, s, l] = rgbToHsl(r, g, b);
      hInput.value = h.toString();
      sInput.value = s.toString();
      lInput.value = l.toString();
      preview.style.background = hexInput.value;
    }

    function updateFromRgb() {
      const r = parseInt(rInput.value) || 0;
      const g = parseInt(gInput.value) || 0;
      const b = parseInt(bInput.value) || 0;
      hexInput.value = rgbToHex(r, g, b);
      const [h, s, l] = rgbToHsl(r, g, b);
      hInput.value = h.toString();
      sInput.value = s.toString();
      lInput.value = l.toString();
      preview.style.background = hexInput.value;
    }

    function updateFromHsl() {
      const h = parseInt(hInput.value) || 0;
      const s = parseInt(sInput.value) || 0;
      const l = parseInt(lInput.value) || 0;
      const [r, g, b] = hslToRgb(h, s, l);
      rInput.value = r.toString();
      gInput.value = g.toString();
      bInput.value = b.toString();
      hexInput.value = rgbToHex(r, g, b);
      preview.style.background = hexInput.value;
    }

    hexInput.addEventListener('input', updateFromHex);
    [rInput, gInput, bInput].forEach((el) => el.addEventListener('input', updateFromRgb));
    [hInput, sInput, lInput].forEach((el) => el.addEventListener('input', updateFromHsl));

    hexInput.value = '#58a6ff';
    updateFromHex();
  },
};
