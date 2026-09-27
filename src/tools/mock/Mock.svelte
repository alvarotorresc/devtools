<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { downloadBlob } from '../../lib/download';
  import { randomSeed } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    MAX_ROWS,
    PREVIEW_ROWS,
    addField,
    defaultConfig,
    isAvailable,
    moveField,
    parseConfig,
    renderMock,
    type CustomKind,
    type MockError,
  } from './logic';
  import { meta } from './meta';
  import { fieldNames, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const names = $derived(fieldNames[locale]);

  // The configuration (fields, names, parameters, rows, format, table, seed and mode) is saved
  // as JSON. It holds no personal data: every generated value is fictitious and recomputed.
  const stored = persistedInput('mock', '', meta.rememberInput ?? true);
  // Only the first locale matters: it names the default columns before a saved config loads.
  // svelte-ignore state_referenced_locally
  let config = $state(defaultConfig(locale));
  let loaded = $state(false);
  // Random per session and re-rolled by "Generar": changing the settings keeps the same data.
  let session = $state('');
  let now = $state(new Date());
  let addKind = $state<CustomKind>('number');

  onMount(() => {
    if (stored.value) config = parseConfig(stored.value, locale);
    session = randomSeed();
    now = new Date();
    loaded = true;
  });

  $effect(() => {
    const json = JSON.stringify(config);
    if (loaded) stored.value = json;
  });

  const result = $derived(session ? renderMock(config, now, session) : null);

  function errorText(e: MockError): string {
    switch (e.reason) {
      case 'noFields':
        return s.noFields;
      case 'emptyName':
        return s.emptyName;
      case 'table':
        return s.tableError;
      default:
        return fill(s[e.reason], { name: e.name });
    }
  }

  const tableError = $derived(
    result && !result.ok && result.error.reason === 'table' ? s.tableError : undefined,
  );

  function download() {
    if (!result?.ok) return;
    const types = { json: 'application/json', csv: 'text/csv', sql: 'application/sql' };
    downloadBlob(
      result.output,
      `${s.file}.${config.format}`,
      `${types[config.format]};charset=utf-8`,
    );
  }
</script>

<div class="panel">
  <div class="stack tight">
    <span class="label">{s.fields}</span>
    <ul class="fields">
      {#each config.fields as f, i (f.uid)}
        {@const available = isAvailable(f, config.international)}
        <li class="field" class:off={!available}>
          <label class="check">
            <input
              type="checkbox"
              bind:checked={f.enabled}
              disabled={!available}
              aria-label={fill(s.include, { field: names[f.kind] })}
            />
            <span>{names[f.kind]}</span>
          </label>
          <input
            class="control mono name"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-label={fill(s.column, { field: names[f.kind] })}
            disabled={!available}
            bind:value={f.name}
          />
          {#if f.kind === 'number'}
            <input
              class="control mono num"
              type="number"
              step="any"
              aria-label={s.min}
              placeholder={s.min}
              bind:value={f.min}
            />
            <input
              class="control mono num"
              type="number"
              step="any"
              aria-label={s.max}
              placeholder={s.max}
              bind:value={f.max}
            />
            <label class="param">
              <span>{s.decimals}</span>
              <NumberInput id="mock-{f.uid}-decimals" bind:value={f.decimals} min={0} max={4} />
            </label>
          {:else if f.kind === 'boolean'}
            <label class="param">
              <span>{s.probability}</span>
              <NumberInput
                id="mock-{f.uid}-probability"
                bind:value={f.probability}
                min={0}
                max={100}
              />
            </label>
          {:else if f.kind === 'date'}
            <input class="control mono date" type="date" aria-label={s.from} bind:value={f.from} />
            <input class="control mono date" type="date" aria-label={s.to} bind:value={f.to} />
          {:else if f.kind === 'list'}
            <textarea
              class="control mono values"
              rows="2"
              aria-label={s.values}
              placeholder={s.values}
              bind:value={f.values}></textarea>
          {/if}
          {#if !available}<span class="spain-only">{s.spainOnly}</span>{/if}
          <span class="moves">
            <span class="up">
              <Button
                variant="icon"
                icon="chevron-down"
                label={fill(s.up, { field: f.name || names[f.kind] })}
                disabled={i === 0}
                onclick={() => (config.fields = moveField(config.fields, i, -1))}
              />
            </span>
            <Button
              variant="icon"
              icon="chevron-down"
              label={fill(s.down, { field: f.name || names[f.kind] })}
              disabled={i === config.fields.length - 1}
              onclick={() => (config.fields = moveField(config.fields, i, 1))}
            />
            {#if f.uid !== f.kind}
              <Button
                variant="icon"
                icon="x"
                label={fill(s.remove, { field: f.name || names[f.kind] })}
                onclick={() => (config.fields = config.fields.filter((x) => x.uid !== f.uid))}
              />
            {/if}
          </span>
        </li>
      {/each}
    </ul>
    <div class="row">
      <Field id="mock-add-kind" label={s.addKind}>
        <Select
          id="mock-add-kind"
          bind:value={addKind}
          options={[
            { value: 'number', label: names.number },
            { value: 'date', label: names.date },
            { value: 'list', label: names.list },
          ]}
        />
      </Field>
      <Button variant="secondary" onclick={() => (config = addField(config, addKind, locale))}>
        {s.add}
      </Button>
    </div>
  </div>

  <div class="stack tight">
    <span class="label">{s.options}</span>
    <div class="row top">
      <Field id="mock-rows" label={s.rows}>
        <NumberInput id="mock-rows" bind:value={config.rows} min={1} max={MAX_ROWS} />
      </Field>
      <Field id="mock-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
        {#snippet children({ describedby })}
          <input
            id="mock-seed"
            class="control mono seed"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            bind:value={config.seed}
          />
        {/snippet}
      </Field>
      <div class="stack tight">
        <span class="label">{s.format}</span>
        <Segmented
          label={s.format}
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'csv', label: 'CSV' },
            { value: 'sql', label: 'SQL' },
          ]}
          bind:value={config.format}
        />
      </div>
      {#if config.format === 'sql'}
        <Field id="mock-table" label={s.table} error={tableError}>
          {#snippet children({ describedby })}
            <input
              id="mock-table"
              class="control mono seed"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={!!tableError}
              bind:value={config.table}
            />
          {/snippet}
        </Field>
      {/if}
    </div>
    <Toggle bind:checked={config.international} label={s.international} />
  </div>

  <div class="row">
    <Button variant="primary" icon="refresh-cw" onclick={() => (session = randomSeed())}>
      {t(locale, 'ui.generate')}
    </Button>
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      {#if result?.ok}
        <span>{fill(s.summary, { rows: result.rows, cols: result.columns.length })}</span>
      {/if}
    {/snippet}
    {#if result && !result.ok}
      <p class="display-note">{errorText(result.error)}</p>
    {:else if result?.ok}
      <pre class="display-code">{result.preview}</pre>
      {#if result.rows > PREVIEW_ROWS}
        <p class="display-note">{fill(s.more, { n: result.rows - PREVIEW_ROWS })}</p>
      {/if}
    {/if}
  </Display>
  <p class="test-only">{t(locale, 'ui.testOnly')}</p>

  <div class="row">
    <CopyButton main value={result?.ok ? result.output : ''} {locale} />
    <Button variant="ghost" disabled={!result?.ok} onclick={download}>
      {t(locale, 'ui.download')}
    </Button>
  </div>
  <Toggle bind:checked={stored.remember} label={t(locale, 'tool.remember')} />
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
  .fields {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .field {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }
  .field:last-child {
    border-bottom: 0;
  }
  .field.off {
    opacity: 0.55;
  }
  .check {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 180px;
    min-height: 36px;
    font-size: 14px;
    cursor: pointer;
  }
  .check input {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
  }
  .check input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .name {
    width: 190px;
  }
  .num {
    width: 110px;
  }
  .date {
    width: 170px;
  }
  .values {
    flex: 1 1 220px;
    min-height: 44px;
    resize: vertical;
  }
  .seed {
    width: 200px;
  }
  .param {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-dim);
  }
  .spain-only {
    font-size: 13px;
    color: var(--text-dim);
  }
  .moves {
    display: inline-flex;
    gap: 6px;
    margin-left: auto;
  }
  .up :global(svg) {
    rotate: 180deg;
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
  @media (pointer: coarse) {
    .check {
      min-height: 44px;
    }
  }
</style>
