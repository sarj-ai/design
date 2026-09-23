---
name: sarj-figure
description: Draw the hairline technical figures the design lab uses in its nav panels and design-system section cards — a plan of the thing, in currentColor strokes, with the one measurement that governs it called out. Use whenever adding, redrawing or reviewing one of these SVG figures, or when a card or panel in this repo needs an illustration.
---

# Sarj figures — technical drawings, not pictures

The lab's illustrations are **technical drawings of the thing a link opens**:
hairlines, a few guides, and the one number that actually governs it, called
out like a dimension on a plan. The worked examples are in
`src/components/shell/nav-figures.tsx` — read all three before drawing:

| Figure | What it draws | The callout |
|---|---|---|
| `MockupsFigure` | an app window: rail, header rule, two cards, a row | `1400px` — `max-w-350`, the width every page is laid out at |
| `ReelsFigure` | the reel canvas, a line of type against a shot, a timeline of keyframes | `1920` × `1080` |
| `SystemFigure` | `Aa` on its cap / x-height / baseline guides, and a radius corner | `x-height`, `10px` — `--radius` |

## The register

1. **A plan of it, not a picture of it.** Draw the structure the section is
   about — its geometry, its scale, its states — the way an engineer would
   sketch it on a whiteboard. Not an icon blown up, not a mascot, not a
   screenshot traced in outline.
2. **One true number.** Every figure calls out at least one real value from
   this repo — a token, a limit, a count — and it must be true. Check
   `src/app/globals.css`, `src/lib/design-system/data.ts`, `AGENTS.md`. A
   made-up number is worse than none.
3. **Hairlines, one weight.** Every stroke uses the `LINE` preset
   (`strokeWidth 2`, round caps and joins, `currentColor`). Hierarchy comes
   from `opacity` (`.7` secondary, `.5`/`.6` guides) and `strokeDasharray="4 8"`
   for construction lines — never from a second weight or a second colour.
4. **Dimension lines look like dimension lines.** A rule, a tick at each end
   (`v20` centred on the rule), and an open arrowhead
   (`m10 -8 -10 8 10 8`-style chevrons) pointing at each tick. Label centred
   above, or rotated 90° beside a vertical one.
5. **Guides span the whole sheet — edge to edge, never stopping short.** Every
   dashed guide is a full-length line: a horizontal one runs from `x=0` to the
   sheet's full width (`h960` on a 960 sheet), a vertical one from `y=0` to the
   full height. A guide that starts or ends somewhere in the middle of the
   sheet reads as a drawing error, not a construction line. The container
   crops the ends — lean into that. Where a guide would cross a shape, let it:
   the shape sits on top of its guides, which is what a plan looks like.
6. **Fills are rare.** `fill="currentColor"` only for small markers — the
   keyframe rhombuses, a dot on a curve, a handle. Never a filled panel.
7. **Labels are annotation.** `<text className="text-xs" fill="currentColor">`,
   lowercase or the literal value (`1400px`, `cap`, `baseline`). Two to four
   labels at most. Never a sentence, never a heading, never a font family.
   `text-9xl font-semibold` is allowed once, for a specimen like `Aa`.
8. **Quiet.** Leave half the sheet empty. If you are adding a fifth element
   ask what it says that the other four do not. Five elements that each carry
   a fact beat fifteen that fill the space.

## Mechanics

```tsx
import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

export function ThingFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox="0 0 960 200">
      <g {...LINE}>
        <path d="M0 150h960" opacity=".6" strokeDasharray="4 8" />
        {/* … */}
      </g>
      <text className="text-xs" fill="currentColor" x="…" y="…">4px</text>
    </Figure>
  )
}
```

- `Figure` (`src/components/shared/figure.tsx`) is the `<svg>`: `aria-hidden`,
  `w-full`, `size-auto` (load-bearing — see the comment there), default
  viewBox `0 0 520 320`. Pass `viewBox` for another sheet.
- **Draw at ~1.4–2x** the size it lands at so `text-xs` (12 units) renders at
  7–9px. Nav panel cells: `0 0 520 320` in a ~260px cell. Section cards:
  `SECTION_FIGURE_VIEWBOX` = `0 0 960 200` in a ~672px card.
- **Never set a colour.** The placement sets `text-border` (or
  `text-primary-foreground/30` on the brand card) and lifts it on hover. No
  hex, no token class inside the figure — `npm run lint` fails raw colour, and
  a hard colour breaks the brand card.
- No `transition-*`, no `animate-*`, no `<animate>`, no filters, no shadows,
  no gradients. The placement owns the hover motion.
- Comment each group with *what it is and why it is true*, as the nav figures
  do — "1400px is `max-w-350`, the width every page is laid out at".

## Checking it

Look at it rendered, at size, before calling it done. From the scratchpad
directory, against the running dev server (read its port from
`.next/dev/lock`), a script that loads the page, drops sticky positioning,
and screenshots the element. Downscale with `sips -Z 1300` before reading.
Then `npx eslint <file>` and `npm run typecheck` — zero problems.

Reject your own figure if: it reads as an icon; a label is a sentence; the
number is not in the repo; it fills the whole sheet edge to edge with detail;
it needs a legend; any guide starts or stops short of the sheet's edges.
