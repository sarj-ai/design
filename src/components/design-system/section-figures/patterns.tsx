import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/**
 * Patterns: the one table every table is — "one container, one header band,
 * one row height" — with the pagination row under it, drawn at 0.8 units per
 * pixel and centred on the sheet.
 *
 * Every size is `shared/data-table.tsx`: the container is `rounded-lg border`
 * (10px, `--radius-lg` = `--radius`, so rx 8), the header band and every body
 * row are 40px (`h-10` on `th` in `ui/table.tsx`, `[&_td]:h-10` on the body,
 * so 32 units), and cells pad 16px (`px-4`, 12.8 units), which is where the
 * column stubs start and the number column ends. The two callouts are the
 * same 40px, once on the band and once on a row: "Rows are 40px, always" from
 * TABLE_RULES, and the band lining up with the body is the point of it.
 *
 * Under the table, inside its width, sit the page size at the start and the
 * cursor controls at the end (PAGINATION_RULES) — Previous and Next, no page
 * numbers. That row is schematic; nothing on it is measured.
 */
export function PatternsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The container's top, the band's bottom and the first row's
            bottom, run to both edges: the extension lines both callouts
            stand on. */}
        <path
          d="M0 36h960M0 68h960M0 100h960"
          opacity=".6"
          strokeDasharray="4 8"
        />

        {/* One container: bordered, rx 8 (10px), no padding of its own, so
            the band reaches the edge. The band and three 40px rows. */}
        <rect height="128" rx="8" width="560" x="200" y="36" />
        <path d="M200 68h560" />
        <path d="M200 100h560M200 132h560" opacity=".5" />

        {/* Header labels at full strength, cell text a step back. Starts sit
            16px in; the number column end-aligns 16px from the edge, header
            included. */}
        <path d="M212.8 52h64M412.8 52h56M699.2 52h48" />
        <path
          d="M212.8 84h96M412.8 84h40M715.2 84h32M212.8 116h72M412.8 116h56M707.2 116h40M212.8 148h88M412.8 148h40M723.2 148h24"
          opacity=".7"
        />

        {/* Pagination, under the table and inside its width: the page size
            at the start, Previous and Next at the end. */}
        <g opacity=".7">
          <rect height="25.6" rx="8" width="72" x="200" y="176.8" />
          <path d="M212.8 189.6h24M248 186.6l5 5 5-5" />
          <rect height="25.6" rx="8" width="64" x="616" y="176.8" />
          <path d="m634 183.6-6 6 6 6M644 189.6h24" />
          <rect height="25.6" rx="8" width="64" x="696" y="176.8" />
          <path d="M708.8 189.6h24M742 183.6l6 6-6 6" />
        </g>

        {/* 40px on the header band, left of the table. */}
        <path d="M168 36v32" />
        <path d="M158 36h20M158 68h20" />
        <path d="m160 46 8-10 8 10M160 58l8 10 8-10" />

        {/* 40px on the first body row, right of the table. */}
        <path d="M792 68v32" />
        <path d="M782 68h20M782 100h20" />
        <path d="m784 78 8-10 8 10M784 90l8 10 8-10" />
      </g>

      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        transform="rotate(-90 142 52)"
        x="142"
        y="52"
      >
        40px
      </text>
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        transform="rotate(-90 818 84)"
        x="818"
        y="84"
      >
        40px
      </text>
    </Figure>
  )
}
