import qrcode from 'qrcode-generator';
import { utf8 } from '../../lib/bytes';

export type Ecl = 'L' | 'M' | 'Q' | 'H';
export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

/** Byte-mode capacity of a version 40 QR code for each error-correction level. */
export const CAPACITY: Record<Ecl, number> = { L: 2953, M: 2331, Q: 1663, H: 1273 };

export type QrResult =
  { ok: true; matrix: boolean[][] } | { ok: false; error: 'too-long'; bytes: number; max: number };

/**
 * The library's default conversion keeps only the low byte of each UTF-16 unit, which breaks
 * ñ and emojis. A "binary string" with one character per UTF-8 byte avoids it.
 */
export function toBinaryString(text: string): string {
  let out = '';
  for (const b of utf8(text)) out += String.fromCharCode(b);
  return out;
}

export function qrMatrix(text: string, ecl: Ecl): QrResult {
  const bytes = utf8(text).length;
  try {
    const qr = qrcode(0, ecl);
    qr.addData(toBinaryString(text), 'Byte');
    qr.make();
    const n = qr.getModuleCount();
    return {
      ok: true,
      matrix: Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => qr.isDark(r, c)),
      ),
    };
  } catch {
    // The library throws a plain string ("code length overflow") when the data does not fit.
    return { ok: false, error: 'too-long', bytes, max: CAPACITY[ecl] };
  }
}

/**
 * Black on white, always: QR readers need dark on light in every theme. The colours are
 * keywords, not hex, and the quiet zone (`margin` modules) is part of the image.
 */
export function toSvg(matrix: boolean[][], margin = 4): string {
  const n = matrix.length;
  const size = n + margin * 2;
  let d = '';
  matrix.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (dark) d += `M${c + margin} ${r + margin}h1v1h-1z`;
    }),
  );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">` +
    `<rect width="${size}" height="${size}" fill="white"/><path d="${d}" fill="black"/></svg>`
  );
}

export function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Backslash before \ ; , : and " inside the SSID and the password. */
export function escapeWifi(s: string): string {
  return s.replace(/([\\;,:"])/g, '\\$1');
}

export function wifiPayload(w: {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
}): string {
  let out = `WIFI:T:${w.security};S:${escapeWifi(w.ssid)};`;
  if (w.security !== 'nopass') out += `P:${escapeWifi(w.password)};`;
  if (w.hidden) out += 'H:true;';
  return `${out};`;
}

/** Adds https:// when there is no scheme, and checks the result with new URL(). */
export function normalizeUrl(input: string): { url: string; added: boolean } | null {
  const s = input.trim();
  if (!s) return null;
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(s);
  const url = hasScheme ? s : `https://${s}`;
  try {
    const parsed = new URL(url);
    if (!hasScheme && !parsed.hostname.includes('.')) return null;
    return { url, added: !hasScheme };
  } catch {
    return null;
  }
}

/** Cell size for a PNG of `size` pixels: the matrix plus a 4-module margin on each side. */
export function cellSize(modules: number, size: number): number {
  return Math.max(1, Math.floor(size / (modules + 8)));
}
