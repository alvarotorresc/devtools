<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatRelative } from '../../lib/relative';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Icon from '../../ui/Icon.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import type { Locale } from '../types';
  import { TIME_CLAIMS, claimDate, cleanToken, inspectJwt, validity } from './logic';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  // meta.rememberInput is false: a JWT is a credential, so it lives only in memory.
  let token = $state('');
  let now = $state(Date.now());

  $effect(() => {
    const id = setInterval(() => (now = Date.now()), 10_000);
    return () => clearInterval(id);
  });

  const result = $derived(token.trim() ? inspectJwt(token) : null);
  const jwt = $derived(result?.ok ? result.jwt : null);
  const headerJson = $derived(jwt ? JSON.stringify(jwt.header, null, 2) : '');
  const payloadJson = $derived(jwt ? JSON.stringify(jwt.payload, null, 2) : '');
  const status = $derived(jwt ? validity(jwt.payload, now) : null);

  const ledState = $derived(
    !result ? 'idle' : !jwt ? 'bad' : status === 'expired' || status === 'notYet' ? 'bad' : 'ok',
  );
  const ledLabel = $derived.by(() => {
    if (!result) return t(locale, 'led.idle');
    if (!jwt) return s.invalid;
    const exp = claimDate(jwt.payload, 'exp');
    const nbf = claimDate(jwt.payload, 'nbf');
    if (status === 'expired' && exp)
      return `${s.expired} · ${formatRelative(exp.getTime(), now, locale)}`;
    if (status === 'notYet' && nbf)
      return `${s.notYet} · ${formatRelative(nbf.getTime(), now, locale)}`;
    if (status === 'valid' && exp)
      return `${s.valid} · ${formatRelative(exp.getTime(), now, locale)}`;
    return status === 'valid' ? s.valid : s.none;
  });
  const errorText = $derived.by(() => {
    if (!result || result.ok) return '';
    if (result.error === 'parts')
      return fill(s.errorParts, { n: cleanToken(token).split('.').length });
    return result.error === 'header' ? s.errorHeader : s.errorPayload;
  });
  const dates = $derived(
    jwt
      ? TIME_CLAIMS.map((claim) => ({ claim, date: claimDate(jwt.payload, claim) })).filter(
          (d): d is { claim: (typeof TIME_CLAIMS)[number]; date: Date } => d.date !== null,
        )
      : [],
  );
</script>

<div class="panel">
  <p class="warning" role="note">
    <Icon name="triangle-alert" size={18} />
    <span>{s.warning}</span>
  </p>

  <Field id="jwt-input" label={s.input} help={s.notStored}>
    {#snippet children({ describedby })}
      <TextArea
        id="jwt-input"
        bind:value={token}
        placeholder={s.placeholder}
        {describedby}
        invalid={ledState === 'bad' && !jwt}
        rows={5}
      />
    {/snippet}
  </Field>

  <Display live label={s.status}>
    {#snippet head()}
      <Led state={ledState} label={ledLabel} />
      {#if jwt && typeof jwt.header.alg === 'string'}<span>{s.algorithm}: {jwt.header.alg}</span
        >{/if}
    {/snippet}
    {#if errorText}
      <p class="display-note">{errorText}</p>
    {:else if dates.length}
      <dl class="display-kv">
        {#each dates as d (d.claim)}
          <dt>{s[d.claim]}</dt>
          <dd>
            {d.date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'medium' })} · {formatRelative(
              d.date.getTime(),
              now,
              locale,
            )}
          </dd>
        {/each}
      </dl>
    {:else if !jwt}
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  {#if jwt}
    <div class="grid">
      <Display label={s.header}>
        {#snippet head()}
          <span>{s.header}</span>
          <CopyButton value={headerJson} {locale} compact label={s.copyHeader} />
        {/snippet}
        <pre class="display-code">{headerJson}</pre>
      </Display>
      <Display label={s.payload}>
        {#snippet head()}
          <span>{s.payload}</span>
          <CopyButton value={payloadJson} {locale} compact label={s.copyPayload} />
        {/snippet}
        <pre class="display-code">{payloadJson}</pre>
      </Display>
    </div>
    <Display label={s.signature}>
      {#snippet head()}<span>{s.signature}</span>{/snippet}
      <pre class="display-code wrap">{jwt.signature}</pre>
    </Display>
  {/if}

  <div class="row">
    <CopyButton main value={payloadJson} {locale} label={s.copyPayload} />
    <Button variant="ghost" disabled={!token} onclick={() => (token = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
</div>

<style>
  .warning {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 14px;
    border: 1px solid var(--bad);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 14px;
  }
  .warning :global(svg) {
    flex-shrink: 0;
    color: var(--bad);
    margin-top: 1px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
