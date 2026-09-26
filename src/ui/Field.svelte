<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    id,
    label,
    help,
    error,
    children,
  }: {
    id: string;
    label: string;
    help?: string;
    error?: string;
    children: Snippet<[{ describedby: string | undefined }]>;
  } = $props();

  const describedby = $derived(
    [help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined,
  );
</script>

<div class="field">
  <label for={id}>{label}</label>
  {@render children({ describedby })}
  {#if help}<p class="help" id="{id}-help">{help}</p>{/if}
  {#if error}<p class="error" id="{id}-error">{error}</p>{/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  label {
    font-size: 13px;
    font-weight: 600;
  }
  .help {
    font-size: 13px;
    color: var(--text-dim);
  }
  .error {
    font-size: 13px;
    font-weight: 600;
    color: var(--bad);
  }
</style>
