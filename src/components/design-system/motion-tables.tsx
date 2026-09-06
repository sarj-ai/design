"use client"

import * as React from "react"

import {
  ReferenceLabel,
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Button } from "@/components/ui/button"
import type { MotionRule } from "@/lib/design-system-data"
import { cn } from "@/lib/utils"

/**
 * The motion rules, each one demonstrated by the thing it governs.
 *
 * A curve cannot be read off a cubic-bezier and a duration cannot be read off
 * a number, so the two pages that answer "which one" carry a rail you can
 * replay rather than a column of values. The rest — what may move, who has
 * asked it not to, and what makes a correct choice still run badly — are
 * genuinely tables: there is nothing to watch, only a rule to follow.
 *
 * Prose here renders as plain text, so no backticks. A literal that needs to
 * look like one goes in its own cell as a ReferenceName.
 */

/** The rail is a fixed w-64 and the runner a size-4, so the travel is the
    difference. Fixed rather than measured because nothing here reflows, and a
    ResizeObserver for a demo would be machinery earning nothing. */
const TRAVEL = 240

const CURVES = [
  {
    cls: "ease-out-cubic",
    when: "Anything entering or leaving the screen.",
    why: "The fast start is what makes the UI feel like it reacted the instant you clicked.",
  },
  {
    cls: "ease-in-out-cubic",
    when: "An element already on screen that moves or resizes.",
    why: "Accelerate then brake, the way a real object moves between two points.",
  },
  {
    cls: "ease-linear",
    when: "Constant motion only — marquees, spinners, a progress bar.",
    why: "Nothing decelerates at a constant speed, so on anything interactive it reads as mechanical.",
  },
]

const BANNED = [
  {
    cls: "ease-in",
    instead: "ease-out-cubic",
    why: "The slow start delays the feedback the reader is waiting for, so the interface feels sluggish.",
  },
  {
    cls: "ease-out",
    instead: "ease-out-cubic",
    why: "The browser's built-in curve. The token is the tuned one, and one curve everywhere is what makes separate animations feel like one system.",
  },
  {
    cls: "cubic-bezier(…)",
    instead: "the token",
    why: "A raw curve in a component is a curve nobody else will match.",
  },
]

const DURATIONS = [
  { cls: "duration-150", use: "Hover and press." },
  { cls: "duration-200", use: "Tooltip, popover, dropdown." },
  { cls: "duration-250", use: "Dialog and drawer." },
  { cls: "duration-300", use: "The cap. A container morphing to fit new content." },
]

const ANIMATABLE = [
  {
    cls: "transform",
    verdict: "Animate it",
    why: "Handed straight to the compositor — it skips layout and paint and runs on the GPU. A size change is scale, a position change is translate.",
  },
  {
    cls: "opacity",
    verdict: "Animate it",
    why: "The other compositor property. Fading is the one way to introduce something without moving anything around it.",
  },
  {
    cls: "width, height, padding, top",
    verdict: "Never",
    why: "Forces a layout recalculation every frame, for this element and everything that reflows around it. This is the jank people describe as cheap.",
  },
  {
    cls: "transition-all",
    verdict: "Never",
    why: "Opts in every property that changes, including layout ones, so an unrelated class change starts causing per-frame reflow. Name what actually moves.",
  },
]

const REDUCED = [
  {
    cls: "transition-*",
    pair: "motion-reduce:transition-none",
    why: "On the same element. The motion-reduce prefix compiles to a media query scoped to the class it carries, so there is no global switch to rely on.",
  },
  {
    cls: "animate-*",
    pair: "motion-reduce:animate-none",
    why: "Same rule, same element.",
  },
  {
    cls: "A fade, or a colour",
    pair: "Still required",
    why: "“It is only a fade” is one argument made once per element, and the sum of them is a page that still moves.",
  },
]

/**
 * Where the frames go.
 *
 * Which property you animate is settled on the page before this one, so none
 * of these repeat it. What is left is everything that makes a correct property
 * choice run badly anyway, and all of it is already solved somewhere in this
 * repo — so each row names the file rather than describing the technique.
 */
const PERFORMANCE = [
  {
    rule: "Animate from CSS, not from state",
    why: "A class change hands the animation to the compositor and React never hears about it again. A value in useState re-renders the tree on every frame, and each render competes with the animation it is driving. The travelling tab marker sets state once per selection — never per frame.",
  },
  {
    rule: "Measure everything, then write once",
    why: "Reading offsetWidth forces the browser to flush pending layout. Read in a loop while writing between reads and you pay that flush every iteration. tabs-preview.tsx reads all three triggers, then calls setMarker a single time.",
  },
  {
    rule: "Throttle scroll and resize through rAF",
    why: "Both fire far faster than the screen refreshes, so the extra calls are work nobody sees. surface-dock.tsx queues one read per frame, draws its progress ring straight through a ref, and hands setState the same number when nothing moved — so React bails out of the render instead of running one a frame.",
  },
  {
    rule: "Register those listeners passive",
    why: "Passing { passive: true } promises the handler will not preventDefault, so the browser can scroll without waiting to find out. Without it a slow handler stalls the scroll itself.",
  },
  {
    rule: "will-change is a loan",
    why: "It promotes the element to its own compositor layer, which costs memory for as long as it is set. Add it to something about to move and take it off after — never as a permanent class on a list of rows.",
  },
  {
    rule: "Blur is the expensive one",
    why: "A large radius is costly to composite every frame, worst in Safari. Nothing here uses one, which is the cheapest state to stay in.",
  },
  {
    rule: "The container morph is the paid exception",
    why: "Animating height reflows every frame, so it is allowed only on a wrapper measuring its child with a ResizeObserver — affordable because switching a settings section is rare, not a hundred-times-a-day interaction. multi-step-form.tsx and persona-wizard.tsx are the two that do it.",
  },
  {
    rule: "Lint only reads classNames",
    why: "A transition-[height] class is caught. The same animation written as a height prop on a motion component is not, because the rule inspects class strings and never sees a prop. Both container morphs above are that shape, so they pass silently — anything animated through the motion package is yours to check by hand.",
  },
]

/** One runner on one rail, replayed by the button above it. */
function Rail({ className, run }: { className: string; run: boolean }) {
  return (
    <div className="relative h-4 w-64 rounded-full bg-muted">
      <div
        className={cn(
          "absolute top-0 left-0 size-4 rounded-full bg-primary transition-transform motion-reduce:transition-none",
          className,
        )}
        style={{ transform: run ? `translateX(${TRAVEL}px)` : "translateX(0)" }}
      />
    </div>
  )
}

/**
 * The replay control. One button for the whole comparison, because the point
 * is the difference between the rails and separate triggers would let them
 * start at different moments.
 */
function Replay({
  children,
  label,
}: {
  children: (run: boolean) => React.ReactNode
  label: string
}) {
  const [run, setRun] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <Button
        className="w-fit"
        onClick={() => setRun((current) => !current)}
        size="sm"
        variant="outline"
      >
        {label}
      </Button>
      {children(run)}
    </div>
  )
}

export function MotionTable({ id }: { id: MotionRule["id"] }) {
  switch (id) {
    case "easing":
      return (
        <div className="flex flex-col gap-8">
          <Replay label="Play the three curves">
            {(run) => (
              <div className="flex flex-col gap-3">
                {CURVES.map((curve) => (
                  <div className="flex items-center gap-4" key={curve.cls}>
                    <Rail
                      className={cn("duration-300", curve.cls)}
                      run={run}
                    />
                    <ReferenceName>{curve.cls}</ReferenceName>
                  </div>
                ))}
              </div>
            )}
          </Replay>

          <ReferenceTable
            columns={[
              { header: "Curve", width: "w-56" },
              { header: "Reach for it", width: "w-80" },
              { header: "Why" },
            ]}
            rows={CURVES.map((curve) => ({
              key: curve.cls,
              cells: [
                <ReferenceName key="c">{curve.cls}</ReferenceName>,
                <span className="text-sm" key="w">
                  {curve.when}
                </span>,
                <ReferenceNote key="y">{curve.why}</ReferenceNote>,
              ],
            }))}
          />

          <ReferenceTable
            columns={[
              { header: "Not this", width: "w-56" },
              { header: "This", width: "w-56" },
              { header: "Why" },
            ]}
            rows={BANNED.map((one) => ({
              key: one.cls,
              cells: [
                <ReferenceName key="b">{one.cls}</ReferenceName>,
                <ReferenceName key="i">{one.instead}</ReferenceName>,
                <ReferenceNote key="y">{one.why}</ReferenceNote>,
              ],
            }))}
          />
        </div>
      )

    case "duration":
      return (
        <div className="flex flex-col gap-8">
          <Replay label="Play the four steps">
            {(run) => (
              <div className="flex flex-col gap-3">
                {DURATIONS.map((step) => (
                  <div className="flex items-center gap-4" key={step.cls}>
                    <Rail
                      className={cn("ease-out-cubic", step.cls)}
                      run={run}
                    />
                    <ReferenceName>{step.cls}</ReferenceName>
                  </div>
                ))}
              </div>
            )}
          </Replay>

          <ReferenceTable
            columns={[
              { header: "Step", width: "w-56" },
              { header: "What it is for" },
            ]}
            rows={DURATIONS.map((step) => ({
              key: step.cls,
              cells: [
                <ReferenceName key="s">{step.cls}</ReferenceName>,
                <ReferenceNote key="u">{step.use}</ReferenceNote>,
              ],
            }))}
          />
        </div>
      )

    case "animatable":
      return (
        <ReferenceTable
          columns={[
            { header: "Property", width: "w-64" },
            { header: "Verdict", width: "w-32" },
            { header: "Why" },
          ]}
          rows={ANIMATABLE.map((one) => ({
            key: one.cls,
            cells: [
              <ReferenceName key="p">{one.cls}</ReferenceName>,
              <ReferenceLabel key="v">{one.verdict}</ReferenceLabel>,
              <ReferenceNote key="y">{one.why}</ReferenceNote>,
            ],
          }))}
        />
      )

    case "motion-performance":
      return (
        <ReferenceTable
          columns={[{ header: "Rule", width: "w-72" }, { header: "Why" }]}
          rows={PERFORMANCE.map((one) => ({
            key: one.rule,
            cells: [
              <ReferenceLabel key="r">{one.rule}</ReferenceLabel>,
              <ReferenceNote key="w">{one.why}</ReferenceNote>,
            ],
          }))}
        />
      )

    case "reduced-motion":
      return (
        <ReferenceTable
          columns={[
            { header: "If you write", width: "w-56" },
            { header: "Add", width: "w-72" },
            { header: "Why" },
          ]}
          rows={REDUCED.map((one) => ({
            key: one.cls,
            cells: [
              <ReferenceName key="c">{one.cls}</ReferenceName>,
              <ReferenceName key="p">{one.pair}</ReferenceName>,
              <ReferenceNote key="y">{one.why}</ReferenceNote>,
            ],
          }))}
        />
      )
  }
}
