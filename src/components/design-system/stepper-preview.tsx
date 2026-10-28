"use client"

import * as React from "react"

import { StepDoneIcon } from "@/components/design-system/icons"
import { Spinner } from "@/components/ui/spinner"
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"

const CHECKING_MS = 1100
const SETTLED_MS = 900
const OPENING_MS = 600

const STEPS = [
  { title: "Endpoint", description: "Where calls are signalled." },
  { title: "Credentials", description: "What authenticates them." },
  { title: "Routing", description: "How they are carried." },
]

const INDICATOR =
  "transition-colors duration-200 ease-out-cubic motion-reduce:transition-none data-[state=completed]:bg-success data-[state=completed]:text-success-foreground data-[state=completed]:[&_svg_path]:[--draw-length:22] data-[state=completed]:[&_svg_path]:[stroke-dasharray:var(--draw-length)] data-[state=completed]:[&_svg_path]:animate-draw-stroke motion-reduce:[&_svg_path]:animate-none"

const INDICATORS = {
  completed: <StepDoneIcon className="size-3.5" />,
  loading: <Spinner className="size-3.5" />,
}

export function StepperPreview() {
  const [step, setStep] = React.useState(2)
  const [loading, setLoading] = React.useState(false)
  const [paused, setPaused] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setPaused(query.matches)

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  /* One timer per frame, not an interval, so a click lands in the loop instead of fighting a clock. */
  React.useEffect(() => {
    if (paused) return

    const settled = step > STEPS.length
    const opening = !settled && !loading

    const timer = window.setTimeout(
      () => {
        if (opening) {
          setLoading(true)
          return
        }

        const next = settled ? 1 : step + 1
        setStep(next)
        setLoading(next <= STEPS.length)
      },
      opening ? OPENING_MS : settled ? SETTLED_MS : CHECKING_MS,
    )

    return () => window.clearTimeout(timer)
  }, [loading, paused, step])

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium">Vertical</span>

        <Stepper
          indicators={INDICATORS}
          onValueChange={setStep}
          orientation="vertical"
          value={step}
        >
          <StepperNav>
            {STEPS.map((one, index) => (
              <StepperItem
                className="relative items-start not-last:flex-1"
                key={one.title}
                loading={loading}
                step={index + 1}
              >
                <StepperTrigger className="items-start gap-3 pb-10 last:pb-0">
                  <StepperIndicator className={INDICATOR}>
                    {index + 1}
                  </StepperIndicator>
                  <div className="mt-0.5 flex flex-col gap-0.5 text-start">
                    <StepperTitle>{one.title}</StepperTitle>
                    <StepperDescription>{one.description}</StepperDescription>
                  </div>
                </StepperTrigger>

                {index < STEPS.length - 1 ? (
                  /* top-6 and 100% - 1.5rem are the indicator's 24px: the line runs from one circle to the next. */
                  <StepperSeparator className="absolute top-6 -order-1 m-0 -translate-x-1/2 start-3 h-[calc(100%_-_1.5rem)]! overflow-hidden before:absolute before:inset-0 before:origin-top before:scale-y-0 before:rounded-sm before:bg-success before:transition-transform before:duration-300 before:ease-out-cubic before:content-[''] group-data-[state=completed]/step:before:scale-y-100 motion-reduce:before:transition-none" />
                ) : null}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium">Horizontal</span>

        <Stepper indicators={INDICATORS} onValueChange={setStep} value={step}>
          <StepperNav>
            {STEPS.map((one, index) => (
              <StepperItem key={one.title} loading={loading} step={index + 1}>
                <StepperTrigger className="gap-2.5">
                  <StepperIndicator className={INDICATOR}>
                    {index + 1}
                  </StepperIndicator>
                  <StepperTitle>{one.title}</StepperTitle>
                </StepperTrigger>

                {index < STEPS.length - 1 ? (
                  /* Asymmetric on purpose: the left end clears the label, the right end touches the next indicator. */
                  <StepperSeparator className="relative ms-4 me-0 overflow-hidden before:absolute before:inset-0 before:origin-left before:scale-x-0 before:rounded-sm before:bg-success before:transition-transform before:duration-300 before:ease-out-cubic before:content-[''] group-data-[state=completed]/step:before:scale-x-100 motion-reduce:before:transition-none" />
                ) : null}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>
    </div>
  )
}
