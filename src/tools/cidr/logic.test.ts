import { describe, expect, it } from 'vitest';
import {
  addressType,
  ipClass,
  maskFromPrefix,
  parseCidr,
  parseIp,
  prefixFromMask,
  toBinary,
  toDotted,
  type Subnet,
} from './logic';

function net(input: string): Subnet {
  const r = parseCidr(input);
  if (!r.ok) throw new Error(`failed: ${input}`);
  return r.subnet;
}

function dotted(s: Subnet) {
  return {
    network: toDotted(s.network),
    mask: toDotted(s.mask),
    wildcard: toDotted(s.wildcard),
    broadcast: s.broadcast === null ? null : toDotted(s.broadcast),
    first: toDotted(s.firstHost),
    last: toDotted(s.lastHost),
    usable: s.usable,
    total: s.total,
  };
}

describe('subnet math (spec vectors)', () => {
  it('192.168.1.10/24', () => {
    expect(dotted(net('192.168.1.10/24'))).toEqual({
      network: '192.168.1.0',
      mask: '255.255.255.0',
      wildcard: '0.0.0.255',
      broadcast: '192.168.1.255',
      first: '192.168.1.1',
      last: '192.168.1.254',
      usable: 254,
      total: 256,
    });
  });

  it('10.0.0.7/31 is a point-to-point link (RFC 3021)', () => {
    expect(dotted(net('10.0.0.7/31'))).toEqual({
      network: '10.0.0.6',
      mask: '255.255.255.254',
      wildcard: '0.0.0.1',
      broadcast: null,
      first: '10.0.0.6',
      last: '10.0.0.7',
      usable: 2,
      total: 2,
    });
  });

  it('172.16.5.4/20', () => {
    expect(dotted(net('172.16.5.4/20'))).toMatchObject({
      network: '172.16.0.0',
      broadcast: '172.16.15.255',
      first: '172.16.0.1',
      last: '172.16.15.254',
      usable: 4094,
    });
  });

  it('/32 is a single host and /0 is the whole space', () => {
    expect(dotted(net('8.8.8.8/32'))).toEqual({
      network: '8.8.8.8',
      mask: '255.255.255.255',
      wildcard: '0.0.0.0',
      broadcast: null,
      first: '8.8.8.8',
      last: '8.8.8.8',
      usable: 1,
      total: 1,
    });
    expect(dotted(net('200.1.2.3/0'))).toEqual({
      network: '0.0.0.0',
      mask: '0.0.0.0',
      wildcard: '255.255.255.255',
      broadcast: '255.255.255.255',
      first: '0.0.0.1',
      last: '255.255.255.254',
      usable: 4294967294,
      total: 4294967296,
    });
  });

  it('stays unsigned at the top of the range', () => {
    expect(dotted(net('255.255.255.255/30'))).toMatchObject({
      network: '255.255.255.252',
      broadcast: '255.255.255.255',
      usable: 2,
    });
  });
});

describe('parseCidr', () => {
  it('accepts a mask after a space or a slash', () => {
    expect(net('192.168.1.10 255.255.255.0').prefix).toBe(24);
    expect(net('192.168.1.10/255.255.240.0').prefix).toBe(20);
  });

  it('takes a bare IP as /32 and says so', () => {
    expect(parseCidr('10.1.2.3')).toMatchObject({
      ok: true,
      assumed32: true,
      subnet: { prefix: 32 },
    });
  });

  it('rejects leading zeros, suggesting the plain number', () => {
    expect(parseCidr('192.168.010.1/24')).toEqual({
      ok: false,
      error: { kind: 'leading-zero', octet: '010', fixed: '10' },
    });
  });

  it('rejects bad octets, prefixes, masks and IPv6', () => {
    expect(parseCidr('256.1.1.1')).toEqual({
      ok: false,
      error: { kind: 'octet-range', octet: '256' },
    });
    expect(parseCidr('1.2.3/24')).toEqual({ ok: false, error: { kind: 'format' } });
    expect(parseCidr('1.2.3.4/33')).toEqual({ ok: false, error: { kind: 'prefix', prefix: '33' } });
    expect(parseCidr('1.2.3.4 255.0.255.0')).toEqual({ ok: false, error: { kind: 'mask' } });
    expect(parseCidr('2001:db8::/32')).toEqual({ ok: false, error: { kind: 'ipv6' } });
    expect(parseCidr(' ')).toEqual({ ok: false, error: { kind: 'empty' } });
  });
});

describe('masks', () => {
  it('converts between prefixes and masks', () => {
    expect(toDotted(maskFromPrefix(0))).toBe('0.0.0.0');
    expect(toDotted(maskFromPrefix(1))).toBe('128.0.0.0');
    expect(toDotted(maskFromPrefix(32))).toBe('255.255.255.255');
    for (let p = 0; p <= 32; p++) expect(prefixFromMask(maskFromPrefix(p))).toBe(p);
    expect(prefixFromMask(parseIp('255.0.255.0'))).toBeNull();
    expect(prefixFromMask(parseIp('0.255.255.255'))).toBeNull();
  });

  it('prints the mask in binary with dots between octets', () => {
    expect(toBinary(maskFromPrefix(20))).toBe('11111111.11111111.11110000.00000000');
  });
});

describe('address types and classes', () => {
  const type = (ip: string) => addressType(parseIp(ip));

  it('recognises the special ranges', () => {
    expect(type('10.20.30.40')).toBe('private');
    expect(type('172.31.255.255')).toBe('private');
    expect(type('172.32.0.1')).toBe('public');
    expect(type('192.168.0.1')).toBe('private');
    expect(type('100.64.0.1')).toBe('cgnat');
    expect(type('100.128.0.1')).toBe('public');
    expect(type('127.0.0.1')).toBe('loopback');
    expect(type('169.254.10.1')).toBe('link-local');
    expect(type('0.1.2.3')).toBe('this-network');
    expect(type('192.0.2.5')).toBe('documentation');
    expect(type('198.51.100.5')).toBe('documentation');
    expect(type('203.0.113.5')).toBe('documentation');
    expect(type('224.0.0.251')).toBe('multicast');
    expect(type('240.0.0.1')).toBe('reserved');
    expect(type('8.8.8.8')).toBe('public');
  });

  it('gives the historic class', () => {
    expect(ipClass(parseIp('10.0.0.1'))).toBe('A');
    expect(ipClass(parseIp('172.16.0.1'))).toBe('B');
    expect(ipClass(parseIp('192.168.0.1'))).toBe('C');
    expect(ipClass(parseIp('224.0.0.1'))).toBe('D');
    expect(ipClass(parseIp('250.0.0.1'))).toBe('E');
  });
});
