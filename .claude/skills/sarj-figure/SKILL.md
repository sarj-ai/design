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

## Composition — what separates a good plate from a sketch

The first round of section figures failed here, so these are hard rules:

9. **Compose for the whole sheet.** Centre the subject on the sheet's width
   with even margins on both sides. A drawing crammed into the left two
   thirds with a dead strip on the right reads as unfinished. Balance mass:
   if one side holds a dense object, the other holds its measurement or a
   second, related object — never nothing.
10. **One focal object, drawn well.** Pick the single thing the section is
    about and draw it large and precisely, with real proportions. Supporting
    elements are smaller and lighter (`opacity=".5"`–`.7"`). Four equal
    objects in a row have no focal point.
11. **Measurements live outside the object.** A number goes on a dimension
    line beside or above what it measures — never written inside a shape,
    where it reads as the shape's label (a box saying "36px" looks like a
    button whose text is 36px). Extension lines carry the edge out to the
    dimension line.
12. **Vertical rhythm.** Leave the same air above the drawing as below it.
    Put the guides on real edges of the object (its top, its baseline, its
    centre), not at arbitrary heights.
13. **It must hold at two sizes.** Section figures render in a ~320px plate
    in the list row (on `bg-muted`, and on brand purple on hover) and at
    ~1000px in the opened section (on brand purple). At 320px only the big
    shapes survive, so the silhouette must carry the idea on its own; at
    1000px every detail is inspected, so ticks, arrowheads and spacing must
    be exact and consistent. Check both.
14. **Consistency across the set.** Same stroke weight, same dash, same
    arrowhead shape, same label size, same margins as its siblings in
    `src/components/design-system/section-figures/`. Read them all before
    drawing one.

## Mechanics

```tsx
import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

export function ThingFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox="0 0 960 240">
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
  `SECTION_FIGURE_VIEWBOX` = `0 0 960 240`, shown in a ~320px plate in the list row and ~1000px in the opened section.
- **Never set a colour.** The placement sets `text-border` (or
  `text-primary-foreground/30` on the brand card) and lifts it on hover. No
  hex, no token class inside the figure — `npm run lint` fails raw colour, and
  a hard colour breaks the brand card.
- No `transition-*`, no `animate-*`, no `<animate>`, no filters, no shadows,
  no gradients. The placement owns the hover motion.
- Comment each group with *what it is and why it is true*, as the nav figures
  do — "1400px is `max-w-350`, the width every page is laid out at".

## Topic tiles — one small plate per topic

Each topic in an opened section sits on a white ~150px square tile, and each
one gets its own drawing in `src/components/design-system/topic-figures/`,
exported through a `Record<topicId, Figure>` map per file.

- Sheet: `TOPIC_FIGURE_VIEWBOX` = `0 0 240 240` (≈1.6x). Keep the box
  `x < 64, y < 48` clear — the tile prints its number there — and centre the
  subject in the rest, a little below the sheet's middle.
- **One idea per tile, drawn as an object.** A tile is an icon-sized plate,
  so rule 1 bends: the subject is the thing the topic is about, drawn in plan
  (a swatch strip for Colour, stacked planes for Layering, a spacing ruler for
  Spacing), not a scene. Two to five elements. No more than one text label,
  and only if it is a true value (`10px`, `300ms`); most tiles need none.
- Same hairline register as the rest: `LINE`, one weight, `.5`–`.7` opacity
  for secondary parts, `4 8` dashes for guides. Guides still run edge to edge.
- The tile sets the colour: `text-muted-foreground/60` at rest, `text-primary`
  on hover. Never set one inside the figure.
- A set reads as a set: siblings in one section share scale, margins and
  weight. Look at the whole grid, not one tile.
- Check with `node <scratchpad>/fig-tiles.mjs <section-id> <out.png>`
  (optionally a third arg, a topic id, to see it hovered), which screenshots
  the section's whole grid of tiles at 2x.

## Checking it

Look at it rendered, at size, before calling it done. From the scratchpad
directory, against the running dev server (read its port from
`.next/dev/lock`), a script that loads the page, drops sticky positioning,
and screenshots the element. Downscale with `sips -Z 1300` before reading.
Then `npx eslint <file>` and `npm run typecheck` — zero problems.

For section figures, `node <scratchpad>/fig-shot.mjs <section-id> <prefix>`
writes `<prefix>-row.png`, `<prefix>-row-hover.png` and `<prefix>-open.png` —
read all three.

Reject your own figure if: it reads as an icon; a label is a sentence; the
number is not in the repo; it fills the whole sheet edge to edge with detail;
it needs a legend; any guide starts or stops short of the sheet's edges;
a number sits inside a shape; one side of the sheet is empty; it has no
focal object.
