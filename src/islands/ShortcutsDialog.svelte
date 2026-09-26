<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../i18n';
  import {
    getSingleKeys,
    setSingleKeys,
    SHORTCUT_EVENT,
    type ShortcutAction,
  } from '../lib/shortcuts';
  import type { Locale } from '../tools/types';
  import Toggle from '../ui/Toggle.svelte';

  let { locale }: { locale: Locale } = $props();
  let dialog: HTMLDialogElement;
  let singleKeys = $state(true);

  const rows = $derived([
    { keys: ['Ctrl K', '/'], label: t(locale, 'shortcuts.search') },
    { keys: ['c'], label: t(locale, 'shortcuts.copy') },
    { keys: ['1 … 9'], label: t(locale, 'shortcuts.tabs') },
    { keys: ['?'], label: t(locale, 'shortcuts.help') },
  ]);

  onMount(() => {
    const on = (e: Event) => {
      if ((e as CustomEvent<ShortcutAction>).detail.type === 'help' && !dialog.open) open();
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-open-help]')) open();
    };
    document.addEventListener('click', onClick);
    window.addEventListener(SHORTCUT_EVENT, on);
    return () => {
      window.removeEventListener(SHORTCUT_EVENT, on);
      document.removeEventListener('click', onClick);
    };
  });

  function open() {
    singleKeys = getSingleKeys();
    dialog.showModal();
  }
</script>

<dialog
  bind:this={dialog}
  class="help"
  aria-labelledby="help-title"
  onclick={(e) => e.target === dialog && dialog.close()}
>
  <h2 id="help-title">{t(locale, 'shortcuts.title')}</h2>
  <dl>
    {#each rows as r (r.label)}
      <dt>
        {#each r.keys as k (k)}<kbd>{k}</kbd>{/each}
      </dt>
      <dd>{r.label}</dd>
    {/each}
  </dl>
  <Toggle
    bind:checked={singleKeys}
    label={t(locale, 'shortcuts.singleKeys')}
    onchange={setSingleKeys}
  />
  <form method="dialog"><button class="close">{t(locale, 'shortcuts.close')}</button></form>
</dialog>

<style>
  .help {
    width: min(440px, calc(100vw - 32px));
    padding: 24px;
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
  }
  .help::backdrop {
    background: rgb(0 0 0 / 0.5);
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 12px 20px;
    margin: 20px 0;
    align-items: center;
  }
  dt {
    display: flex;
    gap: 6px;
  }
  dd {
    margin: 0;
    color: var(--text-dim);
  }
  kbd {
    padding: 2px 8px;
    font: 12px var(--font-mono);
    border: 1px solid var(--border-strong);
    border-radius: 6px;
  }
  .close {
    min-height: 44px;
    padding: 0 18px;
    background: var(--raised);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-weight: 600;
  }
</style>
