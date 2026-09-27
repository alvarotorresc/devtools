<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatNumber, parseDecimal } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { percentChange, percentOf, whatPercent } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type Tab = 'of' | 'what' | 'change';
  type Stored = ReturnType<typeof persistedInput>;

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const ofX = persistedInput('percent', '21', remember);
  const ofY = persistedInput('percent-y', '200', remember);
  const whatX = persistedInput('percent-what-x', '42', remember);
  const whatY = persistedInput('percent-what-y', '200', remember);
  const chA = persistedInput('percent-a', '50', remember);
  const chB = persistedInput('percent-b', '75', remember);
  const all = [ofX, ofY, whatX, whatY, chA, chB];

  let tab = $state<Tab>('of');
  const num = (p: Stored) => parseDecimal(p.value, locale);
  const fmt = (n: number) => formatNumber(n, locale, 4);

  const out = $derived.by((): { value: string; lines: string[] } | { error: string } | null => {
    if (tab === 'of') {
      const x = num(ofX);
      const y = num(ofY);
      if (x === null || y === null) return null;
      const r = percentOf(x, y);
      const v = { x: fmt(x), y: fmt(y) };
      return {
        value: fmt(r.value),
        lines: [
          fill(s.of, { ...v, v: fmt(r.value) }),
          fill(s.plus, { ...v, v: fmt(r.plus) }),
          fill(s.minus, { ...v, v: fmt(r.minus) }),
        ],
      };
    }
    if (tab === 'what') {
      const x = num(whatX);
      const y = num(whatY);
      if (x === null || y === null) return null;
      const r = whatPercent(x, y);
      if (r === null) return { error: s.zeroY };
      return { value: `${fmt(r)} %`, lines: [fill(s.what, { x: fmt(x), y: fmt(y), v: fmt(r) })] };
    }
    const a = num(chA);
    const b = num(chB);
    if (a === null || b === null) return null;
    const r = percentChange(a, b);
    if (r === null) return { error: s.zeroA };
    const v = { a: fmt(a), b: fmt(b), v: fmt(Math.abs(r.value)) };
    return {
      value: `${r.value > 0 ? '+' : ''}${fmt(r.value)} %`,
      lines: [fill(s[r.kind], v)],
    };
  });

  const fields = $derived(
    tab === 'of'
      ? [
          { id: 'percent-x', label: s.x, store: ofX },
          { id: 'percent-y', label: s.y, store: ofY },
        ]
      : tab === 'what'
        ? [
            { id: 'percent-what-x', label: s.whatX, store: whatX },
            { id: 'percent-what-y', label: s.whatY, store: whatY },
          ]
        : [
            { id: 'percent-a', label: s.a, store: chA },
            { id: 'percent-b', label: s.b, store: chB },
          ],
  );
</script>

<div class="stack">
  <Segmented
    main
    label={s.tabs}
    options={[
      { value: 'of', label: meta.tabs![locale][0] },
      { value: 'what', label: meta.tabs![locale][1] },
      { value: 'change', label: meta.tabs![locale][2] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <div class="fields">
      {#each fields as f (f.id)}
        {@const bad = num(f.store) === null}
        <Field id={f.id} label={f.label} error={bad ? s.invalid : undefined}>
          {#snippet children({ describedby })}
            <input
              id={f.id}
              class="control mono"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={bad}
              value={f.store.value}
              oninput={(e) => (f.store.value = e.currentTarget.value)}
            />
          {/snippet}
        </Field>
      {/each}
    </div>

    <Display live label={s.result}>
      {#snippet head()}
        <span>{out && 'lines' in out ? out.lines[0] : out ? out.error : s.invalid}</span>
      {/snippet}
      {#if out && 'value' in out}
        <div class="display-value" id="percent-result">{out.value}</div>
        {#each out.lines.slice(1) as line (line)}<p class="display-note">{line}</p>{/each}
      {/if}
    </Display>

    <div class="row">
      <CopyButton main value={out && 'value' in out ? out.value : ''} {locale} />
    </div>

    <Toggle
      bind:checked={
        () => ofX.remember,
        (v) => {
          for (const p of all) p.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 16px;
  }
</style>
