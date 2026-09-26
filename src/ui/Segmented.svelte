<script lang="ts" generics="T extends string">
  let {
    options,
    value = $bindable(),
    label,
    main = false,
    onchange,
  }: {
    options: { value: T; label: string }[];
    value: T;
    label: string;
    main?: boolean;
    onchange?: (v: T) => void;
  } = $props();

  let buttons: HTMLButtonElement[] = $state([]);

  function select(v: T) {
    if (v === value) return;
    value = v;
    onchange?.(v);
  }

  function onkeydown(e: KeyboardEvent, i: number) {
    const d =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    select(options[n].value);
    buttons[n]?.focus();
  }
</script>

<div class="seg" role="radiogroup" aria-label={label} data-tabs-main={main ? '' : undefined}>
  {#each options as o, i (o.value)}
    <button
      bind:this={buttons[i]}
      type="button"
      role="radio"
      aria-checked={o.value === value}
      tabindex={o.value === value ? 0 : -1}
      onclick={() => select(o.value)}
      onkeydown={(e) => onkeydown(e, i)}>{o.label}</button
    >
  {/each}
</div>

<style>
  .seg {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    align-self: flex-start;
    background: var(--well);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    box-shadow: var(--inset);
  }
  button {
    min-height: 36px;
    padding: 0 16px;
    border: 0;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--text-dim);
    font: 600 14px/1 var(--font-body);
    cursor: pointer;
    transition:
      background-color 200ms,
      color 200ms;
  }
  button[aria-checked='true'] {
    background: var(--raised);
    color: var(--text);
    box-shadow:
      0 1px 2px rgb(0 0 0 / 0.25),
      inset 0 0 0 1px var(--border);
  }
  :global([data-theme='terminal']) button[aria-checked='true'] {
    background: var(--accent);
    color: var(--on-accent);
  }
</style>
