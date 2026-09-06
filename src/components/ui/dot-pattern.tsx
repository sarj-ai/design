"use client"

import React, { useEffect, useId, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 *  DotPattern Component Props
 *
 * @param {number} [width=16] - The horizontal spacing between dots
 * @param {number} [height=16] - The vertical spacing between dots
 * @param {number} [x=0] - The x-offset of the entire pattern
 * @param {number} [y=0] - The y-offset of the entire pattern
 * @param {number} [cx=1] - The x-offset of individual dots
 * @param {number} [cy=1] - The y-offset of individual dots
 * @param {number} [cr=1] - The radius of each dot
 * @param {string} [className] - Additional CSS classes to apply to the SVG container
 * @param {boolean} [glow=false] - Whether dots should have a glowing animation effect
 */
interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  glow?: boolean
  /**
   * Pulse the dots outward from the centre in rings, rather than each on its
   * own random clock the way `glow` does. Every dot shares one period and
   * differs only in phase, and the phase is its distance from the centre — so
   * the field reads as one wave travelling out instead of a field twinkling.
   */
  ripple?: boolean
  /**
   * Fade the field out towards its edges. The mask is an alpha gradient, so
   * the dots dissolve rather than being clipped by the container — which is
   * what stops a full-bleed pattern ending in a hard line against the page.
   */
  mask?: "radial"
  /**
   * Dots swell under the pointer and settle back to the plain field within
   * `HOVER_RADIUS` of it, in the field's own colour — the spotlight is a
   * change of size, not of hue. This is the one mode that answers something
   * — it says the panel is live — so unlike `glow` and `ripple` it survives
   * a reduced-motion preference: it follows a pointer the reader is already
   * moving, rather than running on its own clock.
   */
  hover?: boolean
  [key: string]: unknown
}

/**
 * DotPattern Component
 *
 * A React component that creates an animated or static dot pattern background using SVG.
 * The pattern automatically adjusts to fill its container and can optionally display glowing dots.
 *
 * @component
 *
 * @see DotPatternProps for the props interface.
 *
 * @example
 * // Basic usage
 * <DotPattern />
 *
 * // With glowing effect and custom spacing
 * <DotPattern
 *   width={20}
 *   height={20}
 *   glow={true}
 *   className="opacity-50"
 * />
 *
 * @notes
 * - The component is client-side only ("use client")
 * - Automatically responds to container size changes
 * - When glow is enabled, dots will animate with random delays and durations
 * - Uses Motion for animations
 * - Dots color can be controlled via the text color utility classes
 */

/**
 * Deterministic per-dot jitter, replacing the upstream `Math.random()`.
 *
 * Random values read during render are impure: this project builds with
 * `reactCompiler: true`, and the component re-renders on every window resize,
 * so each resize would deal every dot a new delay and duration and the whole
 * field would visibly reshuffle. Hashing the index gives the same scattered
 * look and holds it still across renders.
 */
function jitter(seed: number) {
  const value = Math.sin(seed * 127.1) * 43758.5453
  return value - Math.floor(value)
}

/** Seconds for one pulse. Every rippling dot shares it; only the phase differs. */
const RIPPLE_CYCLE = 3
/** How fast the ring travels, in px per second. Cycle × speed is the gap
    between concurrent rings — 390px, so a panel a few hundred px across
    carries two or three at once. Faster than this and a wide panel holds one
    ring, which reads as the whole field breathing rather than a wave. */
const RIPPLE_SPEED = 130

/** How far from the pointer the highlight reaches, in px. Roughly a thumb's
    width of dots — wide enough to read as a field responding, small enough
    that the pointer is still obviously the source. */
const HOVER_RADIUS = 110
/** The highlighted dot, as a multiple of `cr`. The spotlight keeps the
    field's colour, so size is the whole signal — and area grows with the
    square, which is why 3 reads as a clear bloom and not a smudge. */
const HOVER_SCALE = 3
/** The tile and its eight neighbours. An enlarged dot sitting at a pattern
    tile's own origin spills past the tile edge and is clipped there; drawing
    the neighbours' copies too puts back exactly what each edge loses. */
const TILE_NEIGHBOURS = [-1, 0, 1].flatMap((column) =>
  [-1, 0, 1].map((row) => [column, row] as const),
)

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ripple = false,
  mask,
  hover = false,
  ...props
}: DotPatternProps) {
  const id = useId()
  /* An endless pulse is exactly what a reader who asked for less motion asked
     to be spared, so both animated modes fall back to the static field. */
  const stillness = useReducedMotion()
  const animated = !stillness && (glow || ripple)
  const containerRef = useRef<SVGSVGElement>(null)
  /* The two things the pointer moves. Both are written imperatively rather
     than through state: a pointermove that re-rendered would re-render every
     dot in the field, hundreds of nodes, on every frame of a mouse drag. */
  const spotRef = useRef<SVGCircleElement>(null)
  const layerRef = useRef<SVGRectElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (!hover) return
    const svg = containerRef.current
    /* The pattern is a background and stays `pointer-events-none`, so it
       never sees a pointer itself. The panel it sits behind does, and that is
       also the right target: hovering the panel's own content should light
       the field up too, not switch it off. */
    const panel = svg?.parentElement
    if (!svg || !panel) return

    let frame = 0
    let point: { x: number; y: number } | null = null
    /* Where the panel is on screen. Measured lazily and kept, because
       `getBoundingClientRect` forces layout: reading it inside pointermove
       meant a forced reflow on every frame of every mouse movement. Anything
       that can move the panel drops it instead, and the next move re-reads. */
    let box: DOMRect | null = null
    const remeasure = () => {
      box = null
    }

    const paint = () => {
      frame = 0
      if (!spotRef.current || !point) return
      spotRef.current.setAttribute("cx", String(point.x))
      spotRef.current.setAttribute("cy", String(point.y))
    }

    const onMove = (event: PointerEvent) => {
      /* A finger has no hover. On a touchscreen the highlight would appear
         under the tap and stay there, which reads as a stuck panel. */
      if (event.pointerType === "touch") return
      box ??= svg.getBoundingClientRect()
      point = { x: event.clientX - box.left, y: event.clientY - box.top }
      layerRef.current?.style.setProperty("opacity", "1")
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const onLeave = () => {
      layerRef.current?.style.setProperty("opacity", "0")
    }

    panel.addEventListener("pointermove", onMove)
    panel.addEventListener("pointerleave", onLeave)
    /* Capture, so a scroll inside any ancestor counts and not just the
       window's own. */
    window.addEventListener("scroll", remeasure, true)
    window.addEventListener("resize", remeasure)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      panel.removeEventListener("pointermove", onMove)
      panel.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("scroll", remeasure, true)
      window.removeEventListener("resize", remeasure)
    }
  }, [hover])

  const dots = Array.from(
    {
      length:
        Math.ceil(dimensions.width / width) *
        Math.ceil(dimensions.height / height),
    },
    (_, i) => {
      const col = i % Math.ceil(dimensions.width / width)
      const row = Math.floor(i / Math.ceil(dimensions.width / width))
      const dotX = col * width + cx + x
      const dotY = row * height + cy + y
      const distance = Math.hypot(
        dotX - dimensions.width / 2,
        dotY - dimensions.height / 2,
      )

      return {
        x: dotX,
        y: dotY,
        delay: ripple
          ? (distance / RIPPLE_SPEED) % RIPPLE_CYCLE
          : jitter(i) * 5,
        duration: ripple ? RIPPLE_CYCLE : jitter(i + 0.5) * 3 + 2,
      }
    }
  )

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
        mask === "radial" &&
          "[mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]",
        className
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        {hover && (
          <>
            {/* The enlarged field, as one tile the renderer repeats, rather
                than a second copy of every dot. That copy was the stutter:
                hundreds of extra nodes under a mask, which the browser has
                to re-rasterise as one layer on every frame the pointer
                moves. A pattern fills a single rect and costs one node. */}
            <pattern
              id={`${id}-hover-dots`}
              x={x}
              y={y}
              width={width}
              height={height}
              patternUnits="userSpaceOnUse"
            >
              {TILE_NEIGHBOURS.map(([column, row]) => (
                <circle
                  key={`${column}-${row}`}
                  cx={cx + column * width}
                  cy={cy + row * height}
                  r={cr * HOVER_SCALE}
                  fill="currentColor"
                />
              ))}
            </pattern>
            {/* The falloff itself. A mask reads luminance, so white at the
                pointer shows the highlighted dot whole and transparent at the
                edge of the reach leaves the plain one — every dot between
                them is a blend of the two, which is what makes the edge of
                the spotlight a gradient rather than a circle. */}
            <radialGradient id={`${id}-hover-gradient`}>
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id={`${id}-hover-mask`} maskUnits="userSpaceOnUse">
              {/* Parked off-canvas until the first pointermove, so the
                  spotlight is never briefly visible in a corner. */}
              <circle
                ref={spotRef}
                cx={-HOVER_RADIUS}
                cy={-HOVER_RADIUS}
                r={HOVER_RADIUS}
                fill={`url(#${id}-hover-gradient)`}
              />
            </mask>
          </>
        )}
      </defs>
      {dots.map((dot) => (
        <motion.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          /* Solid, not the glow gradient. A gradient dot is faintest at its
             own edge, which is the part a ripple grows — at border grey the
             travelling ring washed out to nothing. `glow` keeps it because a
             glow is meant to be soft. */
          fill={glow ? `url(#${id}-gradient)` : "currentColor"}
          initial={animated ? { opacity: 0.4, scale: 1 } : {}}
          animate={
            animated
              ? {
                  /* The ripple swings further down than `glow` does. What
                     reads as a wave is the gap between crest and trough, and
                     at border grey a dot at 0.4 is already almost the page. */
                  opacity: ripple ? [0.15, 1, 0.15] : [0.4, 1, 0.4],
                  scale: ripple ? [1, 2.2, 1] : [1, 1.5, 1],
                }
              : {}
          }
          transition={
            animated
              ? {
                  duration: dot.duration,
                  repeat: Infinity,
                  /* The ripple runs forward every time: reversing it would
                     send the ring back inwards, which is a pulse rather than
                     a ripple. `glow` has no direction to preserve. */
                  repeatType: ripple ? "loop" : "reverse",
                  delay: dot.delay,
                  ease: "easeInOut",
                }
              : {}
          }
        />
      ))}
      {/* The enlarged lattice, in the field's own colour, shown only where
          the mask lets it through. Moving the spotlight is two attributes on
          one circle — nothing here is rebuilt, recoloured or re-laid-out. */}
      {hover && (
        <rect
          ref={layerRef}
          width="100%"
          height="100%"
          fill={`url(#${id}-hover-dots)`}
          mask={`url(#${id}-hover-mask)`}
          className="opacity-0 transition-opacity duration-200 ease-out-cubic motion-reduce:transition-none"
        />
      )}
    </svg>
  )
}
