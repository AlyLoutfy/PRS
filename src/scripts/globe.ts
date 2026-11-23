// Dotted orthographic globe with office markers and great-circle arcs from Zug. Canvas 2D, no deps.
interface Marker { key: string; lat: number; lon: number; hq: boolean; label: string }
const D2R = Math.PI / 180;
const INK = '53, 52, 47';
const BLUE = '0, 111, 181';
const RUST = '191, 71, 44';

export function initGlobe(root: HTMLElement, opts: { reduced: boolean }) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const raw = JSON.parse(root.querySelector('[data-globe-data]')?.textContent ?? '{"dots":[],"markers":[]}');
  const flat: number[] = raw.dots;
  const markers: Marker[] = raw.markers;

  // Precompute trig for every land dot.
  const n = flat.length / 2;
  const cosLat = new Float32Array(n), sinLat = new Float32Array(n), cosLon = new Float32Array(n), sinLon = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lon = flat[i * 2] * D2R, lat = flat[i * 2 + 1] * D2R;
    cosLat[i] = Math.cos(lat); sinLat[i] = Math.sin(lat); cosLon[i] = Math.cos(lon); sinLon[i] = Math.sin(lon);
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, R = 0, cx = 0, cy = 0;
  const size = () => {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.44; cx = W / 2; cy = H / 2;
  };
  size();
  new ResizeObserver(() => { size(); if (opts.reduced) draw(0); }).observe(canvas);

  // View state (centre of the visible hemisphere).
  const view = { lon: -32, lat: 16 };
  const vel = { lon: 0, lat: 0 };
  let dragging = false;
  let focus: Marker | null = null;
  let focusT = 0;
  let idleSince = performance.now();

  const project = (cl: number, sl: number, co: number, so: number, alt = 1) => {
    const l0 = view.lon * D2R, p0 = view.lat * D2R;
    const cdl = co * Math.cos(l0) + so * Math.sin(l0); // cos(λ-λ0)
    const sdl = so * Math.cos(l0) - co * Math.sin(l0); // sin(λ-λ0)
    const x = cl * sdl;
    const y = Math.cos(p0) * sl - Math.sin(p0) * cl * cdl;
    const z = Math.sin(p0) * sl + Math.cos(p0) * cl * cdl;
    return { x: cx + R * alt * x, y: cy - R * alt * y, z };
  };
  const projLL = (lon: number, lat: number, alt = 1) =>
    project(Math.cos(lat * D2R), Math.sin(lat * D2R), Math.cos(lon * D2R), Math.sin(lon * D2R), alt);

  // Great-circle interpolation between two markers.
  const toVec = (m: { lon: number; lat: number }) => [Math.cos(m.lat * D2R) * Math.cos(m.lon * D2R), Math.cos(m.lat * D2R) * Math.sin(m.lon * D2R), Math.sin(m.lat * D2R)];
  const hq = markers.find((m) => m.hq)!;
  const arcs = markers
    .filter((m) => !m.hq)
    .map((m, i) => {
      const a = toVec(hq), b = toVec(m);
      const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      const om = Math.acos(dot);
      const pts: { lon: number; lat: number; alt: number }[] = [];
      const steps = 64;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const k1 = Math.sin((1 - t) * om) / Math.sin(om), k2 = Math.sin(t * om) / Math.sin(om);
        const v = [k1 * a[0] + k2 * b[0], k1 * a[1] + k2 * b[1], k1 * a[2] + k2 * b[2]];
        pts.push({ lon: Math.atan2(v[1], v[0]) / D2R, lat: Math.asin(Math.max(-1, Math.min(1, v[2]))) / D2R, alt: 1 + Math.sin(Math.PI * t) * 0.16 * (om / Math.PI + 0.35) });
      }
      return { pts, offset: i * 0.37 };
    });

  function draw(t: number) {
    ctx.clearRect(0, 0, W, H);
    // sphere
    const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#ecebe7');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(${INK}, 0.16)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // land dots (far side faintly, near side with depth shading)
    for (let i = 0; i < n; i++) {
      const p = project(cosLat[i], sinLat[i], cosLon[i], sinLon[i]);
      if (p.z < 0) {
        if (p.z > -0.6) { ctx.fillStyle = `rgba(${INK}, 0.045)`; ctx.fillRect(p.x - 0.6, p.y - 0.6, 1.2, 1.2); }
        continue;
      }
      const r = 0.75 + p.z * 0.75;
      ctx.fillStyle = `rgba(${INK}, ${0.16 + p.z * 0.62})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    }

    // arcs from Zug
    arcs.forEach((arc) => {
      const prog = opts.reduced ? 1 : Math.min(1, ((t * 0.18 + arc.offset) % 1.6) / 1.0);
      const last = Math.floor(prog * (arc.pts.length - 1));
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      let pen = false;
      for (let s = 0; s <= last; s++) {
        const q = arc.pts[s];
        const p = projLL(q.lon, q.lat, q.alt);
        if (p.z < -0.05) { pen = false; continue; }
        pen ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
        pen = true;
      }
      ctx.strokeStyle = `rgba(${BLUE}, 0.7)`;
      ctx.stroke();
      if (prog < 1 && last > 0) {
        const q = arc.pts[last];
        const p = projLL(q.lon, q.lat, q.alt);
        if (p.z > 0) { ctx.fillStyle = `rgba(${BLUE}, 1)`; ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2); ctx.fill(); }
      }
    });

    // markers
    ctx.font = '500 11px "Inter Variable", Inter, "Helvetica Neue", Arial, sans-serif';
    ctx.textBaseline = 'middle';
    markers.forEach((m, i) => {
      const p = projLL(m.lon, m.lat);
      if (p.z < 0.02) return;
      const col = m.hq ? BLUE : RUST;
      const isFocus = focus?.key === m.key;
      const pulse = opts.reduced ? 0 : (t * 0.9 + i * 0.23) % 1;
      if (!opts.reduced) {
        ctx.strokeStyle = `rgba(${col}, ${0.55 * (1 - pulse)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4 + pulse * 16, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = `rgba(${col}, 1)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, m.hq ? 4.2 : 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${INK}, ${isFocus ? 1 : 0.78})`;
      ctx.font = `${isFocus ? 600 : 500} 11px "Inter Variable", Inter, "Helvetica Neue", Arial, sans-serif`;
      // Zug and Ljubljana sit close together: label the headquarters on the left.
      ctx.textAlign = m.hq ? 'right' : 'left';
      ctx.fillText(m.label, m.hq ? p.x - 10 : p.x + 10, p.y);
      ctx.textAlign = 'left';
    });
  }

  // Interaction: drag with inertia.
  let lastX = 0, lastY = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; focus = null; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const k = 140 / R;
    vel.lon = -(e.clientX - lastX) * k;
    vel.lat = (e.clientY - lastY) * k;
    view.lon += vel.lon;
    view.lat = Math.max(-60, Math.min(70, view.lat + vel.lat));
    lastX = e.clientX; lastY = e.clientY;
    if (opts.reduced) draw(0);
  });
  const end = () => { dragging = false; idleSince = performance.now(); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  // Office list ↔ globe.
  document.querySelectorAll<HTMLElement>('[data-office]').forEach((el) => {
    const m = markers.find((x) => x.key === el.dataset.office);
    if (!m) return;
    const on = () => {
      focus = m; focusT = 0;
      document.querySelectorAll('[data-office]').forEach((o) => o.classList.toggle('is-active', o === el));
      if (opts.reduced) { view.lon = m.lon; view.lat = Math.max(-40, Math.min(55, m.lat)); draw(0); }
    };
    const off = () => { el.classList.remove('is-active'); idleSince = performance.now(); };
    el.addEventListener('pointerenter', on);
    el.addEventListener('focus', on);
    el.addEventListener('pointerleave', off);
    el.addEventListener('blur', off);
  });

  if (opts.reduced) { draw(0); return; }

  let visible = false, raf = 0, prev = performance.now(), t = 0;
  const base = { lon: view.lon };
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    t += dt;
    if (focus) {
      focusT = Math.min(1, focusT + dt * 1.4);
      const k = 1 - Math.exp(-dt * 4.5);
      let dl = focus.lon - view.lon;
      dl = ((dl + 540) % 360) - 180;
      view.lon += dl * k;
      view.lat += (Math.max(-40, Math.min(55, focus.lat)) - view.lat) * k;
      base.lon = view.lon;
    } else if (!dragging) {
      vel.lon *= 0.94; vel.lat *= 0.94;
      view.lon += vel.lon; view.lat = Math.max(-60, Math.min(70, view.lat + vel.lat));
      if (now - idleSince > 1800) view.lon += dt * 3.2;
    }
    draw(t);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) { prev = performance.now(); raf = requestAnimationFrame(frame); }
  }).observe(canvas);
}
