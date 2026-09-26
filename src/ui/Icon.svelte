<script lang="ts">
  import type { IconName } from '../tools/icon-names';
  import { icons } from '../tools/icons';

  let {
    name,
    size = 18,
    class: cls = '',
  }: { name: IconName; size?: number; class?: string } = $props();
  const Cmp = $derived(icons[name]);
</script>

<Cmp {size} strokeWidth={1.8} class={cls} aria-hidden="true" />
