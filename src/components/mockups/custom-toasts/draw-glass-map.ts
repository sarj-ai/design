export interface GlassMapOptions {
  size: number;
  halfWidth: number;
  halfHeight: number;
  radius: number;
  depth: number;
  specularRotation: number;
  glowStrength: number;
  glowSpread: number;
  glowExponent: number;
  edgeStrength: number;
  edgeWidth: number;
  edgeExponent: number;
}

interface Specular {
  rotationCos: number;
  rotationSin: number;
  glowStart: number;
  glowScale: number;
  edgeScale: number;
}

export function drawGlassMap(canvas: HTMLCanvasElement, o: GlassMapOptions) {
  const size = o.size;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(size, size);
  const pixels = img.data;
  const half = size >> 1;
  const hx = o.halfWidth;
  const hy = o.halfHeight;
  const outerRadius = Math.min(o.radius, hx, hy);
  const innerX = Math.max(0, hx - o.depth);
  const innerY = Math.max(0, hy - o.depth);
  const innerRadius = Math.max(0, Math.min(o.radius, innerX, innerY));
  const falloff = o.depth > 0 ? 1 / (o.depth * Math.SQRT2) : 1e6;
  const rotation = (o.specularRotation * Math.PI) / 180;
  const glowWidth = o.glowSpread * Math.SQRT2;
  const specular: Specular = {
    rotationCos: Math.cos(rotation),
    rotationSin: Math.sin(rotation),
    glowStart: (1 - o.glowSpread) * Math.SQRT2,
    glowScale: glowWidth > 0.001 ? 1 / glowWidth : 0,
    edgeScale: o.edgeWidth > 0 ? 1 / o.edgeWidth : 0,
  };
  const put = (i: number, r: number, g: number, b: number) => {
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = 255;
  };

  for (let row = 0; row < half; row++) {
    const mirrorRow = size - 1 - row;
    const py = hy - (row + 0.5) * ((2 * hy) / size);
    const ny = Math.min(1, py / hy);
    for (let col = 0; col < half; col++) {
      const mirrorCol = size - 1 - col;
      const px = hx - (col + 0.5) * ((2 * hx) / size);
      const corners = [
        (row * size + col) * 4,
        (row * size + mirrorCol) * 4,
        (mirrorRow * size + col) * 4,
        (mirrorRow * size + mirrorCol) * 4,
      ] as const;
      const outside = roundedBoxDistance(
        px - hx + outerRadius,
        py - hy + outerRadius,
        outerRadius,
      );
      if (outside >= 0) {
        for (const corner of corners) put(corner, 128, 128, 128);
        continue;
      }
      const nx = Math.min(1, px / hx);
      const inner = roundedBoxDistance(
        px - innerX + innerRadius,
        py - innerY + innerRadius,
        innerRadius,
      );
      const fall = 0.5 * (1 + erf(inner * falloff));
      const shiftX = 0.5 * nx * fall;
      const shiftY = 0.5 * ny * fall;
      const right = toByte(0.5 + shiftX);
      const left = toByte(0.5 - shiftX);
      const down = toByte(0.5 + shiftY);
      const up = toByte(0.5 - shiftY);
      const { a: lightA, b: lightB } = specularLight(
        nx,
        ny,
        outside,
        fall,
        o,
        specular,
      );
      put(corners[0], right, down, lightA);
      put(corners[1], left, down, lightB);
      put(corners[2], right, up, lightB);
      put(corners[3], left, up, lightA);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

function roundedBoxDistance(dx: number, dy: number, radius: number) {
  return (
    Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) +
    Math.min(Math.max(dx, dy), 0) -
    radius
  );
}

function erf(x: number) {
  return Math.tanh(1.7724538509 * x);
}

function toByte(unit: number) {
  return Math.trunc(unit * 255 + 0.5);
}

function specularLight(
  nx: number,
  ny: number,
  outside: number,
  fall: number,
  o: GlassMapOptions,
  s: Specular,
): { a: number; b: number } {
  const tx = nx * s.rotationCos;
  const ty = ny * s.rotationSin;
  const edge = Math.max(0, 1 + outside * s.edgeScale);
  const light = (along: number) => {
    const glowAt = Math.min(
      1,
      Math.max(0, (along - s.glowStart) * s.glowScale),
    );
    const glow = o.glowStrength * glowAt ** o.glowExponent * fall;
    const rim = o.edgeStrength * edge * along ** o.edgeExponent;
    return Math.trunc(127 * Math.min(1, glow + rim) + 128 + 0.5);
  };
  return { a: light(Math.abs(tx + ty)), b: light(Math.abs(tx - ty)) };
}
