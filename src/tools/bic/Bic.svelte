<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { MAX_LINES, splitLines } from '../../lib/ids';
  import { plural } from '../../lib/plural';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { validateBic, type BicResult } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // BIC codes are public bank identifiers.
  const input = persistedInput('bic', '', meta.rememberInput ?? true);

  function countryName(code: string): string {
    try {
      return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
    } catch {
      return code;
    }
  }

  const split = $derived(splitLines(input.value));
  const results = $derived(split.lines.map((line) => ({ line, r: validateBic(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);
  const badCount = $derived(results.length - okCount);
  const countText = $derived(
    `${plural(locale, okCount, s.validOne, s.validOther)} · ${plural(locale, badCount, s.invalidOne, s.invalidOther)}`,
  );

  function reason(r: BicResult): string {
    if (r.ok) return countryName(r.country);
    switch (r.reason) {
      case 'empty':
        return s.empty;
      case 'length':
        return fill(s.errLength, { n: r.length ?? 0 });
      case 'bank':
        return s.errBank;
      case 'country':
        return fill(s.errCountry, { c: r.country ?? '' });
      default:
        return s.errFormat;
    }
  }

  const copyValue = $derived(results.map((x) => (x.r.ok ? x.r.bic11 : x.line)).join('\n'));
</script>

<div class="panel">
  <Field id="bic-input" label={s.input} help={s.help}>
    {#snippet children({ describedby })}
      <TextArea
        id="bic-input"
        bind:value={input.value}
        rows={3}
        placeholder={s.placeholder}
        {describedby}
        invalid={single !== null && !single.ok}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      {#if results.length === 0}
        <Led state="idle" label={t(locale, 'led.idle')} />
      {:else if single}
        <Led state={single.ok ? 'ok' : 'bad'} label={single.ok ? s.valid : t(locale, 'led.bad')} />
      {:else}
        <span>{countText}</span>
      {/if}
    {/snippet}
    {#if results.length === 0}
      <p class="display-note">{s.empty}</p>
    {:else if single}
      {#if single.ok}
        <div class="display-value">{single.bic11}</div>
        <dl class="display-kv">
          <dt>{s.bank}</dt>
          <dd>{single.bank}</dd>
          <dt>{s.country}</dt>
          <dd>{single.country} · {countryName(single.country)}</dd>
          <dt>{s.location}</dt>
          <dd>{single.location}</dd>
          <dt>{s.branch}</dt>
          <dd>{single.branch ?? s.headOffice}</dd>
          <dt>{s.short}</dt>
          <dd>{single.bic8}</dd>
          <dt>{s.long}</dt>
          <dd>{single.bic11}</dd>
        </dl>
        {#if single.test}<p class="display-note">{s.test}</p>{/if}
      {:else}
        <p class="display-note">{reason(single)}</p>
      {/if}
    {:else}
      <div class="display-rows">
        {#each results as x, i (i)}
          <div class="display-row">
            <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.bic11 : x.line} />
            <span class="why">{reason(x.r)}</span>
          </div>
        {/each}
      </div>
      {#if split.truncated}<p class="display-note">{fill(s.truncated, { n: MAX_LINES })}</p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={copyValue} {locale} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
      {t(locale, 'ui.clear')}
    </Button>
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
</style>
