<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { IconName } from '../tools/icon-names';
  import Icon from './Icon.svelte';

  type Props = HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
    icon?: IconName;
    label?: string;
    children?: Snippet;
  };

  let { variant = 'secondary', icon, label, children, type = 'button', ...rest }: Props = $props();
</script>

<button
  {type}
  class="btn {variant}"
  aria-label={variant === 'icon' ? label : undefined}
  title={variant === 'icon' ? label : undefined}
  {...rest}
>
  {#if icon}<Icon name={icon} size={16} />{/if}
  {#if children}{@render children()}{/if}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 18px;
    border: 1px solid transparent;
    border-radius: var(--radius-pill);
    font: 600 14px/1 var(--font-body);
    cursor: pointer;
    white-space: nowrap;
    transition:
      transform 120ms ease-out,
      background-color 200ms,
      color 200ms,
      border-color 200ms;
  }
  .btn:active:not(:disabled) {
    transform: scale(0.97);
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .primary {
    background: var(--accent);
    color: var(--on-accent);
    box-shadow: inset 0 -2px 0 rgb(0 0 0 / 0.18);
  }
  .secondary {
    background: var(--raised);
    color: var(--text);
    border-color: var(--border-strong);
  }
  .ghost {
    background: transparent;
    color: var(--text-dim);
  }
  .ghost:hover,
  .icon:hover {
    color: var(--text);
  }
  .icon {
    width: 44px;
    padding: 0;
    border-radius: var(--radius);
    background: var(--raised);
    color: var(--text-dim);
    border-color: var(--border);
  }
</style>
