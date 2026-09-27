import { describe, expect, it } from 'vitest';
import {
  bit,
  describeMode,
  isWorldWritable,
  parseOctal,
  parseSymbolic,
  toChmodSymbolic,
  toggle,
  toLs,
  toOctal,
  toSymbolic,
} from './logic';
import { sentenceWords } from './strings';

describe('octal', () => {
  it('reads 3 or 4 digits', () => {
    expect(parseOctal('755')).toEqual({ ok: true, mode: 0o755 });
    expect(parseOctal('0755')).toEqual({ ok: true, mode: 0o755 });
    expect(parseOctal('4755')).toEqual({ ok: true, mode: 0o4755 });
    expect(parseOctal(' 644 ')).toEqual({ ok: true, mode: 0o644 });
  });

  it('names the digit that is not octal', () => {
    expect(parseOctal('758')).toEqual({ ok: false, reason: 'digit', digit: '8' });
    expect(parseOctal('9')).toEqual({ ok: false, reason: 'digit', digit: '9' });
  });

  it('rejects the wrong number of digits', () => {
    expect(parseOctal('75')).toEqual({ ok: false, reason: 'length' });
    expect(parseOctal('12345')).toEqual({ ok: false, reason: 'length' });
    expect(parseOctal('rwx')).toEqual({ ok: false, reason: 'length' });
  });

  it('prints 4 digits only when a special bit is on', () => {
    expect(toOctal(0o755)).toBe('755');
    expect(toOctal(0o4755)).toBe('4755');
    expect(toOctal(0o1777)).toBe('1777');
    expect(toOctal(0)).toBe('000');
  });
});

describe('symbolic', () => {
  it('matches the classic examples', () => {
    expect(toSymbolic(0o755)).toBe('rwxr-xr-x');
    expect(toSymbolic(0o644)).toBe('rw-r--r--');
    expect(toSymbolic(0o600)).toBe('rw-------');
    expect(toLs(0o755)).toBe('-rwxr-xr-x');
    expect(toLs(0o755, 'd')).toBe('drwxr-xr-x');
  });

  it('shows setuid, setgid and sticky as s/S and t/T', () => {
    expect(toSymbolic(0o4755)).toBe('rwsr-xr-x');
    expect(toSymbolic(0o4644)).toBe('rwSr--r--');
    expect(toSymbolic(0o2755)).toBe('rwxr-sr-x');
    expect(toSymbolic(0o1777)).toBe('rwxrwxrwt');
    expect(toSymbolic(0o1776)).toBe('rwxrwxrwT');
  });

  it('parses 9 or 10 characters and round-trips', () => {
    expect(parseSymbolic('rwxr-xr-x')).toEqual({ ok: true, mode: 0o755, type: '-' });
    expect(parseSymbolic('drwxr-xr-x')).toEqual({ ok: true, mode: 0o755, type: 'd' });
    for (const mode of [0o644, 0o4755, 0o4644, 0o2755, 0o1777, 0o1776, 0o7777, 0]) {
      const r = parseSymbolic(toSymbolic(mode));
      expect(r.ok && r.mode).toBe(mode);
    }
  });

  it('points at the character that cannot go there', () => {
    expect(parseSymbolic('rwxrwxrwz')).toEqual({
      ok: false,
      reason: 'char',
      position: 9,
      char: 'z',
      expected: ['x', '-', 't', 'T'],
    });
    expect(parseSymbolic('rwxwwxrwx')).toMatchObject({ reason: 'char', position: 4, char: 'w' });
    expect(parseSymbolic('xrwxr-xr-x')).toMatchObject({ reason: 'char', position: 1 });
    expect(parseSymbolic('rwx')).toEqual({ ok: false, reason: 'length' });
  });
});

describe('chmod command and warnings', () => {
  it('builds the symbolic chmod argument', () => {
    expect(toChmodSymbolic(0o755)).toBe('u=rwx,g=rx,o=rx');
    expect(toChmodSymbolic(0o750)).toBe('u=rwx,g=rx,o=');
    expect(toChmodSymbolic(0o4755)).toBe('u=rwxs,g=rx,o=rx');
    expect(toChmodSymbolic(0o1777)).toBe('u=rwx,g=rwx,o=rwxt');
  });

  it('toggles single bits', () => {
    expect(toggle(0o755, bit('group', 'w'), true)).toBe(0o775);
    expect(toggle(0o775, bit('group', 'w'), false)).toBe(0o755);
  });

  it('warns when others can write', () => {
    expect(isWorldWritable(0o777)).toBe(true);
    expect(isWorldWritable(0o666)).toBe(true);
    expect(isWorldWritable(0o775)).toBe(false);
  });
});

describe('describeMode', () => {
  it('writes one sentence, merging classes with the same permissions', () => {
    expect(describeMode(0o755, sentenceWords.es, 'es')).toBe(
      'El propietario puede leer, escribir y ejecutar; el grupo y los demás, leer y ejecutar.',
    );
    expect(describeMode(0o640, sentenceWords.es, 'es')).toBe(
      'El propietario puede leer y escribir; el grupo, leer; los demás, nada.',
    );
    expect(describeMode(0o755, sentenceWords.en, 'en')).toBe(
      'The owner can read, write, and execute; the group and others, read and execute.',
    );
  });

  it('handles a mode with no permissions at all', () => {
    expect(describeMode(0, sentenceWords.es, 'es')).toBe(
      'El propietario, el grupo y los demás no tienen ningún permiso.',
    );
  });
});
