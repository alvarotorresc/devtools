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
  import type { Locale } from '../types';
  import { validatePhone, type PhoneResult } from './logic';
  import { kindNames, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const kinds = $derived(kindNames[locale]);

  // meta.rememberInput is false: phone numbers are personal data.
  let input = $state('');

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validatePhone(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: PhoneResult): string {
    if (r.ok) return kinds[r.kind];
    switch (r.reason) {
      case 'foreign':
        return s.errForeign;
      case 'short':
        return s.errShort;
      case 'fewDigits':
        return s.errFew;
      case 'manyDigits':
        return s.errMany;
      case 'pattern':
        return s.errPattern;
      default:
        return s.errChars;
    }
  }

  const copyValue = $derived(results.map((x) => (x.r.ok ? x.r.e164 : x.line)).join('\n'));
</script>

<div class="panel">
  <Field id="phone-input" label={s.input} help={s.help}>
    {#snippet children({ describedby })}
      <TextArea
        id="phone-input"
        bind:value={input}
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
        <Led
          state={single.ok ? 'ok' : 'bad'}
          label={single.ok ? reason(single) : t(locale, 'led.bad')}
        />
      {:else}
        <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
      {/if}
    {/snippet}
    {#if results.length === 0}
      <p class="display-note">{s.empty}</p>
    {:else if single}
      {#if single.ok}
        <div class="display-value">{single.e164}</div>
        <dl class="display-kv">
          <dt>{s.kind}</dt>
          <dd>{kinds[single.kind]}</dd>
          <dt>{s.national}</dt>
          <dd>{single.nationalFormatted}</dd>
          <dt>{s.international}</dt>
          <dd>{single.international}</dd>
          <dt>{s.link}</dt>
          <dd><a href={single.tel}>{s.call}</a></dd>
        </dl>
      {:else}
        <p class="display-note">{reason(single)}</p>
      {/if}
    {:else}
      <div class="display-rows">
        {#each results as x, i (i)}
          <div class="display-row">
            <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.e164 : x.line} />
            <span class="why">{reason(x.r)}</span>
          </div>
        {/each}
      </div>
      {#if split.truncated}<p class="display-note">{fill(s.truncated, { n: MAX_LINES })}</p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={copyValue} {locale} label={s.copy} />
    <Button variant="ghost" disabled={!input} onclick={() => (input = '')}>
      {t(locale, 'ui.clear')}
    </Button>
  </div>
</div>

<style>
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  dd a {
    color: var(--disp-text);
  }
</style>
