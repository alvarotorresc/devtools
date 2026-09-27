<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { cssSnippet, DEFAULT_BASE, fmt, parseCssNumber, sizeTable } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type FieldId = 'px' | 'rem' | 'em';
  const FIELDS: FieldId[] = ['px', 'rem', 'em'];

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  // Only the base and the parent are remembered; px is the canonical value on screen.
  const base = persistedInput('px-rem', String(DEFAULT_BASE), remember);
  const parent = persistedInput('px-rem-parent', '', remember);

  const baseN = $derived(parseCssNumber(base.value));
  const parentN = $derived(parent.value.trim() ? parseCssNumber(parent.value) : baseN);
  const baseOk = $derived(baseN !== null && baseN > 0);
  const parentOk = $derived(parentN !== null && parentN > 0);
  const baseError = $derived(baseN === null ? s.invalid : baseN <= 0 ? s.baseZero : undefined);
  const parentError = $derived(
    !parent.value.trim()
      ? undefined
      : parentN === null
        ? s.invalid
        : parentN <= 0
          ? s.parentZero
          : undefined,
  );

  let px = $state(24);
  let texts = $state<Record<FieldId, string>>({ px: '24', rem: '1.5', em: '1.5' });
  let invalid = $state<Record<FieldId, boolean>>({ px: false, rem: false, em: false });

  function computed(f: FieldId): string {
    if (f === 'px') return fmt(px);
    if (f === 'rem') return baseOk ? fmt(px / baseN!) : '';
    return parentOk ? fmt(px / parentN!) : '';
  }

  /** Rewrites every field from px, except the one being typed in (so the cursor stays put). */
  function sync(except: FieldId | null) {
    for (const f of FIELDS) {
      if (f !== except) {
        texts[f] = computed(f);
        invalid[f] = false;
      }
    }
  }

  onMount(() => sync(null));

  // A new base or parent recomputes rem and em from the current px.
  $effect(() => {
    void baseN;
    void parentN;
    untrack(() => sync(null));
  });

  function onField(f: FieldId, value: string) {
    texts[f] = value;
    const n = parseCssNumber(value);
    const ready = f === 'px' || (f === 'rem' ? baseOk : parentOk);
    invalid[f] = n === null;
    if (n === null || !ready) return;
    px = f === 'px' ? n : f === 'rem' ? n * baseN! : n * parentN!;
    sync(f);
  }

  const snippet = $derived(baseOk ? cssSnippet(px, baseN!) : '');
  const table = $derived(baseOk ? sizeTable(baseN!) : []);
</script>

<div class="panel">
  <div class="grid">
    <Field id="px-rem-base" label={s.base} help={s.baseHelp} error={baseError}>
      {#snippet children({ describedby })}
        <input
          id="px-rem-base"
          class="control mono"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          spellcheck="false"
          aria-describedby={describedby}
          aria-invalid={!!baseError}
          bind:value={base.value}
        />
      {/snippet}
    </Field>
    <Field id="px-rem-parent" label={s.parent} help={s.parentHelp} error={parentError}>
      {#snippet children({ describedby })}
        <input
          id="px-rem-parent"
          class="control mono"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          spellcheck="false"
          placeholder={baseOk ? fmt(baseN!) : ''}
          aria-describedby={describedby}
          aria-invalid={!!parentError}
          bind:value={parent.value}
        />
      {/snippet}
    </Field>
  </div>

  <div class="grid">
    {#each FIELDS as f (f)}
      <Field id="px-rem-{f}" label={s[f]} error={invalid[f] ? s.invalid : undefined}>
        {#snippet children({ describedby })}
          <input
            id="px-rem-{f}"
            class="control mono"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            aria-invalid={invalid[f]}
            value={texts[f]}
            oninput={(e) => onField(f, e.currentTarget.value)}
            onblur={() => {
              if (!invalid[f]) texts[f] = computed(f);
            }}
          />
        {/snippet}
      </Field>
    {/each}
  </div>

  <Display label={s.css}>
    {#snippet head()}<span>{s.css}</span>{/snippet}
    <pre class="display-code">{snippet}</pre>
  </Display>
  <div class="row">
    <CopyButton main value={snippet} {locale} />
  </div>

  {#if table.length}
    <Display label={s.table}>
      {#snippet head()}<span>{s.table}</span>{/snippet}
      <div class="display-rows">
        {#each table as r (r.px)}
          <div class="display-row">
            <span>{r.px}px = {r.rem}rem</span>
            <CopyButton
              value={`${r.rem}rem`}
              {locale}
              compact
              ariaLabel={fill(s.copyRem, { v: r.rem })}
            />
          </div>
        {/each}
      </div>
    </Display>
  {/if}

  <Toggle
    bind:checked={
      () => base.remember,
      (v) => {
        base.remember = v;
        parent.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
    gap: 16px;
  }
</style>
