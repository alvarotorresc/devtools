import { describe, expect, it } from 'vitest';
import { jsString, parseCurl, tokenize, toFetch, type CurlRequest } from './logic';

function request(cmd: string): CurlRequest {
  const r = parseCurl(cmd);
  if (!r.ok) throw new Error(`failed: ${JSON.stringify(r.error)}`);
  return r.request;
}

function warnings(cmd: string) {
  const r = parseCurl(cmd);
  if (!r.ok) throw new Error('failed');
  return r.warnings;
}

describe('tokenize', () => {
  it('handles single and double quotes', () => {
    expect(tokenize(`curl 'a b' "c \\"d\\" \\$e \\\\ \\x"`)).toEqual({
      ok: true,
      tokens: ['curl', 'a b', 'c "d" $e \\ \\x'],
    });
  });

  it('keeps single quotes literal and glues adjacent parts', () => {
    expect(tokenize(`curl -H'X-A: \\n'"b"c`)).toEqual({
      ok: true,
      tokens: ['curl', '-HX-A: \\nbc'],
    });
  });

  it('joins lines ending in a backslash', () => {
    expect(tokenize('curl \\\n  -X POST \\\r\n  https://a.test')).toEqual({
      ok: true,
      tokens: ['curl', '-X', 'POST', 'https://a.test'],
    });
  });

  it("understands ANSI-C quoting $'…'", () => {
    expect(tokenize(`curl $'a\\nb\\t\\x41\\u00e9\\'\\"\\\\'`)).toEqual({
      ok: true,
      tokens: ['curl', 'a\nb\tAé\'"\\'],
    });
  });

  it('escapes the next character outside quotes', () => {
    expect(tokenize('curl a\\ b\\"c')).toEqual({ ok: true, tokens: ['curl', 'a b"c'] });
  });

  it('reports unclosed quotes and Windows cmd quoting', () => {
    expect(tokenize(`curl 'abc`)).toEqual({ ok: false, error: 'unclosed-quote' });
    expect(tokenize('curl "abc')).toEqual({ ok: false, error: 'unclosed-quote' });
    expect(tokenize('curl ^"https://a.test^"')).toEqual({ ok: false, error: 'windows' });
  });
});

describe('parseCurl', () => {
  it('rejects what is not a curl command', () => {
    expect(parseCurl('')).toEqual({ ok: false, error: 'empty' });
    expect(parseCurl('wget https://a.test')).toEqual({ ok: false, error: 'not-curl' });
    expect(parseCurl('curl -X POST')).toEqual({ ok: false, error: 'no-url' });
    expect(parseCurl('curl https://a.test -H')).toEqual({
      ok: false,
      error: { kind: 'missing-value', option: '-H' },
    });
  });

  it('reads the URL with or without quotes, or from --url', () => {
    expect(request('curl https://a.test/x?y=1').url).toBe('https://a.test/x?y=1');
    expect(request("curl 'https://a.test/x?y=1&z=2'").url).toBe('https://a.test/x?y=1&z=2');
    expect(request('curl --url https://a.test -s').url).toBe('https://a.test');
  });

  it('adds http:// like curl when the scheme is missing', () => {
    expect(request('curl example.com').url).toBe('http://example.com');
    expect(warnings('curl example.com')).toEqual([{ kind: 'no-scheme' }]);
  });

  it('picks the method: -X, then -I, then POST with a body, else GET', () => {
    expect(request('curl -XPUT https://a.test -d x').method).toBe('PUT');
    expect(request('curl -I https://a.test').method).toBe('HEAD');
    expect(request('curl https://a.test -d x').method).toBe('POST');
    expect(request('curl https://a.test -F a=b').method).toBe('POST');
    expect(request('curl https://a.test').method).toBe('GET');
  });

  it('splits headers at the first colon; the last repeated one wins, with a warning', () => {
    const r = parseCurl('curl https://a.test -H "Accept: a" -H "X-Time: 10:30" -H "accept: b"');
    expect(r).toMatchObject({
      ok: true,
      request: {
        headers: [
          ['accept', 'b'],
          ['X-Time', '10:30'],
        ],
      },
      warnings: [{ kind: 'duplicate-header', name: 'accept' }],
    });
  });

  it('joins several -d with & and adds the form Content-Type like curl', () => {
    expect(request("curl https://a.test -d a=1 --data-raw '@b=2' --data-binary c=3")).toMatchObject(
      {
        body: 'a=1&@b=2&c=3',
        headers: [['Content-Type', 'application/x-www-form-urlencoded']],
      },
    );
  });

  it('warns that fetch cannot read @files', () => {
    expect(warnings('curl https://a.test -d @datos.json')).toEqual([
      { kind: 'data-file', file: 'datos.json' },
    ]);
  });

  it('warns that fetch cannot read a --json @file value, same as -d (M2)', () => {
    expect(warnings('curl https://a.test --json @body.json')).toEqual([
      { kind: 'data-file', file: 'body.json' },
    ]);
  });

  it('encodes --data-urlencode values', () => {
    expect(
      request(
        "curl https://a.test --data-urlencode 'q=a b&c' --data-urlencode '=x y' --data-urlencode 'z/1'",
      ).body,
    ).toBe('q=a%20b%26c&x%20y&z%2F1');
  });

  it('moves data to the query string with -G', () => {
    expect(request('curl -G https://a.test/s?x=1 -d q=gato -d n=2')).toMatchObject({
      url: 'https://a.test/s?x=1&q=gato&n=2',
      method: 'GET',
      body: null,
      headers: [],
    });
  });

  it('adds JSON headers with --json unless they were given', () => {
    expect(request(`curl https://a.test --json '{"a":1}' -H 'Accept: text/plain'`).headers).toEqual(
      [
        ['Accept', 'text/plain'],
        ['Content-Type', 'application/json'],
      ],
    );
  });

  it('builds Basic auth from the UTF-8 of user:password', () => {
    expect(request('curl -u ana:contraseña https://a.test').headers).toEqual([
      ['Authorization', 'Basic YW5hOmNvbnRyYXNlw7Fh'],
    ]);
  });

  it('turns -A and -b into headers, with their notes', () => {
    const r = parseCurl('curl https://a.test -A mi-agente -b sesion=1 -e https://ref.test -k');
    expect(r).toMatchObject({
      ok: true,
      request: {
        headers: [
          ['User-Agent', 'mi-agente'],
          ['Cookie', 'sesion=1'],
        ],
        referrer: 'https://ref.test',
      },
      warnings: [{ kind: 'user-agent' }, { kind: 'cookie' }, { kind: 'insecure' }],
    });
  });

  it('accepts grouped flags and ignores the ones that do not apply to fetch', () => {
    const r = parseCurl('curl -sSLv --compressed -o out.txt https://a.test -m 2.5');
    expect(r).toMatchObject({ ok: true, request: { timeoutSeconds: 2.5 }, warnings: [] });
  });

  it('lists unknown options as ignored, skipping the value of known value options', () => {
    expect(warnings('curl --foo --proxy http://p:8080 https://a.test -Z')).toEqual([
      { kind: 'unknown-option', option: '--foo' },
      { kind: 'unknown-option', option: '--proxy' },
      { kind: 'unknown-option', option: '-Z' },
    ]);
  });

  it('reads -F fields and marks files', () => {
    const r = parseCurl('curl https://a.test -F nombre=Ana -F foto=@yo.jpg -H "Content-Type: x"');
    expect(r).toMatchObject({
      ok: true,
      request: {
        headers: [],
        form: [
          { name: 'nombre', value: 'Ana', file: false },
          { name: 'foto', value: 'yo.jpg', file: true },
        ],
      },
      warnings: [{ kind: 'form-file', name: 'foto', file: 'yo.jpg' }],
    });
  });

  it('drops the body and warns instead of handing out a fetch call that would throw on GET/HEAD', () => {
    expect(request(`curl -X GET https://a.test -d '{"q":1}'`)).toMatchObject({
      method: 'GET',
      body: null,
      form: null,
    });
    expect(warnings(`curl -X GET https://a.test -d '{"q":1}'`)).toEqual([
      { kind: 'method-drops-body', method: 'GET' },
    ]);

    expect(request('curl -I https://a.test -d x')).toMatchObject({ method: 'HEAD', body: null });
    expect(warnings('curl -I https://a.test -d x')).toEqual([
      { kind: 'method-drops-body', method: 'HEAD' },
    ]);
  });
});

describe('toFetch', () => {
  it('writes the spec example with JSON.stringify', () => {
    const cmd = `curl -X POST https://api.example.com/u -H 'Content-Type: application/json' -d '{"a":1}'`;
    expect(toFetch(request(cmd), 'es')).toBe(
      [
        "const response = await fetch('https://api.example.com/u', {",
        "  method: 'POST',",
        '  headers: {',
        "    'Content-Type': 'application/json',",
        '  },',
        '  body: JSON.stringify({',
        '    "a": 1',
        '  }),',
        '});',
      ].join('\n'),
    );
  });

  it('leaves out every default', () => {
    expect(toFetch(request('curl https://a.test'), 'es')).toBe(
      "const response = await fetch('https://a.test');",
    );
  });

  it('keeps a body that is not valid JSON as a string, escaped', () => {
    const out = toFetch(
      request(`curl https://a.test -H 'Content-Type: application/json' -d "{'x'}"`),
      'es',
    );
    expect(out).toContain("  body: '{\\'x\\'}',");
  });

  it('writes FormData, the referrer and the timeout', () => {
    expect(
      toFetch(request('curl https://a.test -F a=1 -F f=@x.png -e https://r.test -m 3'), 'en'),
    ).toBe(
      [
        'const form = new FormData();',
        "form.append('a', '1');",
        '// x.png: fetch cannot read files from disk: use a File from an <input type="file">',
        "form.append('f', file);",
        '',
        "const response = await fetch('https://a.test', {",
        "  method: 'POST',",
        '  body: form,',
        "  referrer: 'https://r.test',",
        '  signal: AbortSignal.timeout(3000),',
        '});',
      ].join('\n'),
    );
  });

  it('quotes header names only when they are not identifiers', () => {
    const out = toFetch(request('curl https://a.test -H "Accept: */*" -H "X-Id: 1"'), 'es');
    expect(out).toContain("    Accept: '*/*',");
    expect(out).toContain("    'X-Id': '1',");
  });

  it("escapes a newline in a form file's name so it cannot break out of its `//` comment", () => {
    const out = toFetch(request(`curl https://a.test -F $'foto=@a\\nb'`), 'es');
    expect(out).toBe(
      [
        'const form = new FormData();',
        '// a\\nb: fetch no puede leer archivos del disco: usa un File de un <input type="file">',
        "form.append('foto', file);",
        '',
        "const response = await fetch('https://a.test', {",
        "  method: 'POST',",
        '  body: form,',
        '});',
      ].join('\n'),
    );
  });

  it('sends a JSON body as-is, as a string, when an integer is too big to round-trip', () => {
    const out = toFetch(
      request(
        `curl https://a.test -H 'Content-Type: application/json' -d '{"id":12345678901234567890}'`,
      ),
      'es',
    );
    expect(out).toContain(`  body: '{"id":12345678901234567890}',`);
    expect(out).not.toContain('12345678901234567000');
  });

  it('sends a JSON body as-is, as a string, when it has a literal __proto__ key (M1)', () => {
    const body = '{"__proto__":1,"b":2}';
    const out = toFetch(
      request(`curl https://a.test -H 'Content-Type: application/json' -d '${body}'`),
      'es',
    );
    // Computed via jsString itself, so the assertion does not depend on hand-counting backslashes.
    expect(out).toContain(`  body: ${jsString(body)},`);
    expect(out).not.toContain('JSON.stringify(');
  });

  it('also catches a __proto__ key spelled with a unicode escape (M1)', () => {
    // `_` is just "_": the raw JSON text never contains the literal substring `"__proto__"`,
    // but JSON.parse decodes the key to "__proto__" all the same, so the pretty-printed object
    // literal would still carry it. Checking the raw text (as the review's first pass suggested)
    // would miss this; checking the canonical JSON.stringify output does not.
    const body = '{"\\u005f_proto__":1,"b":2}';
    const out = toFetch(
      request(`curl https://a.test -H 'Content-Type: application/json' -d '${body}'`),
      'es',
    );
    expect(out).toContain(`  body: ${jsString(body)},`);
    expect(out).not.toContain('JSON.stringify(');
  });

  it('escapes JavaScript strings', () => {
    expect(jsString("a'b\\c\nd\u2028")).toBe("'a\\'b\\\\c\\nd\\u2028'");
  });
});
