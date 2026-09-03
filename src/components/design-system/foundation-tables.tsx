"use client"

import {
  CloseIcon,
  CompletedIcon,
  DeleteIcon,
  ExportIcon,
  FailedIcon,
  HintIcon,
  InboundIcon,
  NarrowIcon,
  OutboundIcon,
  PreviewIcon,
  RowMenuIcon,
  RunningIcon,
  ScheduledIcon,
  SearchIcon,
  SortableIcon,
  StepDoneIcon,
  WarningIcon,
} from "@/components/design-system/icons"
import {
  ReferenceLabel,
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { GlobalRule } from "@/lib/design-system-data"
import { cn } from "@/lib/utils"

/**
 * Every foundation as the same table the colour tab uses: the specimen, what
 * it is called, and what it is for.
 *
 * These were a demo each — a row of samples with a caption under every one.
 * That answers "what does it look like" and stops. The questions people
 * actually arrive with are which one to reach for and what it is called, and
 * both of those are comparisons down a column.
 *
 * The specimen stays first, so the table is still the rule running rather than
 * a description of it.
 */

const SCROLL_ROWS = [
  "CL-8842 · Rawabi Holding",
  "CL-8841 · Nadec Foods",
  "CL-8840 · Al Bilad Bank",
  "CL-8839 · Almarai",
  "CL-8838 · Tamimi Markets",
]

function ScrollRows() {
  return (
    <div className="flex flex-col gap-1 p-3">
      {SCROLL_ROWS.map((row) => (
        <span className="text-sm" key={row}>
          {row}
        </span>
      ))}
    </div>
  )
}

/* Named for the job, not the glyph — the whole point of the rule. The source
   column is the HugeIcons export, because that is what you import. */
const ICONS = [
  {
    El: PreviewIcon,
    name: "PreviewIcon",
    from: "PlayIcon",
    use: "Play a sample.",
  },
  {
    El: SearchIcon,
    name: "SearchIcon",
    from: "Search01Icon",
    use: "Search a collection.",
  },
  {
    El: NarrowIcon,
    name: "NarrowIcon",
    from: "FilterIcon",
    use: "Narrow a list. Never called Filter.",
  },
  {
    El: ExportIcon,
    name: "ExportIcon",
    from: "Download01Icon",
    use: "Take the data out.",
  },
  {
    El: DeleteIcon,
    name: "DeleteIcon",
    from: "Delete02Icon",
    use: "Remove for good.",
  },
  {
    El: SortableIcon,
    name: "SortableIcon",
    from: "ArrowDataTransferVerticalIcon",
    use: "A column that can sort, unsorted.",
  },
  {
    El: InboundIcon,
    name: "InboundIcon",
    from: "ArrowDownLeft01Icon",
    use: "The caller rang in.",
  },
  {
    El: OutboundIcon,
    name: "OutboundIcon",
    from: "ArrowUpRight01Icon",
    use: "The platform rang out.",
  },
  {
    El: CompletedIcon,
    name: "CompletedIcon",
    from: "CheckmarkCircle02Icon",
    use: "Nothing left to do.",
  },
  {
    El: FailedIcon,
    name: "FailedIcon",
    from: "CancelCircleIcon",
    use: "The row is the failure.",
  },
  {
    El: RunningIcon,
    name: "RunningIcon",
    from: "Clock01Icon",
    use: "Unsettled, not wrong.",
  },
  {
    El: ScheduledIcon,
    name: "ScheduledIcon",
    from: "Calendar03Icon",
    use: "Deliberate, not yet due.",
  },
  {
    El: CloseIcon,
    name: "CloseIcon",
    from: "Cancel01Icon",
    use: "Dismiss a surface.",
  },
  {
    El: RowMenuIcon,
    name: "RowMenuIcon",
    from: "MoreHorizontalIcon",
    use: "Overflow at the end of a row.",
  },
  {
    El: HintIcon,
    name: "HintIcon",
    from: "InformationCircleIcon",
    use: "The (i) beside a field label.",
  },
  {
    El: WarningIcon,
    name: "WarningIcon",
    from: "Alert02Icon",
    use: "Attention, nothing broken.",
  },
  {
    El: StepDoneIcon,
    name: "StepDoneIcon",
    from: "Tick02Icon",
    use: "A step already behind you.",
  },
]

const SHADOWS = [
  {
    swatch: "bg-muted",
    name: "bg-muted",
    use: "Separation — a panel inset into the surface it sits on.",
  },
  {
    swatch: "bg-card ring-1 ring-foreground/10",
    name: "ring-1 ring-foreground/10",
    use: "Elevation — what Card draws. The only lift in the system.",
  },
]

const TYPE = [
  {
    cls: "text-2xl font-semibold",
    sample: "Page title",
    use: "One per page, and nothing under it may outweigh it.",
  },
  {
    cls: "text-lg font-semibold",
    sample: "Section heading",
    use: "A section of a page.",
  },
  {
    cls: "text-base font-medium",
    sample: "Card title",
    use: "A card, a dialog, a drawer. Never larger.",
  },
  {
    cls: "text-sm",
    sample: "Body text",
    use: "Everything a reader actually reads.",
  },
  {
    cls: "text-sm text-muted-foreground",
    sample: "Supporting text",
    use: "Descriptions and captions. Never smaller — muted says it.",
  },
]

const GAPS = [
  { cls: "gap-2", px: "8px", use: "An icon and the label it belongs to." },
  {
    cls: "gap-3",
    px: "12px",
    use: "Rows inside a card. Pick one of this and gap-4 per card.",
  },
  {
    cls: "gap-4",
    px: "16px",
    use: "Rows inside a card, or a compact card grid.",
  },
  {
    cls: "gap-6",
    px: "24px",
    use: "Card to card. Pick one of this and gap-4 per page.",
  },
  { cls: "gap-8", px: "32px", use: "Section to section." },
]

const RADII = [
  {
    cls: "rounded-sm",
    px: "6px",
    use: "A swatch or a chip inside something else.",
  },
  { cls: "rounded-md", px: "8px", use: "Buttons and inputs — most controls." },
  {
    cls: "rounded-lg",
    px: "10px",
    use: "The base. Panels and bordered boxes.",
  },
  { cls: "rounded-xl", px: "14px", use: "Card and the overlays." },
]

export function FoundationTable({ id }: { id: GlobalRule["id"] }) {
  switch (id) {
    case "icons":
      return (
        <ReferenceTable
          columns={[
            { header: "Icon", width: "w-20" },
            { header: "Named here", width: "w-56" },
            { header: "HugeIcons export", width: "w-72" },
            { header: "What it does" },
          ]}
          rows={ICONS.map((one) => ({
            key: one.name,
            cells: [
              <one.El key="glyph" />,
              <ReferenceName key="name">{one.name}</ReferenceName>,
              <span
                className="font-mono text-sm text-muted-foreground"
                key="from"
              >
                {one.from}
              </span>,
              <ReferenceNote key="use">{one.use}</ReferenceNote>,
            ],
          }))}
        />
      )

    case "shadows":
      return (
        <ReferenceTable
          columns={[
            { header: "Example", width: "w-48" },
            { header: "Class", width: "w-72" },
            { header: "Reach for it" },
          ]}
          rows={SHADOWS.map((one) => ({
            key: one.name,
            cells: [
              <div className={cn("h-8 w-32 rounded-md", one.swatch)} key="s" />,
              <ReferenceName key="name">{one.name}</ReferenceName>,
              <ReferenceNote key="use">{one.use}</ReferenceNote>,
            ],
          }))}
        />
      )

    case "typography":
      return (
        <ReferenceTable
          columns={[
            { header: "Example", width: "w-64" },
            { header: "Classes", width: "w-72" },
            { header: "Reach for it" },
          ]}
          rows={TYPE.map((one) => ({
            key: one.cls,
            cells: [
              <span className={one.cls} key="s">
                {one.sample}
              </span>,
              <ReferenceName key="cls">{one.cls}</ReferenceName>,
              <ReferenceNote key="use">{one.use}</ReferenceNote>,
            ],
          }))}
        />
      )

    case "spacing":
      return (
        <ReferenceTable
          columns={[
            { header: "Example", width: "w-48" },
            { header: "Token", width: "w-32" },
            { header: "Value", width: "w-24" },
            { header: "Reach for it" },
          ]}
          rows={GAPS.map((one) => ({
            key: one.cls,
            cells: [
              <div className={cn("flex", one.cls)} key="s">
                <div className="size-6 rounded-sm bg-muted" />
                <div className="size-6 rounded-sm bg-muted" />
                <div className="size-6 rounded-sm bg-muted" />
              </div>,
              <ReferenceName key="cls">{one.cls}</ReferenceName>,
              <ReferenceNote key="px">{one.px}</ReferenceNote>,
              <ReferenceNote key="use">{one.use}</ReferenceNote>,
            ],
          }))}
        />
      )

    case "radius":
      return (
        <ReferenceTable
          columns={[
            { header: "Example", width: "w-24" },
            { header: "Token", width: "w-40" },
            { header: "Value", width: "w-24" },
            { header: "Reach for it" },
          ]}
          rows={RADII.map((one) => ({
            key: one.cls,
            cells: [
              <div className={cn("size-10 bg-muted", one.cls)} key="s" />,
              <ReferenceName key="cls">{one.cls}</ReferenceName>,
              <ReferenceNote key="px">{one.px}</ReferenceNote>,
              <ReferenceNote key="use">{one.use}</ReferenceNote>,
            ],
          }))}
        />
      )

    case "scrollbars":
      return (
        <ReferenceTable
          columns={[
            { header: "Example", width: "w-72" },
            { header: "How it scrolls", width: "w-56" },
            { header: "What draws the bar" },
          ]}
          rows={[
            {
              key: "native",
              cells: [
                /* Padding on the inner block: radius + edge + padding together
                   is a hand-rolled Card, and lint says so. */
                <div
                  className="h-20 w-60 overflow-y-auto rounded-lg border"
                  key="s"
                >
                  <ScrollRows />
                </div>,
                <ReferenceName key="n">overflow-y-auto</ReferenceName>,
                <ReferenceNote key="u">
                  The browser, restyled in globals.css to match the primitive.
                </ReferenceNote>,
              ],
            },
            {
              key: "scrollarea",
              cells: [
                <ScrollArea className="h-20 w-60 rounded-lg border" key="s">
                  <ScrollRows />
                </ScrollArea>,
                <ReferenceName key="n">ScrollArea</ReferenceName>,
                <ReferenceNote key="u">
                  The primitive, for a pane that scrolls inside a page.
                </ReferenceNote>,
              ],
            },
          ]}
        />
      )

    case "accessibility":
      return (
        <ReferenceTable
          columns={[
            { header: "Example", width: "w-72" },
            { header: "Requirement", width: "w-48" },
            { header: "What it means" },
          ]}
          rows={[
            {
              key: "label",
              cells: [
                <div className="flex w-60 flex-col gap-2" key="s">
                  <Label htmlFor="foundation-voice">Voice name</Label>
                  <Input
                    defaultValue="Layla — Gulf Arabic"
                    id="foundation-voice"
                  />
                </div>,
                <ReferenceLabel key="n">Every control is named</ReferenceLabel>,
                <ReferenceNote key="u">
                  A label tied to the input, not a placeholder standing in for
                  one — a placeholder is gone the moment anyone types.
                </ReferenceNote>,
              ],
            },
            {
              key: "focus",
              cells: [
                /* Painted on rather than focused: the rule is what focus looks
                   like, and a static page cannot hold a tab stop.

                   These are Button's own focus-visible classes copied exactly
                   — border-ring ring-3 ring-ring/50. An approximation here is
                   worse than nothing: this table is the page someone checks a
                   focus ring against, so it has to be the ring, not a ring.
                   If button.tsx changes, this changes with it. */
                <Button
                  className="border-ring ring-3 ring-ring/50"
                  key="s"
                  size="sm"
                  variant="outline"
                >
                  Preview
                </Button>,
                <ReferenceLabel key="n">Focus is visible</ReferenceLabel>,
                <ReferenceNote key="u">
                  The ring is never removed. Anything reachable by tab shows
                  where the tab landed.
                </ReferenceNote>,
              ],
            },
          ]}
        />
      )
  }
}
