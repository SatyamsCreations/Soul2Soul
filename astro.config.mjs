// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Configure deployment via env for GitHub Pages (keeps dev DX intact)
const SITE = process.env.SITE || 'https://example.com/';
const BASE = process.env.BASE_URL || '/';

// https://astro.build/config
export default defineConfig({
  // Update via env vars in CI for GitHub Pages
  site: SITE,
  base: BASE,
  integrations: [mdx(), sitemap()],
  markdown: {
    syntaxHighlight: 'shiki'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
