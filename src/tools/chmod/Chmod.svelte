<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Icon from '../../ui/Icon.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    bit,
    describeMode,
    has,
    isWorldWritable,
    parseOctal,
    parseSymbolic,
    PERMS,
    PRESETS,
    SETGID,
    SETUID,
    STICKY,
    toChmodSymbolic,
    toggle,
    toLs,
    toOctal,
    toSymbolic,
    WHO,
    type Mode,
  } from './logic';
  import { meta } from './meta';
  import { sentenceWords, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // The remembered value is always a valid octal string.
  const stored = persistedInput('chmod', '755', meta.rememberInput ?? true);

  let mode = $state<Mode>(0o755);
  let fileType = $state('-');
  let octText = $state('755');
  let symText = $state('rwxr-xr-x');
  let octError = $state<string | undefined>(undefined);
  let symError = $state<string | undefined>(undefined);

  function sync(except: 'octal' | 'symbolic' | null) {
    if (except !== 'octal') {
      octText = toOctal(mode);
      octError = undefined;
    }
    if (except !== 'symbolic') {
      symText = toSymbolic(mode);
      symError = undefined;
    }
  }

  // Runs after persistedInput's own onMount, so a remembered value is already loaded.
  onMount(() => {
    const r = parseOctal(stored.value);
    if (r.ok) mode = r.mode;
    sync(null);
  });

  function setMode(next: Mode, source: 'octal' | 'symbolic' | null) {
    mode = next;
    stored.value = toOctal(next);
    sync(source);
  }

  function onOctal(value: string) {
    octText = value;
    const r = parseOctal(value);
    if (r.ok) {
      octError = undefined;
      setMode(r.mode, 'octal');
    } else {
      octError = r.reason === 'digit' ? fill(s.digit, { d: r.digit }) : s.length;
    }
  }

  function onSymbolic(value: string) {
    symText = value;
    const r = parseSymbolic(value);
    if (r.ok) {
      symError = undefined;
      fileType = r.type;
      setMode(r.mode, 'symbolic');
    } else if (r.reason === 'length') {
      symError = s.symLength;
    } else {
      const expected = new Intl.ListFormat(locale, { type: 'disjunction' }).format(r.expected);
      symError = fill(s.symChar, { p: r.position, c: r.char, e: expected });
    }
  }

  const specials = [
    { mask: SETUID, key: 'setuid', note: 'setuidNote' },
    { mask: SETGID, key: 'setgid', note: 'setgidNote' },
    { mask: STICKY, key: 'sticky', note: 'stickyNote' },
  ] as const;

  const command = $derived(`chmod ${toOctal(mode)} ${s.file}`);
  const symbolicCommand = $derived(`chmod ${toChmodSymbolic(mode)} ${s.file}`);
  const sentence = $derived(describeMode(mode, sentenceWords[locale], locale));
</script>

<div class="panel">
  <div class="fields">
    <Field id="chmod-octal" label={s.octal} error={octError}>
      {#snippet children({ describedby })}
        <input
          id="chmod-octal"
          class="control mono"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
          aria-describedby={describedby}
          aria-invalid={!!octError}
          value={octText}
          oninput={(e) => onOctal(e.currentTarget.value)}
          onblur={() => {
            if (!octError) octText = toOctal(mode);
          }}
        />
      {/snippet}
    </Field>
    <Field id="chmod-symbolic" label={s.symbolic} help={s.symbolicHelp} error={symError}>
      {#snippet children({ describedby })}
        <input
          id="chmod-symbolic"
          class="control mono"
          type="text"
          autocomplete="off"
          spellcheck="false"
          aria-describedby={describedby}
          aria-invalid={!!symError}
          value={symText}
          oninput={(e) => onSymbolic(e.currentTarget.value)}
          onblur={() => {
            if (!symError) symText = toSymbolic(mode);
          }}
        />
      {/snippet}
    </Field>
  </div>

  <div class="presets" role="group" aria-label={s.presets}>
    {#each PRESETS as p (p)}
      <Button onclick={() => setMode(parseInt(p, 8), null)}>{p}</Button>
    {/each}
  </div>

  <table class="grid">
    <caption class="visually-hidden">{s.grid}</caption>
    <thead>
      <tr>
        <th scope="col">{s.who}</th>
        {#each PERMS as perm (perm)}<th scope="col">{s[perm]}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each WHO as who (who)}
        <tr>
          <th scope="row">{s[who]}</th>
          {#each PERMS as perm (perm)}
            <td>
              <label class="box">
                <input
                  id="chmod-{who}-{perm}"
                  type="checkbox"
                  aria-label="{s[who]}: {s[perm].toLowerCase()}"
                  checked={has(mode, bit(who, perm))}
                  onchange={(e) =>
                    setMode(toggle(mode, bit(who, perm), e.currentTarget.checked), null)}
                />
              </label>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <fieldset class="specials">
    <legend>{s.special}</legend>
    {#each specials as sp (sp.key)}
      <label class="special">
        <input
          id="chmod-{sp.key}"
          type="checkbox"
          checked={has(mode, sp.mask)}
          onchange={(e) => setMode(toggle(mode, sp.mask, e.currentTarget.checked), null)}
        />
        <span class="mono">{s[sp.key]}</span>
      </label>
    {/each}
  </fieldset>

  <Display live label={s.result}>
    {#snippet head()}<span>{sentence}</span>{/snippet}
    <dl class="display-kv">
      <dt>{s.command}</dt>
      <dd id="chmod-command">{command}</dd>
      <dt>{s.commandSymbolic}</dt>
      <dd>{symbolicCommand}</dd>
      <dt>{s.ls}</dt>
      <dd id="chmod-ls">{toLs(mode, fileType)}</dd>
    </dl>
    {#each specials as sp (sp.key)}
      {#if has(mode, sp.mask)}<p class="display-note">{s[sp.note]}</p>{/if}
    {/each}
  </Display>

  {#if isWorldWritable(mode)}
    <p class="warn" role="status"><Icon name="triangle-alert" size={16} />{s.worldWritable}</p>
  {/if}

  <div class="row">
    <CopyButton main value={command} {locale} label={s.command} />
    <CopyButton value={symbolicCommand} {locale} label={s.commandSymbolic} />
  </div>

  <Toggle bind:checked={stored.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 16px;
  }
  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .grid {
    border-collapse: collapse;
    width: 100%;
    max-width: 480px;
  }
  .grid th,
  .grid td {
    padding: 4px 8px;
    text-align: center;
    font-size: 14px;
  }
  .grid th[scope='row'] {
    text-align: left;
    font-weight: 600;
  }
  .grid thead th {
    font-size: 13px;
    color: var(--text-dim);
  }
  .grid tbody tr {
    border-top: 1px solid var(--border);
  }
  .box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    cursor: pointer;
  }
  input[type='checkbox'] {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--accent);
    cursor: pointer;
  }
  .specials {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin: 0;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  legend {
    padding: 0 6px;
    font-size: 13px;
    font-weight: 600;
  }
  .special {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 36px;
    cursor: pointer;
  }
  .mono {
    font-family: var(--font-mono);
  }
  .warn {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--bad-text);
  }
  @media (pointer: coarse) {
    .box {
      width: 44px;
      height: 44px;
    }
    .special {
      min-height: 44px;
    }
  }
</style>
