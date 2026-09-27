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
  import { parseJson } from '../json/logic';
  import type { Locale } from '../types';
  import {
    detectDirection,
    hasSensitiveKey,
    jsonToQuery,
    queryToJson,
    type Direction,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput(
    'query-string',
    '',
    meta.rememberInput ?? true,
    (v) => !hasSensitiveKey(v),
  );

  let direction = $state<Direction>('auto');
  let brackets = $state(true);
  let detectTypes = $state(false);
  let plus = $state(false);

  const text = $derived(input.value.trim());
  const dir = $derived(direction === 'auto' ? detectDirection(text) : direction);
  const sensitive = $derived(!!text && hasSensitiveKey(text));

  const out = $derived.by(() => {
    if (!text) return null;
    if (dir === 'toJson') {
      const r = queryToJson(text, { brackets, detectTypes });
      return {
        ok: true as const,
        output: JSON.stringify(r.value, null, 2),
        pairs: r.pairs,
        undecodable: r.undecodable,
      };
    }
    const parsed = parseJson(text);
    if (!parsed.ok) {
      const { line, column } = parsed.error;
      return {
        ok: false as const,
        error: line ? fill(s.jsonError, { line, column: column ?? 1 }) : s.jsonErrorNoLine,
      };
    }
    const r = jsonToQuery(parsed.value, { brackets, plusForSpace: plus });
    if (!r.ok) return { ok: false as const, error: s.notObject };
    return {
      ok: true as const,
      output: r.query,
      pairs: queryToJson(r.query, { brackets, detectTypes: false }).pairs,
      undecodable: [] as string[],
    };
  });
</script>

<div class="panel">
  <Segmented
    label={s.direction}
    options={[
      { value: 'auto', label: s.auto },
      { value: 'toJson', label: s.toJson },
      { value: 'toQuery', label: s.toQuery },
    ]}
    bind:value={direction}
  />

  <Field
    id="query-string-input"
    label={s.input}
    help={sensitive && input.remember ? s.notSaved : undefined}
  >
    {#snippet children({ describedby })}
      <TextArea
        id="query-string-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        invalid={!!out && !out.ok}
        rows={6}
      />
    {/snippet}
  </Field>

  <div class="row">
    <Toggle bind:checked={brackets} label={s.brackets} />
    {#if dir === 'toJson'}
      <Toggle bind:checked={detectTypes} label={s.detectTypes} />
    {:else}
      <Toggle bind:checked={plus} label={s.plus} />
    {/if}
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!out ? 'idle' : out.ok ? 'ok' : 'bad'}
        label={!out
          ? t(locale, 'led.idle')
          : !out.ok
            ? out.error
            : dir === 'toJson'
              ? s.detectedJson
              : s.detectedQuery}
      />
    {/snippet}
    {#if out?.ok}
      <pre class="display-code">{out.output || ' '}</pre>
      {#each out.undecodable as seq (seq)}
        <p class="display-note">{fill(s.undecodable, { seq })}</p>
      {/each}
      <h2 class="pairs-title">{s.pairs}</h2>
      {#if out.pairs.length}
        <div class="pairs-wrap">
          <table class="pairs">
            <thead>
              <tr><th scope="col">{s.key}</th><th scope="col">{s.value}</th></tr>
            </thead>
            <tbody>
              {#each out.pairs as [k, v], i (i)}
                <tr><td>{k}</td><td>{v}</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="display-note">{s.noPairs}</p>
      {/if}
    {:else}
      <p class="display-note">{out ? out.error : s.empty}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={out?.ok ? out.output : ''} {locale} label={s.copyResult} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .pairs-title {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--disp-dim);
  }
  .pairs-wrap {
    max-height: 50vh;
    overflow: auto;
  }
  .pairs {
    width: 100%;
    border-collapse: collapse;
    font: 400 14px/1.45 var(--font-mono);
  }
  .pairs th {
    text-align: left;
    font: 600 12.5px var(--font-body);
    color: var(--disp-dim);
  }
  .pairs th,
  .pairs td {
    padding: 6px 12px 6px 0;
    border-bottom: 1px solid var(--disp-line);
    vertical-align: top;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
</style>
