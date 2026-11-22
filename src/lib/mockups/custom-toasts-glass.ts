// Displacement map for a glass panel, ported from Aave Glass
// (aave.com/design/building-glass-for-the-web). R and G push pixels along x
// and y, 128 is "no push". B is specular light, 128 is "none".
//
// With no dome, a pixel only moves inside the `depth` band along the edge, so
// a toast bends its backdrop at the rim and stays flat across the middle.

export type GlassMapOptions = {
  /** Map resolution; the map is stretched over the element. */
  size: number;
  halfWidth: number;
  halfHeight: number;
  radius: number;
  /** Width of the bending band along the edge, px. */
  depth: number;
  specularRotation: number;
  glowStrength: number;
  glowSpread: number;
  glowExponent: number;
  edgeStrength: number;
  edgeWidth: number;
  edgeExponent: number;
};

const erf = (x: number) => Math.tanh(1.7724538509 * x);

export function drawGlassMap(canvas: HTMLCanvasElement, o: GlassMapOptions) {
  const e = o.size;
  canvas.width = e;
  canvas.height = e;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(e, e);
  const T = img.data;
  const x = o.halfWidth;
  const y = o.halfHeight;
  const F = e >> 1;
  const D = Math.min(o.radius, x, y);
  const L = Math.max(0, x - o.depth);
  const B = Math.max(0, y - o.depth);
  const H = Math.max(0, Math.min(o.radius, L, B));
  const O = o.depth > 0 ? 1 / (o.depth * Math.SQRT2) : 1e6;
  const A = o.glowStrength;
  const S = o.edgeStrength;
  const W = (o.specularRotation * Math.PI) / 180;
  const U = Math.cos(W);
  const G = Math.sin(W);
  const N = (1 - o.glowSpread) * Math.SQRT2;
  const q = o.glowSpread * Math.SQRT2;
  const z = q > 0.001 ? 1 / q : 0;
  const Y = o.edgeWidth > 0 ? 1 / o.edgeWidth : 0;
  const X = (2 * x) / e;
  const P = (2 * y) / e;
  const V = 1 / x;
  const K = 1 / y;
  const put = (i: number, r: number, g: number, b: number) => {
    T[i] = r;
    T[i + 1] = g;
    T[i + 2] = b;
    T[i + 3] = 255;
  };

  // One quadrant is computed and mirrored into the other three.
  for (let t = 0; t < F; t++) {
    const r = e - 1 - t;
    const n = -((t + 0.5) * P - y);
    const i = n - y + D;
    const oo = n - B + H;
    const u = n * K > 1 ? 1 : n * K;
    for (let col = 0; col < F; col++) {
      const l = e - 1 - col;
      const a = -((col + 0.5) * X - x);
      const d0 = a - x + D;
      const g0 = d0 > 0 ? d0 : 0;
      const h0 = i > 0 ? i : 0;
      const p0 = g0 * g0 + h0 * h0;
      const m =
        (p0 > 0 ? Math.sqrt(p0) : 0) +
        (d0 > i ? (d0 > 0 ? 0 : d0) : i > 0 ? 0 : i) -
        D;
      const iy = (t * e + col) * 4;
      const ib = (t * e + l) * 4;
      const iM = (r * e + col) * 4;
      const iw = (r * e + l) * 4;
      if (m >= 0) {
        for (const k of [iy, ib, iM, iw]) put(k, 128, 128, 128);
        continue;
      }
      const d = a * V > 1 ? 1 : a * V;
      const t2 = a - L + H;
      const r2 = t2 > 0 ? t2 : 0;
      const n2 = oo > 0 ? oo : 0;
      const l2 =
        Math.sqrt(r2 * r2 + n2 * n2) +
        (t2 > oo ? (t2 > 0 ? 0 : t2) : oo > 0 ? 0 : oo) -
        H;
      const fall = 0.5 * (1 + erf(l2 * O));
      const h = 0.5 * d * fall;
      const p = 0.5 * u * fall;
      const R = ((0.5 + h) * 255 + 0.5) | 0;
      const v = ((0.5 - h) * 255 + 0.5) | 0;
      const C = ((0.5 + p) * 255 + 0.5) | 0;
      const j = ((0.5 - p) * 255 + 0.5) | 0;
      const nx = d * U;
      const sy = u * G;
      const oA = Math.abs(nx + sy);
      const oB = Math.abs(nx - sy);
      const edge = Math.max(0, 1 + m * Y);
      let h1 = 0;
      let p1 = 0;
      if (A > 0) {
        const ta = (oA - N) * z;
        h1 += A * Math.pow(Math.min(1, Math.max(0, ta)), o.glowExponent) * fall;
        const tb = (oB - N) * z;
        p1 += A * Math.pow(Math.min(1, Math.max(0, tb)), o.glowExponent) * fall;
      }
      if (S > 0) {
        h1 += S * edge * Math.pow(oA, o.edgeExponent);
        p1 += S * edge * Math.pow(oB, o.edgeExponent);
      }
      const s1 = (127 * Math.min(1, h1) + 128 + 0.5) | 0;
      const s2 = (127 * Math.min(1, p1) + 128 + 0.5) | 0;
      put(iy, R, C, s1);
      put(ib, v, C, s2);
      put(iM, R, j, s2);
      put(iw, v, j, s1);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}
