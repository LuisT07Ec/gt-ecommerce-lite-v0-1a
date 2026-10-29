import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://wigooshop.ec',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  build: {
    inlineStylesheets: 'always',
  },
});

