<script lang="ts" generics="T extends string">
  let {
    id,
    value = $bindable(),
    options,
    describedby,
  }: {
    id: string;
    value: T;
    options: { value: T; label: string }[];
    describedby?: string;
  } = $props();
</script>

<select {id} bind:value class="control" aria-describedby={describedby}>
  {#each options as o (o.value)}
    <option value={o.value}>{o.label}</option>
  {/each}
</select>

<style>
  select {
    width: auto;
    min-width: 160px;
    cursor: pointer;
  }
</style>
