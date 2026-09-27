export type AddressType =
  | 'private'
  | 'cgnat'
  | 'loopback'
  | 'link-local'
  | 'this-network'
  | 'documentation'
  | 'multicast'
  | 'reserved'
  | 'public';

export type CidrError =
  | { kind: 'empty' }
  | { kind: 'ipv6' }
  | { kind: 'format' }
  | { kind: 'leading-zero'; octet: string; fixed: string }
  | { kind: 'octet-range'; octet: string }
  | { kind: 'prefix'; prefix: string }
  | { kind: 'mask' };

export interface Subnet {
  ip: number;
  prefix: number;
  mask: number;
  wildcard: number;
  network: number;
  /** null for /31 and /32: they have no broadcast address. */
  broadcast: number | null;
  firstHost: number;
  lastHost: number;
  usable: number;
  total: number;
  type: AddressType;
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E';
}

export type ParseResult =
  { ok: true; subnet: Subnet; assumed32: boolean } | { ok: false; error: CidrError };

class InputError extends Error {
  constructor(readonly detail: CidrError) {
    super(detail.kind);
  }
}

export function toDotted(n: number): string {
  return [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');
}

export function toBinary(n: number): string {
  return [24, 16, 8, 0].map((s) => ((n >>> s) & 255).toString(2).padStart(8, '0')).join('.');
}

export function parseIp(text: string): number {
  const parts = text.split('.');
  if (parts.length !== 4) throw new InputError({ kind: 'format' });
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) throw new InputError({ kind: 'format' });
    if (p.length > 1 && p.startsWith('0')) {
      throw new InputError({ kind: 'leading-zero', octet: p, fixed: String(Number(p)) });
    }
    const v = Number(p);
    if (v > 255) throw new InputError({ kind: 'octet-range', octet: p });
    n = n * 256 + v;
  }
  return n >>> 0;
}

export function maskFromPrefix(p: number): number {
  return p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
}

/** Prefix length of a mask, or null when its ones are not contiguous (255.0.255.0). */
export function prefixFromMask(mask: number): number | null {
  const inverted = ~mask >>> 0;
  // A valid mask inverted is 2^k − 1: adding one leaves no bit in common.
  if ((inverted & (inverted + 1)) !== 0) return null;
  let p = 0;
  for (let m = mask; m & 0x80000000; m = (m << 1) >>> 0) p++;
  return p;
}

const inRange = (ip: number, base: string, bits: number) =>
  (ip & maskFromPrefix(bits)) >>> 0 === parseIp(base);

export function addressType(ip: number): AddressType {
  if (inRange(ip, '10.0.0.0', 8) || inRange(ip, '172.16.0.0', 12) || inRange(ip, '192.168.0.0', 16))
    return 'private';
  if (inRange(ip, '100.64.0.0', 10)) return 'cgnat';
  if (inRange(ip, '127.0.0.0', 8)) return 'loopback';
  if (inRange(ip, '169.254.0.0', 16)) return 'link-local';
  if (inRange(ip, '0.0.0.0', 8)) return 'this-network';
  if (
    inRange(ip, '192.0.2.0', 24) ||
    inRange(ip, '198.51.100.0', 24) ||
    inRange(ip, '203.0.113.0', 24)
  )
    return 'documentation';
  if (inRange(ip, '224.0.0.0', 4)) return 'multicast';
  if (inRange(ip, '240.0.0.0', 4)) return 'reserved';
  return 'public';
}

/** The historic class, from the first octet (only informative since CIDR, 1993). */
export function ipClass(ip: number): Subnet['ipClass'] {
  const first = ip >>> 24;
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D';
  return 'E';
}

export function subnet(ip: number, prefix: number): Subnet {
  const mask = maskFromPrefix(prefix);
  const network = (ip & mask) >>> 0;
  const wildcard = ~mask >>> 0;
  const last = (network | wildcard) >>> 0;
  const total = 2 ** (32 - prefix);
  const base = {
    ip,
    prefix,
    mask,
    wildcard,
    network,
    total,
    type: addressType(ip),
    ipClass: ipClass(ip),
  };
  if (prefix === 32) return { ...base, broadcast: null, firstHost: ip, lastHost: ip, usable: 1 };
  // RFC 3021: a /31 is a point-to-point link, both addresses are usable and there is no broadcast.
  if (prefix === 31)
    return { ...base, broadcast: null, firstHost: network, lastHost: last, usable: 2 };
  return {
    ...base,
    broadcast: last,
    firstHost: network + 1,
    lastHost: last - 1,
    usable: total - 2,
  };
}

/** "a.b.c.d/p", "a.b.c.d 255.255.255.0", "a.b.c.d/255.255.255.0" or a bare IP (taken as /32). */
export function parseCidr(input: string): ParseResult {
  const text = input.trim();
  if (!text) return { ok: false, error: { kind: 'empty' } };
  if (text.includes(':')) return { ok: false, error: { kind: 'ipv6' } };
  try {
    const m = /^([\d.]+)(?:\s*\/\s*([\d.]+)|\s+([\d.]+))?$/.exec(text);
    if (!m) throw new InputError({ kind: 'format' });
    const ip = parseIp(m[1]);
    const rest = m[2] ?? m[3];
    if (rest === undefined) return { ok: true, subnet: subnet(ip, 32), assumed32: true };
    let prefix: number;
    if (rest.includes('.')) {
      const p = prefixFromMask(parseIp(rest));
      if (p === null) throw new InputError({ kind: 'mask' });
      prefix = p;
    } else {
      if (!/^\d{1,2}$/.test(rest) || Number(rest) > 32) {
        throw new InputError({ kind: 'prefix', prefix: rest });
      }
      prefix = Number(rest);
    }
    return { ok: true, subnet: subnet(ip, prefix), assumed32: false };
  } catch (e) {
    if (e instanceof InputError) return { ok: false, error: e.detail };
    throw e;
  }
}
