<script lang="ts">
  import { untrack } from 'svelte';
  import JsonTree from './JsonTree.svelte';
  import { t } from '../../i18n';
  import { copyText } from '../../lib/clipboard';
  import { toast, truncate } from '../../lib/toast';
  import type { Locale } from '../types';
  import Icon from '../../ui/Icon.svelte';
  import { jsonPath, jsonType } from './logic';
  import { fill, strings } from './strings';

  let {
    value,
    locale,
    path = '$',
    name,
    depth = 0,
  }: { value: unknown; locale: Locale; path?: string; name?: string; depth?: number } = $props();

  const PAGE = 200;
  const s = $derived(strings[locale]);
  const type = $derived(jsonType(value));
  const container = $derived(type === 'object' || type === 'array');
  const entries = $derived.by((): [string | number, unknown][] => {
    if (type === 'array') return (value as unknown[]).map((v, i) => [i, v]);
    if (type === 'object') return Object.entries(value as Record<string, unknown>);
    return [];
  });
  // Only the initial depth decides whether a node starts expanded; the user toggles it afterwards.
  let open = $state(untrack(() => depth < 1));
  let limit = $state(PAGE);
  const shown = $derived(entries.slice(0, limit));
  const leaf = $derived(type === 'string' ? JSON.stringify(value) : String(value));

  async function copy(text: string) {
    if (!(await copyText(text))) {
      toast(t(locale, 'ui.copyFailed'), 'bad');
      return;
    }
    toast(truncate(text));
  }
</script>

<div class="jt-node">
  <div class="jt-line">
    {#if container}
      <button type="button" class="jt-toggle" aria-expanded={open} onclick={() => (open = !open)}>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={14} />
        {#if name !== undefined}<span class="jt-key">{name}</span>{/if}
        <span class="jt-meta"
          >{type === 'array' ? `[${entries.length}]` : `{${entries.length}}`}</span
        >
      </button>
    {:else}
      <span class="jt-spacer"></span>
      {#if name !== undefined}<span class="jt-key">{name}:</span>{/if}
      <span class="jt-val jt-{type}">{leaf}</span>
    {/if}
    <span class="jt-actions">
      <button
        type="button"
        class="jt-mini"
        aria-label="{s.copyPath} {path}"
        title={s.copyPath}
        onclick={() => copy(path)}
      >
        $
      </button>
      <button
        type="button"
        class="jt-mini"
        aria-label="{s.copyValue} {path}"
        title={s.copyValue}
        onclick={() =>
          copy(
            container ? JSON.stringify(value, null, 2) : type === 'string' ? String(value) : leaf,
          )}
      >
        <Icon name="copy" size={13} />
      </button>
    </span>
  </div>
  {#if container && open}
    <div class="jt-children">
      {#each shown as [k, v] (k)}
        <JsonTree value={v} {locale} path={jsonPath(path, k)} name={String(k)} depth={depth + 1} />
      {/each}
      {#if entries.length > limit}
        <button type="button" class="jt-more" onclick={() => (limit += PAGE)}>
          {fill(s.showMore, { n: Math.min(PAGE, entries.length - limit) })}
        </button>
      {/if}
    </div>
  {/if}
</div>

<!--
  No <style> here: the tree only renders after client-side parsing, so the SSR bundle tree-shakes
  this component and its scoped CSS never reaches the page. Its rules live in Json.svelte under .tree.
-->
