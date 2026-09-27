<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { plural } from '../../lib/plural';
  import { pick, randomSeed, seededRng } from '../../lib/random';
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
    calcLetter,
    generateDni,
    generateNie,
    validateDni,
    withDash,
    type DniResult,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let tab = $state<'validate' | 'generate' | 'letter'>('validate');
  // meta.rememberInput is false: a DNI is personal data, so it lives only in memory.
  let input = $state('');
  let letterInput = $state('');
  let kind = $state<'dni' | 'nie' | 'both'>('dni');
  let dash = $state(false);
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  // Random per session and re-rolled by "Generar"; a typed seed takes over.
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validateDni(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);
  const badCount = $derived(results.length - okCount);
  const countText = $derived(
    `${plural(locale, okCount, s.validOne, s.validOther)} · ${plural(locale, badCount, s.invalidOne, s.invalidOther)}`,
  );

  function reason(r: DniResult): string {
    if (r.ok) return r.kind === 'dni' ? s.validDni : s.validNie;
    switch (r.reason) {
      case 'wrongLetter':
        return fill(s.wrongLetter, { n: r.number ?? '', l: r.expected ?? '' });
      case 'missingLetter':
        return fill(s.missingLetter, { n: r.number ?? '', l: r.expected ?? '' });
      case 'forbiddenLetter':
        return fill(s.forbiddenLetter, { l: r.letter ?? '' });
      case 'fewDigits':
        return s.fewDigits;
      case 'manyDigits':
        return s.manyDigits;
      case 'nieDigits':
        return s.nieDigits;
      case 'niePrefix':
        return s.niePrefix;
      case 'cif':
        return s.cif;
      default:
        return s.format;
    }
  }

  const copyValidated = $derived(results.map((x) => (x.r.ok ? x.r.normalized : x.line)).join('\n'));

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    return repeat(quantity, () => {
      const make =
        kind === 'dni'
          ? generateDni
          : kind === 'nie'
            ? generateNie
            : pick(rng, [generateDni, generateNie]);
      const id = make(rng);
      return dash ? withDash(id) : id;
    });
  });

  const letter = $derived(letterInput.trim() ? calcLetter(letterInput) : null);
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'validate', label: meta.tabs![locale][0] },
      { value: 'generate', label: meta.tabs![locale][1] },
      { value: 'letter', label: meta.tabs![locale][2] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'validate'}
      <Field id="dni-input" label={s.input} help={s.notStored}>
        {#snippet children({ describedby })}
          <TextArea
            id="dni-input"
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
              label={single.ok ? reason(single) : t(locale, 'led.bad')}
            />
          {:else}
            <span>{countText}</span>
          {/if}
        {/snippet}
        {#if results.length === 0}
          <p class="display-note">{s.empty}</p>
        {:else if single}
          {#if single.ok}
            <div class="display-value">{single.normalized}</div>
            <dl class="display-kv">
              <dt>{s.kind}</dt>
              <dd>{single.kind === 'dni' ? s.dni : s.nie}</dd>
              <dt>{s.number}</dt>
              <dd>{single.number}</dd>
              <dt>{s.letter}</dt>
              <dd>{single.letter}</dd>
            </dl>
            {#if single.padded}<p class="display-note">{s.padded}</p>{/if}
          {:else}
            <p class="display-note">{reason(single)}</p>
            {#if single.reason === 'cif'}
              <p class="display-note"><a href={s.cifHref}>{s.cifLink}</a></p>
            {/if}
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
        <Button variant="ghost" disabled={!input} onclick={() => (input = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {:else if tab === 'generate'}
      <div class="row">
        <div class="stack tight">
          <span class="label">{s.type}</span>
          <Segmented
            label={s.type}
            options={[
              { value: 'dni', label: s.dni },
              { value: 'nie', label: s.nie },
              { value: 'both', label: s.both },
            ]}
            bind:value={kind}
          />
        </div>
        <Toggle bind:checked={dash} label={s.dash} />
      </div>

      <div class="row top">
        <Field id="dni-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="dni-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="dni-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="dni-seed"
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
    {:else}
      <Field
        id="dni-letter"
        label={s.letterInput}
        error={letter && !letter.ok ? s.letterError : undefined}
      >
        {#snippet children({ describedby })}
          <input
            id="dni-letter"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder={s.letterPlaceholder}
            aria-describedby={describedby}
            aria-invalid={letter !== null && !letter.ok}
            bind:value={letterInput}
          />
        {/snippet}
      </Field>

      <Display live label={s.letterResult}>
        {#if letter?.ok}
          <div class="display-value">{letter.letter}</div>
          <p class="display-note">{fill(s.full, { v: letter.full })}</p>
        {:else}
          <p class="display-note">{s.letterEmpty}</p>
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={letter?.ok ? letter.full : ''} {locale} />
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
  .display-note a {
    color: var(--disp-text);
  }
</style>
