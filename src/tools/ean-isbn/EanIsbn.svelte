<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { MAX_LINES, splitLines } from '../../lib/ids';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { validateCode, type CodeResult } from './logic';
  import { meta } from './meta';
  import { prefixNames, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // Product codes are public.
  const input = persistedInput('ean-isbn', '', meta.rememberInput ?? true);

  const split = $derived(splitLines(input.value));
  const results = $derived(split.lines.map((line) => ({ line, r: validateCode(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function title(r: CodeResult): string {
    if (!r.ok) return t(locale, 'led.bad');
    if (r.format === 'isbn10') return s.validIsbn10;
    return r.isbn ? s.validIsbn13 : s.validEan;
  }

  function reason(r: CodeResult): string {
    if (r.ok) return title(r);
    const vars = { e: r.expected ?? '', c: r.completed ?? '' };
    switch (r.reason) {
      case 'eanCheck':
        return fill(s.errEanCheck, vars);
      case 'isbnCheck':
        return fill(s.errIsbnCheck, vars);
      case 'eanMissing':
        return fill(s.errEanMissing, vars);
      case 'isbnMissing':
        return fill(s.errIsbnMissing, vars);
      case 'ean8':
        return s.errEan8;
      case 'length':
        return fill(s.errLength, { n: r.length ?? 0 });
      case 'xPosition':
        return s.errX;
      default:
        return s.errChars;
    }
  }

  const copyValue = $derived(
    results.map((x) => (x.r.ok ? x.r.code : (x.r.completed ?? x.line))).join('\n'),
  );
</script>

<div class="panel">
  <Field id="ean-isbn-input" label={s.input} help={s.help}>
    {#snippet children({ describedby })}
      <TextArea
        id="ean-isbn-input"
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
        <Led state={single.ok ? 'ok' : 'bad'} label={title(single)} />
      {:else}
        <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
      {/if}
    {/snippet}
    {#if results.length === 0}
      <p class="display-note">{s.empty}</p>
    {:else if single}
      {#if single.ok}
        <div class="display-value">{single.code}</div>
        {#if single.format === 'isbn10' || (single.format === 'ean13' && (single.isbn10 || single.prefix))}
          <dl class="display-kv">
            {#if single.format === 'ean13'}
              {#if single.isbn10}
                <dt>{s.isbn10}</dt>
                <dd>{single.isbn10}</dd>
              {/if}
              {#if single.prefix}
                <dt>{s.prefix}</dt>
                <dd>{prefixNames[locale][single.prefix]}</dd>
              {/if}
            {:else}
              <dt>{s.isbn13}</dt>
              <dd>{single.isbn13}</dd>
            {/if}
          </dl>
        {/if}
        {#if single.format === 'ean13' && single.isbn && !single.isbn10}
          <p class="display-note">{s.no979}</p>
        {/if}
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
