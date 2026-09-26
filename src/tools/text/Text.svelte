<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { CASES, DEFAULT_LINE_OPTIONS, countText, processLines, type LineOptions } from './logic';
  import { meta } from './meta';
  import { caseNames, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('text', '', meta.rememberInput ?? true);

  let tab = $state<'case' | 'lines'>('case');
  let opts = $state<LineOptions>({ ...DEFAULT_LINE_OPTIONS });

  const stats = $derived(countText(input.value));
  const converted = $derived(
    input.value ? CASES.map((c) => ({ ...c, value: c.fn(input.value) })) : [],
  );
  const processed = $derived(input.value ? processLines(input.value, opts, locale) : '');
  const processedLines = $derived(processed ? processed.split('\n').length : 0);
  const PREVIEW = 300;
  const preview = (v: string) => (v.length > PREVIEW ? `${v.slice(0, PREVIEW)}…` : v);
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'case', label: meta.tabs![locale][0] },
      { value: 'lines', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field id="text-input" label={s.input}>
      {#snippet children({ describedby })}
        <TextArea
          id="text-input"
          bind:value={input.value}
          placeholder={s.placeholder}
          {describedby}
          mono={false}
          spellcheck={true}
          rows={8}
        />
      {/snippet}
    </Field>

    <dl class="stats" aria-label={s.stats}>
      <div>
        <dt>{s.chars}</dt>
        <dd>{stats.chars.toLocaleString(locale)}</dd>
      </div>
      <div>
        <dt>{s.words}</dt>
        <dd>{stats.words.toLocaleString(locale)}</dd>
      </div>
      <div>
        <dt>{s.lines}</dt>
        <dd>{stats.lines.toLocaleString(locale)}</dd>
      </div>
      <div>
        <dt>{s.bytes}</dt>
        <dd>{stats.bytes.toLocaleString(locale)}</dd>
      </div>
    </dl>

    {#if tab === 'case'}
      <Display label={s.cases}>
        {#if converted.length}
          <div class="display-rows">
            {#each converted as c (c.id)}
              <div class="display-row">
                <span class="case">
                  <span class="name">{caseNames[locale][c.id] ?? c.label}</span>
                  <span class="value">{preview(c.value)}</span>
                </span>
                <CopyButton
                  value={() => c.value}
                  {locale}
                  compact
                  ariaLabel={`${t(locale, 'ui.copy')} ${caseNames[locale][c.id] ?? c.label}`}
                  disabled={!c.value}
                />
              </div>
            {/each}
          </div>
          <p class="display-note">{s.perLine}</p>
        {:else}
          <p class="display-note">{s.emptyCases}</p>
        {/if}
      </Display>
    {:else}
      <div class="row">
        <Field id="text-sort" label={s.sort}>
          {#snippet children({ describedby })}
            <Select
              id="text-sort"
              bind:value={opts.sort}
              {describedby}
              options={[
                { value: 'none', label: s.sortNone },
                { value: 'az', label: s.sortAz },
                { value: 'za', label: s.sortZa },
                { value: 'natural', label: s.sortNatural },
              ]}
            />
          {/snippet}
        </Field>
        <Toggle bind:checked={opts.reverse} label={s.reverse} />
        <Toggle bind:checked={opts.dedupe} label={s.dedupe} />
        <Toggle bind:checked={opts.removeEmpty} label={s.removeEmpty} />
        <Toggle bind:checked={opts.trim} label={s.trim} />
        <Toggle bind:checked={opts.number} label={s.number} />
      </div>

      <Display live label={s.result}>
        {#snippet head()}
          <span
            >{processed ? fill(s.resultLines, { n: processedLines }) : t(locale, 'led.idle')}</span
          >
        {/snippet}
        {#if processed}
          <pre class="display-code">{processed}</pre>
        {:else}
          <p class="display-note">{s.emptyLines}</p>
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={processed} {locale} />
        <Button
          variant="ghost"
          icon="arrow-left-right"
          disabled={!processed}
          onclick={() => (input.value = processed)}
        >
          {t(locale, 'ui.useOutput')}
        </Button>
      </div>
    {/if}

    <div class="row">
      <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
        >{t(locale, 'ui.clear')}</Button
      >
      <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
    </div>
  </div>
</div>

<style>
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    margin: 0;
    font-size: 14px;
  }
  .stats div {
    display: flex;
    gap: 8px;
  }
  .stats dt {
    color: var(--text-dim);
  }
  .stats dd {
    margin: 0;
    font-family: var(--font-mono);
    font-weight: 600;
  }
  .case {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .name {
    color: var(--disp-dim);
    font-size: 12px;
    letter-spacing: 0;
  }
  .value {
    white-space: pre-wrap;
  }
</style>
