import { describe, expect, it } from 'vitest';
import { bytesToBase64, utf8 } from '../../lib/bytes';
import { claimDate, cleanToken, decodeJWT, getExpirationInfo, inspectJwt, validity } from './logic';

const b64url = (o: unknown) => bytesToBase64(utf8(JSON.stringify(o)), true);
const token = (payload: unknown, header: unknown = { alg: 'HS256', typ: 'JWT' }) =>
  `${b64url(header)}.${b64url(payload)}.firma`;

describe('decodeJWT (legacy behaviour)', () => {
  const validJWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  it('decodes a valid JWT', () => {
    const result = decodeJWT(validJWT);
    expect(result).not.toBeNull();
    expect(result!.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(result!.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
    expect(result!.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  it('returns null for invalid JWT', () => {
    expect(decodeJWT('not.a.jwt.token')).toBeNull();
    expect(decodeJWT('invalid')).toBeNull();
  });

  it('shows expiration info', () => {
    expect(getExpirationInfo({ exp: Math.floor(Date.now() / 1000) - 3600 })).toContain('Expired');
    expect(getExpirationInfo({ exp: Math.floor(Date.now() / 1000) + 3600 })).toContain('Expires');
    expect(getExpirationInfo({})).toBe('No expiration');
  });
});

describe('inspectJwt', () => {
  it('decodes UTF-8 payloads correctly (the old atob version broke accents)', () => {
    const r = inspectJwt(token({ name: 'José Núñez', emoji: '✓' }));
    expect(r.ok && r.jwt.payload).toEqual({ name: 'José Núñez', emoji: '✓' });
  });

  it('accepts a pasted Authorization header', () => {
    expect(cleanToken('  Bearer abc.def.ghi \n')).toBe('abc.def.ghi');
    expect(inspectJwt(`Bearer ${token({ a: 1 })}`).ok).toBe(true);
  });

  it('says which part is wrong', () => {
    expect(inspectJwt('a.b')).toEqual({ ok: false, error: 'parts' });
    expect(inspectJwt(`xx.${b64url({ a: 1 })}.s`)).toEqual({ ok: false, error: 'header' });
    expect(inspectJwt(`${b64url({ alg: 'none' })}.bm90IGpzb24.s`)).toEqual({
      ok: false,
      error: 'payload',
    });
    expect(inspectJwt(`${b64url({ alg: 'none' })}.${b64url([1, 2])}.s`)).toEqual({
      ok: false,
      error: 'payload',
    });
  });
});

describe('time claims', () => {
  const NOW = Date.UTC(2026, 8, 26, 12, 0, 0);
  const at = (ms: number) => Math.floor(ms / 1000);

  it('reads exp, nbf and iat as dates', () => {
    expect(claimDate({ iat: 1516239022 }, 'iat')).toEqual(new Date('2018-01-18T01:30:22.000Z'));
    expect(claimDate({ exp: '1516239022' }, 'exp')).toBeNull();
    expect(claimDate({}, 'nbf')).toBeNull();
  });

  it('classifies the token as valid, expired, not yet valid or without dates', () => {
    expect(validity({ exp: at(NOW + 3_600_000) }, NOW)).toBe('valid');
    expect(validity({ exp: at(NOW - 1000) }, NOW)).toBe('expired');
    expect(validity({ exp: at(NOW) }, NOW)).toBe('expired');
    expect(validity({ nbf: at(NOW + 60_000), exp: at(NOW + 3_600_000) }, NOW)).toBe('notYet');
    expect(validity({ nbf: at(NOW - 60_000) }, NOW)).toBe('valid');
    expect(validity({ iat: at(NOW) }, NOW)).toBe('none');
  });
});
