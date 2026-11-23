import { defineConfig } from 'astro/config';

// v2 — the redesign. It is a self-contained Astro project that is built into dist/v2/ and served under
// "<base>/v2/", next to the current site (v1, the project in the repository root). BASE_PATH and SITE_URL
// are the same variables the root project reads (see ../astro.config.mjs and .github/workflows/pages.yml).
const parentBase = (process.env.BASE_PATH || '').replace(/\/+$/, '');

export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base: `${parentBase}/v2`,
  outDir: '../dist/v2',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  server: { port: 4322, host: '127.0.0.1' },
});
