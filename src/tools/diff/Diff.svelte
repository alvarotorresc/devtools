<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    collapse,
    countChanges,
    diffLines,
    shouldDebounce,
    splitLines,
    toRows,
    unifiedText,
    type DiffResult,
    type Item,
    type Segment,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const left = persistedInput('diff', '', remember);
  const right = persistedInput('diff-modified', '', remember);

  const MAX_ROWS = 2000;
  let view = $state<'unified' | 'split'>('unified');
  let ignoreWhitespace = $state(false);
  let ignoreCase = $state(false);
  let onlyChanges = $state(true);
  let result = $state<DiffResult | null>(null);

  $effect(() => {
    const a = left.value;
    const b = right.value;
    const opts = { ignoreWhitespace, ignoreCase };
    if (!a && !b) {
      result = null;
      return;
    }
    const run = () => (result = diffLines(splitLines(a), splitLines(b), opts));
    if (!shouldDebounce(a, b)) {
      run();
      return;
    }
    const timer = setTimeout(run, 150);
    return () => clearTimeout(timer);
  });

  const rows = $derived(result ? toRows(result.ops, { ignoreWhitespace, ignoreCase }) : []);
  const items: Item[] = $derived(
    onlyChanges ? collapse(rows) : rows.map((row) => ({ kind: 'row' as const, row })),
  );
  const shown = $derived(items.slice(0, MAX_ROWS));
  const counts = $derived(result ? countChanges(result.ops) : { added: 0, removed: 0 });
  const identical = $derived(!!result && counts.added === 0 && counts.removed === 0);
  const copyValue = $derived(result && !identical ? unifiedText(result.ops) : '');

  function swap() {
    const a = left.value;
    left.value = right.value;
    right.value = a;
  }
</script>

{#snippet segments(segs: Segment[], words: boolean)}
  {#each segs as seg, i (i)}{#if words && seg.changed}<mark>{seg.text}</mark
      >{:else}{seg.text}{/if}{/each}
{/snippet}

{#snippet line(
  kind: 'equal' | 'remove' | 'add',
  no: number | null,
  segs: Segment[],
  words: boolean,
)}
  <div class="line {kind}">
    <span class="no">{no ?? ''}</span>
    <span class="sign" aria-hidden="true"
      >{kind === 'add' ? '+' : kind === 'remove' ? '−' : ''}</span
    >
    {#if kind !== 'equal'}<span class="visually-hidden">{kind === 'add' ? s.added : s.removed}</span
      >{/if}
    <span class="text">{@render segments(segs, words)}</span>
  </div>
{/snippet}

<div class="panel">
  <div class="inputs">
    <Field id="diff-original" label={s.original}>
      {#snippet children({ describedby })}
        <TextArea
          id="diff-original"
          bind:value={left.value}
          placeholder={s.originalPlaceholder}
          {describedby}
          rows={10}
        />
      {/snippet}
    </Field>
    <Field id="diff-modified" label={s.modified}>
      {#snippet children({ describedby })}
        <TextArea
          id="diff-modified"
          bind:value={right.value}
          placeholder={s.modifiedPlaceholder}
          {describedby}
          rows={10}
        />
      {/snippet}
    </Field>
  </div>

  <div class="row">
    <Segmented
      label={s.view}
      options={[
        { value: 'unified', label: s.unified },
        { value: 'split', label: s.split },
      ]}
      bind:value={view}
    />
    <Toggle bind:checked={ignoreWhitespace} label={s.ignoreWhitespace} />
    <Toggle bind:checked={ignoreCase} label={s.ignoreCase} />
    <Toggle bind:checked={onlyChanges} label={s.onlyChanges} />
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!result ? 'idle' : identical ? 'ok' : 'bad'}
        label={!result ? t(locale, 'led.idle') : identical ? s.identical : fill(s.counts, counts)}
      />
    {/snippet}
    {#if !result}
      <p class="display-note">{s.empty}</p>
    {:else if !identical}
      {#if result.tooLarge}<p class="display-note">{s.tooLarge}</p>{/if}
      <div class="diff {view}">
        {#each shown as item, i (i)}
          {#if item.kind === 'skip'}
            <div class="skip">{fill(s.skipped, { n: item.count })}</div>
          {:else if view === 'unified'}
            {@const r = item.row}
            {#if r.type === 'equal'}
              {@render line('equal', r.right!.no, r.right!.segments, false)}
            {:else}
              {#if r.left}{@render line(
                  'remove',
                  r.left.no,
                  r.left.segments,
                  r.type === 'change',
                )}{/if}
              {#if r.right}{@render line(
                  'add',
                  r.right.no,
                  r.right.segments,
                  r.type === 'change',
                )}{/if}
            {/if}
          {:else}
            {@const r = item.row}
            <div class="pair">
              {#if r.left}
                {@render line(
                  r.type === 'equal' ? 'equal' : 'remove',
                  r.left.no,
                  r.left.segments,
                  r.type === 'change',
                )}
              {:else}
                <div class="line blank"></div>
              {/if}
              {#if r.right}
                {@render line(
                  r.type === 'equal' ? 'equal' : 'add',
                  r.right.no,
                  r.right.segments,
                  r.type === 'change',
                )}
              {:else}
                <div class="line blank"></div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
      {#if items.length > MAX_ROWS}<p class="display-note">
          {fill(s.truncated, { n: MAX_ROWS })}
        </p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={copyValue} {locale} label={s.copyDiff} />
    <Button
      variant="ghost"
      icon="arrow-left-right"
      disabled={!left.value && !right.value}
      onclick={swap}>{s.swap}</Button
    >
    <Button
      variant="ghost"
      disabled={!left.value && !right.value}
      onclick={() => {
        left.value = '';
        right.value = '';
      }}>{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle
    bind:checked={
      () => left.remember,
      (v) => {
        left.remember = v;
        right.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  /*
   * The rows below (.diff, .pair, .line and its children, mark, .skip) only exist in the DOM
   * once a diff has been computed client-side: `result` starts out `null`, so none of this markup
   * is present in the server-rendered HTML. Per the Lesson on client-only sub-component CSS, such
   * rules are written with :global() so they are not dropped from the production build.
   */
  :global(.diff) {
    max-height: 70vh;
    overflow: auto;
    font: 400 13.5px/1.5 var(--font-mono);
  }
  :global(.diff .pair) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
  }
  :global(.diff .line) {
    display: grid;
    grid-template-columns: 3.5em 1.2em 1fr;
    min-height: 1.5em;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  :global(.diff .no) {
    padding-right: 8px;
    text-align: right;
    color: var(--disp-dim);
    user-select: none;
  }
  :global(.diff .sign) {
    color: var(--disp-dim);
    user-select: none;
  }
  :global(.diff .remove) {
    background: color-mix(in srgb, var(--bad) 16%, transparent);
  }
  :global(.diff .add) {
    background: color-mix(in srgb, var(--ok) 14%, transparent);
  }
  :global(.diff .blank) {
    background: color-mix(in srgb, var(--disp-line) 40%, transparent);
  }
  :global(.diff mark) {
    background: color-mix(in srgb, var(--disp-text) 30%, transparent);
    color: inherit;
    border-radius: 2px;
  }
  :global(.diff .skip) {
    padding: 4px 0 4px 4.7em;
    color: var(--disp-dim);
    font-style: italic;
    border-block: 1px dashed var(--disp-line);
  }
  @media (max-width: 599px) {
    :global(.diff .pair) {
      grid-template-columns: 1fr;
    }
  }
</style>
