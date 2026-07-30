import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://forjadoresdeleyendas.mx',
  integrations: [
    sitemap({ serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }) }),
  ],
  vite: { plugins: [tailwindcss()] },
});
