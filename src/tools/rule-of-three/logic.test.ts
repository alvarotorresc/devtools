import { describe, expect, it } from 'vitest';
import { divisorOf, ruleOfThree } from './logic';

describe('ruleOfThree', () => {
  it('solves the direct rule: 2 → 10, 5 → 25', () => {
    expect(ruleOfThree('direct', 2, 10, 5)).toBe(25);
    expect(ruleOfThree('direct', 3, 4.5, 10)).toBe(15);
  });

  it('solves the inverse rule: 4 people take 6 days, 8 people take 3', () => {
    expect(ruleOfThree('inverse', 4, 6, 8)).toBe(3);
    expect(ruleOfThree('inverse', 3, 10, 4)).toBe(7.5);
  });

  it('removes floating-point noise', () => {
    expect(ruleOfThree('direct', 1, 0.1, 3)).toBe(0.3);
  });

  it('refuses to divide by 0', () => {
    expect(ruleOfThree('direct', 0, 10, 5)).toBeNull();
    expect(ruleOfThree('inverse', 4, 6, 0)).toBeNull();
    expect(ruleOfThree('direct', 2, 10, 0)).toBe(0);
    expect(divisorOf('direct')).toBe('A');
    expect(divisorOf('inverse')).toBe('C');
  });
});
