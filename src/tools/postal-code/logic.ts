import { compactId } from '../../lib/ids';
import { provinceByCode, type Province } from '../../lib/provinces';
import { randInt, type Rng } from '../../lib/random';

export type PostalReason = 'empty' | 'chars' | 'length' | 'prefix';

export type PostalResult =
  | {
      ok: true;
      /** 5 digits. */
      code: string;
      /** True when a leading 0 was added to a 4-digit code (the usual spreadsheet mistake). */
      padded: boolean;
      province: Province;
    }
  | { ok: false; reason: PostalReason; length?: number; prefix?: string };

export function lookupPostalCode(raw: string): PostalResult {
  // compactId also accepts dots and dashes: the exact thousands-formatted spreadsheet column
  // ("28.013") or hyphenated form ("08-001") the tool advertises taking.
  const s = compactId(raw);
  if (!s) return { ok: false, reason: 'empty' };
  if (!/^\d+$/.test(s)) return { ok: false, reason: 'chars' };
  if (s.length !== 4 && s.length !== 5) return { ok: false, reason: 'length', length: s.length };
  const code = s.padStart(5, '0');
  const prefix = code.slice(0, 2);
  const province = provinceByCode(prefix);
  if (!province) return { ok: false, reason: 'prefix', prefix };
  return { ok: true, code, padded: s.length === 4, province };
}

/** "Los códigos postales de Madrid van de 28000 a 28999". */
export function postalRange(provinceCode: string): { from: string; to: string } {
  return { from: `${provinceCode}000`, to: `${provinceCode}999` };
}

/**
 * For mock data: provinceCode + '0' + 01–09, the pattern of the capitals' codes.
 * Only coherence with the province is guaranteed, not that this exact code exists.
 */
export function generatePostalCode(rng: Rng, provinceCode: string): string {
  return `${provinceCode}0${String(randInt(rng, 1, 9)).padStart(2, '0')}`;
}
