<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { formatBrands, parseUserAgent, type Brand } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  interface UaData {
    brands: Brand[];
    mobile: boolean;
    platform: string;
  }

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('user-agent', '', meta.rememberInput ?? true);

  // Browser-only values: empty during SSR.
  let ownUa = $state('');
  let uaData = $state<UaData | null>(null);

  onMount(() => {
    ownUa = navigator.userAgent;
    uaData = (navigator as Navigator & { userAgentData?: UaData }).userAgentData ?? null;
    // persistedInput restores a saved value in its own onMount, which runs before this one.
    if (!input.value.trim()) input.value = ownUa;
  });

  const info = $derived(parseUserAgent(input.value));
  const isOwn = $derived(!!ownUa && input.value.trim() === ownUa);

  const rows = $derived.by(() => {
    if (!info) return [];
    const device = [info.vendor, info.model].filter(Boolean).join(' ');
    const kind = s[info.deviceType];
    return [
      { label: s.browser, value: info.browser ?? '—' },
      { label: s.engine, value: info.engine ?? '—' },
      { label: s.os, value: info.os ?? '—' },
      { label: s.device, value: device ? `${device} · ${kind}` : kind },
      { label: s.cpu, value: info.cpu ?? '—' },
    ];
  });

  const hints = $derived(
    isOwn && uaData
      ? [
          { label: s.brands, value: formatBrands(uaData.brands) || '—' },
          { label: s.platform, value: uaData.platform || '—' },
          { label: s.isMobile, value: uaData.mobile ? s.yes : s.no },
        ]
      : [],
  );

  const report = $derived(
    [...rows, ...hints].map((r) => `${r.label}: ${r.value}`).join('\n') +
      (info?.bot ? `\n${s.bot}` : ''),
  );
</script>

<div class="panel">
  <Field id="user-agent-input" label={s.input}>
    {#snippet children({ describedby })}
      <TextArea
        id="user-agent-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        rows={4}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!info ? 'idle' : info.recognised ? 'ok' : 'bad'}
        label={!info ? t(locale, 'led.idle') : info.recognised ? s.recognised : s.notRecognised}
      />
    {/snippet}
    {#if info}
      <dl class="display-kv">
        {#each rows as r (r.label)}
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        {/each}
      </dl>
      {#if info.bot}<p class="display-note bot">{s.bot}</p>{/if}
      {#if hints.length}
        <h2 class="hints-title">{s.hints}</h2>
        <dl class="display-kv">
          {#each hints as r (r.label)}
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          {/each}
        </dl>
      {/if}
    {:else}
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  <p class="note">{s.frozen}</p>

  <div class="row">
    <CopyButton main value={info ? report : ''} {locale} label={s.copyReport} />
    <Button variant="secondary" disabled={!ownUa || isOwn} onclick={() => (input.value = ownUa)}
      >{s.useMine}</Button
    >
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .bot {
    font-weight: 600;
    color: var(--disp-text);
  }
  .hints-title {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--disp-dim);
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
  }
</style>
