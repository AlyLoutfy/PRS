// Site-wide behaviour: smooth scroll, reveals, header, mega menu, search, loupe, counters, filters.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => Array.from(el.querySelectorAll<T>(s));

/* ------------------------------------------------------------------ smooth scroll */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.095, smoothWheel: true, anchors: { offset: -96 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollY = () => (lenis ? lenis.scroll : window.scrollY);

/* ------------------------------------------------------------------ header */
const header = $('[data-header]');
const heroEl = $('[data-hero]');
let lastY = 0;
let menuOpen = false;
function onScroll(y: number) {
  if (!header) return;
  const threshold = heroEl ? heroEl.offsetHeight - 96 : 24;
  header.classList.toggle('is-solid', y > threshold);
  if (y > 260 && y > lastY + 3 && !menuOpen) header.classList.add('is-hidden');
  else if (y < lastY - 3 || y < 260) header.classList.remove('is-hidden');
  lastY = y;
}
if (lenis) lenis.on('scroll', ({ scroll }: { scroll: number }) => onScroll(scroll));
else addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
onScroll(window.scrollY);

/* ------------------------------------------------------------------ mega menu */
const mega = $('[data-mega]');
const menuBtn = $<HTMLButtonElement>('[data-menu-open]');
let menuTl: gsap.core.Timeline | null = null;
function openMenu() {
  if (!mega || menuOpen) return;
  menuOpen = true;
  mega.inert = false;
  mega.classList.add('is-open');
  menuBtn?.setAttribute('aria-expanded', 'true');
  lenis?.stop();
  const panel = $('.mega__panel', mega)!;
  const scrim = $('.mega__scrim', mega)!;
  const rules = $$('[data-mega-rule]', mega);
  const items = $$('.mega__col-title, .mega__links li, .mega__footer', mega);
  menuTl?.kill();
  menuTl = gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .to(scrim, { opacity: 1, duration: reduced ? 0 : 0.5 }, 0)
    .fromTo(panel, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: reduced ? 0 : 0.85 }, 0)
    .fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: reduced ? 0 : 1.1, stagger: 0.08 }, 0.12)
    .fromTo(items, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: reduced ? 0 : 0.8, stagger: 0.035 }, 0.18);
  setTimeout(() => $<HTMLAnchorElement>('.mega__col-title a', mega)?.focus({ preventScroll: true }), 60);
}
function closeMenu() {
  if (!mega || !menuOpen) return;
  menuOpen = false;
  menuBtn?.setAttribute('aria-expanded', 'false');
  const panel = $('.mega__panel', mega)!;
  const scrim = $('.mega__scrim', mega)!;
  menuTl?.kill();
  menuTl = gsap
    .timeline({
      defaults: { ease: 'expo.inOut' },
      onComplete: () => {
        mega.classList.remove('is-open');
        mega.inert = true;
        lenis?.start();
      },
    })
    .to(panel, { clipPath: 'inset(0 0 100% 0)', duration: reduced ? 0 : 0.6 }, 0)
    .to(scrim, { opacity: 0, duration: reduced ? 0 : 0.45 }, 0.1);
  menuBtn?.focus({ preventScroll: true });
}
menuBtn?.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
$$('[data-menu-close]').forEach((b) => b.addEventListener('click', closeMenu));
mega?.addEventListener('click', (e) => {
  const a = (e.target as Element).closest('a');
  if (a && a.getAttribute('href')?.includes('#') && a.pathname === location.pathname) closeMenu();
});

/* ------------------------------------------------------------------ search (⌘K) */
type Item = { g: 'pages' | 'courses' | 'people'; t: string; d: string; u: string; m?: string; n?: string };
const searchEl = $('[data-search]');
const searchInput = $<HTMLInputElement>('[data-search-input]');
const results = $('[data-search-results]');
let searchData: { groups: Record<string, string>; empty: string; items: Item[] } | null = null;
let active = 0;
let current: Item[] = [];
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
function highlight(text: string, q: string) {
  if (!q) return esc(text);
  const i = norm(text).indexOf(norm(q));
  if (i < 0) return esc(text);
  return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`;
}
function runSearch(q: string) {
  if (!searchData || !results) return;
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  let items: Item[];
  if (!tokens.length) {
    items = [...searchData.items.filter((i) => i.g === 'pages').slice(0, 6), ...searchData.items.filter((i) => i.g === 'courses').slice(0, 3)];
  } else {
    items = searchData.items
      .map((i) => {
        if (!tokens.every((t) => i.n!.includes(t))) return null;
        const title = norm(i.t);
        const score = tokens.reduce((s, t) => s + (title.startsWith(t) ? 6 : title.includes(t) ? 3 : 1), 0);
        return { i, score };
      })
      .filter((x): x is { i: Item; score: number } => !!x)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.i);
  }
  const groups: Item['g'][] = ['pages', 'courses', 'people'];
  current = groups.flatMap((g) => items.filter((i) => i.g === g).slice(0, 7));
  active = 0;
  if (!current.length) {
    results.innerHTML = `<p class="search__empty">${esc(searchData.empty)} “${esc(q)}”</p>`;
    return;
  }
  const firstTok = q.trim().split(/\s+/)[0] ?? '';
  let html = '';
  let idx = 0;
  for (const g of groups) {
    const list = current.filter((i) => i.g === g);
    if (!list.length) continue;
    html += `<div class="search__group meta">${esc(searchData.groups[g])}</div>`;
    for (const i of list) {
      html += `<a class="search__item" role="option" id="sr-${idx}" href="${esc(i.u)}" aria-selected="${idx === 0}">
        <b>${highlight(i.t, firstTok)}</b>${i.m ? `<em>${esc(i.m)}</em>` : ''}<small>${highlight(i.d.length > 150 ? `${i.d.slice(0, 150)}…` : i.d, firstTok)}</small></a>`;
      idx++;
    }
  }
  results.innerHTML = html;
  searchInput?.setAttribute('aria-activedescendant', 'sr-0');
}
function moveActive(delta: number) {
  if (!results || !current.length) return;
  const opts = $$('.search__item', results);
  opts[active]?.setAttribute('aria-selected', 'false');
  active = (active + delta + opts.length) % opts.length;
  opts[active]?.setAttribute('aria-selected', 'true');
  opts[active]?.scrollIntoView({ block: 'nearest' });
  searchInput?.setAttribute('aria-activedescendant', `sr-${active}`);
}
function openSearch() {
  if (!searchEl || searchEl.classList.contains('is-open')) return;
  if (!searchData) {
    const raw = $('[data-search-index]', searchEl)?.textContent ?? '{}';
    searchData = JSON.parse(raw);
    searchData!.items.forEach((i) => (i.n = norm(`${i.t} ${i.d} ${i.m ?? ''}`)));
  }
  if (menuOpen) closeMenu();
  searchEl.classList.add('is-open');
  lenis?.stop();
  runSearch(searchInput?.value ?? '');
  gsap.fromTo($('.search__panel', searchEl), { y: -16, opacity: 0, scale: 0.985 }, { y: 0, opacity: 1, scale: 1, duration: reduced ? 0 : 0.5, ease: 'expo.out' });
  gsap.fromTo($('.search__scrim', searchEl), { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.35 });
  requestAnimationFrame(() => searchInput?.focus());
}
function closeSearch() {
  if (!searchEl?.classList.contains('is-open')) return;
  searchEl.classList.remove('is-open');
  lenis?.start();
}
if (!/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)) $$('.kbd').forEach((k) => { if (k.textContent === '⌘K') k.textContent = 'Ctrl K'; });
$$('[data-search-open]').forEach((b) => b.addEventListener('click', openSearch));
$$('[data-search-close]').forEach((b) => b.addEventListener('click', closeSearch));
searchInput?.addEventListener('input', () => runSearch(searchInput.value));
searchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
  else if (e.key === 'Enter') {
    const a = results ? $$<HTMLAnchorElement>('.search__item', results)[active] : null;
    if (a) { e.preventDefault(); closeSearch(); location.href = a.href; }
  }
});
addEventListener('keydown', (e) => {
  const typing = /input|textarea|select/i.test((e.target as Element)?.tagName ?? '');
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    searchEl?.classList.contains('is-open') ? closeSearch() : openSearch();
  } else if (e.key === '/' && !typing) {
    e.preventDefault();
    openSearch();
  } else if (e.key === 'Escape') {
    if (searchEl?.classList.contains('is-open')) closeSearch();
    else if (menuOpen) closeMenu();
  }
});

/* ------------------------------------------------------------------ intro */
function playIntro(): Promise<void> {
  const el = $('[data-intro]');
  if (!el || el.classList.contains('is-done')) return Promise.resolve();
  try { sessionStorage.setItem('prs-intro', '1'); } catch { /* private mode */ }
  lenis?.stop();
  return new Promise((resolve) => {
    // The real logo artwork split into its two bars (see Logo.astro): they slide together along the
    // diagonal, then the wordmark wipes in.
    const a = $('.logo-art__a', el);
    const b = $('.logo-art__b', el);
    const word = $('.logo-art__word', el);
    const meta = $$('.intro__meta span', el);
    const logo = $('.intro__logo', el);
    const d = ($('.logo-art', el)?.offsetHeight ?? 100) * 0.42;
    gsap.set([a, b], { opacity: 0 });
    gsap.set(a, { x: d, y: -d });
    gsap.set(b, { x: -d, y: d });
    gsap.set(word, { clipPath: 'inset(0% 100% 0% 40%)' });
    gsap
      .timeline({ delay: 0.15 })
      .to([a, b], { x: 0, y: 0, opacity: 1, duration: 1.05, ease: 'expo.out', stagger: 0.06 })
      .to(word, { clipPath: 'inset(0% 0% 0% 40%)', duration: 0.75, ease: 'power3.inOut' }, 0.62)
      .fromTo(meta, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 }, 0.7)
      .to(logo, { y: -18, opacity: 0, duration: 0.6, ease: 'power2.in' }, 1.75)
      .to(meta, { opacity: 0, duration: 0.3 }, 1.75)
      .add(() => resolve(), 1.95)
      .fromTo(el, { clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)', duration: 0.95, ease: 'expo.inOut' }, 1.9)
      .add(() => { el.classList.add('is-done'); lenis?.start(); });
  });
}

/* ------------------------------------------------------------------ reveals */
function splitLines(el: HTMLElement, vars: gsap.TweenVars, trigger: boolean) {
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'line',
    autoSplit: true,
    onSplit(self) {
      gsap.set(el, { opacity: 1 });
      return gsap.from(self.lines, {
        yPercent: 112,
        duration: 1.15,
        ease: 'expo.out',
        stagger: 0.085,
        ...vars,
        ...(trigger ? { scrollTrigger: { trigger: el, start: 'top 89%', once: true } } : {}),
      });
    },
  });
}

function setupReveals() {
  if (reduced) return;
  $$('[data-reveal="lines"]').forEach((el) => splitLines(el, {}, true));

  // Fades and hairlines: IntersectionObserver fires immediately for elements already in view,
  // and entries arriving in the same frame are staggered together.
  const batchReveal = (selector: string, rootMargin: string, play: (els: Element[]) => void) => {
    let queue: Element[] = [];
    let scheduled = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          queue.push(en.target);
        });
        if (queue.length && !scheduled) {
          scheduled = true;
          requestAnimationFrame(() => {
            play(queue);
            queue = [];
            scheduled = false;
          });
        }
      },
      { rootMargin },
    );
    $$(selector).forEach((el) => io.observe(el));
  };
  batchReveal('[data-reveal="fade"]', '0px 0px -7% 0px', (els) =>
    gsap.to(els, { opacity: 1, y: 0, duration: 1.05, ease: 'expo.out', stagger: 0.07 }),
  );
  batchReveal('[data-rule]', '0px 0px -5% 0px', (els) =>
    gsap.to(els, { scaleX: 1, duration: 1.5, ease: 'expo.inOut', stagger: 0.1 }),
  );
  $$('[data-reveal="media"]').forEach((el) => {
    const inner = $('img, canvas', el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 87%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'expo.inOut' });
    if (inner && !inner.hasAttribute('data-parallax')) tl.from(inner, { scale: 1.22, duration: 1.9, ease: 'expo.out' }, 0.05);
  });
  // Line drawings (contours, approach icons) draw themselves in.
  const drawGroups = new Map<Element, SVGGeometryElement[]>();
  $$<SVGGeometryElement>('[data-draw-line]').forEach((p) => {
    const svg = p.ownerSVGElement ?? p;
    if (!drawGroups.has(svg)) drawGroups.set(svg, []);
    drawGroups.get(svg)!.push(p);
  });
  drawGroups.forEach((paths, svg) => {
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 2.6,
      ease: 'expo.inOut',
      stagger: { each: 0.06, from: 'start' },
      scrollTrigger: { trigger: svg, start: 'top 90%', once: true },
    });
  });
  $$('[data-parallax]').forEach((img) =>
    gsap.fromTo(
      img,
      { yPercent: -7, scale: 1.16 },
      { yPercent: 7, scale: 1.16, ease: 'none', scrollTrigger: { trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true } },
    ),
  );
}

/* ------------------------------------------------------------------ counters */
const swiss = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’');
function setupCounters() {
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    const plain = el.hasAttribute('data-plain');
    const fmt = (v: number) => (plain ? String(Math.round(v)) : swiss(v)) + suffix;
    if (reduced) { el.textContent = fmt(end); return; }
    const o = { v: plain ? end - 15 : 0 };
    el.textContent = fmt(o.v);
    gsap.to(o, {
      v: end,
      duration: plain ? 1.6 : 2.2,
      ease: 'expo.out',
      onUpdate: () => (el.textContent = fmt(o.v)),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* ------------------------------------------------------------------ painting loupe */
function setupLoupes() {
  if (!finePointer) return;
  const ZOOM = 2.6;
  $$('.media.has-loupe').forEach((fig) => {
    const loupe = $('.loupe', fig);
    const img = $<HTMLImageElement>('img', fig);
    if (!loupe || !img) return;
    const [nw, nh] = (fig.dataset.natural ?? '1x1').split('x').map(Number);
    let primed = false;
    fig.addEventListener('pointerenter', () => {
      if (!primed) { loupe.style.backgroundImage = `url("${fig.dataset.loupe}")`; primed = true; }
    });
    fig.addEventListener('pointermove', (e) => {
      const r = fig.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const s = Math.max(r.width / nw, r.height / nh);
      const rw = nw * s;
      const rh = nh * s;
      const [fx, fy] = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
      const ox = (r.width - rw) * (Number.isFinite(fx) ? fx : 0.5);
      const oy = (r.height - rh) * (Number.isFinite(fy) ? fy : 0.5);
      const bw = rw * ZOOM;
      const bh = rh * ZOOM;
      const half = loupe.offsetWidth / 2;
      loupe.style.backgroundSize = `${bw}px ${bh}px`;
      loupe.style.backgroundPosition = `${-((x - ox) / rw) * bw + half}px ${-((y - oy) / rh) * bh + half}px`;
      loupe.style.left = `${x}px`;
      loupe.style.top = `${y}px`;
    });
  });
}

/* ------------------------------------------------------------------ testimonials (mobile carousel) */
function setupQuotes() {
  const track = $('[data-quotes]');
  if (!track) return;
  const prev = $<HTMLButtonElement>('[data-quotes-prev]');
  const next = $<HTMLButtonElement>('[data-quotes-next]');
  const step = () => (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 300;
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max - 2;
  };
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', sync, { passive: true });
  new ResizeObserver(sync).observe(track);
  sync();
}

/* ------------------------------------------------------------------ countdown */
function setupCountdown() {
  $$('[data-countdown]').forEach((el) => {
    const start = Date.parse(el.dataset.start ?? '');
    const end = Date.parse(el.dataset.end ?? '');
    const box = el.parentElement!;
    const set = (k: string, v: number) => { const n = $(`[data-cd="${k}"]`, el); if (n) n.textContent = String(v).padStart(2, '0'); };
    const tick = () => {
      const now = Date.now();
      const diff = start - now;
      if (diff <= 0) {
        el.hidden = true;
        const lbl = $('[data-cd-label]', box);
        if (lbl) lbl.hidden = true;
        const running = $('[data-cd-running]', box);
        if (running && now < end) running.hidden = false;
        return;
      }
      set('d', Math.floor(diff / 864e5));
      set('h', Math.floor((diff % 864e5) / 36e5));
      set('m', Math.floor((diff % 36e5) / 6e4));
    };
    tick();
    setInterval(tick, 20_000);
  });
}

/* ------------------------------------------------------------------ filters (curriculum + team) */
function setupFilters() {
  $$('[data-filter-root]').forEach((rootEl) => {
    const items = $$('[data-filter-item]', rootEl);
    const chips = $$<HTMLButtonElement>('[data-filter]', rootEl);
    const text = $<HTMLInputElement>('[data-filter-text]', rootEl);
    const count = $('[data-filter-count]', rootEl);
    const empty = $('[data-filter-empty]', rootEl);
    const state: Record<string, string> = {};
    const apply = () => {
      const q = norm(text?.value ?? '').trim();
      let visible = 0;
      const shown: HTMLElement[] = [];
      items.forEach((it) => {
        const ok =
          Object.entries(state).every(([k, v]) => v === 'all' || it.dataset[k] === v) &&
          (!q || norm(it.textContent ?? '').includes(q));
        it.classList.toggle('is-filtered', !ok);
        if (ok) { visible++; shown.push(it); }
      });
      if (count) count.textContent = `${visible} ${visible === 1 ? count.dataset.one : count.dataset.many}`;
      if (empty) empty.hidden = visible > 0;
      if (!reduced) gsap.fromTo(shown, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.025, overwrite: true });
      ScrollTrigger.refresh();
    };
    chips.forEach((chip) => {
      const key = chip.dataset.filter!;
      if (chip.getAttribute('aria-pressed') === 'true') state[key] = chip.dataset.value!;
      chip.addEventListener('click', () => {
        chips.filter((c) => c.dataset.filter === key).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        state[key] = chip.dataset.value!;
        apply();
      });
    });
    text?.addEventListener('input', apply);
    // reveal items immediately (they are filtered rather than scrolled into view)
    items.forEach((it) => { it.style.opacity = '1'; });
  });

  // Deep link to a curriculum topic: /curriculum/#sst → highlight
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (target?.hasAttribute('data-filter-item')) {
    setTimeout(() => {
      lenis ? lenis.scrollTo(target, { offset: -120 }) : target.scrollIntoView();
      gsap.fromTo(target, { backgroundColor: 'rgba(94,138,104,0.14)' }, { backgroundColor: 'rgba(94,138,104,0)', duration: 2.4, delay: 0.6 });
    }, 400);
  }
}

/* ------------------------------------------------------------------ hero */
async function setupHero(introDone: Promise<void>, quick: boolean) {
  if (!heroEl) return;
  const title = $('[data-hero-title]', heroEl);
  const sub = $('[data-hero-sub]', heroEl);
  const foot = $('[data-hero-foot]', heroEl);
  const { initHero } = await import('./hero');
  const hero = initHero(heroEl, { reduced, quick });
  await introDone;
  hero.reveal();
  if (reduced) {
    gsap.set([title, sub, foot], { opacity: 1 });
    return;
  }
  try { await document.fonts.ready; } catch { /* ignore */ }
  if (title) {
    SplitText.create(title, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => {
        gsap.set(title, { opacity: 1 });
        return gsap.from(self.lines, { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.1, delay: 0.1 });
      },
    });
  }
  if (sub) gsap.fromTo(sub, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 0.65 });
  if (foot) gsap.to(foot, { opacity: 1, duration: 1.4, delay: 1.05 });
  // Parallax the headline out as the hero leaves the viewport.
  gsap.to($('.hero__content', heroEl), {
    yPercent: -18,
    opacity: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* ------------------------------------------------------------------ boot */
async function boot() {
  let introSeen = false;
  try { introSeen = sessionStorage.getItem('prs-intro') === '1'; } catch { /* private mode */ }
  const introDone = playIntro();
  setupHero(introDone, introSeen);
  setupQuotes();
  setupCountdown();
  setupFilters();
  setupLoupes();
  try { await document.fonts.ready; } catch { /* ignore */ }
  setupReveals();
  setupCounters();
  root.classList.add('motion-ready');
  // Evaluate triggers now rather than waiting for window "load" (remote paintings can delay it).
  requestAnimationFrame(() => ScrollTrigger.refresh());

  const illos = $$<HTMLCanvasElement>('canvas[data-illo]');
  if (illos.length) import('./illustrations').then((m) => m.initIllustrations(illos, { reduced }));
  const globe = $('[data-globe]');
  if (globe) import('./globe').then((m) => m.initGlobe(globe, { reduced }));

  addEventListener('load', () => ScrollTrigger.refresh());
}
boot();
