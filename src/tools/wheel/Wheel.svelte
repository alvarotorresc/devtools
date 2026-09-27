<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { plural } from '../../lib/plural';
  import { cryptoRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    checkOptions,
    fitLabel,
    MAX_OPTIONS,
    MAX_SECONDS,
    mod,
    parseOptions,
    planSpin,
    pushHistory,
    removeOption,
    settled,
    STEP,
    stepSpring,
    TAU,
    type Spring,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const list = persistedInput('wheel', 'Ana\nLuis\nEva\nMarta', meta.rememberInput ?? true);

  const options = $derived(parseOptions(list.value));
  const problem = $derived(checkOptions(options));
  const error = $derived(
    problem === 'few'
      ? s.few
      : problem === 'many'
        ? fill(s.many, { n: options.length })
        : undefined,
  );

  let spinning = $state(false);
  let removeWinner = $state(false);
  let result = $state<string | null>(null);
  let winnerIndex = $state<number | null>(null);
  let history = $state<string[]>([]);
  let size = $state(0);
  let wrap = $state<HTMLDivElement>();
  let canvas = $state<HTMLCanvasElement>();

  // Not reactive on purpose: the animation writes it 60+ times per second and only paint() reads it.
  let theta = 0;
  let raf = 0;
  // The wheel is drawn once at rotation 0; each frame only rotates and copies it (drawImage).
  let wheelImage: HTMLCanvasElement | null = null;
  let pointerColor = '';
  let borderColor = '';

  /** Colours come from the theme tokens, read again on every full repaint. */
  function palette() {
    const cs = getComputedStyle(document.documentElement);
    const v = (name: string) => cs.getPropertyValue(name).trim();
    return {
      fills: [v('--raised'), v('--well'), v('--surface')],
      text: v('--text'),
      border: v('--border-strong'),
      accent: v('--accent'),
      onAccent: v('--on-accent'),
      font: v('--font-body'),
    };
  }

  function renderWheel(opts: string[], highlight: number | null) {
    const dpr = window.devicePixelRatio || 1;
    const px = Math.round(size * dpr);
    const off = document.createElement('canvas');
    off.width = px;
    off.height = px;
    const ctx = off.getContext('2d');
    if (!ctx) return;
    const c = palette();
    pointerColor = c.text;
    borderColor = c.border;
    const center = px / 2;
    const r = center - 2 * dpr;
    const n = Math.max(1, opts.length);
    const step = TAU / n;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, r, i * step, (i + 1) * step);
      ctx.closePath();
      // Three alternating fills; the last sector never matches the first one.
      const k = n % 3 === 1 && i === n - 1 && n > 1 ? 1 : i % 3;
      ctx.fillStyle = i === highlight ? c.accent : c.fills[k];
      ctx.fill();
      ctx.strokeStyle = c.border;
      ctx.lineWidth = dpr;
      ctx.stroke();
    }
    // Labels are hidden when a sector is less than 10px tall; the text list stays the source.
    if (opts.length && step * r * 0.75 >= 10 * dpr) {
      const fontPx = Math.max(11, Math.min(16, (step * r * 0.45) / dpr)) * dpr;
      ctx.font = `600 ${fontPx}px ${c.font}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < opts.length; i++) {
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate((i + 0.5) * step);
        ctx.fillStyle = i === highlight ? c.onAccent : c.text;
        const label = fitLabel(opts[i], r * 0.62, (txt) => ctx.measureText(txt).width);
        ctx.fillText(label, r - 14 * dpr, 0);
        ctx.restore();
      }
    }
    ctx.beginPath();
    ctx.arc(center, center, r * 0.07, 0, TAU);
    ctx.fillStyle = c.accent;
    ctx.fill();
    wheelImage = off;
  }

  function paint() {
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !wheelImage) return;
    const px = canvas.width;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, px, px);
    ctx.save();
    ctx.translate(px / 2, px / 2);
    ctx.rotate(theta);
    ctx.drawImage(wheelImage, -px / 2, -px / 2);
    ctx.restore();
    // The pointer: a triangle at the top, pointing down into the wheel. It uses --text, not
    // --accent, so it stays visible over the highlighted (accent) winner.
    ctx.beginPath();
    ctx.moveTo(px / 2 - 12 * dpr, 1 * dpr);
    ctx.lineTo(px / 2 + 12 * dpr, 1 * dpr);
    ctx.lineTo(px / 2, 24 * dpr);
    ctx.closePath();
    ctx.fillStyle = pointerColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = dpr;
    ctx.stroke();
  }

  function redraw() {
    if (!canvas || size === 0) return;
    const px = Math.round(size * (window.devicePixelRatio || 1));
    canvas.width = px;
    canvas.height = px;
    renderWheel(options.slice(0, MAX_OPTIONS), winnerIndex);
    paint();
  }

  // Repaint on resize and on theme change; both observers go away with the component.
  $effect(() => {
    if (!wrap) return;
    const el = wrap;
    const ro = new ResizeObserver(() => (size = Math.min(400, el.clientWidth)));
    ro.observe(el);
    const mo = new MutationObserver(() => redraw());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  });

  // Editing the options invalidates any current highlight: the index might now point at a
  // different option, or at nothing at all. Declared before the repaint effect below so it
  // settles winnerIndex first and the repaint only ever runs once per change.
  $effect(() => {
    void options;
    winnerIndex = null;
  });

  // Full repaint when the options, the size or the highlighted winner change.
  $effect(() => {
    void options;
    void size;
    void winnerIndex;
    untrack(redraw);
  });

  async function spin() {
    if (spinning || problem) return;
    const frozen = [...options];
    const plan = planSpin(cryptoRng(), theta, frozen.length);
    winnerIndex = null;
    result = null;

    const finish = () => {
      theta = mod(plan.target, TAU);
      spinning = false;
      const winner = frozen[plan.winner];
      result = winner;
      history = pushHistory(history, winner);
      if (removeWinner) {
        list.value = removeOption(list.value, winner);
        winnerIndex = null;
      } else {
        winnerIndex = plan.winner;
      }
      redraw();
    };

    // With reduced motion there is no spin: the wheel jumps to the result. Flagging `spinning`
    // and awaiting a tick first forces the live region through a distinct "Girando…" state, so
    // a result that repeats the previous winner still changes the DOM and gets announced.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      spinning = true;
      await tick();
      finish();
      return;
    }

    spinning = true;
    let st: Spring = { theta, omega: 0 };
    let acc = 0;
    let elapsed = 0;
    let last = performance.now();
    const frame = (now: number) => {
      // Fixed 1/120 s steps, whatever the display's refresh rate.
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      while (acc >= STEP) {
        st = stepSpring(st, plan.target, STEP);
        acc -= STEP;
        elapsed += STEP;
      }
      theta = st.theta;
      if (settled(st, plan.target) || elapsed >= MAX_SECONDS) {
        raf = 0;
        finish();
        return;
      }
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  // Leaving the page mid-spin stops the animation. `raf` is 0 during SSR, where onDestroy also runs.
  onDestroy(() => {
    if (raf) cancelAnimationFrame(raf);
  });
</script>

<div class="panel">
  <div class="layout">
    <div class="wheel" bind:this={wrap}>
      <canvas bind:this={canvas} aria-hidden="true" style:width="{size}px" style:height="{size}px"
      ></canvas>
    </div>

    <div class="stack side">
      <!-- A disabled fieldset disables every control inside it while the wheel spins. -->
      <fieldset class="plain" disabled={spinning}>
        <Field id="wheel-options" label={s.options} help={s.optionsHelp} {error}>
          {#snippet children({ describedby })}
            <TextArea
              id="wheel-options"
              bind:value={list.value}
              rows={8}
              mono={false}
              {describedby}
              invalid={!!error}
            />
          {/snippet}
        </Field>
        <Toggle bind:checked={removeWinner} label={s.removeWinner} />
      </fieldset>
      <div class="row">
        <Button variant="primary" icon="refresh-cw" onclick={spin} disabled={spinning || !!problem}
          >{s.spin}</Button
        >
        <span class="count">{plural(locale, options.length, s.countOne, s.countOther)}</span>
      </div>
    </div>
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <span>{result ? fill(s.winner, { v: result }) : spinning ? s.spinning : s.idle}</span>
    {/snippet}
    {#if result}<div class="display-value">{result}</div>{/if}
    {#if history.length}
      <p class="display-note">{s.history}</p>
      <ol class="history">
        {#each history as h, i (i)}<li>{h}</li>{/each}
      </ol>
    {/if}
  </Display>

  <Toggle bind:checked={list.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 720px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .wheel {
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1;
  }
  canvas {
    display: block;
  }
  .side {
    min-width: 0;
  }
  .plain {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .count {
    font-size: 13px;
    color: var(--text-dim);
  }
  .history {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin: 0;
    padding-left: 1.2em;
    font: 500 14px/1.4 var(--font-mono);
  }
</style>
