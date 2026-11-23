// Build-time generator for the team portrait placeholders: a unique "summit" of contour lines per person,
// seeded from the name. Pure SVG path strings — no client JS.

function seeded(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function closedCatmullRom(pts: [number, number][]): string {
  const n = pts.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}

export interface ContourSet { lines: { d: string; index: boolean }[]; peak: [number, number] }

export function contourSet(seed: string, size = 300, levels = 11): ContourSet {
  const rnd = seeded(seed);
  const cx = size * (0.28 + rnd() * 0.44);
  const cy = size * (0.26 + rnd() * 0.3);
  const harmonics = [2, 3, 4, 5, 7].map((k) => ({ k, a: (0.02 + rnd() * 0.07) / Math.sqrt(k - 1), p: rnd() * Math.PI * 2 }));
  const base = size * (0.045 + rnd() * 0.02);
  const lines: { d: string; index: boolean }[] = [];
  for (let i = 1; i <= levels; i++) {
    const r0 = base * i * (1 + i * 0.05);
    const pts: [number, number][] = [];
    for (let s = 0; s < 48; s++) {
      const th = (s / 48) * Math.PI * 2;
      let r = r0;
      for (const hm of harmonics) r *= 1 + hm.a * Math.sin(hm.k * th + hm.p + i * 0.04);
      pts.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r * 0.92]);
    }
    lines.push({ d: closedCatmullRom(pts), index: i % 5 === 0 });
  }
  return { lines, peak: [cx, cy] };
}
