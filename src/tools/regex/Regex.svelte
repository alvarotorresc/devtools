<script lang="ts">
  import { onMount, untrack } from 'svelte';
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
  import { readString, removeKey, writeString } from '../../lib/storage';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    FLAGS,
    MAX_MATCHES,
    findMatches,
    highlight,
    parseLiteral,
    replaceText,
    shouldDebounce,
    type FindResult,
    type Flag,
    type ReplaceResult,
  } from './logic';
  import { meta } from './meta';
  import { cheatsheet, flagNames, hints, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;

  // A catastrophic pattern freezes the tab and the remembered input would freeze it again on
  // every reload. The flag is set around each run: if it survives, the last run never ended.
  const RUNNING_KEY = 'regex.running';
  let paused = $state(false);
  let pausedAt: string | undefined;
  // Declared before persistedInput so it runs before the remembered input loads.
  onMount(() => {
    paused = readString(RUNNING_KEY, '', 'session') === '1';
  });
  const pattern = persistedInput('regex-pattern', '', remember);
  const text = persistedInput('regex', '', remember);

  const MAX_TABLE = 100;
  let tab = $state<'find' | 'replace'>('find');
  let flags = $state<Record<Flag, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  let replacement = $state('');
  let result = $state<FindResult | null>(null);
  let replaced = $state<ReplaceResult | null>(null);

  const flagString = $derived(FLAGS.filter((f) => flags[f]).join(''));

  $effect(() => {
    const p = pattern.value;
    const f = flagString;
    const body = text.value;
    const replacing = tab === 'replace';
    const r = replacement;
    if (untrack(() => paused)) {
      // Any edit re-enables the runs; until then nothing runs.
      const snapshot = [p, f, body, r].join('\u0000');
      pausedAt ??= snapshot;
      if (snapshot === pausedAt) return;
      paused = false;
      removeKey(RUNNING_KEY, 'session');
    }
    if (!p) {
      result = null;
      replaced = null;
      return;
    }
    // Find and replace share the gate and the timer: with a long text neither runs per keystroke.
    const run = () => {
      writeString(RUNNING_KEY, '1', 'session');
      const found = findMatches(p, f, body);
      const out = replacing && found.ok ? replaceText(p, f, body, r) : null;
      removeKey(RUNNING_KEY, 'session');
      result = found;
      replaced = out;
    };
    if (!shouldDebounce(body)) {
      run();
      return;
    }
    const timer = setTimeout(run, 150);
    return () => clearTimeout(timer);
  });

  function onPatternInput(e: Event & { currentTarget: HTMLInputElement }) {
    const literal = parseLiteral(e.currentTarget.value);
    if (!literal) return;
    pattern.value = literal.pattern;
    for (const f of FLAGS) flags[f] = literal.flags.includes(f);
  }

  const matches = $derived(result?.ok ? result.matches : []);
  const pieces = $derived(result?.ok ? highlight(text.value, matches) : []);
  const ledState = $derived(!result ? 'idle' : !result.ok ? 'bad' : matches.length ? 'ok' : 'idle');
  const ledLabel = $derived.by(() => {
    if (!result) return t(locale, 'led.idle');
    if (!result.ok) return s.invalid;
    if (tab === 'replace' && replaced?.ok)
      return replaced.count === 1 ? s.oneReplacement : fill(s.replaced, { n: replaced.count });
    if (!matches.length) return s.noMatches;
    return matches.length === 1 ? s.oneMatch : fill(s.matches, { n: matches.length });
  });
  const copyValue = $derived(
    tab === 'replace'
      ? replaced?.ok
        ? replaced.output
        : ''
      : matches.map((m) => m.text).join('\n'),
  );
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'find', label: meta.tabs![locale][0] },
      { value: 'replace', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field
      id="regex-pattern"
      label={s.pattern}
      help={s.patternHelp}
      error={result && !result.ok
        ? result.error.hint
          ? hints[locale][result.error.hint]
          : s.genericError
        : undefined}
    >
      {#snippet children({ describedby })}
        <div class="pattern">
          <span aria-hidden="true">/</span>
          <input
            id="regex-pattern"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder={s.patternPlaceholder}
            aria-describedby={describedby}
            aria-invalid={result ? !result.ok : false}
            bind:value={pattern.value}
            oninput={onPatternInput}
          />
          <span aria-hidden="true">/{flagString}</span>
        </div>
      {/snippet}
    </Field>

    <fieldset class="flags">
      <legend>{s.flags}</legend>
      {#each FLAGS as f (f)}
        <Toggle bind:checked={flags[f]} label={flagNames[locale][f]} />
      {/each}
    </fieldset>

    <Field id="regex-text" label={s.text}>
      {#snippet children({ describedby })}
        <TextArea
          id="regex-text"
          bind:value={text.value}
          placeholder={s.textPlaceholder}
          {describedby}
          rows={8}
        />
      {/snippet}
    </Field>

    {#if tab === 'replace'}
      <Field id="regex-replacement" label={s.replacement} help={s.replacementHelp}>
        {#snippet children({ describedby })}
          <input
            id="regex-replacement"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder={s.replacementPlaceholder}
            aria-describedby={describedby}
            bind:value={replacement}
          />
        {/snippet}
      </Field>
    {/if}

    <Display live label={tab === 'find' ? s.match : s.output}>
      {#snippet head()}
        <Led state={ledState} label={ledLabel} />
        {#if result?.ok && result.truncated}<span>{fill(s.truncated, { n: MAX_MATCHES })}</span
          >{/if}
      {/snippet}
      {#if paused}
        <p class="display-note" role="status">{s.paused}</p>
      {:else if !result}
        <p class="display-note">{s.empty}</p>
      {:else if !result.ok}
        <details class="tech">
          <summary>{s.technicalDetail}</summary>
          <p class="display-note">{result.error.message}</p>
        </details>
      {:else if tab === 'find'}
        <pre class="display-code wrap">{#each pieces as p, i (i)}{#if p.match !== null}<mark
                class:alt={p.match % 2 === 1}>{p.text}</mark
              >{:else}{p.text}{/if}{/each}</pre>
      {:else if replaced?.ok}
        <pre class="display-code wrap">{replaced.output}</pre>
      {/if}
    </Display>

    {#if tab === 'find' && matches.length}
      <Display label={s.groups}>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{s.match}</th>
                <th scope="col">{s.position}</th>
                {#each matches[0].groups as g (g.index)}
                  <th scope="col">{g.name ? `$<${g.name}>` : `$${g.index}`}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each matches.slice(0, MAX_TABLE) as m, i (i)}
                <tr>
                  <td>{i + 1}</td>
                  <td>{m.text}</td>
                  <td>{m.index}–{m.end}</td>
                  {#each m.groups as g (g.index)}
                    <td class:muted={g.value === undefined}>{g.value ?? s.undefinedGroup}</td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Display>
    {/if}

    <div class="row">
      <CopyButton
        main
        value={copyValue}
        {locale}
        label={tab === 'find' ? s.copyMatches : undefined}
      />
      <Button
        variant="ghost"
        disabled={!pattern.value && !text.value}
        onclick={() => {
          pattern.value = '';
          text.value = '';
          replacement = '';
        }}>{t(locale, 'ui.clear')}</Button
      >
    </div>

    <details class="cheat">
      <summary>{s.cheatsheet}</summary>
      <dl>
        {#each cheatsheet[locale] as [token, meaning] (token)}
          <dt><code>{token}</code></dt>
          <dd>{meaning}</dd>
        {/each}
      </dl>
    </details>

    <Toggle
      bind:checked={
        () => text.remember,
        (v) => {
          text.remember = v;
          pattern.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .pattern {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    color: var(--text-dim);
  }
  .flags {
    display: flex;
    flex-wrap: wrap;
    gap: 0 20px;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .flags legend {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
  }
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  mark {
    background: color-mix(in srgb, var(--disp-text) 32%, transparent);
    color: inherit;
    border-radius: 2px;
  }
  mark.alt {
    background: color-mix(in srgb, var(--ok) 32%, transparent);
  }
  .table-wrap {
    max-height: 50vh;
    overflow: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font: 400 13.5px/1.45 var(--font-mono);
  }
  th,
  td {
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid var(--disp-line);
    vertical-align: top;
    overflow-wrap: anywhere;
  }
  th {
    color: var(--disp-dim);
    font-weight: 600;
  }
  .muted {
    color: var(--disp-dim);
  }
  .tech summary {
    cursor: pointer;
    color: var(--disp-dim);
    font-size: 13px;
  }
  .tech p {
    margin-top: 6px;
  }
  .cheat summary {
    padding: 12px 0;
    cursor: pointer;
    font-weight: 600;
  }
  .cheat dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 6px 20px;
    margin: 8px 0 0;
    font-size: 14px;
  }
  .cheat dd {
    margin: 0;
    color: var(--text-dim);
  }
  .cheat code {
    font-family: var(--font-mono);
  }
</style>
