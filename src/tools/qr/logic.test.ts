import qrcode from 'qrcode-generator';
import { describe, expect, it } from 'vitest';
import {
  CAPACITY,
  cellSize,
  escapeWifi,
  normalizeUrl,
  qrMatrix,
  toBinaryString,
  toSvg,
  wifiPayload,
} from './logic';

function rawMatrix(binary: string, ecl: 'L' | 'M' | 'Q' | 'H'): boolean[][] {
  const qr = qrcode(0, ecl);
  qr.addData(binary, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

describe('qrMatrix', () => {
  it('encodes text as UTF-8 bytes: ñ is the same QR as the bytes C3 B1', () => {
    expect(toBinaryString('ñ')).toBe('\xC3\xB1');
    const r = qrMatrix('ñ', 'M');
    expect(r.ok && r.matrix).toEqual(rawMatrix('\xC3\xB1', 'M'));
  });

  it('encodes emojis as their 4 UTF-8 bytes', () => {
    expect(toBinaryString('😀')).toBe('\xF0\x9F\x98\x80');
    expect(qrMatrix('😀', 'L').ok).toBe(true);
  });

  it('picks the smallest version: "hola" fits in 21×21', () => {
    const r = qrMatrix('hola', 'M');
    expect(r.ok && r.matrix.length).toBe(21);
  });

  it('fills a version 40 code up to the byte capacity of each level', () => {
    for (const ecl of ['L', 'M', 'Q', 'H'] as const) {
      const fits = qrMatrix('a'.repeat(CAPACITY[ecl]), ecl);
      expect(fits.ok && fits.matrix.length).toBe(177);
      expect(qrMatrix('a'.repeat(CAPACITY[ecl] + 1), ecl)).toEqual({
        ok: false,
        error: 'too-long',
        bytes: CAPACITY[ecl] + 1,
        max: CAPACITY[ecl],
      });
    }
  });

  it('counts UTF-8 bytes, not characters, when it does not fit', () => {
    expect(qrMatrix('ñ'.repeat(1200), 'M')).toMatchObject({ ok: false, bytes: 2400, max: 2331 });
  });
});

describe('toSvg', () => {
  it('draws a white background and one black path, with the quiet zone', () => {
    const svg = toSvg([
      [true, false],
      [false, true],
    ]);
    expect(svg).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" shape-rendering="crispEdges">' +
        '<rect width="10" height="10" fill="white"/><path d="M4 4h1v1h-1zM5 5h1v1h-1z" fill="black"/></svg>',
    );
  });
});

describe('WiFi', () => {
  it('escapes \\ ; , : and " in the SSID and password', () => {
    expect(escapeWifi('a;b,c:d"e\\f')).toBe('a\\;b\\,c\\:d\\"e\\\\f');
  });

  it('builds the WIFI: payload', () => {
    expect(
      wifiPayload({ ssid: 'Casa;2', password: 's3cret', security: 'WPA', hidden: false }),
    ).toBe('WIFI:T:WPA;S:Casa\\;2;P:s3cret;;');
    expect(wifiPayload({ ssid: 'Oculta', password: 'x', security: 'WEP', hidden: true })).toBe(
      'WIFI:T:WEP;S:Oculta;P:x;H:true;;',
    );
  });

  it('leaves out the password for open networks', () => {
    expect(
      wifiPayload({ ssid: 'Bar', password: 'ignorada', security: 'nopass', hidden: false }),
    ).toBe('WIFI:T:nopass;S:Bar;;');
  });
});

describe('normalizeUrl', () => {
  it('adds https:// when the scheme is missing and says so', () => {
    expect(normalizeUrl('example.com/a?b=1')).toEqual({
      url: 'https://example.com/a?b=1',
      added: true,
    });
    expect(normalizeUrl('http://example.com')).toEqual({ url: 'http://example.com', added: false });
    expect(normalizeUrl('mailto:ana@example.com')).toEqual({
      url: 'mailto:ana@example.com',
      added: false,
    });
  });

  it('rejects what is not a URL', () => {
    expect(normalizeUrl('hola mundo')).toBeNull();
    expect(normalizeUrl('   ')).toBeNull();
  });
});

describe('cellSize', () => {
  it('fits the matrix plus an 8-module margin in the chosen size', () => {
    expect(cellSize(21, 512)).toBe(17);
    expect(cellSize(177, 256)).toBe(1);
  });
});
