<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatRelative } from '../../lib/relative';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    formatOffset,
    listTimeZones,
    parseDate,
    parseTimestamp,
    tzOffsetMinutes,
    wallClock,
    type UnitMode,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('timestamp', '', meta.rememberInput ?? true);

  // null until mounted: the build machine's clock and zone must never end up in the HTML.
  let now = $state<number | null>(null);
  let zone = $state('UTC');
  let zones = $state<string[]>(['UTC']);
  let unit = $state<UnitMode>('auto');
  let dateText = $state('');

  onMount(() => {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    zones = listTimeZones(zone);
  });

  $effect(() => {
    now = Date.now();
    const id = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(id);
  });

  const nowSeconds = $derived(now === null ? '' : String(Math.floor(now / 1000)));
  const nowMillis = $derived(now === null ? '' : String(now));

  const parsed = $derived(input.value.trim() ? parseTimestamp(input.value, unit) : null);
  const invalid = $derived(!!input.value.trim() && !parsed);

  function zoned(ms: number): string {
    return `${wallClock(ms, zone)} (${formatOffset(tzOffsetMinutes(ms, zone))})`;
  }

  const formats = $derived.by(() => {
    if (!parsed) return [];
    const d = new Date(parsed.ms);
    return [
      { label: s.iso, value: d.toISOString() },
      { label: s.utc, value: d.toUTCString() },
      { label: `${s.local} · ${zone}`, value: zoned(parsed.ms) },
      { label: s.relative, value: now === null ? '' : formatRelative(parsed.ms, now, locale) },
      { label: s.seconds, value: String(Math.floor(parsed.ms / 1000)) },
      { label: s.millis, value: String(parsed.ms) },
    ];
  });

  const fromDate = $derived(dateText.trim() ? parseDate(dateText, zone) : null);

  function useNow() {
    if (now !== null) dateText = wallClock(now, zone);
  }
</script>

<div class="panel">
  <Display label={s.now}>
    {#snippet head()}
      <span>{s.now}</span>
      {#if now !== null}<span>{zoned(now)}</span>{/if}
    {/snippet}
    <div class="clock">
      <div class="tick">
        <span class="unit">{s.seconds}</span>
        <span class="display-value">{nowSeconds || '—'}</span>
        <CopyButton
          value={() => String(Math.floor(Date.now() / 1000))}
          {locale}
          compact
          label={s.copySeconds}
        />
      </div>
      <div class="tick">
        <span class="unit">{s.millis}</span>
        <span class="display-value small">{nowMillis || '—'}</span>
        <CopyButton value={() => String(Date.now())} {locale} compact label={s.copyMillis} />
      </div>
    </div>
  </Display>

  <Field id="timestamp-zone" label={s.zone}>
    {#snippet children({ describedby })}
      <Select
        id="timestamp-zone"
        bind:value={zone}
        {describedby}
        options={zones.map((z) => ({ value: z, label: z }))}
      />
    {/snippet}
  </Field>

  <h2 class="sub">{s.toDate}</h2>
  <div class="row">
    <Field id="timestamp-input" label={s.timestamp}>
      {#snippet children({ describedby })}
        <input
          id="timestamp-input"
          class="control mono"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
          placeholder={s.timestampPlaceholder}
          aria-describedby={describedby}
          aria-invalid={invalid}
          bind:value={input.value}
        />
      {/snippet}
    </Field>
    <Segmented
      label={s.unit}
      options={[
        { value: 'auto', label: s.auto },
        { value: 's', label: s.seconds },
        { value: 'ms', label: s.millis },
      ]}
      bind:value={unit}
    />
  </div>

  <Display live label={s.toDate}>
    {#snippet head()}
      <Led
        state={parsed ? 'ok' : invalid ? 'bad' : 'idle'}
        label={parsed
          ? fill(s.detected, { unit: parsed.unit === 's' ? s.unitS : s.unitMs })
          : invalid
            ? s.invalidTs
            : t(locale, 'led.idle')}
      />
    {/snippet}
    {#if parsed}
      <div class="display-rows">
        {#each formats as f (f.label)}
          <div class="display-row">
            <span class="fmt"><span class="unit">{f.label}</span>{f.value}</span>
            <CopyButton value={f.value} {locale} compact />
          </div>
        {/each}
      </div>
    {:else}
      <p class="display-note">{invalid ? s.invalidTsHint : s.emptyTs}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={parsed ? new Date(parsed.ms).toISOString() : nowSeconds} {locale} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>

  <h2 class="sub">{s.toTimestamp}</h2>
  <div class="row">
    <Field id="timestamp-date" label={s.date} help={s.dateHelp}>
      {#snippet children({ describedby })}
        <input
          id="timestamp-date"
          class="control mono"
          type="text"
          autocomplete="off"
          spellcheck="false"
          placeholder={s.datePlaceholder}
          aria-describedby={describedby}
          aria-invalid={!!dateText.trim() && fromDate === null}
          bind:value={dateText}
        />
      {/snippet}
    </Field>
    <Button variant="secondary" onclick={useNow}>{s.useNow}</Button>
  </div>

  <Display live label={s.toTimestamp}>
    {#snippet head()}
      <Led
        state={fromDate !== null ? 'ok' : dateText.trim() ? 'bad' : 'idle'}
        label={fromDate !== null
          ? new Date(fromDate).toISOString()
          : dateText.trim()
            ? s.invalidDate
            : t(locale, 'led.idle')}
      />
    {/snippet}
    {#if fromDate !== null}
      <div class="display-rows">
        <div class="display-row">
          <span class="fmt"><span class="unit">{s.seconds}</span>{Math.floor(fromDate / 1000)}</span
          >
          <CopyButton value={String(Math.floor(fromDate / 1000))} {locale} compact />
        </div>
        <div class="display-row">
          <span class="fmt"><span class="unit">{s.millis}</span>{fromDate}</span>
          <CopyButton value={String(fromDate)} {locale} compact />
        </div>
      </div>
    {/if}
  </Display>
</div>

<style>
  .clock {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .tick {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .small {
    font-size: clamp(18px, 2.6vw, 26px);
  }
  .unit {
    color: var(--disp-dim);
    font-size: 12px;
    letter-spacing: 0;
  }
  .fmt {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .sub {
    font-size: 15px;
  }
</style>
