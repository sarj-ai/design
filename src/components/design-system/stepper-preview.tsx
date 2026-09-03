"use client"

import * as React from "react"

import { StepDoneIcon } from "@/components/design-system/icons"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
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

/**
 * The stepper in both orientations, sharing one step so that clicking either
 * moves both — they are one component, and a preview that lets them drift
 * would imply two.
 *
 * The animation is the same as the one in the creation dialog: the fill
 * travels rather than switching colour, and the tick arrives rather than
 * appearing. Only the axis differs, which is the whole reason both are here.
 *
 * Loading is a switch rather than a timer on navigation. It is the fourth
 * state and the only one that cannot be reached by clicking a step, so
 * without a control it is a prop nobody sees — and putting it on a delay
 * would mean every click paid for the demonstration.
 */

const STEPS = [
  { title: "Endpoint", description: "Where calls are signalled." },
  { title: "Credentials", description: "What authenticates them." },
  { title: "Routing", description: "How they are carried." },
]

/* Completed is the success token, not a raw green: the same fill has to
   survive a whitelabel. Inactive keeps the primitive's own muted surface.

   The entrance is scoped to the completed state on purpose. Unscoped,
   `[&_svg]:animate-in` outranks the Spinner's own `animate-spin` — both set
   `animation`, and the arbitrary variant wins — so the loading indicator
   rendered a spinner that played a 200ms zoom once and then sat still. */
const INDICATOR =
  "transition-colors duration-200 ease-out-cubic motion-reduce:transition-none data-[state=completed]:bg-success data-[state=completed]:text-success-foreground data-[state=completed]:[&_svg]:animate-in data-[state=completed]:[&_svg]:zoom-in-50 data-[state=completed]:[&_svg]:fade-in data-[state=completed]:[&_svg]:duration-200 data-[state=completed]:[&_svg]:ease-out-cubic motion-reduce:[&_svg]:animate-none"

const INDICATORS = {
  completed: <StepDoneIcon className="size-3.5" />,
  loading: <Spinner className="size-3.5" />,
}

export function StepperPreview() {
  const [step, setStep] = React.useState(2)
  const [loading, setLoading] = React.useState(false)

  return (
    <div className="flex flex-col gap-6">
      {/* `loading` is passed to every item; the primitive itself narrows it to
          whichever step is active. */}
      <div className="flex items-center gap-2">
        <Switch
          checked={loading}
          id="stepper-loading"
          onCheckedChange={setLoading}
        />
        <Label htmlFor="stepper-loading">Checking the current step</Label>
      </div>

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
                    /* Vertical fills downward, so the origin is the top edge and
                     the axis is Y — the horizontal one below is the same idea
                     rotated.

                     top-6 and 100% - 1.5rem, both the indicator's own 24px:
                     the line starts where the circle ends and runs to where
                     the next one begins.

                     The underscores are load-bearing. `calc(100%-1.5rem)` is
                     invalid CSS — calc needs whitespace around the minus, and
                     Tailwind spells a space as `_`. Without them the height
                     was dropped and the primitive's own h-12 applied instead,
                     which is a flat 48px and left a 6px gap above every
                     circle whatever the step was.

                     The `!` is for that same h-12: it is direction-scoped, so
                     it outranks a plain height the way DrawerContent's width
                     does in AGENTS.md. */
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
                    /* mx-4 over the primitive's own m-0.5: horizontally the line
                     runs from a label to the next indicator, and at 2px it
                     touched the text at both ends. The vertical one needs the
                     opposite — there it runs circle to circle with nothing to
                     clear. */
                    <StepperSeparator className="relative mx-4 overflow-hidden before:absolute before:inset-0 before:origin-left before:scale-x-0 before:rounded-sm before:bg-success before:transition-transform before:duration-300 before:ease-out-cubic before:content-[''] group-data-[state=completed]/step:before:scale-x-100 motion-reduce:before:transition-none" />
                  ) : null}
                </StepperItem>
              ))}
            </StepperNav>
          </Stepper>
        </div>
      </div>
    </div>
  )
}
