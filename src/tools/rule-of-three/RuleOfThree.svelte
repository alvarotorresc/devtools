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
  import { divisorOf, ruleOfThree, type Kind } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type Stored = ReturnType<typeof persistedInput>;

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const A = persistedInput('rule-of-three', '2', remember);
  const B = persistedInput('rule-of-three-b', '10', remember);
  const C = persistedInput('rule-of-three-c', '5', remember);

  let kind = $state<Kind>('direct');
  const num = (p: Stored) => parseDecimal(p.value, locale);
  const fmt = (n: number) => formatNumber(n, locale);

  const a = $derived(num(A));
  const b = $derived(num(B));
  const c = $derived(num(C));
  const x = $derived(a !== null && b !== null && c !== null ? ruleOfThree(kind, a, b, c) : null);
  const error = $derived.by(() => {
    if (a === null || b === null || c === null) return s.invalid;
    if (x === null) return fill(s.zero, { v: divisorOf(kind) });
    return undefined;
  });
  const formula = $derived(
    x === null
      ? ''
      : fill(kind === 'direct' ? s.formulaDirect : s.formulaInverse, {
          a: fmt(a!),
          b: fmt(b!),
          c: fmt(c!),
          x: fmt(x),
        }),
  );
</script>

{#snippet numberField(id: string, label: string, store: Stored)}
  {@const bad = num(store) === null}
  <Field {id} {label} error={bad ? s.invalid : undefined}>
    {#snippet children({ describedby })}
      <input
        {id}
        class="control mono"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck="false"
        aria-describedby={describedby}
        aria-invalid={bad}
        value={store.value}
        oninput={(e) => (store.value = e.currentTarget.value)}
      />
    {/snippet}
  </Field>
{/snippet}

<div class="stack">
  <Segmented
    main
    label={s.tabs}
    options={[
      { value: 'direct', label: meta.tabs![locale][0] },
      { value: 'inverse', label: meta.tabs![locale][1] },
    ]}
    bind:value={kind}
  />

  <div class="panel">
    <p class="help">{kind === 'direct' ? s.directHelp : s.inverseHelp}</p>
    <div class="grid">
      <span class="word">{s.if}</span>
      {@render numberField('rot-a', s.a, A)}
      <span class="arrow" aria-hidden="true">→</span>
      {@render numberField('rot-b', s.b, B)}
      <span class="word">{s.then}</span>
      {@render numberField('rot-c', s.c, C)}
      <span class="arrow" aria-hidden="true">→</span>
      <div class="x">
        <span class="x-label">{s.x}</span>
        <output class="control mono" for="rot-a rot-b rot-c">{x === null ? '' : fmt(x)}</output>
      </div>
    </div>

    <Display live label={s.result}>
      {#snippet head()}<span>{error ?? formula}</span>{/snippet}
      {#if x !== null}<div class="display-value" id="rot-x">{fmt(x)}</div>{/if}
    </Display>

    <div class="row">
      <CopyButton main value={x === null ? '' : fmt(x)} {locale} />
    </div>

    <Toggle
      bind:checked={
        () => A.remember,
        (v) => {
          A.remember = v;
          B.remember = v;
          C.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .help {
    font-size: 14px;
    color: var(--text-dim);
  }
  .grid {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: end;
    gap: 12px 12px;
  }
  .word,
  .arrow {
    padding-bottom: 12px;
    font-weight: 600;
  }
  .arrow {
    color: var(--text-dim);
  }
  .x {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .x-label {
    font-size: 13px;
    font-weight: 600;
  }
  output {
    display: flex;
    align-items: center;
    background: var(--well);
  }
  @media (max-width: 480px) {
    .grid {
      grid-template-columns: auto minmax(0, 1fr);
    }
    .arrow {
      display: none;
    }
    .word {
      grid-column: 1 / -1;
      padding-bottom: 0;
    }
  }
</style>
