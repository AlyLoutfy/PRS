import { defineConfig } from 'astro/config';

// Static site. All locales are prefixed (/de/, /en/, /es/); "/" forwards to the visitor's language.
// SITE_URL and BASE_PATH are set only for sub-path deployments such as the GitHub Pages preview
// (.github/workflows/pages.yml). Locally, and on a host serving from the domain root, both stay unset.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  server: { port: 4321, host: '127.0.0.1' },
});
