import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  STRIPE_TEST_CARDS,
  detectBrand,
  formatCard,
  generateCvv,
  generateExpiry,
  generateTestCard,
  luhnCheckDigit,
  luhnValid,
  validateCard,
} from './logic';

describe('Luhn: checked examples', () => {
  it.each([
    '4111111111111111',
    '4242424242424242',
    '5555555555554444',
    '2223003122003222',
    '378282246310005',
    '371449635398431',
  ])('%s passes', (n) => {
    expect(luhnValid(n)).toBe(true);
  });

  it('4111111111111112 fails, and the right last digit is 1', () => {
    expect(luhnValid('4111111111111112')).toBe(false);
    expect(luhnCheckDigit('411111111111111')).toBe('1');
    expect(luhnCheckDigit('37828224631000')).toBe('5');
  });
});

describe('detectBrand', () => {
  it('follows the table order', () => {
    expect(detectBrand('378282246310005')).toBe('amex');
    expect(detectBrand('4111111111111111')).toBe('visa');
    expect(detectBrand('5555555555554444')).toBe('mastercard');
    expect(detectBrand('2223003122003222')).toBe('mastercard');
    expect(detectBrand('2720990000000000')).toBe('mastercard');
    expect(detectBrand('2721000000000000')).toBeNull();
    expect(detectBrand('6011000990139424')).toBe('discover');
    expect(detectBrand('6221260000000000')).toBe('discover');
    expect(detectBrand('6450000000000000')).toBe('discover');
    expect(detectBrand('6200000000000000')).toBe('unionpay');
    expect(detectBrand('3530111333300000')).toBe('jcb');
    expect(detectBrand('30569309025904')).toBe('diners');
    expect(detectBrand('36000000000000')).toBe('diners');
    expect(detectBrand('6759649826438453')).toBe('maestro');
    expect(detectBrand('9999999999999995')).toBeNull();
  });
});

describe('validateCard', () => {
  it('accepts spaces and dashes and groups the number', () => {
    expect(validateCard('4242 4242-4242 4242')).toEqual({
      ok: true,
      digits: '4242424242424242',
      brand: 'visa',
      formatted: '4242 4242 4242 4242',
      unusualLength: false,
    });
    expect(validateCard('378282246310005')).toMatchObject({ formatted: '3782 822463 10005' });
  });

  it('warns about unusual lengths for the brand', () => {
    const body = '4' + '1'.repeat(15);
    const seventeen = body + luhnCheckDigit(body);
    expect(validateCard(seventeen)).toMatchObject({ ok: true, brand: 'visa', unusualLength: true });
  });

  it('rejects 11 and 20 digits, letters and a bad check digit', () => {
    expect(validateCard('41111111111')).toEqual({ ok: false, reason: 'length', length: 11 });
    expect(validateCard('41111111111111111111')).toEqual({
      ok: false,
      reason: 'length',
      length: 20,
    });
    expect(validateCard('4111 1111 1111 111a')).toEqual({ ok: false, reason: 'chars' });
    expect(validateCard('4111111111111112')).toMatchObject({
      ok: false,
      reason: 'luhn',
      brand: 'visa',
      expected: '1',
    });
    expect(validateCard(' ')).toEqual({ ok: false, reason: 'empty' });
  });

  it('keeps the Stripe list valid', () => {
    for (const c of STRIPE_TEST_CARDS) {
      expect(validateCard(c.number)).toMatchObject({ ok: true, brand: c.brand });
    }
  });

  it('groups 4-6-5 only for 15-digit Amex', () => {
    expect(formatCard('4242424242424242', 'visa')).toBe('4242 4242 4242 4242');
    expect(formatCard('4242424242424', 'visa')).toBe('4242 4242 4242 4');
  });
});

describe('generators', () => {
  it('round-trip: 1 000 cards per brand with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (const brand of ['visa', 'mastercard', 'amex'] as const) {
      for (let i = 0; i < 1000; i++) {
        const n = generateTestCard(rng, brand);
        const r = validateCard(n);
        expect(r.ok, n).toBe(true);
        expect(r.ok && r.brand).toBe(brand);
        expect(n).toHaveLength(brand === 'amex' ? 15 : 16);
      }
    }
  });

  it('uses both Mastercard ranges', () => {
    const rng = seededRng('mc');
    const firsts = new Set(
      Array.from({ length: 200 }, () => generateTestCard(rng, 'mastercard')[0]),
    );
    expect(firsts).toEqual(new Set(['2', '5']));
  });

  it('makes an expiry 1 to 5 years ahead and a CVV of 3 or 4 digits', () => {
    const rng = seededRng('exp');
    const now = new Date(Date.UTC(2026, 8, 27));
    for (let i = 0; i < 300; i++) {
      const [mm, yy] = generateExpiry(rng, now).split('/').map(Number);
      const months = (2000 + yy) * 12 + (mm - 1) - (2026 * 12 + 8);
      expect(months).toBeGreaterThanOrEqual(12);
      expect(months).toBeLessThanOrEqual(60);
    }
    expect(generateCvv(rng, 'visa')).toMatch(/^\d{3}$/);
    expect(generateCvv(rng, 'amex')).toMatch(/^\d{4}$/);
  });
});
