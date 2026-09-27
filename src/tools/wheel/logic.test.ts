import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  checkOptions,
  fitLabel,
  MAX_SECONDS,
  mod,
  parseOptions,
  planSpin,
  pushHistory,
  removeOption,
  segmentAt,
  settled,
  spinTarget,
  STEP,
  stepSpring,
  TAU,
} from './logic';

describe('options', () => {
  it('ignores empty lines and keeps repeated options', () => {
    expect(parseOptions('Ana\n\n  Luis \nAna\r\n')).toEqual(['Ana', 'Luis', 'Ana']);
  });

  it('needs between 2 and 100 options', () => {
    expect(checkOptions(['Ana'])).toBe('few');
    expect(checkOptions(['Ana', 'Luis'])).toBeNull();
    expect(checkOptions(Array.from({ length: 101 }, (_, i) => String(i)))).toBe('many');
  });

  it('removes the winner from the text and nothing else', () => {
    expect(removeOption('Ana\nLuis\n\nEva', 'Luis')).toBe('Ana\n\nEva');
    expect(removeOption('Ana\nAna\nEva', 'Ana')).toBe('Ana\nEva');
    expect(removeOption('Ana', 'Eva')).toBe('Ana');
  });

  it('keeps the last 10 results, newest first', () => {
    let h: string[] = [];
    for (let i = 1; i <= 12; i++) h = pushHistory(h, String(i));
    expect(h).toEqual(['12', '11', '10', '9', '8', '7', '6', '5', '4', '3']);
  });
});

describe('geometry', () => {
  it('normalizes angles to [0, 2π)', () => {
    expect(mod(-1, 5)).toBe(4);
    expect(mod(7, 5)).toBe(2);
  });

  it('finds the sector under the pointer', () => {
    // Not rotated: sector 0 starts at the right (angle 0) and goes clockwise, so the top
    // (−π/2) is inside the last sector.
    expect(segmentAt(0, 4)).toBe(3);
    expect(segmentAt(-Math.PI / 2 - 0.01, 4)).toBe(0);
    expect(segmentAt(Math.PI, 2)).toBe(0);
  });

  it('lands on the chosen sector for any start angle and offset', () => {
    for (const n of [2, 3, 7, 100]) {
      const s = TAU / n;
      for (let i = 0; i < n; i++) {
        for (const theta of [0, 1, -5, 123.4]) {
          expect(segmentAt(spinTarget(theta, i, n, 5, 0.35 * s), n)).toBe(i);
          expect(segmentAt(spinTarget(theta, i, n, 7, -0.35 * s), n)).toBe(i);
        }
      }
    }
  });

  it('always lands on the winner in 10 000 seeded spins', () => {
    const rng = seededRng('wheel');
    let theta = 0;
    for (let k = 0; k < 10_000; k++) {
      const n = 2 + (k % 99);
      const { winner, target } = planSpin(rng, theta, n);
      expect(segmentAt(target, n)).toBe(winner);
      const distance = target - theta;
      expect(distance).toBeGreaterThanOrEqual(5 * TAU);
      expect(distance).toBeLessThan(8 * TAU);
      theta = mod(target, TAU);
    }
  });
});

describe('spring', () => {
  function simulate(distance: number) {
    let st = { theta: 0, omega: 0 };
    let t = 0;
    let overshoot = 0;
    while (t < MAX_SECONDS && !settled(st, distance)) {
      st = stepSpring(st, distance, STEP);
      t += STEP;
      overshoot = Math.max(overshoot, st.theta - distance);
    }
    return { t, overshoot, st };
  }

  it('converges before 8 simulated seconds, even for the longest spin', () => {
    for (const distance of [5 * TAU, 6.5 * TAU, 8 * TAU]) {
      const { t, st } = simulate(distance);
      expect(t).toBeLessThan(MAX_SECONDS);
      expect(settled(st, distance)).toBe(true);
    }
  });

  it('overshoots by less than 1 % of the distance', () => {
    for (const distance of [5 * TAU, 8 * TAU]) {
      expect(simulate(distance).overshoot).toBeLessThan(0.01 * distance);
    }
  });
});

describe('fitLabel', () => {
  const measure = (t: string) => t.length * 10;

  it('keeps labels that fit and shortens the rest with an ellipsis', () => {
    expect(fitLabel('Ana', 100, measure)).toBe('Ana');
    expect(fitLabel('Maximiliano', 60, measure)).toBe('Maxim…');
    expect(fitLabel('Maximiliano', 5, measure)).toBe('');
  });
});
