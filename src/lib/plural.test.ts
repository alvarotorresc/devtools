import { describe, expect, it } from 'vitest';
import { plural } from './plural';

describe('plural', () => {
  it('picks the singular and fills {n} only for exactly 1', () => {
    expect(plural('es', 1, '{n} válido', '{n} válidos')).toBe('1 válido');
    expect(plural('en', 1, '{n} valid', '{n} valid')).toBe('1 valid');
  });

  it('picks the plural for 0 and for more than 1, in both locales', () => {
    expect(plural('es', 0, '{n} válido', '{n} válidos')).toBe('0 válidos');
    expect(plural('es', 2, '{n} válido', '{n} válidos')).toBe('2 válidos');
    expect(plural('en', 0, '{n} valid', '{n} valids')).toBe('0 valids');
    expect(plural('en', 2, '{n} valid', '{n} valids')).toBe('2 valids');
  });
});

// Guard for the C1 class of bug: `plural()` only ever fills `{n}` (see above), so any
// *One/*Other template that uses a different placeholder (e.g. `{p}`, `{k}`) renders with the
// braces still in it in production. Scan every tool's strings.ts and fail if one slips through.
const stringsModules = import.meta.glob('../tools/*/strings.ts', { eager: true }) as Record<
  string,
  { strings: Record<string, Record<string, string>> }
>;

// mock's numberStepOne/numberStepOther are the one legitimate exception: the counted quantity is
// `decimals`, not `n` (see the comment in Mock.svelte), so they replicate plural()'s selection by
// hand and fill `{decimals}` themselves instead of going through plural(). Every other *One/*Other
// pair in the tool set is expected to be handed to plural(), which only ever fills `{n}`.
const EXEMPT = new Set([
  '../tools/mock/strings.ts:numberStepOne',
  '../tools/mock/strings.ts:numberStepOther',
]);

describe('plural string templates', () => {
  it('every *One/*Other key in src/tools/**/strings.ts fills {n}, except documented exceptions', () => {
    let checked = 0;
    for (const [path, mod] of Object.entries(stringsModules)) {
      for (const [locale, dict] of Object.entries(mod.strings)) {
        for (const [key, value] of Object.entries(dict)) {
          if (!key.endsWith('One') && !key.endsWith('Other')) continue;
          if (EXEMPT.has(`${path}:${key}`)) continue;
          checked++;
          expect(value, `${path} ${locale}.${key} = ${JSON.stringify(value)}`).toContain('{n}');
        }
      }
    }
    // Fails loudly instead of silently passing if the glob pattern ever stops matching anything.
    expect(checked).toBeGreaterThan(0);
  });
});
