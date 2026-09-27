<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatRelative } from '../../lib/relative';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import { isValidTimeZone, listTimeZones } from '../timestamp/logic';
  import type { Locale } from '../types';
  import { describeCron, errorMessage, nextRuns, parseCron } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const expr = persistedInput('cron', '', remember);
  const zone = persistedInput('cron-zone', '', remember);

  const EXAMPLES = ['*/5 * * * *', '0 9 * * 1-5', '30 2 * * *', '0 0 1 * *', '@weekly'];

  let zones = $state<string[]>(['UTC']);
  let count = $state(5);
  // null until mounted: the build machine's clock must never end up in the HTML.
  let now = $state<number | null>(null);
  // The browser's own zone, detected on mount. It is only ever used as a fallback display value
  // (I2 ruling): unlike a zone the user picks from the Select below, it is never written into
  // `zone.value`, so it never reaches persistedInput's storage.
  let browserZone = $state('UTC');

  onMount(() => {
    // persistedInput restores the saved zone in its own onMount, which runs before this one.
    browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const effective = zone.value && isValidTimeZone(zone.value) ? zone.value : browserZone;
    zones = listTimeZones(effective);
    now = Date.now();
    const id = setInterval(() => (now = Date.now()), 30_000);
    return () => clearInterval(id);
  });

  // The zone actually in effect: the user's saved choice when it is valid, otherwise the
  // browser's own zone. Every read below uses this, never `zone.value` directly.
  const tz = $derived(zone.value && isValidTimeZone(zone.value) ? zone.value : browserZone);

  const parsed = $derived(expr.value.trim() ? parseCron(expr.value) : null);
  const explanation = $derived(parsed?.ok ? describeCron(parsed, locale) : '');
  const limit = $derived(Math.min(20, Math.max(1, Math.round(count) || 5)));
  const runs = $derived(
    parsed?.ok && !parsed.reboot && now !== null && isValidTimeZone(tz)
      ? nextRuns(parsed.cron, now, tz, limit)
      : [],
  );
  const dateFormat = $derived(
    isValidTimeZone(tz)
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: tz,
        })
      : null,
  );
</script>

<div class="panel">
  <Field
    id="cron-expr"
    label={s.expression}
    help={s.help}
    error={parsed && !parsed.ok ? errorMessage(parsed.error, locale) : undefined}
  >
    {#snippet children({ describedby })}
      <input
        id="cron-expr"
        class="control mono"
        bind:value={expr.value}
        placeholder={s.placeholder}
        aria-describedby={describedby}
        aria-invalid={!!parsed && !parsed.ok}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
    {/snippet}
  </Field>

  <div class="examples" role="group" aria-label={s.examples}>
    {#each EXAMPLES as ex (ex)}
      <button type="button" class="chip" onclick={() => (expr.value = ex)}>{ex}</button>
    {/each}
  </div>

  <div class="row">
    <Field id="cron-zone" label={s.zone}>
      {#snippet children({ describedby })}
        <Select
          id="cron-zone"
          bind:value={() => tz, (v) => (zone.value = v)}
          {describedby}
          options={zones.map((z) => ({ value: z, label: z }))}
        />
      {/snippet}
    </Field>
    <Field id="cron-count" label={s.count}>
      {#snippet children({ describedby })}
        <NumberInput id="cron-count" bind:value={count} min={1} max={20} {describedby} />
      {/snippet}
    </Field>
  </div>

  <Display live label={s.explanation}>
    {#snippet head()}
      <span>{s.explanation}</span>
    {/snippet}
    {#if explanation}
      <p class="display-value explain">{explanation}</p>
    {:else}
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  {#if parsed?.ok}
    <Display label={s.next}>
      {#snippet head()}
        <span>{s.next}</span>
        <span>{tz}</span>
      {/snippet}
      {#if parsed.reboot}
        <p class="display-note">{s.reboot}</p>
      {:else if now !== null && runs.length === 0}
        <p class="display-note">{s.never}</p>
      {:else}
        <ol class="display-rows runs">
          {#each runs as run (run.ms)}
            {@const isoText = new Date(run.ms).toISOString()}
            <li class="display-row">
              <span class="when">
                <span>{dateFormat?.format(run.ms)}</span>
                <span class="meta">
                  {now === null ? '' : formatRelative(run.ms, now, locale)}
                  {#if run.adjusted}· {s.adjusted}{/if}
                </span>
                <span class="meta iso">{isoText}</span>
              </span>
              <CopyButton
                value={isoText}
                {locale}
                compact
                label={s.copyIso}
                ariaLabel={fill(s.copyIsoOf, { iso: isoText })}
              />
            </li>
          {/each}
        </ol>
      {/if}
    </Display>
  {/if}

  <div class="row">
    <CopyButton main value={explanation} {locale} label={s.copyText} />
    <Button variant="ghost" disabled={!expr.value} onclick={() => (expr.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle
    bind:checked={
      () => expr.remember,
      (v) => {
        expr.remember = v;
        zone.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .explain {
    font-family: var(--font-body);
    font-size: clamp(18px, 2.4vw, 24px);
    letter-spacing: 0;
  }
  .examples {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    min-height: 36px;
    padding: 0 12px;
    background: var(--raised);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    font: 500 13px/1 var(--font-mono);
    cursor: pointer;
  }
  .chip:hover {
    border-color: var(--border-strong);
  }
  @media (pointer: coarse) {
    .chip {
      min-height: 44px;
    }
  }
  .runs {
    list-style: none;
    padding: 0;
  }
  .when {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .meta {
    font-size: 12.5px;
    letter-spacing: 0;
    color: var(--disp-dim);
  }
</style>
