export const TOAST_EVENT = 'devtools:toast';

export interface ToastDetail {
  message: string;
  kind: 'ok' | 'bad';
}

export function truncate(s: string, max = 40): string {
  const flat = s.replace(/\s*\n\s*/g, ' ');
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

export function toast(message: string, kind: 'ok' | 'bad' = 'ok'): void {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, kind } }));
}
