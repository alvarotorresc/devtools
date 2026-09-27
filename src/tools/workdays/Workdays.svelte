<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { countDays, toIso } from './logic';
  import { meta } from './meta';
  import { holidayNames, strings } from './strings';

  const DAY_MS = 86_400_000;

  // Today comes from the browser, never from the build machine: only called from onMount and
  // from shouldSave below, never at the top level (which SSR would evaluate on the server).
  const todayIso = () => {
    const now = new Date();
    return toIso({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });
  };
  const defaultEndIso = () => `${new Date().getFullYear()}-12-31`;

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  // The auto-filled default drifts with the clock (a new "today" every day), so it must never
  // be written to storage: shouldSave refuses to persist a value that still equals today's
  // default, and clears whatever was stored if it drifts back to it. Only a date the person
  // actually typed gets remembered.
  const start = persistedInput('workdays', '', remember, (v) => v !== todayIso());
  const end = persistedInput('workdays-end', '', remember, (v) => v !== defaultEndIso());
  const include = persistedInput('workdays-include', '1', remember);

  // Runs after persistedInput's onMount. Each field defaults independently — one may have been
  // remembered while the other was not, since a value equal to its own default is never saved.
  onMount(() => {
    if (!start.value) start.value = todayIso();
    if (!end.value) end.value = defaultEndIso();
  });

  const includeEnd = $derived(include.value !== '0');
  const result = $derived(
    start.value && end.value ? countDays(start.value, end.value, includeEnd) : null,
  );
  const error = $derived.by(() => {
    if (!result || result.ok) return undefined;
    return result.reason === 'years'
      ? s.years
      : result.reason === 'tooLong'
        ? s.tooLong
        : s.invalid;
  });

  const dateFmt = $derived(
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }),
  );
  const weekdayFmt = $derived(
    new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }),
  );
  const fmt = (n: number) => new Intl.NumberFormat(locale).format(n);
  // Like `plural`, but keeps `fmt`'s thousands grouping in the filled `{n}` instead of the raw
  // number: the count picks the template, the display shows the grouped figure.
  const count = (n: number, one: string, other: string) =>
    fill(new Intl.PluralRules(locale).select(n) === 'one' ? one : other, { n: fmt(n) });
  const weeksText = (weeks: number, days: number) =>
    fill(s.weeks, {
      weeks: count(weeks, s.weeksOne, s.weeksOther),
      days: count(days, s.daysOne, s.daysOther),
    });
</script>

<div class="panel">
  <div class="row">
    <Field id="workdays-start" label={s.start}>
      {#snippet children({ describedby })}
        <input
          id="workdays-start"
          class="control"
          type="date"
          min="1900-01-01"
          max="2100-12-31"
          aria-describedby={describedby}
          bind:value={start.value}
        />
      {/snippet}
    </Field>
    <Field id="workdays-end" label={s.end}>
      {#snippet children({ describedby })}
        <input
          id="workdays-end"
          class="control"
          type="date"
          min="1900-01-01"
          max="2100-12-31"
          aria-describedby={describedby}
          bind:value={end.value}
        />
      {/snippet}
    </Field>
    <Toggle
      bind:checked={() => includeEnd, (v) => (include.value = v ? '1' : '0')}
      label={s.includeEnd}
    />
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <span
        >{result?.ok
          ? count(result.business, s.summaryOne, s.summaryOther)
          : (error ?? s.empty)}</span
      >
    {/snippet}
    {#if result?.ok}
      {#if result.swapped}<p class="display-note">{s.swapped}</p>{/if}
      <dl class="display-kv">
        <dt>{s.natural}</dt>
        <dd>
          <span id="workdays-natural">{fmt(result.natural)}</span>
          <span class="dim">({weeksText(result.weeks, result.extraDays)})</span>
        </dd>
        <dt>{s.weekdays}</dt>
        <dd>{fmt(result.weekdays)}</dd>
        <dt>{s.business}</dt>
        <dd id="workdays-business" class="strong">{fmt(result.business)}</dd>
        <dt>{s.weekend}</dt>
        <dd>{fmt(result.weekend)}</dd>
      </dl>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={result?.ok ? String(result.business) : ''} {locale} />
  </div>

  {#if result?.ok}
    <Display label={s.holidays}>
      {#snippet head()}<span>{s.holidays}</span>{/snippet}
      {#if result.holidays.length}
        <ul class="display-rows holidays">
          {#each result.holidays as h (h.day)}
            {@const date = new Date(h.day * DAY_MS)}
            <li class="display-row" class:weekend={h.onWeekend}>
              <span>{dateFmt.format(date)} · {holidayNames[locale][h.key]}</span>
              {#if h.onWeekend}
                <span class="dim">{fill(s.onWeekend, { d: weekdayFmt.format(date) })}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p class="display-note">{s.noHolidays}</p>
      {/if}
    </Display>
  {/if}

  <p class="note">{s.note}</p>

  <Toggle
    bind:checked={
      () => start.remember,
      (v) => {
        start.remember = v;
        end.remember = v;
        include.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .holidays {
    padding: 0;
    list-style: none;
  }
  .weekend {
    color: var(--disp-dim);
  }
  .dim {
    color: var(--disp-dim);
  }
  .strong {
    font-weight: 700;
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
  }
</style>
