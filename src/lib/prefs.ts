import { readJSON, readString, removeKey, writeJSON, writeString } from './storage';

export const PREFS_EVENT = 'devtools:prefs';
export const MAX_RECENT = 8;

function notify(key: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { key } }));
}

export function getFavorites(): string[] {
  const v = readJSON<unknown>('favorites', []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  writeJSON('favorites', next);
  notify('favorites');
  return next.includes(id);
}

export function getRecent(): string[] {
  const v = readJSON<unknown>('recent', []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function pushRecent(id: string): string[] {
  const next = [id, ...getRecent().filter((r) => r !== id)].slice(0, MAX_RECENT);
  writeJSON('recent', next);
  notify('recent');
  return next;
}

export function getRemember(toolId: string, fallback: boolean): boolean {
  const v = readString(`remember.${toolId}`, '');
  return v === '' ? fallback : v === '1';
}

export function setRemember(toolId: string, value: boolean): void {
  writeString(`remember.${toolId}`, value ? '1' : '0');
  if (!value) clearInput(toolId);
}

export function loadInput(toolId: string): string | null {
  const v = readString(`input.${toolId}`, '\u0000');
  return v === '\u0000' ? null : v;
}

export function saveInput(toolId: string, value: string): void {
  writeString(`input.${toolId}`, value);
}

export function clearInput(toolId: string): void {
  removeKey(`input.${toolId}`);
}
