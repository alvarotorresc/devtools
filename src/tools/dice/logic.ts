import { randInt, type Rng } from '../../lib/random';

export const QUICK_SIDES = [4, 6, 8, 10, 12, 20, 100];
export const LIMITS = {
  count: [1, 100],
  sides: [2, 1000],
  modifier: [-1000, 1000],
  coins: [1, 100],
} as const;
export const MAX_HISTORY = 10;

export interface DiceSpec {
  count: number;
  sides: number;
  modifier: number;
}

export type DiceParse =
  | { ok: true; spec: DiceSpec }
  | { ok: false; reason: 'format' }
  | { ok: false; reason: 'count' | 'sides' | 'modifier'; value: number };

/** "3d6", "2d20+1", "4D6 - 2" or "d100" (= 1d100). */
export function parseDice(input: string): DiceParse {
  const m = /^(\d*)d(\d+)([+-]\d+)?$/.exec(input.replace(/\s+/g, '').toLowerCase());
  if (!m) return { ok: false, reason: 'format' };
  const spec = {
    count: m[1] === '' ? 1 : Number(m[1]),
    sides: Number(m[2]),
    modifier: m[3] ? Number(m[3]) : 0,
  };
  for (const key of ['count', 'sides', 'modifier'] as const) {
    const [min, max] = LIMITS[key];
    if (spec[key] < min || spec[key] > max) return { ok: false, reason: key, value: spec[key] };
  }
  return { ok: true, spec };
}

export function formatSpec({ count, sides, modifier }: DiceSpec): string {
  const mod = modifier > 0 ? `+${modifier}` : modifier < 0 ? String(modifier) : '';
  return `${count}d${sides}${mod}`;
}

export interface Roll {
  spec: DiceSpec;
  dice: number[];
  sum: number;
  total: number;
}

export function rollDice(rng: Rng, spec: DiceSpec): Roll {
  const dice = Array.from({ length: spec.count }, () => randInt(rng, 1, spec.sides));
  const sum = dice.reduce((a, b) => a + b, 0);
  return { spec, dice, sum, total: sum + spec.modifier };
}

export function diceRange({ count, sides, modifier }: DiceSpec): { min: number; max: number } {
  return { min: count + modifier, max: count * sides + modifier };
}

export type Coin = 'heads' | 'tails';

export function flipCoins(rng: Rng, n: number): Coin[] {
  return Array.from({ length: n }, () => (randInt(rng, 0, 1) === 0 ? 'heads' : 'tails'));
}

export function countCoins(coins: Coin[]): { heads: number; tails: number } {
  const heads = coins.filter((c) => c === 'heads').length;
  return { heads, tails: coins.length - heads };
}

export function pushHistory<T>(history: T[], item: T): T[] {
  return [item, ...history].slice(0, MAX_HISTORY);
}
