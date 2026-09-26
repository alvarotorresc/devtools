export type Rgb = [number, number, number];
export type Hsl = [number, number, number];
export interface Oklch {
  l: number; // 0–1
  c: number; // 0–~0.4
  h: number; // 0–360
}
export type Level = 'AAA' | 'AA' | 'fail';

// ---- HEX, RGB and HSL (kept from the old tool) -------------------------------------------

/** "#58a6ff", "58a6ff" or "#5af". Returns null for anything else. */
export function hexToRgb(hex: string): Rgb | null {
  let clean = hex.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(clean)) clean = [...clean].map((c) => c + c).join('');
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

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
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

// ---- OKLCH (Björn Ottosson's OKLab, sRGB D65) ----------------------------------------------

export function srgbToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(v: number): number {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  return c * 255;
}

export function rgbToOklch(r: number, g: number, b: number): Oklch {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.sqrt(A * A + B * B);
  // Greys have no meaningful hue.
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c: c < 1e-4 ? 0 : c, h };
}

/** OKLCH → sRGB 0–255. Colours outside sRGB are clipped and reported with `inGamut: false`. */
export function oklchToRgb(l: number, c: number, h: number): { rgb: Rgb; inGamut: boolean } {
  const hr = (h * Math.PI) / 180;
  const A = c * Math.cos(hr);
  const B = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = l - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = l - 0.0894841775 * A - 1.291485548 * B;
  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;
  const lin = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
  // Displayed OKLCH is rounded (0.1 %, 0.001, 0.1°); feeding it back must not flag sRGB primaries.
  const EPS = 0.002;
  const inGamut = lin.every((v) => v >= -EPS && v <= 1 + EPS);
  const rgb = lin.map((v) =>
    Math.round(Math.max(0, Math.min(255, linearToSrgb(Math.max(0, Math.min(1, v)))))),
  ) as Rgb;
  return { rgb, inGamut };
}

// ---- WCAG 2.x contrast -----------------------------------------------------------------------

export function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Normal text needs 4.5 (AA) / 7 (AAA); large text (≥ 24px, or ≥ 18.66px bold) needs 3 / 4.5. */
export function wcagLevels(ratio: number): { normal: Level; large: Level } {
  return {
    normal: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail',
    large: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'fail',
  };
}

// ---- CSS strings -----------------------------------------------------------------------------

const round = (v: number, d: number) => Number(v.toFixed(d));

export function formatRgb([r, g, b]: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl([h, s, l]: Hsl): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(h, 1)})`;
}

/** Numbers inside "fn(…)" or bare, separated by commas, spaces or "/". Keeps "%" markers. */
function numbers(input: string, fn: string): { v: number; pct: boolean }[] | null {
  const s = input
    .trim()
    .replace(new RegExp(`^${fn}a?\\(`, 'i'), '')
    .replace(/\)$/, '');
  const parts = s.split(/[\s,/]+/).filter(Boolean);
  const out: { v: number; pct: boolean }[] = [];
  for (const p of parts) {
    const m = /^(-?\d*\.?\d+)(%|deg)?$/i.exec(p);
    if (!m) return null;
    out.push({ v: Number(m[1]), pct: m[2] === '%' });
  }
  return out;
}

export function parseRgb(input: string): Rgb | null {
  const n = numbers(input, 'rgb');
  if (!n || n.length < 3 || n.length > 4) return null;
  const rgb = n.slice(0, 3).map(({ v, pct }) => (pct ? (v / 100) * 255 : v));
  if (rgb.some((v) => v < 0 || v > 255)) return null;
  return rgb.map(Math.round) as Rgb;
}

export function parseHsl(input: string): Hsl | null {
  const n = numbers(input, 'hsl');
  if (!n || n.length < 3 || n.length > 4) return null;
  const [h, s, l] = n.map((x) => x.v);
  if (s < 0 || s > 100 || l < 0 || l > 100) return null;
  return [round(((h % 360) + 360) % 360, 6), s, l];
}

export function parseOklch(input: string): Oklch | null {
  const n = numbers(input, 'oklch');
  if (!n || n.length < 3 || n.length > 4) return null;
  const [L, C, H] = n;
  const l = round(L.pct || L.v > 1 ? L.v / 100 : L.v, 6);
  const c = C.pct ? (C.v / 100) * 0.4 : C.v;
  if (l < 0 || l > 1 || c < 0) return null;
  return { l, c, h: round(((H.v % 360) + 360) % 360, 6) };
}
