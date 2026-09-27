import { describe, expect, it } from 'vitest';
import {
  formatExactBytes,
  formatExactBytesPlain,
  humanSize,
  IEC_UNITS,
  inUnits,
  parseSize,
  SI_UNITS,
} from './logic';

const bytes = (input: string, locale: 'es' | 'en' = 'es') => {
  const r = parseSize(input, locale);
  if (!r.ok) throw new Error(r.reason);
  return r.bytes;
};

describe('parseSize', () => {
  it('reads SI, IEC and bit units', () => {
    expect(bytes('1.5 GB', 'en')).toBe(1.5e9);
    expect(bytes('1,5 GiB')).toBe(1_610_612_736);
    expect(bytes('750 MB')).toBe(7.5e8);
    expect(bytes('100 Mb')).toBe(12_500_000);
    expect(bytes('8 b')).toBe(1);
    expect(bytes('1TB')).toBe(1e12);
  });

  it('reads a bare number as bytes', () => {
    expect(parseSize('1024', 'es')).toMatchObject({ ok: true, bytes: 1024, unit: 'B' });
  });

  it('reads KB as SI and flags the Windows meaning', () => {
    expect(parseSize('1 KB', 'es')).toMatchObject({ ok: true, bytes: 1000, windowsKb: true });
    expect(parseSize('1 kB', 'es')).toMatchObject({ ok: true, bytes: 1000, windowsKb: false });
  });

  it('keeps fractions of a byte', () => {
    expect(bytes('0,5 B')).toBe(0.5);
  });

  it('warns above 2^53 bytes', () => {
    expect(parseSize('10 PB', 'es')).toMatchObject({ ok: true, approximate: true });
    expect(parseSize('1 PB', 'es')).toMatchObject({ ok: true, approximate: false });
  });

  it('flags approximate right at the Number.MAX_SAFE_INTEGER boundary', () => {
    expect(parseSize(String(Number.MAX_SAFE_INTEGER), 'es')).toMatchObject({
      ok: true,
      approximate: false,
    });
    expect(parseSize(String(Number.MAX_SAFE_INTEGER + 1), 'es')).toMatchObject({
      ok: true,
      approximate: true,
    });
  });

  it('explains what is wrong', () => {
    expect(parseSize('', 'es')).toEqual({ ok: false, reason: 'empty' });
    expect(parseSize('-1 MB', 'es')).toEqual({ ok: false, reason: 'negative' });
    expect(parseSize('abc', 'es')).toEqual({ ok: false, reason: 'unit', unit: 'abc' });
    expect(parseSize('5 XB', 'es')).toEqual({ ok: false, reason: 'unit', unit: 'XB' });
    expect(parseSize('mb', 'es')).toEqual({ ok: false, reason: 'unit', unit: 'mb' });
    expect(parseSize('1-2 MB', 'es')).toEqual({ ok: false, reason: 'number' });
  });
});

describe('conversions', () => {
  it('lists every SI and IEC unit', () => {
    expect(inUnits(1e12, SI_UNITS).map((r) => r.value)).toEqual([1e12, 1e9, 1e6, 1000, 1, 0.001]);
    const iec = inUnits(1e12, IEC_UNITS);
    expect(iec.find((r) => r.unit === 'GiB')!.value).toBe(931.322574615);
    expect(iec.find((r) => r.unit === 'B')!.value).toBe(1e12);
  });

  it('keeps the B row exact instead of rounded to 12 significant digits', () => {
    // 1 TiB = 1,099,511,627,776 B: 13 digits, so toPrecision(12) used to corrupt it to …780.
    const oneTiB = 2 ** 40;
    expect(inUnits(oneTiB, IEC_UNITS).find((r) => r.unit === 'B')!.value).toBe(1_099_511_627_776);
  });

  it('picks the readable form in each system', () => {
    expect(humanSize(1.5e9, 'si')).toEqual({ value: 1.5, unit: 'GB' });
    expect(humanSize(1.5e9, 'iec')).toEqual({ value: 1.4, unit: 'GiB' });
    expect(humanSize(1e12, 'iec')).toEqual({ value: 931.3, unit: 'GiB' });
    expect(humanSize(1023, 'iec')).toEqual({ value: 1023, unit: 'B' });
    expect(humanSize(1024, 'iec')).toEqual({ value: 1, unit: 'KiB' });
    expect(humanSize(0.5, 'si')).toEqual({ value: 0.5, unit: 'B' });
  });

  it('promotes to the next unit when rounding reaches the unit base', () => {
    // 1,048,575 B / 1024 rounds to 1024.0 KiB, which must promote to 1 MiB.
    expect(humanSize(1_048_575, 'iec')).toEqual({ value: 1, unit: 'MiB' });
  });
});

describe('formatExactBytes', () => {
  it('never switches to scientific notation, even above 1e15', () => {
    const onePiB = 2 ** 50;
    expect(onePiB).toBe(1_125_899_906_842_624);
    expect(formatExactBytes(onePiB, 'es')).toBe('1.125.899.906.842.624');
    expect(formatExactBytes(onePiB, 'en')).toBe('1,125,899,906,842,624');
  });

  it('keeps up to 3 decimals for fractions of a byte', () => {
    expect(formatExactBytes(0.5, 'es')).toBe('0,5');
  });

  it('shows whole byte counts with no decimals', () => {
    expect(formatExactBytes(1024, 'es')).toBe('1.024');
  });

  it('rounds away floating-point noise from large divisions instead of showing it as exact', () => {
    // 1,1 PB = 1.1e15, which as a double is 1100000000000000.1(25): not an integer, but the
    // ".1" is float noise, not part of the exact byte count typed.
    expect(formatExactBytes(bytes('1,1 PB', 'es'), 'es')).toBe('1.100.000.000.000.000');
  });

  it('still shows sub-byte fractions below the noise-rounding threshold', () => {
    expect(formatExactBytes(0.5, 'es')).toBe('0,5');
  });
});

describe('formatExactBytesPlain', () => {
  it('has no thousands grouping, for copying the literal digits', () => {
    const onePiB = 2 ** 50;
    expect(formatExactBytesPlain(onePiB, 'es')).toBe('1125899906842624');
  });

  it('keeps the locale decimal mark for fractions of a byte', () => {
    expect(formatExactBytesPlain(0.5, 'es')).toBe('0,5');
    expect(formatExactBytesPlain(0.5, 'en')).toBe('0.5');
  });
});
