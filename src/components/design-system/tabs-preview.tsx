"use client"

import * as React from "react"

import {
  CostIcon,
  ModelIcon,
  TranscriptIcon,
} from "@/components/design-system/icons"
import {
  ReferenceLabel,
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
  type ReferenceRow,
} from "@/components/design-system/reference-table"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const VIEWS = [
  { id: "transcript", label: "Transcript", Icon: TranscriptIcon },
  { id: "model", label: "Model", Icon: ModelIcon },
  { id: "cost", label: "Cost", Icon: CostIcon },
]

const PANELS: Record<
  string,
  { columns: { header: string; width?: string }[]; rows: ReferenceRow[] }
> = {
  transcript: {
    columns: [
      { header: "Speaker", width: "w-32" },
      { header: "At", width: "w-20" },
      { header: "Line" },
    ],
    rows: [
      {
        key: "t1",
        cells: [
          <ReferenceLabel key="s">Agent</ReferenceLabel>,
          <ReferenceNote key="a">0:00</ReferenceNote>,
          <ReferenceNote key="l">
            Rawabi Holding, how can I help?
          </ReferenceNote>,
        ],
      },
      {
        key: "t2",
        cells: [
          <ReferenceLabel key="s">Customer</ReferenceLabel>,
          <ReferenceNote key="a">0:04</ReferenceNote>,
          <ReferenceNote key="l">
            I need to move my delivery to Thursday.
          </ReferenceNote>,
        ],
      },
      {
        key: "t3",
        cells: [
          <ReferenceLabel key="s">Agent</ReferenceLabel>,
          <ReferenceNote key="a">0:09</ReferenceNote>,
          <ReferenceNote key="l">
            I can do that. Can I take the order number?
          </ReferenceNote>,
        ],
      },
    ],
  },
  model: {
    columns: [{ header: "Setting", width: "w-56" }, { header: "Value" }],
    rows: [
      {
        key: "m1",
        cells: [
          <ReferenceLabel key="s">Model</ReferenceLabel>,
          <ReferenceName key="v">gpt-4o-mini</ReferenceName>,
        ],
      },
      {
        key: "m2",
        cells: [
          <ReferenceLabel key="s">Voice</ReferenceLabel>,
          <ReferenceNote key="v">Layla — Gulf Arabic</ReferenceNote>,
        ],
      },
      {
        key: "m3",
        cells: [
          <ReferenceLabel key="s">Temperature</ReferenceLabel>,
          <ReferenceName key="v">0.3</ReferenceName>,
        ],
      },
      {
        key: "m4",
        cells: [
          <ReferenceLabel key="s">Turn limit</ReferenceLabel>,
          <ReferenceName key="v">24</ReferenceName>,
        ],
      },
    ],
  },
  cost: {
    columns: [{ header: "Item", width: "w-56" }, { header: "Amount" }],
    rows: [
      {
        key: "c1",
        cells: [
          <ReferenceLabel key="i">Speech to text</ReferenceLabel>,
          <ReferenceNote key="a">$0.03</ReferenceNote>,
        ],
      },
      {
        key: "c2",
        cells: [
          <ReferenceLabel key="i">Model</ReferenceLabel>,
          <ReferenceNote key="a">$0.11</ReferenceNote>,
        ],
      },
      {
        key: "c3",
        cells: [
          <ReferenceLabel key="i">Text to speech</ReferenceLabel>,
          <ReferenceNote key="a">$0.06</ReferenceNote>,
        ],
      },
      {
        key: "c4",
        cells: [
          <ReferenceLabel key="i">Telephony</ReferenceLabel>,
          <ReferenceNote key="a">$0.21</ReferenceNote>,
        ],
      },
      {
        key: "c5",
        cells: [
          <ReferenceLabel key="i">Total</ReferenceLabel>,
          <ReferenceLabel key="a">$0.41</ReferenceLabel>,
        ],
      },
    ],
  },
}

const INSTEAD = [
  {
    when: "Several views of one object",
    surface: "Tabs",
    why: "The object does not change as the reader moves between them.",
  },
  {
    when: "Steps toward making one object",
    surface: "Multi-step creation",
    why: "A sequence. The reader cannot skip one, and tabs imply they can.",
  },
  {
    when: "A different object",
    surface: "A route of its own",
    why: "It needs a URL someone can send. A tab has no address.",
  },
  {
    when: "One setting on the object",
    surface: "Drawer",
    why: "You still need the page behind it while you change it.",
  },
]

type Marker = { base: number; x: number; scale: number }

/** Drawn at the widest tab's width and scaled down from its left edge, so the move is a transform rather than a width change. */
function useMarker(active: string) {
  const triggers = React.useRef(new Map<string, HTMLButtonElement>())
  const [marker, setMarker] = React.useState<Marker | null>(null)

  React.useEffect(() => {
    const measure = () => {
      const nodes = Array.from(triggers.current.values())
      const current = triggers.current.get(active)
      if (!current || !nodes.length) return
      const base = Math.max(...nodes.map((node) => node.offsetWidth))
      setMarker({
        base,
        x: current.offsetLeft,
        scale: current.offsetWidth / base,
      })
    }

    measure()

    /* Re-measured because labels change width when Nunito loads and at narrower viewports. */
    const observer = new ResizeObserver(measure)
    for (const node of triggers.current.values()) observer.observe(node)
    return () => observer.disconnect()
  }, [active])

  return { triggers, marker }
}

function triggerRef(
  triggers: React.RefObject<Map<string, HTMLButtonElement>>,
  id: string,
) {
  return (node: HTMLButtonElement | null) => {
    if (node) triggers.current.set(id, node)
    else triggers.current.delete(id)
  }
}

export function TabsPreview() {
  const [view, setView] = React.useState(VIEWS[0].id)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium">Primary</span>
        <PrimaryTabs onValueChange={setView} value={view} />
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium">Secondary</span>
        <SecondaryTabs onValueChange={setView} value={view}>
          {VIEWS.map((entry) => (
            <TabsContent
              className="motion-safe:data-active:animate-pane-in motion-reduce:animate-none"
              key={entry.id}
              value={entry.id}
            >
              <ReferenceTable
                columns={PANELS[entry.id].columns}
                rows={PANELS[entry.id].rows}
              />
            </TabsContent>
          ))}
        </SecondaryTabs>
      </div>

      <Separator />

      <ReferenceTable
        columns={[
          { header: "What you have", width: "w-72" },
          { header: "Reach for", width: "w-56" },
          { header: "Why" },
        ]}
        rows={INSTEAD.map((one) => ({
          key: one.when,
          cells: [
            <ReferenceLabel key="w">{one.when}</ReferenceLabel>,
            <ReferenceLabel key="s">{one.surface}</ReferenceLabel>,
            <ReferenceNote key="y">{one.why}</ReferenceNote>,
          ],
        }))}
      />
    </div>
  )
}

type TabItem = {
  id: string
  label: string
  Icon?: React.ComponentType
}

export function PrimaryTabs({
  items = VIEWS,
  onValueChange,
  value,
  children,
}: {
  items?: TabItem[]
  onValueChange: (value: string) => void
  value: string
  children?: React.ReactNode
}) {
  const { triggers, marker } = useMarker(value)

  return (
    <Tabs className="gap-4" onValueChange={onValueChange} value={value}>
      <div className="flex w-fit flex-col gap-2">
        <TabsList className="relative gap-1 bg-transparent p-0">
          {marker ? (
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 origin-left rounded-lg bg-muted transition-transform duration-200 ease-out-cubic motion-reduce:transition-none"
              style={{
                width: marker.base,
                transform: `translateX(${marker.x}px) scaleX(${marker.scale})`,
              }}
            />
          ) : null}
          {items.map((entry) => (
            /* The shadow is switched off under the primitive's own variant prefix; a bare `data-active:shadow-none` loses on specificity. */
            <TabsTrigger
              className="flex-none gap-2 px-3 data-active:bg-transparent not-data-active:hover:bg-muted/60 group-data-[variant=default]/tabs-list:data-active:shadow-none"
              key={entry.id}
              ref={triggerRef(triggers, entry.id)}
              value={entry.id}
            >
              {entry.Icon ? <entry.Icon /> : null}
              {entry.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator />
      </div>

      {children}
    </Tabs>
  )
}

export function SecondaryTabs({
  items = VIEWS,
  aside,
  children,
  onValueChange,
  value,
}: {
  /** A control at the end of the tab row that scopes every tab. */
  items?: TabItem[]
  aside?: React.ReactNode
  children: React.ReactNode
  onValueChange: (value: string) => void
  value: string
}) {
  const { triggers, marker } = useMarker(value)

  return (
    <Tabs className="gap-4" onValueChange={onValueChange} value={value}>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex w-fit flex-col">
          <TabsList className="gap-1 p-0" variant="line">
            {items.map((entry) => (
              <TabsTrigger
                className="flex-none gap-2 px-3 group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
                key={entry.id}
                ref={triggerRef(triggers, entry.id)}
                value={entry.id}
              >
                {entry.Icon ? <entry.Icon /> : null}
                {entry.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Separator />

          {marker ? (
            <div
              aria-hidden
              className="absolute bottom-0 left-0 h-0.5 origin-left rounded-full bg-primary transition-transform duration-200 ease-out-cubic motion-reduce:transition-none"
              style={{
                width: marker.base,
                transform: `translateX(${marker.x}px) scaleX(${marker.scale})`,
              }}
            />
          ) : null}
        </div>
        {aside}
      </div>

      {children}
    </Tabs>
  )
}
