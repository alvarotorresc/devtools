import { jsonPath } from '../json/logic';

export type ChangeKind = 'added' | 'removed' | 'changed';

export interface Change {
  kind: ChangeKind;
  path: string;
  /** Compact JSON, cut at PREVIEW_MAX characters. */
  before?: string;
  after?: string;
}

export interface DiffResult {
  changes: Change[];
  counts: Record<ChangeKind, number>;
  /** Changes found beyond the listing limit. */
  hidden: number;
}

export const MAX_CHANGES = 5000;
export const PREVIEW_MAX = 120;
export const DEBOUNCE_THRESHOLD = 100_000;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => v !== null && typeof v === 'object' && !Array.isArray(v);

/** A piece of punctuation already written as text, waiting on the stack. */
class Raw {
  constructor(readonly text: string) {}
}

/**
 * Compact JSON of `value`, built iteratively and stopped as soon as it passes `max` characters,
 * so a huge or very deep subtree costs no more than the preview itself.
 */
export function preview(value: unknown, max = PREVIEW_MAX): string {
  let out = '';
  const stack: unknown[] = [value];
  while (stack.length && out.length <= max) {
    const item = stack.pop();
    if (item instanceof Raw) {
      out += item.text;
    } else if (Array.isArray(item)) {
      stack.push(new Raw(']'));
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push(item[i]);
        if (i > 0) stack.push(new Raw(','));
      }
      out += '[';
    } else if (isObj(item)) {
      const keys = Object.keys(item);
      stack.push(new Raw('}'));
      for (let i = keys.length - 1; i >= 0; i--) {
        stack.push(item[keys[i]]);
        stack.push(new Raw(`${JSON.stringify(keys[i])}:`));
        if (i > 0) stack.push(new Raw(','));
      }
      out += '{';
    } else {
      out += JSON.stringify(item) ?? 'null';
    }
  }
  return out.length > max || stack.length ? `${out.slice(0, max - 1)}…` : out;
}

type Frame =
  | { kind: 'compare'; path: string; a: unknown; b: unknown }
  | { kind: 'emit'; change: () => Change; type: ChangeKind };

/**
 * Structural diff. Object keys are compared regardless of order; arrays are compared by index.
 * Uses an explicit stack instead of recursion, so 10 000 levels of nesting do not overflow.
 */
export function diffJson(a: unknown, b: unknown, limit = MAX_CHANGES): DiffResult {
  const changes: Change[] = [];
  const counts: Record<ChangeKind, number> = { added: 0, removed: 0, changed: 0 };
  const stack: Frame[] = [{ kind: 'compare', path: '$', a, b }];

  while (stack.length) {
    const f = stack.pop()!;
    if (f.kind === 'emit') {
      counts[f.type]++;
      // Previews are only built for the changes that will be listed.
      if (changes.length < limit) changes.push(f.change());
      continue;
    }
    const { path, a: x, b: y } = f;
    const next: Frame[] = [];
    if (isObj(x) && isObj(y)) {
      for (const k of Object.keys(x)) {
        const p = jsonPath(path, k);
        if (Object.hasOwn(y, k)) next.push({ kind: 'compare', path: p, a: x[k], b: y[k] });
        else
          next.push({
            kind: 'emit',
            type: 'removed',
            change: () => ({ kind: 'removed', path: p, before: preview(x[k]) }),
          });
      }
      for (const k of Object.keys(y)) {
        if (Object.hasOwn(x, k)) continue;
        const p = jsonPath(path, k);
        next.push({
          kind: 'emit',
          type: 'added',
          change: () => ({ kind: 'added', path: p, after: preview(y[k]) }),
        });
      }
    } else if (Array.isArray(x) && Array.isArray(y)) {
      const n = Math.max(x.length, y.length);
      for (let i = 0; i < n; i++) {
        const p = jsonPath(path, i);
        if (i >= y.length)
          next.push({
            kind: 'emit',
            type: 'removed',
            change: () => ({ kind: 'removed', path: p, before: preview(x[i]) }),
          });
        else if (i >= x.length)
          next.push({
            kind: 'emit',
            type: 'added',
            change: () => ({ kind: 'added', path: p, after: preview(y[i]) }),
          });
        else next.push({ kind: 'compare', path: p, a: x[i], b: y[i] });
      }
    } else if (x !== y) {
      next.push({
        kind: 'emit',
        type: 'changed',
        change: () => ({ kind: 'changed', path, before: preview(x), after: preview(y) }),
      });
    }
    // Reversed onto the stack, so changes come out in document order.
    for (let i = next.length - 1; i >= 0; i--) stack.push(next[i]);
  }
  return {
    changes,
    counts,
    hidden: counts.added + counts.removed + counts.changed - changes.length,
  };
}

const SYMBOL: Record<ChangeKind, string> = { added: '+', removed: '−', changed: '~' };

export function symbolOf(kind: ChangeKind): string {
  return SYMBOL[kind];
}

/** One line per change, for copying: "+ $.c: 4", "~ $.b: 2 → 3". */
export function reportText(changes: Change[]): string {
  return changes
    .map((c) =>
      c.kind === 'changed'
        ? `~ ${c.path}: ${c.before} → ${c.after}`
        : `${SYMBOL[c.kind]} ${c.path}: ${c.kind === 'added' ? c.after : c.before}`,
    )
    .join('\n');
}

export function shouldDebounce(a: string, b: string): boolean {
  return a.length + b.length > DEBOUNCE_THRESHOLD;
}
