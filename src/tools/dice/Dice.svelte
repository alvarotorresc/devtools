<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { plural } from '../../lib/plural';
  import { rngFromSeed } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    countCoins,
    diceRange,
    flipCoins,
    formatSpec,
    LIMITS,
    parseDice,
    pushHistory,
    QUICK_SIDES,
    rollDice,
    type Coin,
    type Roll,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const notation = persistedInput('dice', '3d6', remember);
  const coinsStore = persistedInput('dice-coins', '1', remember);

  let tab = $state<'dice' | 'coin'>('dice');
  let seed = $state('');
  // One generator per seed: with a seed, the whole series of rolls can be repeated.
  const rng = $derived(rngFromSeed(seed));
  let roll = $state<Roll | null>(null);
  let coins = $state<Coin[] | null>(null);
  let history = $state<string[]>([]);

  const parsed = $derived(parseDice(notation.value));
  const error = $derived.by(() => {
    if (parsed.ok) return undefined;
    if (parsed.reason === 'format') return s.format;
    const key = parsed.reason === 'modifier' ? 'modifierRange' : parsed.reason;
    return fill(s[key], { v: parsed.value });
  });
  const nCoins = $derived(
    Math.min(LIMITS.coins[1], Math.max(LIMITS.coins[0], Number(coinsStore.value) || 1)),
  );
  const coinCount = $derived(coins ? countCoins(coins) : null);
  const coinCountText = (heads: number, tails: number) =>
    `${plural(locale, heads, s.headsOne, s.headsOther)} · ${plural(locale, tails, s.tailsOne, s.tailsOther)}`;
  const coinText = $derived(coinCount ? coinCountText(coinCount.heads, coinCount.tails) : '');

  function doRoll() {
    if (!parsed.ok) return;
    roll = rollDice(rng, parsed.spec);
    history = pushHistory(history, `${formatSpec(roll.spec)} → ${roll.total}`);
  }

  function doFlip() {
    coins = flipCoins(rng, nCoins);
    const c = countCoins(coins);
    history = pushHistory(history, coinCountText(c.heads, c.tails));
  }

  const headline = $derived.by(() => {
    if (tab === 'dice') return roll ? `${formatSpec(roll.spec)} → ${roll.total}` : s.idle;
    return coins ? coinText : s.idle;
  });

  const modText = (m: number) => (m > 0 ? `+${m}` : m < 0 ? `−${-m}` : '0');
</script>

<div class="stack">
  <Segmented
    main
    label={s.tabs}
    options={[
      { value: 'dice', label: meta.tabs![locale][0] },
      { value: 'coin', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'dice'}
      <div class="row">
        <div class="grow">
          <Field id="dice-notation" label={s.notation} help={s.notationHelp} {error}>
            {#snippet children({ describedby })}
              <input
                id="dice-notation"
                class="control mono"
                type="text"
                autocomplete="off"
                spellcheck="false"
                aria-describedby={describedby}
                aria-invalid={!!error}
                bind:value={notation.value}
                onkeydown={(e) => {
                  if (e.key === 'Enter') doRoll();
                }}
              />
            {/snippet}
          </Field>
        </div>
        <Button variant="primary" icon="dice-5" disabled={!parsed.ok} onclick={doRoll}
          >{s.roll}</Button
        >
      </div>
      <div class="quick" role="group" aria-label={s.quick}>
        {#each QUICK_SIDES as m (m)}
          <Button onclick={() => (notation.value = `1d${m}`)}>d{m}</Button>
        {/each}
      </div>
    {:else}
      <div class="row">
        <Field id="dice-coins" label={s.coins}>
          {#snippet children({ describedby })}
            <NumberInput
              id="dice-coins"
              bind:value={() => nCoins, (v) => (coinsStore.value = String(v))}
              min={LIMITS.coins[0]}
              max={LIMITS.coins[1]}
              {describedby}
            />
          {/snippet}
        </Field>
        <Button variant="primary" icon="refresh-cw" onclick={doFlip}>{s.flip}</Button>
      </div>
    {/if}

    <div class="seed">
      <Field id="dice-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
        {#snippet children({ describedby })}
          <input
            id="dice-seed"
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

    <Display live label={s.result}>
      {#snippet head()}
        <span>{headline}</span>
      {/snippet}
      {#if tab === 'dice' && roll}
        {@const range = diceRange(roll.spec)}
        <div class="dice">
          {#each roll.dice as d, i (i)}<span class="die">{d}</span>{/each}
        </div>
        <div class="display-value" id="dice-total">{roll.total}</div>
        <dl class="display-kv">
          <dt>{s.sum}</dt>
          <dd>{roll.sum}</dd>
          <dt>{s.modifier}</dt>
          <dd>{modText(roll.spec.modifier)}</dd>
        </dl>
        <p class="display-note">{fill(s.range, range)}</p>
      {:else if tab === 'coin' && coins}
        <div class="dice">
          {#each coins as c, i (i)}<span class="die coin">{c === 'heads' ? s.heads : s.tails}</span
            >{/each}
        </div>
        <div class="display-value" id="dice-coin-count">{coinText}</div>
      {/if}
      {#if history.length}
        <p class="display-note">{s.history}</p>
        <ol class="history">
          {#each history as h, i (i)}<li>{h}</li>{/each}
        </ol>
      {/if}
    </Display>

    <div class="row">
      <CopyButton
        main
        value={tab === 'dice' ? (roll ? String(roll.total) : '') : coinText}
        {locale}
      />
    </div>

    <Toggle
      bind:checked={
        () => notation.remember,
        (v) => {
          notation.remember = v;
          coinsStore.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .grow {
    flex: 1 1 200px;
    max-width: 320px;
  }
  .seed {
    max-width: 320px;
  }
  .quick {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .dice {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .die {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0 8px;
    border: 1px solid var(--disp-line);
    border-radius: var(--radius);
    font: 600 17px/1 var(--font-mono);
  }
  .coin {
    font-size: 14px;
  }
  .history {
    margin: 0;
    padding-left: 1.4em;
    font: 400 13.5px/1.6 var(--font-mono);
    color: var(--disp-dim);
  }
</style>
