<script lang="ts">
  import { t } from '../../i18n';
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
  import { convert, type DirectionMode, type EntityMode } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('html-entities', '', meta.rememberInput ?? true);

  let mode = $state<DirectionMode>('auto');
  let entityMode = $state<EntityMode>('minimal');

  const result = $derived(input.value ? convert(input.value, mode, entityMode) : null);
  const output = $derived(result?.output ?? '');

  function useOutput() {
    if (!result) return;
    input.value = result.output;
    if (mode !== 'auto') mode = mode === 'encode' ? 'decode' : 'encode';
  }
</script>

<div class="panel">
  <Field id="html-entities-input" label={s.input}>
    {#snippet children({ describedby })}
      <TextArea
        id="html-entities-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        rows={8}
      />
    {/snippet}
  </Field>

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
      label={s.scope}
      options={[
        { value: 'minimal', label: s.minimal },
        { value: 'nonascii', label: s.nonascii },
      ]}
      bind:value={entityMode}
    />
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={result ? 'ok' : 'idle'}
        label={!result
          ? t(locale, 'led.idle')
          : result.direction === 'encode'
            ? s.encoded
            : s.decoded}
      />
    {/snippet}
    {#if output}
      <!-- Always rendered as text: decoded HTML must never be injected into the page. -->
      <pre class="display-code wrap">{output}</pre>
      {#if result?.direction === 'decode'}<p class="display-note">{s.unknown}</p>{/if}
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
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
