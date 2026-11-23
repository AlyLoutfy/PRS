/**
 * Root-relative URL for a page or a file in public/, prefixed with the deploy base:
 * "" locally and at a domain root, "/PRS" on a GitHub Pages project site (see astro.config.mjs).
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const withBase = (path: string): string => `${BASE}${path}`;
