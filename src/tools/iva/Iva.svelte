<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatMoney, formatNumber, parseDecimal } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { breakdown, isValidRate, VAT_RATES, vatFromBase, type VatDirection } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type RateChoice = '21' | '10' | '4' | 'other';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const amount = persistedInput('iva', '100', remember);
  const directionStore = persistedInput('iva-direction', 'base', remember);
  const rateStore = persistedInput('iva-rate', '21', remember);
  const otherStore = persistedInput('iva-rate-other', '7', remember);
  const all = [amount, directionStore, rateStore, otherStore];

  const direction = $derived<VatDirection>(directionStore.value === 'total' ? 'total' : 'base');
  const choice = $derived<RateChoice>(
    (['21', '10', '4', 'other'] as const).find((c) => c === rateStore.value) ?? '21',
  );
  const otherRate = $derived(parseDecimal(otherStore.value, locale));
  const rate = $derived(choice === 'other' ? otherRate : Number(choice));
  const rateOk = $derived(isValidRate(rate));
  const value = $derived(amount.value.trim() ? parseDecimal(amount.value, locale) : 0);
  const r = $derived(value !== null && rateOk ? breakdown(value, direction, rate!) : null);

  const money = (n: number) => formatMoney(n, locale);
  const pct = $derived(rateOk ? formatNumber(rate!, locale) : '');
  const line = $derived(
    r
      ? fill(s.line, { base: money(r.base), r: pct, vat: money(r.vat), total: money(r.total) })
      : '',
  );
  const compare = $derived(
    r ? VAT_RATES.map((rt) => ({ rate: rt, ...vatFromBase(r.base, rt) })) : [],
  );
</script>

<div class="panel">
  <div class="row">
    <div class="grow">
      <Field id="iva-amount" label={s.amount} error={value === null ? s.invalid : undefined}>
        {#snippet children({ describedby })}
          <input
            id="iva-amount"
            class="control mono"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            aria-invalid={value === null}
            bind:value={amount.value}
          />
        {/snippet}
      </Field>
    </div>
    <div class="stack tight">
      <span class="label">{s.direction}</span>
      <Segmented
        label={s.direction}
        options={[
          { value: 'base', label: s.base },
          { value: 'total', label: s.total },
        ]}
        bind:value={() => direction, (v) => (directionStore.value = v)}
      />
    </div>
  </div>

  <div class="row">
    <div class="stack tight">
      <span class="label">{s.rate}</span>
      <Segmented
        label={s.rate}
        options={[
          { value: '21', label: '21 %' },
          { value: '10', label: '10 %' },
          { value: '4', label: '4 %' },
          { value: 'other', label: s.other },
        ]}
        bind:value={() => choice, (v) => (rateStore.value = v)}
      />
    </div>
    {#if choice === 'other'}
      <Field
        id="iva-rate-other"
        label={s.otherRate}
        help={s.otherHelp}
        error={rateOk ? undefined : s.rateInvalid}
      >
        {#snippet children({ describedby })}
          <input
            id="iva-rate-other"
            class="control mono short"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            aria-describedby={describedby}
            aria-invalid={!rateOk}
            bind:value={otherStore.value}
          />
        {/snippet}
      </Field>
    {/if}
  </div>

  <Display live label={s.result}>
    {#snippet head()}<span>{line || s.invalid}</span>{/snippet}
    {#if r}
      <dl class="display-kv">
        <dt>{s.base}</dt>
        <dd id="iva-base">{money(r.base)}</dd>
        <dt>{fill(s.vat, { r: pct })}</dt>
        <dd id="iva-vat">{money(r.vat)}</dd>
        <dt>{s.total}</dt>
        <dd id="iva-total" class="total">{money(r.total)}</dd>
      </dl>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={line} {locale} label={s.copyLine} />
  </div>

  {#if compare.length}
    <Display label={s.compare}>
      {#snippet head()}<span>{s.compare}</span>{/snippet}
      <div class="display-rows">
        {#each compare as c (c.rate)}
          <div class="display-row">
            <span>{c.rate} % · {money(c.vat)}</span>
            <span>{money(c.total)}</span>
          </div>
        {/each}
      </div>
    </Display>
  {/if}

  <Toggle
    bind:checked={
      () => amount.remember,
      (v) => {
        for (const p of all) p.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .grow {
    flex: 1 1 200px;
    max-width: 320px;
  }
  .tight {
    gap: 8px;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .short {
    width: 120px;
  }
  .total {
    font-weight: 700;
  }
</style>
