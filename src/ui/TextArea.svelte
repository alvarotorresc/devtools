<script lang="ts">
  let {
    id,
    value = $bindable(),
    rows = 8,
    mono = true,
    placeholder,
    describedby,
    invalid = false,
    spellcheck = false,
    element = $bindable(),
  }: {
    id: string;
    value: string;
    rows?: number;
    mono?: boolean;
    placeholder?: string;
    describedby?: string;
    invalid?: boolean;
    spellcheck?: boolean;
    element?: HTMLTextAreaElement;
  } = $props();
</script>

<textarea
  bind:this={element}
  {id}
  bind:value
  {rows}
  {placeholder}
  {spellcheck}
  autocomplete="off"
  autocapitalize="off"
  class="control"
  class:mono
  aria-describedby={describedby}
  aria-invalid={invalid}></textarea>

<style>
  textarea {
    resize: vertical;
    min-height: 120px;
    max-height: 70vh;
    field-sizing: content;
  }
</style>
