import { describe, expect, it } from 'vitest';
import { isMac } from './platform';

describe('isMac', () => {
  it('prefers userAgentData.platform', () => {
    expect(isMac({ userAgentData: { platform: 'macOS' }, platform: 'Win32' })).toBe(true);
    expect(isMac({ userAgentData: { platform: 'Windows' }, platform: 'MacIntel' })).toBe(false);
  });

  it('falls back to navigator.platform', () => {
    expect(isMac({ platform: 'MacIntel' })).toBe(true);
    expect(isMac({ platform: 'iPad' })).toBe(true);
    expect(isMac({ platform: 'Linux x86_64' })).toBe(false);
    expect(isMac({ userAgentData: { platform: '' }, platform: 'MacIntel' })).toBe(true);
  });

  it('is false without a navigator', () => {
    expect(isMac(undefined)).toBe(false);
    expect(isMac({})).toBe(false);
  });
});
