import { digits, pick, randInt, type Rng } from '../../lib/random';

export type Brand =
  'amex' | 'visa' | 'mastercard' | 'discover' | 'unionpay' | 'jcb' | 'diners' | 'maestro';

export type TestBrand = 'visa' | 'mastercard' | 'amex';

export const BRAND_NAMES: Record<Brand, string> = {
  amex: 'American Express',
  visa: 'Visa',
  mastercard: 'Mastercard',
  discover: 'Discover',
  unionpay: 'UnionPay',
  jcb: 'JCB',
  diners: 'Diners Club',
  maestro: 'Maestro',
};

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Usual lengths per brand. */
export const BRAND_LENGTHS: Record<Brand, number[]> = {
  amex: [15],
  visa: [13, 16, 19],
  mastercard: [16],
  discover: range(16, 19),
  unionpay: range(16, 19),
  jcb: range(16, 19),
  diners: range(14, 19),
  maestro: range(12, 19),
};

/** Numbers Stripe documents for its test mode. */
export const STRIPE_TEST_CARDS: { brand: TestBrand; number: string }[] = [
  { brand: 'visa', number: '4242424242424242' },
  { brand: 'mastercard', number: '5555555555554444' },
  { brand: 'amex', number: '378282246310005' },
];

export type CardReason = 'empty' | 'chars' | 'length' | 'luhn';

export type CardResult =
  | {
      ok: true;
      digits: string;
      brand: Brand | null;
      /** 4-4-4-4, or 4-6-5 for American Express. */
      formatted: string;
      /** A length that is valid for Luhn but unusual for the brand. */
      unusualLength: boolean;
    }
  | {
      ok: false;
      reason: CardReason;
      length?: number;
      brand?: Brand | null;
      formatted?: string;
      /** For `luhn`: the last digit that would pass. */
      expected?: string;
    };

/** Doubles every second digit from the right; subtracts 9 above 9; valid when the sum ends in 0. */
export function luhnValid(num: string): boolean {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/** The check digit for a body: Luhn over body + "0", then (10 − sum mod 10) mod 10. */
export function luhnCheckDigit(body: string): string {
  let sum = 0;
  const full = body + '0';
  for (let i = 0; i < full.length; i++) {
    let d = Number(full[full.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

const inRange = (num: string, len: number, from: number, to: number) => {
  const p = Number(num.slice(0, len));
  return num.length >= len && p >= from && p <= to;
};

/** The first rule that matches, in the order of the table in §6.6 of the spec. */
export function detectBrand(num: string): Brand | null {
  if (/^3[47]/.test(num)) return 'amex';
  if (num.startsWith('4')) return 'visa';
  if (inRange(num, 2, 51, 55) || inRange(num, 4, 2221, 2720)) return 'mastercard';
  if (
    num.startsWith('6011') ||
    inRange(num, 6, 622126, 622925) ||
    inRange(num, 3, 644, 649) ||
    num.startsWith('65')
  ) {
    return 'discover';
  }
  if (num.startsWith('62')) return 'unionpay';
  if (inRange(num, 4, 3528, 3589)) return 'jcb';
  if (inRange(num, 3, 300, 305) || /^3[689]/.test(num)) return 'diners';
  if (/^(5018|5020|5038|5893|6304|6759|6761|6762|6763)/.test(num)) return 'maestro';
  return null;
}

export function formatCard(num: string, brand: Brand | null): string {
  if (brand === 'amex' && num.length === 15) {
    return `${num.slice(0, 4)} ${num.slice(4, 10)} ${num.slice(10)}`;
  }
  return num.replace(/(.{4})(?=.)/g, '$1 ');
}

export function validateCard(raw: string): CardResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: 'empty' };
  if (!/^[\d\s-]+$/.test(trimmed)) return { ok: false, reason: 'chars' };
  const num = trimmed.replace(/[\s-]/g, '');
  if (num.length < 12 || num.length > 19)
    return { ok: false, reason: 'length', length: num.length };
  const brand = detectBrand(num);
  const formatted = formatCard(num, brand);
  if (!luhnValid(num)) {
    return {
      ok: false,
      reason: 'luhn',
      brand,
      formatted,
      expected: luhnCheckDigit(num.slice(0, -1)),
    };
  }
  const unusualLength = brand !== null && !BRAND_LENGTHS[brand].includes(num.length);
  return { ok: true, digits: num, brand, formatted, unusualLength };
}

/** Random body with the brand's prefix and the Luhn digit at the end. Without spaces. */
export function generateTestCard(rng: Rng, brand: TestBrand): string {
  let prefix: string;
  let length = 16;
  if (brand === 'visa') prefix = '4';
  else if (brand === 'amex') {
    prefix = pick(rng, ['34', '37']);
    length = 15;
  } else {
    // Half with the classic 51–55 range and half with the 2221–2720 range.
    prefix =
      randInt(rng, 0, 1) === 0 ? String(randInt(rng, 51, 55)) : String(randInt(rng, 2221, 2720));
  }
  const body = prefix + digits(rng, length - 1 - prefix.length);
  return body + luhnCheckDigit(body);
}

/** `MM/AA` between 1 and 5 years after `now`. */
export function generateExpiry(rng: Rng, now: Date): string {
  const months = randInt(rng, 12, 60);
  const total = now.getUTCFullYear() * 12 + now.getUTCMonth() + months;
  const year = Math.floor(total / 12) % 100;
  const month = (total % 12) + 1;
  return `${String(month).padStart(2, '0')}/${String(year).padStart(2, '0')}`;
}

/** 3 digits, or 4 for American Express. */
export function generateCvv(rng: Rng, brand: TestBrand): string {
  return digits(rng, brand === 'amex' ? 4 : 3);
}
