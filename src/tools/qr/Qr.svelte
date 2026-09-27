<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { downloadBlob } from '../../lib/download';
  import Button from '../../ui/Button.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    cellSize,
    normalizeUrl,
    qrMatrix,
    svgDataUri,
    toSvg,
    wifiPayload,
    type Ecl,
    type WifiSecurity,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const text = persistedInput('qr', '', remember);
  const urlInput = persistedInput('qr-url', '', remember);
  const ssid = persistedInput('qr-ssid', '', remember);

  let tab = $state<'text' | 'url' | 'wifi'>('text');
  // Never persisted: the WiFi password only lives in memory.
  let wifiPassword = $state('');
  let security = $state<WifiSecurity>('WPA');
  let hidden = $state(false);
  let ecl = $state<Ecl>('M');
  let size = $state<'256' | '512' | '1024'>('512');

  const url = $derived(urlInput.value.trim() ? normalizeUrl(urlInput.value) : null);
  const payload = $derived.by(() => {
    if (tab === 'text') return text.value;
    if (tab === 'url') return url?.url ?? '';
    if (!ssid.value) return '';
    return wifiPayload({ ssid: ssid.value, password: wifiPassword, security, hidden });
  });
  const result = $derived(payload ? qrMatrix(payload, ecl) : null);
  const svg = $derived(result?.ok ? toSvg(result.matrix) : '');
  const alt = $derived(
    tab === 'wifi'
      ? fill(s.altWifi, { ssid: ssid.value })
      : fill(s.alt, { text: payload.length > 80 ? `${payload.slice(0, 79)}…` : payload }),
  );
  const tooLong = $derived(
    result && !result.ok
      ? fill(ecl === 'L' ? s.tooLongL : s.tooLong, { ecl, max: result.max, bytes: result.bytes })
      : '',
  );

  function downloadSvg() {
    downloadBlob(svg, 'qr.svg', 'image/svg+xml');
  }

  function downloadPng() {
    if (!result?.ok) return;
    const px = Number(size);
    const n = result.matrix.length;
    const cell = cellSize(n, px);
    const offset = Math.floor((px - cell * n) / 2);
    const canvas = document.createElement('canvas');
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Keywords, not hex: a QR reader needs dark on light whatever the site theme.
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = 'black';
    result.matrix.forEach((row, r) =>
      row.forEach((dark, c) => {
        if (dark) ctx.fillRect(offset + c * cell, offset + r * cell, cell, cell);
      }),
    );
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'qr.png');
    }, 'image/png');
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.kind}
    options={[
      { value: 'text', label: meta.tabs![locale][0] },
      { value: 'url', label: meta.tabs![locale][1] },
      { value: 'wifi', label: meta.tabs![locale][2] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'text'}
      <Field id="qr-text" label={s.text}>
        {#snippet children({ describedby })}
          <TextArea
            id="qr-text"
            bind:value={text.value}
            placeholder={s.textPlaceholder}
            {describedby}
            mono={false}
            rows={4}
          />
        {/snippet}
      </Field>
    {:else if tab === 'url'}
      <Field
        id="qr-url"
        label={s.url}
        help={url?.added ? fill(s.urlAdded, { url: url.url }) : undefined}
        error={urlInput.value.trim() && !url ? s.badUrl : undefined}
      >
        {#snippet children({ describedby })}
          <input
            id="qr-url"
            class="control mono"
            type="url"
            inputmode="url"
            bind:value={urlInput.value}
            placeholder={s.urlPlaceholder}
            aria-describedby={describedby}
            aria-invalid={!!urlInput.value.trim() && !url}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
          />
        {/snippet}
      </Field>
    {:else}
      <div class="wifi">
        <Field id="qr-ssid" label={s.ssid}>
          {#snippet children({ describedby })}
            <input
              id="qr-ssid"
              class="control"
              bind:value={ssid.value}
              aria-describedby={describedby}
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
            />
          {/snippet}
        </Field>
        {#if security !== 'nopass'}
          <Field id="qr-password" label={s.password} help={s.passwordHelp}>
            {#snippet children({ describedby })}
              <input
                id="qr-password"
                class="control"
                type="password"
                bind:value={wifiPassword}
                aria-describedby={describedby}
                autocomplete="off"
              />
            {/snippet}
          </Field>
        {/if}
        <Field id="qr-security" label={s.security}>
          {#snippet children({ describedby })}
            <Select
              id="qr-security"
              bind:value={security}
              {describedby}
              options={[
                { value: 'WPA', label: s.wpa },
                { value: 'WEP', label: s.wep },
                { value: 'nopass', label: s.nopass },
              ]}
            />
          {/snippet}
        </Field>
        <Toggle bind:checked={hidden} label={s.hidden} />
      </div>
    {/if}

    <div class="row">
      <Field id="qr-ecl" label={s.ecl}>
        {#snippet children({ describedby })}
          <Select
            id="qr-ecl"
            bind:value={ecl}
            {describedby}
            options={[
              { value: 'L', label: s.eclL },
              { value: 'M', label: s.eclM },
              { value: 'Q', label: s.eclQ },
              { value: 'H', label: s.eclH },
            ]}
          />
        {/snippet}
      </Field>
      <Field id="qr-size" label={s.size}>
        {#snippet children({ describedby })}
          <Select
            id="qr-size"
            bind:value={size}
            {describedby}
            options={[
              { value: '256', label: '256 px' },
              { value: '512', label: '512 px' },
              { value: '1024', label: '1024 px' },
            ]}
          />
        {/snippet}
      </Field>
    </div>

    <Display live label={s.result}>
      {#snippet head()}
        <Led
          state={!result ? 'idle' : result.ok ? 'ok' : 'bad'}
          label={!result
            ? t(locale, 'led.idle')
            : result.ok
              ? fill(s.ready, { n: result.matrix.length })
              : t(locale, 'led.bad')}
        />
      {/snippet}
      {#if svg}
        <img class="qr" src={svgDataUri(svg)} {alt} width="256" height="256" />
      {:else}
        <p class="display-note">{tooLong || s.empty}</p>
      {/if}
    </Display>

    <div class="row">
      <Button variant="secondary" disabled={!svg} onclick={downloadPng}>{s.png}</Button>
      <Button variant="secondary" disabled={!svg} onclick={downloadSvg}>{s.svg}</Button>
    </div>
    <Toggle
      bind:checked={
        () => text.remember,
        (v) => {
          text.remember = v;
          urlInput.remember = v;
          ssid.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .wifi {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    align-items: end;
  }
  .qr {
    display: block;
    width: min(256px, 100%);
    height: auto;
    align-self: center;
    /* The SVG brings its own white quiet zone; this only rounds the corners on the display. */
    border-radius: 4px;
  }
</style>
