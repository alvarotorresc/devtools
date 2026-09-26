<script lang="ts">
  let {
    id,
    value = $bindable(),
    min,
    max,
    step = 1,
    describedby,
  }: {
    id: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    describedby?: string;
  } = $props();

  function clamp() {
    const n = Number.isFinite(value) ? Math.round(value / step) * step : min;
    value = Math.min(max, Math.max(min, n));
  }
</script>

<input
  {id}
  type="number"
  inputmode="numeric"
  bind:value
  {min}
  {max}
  {step}
  onblur={clamp}
  class="control mono"
  aria-describedby={describedby}
/>

<style>
  input {
    width: 112px;
  }
</style>
