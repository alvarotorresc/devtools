<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { MAX_LINES, splitLines } from '../../lib/ids';
  import { plural } from '../../lib/plural';
  import { PROVINCES, provinceByCode } from '../../lib/provinces';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { lookupPostalCode, postalRange, type PostalResult } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // A bare postal code is not sensitive.
  const input = persistedInput('postal-code', '', meta.rememberInput ?? true);
  let reverse = $state('28');

  const split = $derived(splitLines(input.value));
  const results = $derived(split.lines.map((line) => ({ line, r: lookupPostalCode(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);
  const badCount = $derived(results.length - okCount);
  const countText = $derived(
    `${plural(locale, okCount, s.validOne, s.validOther)} · ${plural(locale, badCount, s.invalidOne, s.invalidOther)}`,
  );

  function reason(r: PostalResult): string {
    if (r.ok)
      return r.padded
        ? `${r.province.name} · ${fill(s.padded, { code: r.code })}`
        : r.province.name;
    switch (r.reason) {
      case 'prefix':
        return fill(s.errPrefix, { p: r.prefix ?? '' });
      case 'length':
        return s.errLength;
      default:
        return s.errChars;
    }
  }

  const copyValue = $derived(results.map((x) => (x.r.ok ? x.r.code : x.line)).join('\n'));

  const options = PROVINCES.map((p) => ({ value: p.code, label: `${p.code} · ${p.name}` }));
  const range = $derived(postalRange(reverse));
  const reverseName = $derived(provinceByCode(reverse)?.name ?? '');
</script>

<div class="panel">
  <Field id="postal-code-input" label={s.input} help={s.help}>
    {#snippet children({ describedby })}
      <TextArea
        id="postal-code-input"
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
        <div class="display-value">{single.code}</div>
        <dl class="display-kv">
          <dt>{s.province}</dt>
          <dd>{single.province.name}</dd>
          <dt>{s.community}</dt>
          <dd>{single.province.community}</dd>
          <dt>{s.capital}</dt>
          <dd>{single.province.capital}</dd>
        </dl>
        {#if single.padded}<p class="display-note">{fill(s.padded, { code: single.code })}</p>{/if}
      {:else}
        <p class="display-note">{reason(single)}</p>
      {/if}
    {:else}
      <div class="display-rows">
        {#each results as x, i (i)}
          <div class="display-row">
            <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.code : x.line} />
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

  <Field id="postal-code-province" label={s.reverse}>
    <Select id="postal-code-province" bind:value={reverse} {options} />
  </Field>
  <Display live label={s.range}>
    <p class="range">
      {fill(s.rangeText, { name: reverseName, from: range.from, to: range.to })}
    </p>
  </Display>
</div>

<style>
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .range {
    font: 500 15px/1.5 var(--font-mono);
  }
</style>
