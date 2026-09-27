import { describe, expect, it } from 'vitest';
import {
  clean,
  convertAll,
  convertFactor,
  convertTemperature,
  DEFAULT_UNIT,
  QUANTITIES,
  UNITS,
  unitsOf,
  type Quantity,
} from './logic';

const unit = (q: Exclude<Quantity, 'temperature'>, id: string) =>
  UNITS[q].find((u) => u.id === id)!;
const value = (q: Quantity, v: number, from: string, to: string) => {
  const r = convertAll(q, v, from);
  if (!r.ok) throw new Error(r.reason);
  return r.rows.find((row) => row.unit.id === to)!.value;
};

describe('tables', () => {
  it('has a default unit that exists in every tab', () => {
    for (const q of QUANTITIES) {
      expect(unitsOf(q).map((u) => u.id)).toContain(DEFAULT_UNIT[q]);
    }
  });

  it('uses unique unit ids across all tabs', () => {
    const ids = QUANTITIES.flatMap((q) => unitsOf(q).map((u) => u.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('factor conversions', () => {
  it('removes floating-point noise', () => {
    expect(clean(0.1 + 0.2)).toBe(0.3);
    expect(convertFactor(1, unit('length', 'ft'), unit('length', 'in'))).toBe(12);
  });

  it('converts length', () => {
    expect(value('length', 1, 'mi', 'km')).toBe(1.609344);
    expect(value('length', 1, 'mi', 'm')).toBe(1609.344);
    expect(value('length', 1, 'nmi', 'm')).toBe(1852);
    expect(value('length', 1, 'um', 'km')).toBe(1e-9);
  });

  it('converts mass', () => {
    expect(value('mass', 1, 'lb', 'kg')).toBe(0.45359237);
    expect(value('mass', 1, 'kg', 'lb')).toBe(2.20462262185);
    expect(value('mass', 1, 'st', 'lb')).toBe(14);
  });

  it('converts volume, area and speed', () => {
    expect(value('volume', 1, 'gal', 'ml')).toBe(3785.411784);
    expect(value('volume', 1, 'galuk', 'ptuk')).toBe(8);
    expect(value('area', 1, 'ac', 'ha')).toBe(0.40468564224);
    expect(value('area', 1, 'ha', 'ac')).toBe(2.47105381467);
    expect(value('speed', 100, 'kmh', 'mps')).toBe(27.7777777778);
    expect(value('speed', 100, 'kmh', 'mph')).toBe(62.1371192237);
    expect(value('speed', 1, 'kn', 'kmh')).toBe(1.852);
  });

  it('tells SI and binary data units apart', () => {
    expect(value('data', 1, 'GiB', 'MB')).toBe(1073.741824);
    expect(value('data', 1, 'GB', 'bit')).toBe(8e9);
    expect(value('data', 1, 'MiB', 'KiB')).toBe(1024);
    expect(value('data', 1, 'B', 'bit')).toBe(8);
  });

  it('keeps huge values (the view switches to scientific notation)', () => {
    expect(value('length', 1e20, 'm', 'km')).toBe(1e17);
  });

  it('turns 0 into 0 everywhere and rejects negatives outside temperature', () => {
    const r = convertAll('mass', 0, 'kg');
    expect(r.ok && r.rows.every((row) => row.value === 0)).toBe(true);
    expect(convertAll('length', -1, 'm')).toEqual({ ok: false, reason: 'negative' });
  });

  it('rejects a unit from another tab', () => {
    expect(convertAll('length', 1, 'kg')).toEqual({ ok: false, reason: 'unknownUnit' });
  });
});

describe('temperature', () => {
  it('converts between °C, °F and K', () => {
    expect(convertTemperature(100, 'C', 'F')).toBe(212);
    expect(convertTemperature(100, 'C', 'K')).toBe(373.15);
    expect(convertTemperature(32, 'F', 'C')).toBe(0);
    expect(convertTemperature(0, 'K', 'C')).toBe(-273.15);
    expect(convertTemperature(-40, 'C', 'F')).toBe(-40);
    expect(convertTemperature(98.6, 'F', 'C')).toBe(37);
  });

  it('lands exactly on absolute zero', () => {
    expect(convertTemperature(-459.67, 'F', 'K')).toBe(0);
    expect(value('temperature', -273.15, 'C', 'K')).toBe(0);
  });

  it('accepts negatives but not below absolute zero', () => {
    expect(value('temperature', -10, 'C', 'F')).toBe(14);
    expect(convertAll('temperature', -300, 'C')).toEqual({
      ok: false,
      reason: 'belowAbsoluteZero',
    });
    expect(convertAll('temperature', -1, 'K')).toEqual({ ok: false, reason: 'belowAbsoluteZero' });
  });
});
