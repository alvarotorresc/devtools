<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { rngFromSeed } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { makeTeams, parsePeople, teamsToText, type TeamMode } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const people = persistedInput(
    'teams',
    'Ana\nLuis\nEva\nMarta\nPablo\nSara\nHugo\nLucía',
    remember,
  );
  const modeStore = persistedInput('teams-mode', 'count', remember);
  const nStore = persistedInput('teams-n', '2', remember);

  let seed = $state('');
  let prefix = $state('');
  let nonce = $state(0);
  let mounted = $state(false);
  onMount(() => (mounted = true));

  const mode = $derived<TeamMode>(modeStore.value === 'size' ? 'size' : 'count');
  const n = $derived(Number(nStore.value));
  const list = $derived(parsePeople(people.value));
  const result = $derived.by(() => {
    void nonce;
    return makeTeams(rngFromSeed(seed), list, mode, n);
  });
  // Without a seed the order is random, so the per-person membership is only drawn in the
  // browser. The team count itself does not depend on the shuffle, so it stays pure and is
  // correct in the server-rendered HTML too.
  const teams = $derived(mounted && result.ok ? result.teams : []);
  const teamCount = $derived(result.ok ? result.teams.length : 0);
  const name = $derived(prefix.trim() || s.prefixDefault);
  const error = $derived.by(() => {
    if (result.ok) return undefined;
    if (result.reason === 'few') return s.few;
    if (result.reason === 'n')
      return fill(s.nInvalid, { label: mode === 'count' ? s.count : s.size });
    return fill(s.tooMany, { p: result.people, k: result.teams });
  });
  const balanced = $derived.by(() => {
    if (!result.ok || mode !== 'size' || result.teams.length < 2 || list.length % n === 0)
      return '';
    const sizes = new Intl.ListFormat(locale, { type: 'conjunction' }).format(
      result.teams.map((team) => String(team.length)),
    );
    return fill(s.balanced, { p: list.length, n, k: result.teams.length, sizes });
  });
</script>

<div class="panel">
  <Field id="teams-people" label={s.people} help={s.peopleHelp}>
    {#snippet children({ describedby })}
      <TextArea
        id="teams-people"
        bind:value={people.value}
        rows={8}
        mono={false}
        {describedby}
        invalid={!result.ok && result.reason === 'few'}
      />
    {/snippet}
  </Field>

  <div class="row">
    <div class="stack tight">
      <span class="label">{s.mode}</span>
      <Segmented
        label={s.mode}
        options={[
          { value: 'count', label: s.count },
          { value: 'size', label: s.size },
        ]}
        bind:value={() => mode, (v) => (modeStore.value = v)}
      />
    </div>
    <Field id="teams-n" label={mode === 'count' ? s.count : s.size}>
      {#snippet children({ describedby })}
        <NumberInput
          id="teams-n"
          bind:value={() => n, (v) => (nStore.value = String(v))}
          min={1}
          max={1000}
          {describedby}
        />
      {/snippet}
    </Field>
  </div>

  <div class="row">
    <div class="grow">
      <Field id="teams-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
        {#snippet children({ describedby })}
          <input
            id="teams-seed"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            bind:value={seed}
          />
        {/snippet}
      </Field>
    </div>
    <div class="grow">
      <Field id="teams-prefix" label={s.prefix}>
        {#snippet children({ describedby })}
          <input
            id="teams-prefix"
            class="control"
            type="text"
            autocomplete="off"
            placeholder={s.prefixDefault}
            aria-describedby={describedby}
            bind:value={prefix}
          />
        {/snippet}
      </Field>
    </div>
    <Button variant="primary" icon="refresh-cw" disabled={!result.ok} onclick={() => nonce++}
      >{s.make}</Button
    >
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <span>{error ?? fill(s.summary, { n: list.length, k: teamCount })}</span>
    {/snippet}
    {#if teams.length}
      <div class="teams">
        {#each teams as team, i (i)}
          <section class="team" aria-label="{name} {i + 1}">
            <h3>{name} {i + 1} <span class="size">({team.length})</span></h3>
            <ul>
              {#each team as person, j (j)}<li>{person}</li>{/each}
            </ul>
          </section>
        {/each}
      </div>
    {/if}
    {#if balanced}<p class="display-note">{balanced}</p>{/if}
  </Display>

  <div class="row">
    <CopyButton main value={teamsToText(teams, name)} {locale} label={s.copyAll} />
  </div>

  <Toggle
    bind:checked={
      () => people.remember,
      (v) => {
        people.remember = v;
        modeStore.remember = v;
        nStore.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .tight {
    gap: 8px;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .grow {
    flex: 1 1 200px;
    max-width: 320px;
  }
  .teams {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
    gap: 16px;
  }
  .team h3 {
    margin-bottom: 6px;
    font: 600 14px/1.3 var(--font-body);
    text-shadow: none;
  }
  .size {
    font-weight: 400;
    color: var(--disp-dim);
  }
  .team ul {
    margin: 0;
    padding-left: 1.1em;
    font: 500 14px/1.6 var(--font-mono);
  }
</style>
