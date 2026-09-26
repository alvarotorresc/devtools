import { describe, expect, it } from 'vitest';
import { isTypingTarget, matchShortcut, type KeyLike } from './shortcuts';

const key = (k: string, extra: Partial<KeyLike> = {}): KeyLike => ({
  key: k,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  target: { tagName: 'BODY' },
  ...extra,
});
const input = { tagName: 'INPUT', type: 'text' };

describe('isTypingTarget', () => {
  it('detects text fields and editable content', () => {
    expect(isTypingTarget({ tagName: 'TEXTAREA' })).toBe(true);
    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget({ tagName: 'INPUT', type: 'search' })).toBe(true);
    expect(isTypingTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true);
  });

  it('ignores buttons, checkboxes and the page itself', () => {
    expect(isTypingTarget({ tagName: 'INPUT', type: 'checkbox' })).toBe(false);
    expect(isTypingTarget({ tagName: 'BUTTON' })).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe('matchShortcut', () => {
  it('opens search with Ctrl+K or Cmd+K even while typing', () => {
    expect(matchShortcut(key('k', { ctrlKey: true, target: input }))).toEqual({ type: 'search' });
    expect(matchShortcut(key('K', { metaKey: true }))).toEqual({ type: 'search' });
  });

  it('maps single keys outside text fields', () => {
    expect(matchShortcut(key('/'))).toEqual({ type: 'search' });
    expect(matchShortcut(key('?', { shiftKey: true }))).toEqual({ type: 'help' });
    expect(matchShortcut(key('c'))).toEqual({ type: 'copy' });
    expect(matchShortcut(key('1'))).toEqual({ type: 'tab', index: 0 });
    expect(matchShortcut(key('9'))).toEqual({ type: 'tab', index: 8 });
  });

  it('never steals single keys while typing', () => {
    for (const k of ['/', '?', 'c', '1'])
      expect(matchShortcut(key(k, { target: input }))).toBeNull();
  });

  it('only keeps Ctrl+K when single-key shortcuts are turned off', () => {
    expect(matchShortcut(key('/'), false)).toBeNull();
    expect(matchShortcut(key('c'), false)).toBeNull();
    expect(matchShortcut(key('1'), false)).toBeNull();
    expect(matchShortcut(key('k', { ctrlKey: true }), false)).toEqual({ type: 'search' });
  });

  it('leaves browser and system combos alone', () => {
    expect(matchShortcut(key('c', { ctrlKey: true }))).toBeNull();
    expect(matchShortcut(key('C', { ctrlKey: true, shiftKey: true }))).toBeNull();
    expect(matchShortcut(key('1', { altKey: true }))).toBeNull();
    expect(matchShortcut(key('0'))).toBeNull();
    expect(matchShortcut(key('C', { shiftKey: true }))).toBeNull();
  });
});
