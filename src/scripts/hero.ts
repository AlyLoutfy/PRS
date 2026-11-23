// Generative alpine relief for the home hero (WebGL2).
// Swiss cartographic language: north-west hillshading in the spirit of Eduard Imhof, hypsometric tint,
// contour lines with blue index contours, and a surveyor's loupe that reads out LV95-style coordinates
// and elevation under the cursor.
//
// Performance: the fractal terrain is evaluated once into a 16-bit height texture (packed into RGBA8 so it
// works on every WebGL2 device); each frame only samples that texture. The terrain uses an integer (PCG)
// hash, so the CPU copy below returns the same elevation the GPU draws.

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const NOISE = `
uvec2 pcg2d(uvec2 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * 1664525u; v.y += v.x * 1664525u;
  v = v ^ (v >> 16u);
  v.x += v.y * 1664525u; v.y += v.x * 1664525u;
  v = v ^ (v >> 16u);
  return v;
}
vec2 grad(vec2 i) {
  uvec2 h = pcg2d(uvec2(ivec2(i)));
  return vec2(h) * (2.0 / 4294967295.0) - 1.0;
}
float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(grad(i), f);
  float b = dot(grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(grad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float terrain(vec2 p) {
  vec2 w = p + 0.38 * vec2(gnoise(p * 0.45 + vec2(5.2, 1.3)), gnoise(p * 0.45 + vec2(-3.7, 8.1)));
  float base = gnoise(w * 0.3) * 1.1 + gnoise(w * 0.62 + vec2(4.1, 1.7)) * 0.45;
  float sum = 0.0;
  float amp = 0.6;
  float freq = 0.85;
  float weight = 1.0;
  vec2 q = w;
  for (int i = 0; i < 7; i++) {
    float n = 1.0 - clamp(abs(gnoise(q * freq)) * 1.75, 0.0, 1.0);
    n = n * n * weight;
    weight = clamp(n * 1.4, 0.0, 1.0);
    sum += n * amp;
    freq *= 2.0;
    amp *= 0.46;
    q = mat2(0.8, -0.6, 0.6, 0.8) * q + vec2(1.7, 9.2);
  }
  return base + sum * 1.05;
}`;

// Pass 1: bake normalised height (0..1) into RG as 16 bits.
const BAKE = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uOrigin;
uniform vec2 uSpan;
uniform vec2 uTexSize;
uniform vec2 uRange;
out vec4 outColor;
${NOISE}
void main() {
  vec2 p = uOrigin + gl_FragCoord.xy / uTexSize * uSpan;
  float hn = clamp((terrain(p) - uRange.x) / (uRange.y - uRange.x), 0.0, 1.0);
  float v = floor(hn * 65535.0 + 0.5);
  float hi = floor(v / 256.0);
  outColor = vec4(hi / 255.0, (v - hi * 256.0) / 255.0, 0.0, 1.0);
}`;

// Pass 2: shade the relief from the baked height.
const SHADE = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uHeight;
uniform vec2 uTexSize;
uniform vec2 uOrigin;
uniform vec2 uSpan;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPan;
uniform float uZoom;
uniform vec2 uMouse;
uniform float uLens;
uniform float uLensR;
uniform float uReveal;
uniform float uShadeK;
uniform sampler2D uPhoto;
uniform vec2 uPhotoSize;
uniform vec2 uFocus;
uniform float uPhotoMix;
uniform float uPhotoReady;
uniform float uKen;
uniform vec2 uShift;
out vec4 outColor;

// The photograph, cover-fitted like the <img> underneath (object-position = uFocus), with a slow zoom.
vec3 photoAt(vec2 frag) {
  vec2 uv = frag / uRes;
  uv.y = 1.0 - uv.y;
  float ra = uRes.x / uRes.y;
  float pa = uPhotoSize.x / uPhotoSize.y;
  vec2 frac = ra > pa ? vec2(1.0, pa / ra) : vec2(ra / pa, 1.0);
  vec2 off = (1.0 - frac) * uFocus;
  vec2 img = off + uv * frac;
  vec2 ctr = off + 0.5 * frac;
  img = ctr + (img - ctr) / uKen + uShift;
  return texture(uPhoto, img).rgb;
}

float fetchH(ivec2 c) {
  c = clamp(c, ivec2(0), ivec2(uTexSize) - 1);
  vec4 t = texelFetch(uHeight, c, 0);
  return (t.r * 255.0 * 256.0 + t.g * 255.0) / 65535.0;
}
float heightAt(vec2 p) {
  vec2 t = (p - uOrigin) / uSpan * uTexSize - 0.5;
  vec2 i = floor(t);
  vec2 f = t - i;
  ivec2 c = ivec2(i);
  float a = fetchH(c), b = fetchH(c + ivec2(1, 0)), d = fetchH(c + ivec2(0, 1)), e = fetchH(c + ivec2(1, 1));
  return mix(mix(a, b, f.x), mix(d, e, f.x), f.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * uRes) / uRes.y;
  vec2 p = uv * uZoom + uPan;
  float texel = uSpan.y / uTexSize.y;
  float e = texel * 1.25;
  float hn = heightAt(p);
  float hx = heightAt(p + vec2(e, 0.0)) - heightAt(p - vec2(e, 0.0));
  float hy = heightAt(p + vec2(0.0, e)) - heightAt(p - vec2(0.0, e));
  vec2 g = vec2(hx, hy) / (2.0 * e);

  vec3 n = normalize(vec3(-g * uShadeK, 1.0));
  vec3 L = normalize(vec3(-0.62, 0.58, 0.55));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float shade = mix(0.12, 1.08, diff);

  vec3 low  = vec3(0.040, 0.050, 0.046);
  vec3 mid  = vec3(0.105, 0.142, 0.118);
  vec3 high = vec3(0.385, 0.405, 0.390);
  vec3 snow = vec3(0.880, 0.890, 0.872);
  vec3 col = mix(low, mid, smoothstep(0.04, 0.48, hn));
  col = mix(col, high, smoothstep(0.44, 0.74, hn));
  col = mix(col, snow, smoothstep(0.72, 0.93, hn) * 0.94);
  col *= shade * 1.3;

  float cd = 30.0;
  float c = hn * cd;
  float fw = max(fwidth(c), 1e-4);
  float density = clamp(1.7 - fw * 2.0, 0.0, 1.0);
  float line = 1.0 - smoothstep(0.0, fw * 1.15, abs(fract(c - 0.5) - 0.5));
  float idx = 1.0 - smoothstep(0.0, fw * 1.6, abs(fract(c / 5.0 - 0.5) - 0.5) * 5.0);
  float lake = 1.0 - smoothstep(0.0015, 0.006, hn);
  col = mix(col, vec3(0.80, 0.84, 0.82), line * 0.15 * density * (1.0 - lake));
  col = mix(col, vec3(0.40, 0.64, 0.93), idx * 0.38 * density * (1.0 - lake));
  vec3 water = mix(vec3(0.055, 0.105, 0.150), vec3(0.11, 0.19, 0.26), smoothstep(-0.4, 0.5, uv.y));
  col = mix(col, water, lake);
  float shore = (1.0 - smoothstep(0.0, max(fwidth(hn), 1e-5) * 1.4, abs(hn - 0.004))) * (1.0 - lake * 0.6);
  col = mix(col, vec3(0.55, 0.72, 0.88), shore * 0.55);

  // Surveyor's loupe: denser contours + slope heat (sage = gentle, rust = steep).
  float d = length(frag - uMouse);
  float R = uLensR;
  float inside = (1.0 - smoothstep(R - 1.5, R + 1.5, d)) * uLens;
  float fw2 = fw * 4.0;
  float l2 = 1.0 - smoothstep(0.0, fw2 * 1.1, abs(fract(c * 4.0 - 0.5) - 0.5));
  float slope = length(g) * uShadeK;
  vec3 heat = mix(vec3(0.37, 0.54, 0.41), vec3(0.75, 0.28, 0.17), smoothstep(0.7, 2.6, slope));
  vec3 lc = mix(col * 1.1, heat * (0.3 + 0.95 * diff), 0.62);
  lc = mix(lc, vec3(0.96), l2 * 0.32 * clamp(1.7 - fw2 * 2.0, 0.0, 1.0));
  // 1 · The model: the relief rises from the valleys, a bright waterline sweeping up the slopes.
  float T = uReveal * 1.12 - 0.06;
  float vis = 1.0 - smoothstep(T - 0.04, T + 0.005, hn);
  float glow = (1.0 - smoothstep(0.0, 0.01, abs(hn - T))) * (1.0 - smoothstep(0.85, 1.0, uReveal));
  vec3 model = mix(vec3(0.022, 0.024, 0.022), col, vis) + vec3(0.45, 0.66, 0.95) * glow * 0.6;
  float vig = smoothstep(1.3, 0.2, length(uv * vec2(0.82, 1.06)));
  model *= mix(0.7, 1.0, vig);
  float grain = fract(sin(dot(frag, vec2(12.9898, 78.233)) + uTime * 0.37) * 43758.5453);
  model += (grain - 0.5) * 0.014;

  // 2 · Reality: the photograph replaces the model, again from the valleys up.
  float T2 = uPhotoMix * 1.12 - 0.06;
  float pv = (1.0 - smoothstep(T2 - 0.05, T2 + 0.005, hn)) * uPhotoReady;
  float glow2 = (1.0 - smoothstep(0.0, 0.012, abs(hn - T2))) * step(0.001, uPhotoMix) * (1.0 - smoothstep(0.82, 1.0, uPhotoMix)) * uPhotoReady;
  vec3 ph = photoAt(frag);
  vec3 outc = mix(model, ph, pv);
  outc += vec3(0.85, 0.92, 1.0) * glow2 * 0.5;

  // 3 · The loupe: over the relief it shows slope heat; over the photograph it lays the terrain model on
  //     top of reality — darkened photo, slope tint, dense contours and blue index contours.
  vec3 lensPhoto = mix(ph * 0.52, heat * (0.32 + 0.85 * diff), 0.4);
  lensPhoto = mix(lensPhoto, vec3(0.97), l2 * 0.45 * clamp(1.7 - fw2 * 2.0, 0.0, 1.0));
  lensPhoto = mix(lensPhoto, vec3(0.55, 0.76, 1.0), idx * 0.55 * density);
  outc = mix(outc, mix(lc, lensPhoto, pv), inside);
  float ring = (1.0 - smoothstep(0.0, 1.3, abs(d - R))) * uLens;
  outc = mix(outc, vec3(0.97, 0.97, 0.95), ring * 0.9);
  float tick = step(abs(d - R), 10.0) * step(R - 1.0, d) * (step(abs(frag.x - uMouse.x), 0.75) + step(abs(frag.y - uMouse.y), 0.75));
  outc = mix(outc, vec3(0.97), clamp(tick, 0.0, 1.0) * uLens * 0.9);
  outColor = vec4(outc, 1.0);
}`;

/* ---------- CPU copy of the terrain (mirrors NOISE above) ---------- */
function pcg2d(x: number, y: number): [number, number] {
  x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
  y = (Math.imul(y, 1664525) + 1013904223) >>> 0;
  x = (x + Math.imul(y, 1664525)) >>> 0;
  y = (y + Math.imul(x, 1664525)) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  y = (y ^ (y >>> 16)) >>> 0;
  x = (x + Math.imul(y, 1664525)) >>> 0;
  y = (y + Math.imul(x, 1664525)) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  y = (y ^ (y >>> 16)) >>> 0;
  return [x, y];
}
const K = 2 / 4294967295;
function gdot(ix: number, iy: number, fx: number, fy: number) {
  const [hx, hy] = pcg2d(ix >>> 0, iy >>> 0);
  return (hx * K - 1) * fx + (hy * K - 1) * fy;
}
function gnoise(px: number, py: number) {
  const ix = Math.floor(px);
  const iy = Math.floor(py);
  const fx = px - ix;
  const fy = py - iy;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const a = gdot(ix, iy, fx, fy);
  const b = gdot(ix + 1, iy, fx - 1, fy);
  const c = gdot(ix, iy + 1, fx, fy - 1);
  const d = gdot(ix + 1, iy + 1, fx - 1, fy - 1);
  const ab = a + (b - a) * ux;
  const cd = c + (d - c) * ux;
  return ab + (cd - ab) * uy;
}
export function terrain(px: number, py: number) {
  const wx = px + 0.38 * gnoise(px * 0.45 + 5.2, py * 0.45 + 1.3);
  const wy = py + 0.38 * gnoise(px * 0.45 - 3.7, py * 0.45 + 8.1);
  const base = gnoise(wx * 0.3, wy * 0.3) * 1.1 + gnoise(wx * 0.62 + 4.1, wy * 0.62 + 1.7) * 0.45;
  let sum = 0;
  let amp = 0.6;
  let freq = 0.85;
  let weight = 1;
  let qx = wx;
  let qy = wy;
  for (let i = 0; i < 7; i++) {
    let n = 1 - Math.min(Math.max(Math.abs(gnoise(qx * freq, qy * freq)) * 1.75, 0), 1);
    n = n * n * weight;
    weight = Math.min(Math.max(n * 1.4, 0), 1);
    sum += n * amp;
    freq *= 2;
    amp *= 0.46;
    const nx = 0.8 * qx + 0.6 * qy + 1.7;
    const ny = -0.6 * qx + 0.8 * qy + 9.2;
    qx = nx;
    qy = ny;
  }
  return base + sum * 1.05;
}

/* ---------- renderer ---------- */
const swiss = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’');
const BASE_PAN = { x: 23.4, y: -7.1 };
const ZOOM = 3.0; // world units across the viewport height
const DRIFT = { x: 0.34, y: 0.16 }; // bounded camera drift (world units)
const MARGIN = 0.52;
const LENS_MAX = 132; // CSS px
const lensRadius = (w: number) => Math.min(LENS_MAX, Math.max(64, w * 0.19));

export function initHero(section: HTMLElement, opts: { reduced: boolean; quick: boolean }) {
  const canvas = section.querySelector<HTMLCanvasElement>('canvas[data-relief]')!;
  const photoImg = section.querySelector<HTMLImageElement>('[data-hero-photo]');
  const readout = section.querySelector<HTMLElement>('[data-readout]');
  const roE = readout?.querySelector('[data-ro-e]');
  const roN = readout?.querySelector('[data-ro-n]');
  const roH = readout?.querySelector('[data-ro-h]');
  const none = { reveal() {} };
  // The <img> underneath is the design's hero; without WebGL (or with reduced motion) it simply stays visible.
  const useFallback = () => { canvas.style.display = 'none'; };
  if (opts.reduced) { useFallback(); return none; }

  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  if (!gl) { useFallback(); return none; }

  const program = (fsSrc: string) => {
    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('[relief]', gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = mk(gl.VERTEX_SHADER, VERT);
    const fs = mk(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn('[relief]', gl.getProgramInfoLog(p)); return null; }
    return p;
  };
  const bake = program(BAKE);
  const shade = program(SHADE);
  if (!bake || !shade) { useFallback(); return none; }

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
  const ub = { origin: U(bake, 'uOrigin'), span: U(bake, 'uSpan'), size: U(bake, 'uTexSize'), range: U(bake, 'uRange') };
  const us = {
    height: U(shade, 'uHeight'), size: U(shade, 'uTexSize'), origin: U(shade, 'uOrigin'), span: U(shade, 'uSpan'),
    res: U(shade, 'uRes'), time: U(shade, 'uTime'), pan: U(shade, 'uPan'), zoom: U(shade, 'uZoom'), mouse: U(shade, 'uMouse'),
    lens: U(shade, 'uLens'), lensR: U(shade, 'uLensR'), reveal: U(shade, 'uReveal'), shadeK: U(shade, 'uShadeK'),
    photo: U(shade, 'uPhoto'), photoSize: U(shade, 'uPhotoSize'), focus: U(shade, 'uFocus'), photoMix: U(shade, 'uPhotoMix'),
    photoReady: U(shade, 'uPhotoReady'), ken: U(shade, 'uKen'), shift: U(shade, 'uShift'),
  };

  // Elevation range from a coarse CPU sample of the area the camera can see.
  const samples: number[] = [];
  for (let i = 0; i < 64; i++)
    for (let j = 0; j < 36; j++) samples.push(terrain(BASE_PAN.x - 3.6 + i * 0.115, BASE_PAN.y - 2.1 + j * 0.12));
  samples.sort((a, b) => a - b);
  const range = { lo: samples[Math.floor(samples.length * 0.03)], hi: samples[Math.floor(samples.length * 0.996)] };
  const shadeK = 0.6 * (range.hi - range.lo);

  const tex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  const area = { x: 0, y: 0, w: 1, h: 1, tw: 1, th: 1 };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cssW = 1;
  let cssH = 1;

  const bakeHeight = () => {
    const aspect = cssW / cssH;
    area.w = ZOOM * aspect + 2 * (DRIFT.x + MARGIN);
    area.h = ZOOM + 2 * (DRIFT.y + MARGIN);
    area.x = BASE_PAN.x - area.w / 2;
    area.y = BASE_PAN.y - area.h / 2;
    const maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE) as number, 4096);
    const density = Math.min(dpr, 1.15) * (cssH / ZOOM); // texels per world unit
    area.tw = Math.min(maxTex, Math.ceil(area.w * density));
    area.th = Math.min(maxTex, Math.ceil(area.h * density));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, area.tw, area.th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, area.tw, area.th);
    gl.useProgram(bake);
    gl.uniform2f(ub.origin, area.x, area.y);
    gl.uniform2f(ub.span, area.w, area.h);
    gl.uniform2f(ub.size, area.tw, area.th);
    gl.uniform2f(ub.range, range.lo, range.hi);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(shade);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(us.height, 0);
    gl.uniform2f(us.size, area.tw, area.th);
    gl.uniform2f(us.origin, area.x, area.y);
    gl.uniform2f(us.span, area.w, area.h);
    gl.uniform1f(us.zoom, ZOOM);
    gl.uniform1f(us.shadeK, shadeK);
  };

  let bakedAspect = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    cssW = Math.max(1, r.width);
    cssH = Math.max(1, r.height);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const aspect = cssW / cssH;
    if (Math.abs(aspect - bakedAspect) > 0.02 || !bakedAspect) { bakeHeight(); bakedAspect = aspect; }
    gl.useProgram(shade);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(us.res, canvas.width, canvas.height);
  };
  resize();
  let resizeTimer = 0;
  new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(resize, 120); }).observe(canvas);

  // The design's photograph as a texture (same-origin), uploaded once it has loaded.
  const photoTex = gl.createTexture();
  let photoReady = false;
  const uploadPhoto = () => {
    if (!photoImg || photoReady || !photoImg.naturalWidth) return;
    gl.useProgram(shade);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, photoTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, photoImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(us.photo, 1);
    gl.uniform2f(us.photoSize, photoImg.naturalWidth, photoImg.naturalHeight);
    gl.uniform2f(us.focus, 0.5, 0.45);
    gl.uniform1f(us.photoReady, 1);
    photoReady = true;
  };
  gl.useProgram(shade);
  gl.uniform1f(us.photoReady, 0);
  gl.uniform1i(us.photo, 1);
  if (photoImg?.complete) uploadPhoto();
  else photoImg?.addEventListener('load', uploadPhoto, { once: true });

  // State
  const start = performance.now();
  let reveal = opts.quick ? 1 : 0;
  let revealStart = -1;
  let revealRequested = false;
  let photoMix = opts.quick ? 1 : 0;
  let photoStart = -1;
  let live = false;
  const REVEAL_MS = 2800;
  const HOLD_MS = 700;
  const PHOTO_MS = 2400;
  const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const pointer = { x: cssW * 0.7, y: cssH * 0.45, active: false, last: -1e9 };
  const lensPos = { x: cssW * 0.74, y: cssH * 0.4 };
  let lens = 0;
  const par = { x: 0, y: 0 };
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  section.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.active = true;
    pointer.last = performance.now();
    if (readout) {
      readout.classList.add('is-visible');
      const R = lensRadius(cssW);
      const flip = e.clientX > window.innerWidth - R - 190;
      const x = flip ? e.clientX - R - 16 - readout.offsetWidth : e.clientX + R + 16;
      readout.style.transform = `translate(${x}px, ${e.clientY - readout.offsetHeight / 2}px)`;
    }
  });
  section.addEventListener('pointerleave', () => {
    pointer.active = false;
    readout?.classList.remove('is-visible');
  });

  let running = true;
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && running) loop(); }, { threshold: 0 }).observe(section);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && running) loop(); });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; useFallback(); });

  let raf = 0;
  let prev = performance.now();

  function frame(now: number) {
    const t = (now - start) / 1000;
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    // Start the clock on the first frame actually drawn, so a background tab still gets the reveal.
    if (revealRequested && revealStart < 0) revealStart = now;
    if (!opts.quick && revealStart >= 0) {
      reveal = easeInOut(Math.min(1, (now - revealStart) / REVEAL_MS));
      if (photoReady && photoStart < 0 && now - revealStart > REVEAL_MS + HOLD_MS) photoStart = now;
      if (photoStart >= 0) photoMix = easeInOut(Math.min(1, (now - photoStart) / PHOTO_MS));
    }

    // Lens: the real pointer, or a slow survey path on the right half when idle / on touch screens.
    const idle = !pointer.active;
    let tx = pointer.x;
    let ty = pointer.y;
    let lensTarget = pointer.active ? 1 : 0;
    if (idle) {
      tx = cssW * (0.73 + 0.15 * Math.sin(t * 0.19));
      ty = cssH * (0.4 + 0.19 * Math.sin(t * 0.31 + 1.3));
      lensTarget = reveal > 0.92 && photoMix > 0.96 ? (fine ? 0.8 : 0.9) : 0;
    }
    const k = 1 - Math.exp(-dt * (idle ? 1.4 : 12));
    lensPos.x += (tx - lensPos.x) * k;
    lensPos.y += (ty - lensPos.y) * k;
    lens += (lensTarget - lens) * (1 - Math.exp(-dt * 4));

    // Bounded drift + gentle pointer parallax.
    const px = pointer.active ? pointer.x / cssW - 0.5 : 0;
    const py = pointer.active ? pointer.y / cssH - 0.5 : 0;
    par.x += (px * 0.1 - par.x) * (1 - Math.exp(-dt * 2));
    par.y += (-py * 0.06 - par.y) * (1 - Math.exp(-dt * 2));
    const panX = BASE_PAN.x + Math.sin(t * 0.021) * (DRIFT.x - 0.06) + par.x;
    const panY = BASE_PAN.y + Math.sin(t * 0.017 + 1.1) * (DRIFT.y - 0.04) + par.y;

    const scale = canvas.width / cssW;
    gl.uniform1f(us.time, t);
    gl.uniform2f(us.pan, panX, panY);
    gl.uniform2f(us.mouse, lensPos.x * scale, (cssH - lensPos.y) * scale);
    gl.uniform1f(us.lens, lens);
    gl.uniform1f(us.lensR, lensRadius(cssW) * scale);
    gl.uniform1f(us.reveal, reveal);
    gl.uniform1f(us.photoMix, photoMix);
    gl.uniform1f(us.ken, 1 + 0.035 * (0.5 - 0.5 * Math.cos(t * 0.05)));
    gl.uniform2f(us.shift, par.x * 0.012, -par.y * 0.012);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // Show the canvas once it has something to show: the relief (intro) or the photograph (repeat visits).
    if (!live && (!opts.quick || photoReady)) { live = true; canvas.classList.add('is-live'); }

    if (pointer.active && roE && roN && roH) {
      const wx = ((pointer.x - cssW / 2) / cssH) * ZOOM + panX;
      const wy = ((cssH / 2 - pointer.y) / cssH) * ZOOM + panY;
      const hn = Math.min(1, Math.max(0, (terrain(wx, wy) - range.lo) / (range.hi - range.lo)));
      roE.textContent = swiss(2681500 + (wx - BASE_PAN.x) * 5200);
      roN.textContent = swiss(1224500 + (wy - BASE_PAN.y) * 5200);
      roH.textContent = swiss(420 + hn * 3620);
    }
  }

  function loop() {
    cancelAnimationFrame(raf);
    const tick = (now: number) => {
      if (!running || !visible || document.hidden) return;
      frame(now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  loop();

  return {
    reveal() {
      revealRequested = true;
    },
  };
}
