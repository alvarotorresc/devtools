<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
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
  import { checkRange, checkVersions, describeRange, highest } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const range = persistedInput('semver', '', remember);
  const versions = persistedInput('semver-versions', '', remember);

  let includePrerelease = $state(false);

  const opts = $derived({ includePrerelease });
  const check = $derived(range.value.trim() ? checkRange(range.value, opts) : null);
  const rows = $derived(check?.ok ? checkVersions(range.value, versions.value, opts) : []);
  const validCount = $derived(rows.filter((r) => r.ok).length);
  const matching = $derived(rows.filter((r) => r.ok && r.satisfies).length);
  const best = $derived(check?.ok ? highest(rows, range.value, opts) : null);

  const cheats = $derived([
    { code: '^1.2.3', text: s.cheatCaret },
    { code: '~1.2.3', text: s.cheatTilde },
    { code: '1.x', text: s.cheatX },
    { code: '1.2.3 - 2.3.4', text: s.cheatHyphen },
    { code: '^1.0.0 || ^2.0.0', text: s.cheatOr },
  ]);
</script>

<div class="panel">
  <Field id="semver-range" label={s.range} error={check && !check.ok ? s.badRange : undefined}>
    {#snippet children({ describedby })}
      <input
        id="semver-range"
        class="control mono"
        bind:value={range.value}
        placeholder={s.rangePlaceholder}
        aria-describedby={describedby}
        aria-invalid={!!check && !check.ok}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
    {/snippet}
  </Field>

  <Field id="semver-versions" label={s.versions}>
    {#snippet children({ describedby })}
      <TextArea
        id="semver-versions"
        bind:value={versions.value}
        placeholder={s.versionsPlaceholder}
        {describedby}
        rows={6}
      />
    {/snippet}
  </Field>

  <Toggle bind:checked={includePrerelease} label={s.includePrerelease} />

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!check
          ? 'idle'
          : !check.ok
            ? 'bad'
            : validCount === 0
              ? 'idle'
              : matching > 0
                ? 'ok'
                : 'bad'}
        label={!check
          ? t(locale, 'led.idle')
          : !check.ok
            ? t(locale, 'ui.fixField')
            : validCount === 0
              ? s.noVersions
              : fill(plural(locale, matching, s.matchesOne, s.matchesOther), {
                  total: validCount,
                })}
      />
    {/snippet}
    {#if check?.ok}
      <dl class="display-kv">
        <dt>{s.normalized}</dt>
        <dd>{check.normalized}</dd>
        <dt>{s.reading}</dt>
        <dd class="words">{describeRange(check.normalized, locale)}</dd>
        <dt>{s.min}</dt>
        <dd>{check.min ?? s.none}</dd>
        {#if validCount > 0}
          <dt>{s.max}</dt>
          <dd>{best ?? s.none}</dd>
        {/if}
      </dl>
      {#if rows.length}
        <ul class="display-rows versions">
          {#each rows as row, i (i)}
            <li class="display-row">
              <span class="version">{row.input}</span>
              {#if row.ok}
                <Led state={row.satisfies ? 'ok' : 'bad'} label={row.satisfies ? s.yes : s.no} />
              {:else}
                <span class="error">{s.badVersion}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    {:else if !check}
      <!-- A bad range already shows under the field (I3); nothing to repeat here. -->
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={check?.ok ? check.normalized : ''} {locale} label={s.copyRange} />
    <Button
      variant="ghost"
      disabled={!range.value && !versions.value}
      onclick={() => {
        range.value = '';
        versions.value = '';
      }}>{t(locale, 'ui.clear')}</Button
    >
  </div>

  <details class="cheats">
    <summary>{s.cheatsheet}</summary>
    <dl>
      {#each cheats as c (c.code)}
        <dt><code>{c.code}</code></dt>
        <dd>{c.text}</dd>
      {/each}
    </dl>
  </details>

  <Toggle
    bind:checked={
      () => range.remember,
      (v) => {
        range.remember = v;
        versions.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .versions {
    list-style: none;
    padding: 0;
  }
  .version {
    font-family: var(--font-mono);
  }
  .words {
    font-family: var(--font-body);
  }
  /* Inside the display, which is dark in every theme: --bad passes there, --bad-text does not. */
  .error {
    font: 600 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--bad);
    text-align: right;
  }
  .cheats summary {
    display: flex;
    align-items: center;
    font-weight: 600;
    cursor: pointer;
  }
  @media (pointer: coarse) {
    .cheats summary {
      min-height: 44px;
    }
  }
  .cheats dl {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 8px 16px;
    margin: 8px 0 0;
  }
  .cheats dd {
    margin: 0;
    color: var(--text-dim);
  }
  .cheats code {
    font-family: var(--font-mono);
  }
</style>
