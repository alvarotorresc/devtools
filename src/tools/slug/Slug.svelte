<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { slugifyLines, type Separator } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('slug', '', meta.rememberInput ?? true);

  let separator = $state<Separator>('-');
  let lowercase = $state(true);
  let ampersand = $state(true);
  let limit = $state(false);
  let maxLength = $state(60);

  const lines = $derived(
    slugifyLines(input.value, {
      separator,
      lowercase,
      ampersand,
      maxLength: limit ? Math.max(1, Math.round(maxLength) || 60) : null,
      locale,
    }),
  );
  const slugs = $derived(lines.map((l) => l.slug).filter(Boolean));
</script>

<div class="panel">
  <Field id="slug-input" label={s.input}>
    {#snippet children({ describedby })}
      <TextArea
        id="slug-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        mono={false}
        rows={5}
      />
    {/snippet}
  </Field>

  <div class="row">
    <Segmented
      label={s.separator}
      options={[
        { value: '-', label: '-' },
        { value: '_', label: '_' },
        { value: '.', label: '.' },
      ]}
      bind:value={separator}
    />
    <Toggle bind:checked={lowercase} label={s.lowercase} />
    <Toggle bind:checked={ampersand} label={s.ampersand} />
    <Toggle bind:checked={limit} label={s.limit} />
    {#if limit}
      <Field id="slug-max" label={s.maxLength}>
        {#snippet children({ describedby })}
          <NumberInput id="slug-max" bind:value={maxLength} min={1} max={200} {describedby} />
        {/snippet}
      </Field>
    {/if}
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={lines.length === 0 ? 'idle' : slugs.length === lines.length ? 'ok' : 'bad'}
        label={lines.length === 0
          ? t(locale, 'led.idle')
          : slugs.length === 1
            ? s.one
            : fill(s.count, { n: slugs.length })}
      />
    {/snippet}
    {#if lines.length}
      <ul class="display-rows slugs">
        {#each lines as line, i (i)}
          <li class="display-row">
            {#if line.slug}
              <span class="slug">{line.slug}</span>
              <CopyButton
                value={line.slug}
                {locale}
                compact
                ariaLabel={fill(s.copySlug, { slug: line.slug })}
              />
            {:else}
              <span class="empty-slug">{s.noLatin}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={slugs.join('\n')} {locale} label={s.copyAll} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .slugs {
    list-style: none;
    padding: 0;
  }
  .slug {
    min-width: 0;
  }
  /* Inside the display, which is dark in every theme: --bad passes there, --bad-text does not. */
  .empty-slug {
    font: 600 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--bad);
  }
</style>
