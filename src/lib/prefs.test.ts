import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_RECENT,
  clearInput,
  getFavorites,
  getRecent,
  getRemember,
  isFavorite,
  loadInput,
  pushRecent,
  saveInput,
  setRemember,
  toggleFavorite,
} from './prefs';

beforeEach(() => {
  const map = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  });
  vi.stubGlobal('window', { dispatchEvent: vi.fn() });
  vi.stubGlobal(
    'CustomEvent',
    class {
      constructor(
        public type: string,
        public init?: unknown,
      ) {}
    },
  );
});

describe('favorites', () => {
  it('toggles and reports state', () => {
    expect(getFavorites()).toEqual([]);
    expect(toggleFavorite('json')).toBe(true);
    expect(isFavorite('json')).toBe(true);
    expect(toggleFavorite('json')).toBe(false);
    expect(getFavorites()).toEqual([]);
  });

  it('notifies other components', () => {
    toggleFavorite('uuid');
    expect(window.dispatchEvent).toHaveBeenCalled();
  });
});

describe('recent', () => {
  it('puts the latest first without duplicates and caps the list', () => {
    pushRecent('a');
    pushRecent('b');
    pushRecent('a');
    expect(getRecent()).toEqual(['a', 'b']);
    for (let i = 0; i < 20; i++) pushRecent(`t${i}`);
    expect(getRecent()).toHaveLength(MAX_RECENT);
    expect(getRecent()[0]).toBe('t19');
  });
});

describe('remembered input', () => {
  it('uses the tool default until the user chooses', () => {
    expect(getRemember('jwt', false)).toBe(false);
    setRemember('jwt', true);
    expect(getRemember('jwt', false)).toBe(true);
  });

  it('saves, loads and clears input', () => {
    expect(loadInput('json')).toBeNull();
    saveInput('json', '{"a":1}');
    expect(loadInput('json')).toBe('{"a":1}');
    clearInput('json');
    expect(loadInput('json')).toBeNull();
  });
});
