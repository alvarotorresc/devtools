<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { navigate } from 'astro:transitions/client';
  import { t } from '../i18n';
  import { getFavorites, getRecent } from '../lib/prefs';
  import { search, type SearchDoc } from '../lib/search';
  import { SHORTCUT_EVENT, type ShortcutAction } from '../lib/shortcuts';
  import type { Locale, PaletteEntry } from '../tools/types';
  import Icon from '../ui/Icon.svelte';

  let { locale, entries, docs }: { locale: Locale; entries: PaletteEntry[]; docs: SearchDoc[] } =
    $props();

  let dialog: HTMLDialogElement;
  let input: HTMLInputElement;
  let query = $state('');
  let active = $state(0);
  let favorites: string[] = $state([]);
  let recent: string[] = $state([]);
  let returnFocus: HTMLElement | null = null;

  const byId = $derived(new Map(entries.map((e) => [e.id, e])));
  const pick = (ids: string[]) =>
    ids.map((id) => byId.get(id)).filter((e): e is PaletteEntry => !!e);

  const groups = $derived.by(() => {
    if (query.trim())
      return [{ title: t(locale, 'search.results'), items: pick(search(docs, query)) }];
    return [
      { title: t(locale, 'search.favorites'), items: pick(favorites) },
      {
        title: t(locale, 'search.recent'),
        items: pick(recent.filter((id) => !favorites.includes(id))),
      },
    ].filter((g) => g.items.length > 0);
  });
  const flat = $derived(groups.flatMap((g) => g.items));

  async function open(initial = '') {
    if (dialog.open) return;
    returnFocus = document.activeElement as HTMLElement | null;
    favorites = getFavorites();
    recent = getRecent();
    query = initial;
    active = 0;
    dialog.showModal();
    await tick();
    input.focus();
    input.setSelectionRange(query.length, query.length);
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  function go(entry: PaletteEntry | undefined) {
    if (!entry) return;
    close();
    navigate(entry.href);
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (flat.length === 0) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length;
      document.getElementById(`pal-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(flat[active]);
    }
  }

  onMount(() => {
    const onShortcut = (e: Event) => {
      const a = (e as CustomEvent<ShortcutAction>).detail;
      if (a.type === 'search') open(a.query ?? '');
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-open-search]')) open();
    };
    const onHomeInput = (e: Event) => {
      const el = e.target as HTMLInputElement;
      if (el.id !== 'home-search') return;
      const q = el.value;
      el.value = '';
      open(q);
    };
    window.addEventListener(SHORTCUT_EVENT, onShortcut);
    document.addEventListener('click', onClick);
    document.addEventListener('input', onHomeInput);
    return () => {
      window.removeEventListener(SHORTCUT_EVENT, onShortcut);
      document.removeEventListener('click', onClick);
      document.removeEventListener('input', onHomeInput);
    };
  });
</script>

<dialog
  bind:this={dialog}
  class="palette"
  aria-label={t(locale, 'search.placeholder')}
  onclose={() => returnFocus?.focus()}
  onclick={(e) => e.target === dialog && close()}
>
  <div class="box">
    <div class="search">
      <Icon name="search" size={20} />
      <input
        bind:this={input}
        bind:value={query}
        oninput={() => (active = 0)}
        {onkeydown}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="pal-list"
        aria-activedescendant={flat.length ? `pal-opt-${active}` : undefined}
        autocomplete="off"
        spellcheck="false"
        placeholder={t(locale, 'search.placeholder')}
        aria-label={t(locale, 'search.placeholder')}
        aria-autocomplete="list"
      />
      <kbd>Esc</kbd>
    </div>
    <div id="pal-list" role="listbox" class="list">
      {#if query.trim() && flat.length === 0}
        <p class="empty">{t(locale, 'search.empty', { q: query.trim() })}</p>
      {/if}
      {#each groups as g (g.title)}
        <p class="group">{g.title}</p>
        {#each g.items as item (item.id)}
          {@const i = flat.indexOf(item)}
          <a
            id="pal-opt-{i}"
            role="option"
            aria-selected={i === active}
            href={item.href}
            class="opt"
            onmousemove={() => (active = i)}
            onclick={(e) => {
              e.preventDefault();
              go(item);
            }}
          >
            <span class="opt-icon"><Icon name={item.icon} /></span>
            <span class="opt-name">{item.name}</span>
            <span class="opt-cat">{item.category}</span>
          </a>
        {/each}
      {/each}
    </div>
    <p class="hint">{t(locale, 'search.hint')}</p>
  </div>
</dialog>

<style>
  .palette {
    width: min(640px, calc(100vw - 32px));
    max-height: min(560px, calc(100dvh - 64px));
    margin: 12vh auto auto;
    padding: 0;
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    box-shadow: 0 24px 64px rgb(0 0 0 / 0.45);
  }
  .palette::backdrop {
    background: rgb(0 0 0 / 0.5);
  }
  .palette[open] {
    animation: dt-in 160ms var(--ease);
  }
  .box {
    display: flex;
    flex-direction: column;
    max-height: inherit;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 60px;
    border-bottom: 1px solid var(--border);
    color: var(--accent-text);
  }
  .search input {
    flex: 1;
    min-width: 0;
    height: 100%;
    background: transparent;
    border: 0;
    outline: none;
    color: var(--text);
    font: 17px var(--font-body);
  }
  kbd {
    padding: 2px 8px;
    font: 12px var(--font-mono);
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: 6px;
  }
  .list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  .group {
    padding: 10px 10px 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-dim);
  }
  .opt {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 0 10px;
    border-radius: var(--radius);
    color: var(--text);
    text-decoration: none;
  }
  .opt[aria-selected='true'] {
    background: var(--raised);
    box-shadow: inset 0 0 0 1px var(--border-strong);
  }
  .opt-icon {
    color: var(--accent-text);
    display: inline-flex;
  }
  .opt-name {
    flex: 1;
    font-weight: 600;
  }
  .opt-cat {
    font-size: 12.5px;
    color: var(--text-dim);
  }
  .empty,
  .hint {
    padding: 12px;
    font-size: 13px;
    color: var(--text-dim);
  }
  .hint {
    border-top: 1px solid var(--border);
  }
  @media (max-width: 599px) {
    .palette {
      margin-top: 16px;
    }
    .hint {
      display: none;
    }
  }
</style>
