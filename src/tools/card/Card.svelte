<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { plural } from '../../lib/plural';
  import { randomSeed, seededRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Icon from '../../ui/Icon.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    BRAND_NAMES,
    STRIPE_TEST_CARDS,
    formatCard,
    generateCvv,
    generateExpiry,
    generateTestCard,
    validateCard,
    type CardResult,
    type TestBrand,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let tab = $state<'validate' | 'generate'>('validate');
  // meta.rememberInput is false: it looks like payment data, even when it is a test number.
  let input = $state('');
  let brand = $state<TestBrand>('visa');
  let withExpiry = $state(false);
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validateCard(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);
  const badCount = $derived(results.length - okCount);
  const countText = $derived(
    `${plural(locale, okCount, s.validOne, s.validOther)} · ${plural(locale, badCount, s.invalidOne, s.invalidOther)}`,
  );

  function brandName(b: CardResult['brand']): string {
    return b ? BRAND_NAMES[b] : s.unknownBrand;
  }

  function reason(r: CardResult): string {
    if (r.ok) {
      return r.unusualLength
        ? fill(s.unusual, { brand: brandName(r.brand), n: r.digits.length })
        : brandName(r.brand);
    }
    switch (r.reason) {
      case 'luhn':
        return fill(s.errLuhn, { e: r.expected ?? '' });
      case 'length':
        return fill(s.errLength, { n: r.length ?? 0 });
      default:
        return s.errChars;
    }
  }

  const copyValidated = $derived(results.map((x) => (x.r.ok ? x.r.digits : x.line)).join('\n'));

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    const now = new Date();
    return repeat(quantity, () => {
      const n = generateTestCard(rng, brand);
      return withExpiry ? `${n} ${generateExpiry(rng, now)} ${generateCvv(rng, brand)}` : n;
    });
  });
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'validate', label: meta.tabs![locale][0] },
      { value: 'generate', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <p class="warning" role="note">
      <Icon name="triangle-alert" size={18} />
      <span>{s.warning}</span>
    </p>

    {#if tab === 'validate'}
      <Field id="card-input" label={s.input} help={s.help}>
        {#snippet children({ describedby })}
          <TextArea
            id="card-input"
            bind:value={input}
            rows={3}
            placeholder={s.placeholder}
            {describedby}
            invalid={single !== null && !single.ok}
          />
        {/snippet}
      </Field>

      <Display live label={s.result}>
        {#snippet head()}
          {#if results.length === 0}
            <Led state="idle" label={t(locale, 'led.idle')} />
          {:else if single}
            <Led
              state={single.ok ? 'ok' : 'bad'}
              label={single.ok ? s.luhnOk : t(locale, 'led.bad')}
            />
          {:else}
            <span>{countText}</span>
          {/if}
        {/snippet}
        {#if results.length === 0}
          <p class="display-note">{s.empty}</p>
        {:else if single}
          {#if single.ok}
            <div class="display-value">{single.formatted}</div>
            <dl class="display-kv">
              <dt>{s.brand}</dt>
              <dd>{brandName(single.brand)}</dd>
              <dt>{s.length}</dt>
              <dd>{fill(s.digits, { n: single.digits.length })}</dd>
            </dl>
            {#if single.unusualLength}<p class="display-note">{reason(single)}</p>{/if}
          {:else}
            {#if single.formatted}<div class="display-value">{single.formatted}</div>{/if}
            <p class="display-note">{reason(single)}</p>
          {/if}
        {:else}
          <div class="display-rows">
            {#each results as x, i (i)}
              <div class="display-row">
                <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.formatted : x.line} />
                <span class="why">{reason(x.r)}</span>
              </div>
            {/each}
          </div>
          {#if split.truncated}<p class="display-note">
              {fill(s.truncated, { n: MAX_LINES })}
            </p>{/if}
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={copyValidated} {locale} />
        <Button variant="ghost" disabled={!input} onclick={() => (input = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {:else}
      <div class="row">
        <div class="stack tight">
          <span class="label">{s.brandLabel}</span>
          <Segmented
            label={s.brandLabel}
            options={[
              { value: 'visa', label: 'Visa' },
              { value: 'mastercard', label: 'Mastercard' },
              { value: 'amex', label: 'American Express' },
            ]}
            bind:value={brand}
          />
        </div>
        <Toggle bind:checked={withExpiry} label={s.expiry} />
      </div>
      <div class="row top">
        <Field id="card-quantity" label={t(locale, 'ui.quantity')}>
          {#snippet children({ describedby })}
            <NumberInput
              id="card-quantity"
              bind:value={quantity}
              min={1}
              max={MAX_QUANTITY}
              {describedby}
            />
          {/snippet}
        </Field>
        <Field id="card-seed" label={t(locale, 'ui.seed')} help={s.seedHelp}>
          {#snippet children({ describedby })}
            <input
              id="card-seed"
              class="control mono seed"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              bind:value={seed}
            />
          {/snippet}
        </Field>
      </div>

      <div class="row">
        <Button variant="primary" icon="refresh-cw" onclick={() => (session = randomSeed())}>
          {t(locale, 'ui.generate')}
        </Button>
      </div>

      <Display label={s.generated}>
        <div class="display-rows">
          {#each generated as v, i (i)}
            <div class="display-row">
              <span>{v}</span>
              <CopyButton value={v} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>
      <p class="test-only">{t(locale, 'ui.testOnly')}</p>

      <div class="row">
        <CopyButton main value={generated.join('\n')} {locale} label={s.copyAll} />
      </div>

      <Display label={s.stripe}>
        {#snippet head()}<span>{s.stripe}</span>{/snippet}
        <div class="display-rows">
          {#each STRIPE_TEST_CARDS as c (c.number)}
            <div class="display-row">
              <span>{BRAND_NAMES[c.brand]} · {formatCard(c.number, c.brand)}</span>
              <CopyButton value={c.number} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>
    {/if}
  </div>
</div>

<style>
  .warning {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 14px;
    border: 1px solid var(--bad);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 14px;
  }
  .warning :global(svg) {
    flex-shrink: 0;
    color: var(--bad-text);
    margin-top: 1px;
  }
  .tight {
    gap: 8px;
  }
  .top {
    align-items: flex-start;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .seed {
    width: 220px;
  }
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
</style>
