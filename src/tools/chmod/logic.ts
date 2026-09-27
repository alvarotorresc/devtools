/** A Unix mode: 12 bits, 0 to 0o7777 (setuid, setgid, sticky, then rwx for u, g and o). */
export type Mode = number;
export type Who = 'owner' | 'group' | 'others';
export type Perm = 'r' | 'w' | 'x';

export const WHO: Who[] = ['owner', 'group', 'others'];
export const PERMS: Perm[] = ['r', 'w', 'x'];
export const SETUID = 0o4000;
export const SETGID = 0o2000;
export const STICKY = 0o1000;
export const PRESETS = ['644', '755', '600', '700', '777'];

const SHIFT: Record<Who, number> = { owner: 6, group: 3, others: 0 };
const VALUE: Record<Perm, number> = { r: 4, w: 2, x: 1 };
const SPECIAL: Record<Who, number> = { owner: SETUID, group: SETGID, others: STICKY };
const SPECIAL_CHAR: Record<Who, [string, string]> = {
  owner: ['s', 'S'],
  group: ['s', 'S'],
  others: ['t', 'T'],
};
const FILE_TYPES = '-dlcbps';

export function bit(who: Who, perm: Perm): number {
  return VALUE[perm] << SHIFT[who];
}

export function has(mode: Mode, mask: number): boolean {
  return (mode & mask) !== 0;
}

export function toggle(mode: Mode, mask: number, on: boolean): Mode {
  return on ? mode | mask : mode & ~mask;
}

export type OctalResult =
  | { ok: true; mode: Mode }
  | { ok: false; reason: 'digit'; digit: string }
  | { ok: false; reason: 'length' };

/** "755", "0755" or "4755". */
export function parseOctal(input: string): OctalResult {
  const s = input.trim();
  const bad = /[89]/.exec(s);
  if (bad && /^\d+$/.test(s)) return { ok: false, reason: 'digit', digit: bad[0] };
  if (!/^[0-7]{3,4}$/.test(s)) return { ok: false, reason: 'length' };
  return { ok: true, mode: parseInt(s, 8) };
}

/** 3 digits, or 4 when setuid, setgid or sticky is on. */
export function toOctal(mode: Mode): string {
  return mode > 0o777 ? mode.toString(8).padStart(4, '0') : mode.toString(8).padStart(3, '0');
}

export type SymbolicResult =
  | { ok: true; mode: Mode; type: string }
  | { ok: false; reason: 'length' }
  | { ok: false; reason: 'char'; position: number; char: string; expected: string[] };

/** "rwxr-xr-x" or, like `ls -l`, "-rwxr-xr-x" / "drwxr-xr-x". Positions in errors are 1-based. */
export function parseSymbolic(input: string): SymbolicResult {
  const s = input.trim();
  if (s.length !== 9 && s.length !== 10) return { ok: false, reason: 'length' };
  let type = '-';
  let offset = 0;
  if (s.length === 10) {
    if (!FILE_TYPES.includes(s[0])) {
      return { ok: false, reason: 'char', position: 1, char: s[0], expected: [...FILE_TYPES] };
    }
    type = s[0];
    offset = 1;
  }
  let mode = 0;
  for (let w = 0; w < 3; w++) {
    const who = WHO[w];
    for (let p = 0; p < 3; p++) {
      const perm = PERMS[p];
      const i = offset + w * 3 + p;
      const c = s[i];
      const [special, specialNoX] = SPECIAL_CHAR[who];
      const expected = perm === 'x' ? ['x', '-', special, specialNoX] : [perm, '-'];
      if (!expected.includes(c)) {
        return { ok: false, reason: 'char', position: i + 1, char: c, expected };
      }
      if (c === perm || c === special) mode |= bit(who, perm);
      if (perm === 'x' && (c === special || c === specialNoX)) mode |= SPECIAL[who];
    }
  }
  return { ok: true, mode, type };
}

/** "rwxr-xr-x", with s/S and t/T in the x positions for the special bits. */
export function toSymbolic(mode: Mode): string {
  let out = '';
  for (const who of WHO) {
    for (const perm of PERMS) {
      const on = has(mode, bit(who, perm));
      if (perm === 'x' && has(mode, SPECIAL[who])) {
        const [special, specialNoX] = SPECIAL_CHAR[who];
        out += on ? special : specialNoX;
      } else {
        out += on ? perm : '-';
      }
    }
  }
  return out;
}

export function toLs(mode: Mode, type = '-'): string {
  return type + toSymbolic(mode);
}

/** "u=rwx,g=rx,o=rx"; a class with no permissions stays as "o=". */
export function toChmodSymbolic(mode: Mode): string {
  const letter: Record<Who, string> = { owner: 'u', group: 'g', others: 'o' };
  return WHO.map((who) => {
    let perms = PERMS.filter((p) => has(mode, bit(who, p))).join('');
    if (has(mode, SPECIAL[who])) perms += who === 'others' ? 't' : 's';
    return `${letter[who]}=${perms}`;
  }).join(',');
}

/** Anyone on the machine can modify the file. */
export function isWorldWritable(mode: Mode): boolean {
  return has(mode, bit('others', 'w'));
}

export interface SentenceWords {
  owner: string;
  group: string;
  others: string;
  r: string;
  w: string;
  x: string;
  can: string;
  canPlural: string;
  nothing: string;
  nothingPlural: string;
  none: string;
}

/**
 * "El propietario puede leer, escribir y ejecutar; el grupo y los demás, leer y ejecutar."
 * Classes with the same permissions are merged; `locale` only drives Intl.ListFormat.
 */
export function describeMode(mode: Mode, words: SentenceWords, locale: string): string {
  const list = new Intl.ListFormat(locale, { type: 'conjunction' });
  const groups: { who: Who[]; perms: Perm[] }[] = [];
  for (const who of WHO) {
    const perms = PERMS.filter((p) => has(mode, bit(who, p)));
    const same = groups.find((g) => g.perms.join('') === perms.join(''));
    if (same) same.who.push(who);
    else groups.push({ who: [who], perms });
  }
  const clauses = groups.map((g, i) => {
    const subject = list.format(g.who.map((w) => words[w]));
    const plural = g.who.length > 1 || g.who[0] === 'others';
    const perms = list.format(g.perms.map((p) => words[p]));
    if (i > 0) return `${subject}, ${g.perms.length ? perms : words.none}`;
    const first = subject.charAt(0).toUpperCase() + subject.slice(1);
    if (!g.perms.length) return `${first} ${plural ? words.nothingPlural : words.nothing}`;
    return `${first} ${plural ? words.canPlural : words.can} ${perms}`;
  });
  return clauses.join('; ') + '.';
}
