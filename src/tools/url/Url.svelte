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
  import { convert, parseUrl, type DirectionMode, type UrlMode } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // One input for both tabs: paste a URL once, then encode it or look at its parts.
  const input = persistedInput('url', '', meta.rememberInput ?? true);

  let tab = $state<'encode' | 'parse'>('encode');
  let mode = $state<DirectionMode>('auto');
  let urlMode = $state<UrlMode>('component');
  let plusAsSpace = $state(false);

  const result = $derived(input.value ? convert(input.value, mode, urlMode, plusAsSpace) : null);
  const output = $derived(result?.ok ? result.output : '');
  const ledState = $derived(!result ? 'idle' : result.ok ? 'ok' : 'bad');
  const ledLabel = $derived(
    !result
      ? t(locale, 'led.idle')
      : !result.ok
        ? s.malformed
        : result.direction === 'encode'
          ? s.encoded
          : s.decoded,
  );

  const parsed = $derived(input.value.trim() ? parseUrl(input.value) : null);
  const queryText = $derived(parsed ? parsed.params.map(([k, v]) => `${k}=${v}`).join('\n') : '');

  function useOutput() {
    if (!result?.ok) return;
    input.value = result.output;
    if (mode !== 'auto') mode = mode === 'encode' ? 'decode' : 'encode';
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'encode', label: meta.tabs![locale][0] },
      { value: 'parse', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field id="url-input" label={s.input}>
      {#snippet children({ describedby })}
        <TextArea
          id="url-input"
          bind:value={input.value}
          placeholder={s.placeholder}
          {describedby}
          invalid={tab === 'encode' ? ledState === 'bad' : !!input.value.trim() && !parsed}
          rows={4}
        />
      {/snippet}
    </Field>

    {#if tab === 'encode'}
      <div class="row">
        <Segmented
          label={t(locale, 'dir.label')}
          options={[
            { value: 'auto', label: t(locale, 'dir.auto') },
            { value: 'encode', label: t(locale, 'dir.encode') },
            { value: 'decode', label: t(locale, 'dir.decode') },
          ]}
          bind:value={mode}
        />
        <Segmented
          label={s.variant}
          options={[
            { value: 'component', label: s.component },
            { value: 'uri', label: s.uri },
          ]}
          bind:value={urlMode}
        />
        <Toggle bind:checked={plusAsSpace} label={s.plusAsSpace} />
      </div>

      <Display live label={s.result}>
        {#snippet head()}
          <Led state={ledState} label={ledLabel} />
        {/snippet}
        {#if result && !result.ok}
          <p class="display-note">{s.malformedHint}</p>
        {:else if output}
          <pre class="display-code wrap">{output}</pre>
        {:else}
          <p class="display-note">{s.empty}</p>
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={output} {locale} />
        <Button variant="ghost" icon="arrow-left-right" disabled={!output} onclick={useOutput}>
          {t(locale, 'ui.useOutput')}
        </Button>
        <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {:else}
      <Display live label={s.parsed}>
        {#snippet head()}
          <Led
            state={!input.value.trim() ? 'idle' : parsed ? 'ok' : 'bad'}
            label={!input.value.trim()
              ? t(locale, 'led.idle')
              : parsed
                ? parsed.hostname
                : s.invalidUrl}
          />
        {/snippet}
        {#if parsed}
          {#if parsed.assumedScheme}<p class="display-note">{s.assumed}</p>{/if}
          <dl class="display-kv">
            <dt>{s.protocol}</dt>
            <dd>{parsed.protocol}</dd>
            {#if parsed.username}
              <dt>{s.user}</dt>
              <dd>{parsed.username}</dd>
            {/if}
            {#if parsed.password}
              <dt>{s.password}</dt>
              <dd>{parsed.password}</dd>
            {/if}
            <dt>{s.host}</dt>
            <dd>{parsed.hostname}</dd>
            <dt>{s.port}</dt>
            <dd>
              {parsed.port ||
                (parsed.defaultPort ? fill(s.defaultPort, { port: parsed.defaultPort }) : s.none)}
            </dd>
            <dt>{s.path}</dt>
            <dd>{parsed.pathname}</dd>
            <dt>{s.hash}</dt>
            <dd>{parsed.hash || s.none}</dd>
          </dl>
        {:else if input.value.trim()}
          <p class="display-note">{s.invalidUrlHint}</p>
        {:else}
          <p class="display-note">{s.parseEmpty}</p>
        {/if}
      </Display>

      {#if parsed}
        <Display label={fill(s.params, { n: parsed.params.length })}>
          {#snippet head()}
            <span>{fill(s.params, { n: parsed.params.length })}</span>
          {/snippet}
          {#if parsed.params.length}
            <div class="display-rows">
              {#each parsed.params as [key, value], i (i)}
                <div class="display-row">
                  <span class="param"><span class="key">{key}</span> = {value}</span>
                  <CopyButton {value} {locale} compact />
                </div>
              {/each}
            </div>
          {:else}
            <p class="display-note">{s.noParams}</p>
          {/if}
        </Display>
      {/if}

      <div class="row">
        <CopyButton main value={queryText} {locale} />
        <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {/if}

    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>
</div>

<style>
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .key {
    color: var(--disp-dim);
  }
  .param {
    min-width: 0;
  }
</style>
