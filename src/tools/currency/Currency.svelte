<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatMoney, formatNumber, parseDecimal } from '../../lib/numbers';
  import { readJSON, writeJSON } from '../../lib/storage';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    CACHE_KEY,
    codesOf,
    convert,
    formatRatesDate,
    isStale,
    KNOWN_CODES,
    parseCache,
    parseRatesResponse,
    RATES_URL,
    significant,
    type CachedRates,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const amount = persistedInput('currency', '100', remember);
  const from = persistedInput('currency-from', 'EUR', remember);
  const to = persistedInput('currency-to', 'USD', remember);

  type Status = 'loading' | 'ok' | 'offline' | 'error';
  let rates = $state<CachedRates | null>(null);
  let status = $state<Status>('loading');
  let missing = $state<string | null>(null);

  async function download() {
    if (!rates) status = 'loading';
    try {
      // A public GET with no parameters, no cookies and no Referer: nothing of the user leaves.
      const res = await fetch(RATES_URL, {
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: AbortSignal.timeout(8000),
      });
      const parsed = res.ok ? parseRatesResponse(await res.json()) : null;
      if (!parsed) throw new Error('Unexpected response');
      rates = { ...parsed, fetchedAt: Date.now() };
      writeJSON(CACHE_KEY, rates);
      status = 'ok';
    } catch {
      status = rates ? 'offline' : 'error';
    }
  }

  onMount(() => {
    const cached = parseCache(readJSON<unknown>(CACHE_KEY, null));
    if (cached) {
      rates = cached;
      status = 'ok';
    }
    if (!cached || isStale(cached.fetchedAt, Date.now())) void download();
  });

  // A remembered currency that the ECB no longer publishes falls back to EUR, with a notice.
  $effect(() => {
    if (!rates) return;
    for (const pick of [from, to]) {
      if (!(pick.value in rates.rates)) {
        missing = pick.value;
        pick.value = 'EUR';
      }
    }
  });

  const names = $derived(new Intl.DisplayNames(locale, { type: 'currency' }));
  const codes = $derived(
    [...new Set([...(rates ? codesOf(rates.rates) : KNOWN_CODES), from.value, to.value])].sort(),
  );
  const options = $derived(codes.map((c) => ({ value: c, label: `${c} · ${names.of(c) ?? c}` })));

  const parsed = $derived(amount.value.trim() ? parseDecimal(amount.value, locale) : 1);
  const result = $derived(
    rates && parsed !== null ? convert(parsed, from.value, to.value, rates.rates) : null,
  );
  const shown = $derived(result === null ? '' : formatMoney(result, locale, to.value));
  const unitLine = $derived.by(() => {
    if (!rates) return '';
    const r = (a: string, b: string) => {
      const v = convert(1, a, b, rates!.rates);
      return v === null ? '' : fill(s.unit, { a, b, r: formatNumber(significant(v), locale) });
    };
    return `${r(from.value, to.value)} · ${r(to.value, from.value)}`;
  });
  const others = $derived(
    rates && parsed !== null
      ? codesOf(rates.rates).map((c) => ({
          code: c,
          text: formatMoney(convert(parsed, from.value, c, rates!.rates) ?? 0, locale, c),
        }))
      : [],
  );

  const led = $derived(status === 'ok' ? 'ok' : status === 'error' ? 'bad' : 'idle');
  const statusText = $derived.by(() => {
    const date = rates ? formatRatesDate(rates.date, locale) : '';
    if (status === 'ok') return fill(s.ok, { date });
    if (status === 'offline') return fill(s.offline, { date });
    if (status === 'error') return s.error;
    return s.loading;
  });

  function swap() {
    const a = from.value;
    from.value = to.value;
    to.value = a;
  }
</script>

<div class="panel">
  <div class="row">
    <div class="amount">
      <Field id="currency-amount" label={s.amount} error={parsed === null ? s.invalid : undefined}>
        {#snippet children({ describedby })}
          <input
            id="currency-amount"
            class="control mono"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            placeholder="1"
            aria-describedby={describedby}
            aria-invalid={parsed === null}
            bind:value={amount.value}
          />
        {/snippet}
      </Field>
    </div>
    <Field id="currency-from" label={s.from}>
      {#snippet children({ describedby })}
        <Select id="currency-from" {describedby} bind:value={from.value} {options} />
      {/snippet}
    </Field>
    <Button variant="icon" icon="arrow-down-up" label={t(locale, 'ui.swap')} onclick={swap} />
    <Field id="currency-to" label={s.to}>
      {#snippet children({ describedby })}
        <Select id="currency-to" {describedby} bind:value={to.value} {options} />
      {/snippet}
    </Field>
  </div>

  {#if missing}<p class="note" role="status">{fill(s.missing, { c: missing })}</p>{/if}

  <Display live label={s.result}>
    {#snippet head()}
      <Led state={led} label={statusText} />
    {/snippet}
    {#if result !== null}
      <div class="display-value" id="currency-result">{shown}</div>
      <p class="display-note">{unitLine}</p>
    {/if}
    <!-- parsed === null repeats the Field's own error nowhere else: the amount input already
         carries it (I1), and the Led headline keeps reporting the unrelated rates status. -->
  </Display>

  <div class="row">
    <CopyButton main value={shown} {locale} />
    {#if status === 'error' || status === 'offline'}
      <Button variant="secondary" icon="refresh-cw" onclick={download}>{s.retry}</Button>
    {/if}
  </div>

  {#if others.length}
    <Display label={s.all}>
      {#snippet head()}<span>{s.all}</span>{/snippet}
      <div class="display-rows">
        {#each others as o (o.code)}
          <div class="display-row" data-currency={o.code}>
            <span class="cell">
              <span class="name">{o.code} · {names.of(o.code) ?? o.code}</span>
              <span>{o.text}</span>
            </span>
            <CopyButton value={o.text} {locale} compact ariaLabel={fill(s.copyIn, { c: o.code })} />
          </div>
        {/each}
      </div>
    </Display>
  {/if}

  <p class="note">{s.privacy}</p>

  <Toggle
    bind:checked={
      () => amount.remember,
      (v) => {
        amount.remember = v;
        from.remember = v;
        to.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .amount {
    flex: 1 1 160px;
    max-width: 240px;
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
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
</style>
