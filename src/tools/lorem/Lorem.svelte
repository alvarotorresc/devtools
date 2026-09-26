<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { downloadBlob } from '../../lib/download';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    DEFAULT_COUNT,
    MAX_COUNT,
    generateLorem,
    mulberry32,
    toHtml,
    type LoremUnit,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let unit = $state<LoremUnit>('paragraphs');
  let count = $state(DEFAULT_COUNT.paragraphs);
  let startClassic = $state(true);
  let format = $state<'plain' | 'html'>('plain');
  // Same seed → same text: changing the format or the count does not re-roll the words.
  let seed = $state(1);

  onMount(() => {
    seed = crypto.getRandomValues(new Uint32Array(1))[0];
  });

  const text = $derived(generateLorem(unit, count, { startClassic, rand: mulberry32(seed) }));
  const output = $derived(format === 'html' ? toHtml(text) : text);
  const words = $derived(text.split(/\s+/).filter(Boolean).length);

  function onUnit(u: LoremUnit) {
    count = DEFAULT_COUNT[u];
  }

  function regenerate() {
    seed = crypto.getRandomValues(new Uint32Array(1))[0];
  }

  function download() {
    if (format === 'html') downloadBlob(output, s.fileHtml, 'text/html;charset=utf-8');
    else downloadBlob(output, s.fileTxt);
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.unit}
    options={[
      { value: 'paragraphs', label: meta.tabs![locale][0] },
      { value: 'sentences', label: meta.tabs![locale][1] },
      { value: 'words', label: meta.tabs![locale][2] },
    ]}
    bind:value={unit}
    onchange={onUnit}
  />

  <div class="panel">
    <div class="row">
      <Field id="lorem-count" label={s.count}>
        {#snippet children({ describedby })}
          <NumberInput
            id="lorem-count"
            bind:value={count}
            min={1}
            max={MAX_COUNT[unit]}
            {describedby}
          />
        {/snippet}
      </Field>
      <Segmented
        label={s.format}
        options={[
          { value: 'plain', label: s.plain },
          { value: 'html', label: s.html },
        ]}
        bind:value={format}
      />
      <Button variant="primary" icon="refresh-cw" onclick={regenerate}
        >{t(locale, 'ui.generate')}</Button
      >
    </div>
    <Toggle bind:checked={startClassic} label={s.startClassic} />

    <Display label={s.result}>
      {#snippet head()}
        <span
          >{fill(s.summary, {
            words: words.toLocaleString(locale),
            chars: output.length.toLocaleString(locale),
          })}</span
        >
      {/snippet}
      <div class="text" class:code={format === 'html'}>{output}</div>
    </Display>

    <div class="row">
      <CopyButton main value={output} {locale} />
      <Button variant="ghost" onclick={download}>{t(locale, 'ui.download')}</Button>
    </div>
  </div>
</div>

<style>
  .text {
    max-height: 60vh;
    overflow: auto;
    white-space: pre-wrap;
    font: 400 15px/1.65 var(--font-body);
  }
  .text.code {
    font: 400 14px/1.55 var(--font-mono);
  }
</style>
