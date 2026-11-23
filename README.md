# PRS Prime Re Solutions — website

Built from the Figma file **PRS_Rebranding** (pages *01_Style Guide*, *02_Components*, *03_Web Design*).
Static Astro sites in German (default), English and Spanish.

The repository holds **two versions side by side**, so they can be compared page by page:

| | Where | URL | What it is |
| --- | --- | --- | --- |
| **v1** | repository root (`src/`, `public/`) | `/` | the current site, unchanged |
| **v2** | `v2/` (`v2/src/`, `v2/public/`) | `/v2/` | the redesign |

Both footers carry a **Version** switch (v1 · v2) that opens the same page and language in the other version.

```bash
npm install
npm run dev       # v1 → http://localhost:4321
npm run dev:v2    # v2 → http://localhost:4322/v2/
npm run build     # builds v1 into dist/ and v2 into dist/v2/
npm run preview   # serves dist/ → http://localhost:4321 (v1) and /v2/ (v2); the switch works here
```

In `dev` mode the two versions run on their own ports, and the switch points to the other port.

## Preview deployment

Every push to `main` builds both versions and publishes them to GitHub Pages (`.github/workflows/pages.yml`):
**https://alyloutfy.github.io/PRS/** (v1) and **https://alyloutfy.github.io/PRS/v2/** (v2). Pages serves the site
under `/PRS/`, so the workflow sets `BASE_PATH` and `SITE_URL`, and every internal URL goes through `withBase()`
(`src/lib/url.ts`, `v2/src/lib/url.ts`). It also sets `PUBLIC_NOINDEX=true`, which adds a `noindex` tag so search
engines skip the preview. Locally, and on a host that serves the site from the domain root, leave all three unset.

## Choosing a version

- **Keep v1:** delete `v2/`, the `dev:v2` / `build:v2` scripts in `package.json`, and `src/components/VersionSwitch.astro`
  with its call in `src/components/Footer.astro`.
- **Go with v2:** replace `src/` and `public/` with `v2/src/` and `v2/public/`, move `v2/scripts/` to `scripts/`,
  delete `v2/` and the version switch, and drop the `v2` lines from `package.json`. `withBase()` then resolves to the root again.

## Stack

Astro 7 (static output) · TypeScript · GSAP 3.15 (ScrollTrigger, SplitText, in v2 also Flip) · Lenis smooth scroll ·
self-hosted variable fonts via Fontsource (stand-ins, see *Fonts*) · WebGL2 (hero) · Canvas 2D (illustrations, globe).
v2 has its own `astro.config.mjs` and shares the root `node_modules`.

## Pages (both versions)

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

## What v2 changes

**Finding the way and getting in touch**
- Floating white header bar on every screen size (the pattern of the mobile reference in the Figma file) with the four
  main destinations, language switch, search and a **Kontakt** button; it steps aside while scrolling down and returns
  on the way up. A hairline along its lower edge shows the reading position.
- The menu opens out of the bar; everything behind it is inert, focus is kept inside and returned on close.
- **Enquiry form** (see below): on the contact page, and as the closing section of the home, expertise, Academy and
  curriculum pages. The other pages end with a slim call to action.
- Hero with two calls to action; client logos directly under it.

**Curriculum**
- Filters stay in reach from tablets up; on phones the chips scroll sideways.
- Topics can be **collected into one enquiry** ("einzeln oder kombiniert"): *Zur Anfrage hinzufügen* on each topic, a
  bar with the count, and the selection arrives in the form as removable tags. Workshop / seminar and the upcoming
  event hand themselves to the form the same way.

**Notes from the Figma file that v2 acts on**
- *"Aktuelles"* (homepage): news teaser with the upcoming event.
- *"Neue Grafiken zeichnen"* (homepage): drawn, animated line graphics for *Unsere Arbeitsweise* instead of the
  placeholder icons.
- *"Pop up Black für Upcoming Event?"* (PRS Academy): a small dark notice for the upcoming event, shown once the
  visitor is reading, dismissible, remembered, and gone when the event has ended.
- *"Kundenstimmen / Allgemeine Anfrage"* (Lehrplan): the curriculum page ends with both.
- *"Auto Rotation of Names"* (Team): within each country the order moves on by one place per day
  (`data-rotate` on the grid in `v2/src/pages/[lang]/team.astro`; remove the attribute to switch it off).
- *"Button: Turns full green when hovered over"*: unchanged from v1, with a green dark enough for white text.

**Every screen**
- Written mobile-first; checked from 280 px (folded phones) to 3440 px, portrait and landscape, in all three languages.
- Safe areas (notch, home indicator), 44 px touch targets for buttons, list links and form controls, no hover-only
  information (painting labels are always visible on touch screens), 16 px form text (no zoom on iOS), long German
  compounds hyphenate.
- Phones get their own layouts where columns do not fit: figures as rows, service cards as rows on tablets, the search
  as a full-screen sheet, offices in one column.
- The contact globe no longer traps vertical scrolling on touch screens; tapping an office turns the globe to it.

**Motion** (all of it off with `prefers-reduced-motion`)
- Header and menu choreography, line-by-line headlines, drawn hairlines and contours, picture reveals with parallax,
  count-up figures, filtered lists that glide into place (GSAP Flip), a carousel with snap, form feedback (underline
  sweep, check marks, drawn success icon), magnetic primary buttons for mouse users.
- The WebGL hero is skipped on devices without graphics acceleration, with little memory or in data-saver mode; on
  the others it measures its first frames and lowers its resolution, or hands over to the photograph, if they are slow.

**Under the hood**
- Paintings are **self-hosted** (`v2/public/art/`, WebP in three widths) instead of hot-linked from Wikimedia.
- Photographs, portraits and logos come in sizes that fit the screen (`v2/scripts/optimize-images.mjs`); the logo
  mask is 17 kB instead of 43 kB.
- Text contrast meets WCAG AA (meta grey, green and error colours were adjusted); headings follow one outline per
  page; definition lists, landmarks and labels are in place; print and Windows high-contrast styles exist.
- Web fonts are preloaded and have metric-matched fallbacks, so text does not jump when they arrive.
- Social preview image (`v2/public/og.jpg`), canonical and `hreflang` links.

### How v2 was checked

Automated, in Chromium with device emulation (a pass on real iOS Safari and Firefox is still worth doing):

- Layout: all 10 pages × 3 languages × 17 screen sizes from 280 × 653 to 3440 × 1440 (510 combinations) — no
  horizontal overflow, no broken images, no script errors.
- Accessibility: axe-core (WCAG 2.1 A/AA and best practices) on every page in all three languages at phone and
  desktop size, plus the open menu, the open search and the form with errors — no violations. Keyboard-only walk
  through header, menu, search and form; content and form also work with JavaScript switched off.
- Interactions: menu, search, form validation, the e-mail fallback, the backend path against a test endpoint
  (success, server error, bot trap), curriculum selection, filters, upcoming-event notice.
- Lighthouse (phone profile): accessibility, best practices and SEO 100 on the pages tested; performance 90 on the
  home page and 94–97 on inner pages (the test machine has no graphics acceleration, so the hero shows its photograph).

## Enquiry form (v2)

Files: `v2/src/components/LeadForm.astro`, `LeadSection.astro`, `v2/src/scripts/form.ts`, `lead-store.ts`.

Fields: topic (general · models · products & processes · standards & regulation · PRS Academy), name, e-mail,
company (optional), phone (optional), message, consent. With a selection from the curriculum the message is optional.

**Today, without a backend**, submitting opens the visitor's e-mail app with the enquiry prefilled and addressed to
`solutions@prs-zug.com`; the page then says *"send it from there"* and offers to copy the message. Nothing claims to
have been delivered. Without JavaScript the browser does the same through the form's `mailto:` action.

**To connect a backend**, set one variable at build time:

```bash
PUBLIC_LEAD_ENDPOINT=https://example.com/api/leads npm run build
```

(or add it to the `env:` block of the build step in `.github/workflows/pages.yml`). The form then POSTs JSON:

```json
{
  "topic": "academy",
  "topicLabel": "PRS Academy",
  "selection": ["Standardformel von Solvency II", "Format: Workshop (16 Stunden)"],
  "name": "…", "email": "…", "company": "…", "phone": "…", "message": "…",
  "consent": true,
  "language": "de",
  "page": "/de/curriculum/",
  "submittedAt": "2026-11-23T12:00:00.000Z"
}
```

Any `2xx` answer shows the confirmation; anything else shows a retry message with an e-mail fallback. The endpoint
must allow cross-origin POSTs from the site (`Access-Control-Allow-Origin`, and `Content-Type` in
`Access-Control-Allow-Headers`). A hidden `website` field catches bots: when it is filled, nothing is sent.
Unfinished entries survive a reload (sessionStorage) and are cleared after sending.

## Taken from the Figma file

- **Assets** (exported via the Figma connector, in `public/`): logo artwork (`brand/`), the three alpine photographs
  (`photos/` — hero, lake, glacier), 12 team portraits (`team/`), client logos Swiss Re · Munich Re · Zurich ·
  Allianz · helvetia (`clients/`), Ionicons *server-outline* icons, search / menu icons and the carousel chevron (`icons/`).
- **Styles** from *01_Style Guide*: palette `5E8A68 · F2F2F2 · 35342F · 006FB5 · EEEEEE · BF472C`; type scale
  H1 45 · H2 27 · H3 23 · H4 20 · B1 27 · B2 23 · B3 20 · B4 16 (line-height 1.5 headings / 1.65 text);
  0.6 px ink hairlines; pill buttons with a 0.6 px sage border; 112 px section rhythm.
- **Copy**: all German text, names (with diacritics as in the layers), testimonials, offices, 19 curriculum topics,
  upcoming IFRS 17 event.

The Figma file contains no PRS layouts for phones or tablets (its phone frames are reference captures of other
sites); the small-screen layouts are designed here.

## Fonts

The Figma styles use **SangBleu Republic** (headings, Medium) and **Suisse Int'l** (text, Regular/Book) by Swiss
Typefaces — as *Trial* versions, which are not licensed for websites. The CSS already lists `'SangBleu Republic'`
and `'Suisse Intl'` first; once PRS buys web licences, add the `@font-face` rules under those names and they take
over. Until then the site falls back to Crimson Pro and Inter (free, self-hosted). v2 tightens heading line-height
(1.16–1.3 instead of 1.5) for the stand-in serif; revisit with the licensed fonts.

## Added on top of the design (both versions)

- **Hero, "model → reality":** on first visit a generative Swiss-style relief (hillshading, contours, lakes) rises from
  the valleys, then the design's photograph replaces it from the valleys up. Afterwards a surveyor's loupe lays the
  terrain model over the photo, with an LV95-style coordinate/elevation readout. Repeat visits show the photo at once;
  with reduced motion or without WebGL the photo is shown exactly as in Figma.
- **First-visit intro:** the real logo's two bars slide together along the diagonal, then the wordmark wipes in.
- Live illustrations for the three service fields (Galton board, process flow, tolerance-band validation).
- Painting loupe with museum labels; line-by-line headline reveals; drawn hairlines; count-up figures.
- ⌘K / Ctrl K / "/" search across pages, curriculum and team; curriculum and team filters.
- Contact globe with the offices and arcs from Zug; live event countdown; contour-line page heads; view transitions.
- `prefers-reduced-motion` respected; keyboard-operable menu and search; skip link.

## Before launch

1. **Fonts:** web licences for SangBleu Republic and Suisse Int'l (see above).
2. **Logo:** Figma only holds a raster logo (4096 px PNG, used here as a recolourable CSS mask). Ask for the SVG master.
3. **Rebeca Juárez:** her slot in the Figma team grid is an empty placeholder; she shows a generated monogram.
4. **Photography credit/licence:** the hero layer is named `portfolio_alps_V2_2026_timothe_beuret`; please confirm the
   photographer and usage rights (credited on the legal page).
5. **Client logos:** confirm permission to show them.
6. **Translations:** English and Spanish were translated from the German copy and need review — including the new
   v2 interface copy (calls to action, form labels and messages) in all three languages.
7. **Legal & links:** Impressum and Datenschutz text; the form's consent sentence should match the final privacy
   notice; company LinkedIn URL; the design shows LinkedIn / E-Mail links per team member — URLs and addresses are needed.
8. **Enquiry form backend:** see *Enquiry form*. Until it exists, enquiries go through the visitor's e-mail app.
9. **Paintings:** v1 hot-links public-domain files from Wikimedia Commons (`src/data/art.ts`), which Wikimedia
   throttles; v2 serves its own copies. To regenerate them: `node v2/scripts/fetch-art.mjs`.
10. **Icon colour (v1):** the exported Ionicons use `#FF383C` (not the palette's `#BF472C`); v2 draws its own
    graphics in the palette red.
11. **Globe:** Slovenia, Mexico and Peru are pinned at capital-city coordinates (the design gives no city).
12. **Production hosting:** the GitHub Pages site is a preview. Build production at the domain root without
    `BASE_PATH` and `PUBLIC_NOINDEX`, with `SITE_URL` set to the real domain, and ship one version only.

## Where things live

Paths are relative to the version's folder (`./` for v1, `v2/` for v2).

- Copy: `src/i18n/{de,en,es}.ts` · data: `src/data/` (courses, team, offices, photos, art)
- Pages: `src/pages/[lang]/` · components: `src/components/` · layout: `src/layouts/Base.astro`
- Motion & interactions: `src/scripts/main.ts` · hero: `src/scripts/hero.ts` ·
  illustrations: `src/scripts/illustrations.ts` · globe: `src/scripts/globe.ts`
- v2 only: enquiry form `src/scripts/form.ts` + `lead-store.ts` · painting import `scripts/fetch-art.mjs`
