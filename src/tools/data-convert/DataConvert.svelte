<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
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
  import {
    readInput,
    shouldDebounce,
    writeOutput,
    type Format,
    type InputFormat,
    type ReadResult,
    type Sep,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('data-convert', '', meta.rememberInput ?? true);

  const NAMES: Record<Format, string> = { json: 'JSON', yaml: 'YAML', csv: 'CSV' };
  const MIME: Record<Format, string> = {
    json: 'application/json',
    yaml: 'application/yaml',
    csv: 'text/csv;charset=utf-8',
  };

  let from = $state<InputFormat>('auto');
  let to = $state<Format>('json');
  let sep = $state<Sep>(',');
  let header = $state(true);
  let detectTypes = $state(false);
  let read = $state<ReadResult | null>(null);

  $effect(() => {
    const text = input.value;
    const opts = { header, detectTypes };
    const format = from;
    if (!text.trim()) {
      read = null;
      return;
    }
    if (!shouldDebounce(text)) {
      read = readInput(text, format, opts);
      return;
    }
    const timer = setTimeout(() => (read = readInput(text, format, opts)), 150);
    return () => clearTimeout(timer);
  });

  const written = $derived(read?.ok ? writeOutput(read.value, to, sep) : null);
  const output = $derived(written?.ok ? written.text : '');
  const sepName = (v: Sep) => (v === '\t' ? s.tabName : v);

  const status = $derived.by(() => {
    if (!read) return '';
    if (!read.ok) {
      if (read.format === 'csv' && read.line !== null)
        return fill(s.unclosedQuote, { line: read.line });
      if (read.line !== null && read.column !== null)
        return fill(s.errorAt, { line: read.line, column: read.column, message: read.message });
      if (read.line !== null) return fill(s.errorLine, { line: read.line, message: read.message });
      return read.message;
    }
    if (from !== 'auto') return fill(s.read, { format: NAMES[read.format] });
    if (read.format === 'csv' && read.sep) return fill(s.detectedCsv, { sep: sepName(read.sep) });
    return fill(s.detected, { format: NAMES[read.format] });
  });

  const csvInput = $derived(
    from === 'csv' || (from === 'auto' && read?.ok && read.format === 'csv'),
  );

  function download() {
    downloadBlob(output, `${s.file}.${to}`, MIME[to]);
  }
</script>

<div class="panel">
  <Field id="data-convert-input" label={s.input} error={read && !read.ok ? status : undefined}>
    {#snippet children({ describedby })}
      <TextArea
        id="data-convert-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        invalid={!!read && !read.ok}
        rows={10}
      />
    {/snippet}
  </Field>

  <div class="row">
    <Field id="data-convert-from" label={s.from}>
      {#snippet children({ describedby })}
        <Select
          id="data-convert-from"
          bind:value={from}
          {describedby}
          options={[
            { value: 'auto', label: s.auto },
            { value: 'json', label: 'JSON' },
            { value: 'yaml', label: 'YAML' },
            { value: 'csv', label: 'CSV' },
          ]}
        />
      {/snippet}
    </Field>
    <Segmented
      label={s.to}
      options={[
        { value: 'json', label: 'JSON' },
        { value: 'yaml', label: 'YAML' },
        { value: 'csv', label: 'CSV' },
      ]}
      bind:value={to}
    />
    {#if to === 'csv'}
      <Field id="data-convert-sep" label={s.sep}>
        {#snippet children({ describedby })}
          <Select
            id="data-convert-sep"
            bind:value={sep}
            {describedby}
            options={[
              { value: ',', label: s.comma },
              { value: ';', label: s.semicolon },
              { value: '\t', label: s.tab },
            ]}
          />
        {/snippet}
      </Field>
    {/if}
  </div>

  {#if csvInput}
    <div class="row">
      <Toggle bind:checked={header} label={s.header} />
      <Toggle bind:checked={detectTypes} label={s.detectTypes} />
    </div>
  {/if}

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!read ? 'idle' : read.ok && written?.ok ? 'ok' : 'bad'}
        label={!read ? t(locale, 'led.idle') : !read.ok ? t(locale, 'ui.fixField') : status}
      />
    {/snippet}
    {#if !read}
      <p class="display-note">{s.empty}</p>
    {:else if read.ok}
      <!-- read.ok === false already shows `status` under the field (I3); nothing to repeat here. -->
      {#if written && !written.ok}
        <p class="display-note">{s.notTable}</p>
      {:else}
        <pre class="display-code">{output}</pre>
        {#if read.documents}
          <p class="display-note">{fill(s.documents, { n: read.documents })}</p>
        {/if}
        {#each read.csvWarnings ?? [] as w (w.row)}
          <p class="display-note">
            {fill(s.columns, { row: w.row, columns: w.columns, expected: w.expected })}
          </p>
        {/each}
        {#if to === 'csv'}
          <p class="display-note">{s.csvTypes}</p>
          {#if written?.dottedKeys}<p class="display-note">{s.dotted}</p>{/if}
        {/if}
      {/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={output} {locale} label={s.copyResult} />
    <Button variant="ghost" disabled={!output} onclick={download}>{t(locale, 'ui.download')}</Button
    >
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>
