import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://devtools.alvarotc.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [svelte(), sitemap({ filter: (page) => !page.endsWith('/404') })],
});
