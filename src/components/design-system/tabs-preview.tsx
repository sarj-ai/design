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

/**
 * Tabs, and the three things that get mistaken for them.
 *
 * The rule is one object seen several ways. Everything that goes wrong with
 * tabs is a different relationship wearing them: steps are a sequence and the
 * reader cannot skip one, separate objects are separate routes and need their
 * own URL, and a single setting is a drawer beside the thing it belongs to.
 * All three are patterns on this tab already, which is why the alternatives
 * name them rather than describing them.
 *
 * Two weights, sharing one selection so that clicking either moves both —
 * they are one component, and a preview that let them drift would imply two.
 */

const VIEWS = [
  { id: "transcript", label: "Transcript", Icon: TranscriptIcon },
  { id: "model", label: "Model", Icon: ModelIcon },
  { id: "cost", label: "Cost", Icon: CostIcon },
]

/**
 * What each tab shows: one call, seen three ways.
 *
 * The three panels are deliberately different tables rather than the same one
 * with different numbers in it — the rule this topic teaches is that tabs hold
 * views of one object, and three views that look identical demonstrate nothing.
 * The amounts add up to the $0.41 CL-8842 carries on the index page, because a
 * reader who checks is a reader the mock data should not lose.
 */
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

/** Where the moving marker sits, in the list's own pixels. */
type Marker = { base: number; x: number; scale: number }

/**
 * The travel, measured rather than guessed.
 *
 * The tabs are as wide as their words, so the marker has to change width as
 * well as move — and width is a layout property. It is drawn at the width of
 * the widest tab and scaled down from its left edge instead, which is a
 * transform, so the whole move is one composited property.
 */
function useMarker(active: string) {
  const triggers = React.useRef(new Map<string, HTMLButtonElement>())
  const [marker, setMarker] = React.useState<Marker | null>(null)

  React.useEffect(() => {
    const measure = () => {
      const nodes = VIEWS.flatMap(
        (entry) => triggers.current.get(entry.id) ?? [],
      )
      const current = triggers.current.get(active)
      if (!current || nodes.length !== VIEWS.length) return
      const base = Math.max(...nodes.map((node) => node.offsetWidth))
      setMarker({
        base,
        x: current.offsetLeft,
        scale: current.offsetWidth / base,
      })
    }

    measure()

    /* Every label changes width when Nunito finishes loading, and again at a
       narrower viewport, so the marker is re-measured rather than measured
       once. */
    const observer = new ResizeObserver(measure)
    for (const node of triggers.current.values()) observer.observe(node)
    return () => observer.disconnect()
  }, [active])

  return { triggers, marker }
}

/** Collects the trigger nodes the measurement above reads. */
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
          {/* The same arrival the docs pane uses, and deliberately the same
              token: a tab panel and a topic pane are one event at two scales,
              and two near-identical curves is how a system stops having one.

              Scoped to the active state, not put on the element. Radix keeps
              all three panels mounted and hides the inactive ones with the
              `hidden` attribute, so the element is never rebuilt and a plain
              `animate-pane-in` played once on first mount and never again.
              Attached to `data-active` it is added and removed with the state,
              which is what restarts it on every switch.

              Nothing animates out: the panel leaving is hidden outright, so
              there is nothing to fade and nothing to position absolutely.

              motion-safe as well as motion-reduce, because a bare
              `motion-reduce:animate-none` lost here: it is one class deep and
              `data-active:animate-pane-in` is a class plus an attribute, so
              the animation outranked its own escape and still played under
              reduced motion. Gating the animation on motion-safe means there
              is nothing to outrank — under reduce the class never applies. */}
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

      {/* The rule below is documentation about tabs, not a view of the call
          above it. Without this line it sits where a panel sits and reads as
          one — which is what it did before the panels existed. */}
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

/**
 * The page's own tabs: the view you are on is a filled tab.
 *
 * No track behind the row — three labels and one filled tab say which view
 * you are on, and a grey trough around them says nothing a reader needs. What
 * the trough did carry is that the three belong together, so a rule under the
 * row carries it instead, as wide as the tabs and no wider, which is the
 * difference between a tab bar and three buttons someone left in a line.
 *
 * Geometry goes in `style` because it is measured; every class here is on the
 * scale.
 */
function PrimaryTabs({
  onValueChange,
  value,
}: {
  onValueChange: (value: string) => void
  value: string
}) {
  const { triggers, marker } = useMarker(value)

  return (
    <Tabs onValueChange={onValueChange} value={value}>
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
          {VIEWS.map((entry) => (
            /* The pill behind is the only background drawn, so the trigger's
               own active background would sit on top of it and hide the
               travel, and its active shadow would be cast by a box with
               nothing in it. The shadow is switched off under the primitive's
               own variant prefix so the two classes merge; a bare
               `data-active:shadow-none` loses to it on specificity and the
               shadow survives.

               Hover is lighter than the pill on purpose. It only has to say
               the tab is a control; at the pill's own weight a hovered tab and
               the open one look identical, and the row reads as two open tabs
               for as long as the pointer sits there. */
            <TabsTrigger
              className="flex-none gap-2 px-3 data-active:bg-transparent not-data-active:hover:bg-muted/60 group-data-[variant=default]/tabs-list:data-active:shadow-none"
              key={entry.id}
              ref={triggerRef(triggers, entry.id)}
              value={entry.id}
            >
              <entry.Icon />
              {entry.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator />
      </div>
    </Tabs>
  )
}

/**
 * The lighter weight: a rule under the words, and the selected word carries a
 * segment of it.
 *
 * For views inside a page that already has a tab bar — a section of a drawer,
 * a panel within a view — where a second row of filled tabs would compete
 * with the first for which one is the page.
 *
 * The primitive's `line` variant already draws an underline, but it draws one
 * per trigger and fades between them, so nothing connects the tab you left to
 * the tab you arrived at. One bar that travels does, and it is the same
 * measured move as the pill above. The per-trigger underline is switched off
 * under the primitive's own variant prefix so the two classes merge, the same
 * reason the shadow is.
 */
function SecondaryTabs({
  children,
  onValueChange,
  value,
}: {
  children: React.ReactNode
  onValueChange: (value: string) => void
  value: string
}) {
  const { triggers, marker } = useMarker(value)

  return (
    <Tabs className="gap-4" onValueChange={onValueChange} value={value}>
      <div className="relative flex w-fit flex-col gap-2">
        <TabsList className="gap-1 p-0" variant="line">
          {VIEWS.map((entry) => (
            <TabsTrigger
              className="flex-none gap-2 px-3 group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
              key={entry.id}
              ref={triggerRef(triggers, entry.id)}
              value={entry.id}
            >
              <entry.Icon />
              {entry.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator />

        {/* Sits on the rule rather than under it: the bar is the part of the
            rule the open tab owns, not a second line below it. */}
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

      {children}
    </Tabs>
  )
}
