// Generative illustrations for the three service fields. Thin-line, brand-palette, canvas 2D.
const INK = '53, 52, 47';
const BLUE = '0, 111, 181';
const RUST = '191, 71, 44';
const SAGE = '94, 138, 104';
const FONT = '500 10px "Inter Variable", Inter, "Helvetica Neue", Arial, sans-serif';
const rgba = (c: string, a: number) => `rgba(${c}, ${a})`;

interface Scene {
  resize(w: number, h: number): void;
  step(dt: number, t: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  settle?(): void;
}

/* ------------------------------------------------------------------ RNG */
function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (rnd: () => number) => {
  const u = Math.max(1e-9, rnd());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
};

/* ================================================================== 1. Galton board */
function galton(): Scene {
  const R = 10;
  const N = 240;
  let w = 0, h = 0, cx = 0, top = 0, dx = 0, dy = 0, binTop = 0, binBottom = 0, unit = 0;
  type Ball = { path: number[]; k: number; tk: number; fall: number; bin: number; vy: number; y: number; done: boolean };
  let balls: Ball[] = [];
  let bins = new Array(R + 1).fill(0);
  let landed = 0;
  let spawnAcc = 0;
  let phase: 'run' | 'hold' | 'fade' = 'run';
  let phaseT = 0;
  let alpha = 1;
  let rnd = mulberry(7);
  const binom = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  const pmf = Array.from({ length: R + 1 }, (_, j) => binom(R, j) / 2 ** R);

  const xAt = (k: number, s: number) => cx + (s - k / 2) * dx;
  const spawn = () => {
    const path: number[] = [];
    for (let i = 0; i < R; i++) path.push(rnd() < 0.5 ? 0 : 1);
    balls.push({ path, k: 0, tk: 0, fall: 0, bin: path.reduce((a, b) => a + b, 0), vy: 0, y: 0, done: false });
  };
  const reset = () => { balls = []; bins = new Array(R + 1).fill(0); landed = 0; phase = 'run'; alpha = 1; rnd = mulberry(Math.floor(Math.random() * 1e9)); };

  return {
    resize(W, H) {
      w = W; h = H; cx = w / 2;
      top = h * 0.14;
      dy = (h * 0.44) / R;
      dx = Math.min(dy * 1.25, (w * 0.8) / R);
      binTop = top + R * dy + h * 0.05;
      binBottom = h * 0.9;
      unit = (binBottom - binTop) / (N * pmf[R / 2] * 1.18);
    },
    step(dt) {
      if (phase === 'run') {
        spawnAcc += dt;
        while (spawnAcc > 0.055 && landed + balls.length < N) { spawn(); spawnAcc -= 0.055; }
        for (const b of balls) {
          if (b.k < R) {
            b.tk += dt * 8.5;
            while (b.tk >= 1 && b.k < R) { b.tk -= 1; b.k++; }
          } else if (!b.done) {
            b.vy += dt * 900;
            b.y += b.vy * dt;
            const stack = binBottom - bins[b.bin] * unit;
            if (top + R * dy + b.y >= stack - 2) { b.done = true; bins[b.bin]++; landed++; }
          }
        }
        balls = balls.filter((b) => !b.done);
        if (landed >= N) { phase = 'hold'; phaseT = 0; }
      } else if (phase === 'hold') {
        phaseT += dt;
        if (phaseT > 2.2) { phase = 'fade'; phaseT = 0; }
      } else {
        phaseT += dt;
        alpha = Math.max(0, 1 - phaseT / 0.8);
        if (alpha === 0) reset();
      }
    },
    settle() {
      bins = pmf.map((p) => Math.round(p * N));
      landed = N;
      balls = [];
      phase = 'hold';
    },
    draw(ctx) {
      ctx.clearRect(0, 0, w, h);
      // pegs
      ctx.fillStyle = rgba(INK, 0.42);
      for (let k = 0; k < R; k++)
        for (let i = 0; i <= k; i++) { ctx.beginPath(); ctx.arc(xAt(k, i), top + k * dy, 1.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = alpha;
      // bins
      const bw = dx * 0.62;
      for (let j = 0; j <= R; j++) {
        const x = cx + (j - R / 2) * dx;
        const hgt = bins[j] * unit;
        ctx.fillStyle = rgba(BLUE, 0.13);
        ctx.fillRect(x - bw / 2, binBottom - hgt, bw, hgt);
        ctx.strokeStyle = rgba(BLUE, 0.75);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - bw / 2, binBottom - hgt + 0.5); ctx.lineTo(x + bw / 2, binBottom - hgt + 0.5); ctx.stroke();
      }
      // baseline
      ctx.strokeStyle = rgba(INK, 0.35);
      ctx.beginPath(); ctx.moveTo(cx - (R / 2 + 0.7) * dx, binBottom + 0.5); ctx.lineTo(cx + (R / 2 + 0.7) * dx, binBottom + 0.5); ctx.stroke();
      // expected density (normal approximation)
      if (landed > 8) {
        const mu = R / 2, sd = Math.sqrt(R / 4);
        ctx.strokeStyle = rgba(RUST, 0.9);
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        for (let s = -0.6; s <= R + 0.6; s += 0.05) {
          const y = landed * (Math.exp(-((s - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI))) * unit;
          const x = cx + (s - R / 2) * dx;
          s <= -0.55 ? ctx.moveTo(x, binBottom - y) : ctx.lineTo(x, binBottom - y);
        }
        ctx.stroke();
      }
      // balls in flight
      ctx.fillStyle = rgba(BLUE, 1);
      for (const b of balls) {
        let x: number, y: number;
        if (b.k < R) {
          const s0 = b.path.slice(0, b.k).reduce((a, c) => a + c, 0);
          const s1 = s0 + b.path[b.k];
          const x0 = b.k === 0 ? cx : xAt(b.k, s0);
          const x1 = xAt(b.k + 1, s1);
          x = x0 + (x1 - x0) * b.tk;
          y = top + (b.k + b.tk) * dy - Math.sin(Math.PI * b.tk) * dy * 0.32 - dy * 0.35;
        } else {
          x = cx + (b.bin - R / 2) * dx;
          y = top + R * dy + b.y - dy * 0.35;
        }
        ctx.beginPath(); ctx.arc(x, y, 2.1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = rgba(INK, 0.55);
      ctx.font = FONT;
      ctx.textAlign = 'right';
      ctx.fillText(`n = ${landed}`, w - 14, 20);
    },
  };
}

/* ================================================================== 2. Process flow */
function flow(labels: string[]): Scene {
  let w = 0, h = 0;
  const stages = [3, 2, 3, 1];
  type Node = { x: number; y: number; pulse: number };
  let nodes: Node[][] = [];
  type P = { s: number; from: number; to: number; t: number; speed: number; hi: boolean };
  let parts: P[] = [];
  let acc = 0;
  const rnd = mulberry(11);
  const hiPath = [1, 0, 1, 0];

  const bez = (a: Node, b: Node, t: number) => {
    const x0 = a.x + 5, x3 = b.x - 5, cxo = (x3 - x0) * 0.5;
    const mt = 1 - t;
    const x = mt ** 3 * x0 + 3 * mt * mt * t * (x0 + cxo) + 3 * mt * t * t * (x3 - cxo) + t ** 3 * x3;
    const y = mt ** 3 * a.y + 3 * mt * mt * t * a.y + 3 * mt * t * t * b.y + t ** 3 * b.y;
    return { x, y };
  };
  const spawn = () => {
    const hi = rnd() < 0.28;
    const from = hi ? hiPath[0] : Math.floor(rnd() * stages[0]);
    const to = hi ? hiPath[1] : Math.floor(rnd() * stages[1]);
    parts.push({ s: 0, from, to, t: 0, speed: 0.55 + rnd() * 0.35, hi });
  };

  return {
    resize(W, H) {
      w = W; h = H;
      nodes = stages.map((n, s) => {
        const x = w * (0.13 + s * 0.247);
        return Array.from({ length: n }, (_, i) => ({ x, y: n === 1 ? h * 0.47 : h * (0.24 + (i * 0.46) / (n - 1)), pulse: 0 }));
      });
    },
    step(dt) {
      acc += dt;
      while (acc > 0.16) { spawn(); acc -= 0.16; }
      for (const p of parts) {
        p.t += dt * p.speed;
        if (p.t >= 1) {
          const nextStage = p.s + 1;
          nodes[nextStage][p.to].pulse = 1;
          if (nextStage >= stages.length - 1) { p.s = -1; continue; }
          p.s = nextStage;
          p.from = p.to;
          p.to = p.hi ? hiPath[nextStage + 1] : Math.floor(rnd() * stages[nextStage + 1]);
          p.t = 0;
        }
      }
      parts = parts.filter((p) => p.s >= 0);
      nodes.flat().forEach((n) => (n.pulse = Math.max(0, n.pulse - dt * 1.6)));
    },
    settle() {
      parts = [];
    },
    draw(ctx) {
      ctx.clearRect(0, 0, w, h);
      // edges
      for (let s = 0; s < stages.length - 1; s++)
        for (let i = 0; i < stages[s]; i++)
          for (let j = 0; j < stages[s + 1]; j++) {
            const hi = hiPath[s] === i && hiPath[s + 1] === j;
            ctx.strokeStyle = hi ? rgba(BLUE, 0.55) : rgba(INK, 0.16);
            ctx.lineWidth = hi ? 1.3 : 1;
            ctx.beginPath();
            for (let t = 0; t <= 1.0001; t += 0.05) {
              const q = bez(nodes[s][i], nodes[s + 1][j], t);
              t === 0 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y);
            }
            ctx.stroke();
          }
      // particles
      for (const p of parts) {
        const q = bez(nodes[p.s][p.from], nodes[p.s + 1][p.to], p.t);
        ctx.fillStyle = p.hi ? rgba(BLUE, 1) : rgba(INK, 0.62);
        ctx.beginPath(); ctx.arc(q.x, q.y, p.hi ? 2.3 : 1.7, 0, Math.PI * 2); ctx.fill();
      }
      // nodes
      nodes.forEach((col, s) =>
        col.forEach((n) => {
          if (n.pulse > 0) {
            ctx.strokeStyle = rgba(s === stages.length - 1 ? RUST : BLUE, n.pulse * 0.6);
            ctx.lineWidth = 1;
            const r = 6 + (1 - n.pulse) * 12;
            ctx.strokeRect(n.x - r, n.y - r, r * 2, r * 2);
          }
          ctx.fillStyle = '#f2f2f2';
          ctx.strokeStyle = rgba(INK, 0.85);
          ctx.lineWidth = 1;
          const r = s === stages.length - 1 ? 6 : 4.5;
          ctx.fillRect(n.x - r, n.y - r, r * 2, r * 2);
          ctx.strokeRect(n.x - r + 0.5, n.y - r + 0.5, r * 2 - 1, r * 2 - 1);
        }),
      );
      // stage labels
      ctx.font = FONT;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(INK, 0.55);
      labels.forEach((l, s) => nodes[s] && ctx.fillText(l.toUpperCase(), nodes[s][0].x, h * 0.9));
    },
  };
}

/* ================================================================== 3. Tolerance band */
function band(labels: string[]): Scene {
  let w = 0, h = 0, x0 = 0, x1 = 0, mid = 0, amp = 0, bw = 0;
  const STEP = 5;
  let ref: number[] = [];
  let dev: number[] = [];
  let fix: number[] = [];
  let head = 0;
  let phase: 'draw' | 'hold' | 'fade' = 'draw';
  let pt = 0;
  let alpha = 1;
  let seed = 3;
  let n = 0;

  const gen = () => {
    const rnd = mulberry(seed++);
    n = Math.max(8, Math.floor((x1 - x0) / STEP));
    const phi = rnd() * Math.PI * 2;
    ref = Array.from({ length: n }, (_, i) => mid + Math.sin((i / n) * Math.PI * 2.1 + phi) * amp - (i / n - 0.5) * amp * 0.6);
    dev = [];
    let e = 0;
    for (let i = 0; i < n; i++) {
      e = e * 0.9 + gauss(rnd) * bw * 0.16;
      if (rnd() < 0.012) e += (rnd() < 0.5 ? -1 : 1) * bw * (1.1 + rnd() * 0.6);
      dev.push(e);
    }
    fix = new Array(n).fill(0);
    head = 0;
  };
  const isBreach = (i: number) => Math.abs(dev[i]) > bw;

  return {
    resize(W, H) {
      w = W; h = H;
      x0 = w * 0.07; x1 = w * 0.93; mid = h * 0.5; amp = h * 0.12; bw = h * 0.1;
      gen();
    },
    step(dt) {
      if (phase === 'draw') {
        head = Math.min(n, head + dt * n * 0.19);
        for (let i = 0; i < Math.floor(head); i++) if (isBreach(i) && head - i > n * 0.08) fix[i] = Math.min(1, fix[i] + dt * 1.6);
        if (head >= n && fix.every((f, i) => !isBreach(i) || f >= 1)) { phase = 'hold'; pt = 0; }
      } else if (phase === 'hold') {
        pt += dt;
        if (pt > 2) { phase = 'fade'; pt = 0; }
      } else {
        pt += dt;
        alpha = Math.max(0, 1 - pt / 0.7);
        if (alpha === 0) { gen(); alpha = 1; phase = 'draw'; }
      }
    },
    settle() {
      head = n;
      fix = dev.map((_, i) => (isBreach(i) ? 1 : 0));
      phase = 'hold';
    },
    draw(ctx) {
      ctx.clearRect(0, 0, w, h);
      const X = (i: number) => x0 + i * STEP;
      // grid
      ctx.strokeStyle = rgba(INK, 0.07);
      ctx.lineWidth = 1;
      for (let gx = x0; gx <= x1 + 0.5; gx += (x1 - x0) / 8) { ctx.beginPath(); ctx.moveTo(Math.round(gx) + 0.5, h * 0.16); ctx.lineTo(Math.round(gx) + 0.5, h * 0.84); ctx.stroke(); }
      // band
      ctx.fillStyle = rgba(SAGE, 0.07);
      ctx.beginPath();
      ref.forEach((r, i) => (i ? ctx.lineTo(X(i), r - bw) : ctx.moveTo(X(i), r - bw)));
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(X(i), ref[i] + bw);
      ctx.closePath();
      ctx.fill();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = rgba(INK, 0.38);
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ref.forEach((r, i) => (i ? ctx.lineTo(X(i), r + sgn * bw) : ctx.moveTo(X(i), r + sgn * bw)));
        ctx.stroke();
      }
      ctx.setLineDash([1, 3]);
      ctx.strokeStyle = rgba(INK, 0.3);
      ctx.beginPath();
      ref.forEach((r, i) => (i ? ctx.lineTo(X(i), r) : ctx.moveTo(X(i), r)));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = alpha;
      const end = Math.floor(head);
      const val = (i: number) => {
        const d = dev[i];
        if (!isBreach(i)) return ref[i] + d;
        const clamped = Math.sign(d) * bw * 0.82;
        return ref[i] + d + (clamped - d) * easeOut(fix[i]);
      };
      // series
      for (let i = 1; i < end; i++) {
        const br = isBreach(i) || isBreach(i - 1);
        const f = Math.max(fix[i], fix[i - 1]);
        ctx.strokeStyle = br ? (f > 0.5 ? rgba(SAGE, 0.95) : rgba(RUST, 0.95)) : rgba(INK, 0.82);
        ctx.lineWidth = br ? 1.6 : 1.2;
        ctx.beginPath(); ctx.moveTo(X(i - 1), val(i - 1)); ctx.lineTo(X(i), val(i)); ctx.stroke();
      }
      // breach markers
      for (let i = 1; i < end - 1; i++) {
        if (isBreach(i) && Math.abs(dev[i]) >= Math.abs(dev[i - 1]) && Math.abs(dev[i]) >= Math.abs(dev[i + 1])) {
          const y = ref[i] + dev[i];
          ctx.strokeStyle = rgba(RUST, 0.85 * (1 - fix[i] * 0.6));
          ctx.beginPath(); ctx.arc(X(i), y, 4.5, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(X(i), y); ctx.lineTo(X(i), val(i)); ctx.stroke();
        }
      }
      if (end > 0 && end < n) {
        const y = val(end - 1);
        ctx.fillStyle = rgba(BLUE, 1);
        ctx.beginPath(); ctx.arc(X(end - 1), y, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = rgba(BLUE, 0.25);
        ctx.beginPath(); ctx.arc(X(end - 1), y, 7, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // legend — one row where it fits; on narrow frames a smaller size, then two rows
      ctx.textAlign = 'left';
      if (labels.length === 3) {
        const upper = labels.map((l) => l.toUpperCase());
        const colors = [rgba(INK, 0.5), rgba(RUST, 0.95), rgba(SAGE, 0.95)];
        const avail = x1 - x0;
        const measure = (px: number, sample: number) => {
          ctx.font = FONT.replace('10px', `${px}px`);
          return upper.map((text) => sample + 6 + ctx.measureText(text).width);
        };
        const sum = (list: number[]) => list.reduce((total, v) => total + v, 0);
        let sample = 14;
        let widths = measure(10, sample);
        if (sum(widths) + 20 > avail) { sample = 10; widths = measure(9, sample); }
        const twoRows = sum(widths) + 16 > avail;
        const gap = twoRows ? 14 : Math.min(24, (avail - sum(widths)) / 2);
        let lx = x0;
        let ly = twoRows ? h * 0.895 : h * 0.92;
        upper.forEach((text, i) => {
          if (twoRows && i === 1) { lx = x0; ly = h * 0.965; }
          ctx.strokeStyle = colors[i];
          ctx.setLineDash(i === 0 ? [3, 3] : []);
          ctx.beginPath(); ctx.moveTo(lx, ly - 3.5); ctx.lineTo(lx + sample, ly - 3.5); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = rgba(INK, 0.6);
          ctx.fillText(text, lx + sample + 6, ly);
          lx += widths[i] + gap;
        });
        ctx.font = FONT;
      }
    },
  };
}
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/* ------------------------------------------------------------------ runner */
export function initIllustrations(canvases: HTMLCanvasElement[], opts: { reduced: boolean }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvases.forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const labels: string[] = JSON.parse(canvas.dataset.labels || '[]');
    const kind = canvas.dataset.illo;
    const scene = kind === 'models' ? galton() : kind === 'products' ? flow(labels) : band(labels);
    let visible = false;
    let raf = 0;
    let last = 0;
    let t = 0;
    const size = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.resize(r.width, r.height);
      if (opts.reduced) scene.settle?.();
      scene.draw(ctx);
    };
    size();
    new ResizeObserver(size).observe(canvas);
    if (opts.reduced) return;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      t += dt;
      scene.step(dt, t);
      scene.draw(ctx);
      if (visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) { last = performance.now(); raf = requestAnimationFrame(tick); }
      },
      { rootMargin: '80px' },
    ).observe(canvas);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && visible) { last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    });
  });
}
