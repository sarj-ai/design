"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { CloseIcon, StepBackIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** power3.out, the motion scale's ease-out-cubic. */
const EASE = [0.215, 0.61, 0.355, 1] as const

const DOT = {
  rest: 0.15,
  enter: 0.5,
  radius: 9999,
  spring: { type: "spring", visualDuration: 0.35, bounce: 0 },
} as const

type CreationFlowProps = {
  title: string
  question: string
  /** Changes when the screen does; drives the slide between screens. */
  stepKey: string
  step: number
  steps: number
  /** 1 going forward, -1 going back: which way the screens slide. */
  direction: number
  /** Null hides Back. */
  onBack: (() => void) | null
  onClose: () => void
  children: React.ReactNode
}

export function CreationFlow({
  framed = false,
  open = true,
  ...props
}: CreationFlowProps & {
  framed?: boolean
  open?: boolean
}) {
  if (framed) {
    return (
      /* translate-x-0 makes this box the containing block for anything fixed inside it. */
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

      {/* min-h-full centres the column while it is short and scrolls from the top once it is taller, instead of clipping. */}
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

function StepDots({ step, steps }: { step: number; steps: number }) {
  const reduced = useReducedMotion() ?? false

  return (
    <div className="flex h-14 shrink-0 items-center justify-center">
      <span className="sr-only">
        Step {step + 1} of {steps}
      </span>
      {/* popLayout removes a leaving dot at once, so the others close the gap on the same spring. */}
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
              /* Keyed by position so a path that changes length only adds or drops the tail. */
              key={i}
              layout
              /* Radius in style, not rounded-full, so motion can counter-scale it; a class radius squashes mid-stretch. */
              style={{ borderRadius: DOT.radius }}
              transition={reduced ? { duration: 0 } : DOT.spring}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
