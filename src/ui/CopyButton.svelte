<script lang="ts">
  import { t } from '../i18n';
  import { copyText } from '../lib/clipboard';
  import { toast, truncate } from '../lib/toast';
  import type { Locale } from '../tools/types';
  import Icon from './Icon.svelte';

  let {
    value,
    locale,
    main = false,
    compact = false,
    label,
  }: {
    value: string | (() => string);
    locale: Locale;
    main?: boolean;
    compact?: boolean;
    label?: string;
  } = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const resolved = $derived(typeof value === 'function' ? '' : value);
  const disabled = $derived(typeof value === 'string' && value === '');

  async function copy() {
    const text = typeof value === 'function' ? value() : value;
    if (!text) return;
    const ok = await copyText(text);
    if (!ok) {
      toast(t(locale, 'ui.copyFailed'), 'bad');
      return;
    }
    copied = true;
    toast(t(locale, 'ui.copiedValue', { v: truncate(text) }));
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1600);
  }
</script>

<button
  type="button"
  class="copy"
  class:compact
  class:copied
  {disabled}
  onclick={copy}
  data-copy-main={main ? '' : undefined}
  aria-label={compact ? `${label ?? t(locale, 'ui.copy')} ${resolved}`.trim() : undefined}
>
  <Icon name={copied ? 'check' : 'copy'} size={16} />
  <span>{copied ? t(locale, 'ui.copied') : (label ?? t(locale, 'ui.copy'))}</span>
</button>

<style>
  .copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 16px;
    background: var(--raised);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-pill);
    font: 600 14px/1 var(--font-body);
    cursor: pointer;
    transition:
      transform 120ms ease-out,
      color 200ms,
      border-color 200ms;
  }
  .copy:active:not(:disabled) {
    transform: scale(0.97);
  }
  .copy:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .compact {
    min-height: 36px;
    min-width: 96px;
    padding: 0 12px;
    background: transparent;
    color: var(--disp-dim);
    border-color: var(--disp-line);
    font-size: 13px;
  }
  @media (pointer: coarse) {
    .compact {
      min-height: 44px;
    }
  }
  .copied {
    color: var(--ok);
    border-color: var(--ok);
  }
</style>
