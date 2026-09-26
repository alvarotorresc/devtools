<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Button from '../../ui/Button.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import FileDrop from '../../ui/FileDrop.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    ALGORITHMS,
    MAX_FILE_BYTES,
    findMatch,
    hashAll,
    shouldDebounce,
    type Hashes,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  // meta.rememberInput is false: hashed text is often a secret, so it lives only in memory.
  let tab = $state<'text' | 'file'>('text');
  let text = $state('');
  let expected = $state('');
  let uppercase = $state(false);
  let textHashes = $state<Hashes | null>(null);
  let fileHashes = $state<Hashes | null>(null);
  let fileInfo = $state('');
  let fileError = $state('');
  let busy = $state(false);
  // Each run gets a number; an older, slower run must not overwrite a newer result.
  let run = 0;
  let fileRun = 0;

  $effect(() => {
    const value = text;
    const id = ++run;
    if (!value) {
      textHashes = null;
      return;
    }
    const compute = () =>
      void hashAll(value).then((h) => {
        if (id === run) textHashes = h;
      });
    if (!shouldDebounce(value.length)) {
      compute();
      return;
    }
    const timer = setTimeout(compute, 150);
    return () => clearTimeout(timer);
  });

  async function onfile(f: File) {
    fileError = '';
    fileHashes = null;
    fileInfo = `${f.name} · ${f.size.toLocaleString(locale)} B`;
    const id = ++fileRun;
    if (f.size > MAX_FILE_BYTES) {
      fileError = fill(s.tooBig, { max: `${MAX_FILE_BYTES / 1024 / 1024} MB` });
      busy = false;
      return;
    }
    busy = true;
    try {
      const h = await hashAll(new Uint8Array(await f.arrayBuffer()));
      if (id === fileRun) fileHashes = h;
    } catch {
      if (id === fileRun) fileError = s.fileError;
    } finally {
      if (id === fileRun) busy = false;
    }
  }

  const hashes = $derived(tab === 'text' ? textHashes : fileHashes);
  const shown = (h: string) => (uppercase ? h.toUpperCase() : h);
  const match = $derived(hashes && expected.trim() ? findMatch(expected, hashes) : null);
  const compareState = $derived(!expected.trim() || !hashes ? 'idle' : match ? 'ok' : 'bad');
  const compareLabel = $derived(
    compareState === 'idle'
      ? t(locale, 'led.idle')
      : match
        ? fill(s.matches, { algo: match })
        : s.noMatch,
  );
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'text', label: meta.tabs![locale][0] },
      { value: 'file', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'text'}
      <Field id="hash-input" label={s.input} help={s.notStored}>
        {#snippet children({ describedby })}
          <TextArea
            id="hash-input"
            bind:value={text}
            placeholder={s.placeholder}
            {describedby}
            rows={6}
          />
        {/snippet}
      </Field>
    {:else}
      <FileDrop {locale} onfile={(f) => void onfile(f)} />
      {#if fileError}<p class="error" role="alert">{fileError}</p>{/if}
    {/if}

    <Field id="hash-compare" label={s.compare}>
      {#snippet children({ describedby })}
        <input
          id="hash-compare"
          class="control mono"
          type="text"
          autocomplete="off"
          spellcheck="false"
          placeholder={s.comparePlaceholder}
          aria-describedby={describedby}
          bind:value={expected}
        />
      {/snippet}
    </Field>

    <Display live label={s.result}>
      {#snippet head()}
        <Led state={compareState} label={compareLabel} />
        {#if tab === 'file' && fileInfo}<span>{fileInfo}</span>{/if}
      {/snippet}
      {#if hashes}
        <div class="display-rows">
          {#each ALGORITHMS as algo (algo)}
            <div class="display-row" class:hit={match === algo}>
              <span class="hash"><span class="algo">{algo}</span>{shown(hashes[algo])}</span>
              <CopyButton value={shown(hashes[algo])} {locale} compact />
            </div>
          {/each}
        </div>
        {#if compareState === 'bad'}<p class="display-note">{s.noMatchHint}</p>{/if}
      {:else if busy && tab === 'file'}
        <p class="display-note">{s.reading}</p>
      {:else}
        <p class="display-note">{tab === 'text' ? s.empty : s.fileEmpty}</p>
      {/if}
    </Display>

    <div class="row">
      <CopyButton main value={hashes ? shown(hashes['SHA-256']) : ''} {locale} label={s.copyMain} />
      <Toggle bind:checked={uppercase} label={s.uppercase} />
      {#if tab === 'text'}
        <Button variant="ghost" disabled={!text} onclick={() => (text = '')}
          >{t(locale, 'ui.clear')}</Button
        >
      {/if}
    </div>
  </div>
</div>

<style>
  .hash {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    font-size: 14px;
  }
  .algo {
    color: var(--disp-dim);
    font-size: 12px;
    letter-spacing: 0;
  }
  .hit {
    color: var(--ok);
  }
  .error {
    color: var(--bad);
    font-size: 14px;
    font-weight: 600;
  }
</style>
