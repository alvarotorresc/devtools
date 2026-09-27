<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import type { Locale } from '../types';
  import { parseCurl, toFetch, type CurlError, type CurlWarning } from './logic';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  // rememberInput: false. A copied cURL usually carries cookies and tokens: never persisted.
  let input = $state('');

  const result = $derived(parseCurl(input));
  const code = $derived(result.ok ? toFetch(result.request, locale) : '');

  function errorText(e: CurlError): string {
    if (e === 'empty') return '';
    if (e === 'unclosed-quote') return s.unclosedQuote;
    if (e === 'windows') return s.windows;
    if (e === 'not-curl') return s.notCurl;
    if (e === 'no-url') return s.noUrl;
    if (e.kind === 'missing-value') return fill(s.missingValue, { option: e.option });
    return fill(s.badTimeout, { value: e.value });
  }

  function warningText(w: CurlWarning): string {
    switch (w.kind) {
      case 'unknown-option':
        return fill(s.unknownOption, { option: w.option });
      case 'data-file':
        return fill(s.dataFile, { file: w.file });
      case 'form-file':
        return fill(s.formFile, { name: w.name, file: w.file });
      case 'user-agent':
        return s.userAgent;
      case 'cookie':
        return s.cookie;
      case 'insecure':
        return s.insecure;
      case 'duplicate-header':
        return fill(s.duplicateHeader, { name: w.name });
      case 'bad-header':
        return fill(s.badHeader, { text: w.text });
      case 'extra-argument':
        return fill(s.extraArgument, { text: w.text });
      case 'no-scheme':
        return s.noScheme;
      case 'method-drops-body':
        return fill(s.methodDropsBody, { method: w.method });
    }
  }

  const error = $derived(result.ok ? '' : errorText(result.error));
</script>

<div class="panel">
  <Field id="curl-input" label={s.input} help={s.notSaved}>
    {#snippet children({ describedby })}
      <TextArea
        id="curl-input"
        bind:value={input}
        placeholder={s.placeholder}
        {describedby}
        invalid={!!error}
        rows={8}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={result.ok ? 'ok' : error ? 'bad' : 'idle'}
        label={result.ok ? s.converted : t(locale, error ? 'led.bad' : 'led.idle')}
      />
    {/snippet}
    {#if code}
      <pre class="display-code">{code}</pre>
    {:else}
      <p class="display-note">{error || s.empty}</p>
    {/if}
  </Display>

  {#if result.ok && result.warnings.length}
    <section class="warnings" aria-label={s.warnings}>
      <h2>{s.warnings}</h2>
      <ul>
        {#each result.warnings as w, i (i)}
          <li>{warningText(w)}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <div class="row">
    <CopyButton main value={code} {locale} label={s.copyCode} />
    <Button variant="ghost" disabled={!input} onclick={() => (input = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
</div>

<style>
  .warnings {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .warnings h2 {
    font-size: 14px;
    font-weight: 600;
  }
  .warnings ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding-left: 1.2em;
    font-size: 14px;
    color: var(--text-dim);
  }
</style>
