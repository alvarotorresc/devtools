<script lang="ts">
  import { t } from '../../i18n';
  import { downloadBlob } from '../../lib/download';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import JsonTree from './JsonTree.svelte';
  import {
    byteSize,
    formatJson,
    lineAt,
    lineOffset,
    minifyJson,
    parseJson,
    shouldDebounce,
    type Indent,
    type ParseResult,
  } from './logic';
  import { meta } from './meta';
  import { fill, strings } from './strings';

  let { locale }: { locale: Locale } = $props();

  const s = $derived(strings[locale]);
  const input = persistedInput('json', '', meta.rememberInput ?? true);

  let tab: 'format' | 'tree' = $state('format');
  let output: 'pretty' | 'minified' = $state('pretty');
  let indent: Indent = $state('2');
  let sortKeys = $state(false);
  let result = $state<ParseResult | null>(null);
  let textarea: HTMLTextAreaElement | undefined = $state();

  $effect(() => {
    const text = input.value;
    if (!text.trim()) {
      result = null;
      return;
    }
    if (!shouldDebounce(text)) {
      result = parseJson(text);
      return;
    }
    const timer = setTimeout(() => (result = parseJson(text)), 300);
    return () => clearTimeout(timer);
  });

  const formatted = $derived(
    result?.ok
      ? output === 'pretty'
        ? formatJson(result.value, indent, sortKeys)
        : minifyJson(result.value, sortKeys)
      : '',
  );
  const ledState = $derived(!result ? 'idle' : result.ok ? 'ok' : 'bad');
  const ledLabel = $derived.by(() => {
    if (!result) return t(locale, 'led.idle');
    if (result.ok) return s.valid;
    const { line, column } = result.error;
    return line ? fill(s.errorAt, { line, column: column ?? 1 }) : s.errorNoLine;
  });
  const excerpt = $derived.by(() => {
    if (!result || result.ok || !result.error.line) return '';
    const text = lineAt(input.value, result.error.line);
    const caret = ' '.repeat(Math.max(0, (result.error.column ?? 1) - 1)) + '^';
    return `${result.error.line} | ${text}\n${' '.repeat(String(result.error.line).length + 3)}${caret}`;
  });

  function goToError() {
    if (!result || result.ok || !result.error.line || !textarea) return;
    const start = lineOffset(input.value, result.error.line);
    textarea.focus();
    textarea.setSelectionRange(start, start + lineAt(input.value, result.error.line).length);
  }

  function download() {
    downloadBlob(formatted, s.file, 'application/json');
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'format', label: meta.tabs![locale][0] },
      { value: 'tree', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field id="json-input" label={s.input}>
      {#snippet children({ describedby })}
        <TextArea
          id="json-input"
          bind:value={input.value}
          bind:element={textarea}
          placeholder={s.placeholder}
          {describedby}
          invalid={ledState === 'bad'}
          rows={10}
        />
      {/snippet}
    </Field>

    {#if tab === 'format'}
      <div class="row">
        <Segmented
          label={s.output}
          options={[
            { value: 'pretty', label: s.pretty },
            { value: 'minified', label: s.minified },
          ]}
          bind:value={output}
        />
        {#if output === 'pretty'}
          <label class="inline-label" for="json-indent">{s.indent}</label>
          <Select
            id="json-indent"
            bind:value={indent}
            options={[
              { value: '2', label: s.indent2 },
              { value: '4', label: s.indent4 },
              { value: 'tab', label: s.indentTab },
            ]}
          />
        {/if}
        <Toggle bind:checked={sortKeys} label={s.sortKeys} />
      </div>

      <Display live label={s.result}>
        {#snippet head()}
          <Led state={ledState} label={ledLabel} />
          {#if formatted}<span>{byteSize(formatted).toLocaleString(locale)} B</span>{/if}
        {/snippet}
        {#if excerpt}
          <pre class="display-code">{excerpt}</pre>
          <p class="display-note">{result && !result.ok ? result.error.message : ''}</p>
        {:else if formatted}
          <pre class="display-code">{formatted}</pre>
        {:else}
          <p class="display-note">{s.empty}</p>
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={formatted} {locale} />
        <Button variant="ghost" disabled={!formatted} onclick={download}
          >{t(locale, 'ui.download')}</Button
        >
        {#if excerpt}<Button variant="ghost" onclick={goToError}>{s.goToError}</Button>{/if}
        <Button variant="ghost" onclick={() => (input.value = '')} disabled={!input.value}
          >{t(locale, 'ui.clear')}</Button
        >
      </div>
    {:else}
      <Display label={meta.tabs![locale][1]}>
        {#if result?.ok}
          <div class="tree"><JsonTree value={result.value} {locale} /></div>
        {:else}
          <p class="display-note">{s.treeEmpty}</p>
        {/if}
      </Display>
    {/if}

    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>
</div>

<style>
  /* JsonTree's rules: see the note at the end of JsonTree.svelte. */
  .tree :global(.jt-node) {
    font: 14px/1.6 var(--font-mono);
  }
  .tree :global(.jt-line) {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    border-radius: 6px;
  }
  .tree :global(.jt-line:hover .jt-actions),
  .tree :global(.jt-line:focus-within .jt-actions) {
    opacity: 1;
  }
  .tree :global(.jt-toggle) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    background: none;
    border: 0;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .tree :global(.jt-spacer) {
    width: 14px;
    flex-shrink: 0;
  }
  .tree :global(.jt-key) {
    color: var(--disp-text);
  }
  .tree :global(.jt-meta) {
    color: var(--disp-dim);
  }
  .tree :global(.jt-val) {
    color: var(--disp-text);
    overflow-wrap: anywhere;
  }
  .tree :global(.jt-val.jt-string) {
    color: var(--ok);
  }
  .tree :global(.jt-val.jt-null),
  .tree :global(.jt-val.jt-boolean) {
    color: var(--disp-dim);
  }
  .tree :global(.jt-actions) {
    display: inline-flex;
    gap: 4px;
    margin-left: auto;
    opacity: 0;
    transition: opacity 120ms;
  }
  @media (hover: none) {
    .tree :global(.jt-actions) {
      opacity: 1;
    }
  }
  .tree :global(.jt-mini) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 6px;
    background: transparent;
    border: 1px solid var(--disp-line);
    border-radius: 6px;
    color: var(--disp-dim);
    font: 600 12px var(--font-mono);
    cursor: pointer;
  }
  .tree :global(.jt-children) {
    margin-left: 7px;
    padding-left: 12px;
    border-left: 1px solid var(--disp-line);
  }
  .tree :global(.jt-more) {
    margin: 4px 0;
    background: none;
    border: 0;
    color: var(--disp-dim);
    text-decoration: underline;
    cursor: pointer;
    font: inherit;
  }
  @media (pointer: coarse) {
    .tree :global(.jt-line) {
      min-height: 44px;
    }
    .tree :global(.jt-toggle),
    .tree :global(.jt-more) {
      min-height: 44px;
    }
    .tree :global(.jt-mini) {
      min-width: 44px;
      height: 44px;
    }
  }
  .inline-label {
    align-self: center;
    font-size: 13px;
    font-weight: 600;
  }
</style>
