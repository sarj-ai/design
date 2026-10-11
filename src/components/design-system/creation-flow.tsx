"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { CloseIcon, StepBackIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * The creation flow's chrome — the one the surfaces page sends "creating in
 * steps" to: the whole screen, Back on the left and Close on the right, one
 * question a screen under a title that never changes, and the step dots at
 * the foot. No card, no footer: each screen's own primary button sits where
 * its answer ends and names what happens (Create scenario, Clone voice).
 *
 * Shared by every flow built on it — the scenario demo on the Creation flow
 * topic and voice cloning (DES-198) — so a change here is a change in both.
 *
 * `framed` draws it inside a box for the docs page; without it the flow is a
 * real full-screen layer with focus trapped, Esc wired to `onClose` and the
 * page behind it out of reach. Leaving part-way should ask first: the caller
 * owns that confirm, since only it knows whether there are answers to lose.
 */

/** power3.out, the motion scale's ease-out-cubic. */
const EASE = [0.215, 0.61, 0.355, 1] as const

/* ─────────────────────────────────────────────────────────
 * STEP DOTS
 *
 *   the active dot stretches 6 → 24px and darkens
 *   the dots beside it slide aside to make room
 *   one spring drives the stretch, the slide and the fade,
 *   so all three land on the same frame
 *
 *   a dot joining or leaving the row (a flow whose paths are
 *   different lengths) grows in from half size
 * ───────────────────────────────────────────────────────── */
const DOT = {
  /** How far the dots you are not on recede. */
  rest: 0.15,
  enter: 0.5,
  radius: 9999,
  /** No bounce: it is moving, not arriving. */
  spring: { type: "spring", visualDuration: 0.35, bounce: 0 },
} as const

export type CreationFlowProps = {
  /** The thing being made. The same on every screen: it is one task. */
  title: string
  /** This screen's question, under the title. */
  question: string
  /** Changes when the screen does; drives the slide between screens. */
  stepKey: string
  /** Where the reader is, counting from 0, and how many screens there are. */
  step: number
  steps: number
  /** 1 going forward, -1 going back: which way the screens slide. */
  direction: number
  /** Null hides Back — on the first screen, and on a screen that is a wait. */
  onBack: (() => void) | null
  onClose: () => void
  children: React.ReactNode
}

export function CreationFlow({
  framed = false,
  open = true,
  ...props
}: CreationFlowProps & {
  /** Drawn in a box on the docs page rather than over the whole screen. */
  framed?: boolean
  /** Only for the full-screen flow. */
  open?: boolean
}) {
  if (framed) {
    return (
      /* The frame stands in for the screen: translate-x-0 makes this box the
         containing block for anything fixed inside it. */
      <div className="relative flex h-180 translate-x-0 flex-col overflow-hidden rounded-xl border bg-background">
        <FlowBody {...props} />
      </div>
    )
  }

  return (
    <DialogPrimitive.Root
      onOpenChange={(next) => (next ? undefined : props.onClose())}
      open={open}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-modal flex flex-col bg-background duration-200 ease-out-cubic outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none">
          <DialogPrimitive.Title className="sr-only">
            {props.title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {props.question}
          </DialogPrimitive.Description>
          <FlowBody {...props} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function FlowBody({
  title,
  question,
  stepKey,
  step,
  steps,
  direction,
  onBack,
  onClose,
  children,
}: CreationFlowProps) {
  const reduced = useReducedMotion() ?? false

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        {onBack ? (
          <Button onClick={onBack} size="sm" variant="ghost">
            <StepBackIcon />
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button
          aria-label="Close"
          onClick={onClose}
          size="icon"
          variant="outline"
        >
          <CloseIcon />
        </Button>
      </div>

      {/* The column sits in the middle of the screen both ways. min-h-full
          lets it centre while it is shorter than the screen and scroll from
          the top once it is taller, rather than clipping its first lines. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center gap-8 px-6 py-12">
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-8"
              custom={direction}
              exit="exit"
              initial="enter"
              key={stepKey}
              transition={{ duration: reduced ? 0 : 0.2, ease: EASE }}
              variants={{
                enter: (d: number) => ({
                  opacity: 0,
                  x: reduced ? 0 : d * 24,
                }),
                exit: (d: number) => ({
                  opacity: 0,
                  x: reduced ? 0 : d * -24,
                }),
              }}
            >
              <header className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="text-base text-muted-foreground">{question}</p>
              </header>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <StepDots step={step} steps={steps} />
    </>
  )
}

/* Where you are, and nothing to click: Back is the way back, and a dot you
   could jump forward to would skip a question. */
function StepDots({ step, steps }: { step: number; steps: number }) {
  const reduced = useReducedMotion() ?? false

  return (
    <div className="flex h-14 shrink-0 items-center justify-center">
      <span className="sr-only">
        Step {step + 1} of {steps}
      </span>
      {/* popLayout takes a leaving dot out of the row at once, so the others
          close the gap on the same spring instead of waiting for it to fade. */}
      <div aria-hidden className="relative flex items-center gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {Array.from({ length: steps }, (_, i) => (
            <motion.span
              animate={{ opacity: i === step ? 1 : DOT.rest, scale: 1 }}
              className={cn(
                "h-1.5 bg-foreground",
                i === step ? "w-6" : "w-1.5",
              )}
              exit={{ opacity: 0, scale: DOT.enter }}
              initial={{ opacity: 0, scale: DOT.enter }}
              /* By position, not by step: a path that changes length keeps
                 the dots already there and only adds or drops the tail. */
              key={i}
              layout
              /* In style rather than rounded-full, so motion can
                 counter-scale it while the width springs — a class radius
                 squashes the ends mid-stretch. */
              style={{ borderRadius: DOT.radius }}
              transition={reduced ? { duration: 0 } : DOT.spring}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
