/**
 * Root-relative URL for a page or a file in public/, prefixed with the deploy base. v2 is served under
 * "<parent base>/v2" ("/v2" locally, "/PRS/v2" on the GitHub Pages preview) — see astro.config.mjs.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const withBase = (path: string): string => `${BASE}${path}`;

/** Base of the current site (v1), which lives one level above v2. Used by the version switch. */
export const V1_BASE = BASE.replace(/\/v2$/, '');
