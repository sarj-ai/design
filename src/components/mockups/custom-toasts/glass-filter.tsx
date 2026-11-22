"use client";

import { useMemo } from "react";

import { drawGlassMap } from "./draw-glass-map";

const GLASS = {
  depth: 18,
  displacement: 72,
  chroma: 0.6,
  frost: 5,
  saturation: 1.5,
  radius: 12,
} as const;

export function GlassFilter({
  id,
  width,
  height,
}: {
  id: string;
  width: number;
  height: number;
}) {
  const map = useMemo(() => {
    if (!width || !height) return null;
    return drawGlassMap(document.createElement("canvas"), {
      size: 256,
      halfWidth: width / 2,
      halfHeight: height / 2,
      radius: GLASS.radius,
      depth: Math.min(GLASS.depth, Math.min(width, height) / 6),
      specularRotation: 45,
      glowStrength: 0.25,
      glowSpread: 1,
      glowExponent: 0.5,
      edgeStrength: 1,
      edgeWidth: 3,
      edgeExponent: 1.5,
    });
  }, [width, height]);

  const s = GLASS.displacement;
  const c = GLASS.chroma;

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height={height}
        id={id}
        primitiveUnits="userSpaceOnUse"
        width={width}
        x="0"
        y="0"
      >
        {map ? (
          <feImage
            height={height}
            href={map}
            preserveAspectRatio="none"
            result="map"
            width={width}
            x="0"
            y="0"
          />
        ) : null}
        <feGaussianBlur
          in="SourceGraphic"
          result="frosted"
          stdDeviation={GLASS.frost}
        />
        <feDisplacementMap
          in="frosted"
          in2="map"
          scale={s * (1 + 0.2 * c)}
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feColorMatrix
          result="dispR"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
        />
        <feDisplacementMap
          in="frosted"
          in2="map"
          scale={s * (1 + 0.1 * c)}
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feColorMatrix
          result="dispG"
          type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
        />
        <feDisplacementMap
          in="frosted"
          in2="map"
          scale={s}
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feColorMatrix
          result="dispB"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
        />
        <feComposite
          in="dispR"
          in2="dispG"
          k2="1"
          k3="1"
          operator="arithmetic"
        />
        <feComposite
          in2="dispB"
          k2="1"
          k3="1"
          operator="arithmetic"
          result="lens"
        />
        <feColorMatrix
          in="map"
          result="specular"
          type="matrix"
          values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 -0.5019607843137255"
        />
        <feComposite
          in="specular"
          in2="lens"
          k2="1"
          k3="1"
          operator="arithmetic"
        />
        <feColorMatrix type="saturate" values={String(GLASS.saturation)} />
      </filter>
    </svg>
  );
}
