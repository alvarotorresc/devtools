<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatNumber } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    formatExactBytes,
    formatExactBytesPlain,
    humanSize,
    IEC_UNITS,
    inUnits,
    parseSize,
    SI_UNITS,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('file-size', '1 TB', meta.rememberInput ?? true);

  const parsed = $derived(parseSize(input.value, locale));
  const error = $derived.by(() => {
    if (parsed.ok || parsed.reason === 'empty') return undefined;
    if (parsed.reason === 'unit') return fill(s.unit, { u: parsed.unit });
    return parsed.reason === 'negative' ? s.negative : s.number;
  });
  const bytes = $derived(parsed.ok ? parsed.bytes : null);
  const columns = $derived(
    bytes === null
      ? []
      : [
          { id: 'si', title: s.si, rows: inUnits(bytes, SI_UNITS) },
          { id: 'iec', title: s.iec, rows: inUnits(bytes, IEC_UNITS) },
        ],
  );
  const human = (system: 'si' | 'iec') => {
    const h = humanSize(bytes!, system);
    return `${formatNumber(h.value, locale)} ${h.unit}`;
  };
  const exactBytes = $derived(bytes === null ? '' : formatExactBytes(bytes, locale));
  const exactBytesCopy = $derived(bytes === null ? '' : formatExactBytesPlain(bytes, locale));
</script>

<div class="panel">
  <Field id="file-size-input" label={s.input} help={s.help} {error}>
    {#snippet children({ describedby })}
      <input
        id="file-size-input"
        class="control mono"
        type="text"
        autocomplete="off"
        spellcheck="false"
        placeholder={s.placeholder}
        aria-describedby={describedby}
        aria-invalid={!!error}
        bind:value={input.value}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      <span
        >{bytes === null
          ? error
            ? t(locale, 'ui.fixField')
            : s.empty
          : fill(s.readableLine, { si: human('si'), iec: human('iec') })}</span
      >
    {/snippet}
    {#if bytes !== null}
      <div class="columns">
        {#each columns as col (col.id)}
          <section aria-label={col.title}>
            <h3 class="col-title">{col.title}</h3>
            <div class="display-rows">
              {#each col.rows as r (r.unit)}
                {@const shown =
                  r.unit === 'B'
                    ? formatExactBytes(r.value, locale)
                    : formatNumber(r.value, locale)}
                <div class="display-row" data-unit={r.unit}>
                  <span>{shown} {r.unit}</span>
                  <CopyButton
                    value={shown}
                    {locale}
                    compact
                    ariaLabel={fill(s.copyUnit, { u: r.unit })}
                  />
                </div>
              {/each}
            </div>
          </section>
        {/each}
      </div>
      <dl class="display-kv">
        <dt>{s.exact}</dt>
        <dd>{exactBytes} B</dd>
        <dt>{s.bits}</dt>
        <dd>{formatNumber(bytes * 8, locale, 3)} b</dd>
      </dl>
      {#if bytes > 0 && bytes < 1}
        <p class="display-note">{fill(s.subByte, { bits: formatNumber(bytes * 8, locale) })}</p>
      {/if}
      {#if parsed.ok && parsed.windowsKb}<p class="display-note">{s.windowsKb}</p>{/if}
      {#if parsed.ok && parsed.approximate}<p class="display-note">{s.approximate}</p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={exactBytesCopy} {locale} label={s.exact} />
  </div>

  <p class="note">{s.explain}</p>

  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: 8px 24px;
  }
  .col-title {
    margin-bottom: 8px;
    font: 600 13px/1.3 var(--font-body);
    color: var(--disp-dim);
    text-shadow: none;
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
  }
</style>
