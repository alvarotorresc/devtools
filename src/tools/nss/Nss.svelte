<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { PROVINCES } from '../../lib/provinces';
  import { randomSeed, seededRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import type { Locale } from '../types';
  import { generateNss, validateNss, type NssResult } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let tab = $state<'validate' | 'generate'>('validate');
  // meta.rememberInput is false: the NSS is a personal identifier.
  let input = $state('');
  let province = $state('any');
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validateNss(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: NssResult): string {
    if (r.ok) {
      return r.province ? r.province.name : fill(s.unknownProvince, { c: r.provinceCode });
    }
    switch (r.reason) {
      case 'control':
        return fill(s.errControl, { e: r.expected ?? '' });
      case 'fewDigits':
        return s.errFew;
      case 'manyDigits':
        return s.errMany;
      default:
        return s.errChars;
    }
  }

  const copyValidated = $derived(results.map((x) => (x.r.ok ? x.r.formatted : x.line)).join('\n'));

  const options = $derived([
    { value: 'any', label: s.any },
    ...PROVINCES.map((p) => ({ value: p.code, label: `${p.code} · ${p.name}` })),
  ]);

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    return repeat(quantity, () => generateNss(rng, province === 'any' ? undefined : province));
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
    {#if tab === 'validate'}
      <Field id="nss-input" label={s.input} help={s.help}>
        {#snippet children({ describedby })}
          <TextArea
            id="nss-input"
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
            <div class="display-value">{single.formatted}</div>
            <dl class="display-kv">
              <dt>{s.province}</dt>
              <dd>{single.provinceCode}{single.province ? ` · ${single.province.name}` : ''}</dd>
              <dt>{s.number}</dt>
              <dd>{single.normalized.slice(2, 10)}</dd>
              <dt>{s.control}</dt>
              <dd>{single.normalized.slice(10)}</dd>
            </dl>
            {#if !single.province}
              <p class="display-note">{reason(single)}</p>
            {/if}
          {:else}
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
      <div class="row top">
        <Field id="nss-province" label={s.provinceLabel}>
          <Select id="nss-province" bind:value={province} {options} />
        </Field>
        <Field id="nss-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="nss-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="nss-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="nss-seed"
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
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
</style>
