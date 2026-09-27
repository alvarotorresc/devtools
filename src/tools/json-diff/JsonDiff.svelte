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
  import { parseJson, type ParseResult } from '../json/logic';
  import type { Locale } from '../types';
  import {
    diffJson,
    reportText,
    shouldDebounce,
    symbolOf,
    type ChangeKind,
    type DiffResult,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const left = persistedInput('json-diff', '', remember);
  const right = persistedInput('json-diff-b', '', remember);

  let filter = $state<'all' | ChangeKind>('all');
  let parsedA = $state<ParseResult | null>(null);
  let parsedB = $state<ParseResult | null>(null);
  let result = $state<DiffResult | null>(null);

  $effect(() => {
    const a = left.value;
    const b = right.value;
    const run = () => {
      // Local copies: reading a $state this effect just wrote would make it depend on itself.
      const pa = a.trim() ? parseJson(a) : null;
      const pb = b.trim() ? parseJson(b) : null;
      parsedA = pa;
      parsedB = pb;
      result = pa?.ok && pb?.ok ? diffJson(pa.value, pb.value) : null;
    };
    if (!shouldDebounce(a, b)) {
      run();
      return;
    }
    const timer = setTimeout(run, 150);
    return () => clearTimeout(timer);
  });

  function errorOf(p: ParseResult | null): string | undefined {
    if (!p || p.ok) return undefined;
    const { line, column } = p.error;
    return line ? fill(s.jsonError, { line, column: column ?? 1 }) : s.jsonErrorNoLine;
  }

  const count = (n: number, one: string, many: string) => fill(n === 1 ? one : many, { n });
  const total = $derived(
    result ? result.counts.added + result.counts.removed + result.counts.changed : 0,
  );
  const summary = $derived(
    result
      ? [
          count(result.counts.added, s.addedOne, s.addedMany),
          count(result.counts.removed, s.removedOne, s.removedMany),
          count(result.counts.changed, s.changedOne, s.changedMany),
        ].join(' · ')
      : '',
  );
  const shown = $derived(
    result ? result.changes.filter((c) => filter === 'all' || c.kind === filter) : [],
  );
  const kindLabel = $derived({
    added: s.kindAdded,
    removed: s.kindRemoved,
    changed: s.kindChanged,
  });
  // "Missing" is only accurate when the other side is actually empty; when both sides have
  // content but at least one fails to parse, say so instead (its own error already sits under
  // the field, so this is just the summary panel agreeing with reality).
  const note = $derived(
    parsedA === null && parsedB === null
      ? s.empty
      : parsedA === null || parsedB === null
        ? s.waiting
        : s.invalid,
  );
  const reportValue = $derived(
    result && total > 0
      ? result.hidden > 0
        ? `${reportText(result.changes)}\n${fill(s.more, { n: result.hidden })}`
        : reportText(result.changes)
      : '',
  );

  function swap() {
    const a = left.value;
    left.value = right.value;
    right.value = a;
  }
</script>

<div class="panel">
  <div class="inputs">
    <Field id="json-diff-a" label={s.original} error={errorOf(parsedA)}>
      {#snippet children({ describedby })}
        <TextArea
          id="json-diff-a"
          bind:value={left.value}
          placeholder={s.originalPlaceholder}
          {describedby}
          invalid={!!errorOf(parsedA)}
          rows={10}
        />
      {/snippet}
    </Field>
    <Field id="json-diff-b" label={s.modified} error={errorOf(parsedB)}>
      {#snippet children({ describedby })}
        <TextArea
          id="json-diff-b"
          bind:value={right.value}
          placeholder={s.modifiedPlaceholder}
          {describedby}
          invalid={!!errorOf(parsedB)}
          rows={10}
        />
      {/snippet}
    </Field>
  </div>

  <Segmented
    label={s.filter}
    options={[
      { value: 'all', label: s.all },
      { value: 'added', label: s.added },
      { value: 'removed', label: s.removed },
      { value: 'changed', label: s.changed },
    ]}
    bind:value={filter}
  />

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!result ? 'idle' : total === 0 ? 'ok' : 'bad'}
        label={!result ? t(locale, 'led.idle') : total === 0 ? s.equal : summary}
      />
    {/snippet}
    {#if !result}
      <p class="display-note">{note}</p>
    {:else if total > 0}
      {#if shown.length}
        <ul class="display-rows changes">
          {#each shown as c, i (i)}
            <li class="display-row change {c.kind}">
              <span class="sym" aria-hidden="true">{symbolOf(c.kind)}</span>
              <span class="visually-hidden">{kindLabel[c.kind]}</span>
              <span class="body">
                <span class="path">{c.path}</span>
                <span class="vals">
                  {#if c.kind === 'changed'}{c.before} → {c.after}{:else if c.kind === 'added'}{c.after}{:else}{c.before}{/if}
                </span>
              </span>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="display-note">{s.noneOfKind}</p>
      {/if}
      {#if result.hidden > 0}<p class="display-note">{fill(s.more, { n: result.hidden })}</p>{/if}
      <p class="display-note">{s.arrays}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={reportValue} {locale} label={s.copyReport} />
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
  .changes {
    max-height: 60vh;
    overflow: auto;
    list-style: none;
    padding: 0;
  }
  .change {
    justify-content: flex-start;
    align-items: flex-start;
  }
  .sym {
    flex-shrink: 0;
    width: 1.2em;
    font-weight: 700;
    text-align: center;
  }
  .added .sym {
    color: var(--ok);
  }
  .removed .sym {
    color: var(--bad);
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .vals {
    font-size: 13px;
    color: var(--disp-dim);
    letter-spacing: 0;
  }
</style>
