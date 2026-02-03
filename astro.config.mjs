import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://secureservices.pl',
  vite: {
    css: {
      postcss: './postcss.config.mjs'
    }
  }
});
