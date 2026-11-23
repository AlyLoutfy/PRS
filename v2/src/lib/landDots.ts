// Build-time: sample a quasi-equal-area grid of points that fall on land (Natural Earth 110m via world-atlas).
// Runs once per build (module-level cache); the client only receives the compact point list.
import { feature } from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';

type Ring = number[][];
interface Poly { rings: Ring[]; bbox: [number, number, number, number] }

let cache: number[] | null = null;

function polygons(): Poly[] {
  const topo = land110 as unknown as { objects: { land: unknown } };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geo = feature(topo as any, topo.objects.land as any) as any;
  const feats = geo.type === 'FeatureCollection' ? geo.features : [geo];
  const out: Poly[] = [];
  for (const f of feats) {
    const g = f.geometry;
    const list: Ring[][] = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const rings of list) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [x, y] of rings[0]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      out.push({ rings, bbox: [minX, minY, maxX, maxY] });
    }
  }
  return out;
}

function inRing(x: number, y: number, ring: Ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Flat array [lon, lat, lon, lat, …] rounded to 0.1°. */
export function landDots(step = 2): number[] {
  if (cache) return cache;
  const polys = polygons();
  const dots: number[] = [];
  for (let lat = -56; lat <= 78; lat += step) {
    const lonStep = step / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
    const offset = (Math.round(lat / step) % 2) * lonStep * 0.5;
    for (let lon = -180 + offset; lon < 180; lon += lonStep) {
      for (const p of polys) {
        if (lon < p.bbox[0] || lon > p.bbox[2] || lat < p.bbox[1] || lat > p.bbox[3]) continue;
        let inside = false;
        for (const r of p.rings) if (inRing(lon, lat, r)) inside = !inside;
        if (inside) { dots.push(Math.round(lon * 10) / 10, Math.round(lat * 10) / 10); break; }
      }
    }
  }
  cache = dots;
  return dots;
}
