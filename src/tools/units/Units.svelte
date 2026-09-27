<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatNumber, parseDecimal } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { convertAll, DEFAULT_UNIT, QUANTITIES, unitsOf, type Quantity } from './logic';
  import { meta } from './meta';
  import { negativeMessages, strings, unitNames } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;

  type Stored = ReturnType<typeof persistedInput>;
  // One remembered value and one remembered unit per tab.
  const values = Object.fromEntries(
    QUANTITIES.map((q) => [q, persistedInput(`units-${q}`, '1', remember)]),
  ) as Record<Quantity, Stored>;
  const froms = Object.fromEntries(
    QUANTITIES.map((q) => [q, persistedInput(`units-${q}-unit`, DEFAULT_UNIT[q], remember)]),
  ) as Record<Quantity, Stored>;
  const all = [...Object.values(values), ...Object.values(froms)];

  let tab = $state<Quantity>('length');
  const units = $derived(unitsOf(tab));
  const text = $derived(values[tab].value);
  // A remembered unit that no longer exists falls back to the tab's default.
  const fromId = $derived(
    units.some((u) => u.id === froms[tab].value) ? froms[tab].value : DEFAULT_UNIT[tab],
  );
  const parsed = $derived(text.trim() ? parseDecimal(text, locale) : null);
  const result = $derived(parsed === null ? null : convertAll(tab, parsed, fromId));
  const error = $derived.by(() => {
    if (text.trim() && parsed === null) return s.invalid;
    if (result && !result.ok) {
      if (result.reason === 'belowAbsoluteZero') return s.belowAbsoluteZero;
      if (result.reason === 'negative' && tab !== 'temperature') {
        return negativeMessages[locale][tab];
      }
    }
    return undefined;
  });
  const rows = $derived(result?.ok ? result.rows : []);
</script>

<div class="stack">
  <Segmented
    main
    label={s.tabs}
    options={QUANTITIES.map((q, i) => ({ value: q, label: meta.tabs![locale][i] }))}
    bind:value={tab}
  />

  <div class="panel">
    <div class="row">
      <div class="value">
        <Field id="units-value" label={s.value} {error}>
          {#snippet children({ describedby })}
            <input
              id="units-value"
              class="control mono"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={!!error}
              bind:value={values[tab].value}
            />
          {/snippet}
        </Field>
      </div>
      <Field id="units-from" label={s.from}>
        {#snippet children({ describedby })}
          <Select
            id="units-from"
            {describedby}
            bind:value={froms[tab].value}
            options={units.map((u) => ({
              value: u.id,
              label: `${unitNames[locale][u.id]} (${u.symbol})`,
            }))}
          />
        {/snippet}
      </Field>
    </div>

    <Display label={s.result}>
      {#if rows.length}
        <div class="display-rows">
          {#each rows as row (row.unit.id)}
            {@const shown = formatNumber(row.value, locale)}
            <div class="display-row" class:source={row.unit.id === fromId} data-unit={row.unit.id}>
              <span class="cell">
                <span class="name">{unitNames[locale][row.unit.id]}</span>
                <span>{shown} {row.unit.symbol}</span>
              </span>
              <CopyButton
                value={shown}
                {locale}
                compact
                ariaLabel={fill(s.copyUnit, { u: row.unit.symbol })}
              />
            </div>
          {/each}
        </div>
      {:else}
        <p class="display-note">{error ?? s.empty}</p>
      {/if}
    </Display>

    <Toggle
      bind:checked={
        () => all[0].remember,
        (v) => {
          for (const p of all) p.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .value {
    flex: 1 1 200px;
    max-width: 320px;
  }
  .cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .name {
    font: 400 12.5px/1.3 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .source {
    text-shadow: var(--disp-glow);
  }
</style>
