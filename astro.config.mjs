import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';

// Permite compilar para Cloudflare Pages en producción o Node en local
const isCloudflare = process.env.CLOUDFLARE_BUILD === 'true' || process.env.CF_PAGES === '1';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://wigooshop.ec',
  output: 'server',
  adapter: isCloudflare
    ? cloudflare({
        mode: 'directory',
      })
    : node({
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
