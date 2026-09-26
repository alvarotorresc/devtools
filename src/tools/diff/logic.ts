export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

/** Legacy shape, kept for `computeDiff`. */
export interface DiffLine {
  type: 'add' | 'remove' | 'equal';
  text: string;
}

export type Op =
  | { type: 'equal'; oldText: string; newText: string; oldNo: number; newNo: number }
  | { type: 'remove'; oldText: string; oldNo: number }
  | { type: 'add'; newText: string; newNo: number };

export interface Segment {
  text: string;
  changed: boolean;
}

export interface Side {
  no: number;
  segments: Segment[];
}

export interface Row {
  type: 'equal' | 'change' | 'remove' | 'add';
  left: Side | null;
  right: Side | null;
}

export type Item = { kind: 'row'; row: Row } | { kind: 'skip'; count: number };

export interface DiffResult {
  ops: Op[];
  tooLarge: boolean;
}

/** Above this many cells, the LCS table would use too much memory and time. */
export const MAX_CELLS = 10_000_000;
export const DEBOUNCE_THRESHOLD = 20_000;
const MAX_WORD_TOKENS = 2_000;

export function normalizeLine(s: string, opts: DiffOptions): string {
  let out = s;
  if (opts.ignoreWhitespace) out = out.replace(/\s+/g, ' ').trim();
  if (opts.ignoreCase) out = out.toLowerCase();
  return out;
}

/**
 * Longest-common-subsequence over two key arrays. Returns pairs [i, j] of matching indexes,
 * or null when the table would exceed MAX_CELLS.
 */
function lcsPairs(a: string[], b: string[]): [number, number][] | null {
  const m = a.length;
  const n = b.length;
  if ((m + 1) * (n + 1) > MAX_CELLS) return null;
  const w = n + 1;
  // LCS lengths never exceed min(m, n) ≤ sqrt(MAX_CELLS) < 65536, so 16 bits are enough.
  const dp = new Uint16Array((m + 1) * w);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i * w + j] =
        a[i - 1] === b[j - 1]
          ? dp[(i - 1) * w + j - 1] + 1
          : Math.max(dp[(i - 1) * w + j], dp[i * w + j - 1]);
    }
  }
  const pairs: [number, number][] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      pairs.push([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i * w + j - 1] >= dp[(i - 1) * w + j]) {
      j--;
    } else {
      i--;
    }
  }
  return pairs.reverse();
}

export function diffLines(a: string[], b: string[], opts: DiffOptions = {}): DiffResult {
  const ka = a.map((l) => normalizeLine(l, opts));
  const kb = b.map((l) => normalizeLine(l, opts));

  // Equal head and tail never need the LCS table: this keeps big, mostly-equal texts cheap.
  let start = 0;
  while (start < ka.length && start < kb.length && ka[start] === kb[start]) start++;
  let endA = ka.length;
  let endB = kb.length;
  while (endA > start && endB > start && ka[endA - 1] === kb[endB - 1]) {
    endA--;
    endB--;
  }

  const mid = lcsPairs(ka.slice(start, endA), kb.slice(start, endB));
  const tooLarge = mid === null;
  const pairs: [number, number][] = [];
  for (let k = 0; k < start; k++) pairs.push([k, k]);
  for (const [i, j] of mid ?? []) pairs.push([i + start, j + start]);
  for (let k = 0; k < ka.length - endA; k++) pairs.push([endA + k, endB + k]);

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  for (const [pi, pj] of [...pairs, [a.length, b.length] as [number, number]]) {
    while (i < pi) {
      ops.push({ type: 'remove', oldText: a[i], oldNo: i + 1 });
      i++;
    }
    while (j < pj) {
      ops.push({ type: 'add', newText: b[j], newNo: j + 1 });
      j++;
    }
    if (pi < a.length && pj < b.length) {
      ops.push({ type: 'equal', oldText: a[pi], newText: b[pj], oldNo: pi + 1, newNo: pj + 1 });
      i++;
      j++;
    }
  }
  return { ops, tooLarge };
}

/** Legacy API: line diff without options. */
export function computeDiff(a: string[], b: string[]): DiffLine[] {
  return diffLines(a, b).ops.map((op) => ({
    type: op.type,
    text: op.type === 'add' ? op.newText : op.oldText,
  }));
}

export function splitLines(text: string): string[] {
  return text === '' ? [] : text.replace(/\r\n?/g, '\n').split('\n');
}

const TOKEN = /\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu;

export function tokenize(s: string): string[] {
  return s.match(TOKEN) ?? [];
}

/** Word-level diff inside a changed line: marks the tokens that differ on each side. */
export function diffWords(
  oldText: string,
  newText: string,
  opts: DiffOptions = {},
): { old: Segment[]; new: Segment[] } {
  const ta = tokenize(oldText);
  const tb = tokenize(newText);
  if (ta.length > MAX_WORD_TOKENS || tb.length > MAX_WORD_TOKENS) {
    return { old: [{ text: oldText, changed: true }], new: [{ text: newText, changed: true }] };
  }
  const key = (t: string) => {
    if (opts.ignoreWhitespace && /^\s+$/.test(t)) return ' ';
    return opts.ignoreCase ? t.toLowerCase() : t;
  };
  const pairs = lcsPairs(ta.map(key), tb.map(key)) ?? [];
  const oldSet = new Set(pairs.map(([i]) => i));
  const newSet = new Set(pairs.map(([, j]) => j));
  return { old: mergeSegments(ta, oldSet), new: mergeSegments(tb, newSet) };
}

function mergeSegments(tokens: string[], kept: Set<number>): Segment[] {
  const out: Segment[] = [];
  tokens.forEach((text, i) => {
    const changed = !kept.has(i);
    const last = out[out.length - 1];
    if (last && last.changed === changed) last.text += text;
    else out.push({ text, changed });
  });
  return out;
}

const plain = (text: string): Segment[] => [{ text, changed: false }];
const whole = (text: string): Segment[] => [{ text, changed: true }];

/** Pairs each block of removed lines with the added lines that follow it, for word diffs and the split view. */
export function toRows(ops: Op[], opts: DiffOptions = {}): Row[] {
  const rows: Row[] = [];
  let k = 0;
  while (k < ops.length) {
    const op = ops[k];
    if (op.type === 'equal') {
      rows.push({
        type: 'equal',
        left: { no: op.oldNo, segments: plain(op.oldText) },
        right: { no: op.newNo, segments: plain(op.newText) },
      });
      k++;
      continue;
    }
    const removed: Extract<Op, { type: 'remove' }>[] = [];
    const added: Extract<Op, { type: 'add' }>[] = [];
    while (k < ops.length && ops[k].type === 'remove')
      removed.push(ops[k++] as Extract<Op, { type: 'remove' }>);
    while (k < ops.length && ops[k].type === 'add')
      added.push(ops[k++] as Extract<Op, { type: 'add' }>);
    const n = Math.max(removed.length, added.length);
    for (let x = 0; x < n; x++) {
      const r = removed[x];
      const a = added[x];
      if (r && a) {
        const w = diffWords(r.oldText, a.newText, opts);
        rows.push({
          type: 'change',
          left: { no: r.oldNo, segments: w.old },
          right: { no: a.newNo, segments: w.new },
        });
      } else if (r) {
        rows.push({
          type: 'remove',
          left: { no: r.oldNo, segments: whole(r.oldText) },
          right: null,
        });
      } else {
        rows.push({ type: 'add', left: null, right: { no: a.newNo, segments: whole(a.newText) } });
      }
    }
  }
  return rows;
}

/** Keeps `context` equal rows around each change and replaces longer equal runs with a "skip" marker. */
export function collapse(rows: Row[], context = 3): Item[] {
  const keep = rows.map((r) => r.type !== 'equal');
  const near = keep.map((_, i) => {
    for (let d = -context; d <= context; d++) if (keep[i + d]) return true;
    return false;
  });
  const items: Item[] = [];
  let skipped = 0;
  rows.forEach((row, i) => {
    if (near[i]) {
      if (skipped) items.push({ kind: 'skip', count: skipped });
      skipped = 0;
      items.push({ kind: 'row', row });
    } else {
      skipped++;
    }
  });
  if (skipped) items.push({ kind: 'skip', count: skipped });
  return items;
}

export function countChanges(ops: Op[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.type === 'add') added++;
    else if (op.type === 'remove') removed++;
  }
  return { added, removed };
}

/** Plain-text unified view ("-", "+" and two spaces), for copying. */
export function unifiedText(ops: Op[]): string {
  return ops
    .map((op) =>
      op.type === 'equal'
        ? `  ${op.newText}`
        : op.type === 'add'
          ? `+ ${op.newText}`
          : `- ${op.oldText}`,
    )
    .join('\n');
}

export function shouldDebounce(a: string, b: string): boolean {
  return a.length + b.length > DEBOUNCE_THRESHOLD;
}
