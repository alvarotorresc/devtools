<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    live = false,
    head,
    children,
  }: { label?: string; live?: boolean; head?: Snippet; children: Snippet } = $props();
</script>

<section class="display" aria-label={label}>
  {#if head}
    <!-- Only the short summary line is announced, never the whole (possibly huge) output. -->
    <div
      class="display-head"
      role={live ? 'status' : undefined}
      aria-live={live ? 'polite' : undefined}
    >
      {@render head()}
    </div>
  {/if}
  {@render children()}
</section>
