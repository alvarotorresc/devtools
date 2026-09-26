<script lang="ts">
  import { onMount } from 'svelte';
  import { fill } from '../../i18n/fill';
  import { t } from '../../i18n';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { detectId, formatId, generate, MAX_COUNT, NANOID_ALPHABETS, type IdKind } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  type AlphabetKey = keyof typeof NANOID_ALPHABETS;
  let tab: 'generate' | 'validate' = $state('generate');
  let kind: IdKind = $state('v4');
  let count = $state(5);
  let uppercase = $state(false);
  let dashes = $state(true);
  let size = $state(21);
  let alphabet: AlphabetKey = $state('urlsafe');
  let raw: string[] = $state([]);
  const check = persistedInput('uuid', '', true);

  const shown = $derived(raw.map((id) => formatId(id, kind, { uppercase, dashes })));
  const isUuid = $derived(kind === 'v4' || kind === 'v7');

  function regenerate() {
    raw = generate(kind, count, { size, alphabet: NANOID_ALPHABETS[alphabet] });
  }

  onMount(regenerate);

  const detection = $derived(check.value.trim() ? detectId(check.value) : null);
  const ledState = $derived(!detection ? 'idle' : detection.kind === 'invalid' ? 'bad' : 'ok');
  const summary = $derived.by(() => {
    if (!detection) return t(locale, 'led.idle');
    switch (detection.kind) {
      case 'uuid':
        return fill(s.uuid, { v: detection.version });
      case 'nil':
        return s.nil;
      case 'max':
        return s.max;
      case 'ulid':
        return s.ulid;
      default:
        return s.invalid;
    }
  });
  const dateText = $derived.by(() => {
    if (!detection || (detection.kind !== 'uuid' && detection.kind !== 'ulid')) return '';
    if (!detection.date) return s.noDate;
    const d = detection.date;
    return fill(s.created, {
      date: `${d.toLocaleString(locale, { dateStyle: 'long', timeStyle: 'medium' })} (${d.toISOString()})`,
    });
  });

  function download() {
    const url = URL.createObjectURL(new Blob([shown.join('\n')], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = s.file;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'generate', label: meta.tabs![locale][0] },
      { value: 'validate', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'generate'}
      <div class="row">
        <div class="stack tight">
          <span class="label">{s.kind}</span>
          <Segmented
            label={s.kind}
            options={[
              { value: 'v4', label: 'UUID v4' },
              { value: 'v7', label: 'UUID v7' },
              { value: 'ulid', label: 'ULID' },
              { value: 'nanoid', label: 'NanoID' },
            ]}
            bind:value={kind}
            onchange={regenerate}
          />
        </div>
        <Field id="uuid-count" label={s.count}>
          <NumberInput id="uuid-count" bind:value={count} min={1} max={MAX_COUNT} />
        </Field>
        <Button variant="primary" icon="refresh-cw" onclick={regenerate}
          >{t(locale, 'ui.generate')}</Button
        >
      </div>

      <div class="row">
        {#if isUuid}
          <Toggle bind:checked={uppercase} label={s.uppercase} />
          <Toggle bind:checked={dashes} label={s.dashes} />
        {:else if kind === 'nanoid'}
          <Field id="nanoid-size" label={s.size}>
            <NumberInput id="nanoid-size" bind:value={size} min={2} max={64} />
          </Field>
          <Field id="nanoid-alphabet" label={s.alphabet}>
            <Select
              id="nanoid-alphabet"
              bind:value={alphabet}
              options={[
                { value: 'urlsafe', label: s.urlsafe },
                { value: 'alnum', label: s.alnum },
                { value: 'hex', label: s.hex },
                { value: 'numbers', label: s.numbers },
              ]}
            />
          </Field>
          <Button variant="secondary" onclick={regenerate}>{t(locale, 'ui.generate')}</Button>
        {/if}
      </div>

      <Display label={s.result}>
        <div class="display-rows">
          {#each shown as id, i (i)}
            <div class="display-row">
              <span>{id}</span>
              <CopyButton value={id} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>

      <div class="row">
        <CopyButton main value={shown.join('\n')} {locale} label={s.copyAll} />
        <Button variant="ghost" onclick={download} disabled={shown.length === 0}
          >{t(locale, 'ui.download')}</Button
        >
      </div>
    {:else}
      <Field id="uuid-check" label={s.input}>
        {#snippet children({ describedby })}
          <input
            id="uuid-check"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder={s.placeholder}
            aria-describedby={describedby}
            aria-invalid={ledState === 'bad'}
            bind:value={check.value}
          />
        {/snippet}
      </Field>
      <Display live label={s.input}>
        {#snippet head()}<Led state={ledState} label={summary} />{/snippet}
        {#if detection && detection.kind !== 'invalid'}
          <div class="display-value">{check.value.trim()}</div>
          {#if dateText}<p class="display-note">{dateText}</p>{/if}
        {:else if detection}
          <p class="display-note">{s.invalidHint}</p>
        {:else}
          <p class="display-note">{s.waiting}</p>
        {/if}
      </Display>
      <div class="row">
        <CopyButton main value={check.value.trim()} {locale} />
        <Button variant="ghost" onclick={() => (check.value = '')} disabled={!check.value}
          >{t(locale, 'ui.clear')}</Button
        >
      </div>
      <Toggle bind:checked={check.remember} label={t(locale, 'tool.remember')} />
    {/if}
  </div>
</div>

<style>
  .tight {
    gap: 8px;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
</style>
