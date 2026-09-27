<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { parseCidr, toBinary, toDotted, type CidrError } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('cidr', '', meta.rememberInput ?? true);

  const result = $derived(parseCidr(input.value));
  const nf = $derived(new Intl.NumberFormat(locale));

  function errorText(e: CidrError): string {
    switch (e.kind) {
      case 'empty':
        return '';
      case 'ipv6':
        return s.ipv6;
      case 'format':
        return s.format;
      case 'leading-zero':
        return fill(s.leadingZero, { fixed: e.fixed });
      case 'octet-range':
        return fill(s.octetRange, { octet: e.octet });
      case 'prefix':
        return fill(s.prefix, { prefix: e.prefix });
      case 'mask':
        return s.badMask;
    }
  }

  const error = $derived(result.ok ? '' : errorText(result.error));
  const rows = $derived.by(() => {
    if (!result.ok) return [];
    const n = result.subnet;
    return [
      { label: s.ip, value: toDotted(n.ip) },
      { label: s.network, value: `${toDotted(n.network)}/${n.prefix}` },
      { label: s.mask, value: toDotted(n.mask) },
      { label: s.wildcard, value: toDotted(n.wildcard) },
      { label: s.broadcast, value: n.broadcast === null ? s.none : toDotted(n.broadcast) },
      { label: s.first, value: toDotted(n.firstHost) },
      { label: s.last, value: toDotted(n.lastHost) },
      { label: s.usable, value: nf.format(n.usable) },
      { label: s.total, value: nf.format(n.total) },
      { label: s.binary, value: toBinary(n.mask) },
      { label: s.type, value: s[n.type] },
      { label: s.class, value: n.ipClass },
    ];
  });
  const networkText = $derived(
    result.ok ? `${toDotted(result.subnet.network)}/${result.subnet.prefix}` : '',
  );
</script>

<div class="panel">
  <Field
    id="cidr-input"
    label={s.input}
    help={result.ok && result.assumed32 ? s.assumed32 : s.help}
    error={error || undefined}
  >
    {#snippet children({ describedby })}
      <input
        id="cidr-input"
        class="control mono"
        bind:value={input.value}
        placeholder={s.placeholder}
        aria-describedby={describedby}
        aria-invalid={!!error}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={result.ok ? 'ok' : error ? 'bad' : 'idle'}
        label={result.ok ? networkText : t(locale, error ? 'led.bad' : 'led.idle')}
      />
    {/snippet}
    {#if rows.length}
      <dl class="display-kv">
        {#each rows as r (r.label)}
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        {/each}
      </dl>
    {:else}
      <p class="display-note">{error || s.empty}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={networkText} {locale} label={s.copyNetwork} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>
