import { randInt, type Rng } from '../../lib/random';

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 100;
export const MAX_HISTORY = 10;
export const TAU = 2 * Math.PI;
/** The pointer sits at the top of the wheel. */
export const POINTER = -Math.PI / 2;

/** One option per line; empty lines are ignored and repeated options are kept. */
export function parseOptions(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function checkOptions(options: string[]): 'few' | 'many' | null {
  if (options.length < MIN_OPTIONS) return 'few';
  if (options.length > MAX_OPTIONS) return 'many';
  return null;
}

/** Modulo that is never negative. */
export function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

/**
 * Sector under the pointer when the wheel is rotated by `theta`. Sector i covers the local
 * angles [i·s, (i+1)·s), with s = 2π / n.
 */
export function segmentAt(theta: number, n: number): number {
  const s = TAU / n;
  return Math.min(n - 1, Math.floor(mod(POINTER - theta, TAU) / s));
}

/** Final angle that leaves the middle of sector `winner` (shifted by `offset`) under the pointer. */
export function spinTarget(
  theta: number,
  winner: number,
  n: number,
  turns: number,
  offset: number,
) {
  const s = TAU / n;
  return theta + turns * TAU + mod(POINTER - (winner + 0.5) * s - offset - theta, TAU);
}

/** The winner is chosen before animating; the animation only has to land on it. */
export function planSpin(rng: Rng, theta: number, n: number): { winner: number; target: number } {
  const s = TAU / n;
  const winner = randInt(rng, 0, n - 1);
  const offset = (rng() / 2 ** 32 - 0.5) * 0.7 * s; // uniform in [−0.35·s, 0.35·s)
  const turns = randInt(rng, 5, 7);
  return { winner, target: spinTarget(theta, winner, n, turns, offset) };
}

export interface Spring {
  theta: number;
  omega: number;
}

/** θ'' = −k(θ − θ*) − c·θ'. ζ ≈ 0.92: it overshoots by less than 0.1 % of the distance. */
export const SPRING_K = 3;
export const SPRING_C = 3.2;
export const STEP = 1 / 120;
export const MAX_SECONDS = 8;

/** One semi-implicit Euler step. */
export function stepSpring(st: Spring, target: number, dt: number = STEP): Spring {
  const omega = st.omega + (-SPRING_K * (st.theta - target) - SPRING_C * st.omega) * dt;
  return { theta: st.theta + omega * dt, omega };
}

export function settled(st: Spring, target: number): boolean {
  return Math.abs(st.theta - target) < 0.001 && Math.abs(st.omega) < 0.01;
}

/** Removes the first line that holds `option`, keeping every other line as it was. */
export function removeOption(text: string, option: string): string {
  const lines = text.split(/\r?\n/);
  const i = lines.findIndex((l) => l.trim() === option);
  if (i === -1) return text;
  lines.splice(i, 1);
  return lines.join('\n');
}

export function pushHistory(history: string[], item: string): string[] {
  return [item, ...history].slice(0, MAX_HISTORY);
}

/** Shortens `text` with "…" until `measure(text)` fits in `max` pixels. */
export function fitLabel(text: string, max: number, measure: (t: string) => number): string {
  if (measure(text) <= max) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(text.slice(0, mid) + '…') <= max) lo = mid;
    else hi = mid - 1;
  }
  return lo === 0 ? '' : text.slice(0, lo) + '…';
}
