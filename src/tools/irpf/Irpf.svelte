<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatMoney, formatNumber, parseDecimal } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { invoiceFromBase, invoiceFromNet, type Invoice, type IrpfDirection } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type IrpfChoice = '15' | '7' | '19' | 'other';
  type VatChoice = '21' | '10' | '4' | '0';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const amount = persistedInput('irpf', '1000', remember);
  const directionStore = persistedInput('irpf-direction', 'base', remember);
  const irpfStore = persistedInput('irpf-rate', '15', remember);
  const otherStore = persistedInput('irpf-rate-other', '', remember);
  const vatStore = persistedInput('irpf-vat', '21', remember);
  const all = [amount, directionStore, irpfStore, otherStore, vatStore];

  const direction = $derived<IrpfDirection>(directionStore.value === 'net' ? 'net' : 'base');
  const irpfChoice = $derived<IrpfChoice>(
    (['15', '7', '19', 'other'] as const).find((c) => c === irpfStore.value) ?? '15',
  );
  const vatChoice = $derived<VatChoice>(
    (['21', '10', '4', '0'] as const).find((c) => c === vatStore.value) ?? '21',
  );
  const otherRate = $derived(parseDecimal(otherStore.value, locale));
  const irpfRate = $derived(irpfChoice === 'other' ? otherRate : Number(irpfChoice));
  const irpfOk = $derived(irpfRate !== null && irpfRate >= 0 && irpfRate <= 100);
  const vatRate = $derived(Number(vatChoice));
  const value = $derived(amount.value.trim() ? parseDecimal(amount.value, locale) : 0);

  const calc = $derived.by((): { invoice: Invoice; exact: boolean } | { error: string } | null => {
    if (value === null || !irpfOk) return null;
    if (direction === 'base') {
      return { invoice: invoiceFromBase(value, vatRate, irpfRate!), exact: true };
    }
    const r = invoiceFromNet(value, vatRate, irpfRate!);
    return r.ok ? { invoice: r.invoice, exact: r.exact } : { error: s.impossible };
  });
  const invoice = $derived(calc && 'invoice' in calc ? calc.invoice : null);

  const money = (n: number) => formatMoney(n, locale);
  const pct = (n: number) => formatNumber(n, locale);
  const text = $derived(
    invoice
      ? [
          `${s.base}: ${money(invoice.base)}`,
          `${fill(s.plusVat, { r: pct(vatRate) })}: ${money(invoice.vat)}`,
          `${fill(s.minusIrpf, { r: pct(irpfRate ?? 0) })}: ${money(invoice.irpf)}`,
          `${s.total}: ${money(invoice.net)}`,
        ].join('\n')
      : '',
  );
  const headline = $derived.by(() => {
    // value and irpfOk are each tied to their own field, which already shows the actionable
    // error (I1); calc.error (net below the minimum withholding) has no field of its own, so it
    // stays in the headline.
    if (value === null || !irpfOk) return t(locale, 'ui.fixField');
    if (calc && 'error' in calc) return calc.error;
    return invoice ? `${s.total}: ${money(invoice.net)}` : '';
  });
</script>

<div class="panel">
  <div class="row">
    <div class="grow">
      <Field id="irpf-amount" label={s.amount} error={value === null ? s.invalid : undefined}>
        {#snippet children({ describedby })}
          <input
            id="irpf-amount"
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
          { value: 'net', label: s.net },
        ]}
        bind:value={() => direction, (v) => (directionStore.value = v)}
      />
    </div>
  </div>

  <div class="row">
    <Field id="irpf-rate" label={s.irpf}>
      {#snippet children({ describedby })}
        <Select
          id="irpf-rate"
          {describedby}
          bind:value={() => irpfChoice, (v) => (irpfStore.value = v)}
          options={[
            { value: '15', label: s.irpf15 },
            { value: '7', label: s.irpf7 },
            { value: '19', label: s.irpf19 },
            { value: 'other', label: s.other },
          ]}
        />
      {/snippet}
    </Field>
    {#if irpfChoice === 'other'}
      <Field id="irpf-rate-other" label={s.otherRate} error={irpfOk ? undefined : s.rateInvalid}>
        {#snippet children({ describedby })}
          <input
            id="irpf-rate-other"
            class="control mono short"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            aria-describedby={describedby}
            aria-invalid={!irpfOk}
            bind:value={otherStore.value}
          />
        {/snippet}
      </Field>
    {/if}
    <Field id="irpf-vat" label={s.vat}>
      {#snippet children({ describedby })}
        <Select
          id="irpf-vat"
          {describedby}
          bind:value={() => vatChoice, (v) => (vatStore.value = v)}
          options={[
            { value: '21', label: '21 %' },
            { value: '10', label: '10 %' },
            { value: '4', label: '4 %' },
            { value: '0', label: s.vat0 },
          ]}
        />
      {/snippet}
    </Field>
  </div>

  <Display live label={s.result}>
    {#snippet head()}<span>{headline}</span>{/snippet}
    {#if invoice}
      <dl class="display-kv">
        <dt>{s.base}</dt>
        <dd id="irpf-base">{money(invoice.base)}</dd>
        <dt>{fill(s.plusVat, { r: pct(vatRate) })}</dt>
        <dd>{money(invoice.vat)}</dd>
        <dt>{fill(s.minusIrpf, { r: pct(irpfRate ?? 0) })}</dt>
        <dd>{money(-invoice.irpf)}</dd>
        <dt>{s.total}</dt>
        <dd id="irpf-net" class="total">{money(invoice.net)}</dd>
      </dl>
      {#if calc && 'exact' in calc && !calc.exact}
        <p class="display-note">
          {fill(s.inexact, { target: money(value ?? 0), got: money(invoice.net) })}
        </p>
      {/if}
      <p class="display-note">{s.note}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={text} {locale} label={s.copy} />
  </div>

  <p class="disclaimer" role="note">{s.disclaimer}</p>

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
  .disclaimer {
    font-size: 13.5px;
    color: var(--text-dim);
  }
</style>
