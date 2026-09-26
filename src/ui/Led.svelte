<script lang="ts">
  let { state, label }: { state: 'ok' | 'bad' | 'idle'; label: string } = $props();
</script>

<span class="led-wrap">
  {#key state}<span class="led {state}" aria-hidden="true"></span>{/key}
  <span>{label}</span>
</span>

<style>
  .led-wrap {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .led {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--idle);
    transition: background-color 160ms;
  }
  .ok {
    background: var(--ok);
    animation: pulse 400ms ease-out;
    box-shadow: 0 0 10px var(--ok);
  }
  .bad {
    background: var(--bad);
    animation: pulse 400ms ease-out;
    box-shadow: 0 0 10px var(--bad);
  }
  @keyframes pulse {
    from {
      transform: scale(1.6);
      opacity: 0.4;
    }
  }
</style>
