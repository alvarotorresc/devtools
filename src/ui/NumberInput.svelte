<script lang="ts">
  let {
    id,
    value = $bindable(),
    min,
    max,
    step = 1,
    describedby,
    ariaLabel,
  }: {
    id: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    describedby?: string;
    /** Overrides the accessible name, e.g. when an implicit `<label>` text is ambiguous. */
    ariaLabel?: string;
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
  aria-label={ariaLabel}
/>

<style>
  input {
    width: 112px;
  }
</style>
