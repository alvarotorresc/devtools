<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    contrastRatio,
    formatHsl,
    formatOklch,
    formatRgb,
    hexToRgb,
    hslToRgb,
    oklchToRgb,
    parseHsl,
    parseOklch,
    parseRgb,
    rgbToHex,
    rgbToHsl,
    rgbToOklch,
    wcagLevels,
    type Level,
    type Rgb,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type FieldId = 'hex' | 'rgb' | 'hsl' | 'oklch';
  const FIELDS: FieldId[] = ['hex', 'rgb', 'hsl', 'oklch'];

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // The canonical colour is a HEX string, which is also what gets remembered.
  const color = persistedInput('color', '#58a6ff', meta.rememberInput ?? true);

  const DEFAULT: Rgb = [88, 166, 255];
  const rgb: Rgb = $derived(hexToRgb(color.value) ?? DEFAULT);
  const hex = $derived(rgbToHex(...rgb));

  function textsFor(c: Rgb): Record<FieldId, string> {
    return {
      hex: rgbToHex(...c),
      rgb: formatRgb(c),
      hsl: formatHsl(rgbToHsl(...c)),
      oklch: formatOklch(rgbToOklch(...c)),
    };
  }

  // Filled from the default colour so the server-rendered page already shows values.
  let texts = $state<Record<FieldId, string>>(textsFor(DEFAULT));
  let invalid = $state<Record<FieldId, boolean>>({
    hex: false,
    rgb: false,
    hsl: false,
    oklch: false,
  });
  let clipped = $state(false);

  const current = $derived(textsFor(rgb));
  const formatted = (field: FieldId) => current[field];

  /** Rewrites every field from the canonical colour, except the one being typed in. */
  function sync(except: FieldId | null) {
    for (const f of FIELDS) {
      if (f !== except) {
        texts[f] = formatted(f);
        invalid[f] = false;
      }
    }
  }

  // Runs after persistedInput's own onMount, so a remembered colour is already loaded.
  onMount(() => sync(null));

  function setRgb(next: Rgb, source: FieldId | null) {
    color.value = rgbToHex(...next);
    sync(source);
  }

  function onField(field: FieldId, value: string) {
    texts[field] = value;
    let next: Rgb | null = null;
    clipped = false;
    if (field === 'hex') next = hexToRgb(value);
    else if (field === 'rgb') next = parseRgb(value);
    else if (field === 'hsl') {
      const h = parseHsl(value);
      next = h ? hslToRgb(...h) : null;
    } else {
      const o = parseOklch(value);
      if (o) {
        const r = oklchToRgb(o.l, o.c, o.h);
        next = r.rgb;
        clipped = !r.inGamut;
      }
    }
    invalid[field] = next === null;
    if (next) setRgb(next, field);
  }

  const errors: Record<FieldId, 'invalidHex' | 'invalidRgb' | 'invalidHsl' | 'invalidOklch'> = {
    hex: 'invalidHex',
    rgb: 'invalidRgb',
    hsl: 'invalidHsl',
    oklch: 'invalidOklch',
  };

  const contrast = $derived([
    { id: 'white', label: s.onWhite, bg: 'white', ratio: contrastRatio(rgb, [255, 255, 255]) },
    { id: 'black', label: s.onBlack, bg: 'black', ratio: contrastRatio(rgb, [0, 0, 0]) },
  ]);
  const levelText = (l: Level) => (l === 'fail' ? s.fail : l);
</script>

<div class="panel">
  <div class="top">
    <label class="picker">
      <span class="visually-hidden">{s.picker}</span>
      <input
        type="color"
        value={hex}
        oninput={(e) => {
          clipped = false;
          const next = hexToRgb(e.currentTarget.value);
          if (next) setRgb(next, null);
        }}
      />
    </label>
    <div
      class="swatch"
      style:background-color={hex}
      role="img"
      aria-label="{s.preview}: {hex}"
    ></div>
  </div>

  <div class="fields">
    {#each FIELDS as f (f)}
      <Field id="color-{f}" label={s[f]} error={invalid[f] ? s[errors[f]] : undefined}>
        {#snippet children({ describedby })}
          <div class="with-copy">
            <input
              id="color-{f}"
              class="control mono"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={invalid[f]}
              value={texts[f]}
              oninput={(e) => onField(f, e.currentTarget.value)}
              onblur={() => {
                if (!invalid[f]) texts[f] = formatted(f);
              }}
            />
            <CopyButton value={formatted(f)} {locale} compact main={f === 'hex'} />
          </div>
        {/snippet}
      </Field>
    {/each}
  </div>
  {#if clipped}<p class="note" role="status">{s.outOfGamut}</p>{/if}

  <Display live label={s.contrast}>
    {#snippet head()}
      <span>{s.contrast}</span>
    {/snippet}
    <div class="contrast">
      {#each contrast as c (c.id)}
        {@const levels = wcagLevels(c.ratio)}
        <div class="pair">
          <div class="sample" style:background-color={c.bg} style:color={hex}>{s.sample}</div>
          <div class="verdict">
            <strong>{c.label}</strong>
            <span>{fill(s.ratio, { r: c.ratio.toFixed(2) })}</span>
            <Led
              state={levels.normal === 'fail' ? 'bad' : 'ok'}
              label="{s.normal}: {levelText(levels.normal)}"
            />
            <Led
              state={levels.large === 'fail' ? 'bad' : 'ok'}
              label="{s.large}: {levelText(levels.large)}"
            />
          </div>
        </div>
      {/each}
    </div>
  </Display>

  <Toggle bind:checked={color.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .top {
    display: flex;
    gap: 16px;
    align-items: stretch;
  }
  .picker input {
    width: 88px;
    height: 88px;
    padding: 0;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    background: var(--raised);
    cursor: pointer;
  }
  .swatch {
    flex: 1;
    min-height: 88px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
  }
  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
    gap: 16px;
  }
  .with-copy {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
  }
  .contrast {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .pair {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .sample {
    padding: 16px;
    border-radius: var(--radius);
    font: 600 20px/1.2 var(--font-body);
  }
  .verdict {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
  }
</style>
