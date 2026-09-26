import { base64ToBytes, fromUtf8 } from '../../lib/bytes';

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export type JwtError = 'parts' | 'header' | 'payload';
export type InspectResult = { ok: true; jwt: DecodedJwt } | { ok: false; error: JwtError };
export type TimeClaim = 'exp' | 'nbf' | 'iat';
export type Validity = 'valid' | 'expired' | 'notYet' | 'none';

export const TIME_CLAIMS: TimeClaim[] = ['exp', 'nbf', 'iat'];

/** Removes a leading "Bearer " and surrounding whitespace, so a pasted Authorization header works. */
export function cleanToken(raw: string): string {
  return raw
    .trim()
    .replace(/^bearer\s+/i, '')
    .trim();
}

function decodeSegment(segment: string): Record<string, unknown> | null {
  const bytes = base64ToBytes(segment);
  if (!bytes) return null;
  try {
    const value: unknown = JSON.parse(fromUtf8(bytes, true));
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function inspectJwt(raw: string): InspectResult {
  const parts = cleanToken(raw).split('.');
  if (parts.length !== 3) return { ok: false, error: 'parts' };
  const header = decodeSegment(parts[0]);
  if (!header) return { ok: false, error: 'header' };
  const payload = decodeSegment(parts[1]);
  if (!payload) return { ok: false, error: 'payload' };
  return { ok: true, jwt: { header, payload, signature: parts[2] } };
}

/** Legacy API: null when the token cannot be decoded. */
export function decodeJWT(token: string): DecodedJwt | null {
  const r = inspectJwt(token);
  return r.ok ? r.jwt : null;
}

export function claimDate(payload: Record<string, unknown>, claim: TimeClaim): Date | null {
  const v = payload[claim];
  return typeof v === 'number' && Number.isFinite(v) ? new Date(v * 1000) : null;
}

export function validity(payload: Record<string, unknown>, nowMs: number): Validity {
  const exp = claimDate(payload, 'exp');
  const nbf = claimDate(payload, 'nbf');
  if (exp && exp.getTime() <= nowMs) return 'expired';
  if (nbf && nbf.getTime() > nowMs) return 'notYet';
  return exp || nbf ? 'valid' : 'none';
}

function formatTimeDiff(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

/** Legacy one-line English summary. The page uses `validity` + `formatRelative` instead. */
export function getExpirationInfo(payload: Record<string, unknown>, nowMs = Date.now()): string {
  const exp = claimDate(payload, 'exp');
  if (!exp) return 'No expiration';
  if (exp.getTime() < nowMs) {
    return `Expired: ${exp.toISOString()} (${formatTimeDiff(nowMs - exp.getTime())} ago)`;
  }
  return `Expires: ${exp.toISOString()} (in ${formatTimeDiff(exp.getTime() - nowMs)})`;
}
