<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { TOAST_EVENT, type ToastDetail } from '../lib/toast';
  import Icon from '../ui/Icon.svelte';

  let current: (ToastDetail & { id: number }) | null = $state(null);
  let reduce = $state(false);
  let seq = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      current = { ...detail, id: ++seq };
      clearTimeout(timer);
      timer = setTimeout(() => (current = null), 1600);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  });
</script>

<div class="toaster" role="status" aria-live="polite">
  {#if current}
    {#key current.id}
      <div
        class="toast {current.kind}"
        transition:fly={{ y: reduce ? 0 : 8, duration: reduce ? 0 : 180 }}
      >
        <Icon name={current.kind === 'ok' ? 'check' : 'x'} size={16} />
        {current.message}
      </div>
    {/key}
  {/if}
</div>

<style>
  .toaster {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 80;
    pointer-events: none;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: min(420px, calc(100vw - 32px));
    padding: 12px 16px;
    background: var(--text);
    color: var(--bg);
    border-radius: var(--radius);
    font: 600 14px/1.3 var(--font-body);
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.25);
  }
  .toast.bad {
    background: var(--bad);
    color: var(--on-accent);
  }
  @media (max-width: 599px) {
    .toaster {
      right: 16px;
      left: 16px;
      bottom: 16px;
      display: flex;
      justify-content: center;
    }
  }
</style>
