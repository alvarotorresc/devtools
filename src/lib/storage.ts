import { LOCALES } from '../tools/types';

export const STORAGE_PREFIX = 'devtools:';

type Area = 'local' | 'session';

function area(kind: Area): Storage | null {
  try {
    const s = kind === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
    return s ?? null;
  } catch {
    return null;
  }
}

export function readString(key: string, fallback: string, kind: Area = 'local'): string {
  try {
    return area(kind)?.getItem(STORAGE_PREFIX + key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeString(key: string, value: string, kind: Area = 'local'): void {
  try {
    area(kind)?.setItem(STORAGE_PREFIX + key, value);
  } catch {
    // Storage blocked or full: the app keeps working without persistence.
  }
}

export function readJSON<T>(key: string, fallback: T, kind: Area = 'local'): T {
  const raw = readString(key, '', kind);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, kind: Area = 'local'): void {
  writeString(key, JSON.stringify(value), kind);
}

export function removeKey(key: string, kind: Area = 'local'): void {
  try {
    area(kind)?.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Ignored on purpose, same as writeString.
  }
}

const YEAR = 60 * 60 * 24 * 365;

/**
 * Remembers the language twice: in localStorage for the client and in the
 * nf_lang cookie, which Netlify reads to send "/" straight to that language.
 * Anything that is not a locale is ignored.
 */
export function rememberLocale(locale: string): void {
  if (!(LOCALES as readonly string[]).includes(locale)) return;
  writeString('locale', locale);
  try {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `nf_lang=${encodeURIComponent(locale)}; path=/; max-age=${YEAR}; SameSite=Lax${secure}`;
  } catch {
    // Cookies blocked: localStorage still has it.
  }
}
