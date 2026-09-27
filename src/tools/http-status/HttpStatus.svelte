<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { t } from '../../i18n';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { codeFromHash, searchCodes, type Group } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const query = persistedInput('http-status', '', meta.rememberInput ?? true);

  let group = $state<Group>('all');
  let highlight = $state<number | null>(null);

  const results = $derived(searchCodes(query.value, group));

  onMount(() => {
    const code = codeFromHash(location.hash);
    if (code === null) return;
    // Make sure a saved search or filter does not hide the linked code.
    if (!searchCodes(query.value, group).some((c) => c.code === code)) {
      query.value = '';
      group = 'all';
    }
    highlight = code;
    void tick().then(() =>
      document.getElementById(`status-${code}`)?.scrollIntoView({ block: 'center' }),
    );
  });
</script>

<div class="panel">
  <Field id="http-status-search" label={s.search}>
    {#snippet children({ describedby })}
      <input
        id="http-status-search"
        class="control"
        type="search"
        bind:value={query.value}
        placeholder={s.placeholder}
        aria-describedby={describedby}
        autocomplete="off"
        spellcheck="false"
      />
    {/snippet}
  </Field>

  <Segmented
    label={s.group}
    options={[
      { value: 'all', label: s.all },
      { value: '1', label: '1xx' },
      { value: '2', label: '2xx' },
      { value: '3', label: '3xx' },
      { value: '4', label: '4xx' },
      { value: '5', label: '5xx' },
    ]}
    bind:value={group}
  />

  <Display live label={s.result}>
    {#snippet head()}
      <span>{results.length === 1 ? s.one : fill(s.count, { n: results.length })}</span>
    {/snippet}
    {#if results.length}
      <ul class="codes">
        {#each results as c (c.code)}
          <li id="status-{c.code}" class="code-row" class:highlight={highlight === c.code}>
            <span class="num">{c.code}</span>
            <div class="info">
              <p class="title">
                <span class="phrase">{c.phrase}</span>
                {#if locale === 'es'}<span class="es">· {c.es}</span>{/if}
                {#if c.note}<span class="badge">{s[c.note]}</span>{/if}
              </p>
              <p class="desc">{c.desc[locale]}</p>
              {#if c.when}<p class="desc"><strong>{s.when}</strong> {c.when[locale]}</p>{/if}
              <p class="ref">{c.ref}</p>
            </div>
            <CopyButton
              value={String(c.code)}
              {locale}
              compact
              label={s.copyCode}
              ariaLabel={fill(s.copyCodeOf, { code: c.code })}
            />
          </li>
        {/each}
      </ul>
    {:else}
      <p class="display-note">{fill(s.none, { q: query.value.trim() })}</p>
    {/if}
  </Display>

  <Toggle bind:checked={query.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .codes {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .code-row {
    display: grid;
    grid-template-columns: 3.2em minmax(0, 1fr) auto;
    align-items: start;
    gap: 12px;
    padding: 12px 4px;
    border-bottom: 1px solid var(--disp-line);
    scroll-margin: 96px;
  }
  .code-row:last-child {
    border-bottom: 0;
  }
  .highlight {
    background: color-mix(in srgb, var(--disp-text) 12%, transparent);
    border-radius: 6px;
  }
  .num {
    font: 600 20px/1.2 var(--font-mono);
    text-shadow: var(--disp-glow);
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
    font-weight: 600;
  }
  .es {
    font-weight: 500;
    color: var(--disp-dim);
  }
  .badge {
    padding: 1px 8px;
    border: 1px solid var(--disp-line);
    border-radius: var(--radius-pill);
    font-size: 12px;
    font-weight: 500;
    color: var(--disp-dim);
  }
  .desc {
    font-size: 14px;
    line-height: 1.5;
  }
  .ref {
    font: 12.5px var(--font-mono);
    color: var(--disp-dim);
  }
  @media (max-width: 599px) {
    .code-row {
      grid-template-columns: 2.8em minmax(0, 1fr);
    }
    .code-row :global(.copy) {
      grid-column: 2;
      justify-self: start;
    }
  }
</style>
