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
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    CURRENT_TOTAL,
    generateOldPlate,
    generatePlate,
    validatePlate,
    type PlateResult,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // A plate is on public view on the road: it is not a secret.
  const input = persistedInput('plate', '', meta.rememberInput ?? true);

  let tab = $state<'validate' | 'generate'>('validate');
  let kind = $state<'current' | 'old'>('current');
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  const nf = $derived(new Intl.NumberFormat(locale));
  const split = $derived(splitLines(input.value));
  const results = $derived(split.lines.map((line) => ({ line, r: validatePlate(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: PlateResult): string {
    if (r.ok) return r.format === 'current' ? s.current : r.province.name;
    switch (r.reason) {
      case 'letter':
        return fill(s.errLetter, { c: r.char ?? '' });
      case 'oldLetter':
        return fill(s.errOldLetter, { c: r.char ?? '' });
      case 'province':
        return fill(s.errProvince, { p: r.prefix ?? '' });
      case 'special':
        return s.errSpecial;
      default:
        return s.errFormat;
    }
  }

  const copyValidated = $derived(results.map((x) => (x.r.ok ? x.r.normalized : x.line)).join('\n'));

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    return repeat(quantity, () =>
      kind === 'current' ? generatePlate(rng) : generateOldPlate(rng),
    );
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
      <Field id="plate-input" label={s.input} help={s.help}>
        {#snippet children({ describedby })}
          <TextArea
            id="plate-input"
            bind:value={input.value}
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
            <div class="display-value">{single.normalized}</div>
            <dl class="display-kv">
              <dt>{s.format}</dt>
              <dd>{single.format === 'current' ? s.current : s.old}</dd>
              {#if single.format === 'current'}
                <dt>{s.position}</dt>
                <dd>
                  {fill(s.positionValue, {
                    n: nf.format(single.position),
                    total: nf.format(CURRENT_TOTAL),
                  })}
                </dd>
              {:else}
                <dt>{s.province}</dt>
                <dd>{single.province.name}</dd>
              {/if}
            </dl>
          {:else}
            <p class="display-note">{reason(single)}</p>
          {/if}
        {:else}
          <div class="display-rows">
            {#each results as x, i (i)}
              <div class="display-row">
                <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.normalized : x.line} />
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
        <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
      <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
    {:else}
      <div class="stack tight">
        <span class="label">{s.kind}</span>
        <Segmented
          label={s.kind}
          options={[
            { value: 'current', label: s.current },
            { value: 'old', label: s.old },
          ]}
          bind:value={kind}
        />
      </div>
      <div class="row top">
        <Field id="plate-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="plate-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="plate-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="plate-seed"
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
