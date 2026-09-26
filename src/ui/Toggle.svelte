<script lang="ts">
  let {
    checked = $bindable(),
    label,
    onchange,
  }: { checked: boolean; label: string; onchange?: (v: boolean) => void } = $props();
</script>

<label class="toggle">
  <input type="checkbox" role="switch" bind:checked onchange={() => onchange?.(checked)} />
  <span class="track" aria-hidden="true"><span class="knob"></span></span>
  <span>{label}</span>
</label>

<style>
  .toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    font-size: 14px;
    cursor: pointer;
  }
  input {
    position: absolute;
    inset: 0;
    /* Above the positioned .track, so pointer events land on the input itself. */
    z-index: 1;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }
  .track {
    position: relative;
    width: 40px;
    height: 24px;
    flex-shrink: 0;
    background: var(--well);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-pill);
    box-shadow: var(--inset);
    transition: background-color 200ms;
  }
  .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    background: var(--text-dim);
    border-radius: var(--radius-pill);
    transition:
      transform 200ms var(--ease),
      background-color 200ms;
  }
  input:checked + .track {
    background: var(--accent);
    border-color: var(--accent);
  }
  input:checked + .track .knob {
    transform: translateX(16px);
    background: var(--on-accent);
  }
  input:focus-visible + .track {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>
