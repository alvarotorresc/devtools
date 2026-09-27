export type Kind = 'direct' | 'inverse';

/** Removes floating-point noise: 0.1 × 3 / 1 = 0.30000000000000004 → 0.3. */
function clean(x: number): number {
  return Number(x.toPrecision(12));
}

/**
 * "If A → B, then C → X".
 * Direct (more A, more B): X = B × C / A. Inverse (more A, less B): X = A × B / C.
 * Null when the divisor is 0.
 */
export function ruleOfThree(kind: Kind, a: number, b: number, c: number): number | null {
  if (kind === 'direct') return a === 0 ? null : clean((b * c) / a);
  return c === 0 ? null : clean((a * b) / c);
}

/** The value that cannot be 0 for each kind. */
export function divisorOf(kind: Kind): 'A' | 'C' {
  return kind === 'direct' ? 'A' : 'C';
}
