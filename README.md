# PRS Prime Re Solutions — website

Built from the Figma file **PRS_Rebranding** (pages *01_Style Guide*, *02_Components*, *03_Web Design*).
Static Astro site in German (default), English and Spanish.

```bash
npm install
npm run dev      # http://localhost:4321  (/ forwards to /de/, /en/ or /es/ by browser language)
npm run build    # static output in dist/ — deploy to any static host
```

## Preview deployment

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/pages.yml`):
**https://alyloutfy.github.io/PRS/**. Pages serves the site under `/PRS/`, so the workflow sets `BASE_PATH` and
`SITE_URL`, and every internal URL goes through `withBase()` (`src/lib/url.ts`). It also sets
`PUBLIC_NOINDEX=true`, which adds a `noindex` tag so search engines skip the preview. Locally, and on a host that
serves the site from the domain root, leave all three unset.

## Stack

Astro 7 (static output) · TypeScript · GSAP 3.15 (ScrollTrigger, SplitText) · Lenis smooth scroll ·
self-hosted variable fonts via Fontsource (stand-ins, see *Fonts*) · WebGL2 (hero) · Canvas 2D (illustrations, globe).
Each page ships HTML + one ~57 kB (gzip) script; the hero, illustrations and globe load only where used.

## Pages

| Route | Figma frame |
| --- | --- |
| `/{lang}/` | Homepage |
| `/{lang}/expertise/` | Expertise |
| `/{lang}/academy/` | PRS Academy |
| `/{lang}/curriculum/` | Lehrplan (19 topics, filterable) |
| `/{lang}/about/` | Über uns + Übersicht component |
| `/{lang}/team/` | Team |
| `/{lang}/contact/` | Kontakt |
| `/{lang}/news/` | Aktuelles (frame is empty in Figma) |
| `/{lang}/legal/` | Impressum / Datenschutz / image credits |

## Taken from the Figma file

- **Assets** (exported via the Figma connector, in `public/`): logo artwork (`brand/`), the three alpine photographs
  (`photos/` — hero, lake, glacier), 12 team portraits (`team/`), client logos Swiss Re · Munich Re · Zurich ·
  Allianz · helvetia (`clients/`), Ionicons *server-outline* icons, search / menu icons and the carousel chevron (`icons/`).
- **Styles** from *01_Style Guide*: palette `5E8A68 · F2F2F2 · 35342F · 006FB5 · EEEEEE · BF472C`; type scale
  H1 45 · H2 27 · H3 23 · H4 20 · B1 27 · B2 23 · B3 20 · B4 16 (line-height 1.5 headings / 1.65 text);
  0.6 px ink hairlines; pill buttons with a 0.6 px sage border; 112 px section rhythm.
- **Copy**: all German text, names (with diacritics as in the layers), testimonials, offices, 19 curriculum topics,
  upcoming IFRS 17 event.

## Fonts

The Figma styles use **SangBleu Republic** (headings, Medium) and **Suisse Int'l** (text, Regular/Book) by Swiss
Typefaces — as *Trial* versions, which are not licensed for websites. The CSS already lists `'SangBleu Republic'`
and `'Suisse Intl'` first; once PRS buys web licences, add the `@font-face` rules under those names and they take
over. Until then the site falls back to Crimson Pro and Inter (free, self-hosted).

## Added on top of the design

- **Hero, "model → reality":** on first visit a generative Swiss-style relief (hillshading, contours, lakes) rises from
  the valleys, then the design's photograph replaces it from the valleys up. Afterwards a surveyor's loupe lays the
  terrain model over the photo, with an LV95-style coordinate/elevation readout. Repeat visits show the photo at once;
  with reduced motion or without WebGL the photo is shown exactly as in Figma.
- **First-visit intro:** the real logo's two bars slide together along the diagonal, then the wordmark wipes in.
- Live illustrations for the three service fields (Galton board, process flow, tolerance-band validation).
- Painting loupe with museum labels; line-by-line headline reveals; drawn hairlines; count-up figures.
- ⌘K / Ctrl K / "/" search across pages, curriculum and team; curriculum and team filters; per-topic e-mail enquiries.
- Contact globe with the offices and arcs from Zug; live event countdown; contour-line page heads; view transitions.
- `prefers-reduced-motion` respected; keyboard-operable menu and search; skip link.

## Before launch

1. **Fonts:** web licences for SangBleu Republic and Suisse Int'l (see above).
2. **Logo:** Figma only holds a raster logo (4096 px PNG, used here as a recolourable CSS mask). Ask for the SVG master.
3. **Rebeca Juárez:** her slot in the Figma team grid is an empty placeholder; she shows a generated monogram.
4. **Photography credit/licence:** the hero layer is named `portfolio_alps_V2_2026_timothe_beuret`; please confirm the
   photographer and usage rights (credited on the legal page).
5. **Client logos:** confirm permission to show them.
6. **Translations:** English and Spanish were translated from the German copy and need review.
7. **Legal & links:** Impressum and Datenschutz text; company LinkedIn URL; the design shows LinkedIn / E-Mail links
   per team member — URLs and addresses are needed.
8. **Icon colour:** the exported Ionicons use `#FF383C` (not the palette's `#BF472C`) — kept as in Figma; confirm.
9. **Paintings:** Old Masters on the inner pages are public-domain files hot-linked from Wikimedia Commons
   (`src/data/art.ts`); self-host them before launch.
10. **Globe:** Slovenia, Mexico and Peru are pinned at capital-city coordinates (the design gives no city).
11. **Production hosting:** the GitHub Pages site is a preview. Build production at the domain root without
    `BASE_PATH` and `PUBLIC_NOINDEX`, with `SITE_URL` set to the real domain.

## Where things live

- Copy: `src/i18n/{de,en,es}.ts` · data: `src/data/` (courses, team, offices, photos, art)
- Pages: `src/pages/[lang]/` · components: `src/components/` · layout: `src/layouts/Base.astro`
- Motion & interactions: `src/scripts/main.ts` · hero: `src/scripts/hero.ts` ·
  illustrations: `src/scripts/illustrations.ts` · globe: `src/scripts/globe.ts`
