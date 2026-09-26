import { describe, expect, it } from 'vitest';
import { PROVINCES, provinceByCode, provinceByPlate } from './provinces';

describe('PROVINCES', () => {
  it('has the 52 provinces with unique, consecutive codes 01–52', () => {
    expect(PROVINCES).toHaveLength(52);
    PROVINCES.forEach((p, i) => expect(p.code).toBe(String(i + 1).padStart(2, '0')));
  });

  it('has unique licence plate prefixes of one or two letters', () => {
    const all = PROVINCES.flatMap((p) => p.plates);
    expect(new Set(all).size).toBe(all.length);
    for (const s of all) expect(s).toMatch(/^[A-Z]{1,2}$/);
  });

  it('fills every field', () => {
    for (const p of PROVINCES) {
      expect(p.name && p.capital && p.community).toBeTruthy();
      expect(p.plates.length).toBeGreaterThan(0);
    }
  });
});

describe('lookups', () => {
  it('finds a province by its two-digit code', () => {
    expect(provinceByCode('08')?.name).toBe('Barcelona');
    expect(provinceByCode('28')?.capital).toBe('Madrid');
    expect(provinceByCode('52')?.community).toBe('Ciudad Autónoma de Melilla');
    expect(provinceByCode('8')).toBeUndefined();
    expect(provinceByCode('53')).toBeUndefined();
  });

  it('finds a province by any of its plate prefixes, in any case', () => {
    expect(provinceByPlate('M')?.code).toBe('28');
    expect(provinceByPlate('GI')?.name).toBe('Girona');
    expect(provinceByPlate('ge')?.name).toBe('Girona');
    expect(provinceByPlate('IB')?.code).toBe('07');
    expect(provinceByPlate('PM')?.code).toBe('07');
    expect(provinceByPlate('XX')).toBeUndefined();
  });
});
