"use client"

import * as React from "react"

import {
  CostIcon,
  ModelIcon,
  TranscriptIcon,
} from "@/components/design-system/icons"
import {
  ReferenceLabel,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Tabs, and the three things that get mistaken for them.
 *
 * The rule is one object seen several ways. Everything that goes wrong with
 * tabs is a different relationship wearing them: steps are a sequence and the
 * reader cannot skip one, separate objects are separate routes and need their
 * own URL, and a single setting is a drawer beside the thing it belongs to.
 * All three are patterns on this tab already, which is why the alternatives
 * name them rather than describing them.
 */

const VIEWS = [
  { id: "transcript", label: "Transcript", Icon: TranscriptIcon },
  { id: "model", label: "Model", Icon: ModelIcon },
  { id: "cost", label: "Cost", Icon: CostIcon },
]

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

/** Where the pill sits, in the list's own pixels. */
type Pill = { base: number; x: number; scale: number }

export function TabsPreview() {
  const [view, setView] = React.useState(VIEWS[0].id)
  const triggers = React.useRef(new Map<string, HTMLButtonElement>())
  const [pill, setPill] = React.useState<Pill | null>(null)

  React.useEffect(() => {
    const measure = () => {
      const nodes = VIEWS.flatMap(
        (entry) => triggers.current.get(entry.id) ?? [],
      )
      const active = triggers.current.get(view)
      if (!active || nodes.length !== VIEWS.length) return
      const base = Math.max(...nodes.map((node) => node.offsetWidth))
      setPill({ base, x: active.offsetLeft, scale: active.offsetWidth / base })
    }

    measure()

    /* Every label changes width when Nunito finishes loading, and again at a
       narrower viewport, so the pill is re-measured rather than measured once. */
    const observer = new ResizeObserver(measure)
    for (const node of triggers.current.values()) observer.observe(node)
    return () => observer.disconnect()
  }, [view])

  return (
    <div className="flex flex-col gap-6">
      <Tabs onValueChange={setView} value={view}>
        {/* No track behind the row: three labels and one filled tab say which
            view you are on, and a grey trough around them says nothing a
            reader needs. What the trough did carry is that the three belong
            together — so a rule under the row carries it instead, as wide as
            the tabs and no wider, which is the difference between a tab bar
            and three buttons someone left in a line.

            The tabs are as wide as their words, so the pill has to change
            width as well as travel — and width is a layout property. It is
            drawn at the width of the widest tab and scaled down from its left
            edge instead, which is a transform, so the whole move is one
            composited property. Geometry goes in `style` because it is
            measured; every class here is on the scale. */}
        <div className="flex w-fit flex-col gap-2">
          <TabsList className="relative gap-1 bg-transparent p-0">
            {pill ? (
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 origin-left rounded-lg bg-muted transition-transform duration-200 ease-out-cubic motion-reduce:transition-none"
                style={{
                  width: pill.base,
                  transform: `translateX(${pill.x}px) scaleX(${pill.scale})`,
                }}
              />
            ) : null}
            {VIEWS.map((entry) => (
              /* The pill above is the only one drawn, so the trigger's own
               active background would sit on top of it and hide the travel —
               and its active shadow would be cast by a box with nothing in it.
               The shadow is switched off under the primitive's own variant
               prefix so the two classes merge; a bare `data-active:shadow-none`
               loses to it on specificity and the shadow survives. */
              <TabsTrigger
                className="flex-none gap-2 px-3 data-active:bg-transparent group-data-[variant=default]/tabs-list:data-active:shadow-none"
                key={entry.id}
                ref={(node) => {
                  if (node) triggers.current.set(entry.id, node)
                  else triggers.current.delete(entry.id)
                }}
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
