import { readString, writeString } from './storage';

export type ShortcutAction =
  | { type: 'search'; query?: string }
  | { type: 'help' }
  | { type: 'copy' }
  | { type: 'tab'; index: number };

export interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  target: unknown;
}

export const SHORTCUT_EVENT = 'devtools:shortcut';

const NON_TEXT_INPUTS = [
  'button',
  'checkbox',
  'radio',
  'submit',
  'reset',
  'range',
  'color',
  'file',
  'image',
];

export function isTypingTarget(target: unknown): boolean {
  if (!target || typeof target !== 'object') return false;
  const el = target as { tagName?: string; type?: string; isContentEditable?: boolean };
  if (el.isContentEditable) return true;
  const tag = el.tagName?.toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') return !NON_TEXT_INPUTS.includes((el.type ?? 'text').toLowerCase());
  return false;
}

export function matchShortcut(e: KeyLike, singleKeys = true): ShortcutAction | null {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') return { type: 'search' };
  if (!singleKeys || mod || e.altKey) return null;
  if (isTypingTarget(e.target)) return null;
  if (e.key === '/') return { type: 'search' };
  if (e.key === '?') return { type: 'help' };
  if (e.key === 'c' && !e.shiftKey) return { type: 'copy' };
  if (/^[1-9]$/.test(e.key)) return { type: 'tab', index: Number(e.key) - 1 };
  return null;
}

export function getSingleKeys(): boolean {
  return readString('shortcuts.single', '1') !== '0';
}

export function setSingleKeys(on: boolean): void {
  writeString('shortcuts.single', on ? '1' : '0');
}

export function dispatchShortcut(action: ShortcutAction): void {
  window.dispatchEvent(new CustomEvent<ShortcutAction>(SHORTCUT_EVENT, { detail: action }));
}
