<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { randomSeed, seededRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    formatCcc,
    formatIban,
    generateSpanishIban,
    validateIban,
    type IbanResult,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let tab = $state<'validate' | 'generate'>('validate');
  // meta.rememberInput is false: an account number is personal and financial data.
  let input = $state('');
  let group = $state(true);
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  function countryName(code: string): string {
    try {
      return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
    } catch {
      return code;
    }
  }

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validateIban(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: IbanResult): string {
    if (r.ok) return countryName(r.country);
    switch (r.reason) {
      case 'country':
        return fill(s.errCountry, { c: r.country ?? '' });
      case 'length':
        return fill(s.errLength, {
          country: countryName(r.country ?? ''),
          n: r.expectedLength ?? 0,
          m: r.length ?? 0,
        });
      case 'checkRange':
        return s.errCheckRange;
      case 'checksum':
        return s.errChecksum;
      case 'ccc':
        return fill(s.errCcc, { e: r.expected ?? '' });
      case 'cccOnly':
        return fill(s.errCccOnly, { e: r.expected ?? '' });
      default:
        return s.errChars;
    }
  }

  const copyValidated = $derived(
    results.map((x) => (x.r.ok ? formatIban(x.r.iban) : x.line)).join('\n'),
  );

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    return repeat(quantity, () => generateSpanishIban(rng));
  });
  const shown = $derived(generated.map((iban) => (group ? formatIban(iban) : iban)));
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
    {#if tab === 'validate'}
      <Field id="iban-input" label={s.input} help={s.help}>
        {#snippet children({ describedby })}
          <TextArea
            id="iban-input"
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
              label={single.ok ? s.valid : t(locale, 'led.bad')}
            />
          {:else}
            <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
          {/if}
        {/snippet}
        {#if results.length === 0}
          <p class="display-note">{s.empty}</p>
        {:else if single}
          {#if single.ok}
            <div class="display-value">{formatIban(single.iban)}</div>
            <dl class="display-kv">
              <dt>{s.country}</dt>
              <dd>{single.country} · {countryName(single.country)}</dd>
              {#if single.spain}
                <dt>{s.bank}</dt>
                <dd>{single.spain.bank}</dd>
                <dt>{s.branch}</dt>
                <dd>{single.spain.branch}</dd>
                <dt>{s.dc}</dt>
                <dd>{single.spain.dc}</dd>
                <dt>{s.account}</dt>
                <dd>{single.spain.account}</dd>
              {:else}
                <dt>{s.bban}</dt>
                <dd>{single.bban}</dd>
              {/if}
            </dl>
            {#if single.fromCcc}<p class="display-note">{s.fromCcc}</p>{/if}
          {:else}
            <p class="display-note">{reason(single)}</p>
          {/if}
        {:else}
          <div class="display-rows">
            {#each results as x, i (i)}
              <div class="display-row">
                <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? formatIban(x.r.iban) : x.line} />
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
      <Toggle bind:checked={group} label={s.group} />
      <div class="row top">
        <Field id="iban-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="iban-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="iban-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="iban-seed"
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
          {#each generated as iban, i (i)}
            <div class="display-row">
              <span class="pair">
                <span>{shown[i]}</span>
                <span class="ccc">{formatCcc(iban)}</span>
              </span>
              <span class="copies">
                <CopyButton value={shown[i]} {locale} compact label={s.copyIban} />
                <CopyButton value={formatCcc(iban)} {locale} compact label={s.copyCcc} />
              </span>
            </div>
          {/each}
        </div>
      </Display>
      <p class="test-only">{t(locale, 'ui.testOnly')}</p>

      <div class="row">
        <CopyButton main value={shown.join('\n')} {locale} label={s.copyAll} />
      </div>
    {/if}
  </div>
</div>

<style>
  .top {
    align-items: flex-start;
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
  .pair {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .ccc {
    font-size: 13px;
    color: var(--disp-dim);
  }
  .copies {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
</style>
