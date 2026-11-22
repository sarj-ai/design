"use client";

import { useMemo } from "react";

import { drawGlassMap } from "@/lib/mockups/custom-toasts-glass";

// The SVG filter a toast's backdrop-filter points at. Chromium only: Safari
// and Firefox ignore url() in backdrop-filter and show the plain tinted card.

const GLASS = {
  /** How far in from the edge the glass bends, px. */
  depth: 18,
  /** Largest push at the rim is half this, px. */
  displacement: 72,
  /** Colour split at the rim: red bends 20% × this more than blue. */
  chroma: 0.6,
  /** Blur of what is behind, px. Low, so the page stays recognisable through it. */
  frost: 5,
  /** Behind-the-glass colour boost. */
  saturation: 1.5,
  radius: 12,
};

export function GlassFilter({
  id,
  width,
  height,
}: {
  id: string;
  width: number;
  height: number;
}) {
  // Width and height are 0 until the card is measured on the client, so this never touches document on the server.
  const map = useMemo(() => {
    if (!width || !height) return null;
    return drawGlassMap(document.createElement("canvas"), {
      size: 256,
      halfWidth: width / 2,
      halfHeight: height / 2,
      radius: GLASS.radius,
      // A short toast is mostly edge; keep the band to a third of its half-height so its middle stays flat.
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
    <svg aria-hidden className="pointer-events-none absolute size-0">
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
        {map && (
          <feImage
            height={height}
            href={map}
            preserveAspectRatio="none"
            result="map"
            width={width}
            x="0"
            y="0"
          />
        )}
        <feGaussianBlur
          in="SourceGraphic"
          result="frosted"
          stdDeviation={GLASS.frost}
        />
        {/* Red bends 20% more than blue and green 10% more: the fringe at the rim. */}
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
        {/* The map's blue channel above 128 becomes white light along the rim. */}
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
