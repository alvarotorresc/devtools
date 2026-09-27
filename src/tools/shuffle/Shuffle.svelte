<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { plural } from '../../lib/plural';
  import { rngFromSeed } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { MIN_ITEMS, parseItems, shuffleList } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  const DEFAULT_LIST: Record<Locale, string> = {
    es: 'Ana\nLuis\nEva\nMarta\nPablo',
    en: 'Alice\nBob\nCarol\nDave\nEve',
  };

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  // Only the initial locale matters: it names the default list before a saved value loads.
  // svelte-ignore state_referenced_locally
  const list = persistedInput('shuffle', DEFAULT_LIST[locale], remember);
  const seed = persistedInput('shuffle-seed', '', remember);

  let ignoreEmpty = $state(true);
  let limit = $state(false);
  let keep = $state(3);
  // Bumped by the button: without a seed, each press draws a new order.
  let nonce = $state(0);
  // Random output is only computed in the browser, never baked into the HTML.
  let mounted = $state(false);
  onMount(() => (mounted = true));

  const items = $derived(parseItems(list.value, ignoreEmpty));
  const few = $derived(items.length < MIN_ITEMS);
  const seeded = $derived(seed.value.trim() !== '');
  // Pure and mount-independent, so the built HTML already shows the right count;
  // only the shuffled order itself needs the mount gate.
  const count = $derived(limit ? Math.max(1, Math.min(keep, items.length)) : items.length);
  const result = $derived.by(() => {
    void nonce;
    if (!mounted || few) return [];
    return shuffleList(rngFromSeed(seed.value), items, limit ? keep : undefined);
  });
</script>

<div class="panel">
  <Field id="shuffle-list" label={s.list} help={s.listHelp} error={few ? s.few : undefined}>
    {#snippet children({ describedby })}
      <TextArea
        id="shuffle-list"
        bind:value={list.value}
        rows={8}
        mono={false}
        {describedby}
        invalid={few}
      />
    {/snippet}
  </Field>

  <div class="row">
    <Toggle bind:checked={ignoreEmpty} label={s.ignoreEmpty} />
    <Toggle bind:checked={limit} label={s.limit} />
    {#if limit}
      <Field id="shuffle-keep" label={s.keep}>
        {#snippet children({ describedby })}
          <NumberInput
            id="shuffle-keep"
            bind:value={keep}
            min={1}
            max={Math.max(1, items.length)}
            {describedby}
          />
        {/snippet}
      </Field>
    {/if}
  </div>

  <div class="row">
    <div class="seed">
      <Field id="shuffle-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
        {#snippet children({ describedby })}
          <input
            id="shuffle-seed"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            bind:value={seed.value}
          />
        {/snippet}
      </Field>
    </div>
    <Button variant="primary" icon="refresh-cw" disabled={few} onclick={() => nonce++}
      >{s.shuffle}</Button
    >
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <!-- The list Field already shows s.few under itself (I1); the headline stays neutral. -->
      <span>{few ? t(locale, 'ui.fixField') : plural(locale, count, s.countOne, s.countOther)}</span
      >
      {#if seeded}<span>{s.seeded}</span>{/if}
    {/snippet}
    {#if result.length}
      <ol class="display-rows list">
        {#each result as item, i (i)}
          <li class="display-row">
            <span class="n">{i + 1}</span>
            <span class="item">{item || s.emptyLine}</span>
          </li>
        {/each}
      </ol>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={result.join('\n')} {locale} label={s.copyAll} />
  </div>

  <Toggle
    bind:checked={
      () => list.remember,
      (v) => {
        list.remember = v;
        seed.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .seed {
    flex: 1 1 220px;
    max-width: 360px;
  }
  .list {
    padding: 0;
    list-style: none;
  }
  .list .display-row {
    justify-content: flex-start;
  }
  .n {
    min-width: 2.5ch;
    text-align: right;
    color: var(--disp-dim);
  }
</style>
