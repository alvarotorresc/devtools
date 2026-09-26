import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  formatHsl,
  formatOklch,
  formatRgb,
  hexToRgb,
  hslToRgb,
  oklchToRgb,
  parseHsl,
  parseOklch,
  parseRgb,
  relativeLuminance,
  rgbToHex,
  rgbToHsl,
  rgbToOklch,
  wcagLevels,
} from './logic';

describe('HEX, RGB and HSL (legacy behaviour)', () => {
  it('converts HEX to RGB', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
    expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });

  it('returns null for invalid HEX', () => {
    expect(hexToRgb('invalid')).toBeNull();
    expect(hexToRgb('#gg0000')).toBeNull();
  });

  it('converts RGB to HEX', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
  });

  it('converts RGB to HSL', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual([0, 100, 50]);
    expect(rgbToHsl(0, 0, 0)).toEqual([0, 0, 0]);
    expect(rgbToHsl(255, 255, 255)).toEqual([0, 0, 100]);
  });

  it('converts HSL to RGB', () => {
    expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]);
    expect(hslToRgb(0, 0, 0)).toEqual([0, 0, 0]);
    expect(hslToRgb(0, 0, 100)).toEqual([255, 255, 255]);
  });

  it('accepts short HEX and missing #', () => {
    expect(hexToRgb('#f00')).toEqual([255, 0, 0]);
    expect(hexToRgb('58A6FF')).toEqual([88, 166, 255]);
  });
});

describe('OKLCH', () => {
  it('matches the CSS Color 4 reference for pure red', () => {
    const red = rgbToOklch(255, 0, 0);
    expect(red.l).toBeCloseTo(0.628, 3);
    expect(red.c).toBeCloseTo(0.2577, 4);
    expect(red.h).toBeCloseTo(29.23, 2);
    expect(formatOklch(red)).toBe('oklch(62.8% 0.258 29.2)');
  });

  it('gives white and black lightness 1 and 0 with no chroma', () => {
    const white = rgbToOklch(255, 255, 255);
    expect(white.l).toBeCloseTo(1, 4);
    expect(white).toMatchObject({ c: 0, h: 0 });
    expect(rgbToOklch(0, 0, 0)).toEqual({ l: 0, c: 0, h: 0 });
  });

  it('round-trips sRGB colours', () => {
    for (const rgb of [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [88, 166, 255],
      [128, 128, 128],
      [255, 84, 25],
    ] as [number, number, number][]) {
      const o = rgbToOklch(...rgb);
      expect(oklchToRgb(o.l, o.c, o.h)).toEqual({ rgb, inGamut: true });
    }
  });

  it('clips colours outside sRGB and says so', () => {
    const r = oklchToRgb(0.7, 0.4, 150);
    expect(r.inGamut).toBe(false);
    for (const v of r.rgb) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    }
  });
});

describe('WCAG contrast', () => {
  it('computes known ratios', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrastRatio([0x76, 0x76, 0x76], [255, 255, 255])).toBeCloseTo(4.54, 2);
    expect(contrastRatio([0x77, 0x77, 0x77], [255, 255, 255])).toBeCloseTo(4.48, 2);
    expect(contrastRatio([255, 255, 255], [0x76, 0x76, 0x76])).toBeCloseTo(4.54, 2);
    expect(relativeLuminance([255, 255, 255])).toBe(1);
  });

  it('assigns AA and AAA for normal and large text', () => {
    expect(wcagLevels(21)).toEqual({ normal: 'AAA', large: 'AAA' });
    expect(wcagLevels(4.54)).toEqual({ normal: 'AA', large: 'AAA' });
    expect(wcagLevels(4.48)).toEqual({ normal: 'fail', large: 'AA' });
    expect(wcagLevels(2.53)).toEqual({ normal: 'fail', large: 'fail' });
  });
});

describe('CSS strings', () => {
  it('formats each notation', () => {
    expect(formatRgb([88, 166, 255])).toBe('rgb(88, 166, 255)');
    expect(formatHsl([213, 100, 67])).toBe('hsl(213, 100%, 67%)');
  });

  it('parses modern and legacy syntax', () => {
    expect(parseRgb('rgb(88, 166, 255)')).toEqual([88, 166, 255]);
    expect(parseRgb('rgb(88 166 255 / 50%)')).toEqual([88, 166, 255]);
    expect(parseRgb('88 166 255')).toEqual([88, 166, 255]);
    expect(parseRgb('rgb(100%, 0%, 0%)')).toEqual([255, 0, 0]);
    expect(parseHsl('hsl(213deg 100% 67%)')).toEqual([213, 100, 67]);
    expect(parseHsl('hsl(-30, 50%, 50%)')).toEqual([330, 50, 50]);
    expect(parseOklch('oklch(62.8% 0.2577 29.23)')).toEqual({ l: 0.628, c: 0.2577, h: 29.23 });
    expect(parseOklch('oklch(0.628 0.2577 29.23)')).toEqual({ l: 0.628, c: 0.2577, h: 29.23 });
  });

  it('rejects malformed or out-of-range values', () => {
    expect(parseRgb('rgb(300, 0, 0)')).toBeNull();
    expect(parseRgb('rgb(1, 2)')).toBeNull();
    expect(parseRgb('rojo')).toBeNull();
    expect(parseHsl('hsl(0, 120%, 50%)')).toBeNull();
    expect(parseOklch('oklch(150% 0.1 20)')).toBeNull();
  });
});
