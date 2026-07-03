// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO(nikhil): set the production domain once the deploy target is chosen.
// Sitemap + absolute OG URLs activate automatically when this is a real URL.
export const SITE_URL = undefined; // e.g. 'https://nikhilgangaramani.com'

export default defineConfig({
  site: SITE_URL,
  integrations: SITE_URL ? [sitemap()] : [],
  build: {
    inlineStylesheets: 'auto',
  },
});
