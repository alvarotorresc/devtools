<script lang="ts">
  import { untrack } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    DIGITS,
    MAX_BASE,
    MIN_BASE,
    bitLength,
    formatBigInt,
    groupDigits,
    groupSizeFor,
    parseBigInt,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type FieldId = 'bin' | 'oct' | 'dec' | 'hex' | 'custom';
  const FIELDS: FieldId[] = ['bin', 'oct', 'dec', 'hex', 'custom'];

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // The canonical value is the decimal string, which is also what gets remembered.
  const input = persistedInput('number-base', '255', meta.rememberInput ?? true);

  let customBase = $state(36);
  let grouping = $state(false);

  const baseOf = (f: FieldId) => ({ bin: 2, oct: 8, dec: 10, hex: 16, custom: customBase })[f];
  const value = $derived(input.value.trim() ? parseBigInt(input.value, 10) : null);

  function render(n: bigint | null, f: FieldId): string {
    if (n === null) return '';
    const base = baseOf(f);
    const digits = formatBigInt(n, base, true);
    return grouping ? groupDigits(digits, groupSizeFor(base)) : digits;
  }

  let texts = $state<Record<FieldId, string>>({
    bin: '11111111',
    oct: '377',
    dec: '255',
    hex: 'FF',
    custom: '73',
  });
  let invalid = $state<Record<FieldId, boolean>>({
    bin: false,
    oct: false,
    dec: false,
    hex: false,
    custom: false,
  });

  function sync(except: FieldId | null) {
    for (const f of FIELDS) {
      if (f !== except) {
        texts[f] = render(value, f);
        invalid[f] = false;
      }
    }
  }

  // Re-render every field on mount (after the remembered value loads) and when grouping or the
  // custom base change. `untrack` keeps typing in a field from re-running this and moving the cursor.
  $effect(() => {
    void grouping;
    void customBase;
    untrack(() => sync(null));
  });

  function onField(f: FieldId, raw: string) {
    texts[f] = raw;
    if (!raw.trim()) {
      invalid[f] = false;
      input.value = '';
      sync(f);
      return;
    }
    const n = parseBigInt(raw, baseOf(f));
    invalid[f] = n === null;
    if (n === null) return;
    input.value = n.toString(10);
    sync(f);
  }

  const labelOf = (f: FieldId) => (f === 'custom' ? fill(s.custom, { b: customBase }) : s[f]);
  const digitsOf = (f: FieldId) => {
    const base = baseOf(f);
    return base <= 10 ? `0-${base - 1}` : fill(s.digitsLetters, { last: DIGITS[base - 1] });
  };
</script>

<div class="panel">
  <div class="fields">
    {#each FIELDS as f (f)}
      <Field
        id="number-base-{f}"
        label={labelOf(f)}
        error={invalid[f] ? fill(s.invalid, { b: baseOf(f), digits: digitsOf(f) }) : undefined}
      >
        {#snippet children({ describedby })}
          <div class="with-copy">
            <input
              id="number-base-{f}"
              class="control mono"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={invalid[f]}
              value={texts[f]}
              oninput={(e) => onField(f, e.currentTarget.value)}
            />
            <CopyButton
              value={value === null ? '' : formatBigInt(value, baseOf(f), true)}
              {locale}
              compact
              main={f === 'hex'}
            />
          </div>
        {/snippet}
      </Field>
    {/each}
  </div>

  <div class="row">
    <Field id="number-base-radix" label={s.customBase}>
      {#snippet children({ describedby })}
        <NumberInput
          id="number-base-radix"
          bind:value={customBase}
          min={MIN_BASE}
          max={MAX_BASE}
          {describedby}
        />
      {/snippet}
    </Field>
    <Toggle bind:checked={grouping} label={s.grouping} />
    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>

  <Display live label={s.summary}>
    {#snippet head()}
      <Led
        state={value === null ? 'idle' : 'ok'}
        label={value === null ? t(locale, 'led.idle') : fill(s.bits, { n: bitLength(value) })}
      />
    {/snippet}
    {#if value === null}
      <p class="display-note">{s.empty}</p>
    {:else}
      <div class="display-value">{render(value, 'dec')}</div>
    {/if}
  </Display>
</div>

<style>
  .fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .with-copy {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
