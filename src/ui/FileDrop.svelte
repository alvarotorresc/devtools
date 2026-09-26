<script lang="ts">
  import { t } from '../i18n';
  import type { Locale } from '../tools/types';

  let {
    locale,
    accept,
    onfile,
  }: { locale: Locale; accept?: string; onfile: (file: File) => void } = $props();

  let over = $state(false);

  function pick(files: FileList | null | undefined) {
    const f = files?.[0];
    if (f) onfile(f);
  }
</script>

<label
  class="drop"
  class:over
  ondragover={(e) => {
    e.preventDefault();
    over = true;
  }}
  ondragleave={() => (over = false)}
  ondrop={(e) => {
    e.preventDefault();
    over = false;
    pick(e.dataTransfer?.files);
  }}
>
  <input type="file" {accept} onchange={(e) => pick(e.currentTarget.files)} />
  <span>{t(locale, 'ui.dropFile')}</span>
</label>

<style>
  .drop {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    padding: 24px;
    text-align: center;
    color: var(--text-dim);
    background: var(--well);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius);
    cursor: pointer;
    transition:
      border-color 160ms,
      color 160ms;
  }
  .drop.over,
  .drop:focus-within {
    color: var(--text);
    border-color: var(--accent);
  }
  input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }
</style>
