/**
 * ISO 3166-1 alpha-2 plus XK (Kosovo): 250 codes. A fixed list, because Intl.DisplayNames
 * also accepts withdrawn codes (AN, YU…). Intl is only used to show the name.
 * Source: ISO 3166 Maintenance Agency, checked 2026-09-26.
 */
// prettier-ignore
export const COUNTRIES: ReadonlySet<string> = new Set(
  ('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ ' +
   'BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM ' +
   'DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS ' +
   'GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN ' +
   'KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ ' +
   'MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM ' +
   'PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV ' +
   'SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI ' +
   'VN VU WF WS XK YE YT ZA ZM ZW').split(' '),
);

export type BicReason = 'empty' | 'length' | 'bank' | 'country' | 'format';

export type BicResult =
  | {
      ok: true;
      bank: string;
      country: string;
      location: string;
      /** Null for the head office: no branch code, or XXX. */
      branch: string | null;
      bic8: string;
      bic11: string;
      /** A 0 as the second character of the location marks a test BIC. */
      test: boolean;
    }
  | { ok: false; reason: BicReason; length?: number; country?: string };

export function validateBic(raw: string): BicResult {
  const s = raw.toUpperCase().replace(/[\s-]/g, '');
  if (!s) return { ok: false, reason: 'empty' };
  if (s.length !== 8 && s.length !== 11) return { ok: false, reason: 'length', length: s.length };
  if (!/^[A-Z]{4}/.test(s)) return { ok: false, reason: 'bank' };
  const country = s.slice(4, 6);
  if (!/^[A-Z]{2}$/.test(country) || !COUNTRIES.has(country)) {
    return { ok: false, reason: 'country', country };
  }
  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(s))
    return { ok: false, reason: 'format' };
  const location = s.slice(6, 8);
  const code = s.slice(8);
  const branch = code === '' || code === 'XXX' ? null : code;
  return {
    ok: true,
    bank: s.slice(0, 4),
    country,
    location,
    branch,
    bic8: s.slice(0, 8),
    bic11: s.slice(0, 8) + (code || 'XXX'),
    test: location[1] === '0',
  };
}
