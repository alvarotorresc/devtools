<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { bytesToBase64 } from '../../lib/bytes';
  import { downloadBlob } from '../../lib/download';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import FileDrop from '../../ui/FileDrop.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    MAX_FILE_BYTES,
    convert,
    extensionFor,
    formatBytes,
    parseBase64Payload,
    sniffMime,
    toDataUri,
    type DirectionMode,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('base64', '', meta.rememberInput ?? true);

  let tab = $state<'text' | 'file'>('text');
  let mode = $state<DirectionMode>('auto');
  let urlSafe = $state(false);

  const result = $derived(input.value ? convert(input.value, mode, urlSafe) : null);
  const output = $derived(result?.ok ? result.output : '');
  const ledState = $derived(!result ? 'idle' : result.ok ? 'ok' : 'bad');
  const ledLabel = $derived.by(() => {
    if (!result) return t(locale, 'led.idle');
    if (!result.ok) return result.error === 'binary' ? s.errorBinary : s.errorInvalid;
    return result.direction === 'encode' ? s.encoded : s.decoded;
  });

  function useOutput() {
    if (!result?.ok) return;
    input.value = result.output;
    if (mode !== 'auto') mode = mode === 'encode' ? 'decode' : 'encode';
  }

  interface LoadedFile {
    name: string;
    size: number;
    mime: string;
    dataUri: string;
    base64: string;
  }
  let file = $state<LoadedFile | null>(null);
  let fileError = $state('');

  async function onfile(f: File) {
    fileError = '';
    file = null;
    if (f.size > MAX_FILE_BYTES) {
      fileError = fill(s.tooBig, { max: formatBytes(MAX_FILE_BYTES, locale) });
      return;
    }
    const bytes = new Uint8Array(await f.arrayBuffer());
    const mime = f.type || sniffMime(bytes) || 'application/octet-stream';
    file = {
      name: f.name,
      size: f.size,
      mime,
      dataUri: toDataUri(bytes, mime),
      base64: bytesToBase64(bytes),
    };
  }

  let payload = $state('');
  const decoded = $derived(payload.trim() ? parseBase64Payload(payload) : null);
  const previewUri = $derived(
    decoded?.mime?.startsWith('image/') ? toDataUri(decoded.bytes, decoded.mime) : '',
  );

  function downloadDecoded() {
    if (!decoded) return;
    const mime = decoded.mime ?? 'application/octet-stream';
    downloadBlob(
      new Blob([decoded.bytes.slice()], { type: mime }),
      `${s.filePrefix}.${extensionFor(decoded.mime)}`,
    );
  }

  const clip = (v: string, n = 400) => (v.length > n ? `${v.slice(0, n)}…` : v);
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'text', label: meta.tabs![locale][0] },
      { value: 'file', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'text'}
      <Field id="base64-input" label={s.input}>
        {#snippet children({ describedby })}
          <TextArea
            id="base64-input"
            bind:value={input.value}
            placeholder={s.placeholder}
            {describedby}
            invalid={ledState === 'bad'}
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
        <Toggle bind:checked={urlSafe} label={s.urlSafe} />
      </div>

      <Display live label={s.result}>
        {#snippet head()}
          <Led state={ledState} label={ledLabel} />
        {/snippet}
        {#if result && !result.ok}
          <p class="display-note">
            {result.error === 'binary' ? s.errorBinaryHint : s.errorInvalidHint}
          </p>
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
      <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
    {:else}
      <h2 class="sub">{s.fileToBase64}</h2>
      <FileDrop {locale} onfile={(f) => void onfile(f)} />
      {#if fileError}
        <p class="error" role="alert">{fileError}</p>
      {/if}
      {#if file}
        <Display label={s.fileToBase64}>
          <dl class="display-kv">
            <dt>{s.fileName}</dt>
            <dd>{file.name}</dd>
            <dt>{s.fileType}</dt>
            <dd>{file.mime}</dd>
            <dt>{s.fileSize}</dt>
            <dd>{formatBytes(file.size, locale)}</dd>
          </dl>
          <pre class="display-code wrap">{clip(file.dataUri)}</pre>
        </Display>
        <div class="row">
          <CopyButton main value={file.dataUri} {locale} label={s.copyDataUri} />
          <CopyButton value={file.base64} {locale} label={s.copyBase64} />
        </div>
      {/if}

      <h2 class="sub">{s.base64ToFile}</h2>
      <Field id="base64-payload" label={s.payload}>
        {#snippet children({ describedby })}
          <TextArea
            id="base64-payload"
            bind:value={payload}
            placeholder={s.payloadPlaceholder}
            {describedby}
            invalid={!!payload.trim() && !decoded}
            rows={5}
          />
        {/snippet}
      </Field>
      <Display live label={s.base64ToFile}>
        {#snippet head()}
          <Led
            state={!payload.trim() ? 'idle' : decoded ? 'ok' : 'bad'}
            label={!payload.trim()
              ? t(locale, 'led.idle')
              : decoded
                ? `${s.detectedType}: ${decoded.mime ?? s.unknownType} · ${formatBytes(decoded.bytes.length, locale)}`
                : s.errorInvalid}
          />
        {/snippet}
        {#if payload.trim() && !decoded}
          <p class="display-note">{s.payloadInvalid}</p>
        {:else if previewUri}
          <img class="preview" src={previewUri} alt={s.preview} />
        {:else if !decoded}
          <p class="display-note">{s.payloadEmpty}</p>
        {/if}
      </Display>
      <div class="row">
        <Button variant="secondary" disabled={!decoded} onclick={downloadDecoded}
          >{s.downloadFile}</Button
        >
      </div>
    {/if}
  </div>
</div>

<style>
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .sub {
    font-size: 15px;
  }
  .error {
    color: var(--bad);
    font-size: 14px;
    font-weight: 600;
  }
  .preview {
    max-width: 100%;
    max-height: 240px;
    align-self: flex-start;
    border-radius: var(--radius);
  }
</style>
