"use client"

import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { CloseIcon, StepDoneIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper"
import { cn } from "@/lib/utils"

/**
 * The multi-step form container from 21st.dev (@ravikatiyar162), on this
 * repo's primitives.
 *
 * Its structure, props and motion are unchanged. What could not come across:
 *
 * - Its own copies of Card, Button, Progress, Input, Label, Select, Tooltip
 *   and Alert are older shadcn than the ones here, and dropping them into
 *   `components/ui` would have replaced primitives this repo has customised —
 *   a `Card` with `shadow-sm` instead of the ring, a `Button` with `h-10 px-4`
 *   instead of this scale. They are the same components by name only.
 * - `framer-motion` is the old package name; `motion` is installed and is the
 *   same library.
 * - The `lucide-react` X is a second icon set, so it is the HugeIcons close.
 * - `md:w-[700px]` and `min-h-[300px]` are off-scale, so they are the nearest
 *   scale steps.
 * - Colour needed no work: it was already on `muted-foreground` and `primary`.
 *
 * Added, because the shell around it needs them: `nextButtonText` takes a node
 * so a spinner can sit in the button, and `nextDisabled` covers submitting.
 */

/* Enter and exit want ease-out, and this is --ease-out-cubic from globals.css.
   The spring it replaces sat at a 0.87 damping ratio, so every step overshot
   and settled — bounce belongs on a drag, not on pressing Next. */
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const

/* Exit shorter than enter. `mode="wait"` runs them back to back, so the two
   durations add up: 300ms total is the dialog budget, and weighting it towards
   the arriving step is what stops the gap reading as a stall. */
const EXIT = { duration: 0.12, ease: EASE_OUT_CUBIC }
const ENTER = { duration: 0.18, ease: EASE_OUT_CUBIC }

/* The container resizing is an on-screen morph, not an entrance, so it takes
   ease-in-out — --ease-in-out-cubic from globals.css. 300ms because the panel
   is the largest thing moving; the step content underneath is quicker. */
const EASE_IN_OUT_CUBIC = [0.645, 0.045, 0.355, 1] as const
const RESIZE = { duration: 0.3, ease: EASE_IN_OUT_CUBIC }

/* 24px, not the 100px this shipped with. Past about 30px the panel reads as
   flying in from somewhere rather than as the next step arriving. */
const TRAVEL = 24

const multiStepFormVariants = cva("flex flex-col", {
  variants: {
    size: {
      default: "md:max-w-2xl",
      sm: "md:max-w-xl",
      lg: "md:max-w-3xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

interface MultiStepFormProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof multiStepFormVariants> {
  currentStep: number
  totalSteps: number
  title: string
  description: string
  onBack: () => void
  onNext: () => void
  onClose?: () => void
  backButtonText?: string
  nextButtonText?: React.ReactNode
  nextDisabled?: boolean
  /** Sits between the body and the footer, outside the step animation. */
  notice?: React.ReactNode
  /** Jumping back. Only ever called with a step already completed. */
  onStepSelect?: (step: number) => void
  footerContent?: React.ReactNode
}

const MultiStepForm = React.forwardRef<HTMLDivElement, MultiStepFormProps>(
  (
    {
      className,
      size,
      currentStep,
      totalSteps,
      title,
      description,
      onBack,
      onNext,
      onClose,
      backButtonText = "Back",
      nextButtonText = "Next step",
      nextDisabled = false,
      notice,
      onStepSelect,
      footerContent,
      children,
      ...props
    },
    ref,
  ) => {
    const reduce = useReducedMotion()

    /* Which way the reader is travelling. Without it Back played the forward
       animation, so the content slid in from the same side either way and the
       one thing the motion is for — which direction you just went — was the
       one thing it did not say.

       Adjusted during render rather than held in a ref: a ref mutated while
       rendering is read a second time under StrictMode's double render, by
       which point it already equals the new step, and every move looks like a
       forward one. */
    /* height: "auto" until the first measurement, so the first paint is the
       real height rather than zero. */
    const innerRef = React.useRef<HTMLDivElement>(null)
    const [height, setHeight] = React.useState<"auto" | number>("auto")
    const [morphing, setMorphing] = React.useState(false)

    React.useLayoutEffect(() => {
      const inner = innerRef.current
      if (!inner) return

      const observer = new ResizeObserver(([entry]) => {
        setHeight(entry.contentRect.height)
      })
      observer.observe(inner)
      return () => observer.disconnect()
    }, [])

    const [previous, setPrevious] = React.useState(currentStep)
    const [direction, setDirection] = React.useState(1)

    if (previous !== currentStep) {
      setDirection(currentStep > previous ? 1 : -1)
      setPrevious(currentStep)
    }

    const variants = {
      hidden: (way: number) => ({ opacity: 0, x: way * TRAVEL }),
      enter: { opacity: 1, x: 0, transition: ENTER },
      exit: (way: number) => ({
        opacity: 0,
        x: way * -TRAVEL,
        transition: EXIT,
      }),
    }

    return (
      <Card
        className={cn(multiStepFormVariants({ size }), className)}
        ref={ref}
        {...props}
      >
        <CardHeader>
          {/* Title and description in one column with Close beside both, the
              shape AGENTS.md fixes for a drawer header. Close was inside the
              title row before, and at 28px it made that row taller than the
              20px title — which pushed the description a whole button-height
              away from the thing it describes. */}
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {onClose ? (
              <Button
                aria-label="Close"
                onClick={onClose}
                size="icon-sm"
                variant="ghost"
              >
                <CloseIcon />
              </Button>
            ) : null}
          </div>
        </CardHeader>

        {/* Its own block rather than the last child of CardHeader: in there it
            inherited the header's gap-1, which is the title-to-description
            step, so the steps sat as close to the description as the
            description sits to the title. Out here the card's own spacing
            applies on both sides and the three zones read as three. */}
        <div className="px-(--card-spacing)">
          {/* A stepper rather than a bar: the bar said how far along and
              nothing else, and this form has a failure that names a step, so
              per-step state is worth having. The number stays inside the
              indicator — five bare dots say where you are but not what is
              there — and the tick replaces it once the step is behind you. */}
          <Stepper
            indicators={{
              completed: <StepDoneIcon className="size-3.5" />,
              loading: <Spinner className="size-3.5" />,
            }}
            onValueChange={onStepSelect}
            value={currentStep}
          >
            <StepperNav>
              {Array.from({ length: totalSteps }, (_, index) => index + 1).map(
                (step) => (
                  /* Every step is reachable, forward included. Note this is
                     the opposite of the "Jumping back" line in the anatomy
                     below — asked for deliberately, so the rule is the thing
                     to change if the two should agree. */
                  <StepperItem
                    key={step}
                    loading={nextDisabled && step === currentStep}
                    step={step}
                  >
                    <StepperTrigger>
                      {/* The fill and the glyph are one event, so they share
                          200ms and ease-out-cubic. Colour is paint, but this is
                          a 24px circle — the rule against paint animation is
                          about large surfaces.

                          The tick zooms from 0.5 rather than 0: something that
                          grows from nothing reads as a pop, not an arrival. */}
                      <StepperIndicator className="size-6 transition-colors duration-200 ease-out-cubic motion-reduce:transition-none data-[state=completed]:bg-success data-[state=completed]:text-success-foreground data-[state=completed]:[&_svg]:animate-in data-[state=completed]:[&_svg]:zoom-in-50 data-[state=completed]:[&_svg]:fade-in data-[state=completed]:[&_svg]:duration-200 data-[state=completed]:[&_svg]:ease-out-cubic motion-reduce:[&_svg]:animate-none">
                        {step}
                      </StepperIndicator>
                    </StepperTrigger>
                    {step < totalSteps ? (
                      /* The fill travels rather than switching colour: a line
                         that turns green all at once says a step is done, a
                         line that fills says which way you are going. scaleX on
                         an overlay keeps it on the compositor — animating the
                         bar's own width would be layout. */
                      <StepperSeparator className="relative overflow-hidden before:absolute before:inset-0 before:origin-left before:scale-x-0 before:rounded-sm before:bg-success before:transition-transform before:duration-300 before:ease-out-cubic before:content-[''] group-data-[state=completed]/step:before:scale-x-100 motion-reduce:before:transition-none" />
                    ) : null}
                  </StepperItem>
                ),
              )}
            </StepperNav>
          </Stepper>
        </div>

        {/* A measured height, not `layout`. `layout` replays the change as a
            transform on the element itself, so the real box resizes at once
            and the Card and the dialog around it jump — measured 263px to
            681px in a single frame. Animating the measured height is what
            `StepBody` in persona-wizard already does here, and it is the only
            version the ancestors can follow.

            It is also what lets min-h-72 go: that was holding the footer still
            by reserving the tallest step's height on every step, which is why
            a two-field step sat in a half-empty card.

            The clip is on only while the height moves — kept permanently it
            cuts the focus ring off a field at the container's edge. */}
        <CardContent>
          <motion.div
            animate={{ height }}
            className={morphing ? "overflow-hidden" : undefined}
            initial={false}
            onAnimationComplete={() => setMorphing(false)}
            onAnimationStart={() => setMorphing(true)}
            transition={reduce ? { duration: 0 } : RESIZE}
          >
            <div ref={innerRef}>
              <AnimatePresence custom={direction} initial={false} mode="wait">
                <motion.div
                  animate="enter"
                  custom={direction}
                  exit="exit"
                  initial="hidden"
                  key={currentStep}
                  transition={reduce ? { duration: 0 } : undefined}
                  variants={variants}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </CardContent>

        {/* Below the body and above the footer, and deliberately outside the
            AnimatePresence: it describes the submit, not the step, so it must
            not slide away when the reader moves. Card pads its own children,
            so this matches CardContent rather than inventing a value. */}
        {notice ? <div className="px-(--card-spacing)">{notice}</div> : null}

        <CardFooter className="flex items-center justify-between gap-4 border-t">
          <div>{footerContent}</div>
          <div className="flex gap-2">
            {currentStep > 1 ? (
              <Button
                disabled={nextDisabled}
                onClick={onBack}
                variant="outline"
              >
                {backButtonText}
              </Button>
            ) : null}
            <Button disabled={nextDisabled} onClick={onNext}>
              {nextButtonText}
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  },
)

MultiStepForm.displayName = "MultiStepForm"

export { MultiStepForm }
