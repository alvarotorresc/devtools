<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { DEBOUNCE_MS, SAMPLE, renderMarkdown } from './logic';
  import { meta } from './meta';
  import { sanitize, type Sanitized } from './sanitize';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('markdown', '', meta.rememberInput ?? true);

  let tab = $state<'preview' | 'html'>('preview');
  let externalImages = $state(false);
  // Stays null during SSR: DOMPurify only runs in the browser, inside this effect.
  let safe = $state<Sanitized | null>(null);

  $effect(() => {
    const md = input.value;
    const external = externalImages;
    if (!md.trim()) {
      safe = null;
      return;
    }
    const timer = setTimeout(
      () => (safe = sanitize(renderMarkdown(md), { externalImages: external })),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  });

  const html = $derived(safe?.html ?? '');
</script>

<div class="stack">
  <Segmented
    main
    label={s.view}
    options={[
      { value: 'preview', label: meta.tabs![locale][0] },
      { value: 'html', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field id="markdown-input" label={s.input}>
      {#snippet children({ describedby })}
        <TextArea
          id="markdown-input"
          bind:value={input.value}
          placeholder={s.placeholder}
          {describedby}
          rows={12}
        />
      {/snippet}
    </Field>

    <Toggle bind:checked={externalImages} label={s.externalImages} />

    {#if tab === 'preview'}
      <Display live label={s.preview}>
        {#snippet head()}
          <span>{s.preview}</span>
          {#if html}<span>{s.sanitized}</span>{/if}
        {/snippet}
        {#if html}
          <div class="md-preview">
            <!-- The only {@html} on the site: `html` always comes out of sanitize() (DOMPurify). -->
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html html}
          </div>
          {#if safe && safe.blocked > 0}
            <p class="display-note">{fill(s.blocked, { n: safe.blocked })}</p>
          {/if}
        {:else}
          <p class="display-note">{s.empty}</p>
        {/if}
      </Display>
    {:else}
      <Display live label={s.html}>
        {#snippet head()}
          <span>{s.html}</span>
          {#if html}<span>{s.sanitized}</span>{/if}
        {/snippet}
        {#if html}
          <pre class="display-code">{html}</pre>
        {:else}
          <p class="display-note">{s.empty}</p>
        {/if}
      </Display>
    {/if}

    <div class="row">
      <CopyButton main value={html} {locale} label={s.copyHtml} />
      <Button variant="ghost" onclick={() => (input.value = SAMPLE)}>{s.sample}</Button>
      <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
        >{t(locale, 'ui.clear')}</Button
      >
    </div>
    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>
</div>

<style>
  /* The injected HTML has no Svelte scope class: every rule for it goes through :global. */
  .md-preview {
    max-height: 70vh;
    overflow: auto;
    font: 400 15px/1.6 var(--font-body);
    color: var(--disp-text);
    overflow-wrap: anywhere;
  }
  .md-preview > :global(:first-child) {
    margin-top: 0;
  }
  .md-preview :global(h1),
  .md-preview :global(h2),
  .md-preview :global(h3),
  .md-preview :global(h4),
  .md-preview :global(h5),
  .md-preview :global(h6) {
    margin: 20px 0 8px;
    font-weight: 700;
    line-height: 1.25;
  }
  .md-preview :global(h1) {
    font-size: 1.7em;
  }
  .md-preview :global(h2) {
    font-size: 1.4em;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--disp-line);
  }
  .md-preview :global(h3) {
    font-size: 1.2em;
  }
  .md-preview :global(p),
  .md-preview :global(ul),
  .md-preview :global(ol),
  .md-preview :global(blockquote),
  .md-preview :global(pre),
  .md-preview :global(table) {
    margin: 0 0 12px;
  }
  .md-preview :global(ul),
  .md-preview :global(ol) {
    padding-left: 1.4em;
  }
  .md-preview :global(li:has(> input[type='checkbox'])) {
    list-style: none;
    margin-left: -1.4em;
  }
  .md-preview :global(input[type='checkbox']) {
    margin: 0 6px 0 0;
    accent-color: var(--disp-text);
  }
  .md-preview :global(a) {
    color: var(--disp-text);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .md-preview :global(code) {
    font: 400 0.9em var(--font-mono);
  }
  .md-preview :global(:not(pre) > code) {
    padding: 1px 5px;
    border: 1px solid var(--disp-line);
    border-radius: 4px;
  }
  .md-preview :global(pre) {
    padding: 12px;
    overflow: auto;
    border: 1px solid var(--disp-line);
    border-radius: 6px;
  }
  .md-preview :global(blockquote) {
    padding-left: 12px;
    border-left: 3px solid var(--disp-line);
    color: var(--disp-dim);
  }
  .md-preview :global(table) {
    display: block;
    max-width: 100%;
    overflow: auto;
    border-collapse: collapse;
  }
  .md-preview :global(th),
  .md-preview :global(td) {
    padding: 6px 12px;
    border: 1px solid var(--disp-line);
  }
  .md-preview :global(hr) {
    margin: 16px 0;
    border: 0;
    border-top: 1px solid var(--disp-line);
  }
  .md-preview :global(del) {
    color: var(--disp-dim);
  }
  .md-preview :global(img) {
    max-width: 100%;
  }
  .md-preview :global(img.md-blocked) {
    display: inline-block;
    min-width: 120px;
    min-height: 48px;
    border: 1px dashed var(--disp-line);
    color: var(--disp-dim);
  }
</style>
