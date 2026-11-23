// Site-wide behaviour (v2): smooth scroll, header, menu, search, reveals and motion, counters, loupe,
// carousel, filters, curriculum selection, upcoming-event notice. Page-specific pieces (hero relief,
// illustrations, globe, enquiry form) are loaded on demand at the end of this file.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { lead } from './lead-store';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => Array.from(el.querySelectorAll<T>(s));
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ­]/g, '');
const dur = (seconds: number) => (reduced ? 0 : seconds);

/* ------------------------------------------------------------------ smooth scroll */
const headerSpace = () => (parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 64) + 34;
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: { offset: -headerSpace() } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToEl = (target: Element | number, offset = -headerSpace()) => {
  if (lenis) lenis.scrollTo(target as HTMLElement | number, { offset: typeof target === 'number' ? 0 : offset });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset });
};

// Scroll lock shared by the overlays (menu, search); everything behind them becomes inert.
let locks = 0;
const background = () => $$('main, .site-footer, [data-toast], [data-shortlist-bar]');
function lock(on: boolean) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  const active = locks > 0;
  if (active && !root.classList.contains('is-locked')) root.style.setProperty('--sbw', `${Math.max(0, innerWidth - root.clientWidth)}px`);
  if (!active) root.style.setProperty('--sbw', '0px');
  root.classList.toggle('is-locked', active);
  active ? lenis?.stop() : lenis?.start();
  background().forEach((el) => { (el as HTMLElement).inert = active; });
}

/* ------------------------------------------------------------------ header */
const header = $('[data-header]');
const heroEl = $('[data-hero]');
let lastY = 0;
let menuOpen = false;
function onScroll(y: number) {
  if (!header) return;
  header.classList.toggle('is-scrolled', y > 120);
  const max = root.scrollHeight - innerHeight;
  header.style.setProperty('--progress', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
  const focusInside = header.contains(document.activeElement);
  if (y > 320 && y > lastY + 4 && !menuOpen && !focusInside) header.classList.add('is-hidden');
  else if (y < lastY - 4 || y < 320) header.classList.remove('is-hidden');
  root.classList.toggle('header-away', header.classList.contains('is-hidden'));
  lastY = y;
}
if (lenis) lenis.on('scroll', ({ scroll }: { scroll: number }) => onScroll(scroll));
else addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
onScroll(window.scrollY);
header?.addEventListener('focusin', () => { header.classList.remove('is-hidden'); root.classList.remove('header-away'); });
$('[data-to-top]')?.addEventListener('click', (e) => { e.preventDefault(); scrollToEl(0); $<HTMLElement>('.logo')?.focus({ preventScroll: true }); });

/* ------------------------------------------------------------------ menu */
const menu = $('[data-menu]');
const menuPanel = $('[data-menu-panel]');
const menuBtn = $<HTMLButtonElement>('[data-menu-toggle]');
let menuTl: gsap.core.Timeline | null = null;
// The panel opens out of the header bar: its clip starts as the bar's rectangle.
function barClip(): string {
  const bar = $('.site-header__bar')?.getBoundingClientRect();
  const panel = menuPanel?.getBoundingClientRect();
  if (!bar || !panel) return 'inset(0px 0px 100% 0px round 8px)';
  const r = (n: number) => Math.max(0, Math.round(n));
  return `inset(${r(bar.top - panel.top)}px ${r(panel.right - bar.right)}px ${r(panel.bottom - bar.bottom)}px ${r(bar.left - panel.left)}px round 8px)`;
}
function openMenu() {
  if (!menu || !menuPanel || menuOpen) return;
  menuOpen = true;
  menu.inert = false;
  menu.classList.add('is-open');
  root.classList.add('menu-open');
  header?.classList.remove('is-hidden');
  menuBtn?.setAttribute('aria-expanded', 'true');
  menuBtn?.setAttribute('aria-label', menuBtn.dataset.labelClose ?? '');
  lock(true);
  menuPanel.scrollTop = 0;
  const desktop = matchMedia('(min-width: 960px)').matches;
  menuTl?.kill();
  menuTl = gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .to($('.menu__scrim', menu), { opacity: 1, duration: dur(0.5) }, 0)
    .fromTo(menuPanel, { clipPath: barClip() }, { clipPath: `inset(0px 0px 0px 0px round ${desktop ? 8 : 0}px)`, duration: dur(0.9), ease: 'expo.inOut' }, 0)
    .fromTo($$('[data-menu-rule]', menu), { scaleX: 0 }, { scaleX: 1, duration: dur(1.1), stagger: 0.08 }, 0.3)
    .fromTo($$('[data-menu-item]', menu), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: dur(0.8), stagger: 0.028 }, 0.32);
  setTimeout(() => $<HTMLAnchorElement>('.menu__col-title a', menu)?.focus({ preventScroll: true }), reduced ? 0 : 350);
}
function closeMenu(focusBack = true) {
  if (!menu || !menuPanel || !menuOpen) return;
  menuOpen = false;
  menuBtn?.setAttribute('aria-expanded', 'false');
  menuBtn?.setAttribute('aria-label', menuBtn.dataset.labelOpen ?? '');
  root.classList.remove('menu-open');
  menuTl?.kill();
  menuTl = gsap
    .timeline({
      defaults: { ease: 'expo.inOut' },
      onComplete: () => {
        menu.classList.remove('is-open');
        menu.inert = true;
        gsap.set(menuPanel, { clearProps: 'clipPath' });
      },
    })
    .to($$('[data-menu-item]', menu), { opacity: 0, duration: dur(0.2), ease: 'power1.out' }, 0)
    .to(menuPanel, { clipPath: barClip(), duration: dur(0.6) }, 0.05)
    .to($('.menu__scrim', menu), { opacity: 0, duration: dur(0.45) }, 0.1);
  lock(false);
  if (focusBack) menuBtn?.focus({ preventScroll: true });
}
menuBtn?.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
$$('[data-menu-close]').forEach((b) => b.addEventListener('click', () => closeMenu()));
menu?.addEventListener('click', (e) => {
  const a = (e.target as Element).closest('a');
  if (a && a.hash && a.pathname === location.pathname) closeMenu(false);
});
// Leaving the breakpoint with the menu open would strand the clip-path animation: close it.
matchMedia('(min-width: 960px)').addEventListener('change', () => closeMenu(false));

/* ------------------------------------------------------------------ search (⌘K) */
type Item = { g: 'pages' | 'courses' | 'people'; t: string; d: string; u: string; m?: string; n?: string };
const searchEl = $('[data-search]');
const searchInput = $<HTMLInputElement>('[data-search-input]');
const results = $('[data-search-results]');
let searchData: { groups: Record<string, string>; empty: string; items: Item[] } | null = null;
let active = 0;
let current: Item[] = [];
let searchReturn: HTMLElement | null = null;
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
    results.innerHTML = `<p class="search__empty" role="status">${esc(searchData.empty)} “${esc(q)}”</p>`;
    searchInput?.removeAttribute('aria-activedescendant');
    return;
  }
  const firstTok = q.trim().split(/\s+/)[0] ?? '';
  let html = '';
  let idx = 0;
  for (const g of groups) {
    const list = current.filter((i) => i.g === g);
    if (!list.length) continue;
    html += `<div class="search__group meta" role="presentation">${esc(searchData.groups[g])}</div>`;
    for (const i of list) {
      html += `<a class="search__item" role="option" id="sr-${idx}" href="${esc(i.u)}" aria-selected="${idx === 0}" tabindex="-1">
        <b>${highlight(i.t, firstTok)}</b>${i.m ? `<em>${esc(i.m)}</em>` : ''}<small>${highlight(i.d.length > 150 ? `${i.d.slice(0, 150)}…` : i.d, firstTok)}</small></a>`;
      idx++;
    }
  }
  results.innerHTML = html;
  results.scrollTop = 0;
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
const searchIsOpen = () => !!searchEl?.classList.contains('is-open');
function openSearch() {
  if (!searchEl || searchIsOpen()) return;
  if (!searchData) {
    searchData = JSON.parse($('[data-search-index]', searchEl)?.textContent ?? '{"groups":{},"empty":"","items":[]}');
    searchData!.items.forEach((i) => (i.n = norm(`${i.t} ${i.d} ${i.m ?? ''}`)));
  }
  if (menuOpen) closeMenu(false);
  searchReturn = document.activeElement as HTMLElement | null;
  searchEl.classList.add('is-open');
  lock(true);
  if (header) header.inert = true;
  runSearch(searchInput?.value ?? '');
  const panel = $('[data-search-panel]', searchEl);
  const sheet = matchMedia('(max-width: 719px), (max-height: 520px)').matches;
  gsap.fromTo(panel, sheet ? { y: 28, opacity: 0 } : { y: -16, opacity: 0, scale: 0.985 }, { y: 0, opacity: 1, scale: 1, duration: dur(0.5), ease: 'expo.out', clearProps: 'transform' });
  gsap.fromTo($('.search__scrim', searchEl), { opacity: 0 }, { opacity: 1, duration: dur(0.35) });
  requestAnimationFrame(() => searchInput?.focus());
}
function closeSearch() {
  if (!searchEl || !searchIsOpen()) return;
  searchEl.classList.remove('is-open');
  if (header) header.inert = false;
  lock(false);
  searchReturn?.focus?.({ preventScroll: true });
}
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
// Keep Tab inside the dialog (input ↔ close button).
searchEl?.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const stops = [searchInput, $<HTMLElement>('.search__close', searchEl)].filter(Boolean) as HTMLElement[];
  const i = stops.indexOf(document.activeElement as HTMLElement);
  e.preventDefault();
  stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length]?.focus();
});
addEventListener('keydown', (e) => {
  const typing = /input|textarea|select/i.test((e.target as Element)?.tagName ?? '');
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    searchIsOpen() ? closeSearch() : openSearch();
  } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    openSearch();
  } else if (e.key === 'Escape') {
    if (searchIsOpen()) closeSearch();
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
      .add(() => { el.classList.add('is-done'); if (!locks) lenis?.start(); });
  });
}

/* ------------------------------------------------------------------ reveals */
function splitLines(el: HTMLElement, vars: gsap.TweenVars, trigger: boolean) {
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'line',
    aria: 'none',
    autoSplit: true,
    onSplit(self) {
      gsap.set(el, { opacity: 1 });
      return gsap.from(self.lines, {
        yPercent: 112,
        duration: 1.15,
        ease: 'expo.out',
        stagger: 0.085,
        ...vars,
        ...(trigger ? { scrollTrigger: { trigger: el, start: 'top 90%', once: true } } : {}),
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
  // Once revealed, an element drops its data-reveal attribute (the hidden state in the stylesheet) and
  // its inline styles, so no transform is left behind.
  const settle = (els: Element[], props: string) => {
    els.forEach((el) => el.removeAttribute('data-reveal'));
    gsap.set(els, { clearProps: props });
  };
  batchReveal('[data-reveal="fade"]', '0px 0px -6% 0px', (els) =>
    gsap.to(els, { opacity: 1, y: 0, duration: 1.05, ease: 'expo.out', stagger: 0.07, onComplete: () => settle(els, 'opacity,transform') }),
  );
  batchReveal('[data-rule]', '0px 0px -4% 0px', (els) =>
    gsap.to(els, { scaleX: 1, duration: 1.5, ease: 'expo.inOut', stagger: 0.1 }),
  );
  $$('[data-reveal="media"]').forEach((el) => {
    const inner = $('img, canvas', el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'expo.inOut', onComplete: () => settle([el], 'clipPath') });
    if (inner && !inner.hasAttribute('data-parallax')) tl.from(inner, { scale: 1.22, duration: 1.9, ease: 'expo.out', clearProps: 'transform' }, 0.05);
  });

  // Contour drawings draw themselves in.
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
      scrollTrigger: { trigger: svg, start: 'top 92%', once: true },
    });
  });

  // Approach graphics: outlines draw, then the "shared" mark keeps passing a dot from one vessel to the next.
  $$('[data-draw]').forEach((mark) => {
    const paths = $$<SVGGeometryElement>('[data-draw-path]', mark);
    const dot = $<SVGCircleElement>('[data-mark-dot]', mark);
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    gsap.set(mark, { visibility: 'visible' });
    if (dot) gsap.set(dot, { opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: mark, start: 'top 88%', once: true } });
    tl.to(paths, { strokeDashoffset: 0, duration: 1.5, ease: 'expo.inOut', stagger: 0.12 });
    if (dot) {
      const loop = gsap
        .timeline({ repeat: -1, repeatDelay: 1.1, paused: true })
        .fromTo(dot, { attr: { cx: 50 }, opacity: 0 }, { attr: { cx: 54 }, opacity: 1, duration: 0.3, ease: 'power1.out' })
        .to(dot, { attr: { cx: 78 }, duration: 1.1, ease: 'power2.inOut' })
        .to(dot, { opacity: 0, duration: 0.25 }, '-=0.2');
      tl.add(() => { loop.play(); });
      ScrollTrigger.create({ trigger: mark, start: 'top bottom', end: 'bottom top', onLeave: () => loop.pause(), onLeaveBack: () => loop.pause(), onEnter: () => tl.progress() === 1 && loop.play(), onEnterBack: () => loop.play() });
    }
  });

  $$('[data-parallax]').forEach((img) =>
    gsap.fromTo(
      img,
      { yPercent: -6, scale: 1.14 },
      { yPercent: 6, scale: 1.14, ease: 'none', scrollTrigger: { trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true } },
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
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });
}

/* ------------------------------------------------------------------ painting loupe */
function setupLoupes() {
  if (!finePointer) return;
  const ZOOM = 2.4;
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

/* ------------------------------------------------------------------ testimonials carousel */
function setupQuotes() {
  $$('[data-quotes]').forEach((track) => {
    const nav = track.parentElement ? $('[data-quotes-nav]', track.parentElement) : null;
    const prev = nav ? $<HTMLButtonElement>('[data-quotes-prev]', nav) : null;
    const next = nav ? $<HTMLButtonElement>('[data-quotes-next]', nav) : null;
    const count = nav ? $('[data-quotes-count]', nav) : null;
    const slides = Array.from(track.children) as HTMLElement[];
    const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      if (nav) nav.hidden = max <= 4;
      track.tabIndex = max <= 4 ? -1 : 0;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
      if (count) count.textContent = `${Math.min(slides.length, Math.round(track.scrollLeft / Math.max(1, step())) + 1)} / ${slides.length}`;
    };
    const go = (dir: number) => track.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' });
    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(1));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    track.addEventListener('scroll', sync, { passive: true });
    new ResizeObserver(sync).observe(track);
    sync();
  });
}

/* ------------------------------------------------------------------ countdown */
function setupCountdown() {
  $$('[data-countdown]').forEach((el) => {
    const start = Date.parse(el.dataset.start ?? '');
    const end = Date.parse(el.dataset.end ?? '');
    const box = el.parentElement!;
    const set = (k: string, v: number) => {
      const n = $(`[data-cd="${k}"]`, el);
      const text = String(v).padStart(2, '0');
      if (!n || n.textContent === text) return;
      const first = n.textContent === '–';
      n.textContent = text;
      if (!reduced && !first) gsap.fromTo(n, { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' });
    };
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
    setInterval(tick, 15_000);
  });
}

/* ------------------------------------------------------------------ filters (curriculum + team) */
async function setupFilters() {
  const roots = $$('[data-filter-root]');
  if (!roots.length) return;
  // The list animation (GSAP Flip) is only fetched on pages that filter a list.
  const Flip = reduced ? null : (await import('gsap/Flip')).Flip;
  if (Flip) gsap.registerPlugin(Flip);
  roots.forEach((rootEl) => {
    const items = $$('[data-filter-item]', rootEl);
    const chips = $$<HTMLButtonElement>('[data-filter]', rootEl);
    const text = $<HTMLInputElement>('[data-filter-text]', rootEl);
    const count = $('[data-filter-count]', rootEl);
    const empty = $('[data-filter-empty]', rootEl);
    const reset = $<HTMLButtonElement>('[data-filter-reset]', rootEl);
    const state: Record<string, string> = {};
    const haystack = new Map(items.map((it) => [it, norm(it.textContent ?? '')]));
    const apply = (animate = true) => {
      const q = norm(text?.value ?? '').trim();
      const before = animate && Flip ? Flip.getState(items) : null;
      let visible = 0;
      items.forEach((it) => {
        const ok = Object.entries(state).every(([k, v]) => v === 'all' || it.dataset[k] === v) && (!q || haystack.get(it)!.includes(q));
        it.classList.toggle('is-filtered', !ok);
        if (ok) visible++;
      });
      if (count) count.textContent = `${visible} ${visible === 1 ? count.dataset.one : count.dataset.many}`;
      if (empty) empty.hidden = visible > 0;
      if (reset) reset.hidden = !q && Object.values(state).every((v) => v === 'all');
      if (before && Flip) {
        Flip.from(before, {
          duration: 0.7,
          ease: 'expo.out',
          absoluteOnLeave: true,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.03 }),
          onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2 }),
          onComplete: () => ScrollTrigger.refresh(),
        });
      } else {
        ScrollTrigger.refresh();
      }
    };
    chips.forEach((chip) => {
      const key = chip.dataset.filter!;
      if (chip.getAttribute('aria-pressed') === 'true') state[key] = chip.dataset.value!;
      chip.addEventListener('click', () => {
        chips.filter((c) => c.dataset.filter === key).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        state[key] = chip.dataset.value!;
        apply();
        chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
      });
    });
    let timer = 0;
    text?.addEventListener('input', () => { clearTimeout(timer); timer = window.setTimeout(() => apply(), 140); });
    reset?.addEventListener('click', () => {
      if (text) text.value = '';
      Object.keys(state).forEach((key) => { state[key] = 'all'; });
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === 'all')));
      apply();
    });
    // Items are filtered rather than scrolled into view: show them right away.
    items.forEach((it) => { it.style.opacity = '1'; });
  });

  const bar = $('[data-filterbar]');
  if (bar) {
    const sentinel = document.createElement('span');
    bar.before(sentinel);
    new IntersectionObserver(([en]) => bar.classList.toggle('is-stuck', !en.isIntersecting && en.boundingClientRect.top < 0)).observe(sentinel);
  }

  // Deep link to a curriculum topic: /curriculum/#sst → highlight
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (target?.hasAttribute('data-filter-item')) {
    setTimeout(() => {
      scrollToEl(target, -(headerSpace() + 110));
      gsap.fromTo(target, { backgroundColor: 'rgba(94,138,104,0.16)' }, { backgroundColor: 'rgba(94,138,104,0)', duration: 2.4, delay: 0.6, clearProps: 'backgroundColor' });
    }, 400);
  }
}

/* ------------------------------------------------------------------ enquiry triggers + curriculum selection */
function focusForm() {
  const form = $('[data-lead-form]');
  if (!form || !finePointer) return;
  setTimeout(() => $<HTMLInputElement>('#lead-name', form)?.focus({ preventScroll: true }), reduced ? 0 : 900);
}
function setupLeadTriggers() {
  // Buttons that hand an item to the form (course format, upcoming event).
  $$('[data-lead-add]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      lead.add({ id: trigger.dataset.leadAdd!, label: trigger.dataset.leadLabel ?? '' }, trigger.dataset.leadTopic);
      if ((trigger as HTMLAnchorElement).hash && (trigger as HTMLAnchorElement).pathname === location.pathname) focusForm();
    });
  });
  $$<HTMLAnchorElement>('a[href$="#enquiry"]').forEach((a) => a.addEventListener('click', () => { if (a.pathname === location.pathname) focusForm(); }));

  // Curriculum: collect topics, then send them in one enquiry.
  const adders = $$<HTMLButtonElement>('[data-course-add]');
  const bar = $('[data-shortlist-bar]');
  if (!adders.length) return;
  const countEl = bar ? $('[data-shortlist-count]', bar) : null;
  const labelEl = bar ? $('[data-shortlist-label]', bar) : null;
  let formInView = false;
  let shown = -1;
  const render = () => {
    adders.forEach((btn) => {
      const on = lead.has(btn.dataset.courseAdd!);
      btn.setAttribute('aria-pressed', String(on));
      const label = $('[data-add-label]', btn);
      if (label) label.textContent = on ? btn.dataset.labelAdded! : btn.dataset.labelAdd!;
      btn.closest('.course')?.classList.toggle('is-selected', on);
    });
    const n = lead.get().tags.filter((t) => t.id.startsWith('course:')).length;
    if (countEl && labelEl) {
      countEl.textContent = String(n || shown > 0 ? n : 0);
      labelEl.textContent = n === 1 ? labelEl.dataset.one! : labelEl.dataset.many!;
      if (!reduced && shown >= 0 && n !== shown && n > 0) gsap.fromTo(countEl, { scale: 1.5 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    }
    shown = n;
    bar?.classList.toggle('is-visible', n > 0 && !formInView);
  };
  adders.forEach((btn) =>
    btn.addEventListener('click', () => {
      lead.toggle({ id: btn.dataset.courseAdd!, label: btn.dataset.leadLabel ?? '' }, 'academy');
    }),
  );
  $('[data-shortlist-clear]', bar ?? document)?.addEventListener('click', () => lead.clear('course:'));
  const section = $('[data-lead-section]');
  if (section) new IntersectionObserver(([en]) => { formInView = en.isIntersecting; render(); }, { rootMargin: '0px 0px -30% 0px' }).observe(section);
  lead.subscribe(render);
  render();
}

/* ------------------------------------------------------------------ upcoming-event notice */
function setupToast() {
  const toast = $('[data-toast]');
  if (!toast) return;
  const key = `prs-toast-${toast.dataset.key}`;
  const ended = Date.now() > Date.parse(toast.dataset.end ?? '');
  let dismissed = false;
  try { dismissed = localStorage.getItem(key) === '1'; } catch { /* private mode */ }
  if (ended || dismissed) return;
  toast.hidden = false;
  let open = false;
  const show = () => { if (open || dismissed) return; open = true; toast.classList.add('is-visible'); };
  const hide = () => {
    dismissed = true;
    toast.classList.remove('is-visible');
    try { localStorage.setItem(key, '1'); } catch { /* private mode */ }
    setTimeout(() => { toast.hidden = true; }, 900);
  };
  // Only once the visitor is clearly reading: some seconds in and more than a screen down the page.
  const started = performance.now();
  const check = () => {
    if (performance.now() - started > 8000 && window.scrollY > innerHeight * 1.1) { show(); removeEventListener('scroll', check); }
  };
  addEventListener('scroll', check, { passive: true });
  $('[data-toast-close]', toast)?.addEventListener('click', hide);
  $('.toast__link', toast)?.addEventListener('click', () => { try { localStorage.setItem(key, '1'); } catch { /* ignore */ } });
  // Step aside while the enquiry form is on screen.
  const section = $('[data-lead-section]');
  if (section) new IntersectionObserver(([en]) => toast.classList.toggle('is-visible', open && !dismissed && !en.isIntersecting)).observe(section);
}

/* ------------------------------------------------------------------ magnetic buttons (mouse only) */
function setupMagnetic() {
  if (!finePointer || reduced) return;
  $$('[data-magnetic]').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * 10);
      yTo(((e.clientY - r.top) / r.height - 0.5) * 8);
    });
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ------------------------------------------------------------------ hero */
async function setupHero(introDone: Promise<void>, quick: boolean) {
  if (!heroEl) return;
  const title = $('[data-hero-title]', heroEl);
  const sub = $('[data-hero-sub]', heroEl);
  const actions = $('[data-hero-actions]', heroEl);
  const foot = $('[data-hero-foot]', heroEl);
  const { initHero } = await import('./hero');
  const hero = initHero(heroEl, { reduced, quick });
  await introDone;
  hero.reveal();
  if (reduced) {
    gsap.set([title, sub, actions, foot], { opacity: 1 });
    return;
  }
  try { await document.fonts.ready; } catch { /* ignore */ }
  if (title) {
    SplitText.create(title, {
      type: 'lines',
      mask: 'lines',
      aria: 'none',
      autoSplit: true,
      onSplit: (self) => {
        gsap.set(title, { opacity: 1 });
        return gsap.from(self.lines, { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.1, delay: 0.1 });
      },
    });
  }
  // First visit: the header bar arrives together with the headline.
  if (!quick && !location.hash) gsap.from($('.site-header__bar'), { y: -28, opacity: 0, duration: 1.2, ease: 'expo.out', delay: 0.2, clearProps: 'transform,opacity' });
  if (sub) gsap.fromTo(sub, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 0.6 });
  if (actions) {
    gsap.set(actions, { opacity: 1 });
    gsap.fromTo(actions.children, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', delay: 0.8, stagger: 0.09, clearProps: 'transform' });
  }
  if (foot) gsap.to(foot, { opacity: 1, duration: 1.4, delay: 1.15 });
  // The copy drifts up and fades as the hero leaves the viewport.
  gsap.to($('.hero__content', heroEl), {
    yPercent: -14,
    opacity: 0.15,
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
  setupLeadTriggers();
  setupToast();
  setupMagnetic();

  const form = $<HTMLFormElement>('[data-lead-form]');
  if (form) import('./form').then((m) => m.initLeadForm(form, { reduced }));

  try { await document.fonts.ready; } catch { /* ignore */ }
  setupReveals();
  setupCounters();
  root.classList.add('motion-ready');
  // Evaluate triggers now rather than waiting for window "load".
  requestAnimationFrame(() => ScrollTrigger.refresh());

  const illos = $$<HTMLCanvasElement>('canvas[data-illo]');
  if (illos.length) import('./illustrations').then((m) => m.initIllustrations(illos, { reduced }));
  const globe = $('[data-globe]');
  if (globe) import('./globe').then((m) => m.initGlobe(globe, { reduced }));

  addEventListener('load', () => ScrollTrigger.refresh());
}
boot();
