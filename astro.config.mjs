import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://secureservices.pl',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    css: {
      postcss: './postcss.config.mjs'
    }
  }
});
