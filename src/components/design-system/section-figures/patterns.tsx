import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/**
 * Patterns: the one table every table is — "one container, one header band,
 * one row height" — with the pagination row under it, drawn at 0.8 units per
 * pixel.
 *
 * Every size is `shared/data-table.tsx`: the container is `rounded-lg border`
 * (10px, `--radius-lg` = `--radius`, so rx 8), the header band and every body
 * row are 40px (`h-10` on `th` in `ui/table.tsx`, `[&_td]:h-10` on the body),
 * and cells pad 16px (`px-4`), which is where the column stubs start. The
 * callout is "Rows are 40px, always" from TABLE_RULES. Under the table, inside
 * its width, sit the page size at the start and the cursor controls at the end
 * (PAGINATION_RULES) — two buttons, no page numbers.
 */
export function PatternsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The row lines, run off both edges: the band's top and bottom and
            the first row's bottom, so the table reads as cut from a page. */}
        <path
          d="M0 16h960M0 48h960M0 80h960"
          opacity=".6"
          strokeDasharray="4 8"
        />

        {/* One container: bordered, radius 10px, no padding of its own, so the
            band reaches the edge. The band and three 40px rows inside it. */}
        <rect height="128" rx="8" width="560" x="200" y="16" />
        <path d="M200 48h560" />
        <path d="M200 80h560M200 112h560" opacity=".5" />

        {/* Header labels at full strength, cell text a step back. Starts sit
            16px in; the number column end-aligns, header included. */}
        <path d="M213 32h56M400 32h72M699 32h48" />
        <path
          d="M213 64h40M400 64h96M715 64h32M213 96h40M400 96h72M707 96h40M213 128h40M400 128h88M719 128h28"
          opacity=".7"
        />

        {/* Pagination, under the table and inside its width: page size at the
            start, Previous and Next at the end. */}
        <rect height="24" opacity=".7" rx="6" width="56" x="200" y="164" />
        <rect height="24" opacity=".7" rx="6" width="64" x="616" y="164" />
        <rect height="24" opacity=".7" rx="6" width="64" x="696" y="164" />

        {/* 40px, measured on the first body row. */}
        <path d="M800 48v32" />
        <path d="M790 48h20M790 80h20" />
        <path d="m792 58 8-10 8 10M792 70l8 10 8-10" />
      </g>

      <text className="text-xs" fill="currentColor" x="16" y="42">
        header
      </text>
      <text className="text-xs" fill="currentColor" x="16" y="74">
        row
      </text>
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        transform="rotate(90 828 64)"
        x="828"
        y="64"
      >
        40px
      </text>
    </Figure>
  )
}
