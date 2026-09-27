<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { cryptoRng } from '../../lib/random';
  import { readJSON, removeKey, writeJSON } from '../../lib/storage';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    DEFAULT_OPTIONS,
    MAX_COUNT,
    MAX_LENGTH,
    MIN_LENGTH,
    entropyBits,
    generatePassword,
    isDefaultOptions,
    sanitizeOptions,
    strength,
    validate,
    type PasswordOptions,
  } from './logic';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  const OPTIONS_KEY = 'password.options';

  // rememberInput: false. Only the options (not secret) are stored; passwords live in memory.
  let opts = $state<PasswordOptions>({ ...DEFAULT_OPTIONS });
  let ready = $state(false);
  let nonce = $state(0);
  let passwords = $state<string[]>([]);

  onMount(() => {
    opts = sanitizeOptions(readJSON<unknown>(OPTIONS_KEY, DEFAULT_OPTIONS));
    ready = true;
  });

  // While typing, the number fields can be empty or out of range: work with a clamped copy.
  const effective = $derived<PasswordOptions>({
    ...opts,
    length: Math.min(MAX_LENGTH, Math.max(1, Math.round(opts.length) || 0)),
    count: Math.min(MAX_COUNT, Math.max(1, Math.round(opts.count) || 1)),
  });
  const error = $derived(validate(effective));

  $effect(() => {
    if (!ready) return;
    const snapshot = $state.snapshot(opts);
    // M5: a user who never touches the options should not have today's defaults pinned to
    // storage; someone who changes them and then dials them back to the defaults gets the stale
    // entry cleared instead of left behind.
    if (isDefaultOptions(snapshot)) removeKey(OPTIONS_KEY);
    else writeJSON(OPTIONS_KEY, snapshot);
  });

  $effect(() => {
    void nonce;
    const o = effective;
    if (!ready || validate(o)) {
      passwords = [];
      return;
    }
    const rng = cryptoRng();
    passwords = Array.from({ length: o.count }, () => generatePassword(rng, o));
  });

  const bits = $derived(error ? 0 : entropyBits(effective));
  const level = $derived(strength(bits));
  const bitsText = $derived(
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(
      bits,
    ),
  );
  const errorText = $derived(
    !error ? '' : error.kind === 'no-sets' ? s.noSets : fill(s.tooShort, { sets: error.sets }),
  );
</script>

<div class="panel">
  <div class="row">
    <Field id="password-length" label={s.length}>
      {#snippet children({ describedby })}
        <NumberInput
          id="password-length"
          bind:value={opts.length}
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          {describedby}
        />
      {/snippet}
    </Field>
    <Field id="password-count" label={s.count}>
      {#snippet children({ describedby })}
        <NumberInput
          id="password-count"
          bind:value={opts.count}
          min={1}
          max={MAX_COUNT}
          {describedby}
        />
      {/snippet}
    </Field>
  </div>

  <div class="sets">
    <Toggle bind:checked={opts.lower} label={s.lower} />
    <Toggle bind:checked={opts.upper} label={s.upper} />
    <Toggle bind:checked={opts.digits} label={s.digits} />
    <Toggle bind:checked={opts.symbols} label={s.symbols} />
    <Toggle bind:checked={opts.excludeAmbiguous} label={s.excludeAmbiguous} />
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={error ? 'bad' : level === 'strong' ? 'ok' : level === 'weak' ? 'bad' : 'idle'}
        label={error ? t(locale, 'led.bad') : `${s[level]} · ${fill(s.bits, { bits: bitsText })}`}
      />
    {/snippet}
    {#if error}
      <p class="display-note">{errorText}</p>
    {:else if passwords.length}
      <ol class="display-rows list">
        {#each passwords as p, i (i)}
          <li class="display-row">
            <span class="pw">{p}</span>
            <CopyButton value={p} {locale} compact ariaLabel={fill(s.copyOne, { n: i + 1 })} />
          </li>
        {/each}
      </ol>
      <p class="display-note">{s.entropyNote}</p>
    {:else}
      <p class="display-note">{t(locale, 'led.idle')}</p>
    {/if}
  </Display>

  <div class="row">
    <Button variant="primary" icon="refresh-cw" disabled={!!error} onclick={() => nonce++}
      >{t(locale, 'ui.generate')}</Button
    >
    <CopyButton main value={passwords.join('\n')} {locale} label={s.copyAll} />
  </div>
  <p class="note">{s.notSaved}</p>
</div>

<style>
  .sets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0 16px;
  }
  .list {
    list-style: none;
    padding: 0;
  }
  .pw {
    min-width: 0;
    font-size: 16px;
    letter-spacing: 0.02em;
    word-break: break-all;
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
  }
</style>
