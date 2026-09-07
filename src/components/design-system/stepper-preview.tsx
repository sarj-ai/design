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

/**
 * The stepper in both orientations, sharing one step so that clicking either
 * moves both — they are one component, and a preview that lets them drift
 * would imply two.
 *
 * The animation is the same as the one in the creation dialog: the fill
 * travels rather than switching colour, and the tick arrives rather than
 * appearing. Only the axis differs, which is the whole reason both are here.
 *
 * It runs itself: each step is checked, passes, and hands over to the next,
 * then the whole track empties and it starts again. Loading is the fourth
 * state and the only one a click cannot reach, so a stepper that just sits
 * there is a stepper with a state nobody sees.
 *
 * Clicking still works, and the loop carries on from wherever it is left.
 */

/** How long each frame of the loop is held. */
const CHECKING_MS = 1100
/** The last frame — every step green, nothing active — before it resets. */
const SETTLED_MS = 900
/** The still frame it opens on, before the loop takes it over. */
const OPENING_MS = 600

const STEPS = [
  { title: "Endpoint", description: "Where calls are signalled." },
  { title: "Credentials", description: "What authenticates them." },
  { title: "Routing", description: "How they are carried." },
]

/* Completed is the success token, not a raw green: the same fill has to
   survive a whitelabel. Inactive keeps the primitive's own muted surface.

   The tick is drawn rather than zoomed in — the stroke is hidden by a dash as
   long as the path itself, and the dash is walked off it. HugeIcons' tick is
   `M5 14L8.5 17.5L19 6.5`, so the path already runs left to right and drawing
   along it needs no reversing. 22 is the round number above its own length,
   about 20.2 in the 24-unit box; short of that the dash would repeat and the
   tick would arrive in two pieces.

   The entrance is scoped to the completed state on purpose. Unscoped,
   `[&_svg]:animate-in` outranks the Spinner's own `animate-spin` — both set
   `animation`, and the arbitrary variant wins — so the loading indicator
   rendered a spinner that played a 200ms zoom once and then sat still. */
const INDICATOR =
  "transition-colors duration-200 ease-out-cubic motion-reduce:transition-none data-[state=completed]:bg-success data-[state=completed]:text-success-foreground data-[state=completed]:[&_svg_path]:[--draw-length:22] data-[state=completed]:[&_svg_path]:[stroke-dasharray:var(--draw-length)] data-[state=completed]:[&_svg_path]:animate-draw-stroke motion-reduce:[&_svg_path]:animate-none"

const INDICATORS = {
  completed: <StepDoneIcon className="size-3.5" />,
  loading: <Spinner className="size-3.5" />,
}

export function StepperPreview() {
  /* Opens on a still frame rather than mid-check, so the first thing painted
     is the component and not the demonstration. */
  const [step, setStep] = React.useState(2)
  const [loading, setLoading] = React.useState(false)
  const [paused, setPaused] = React.useState(false)

  /* A loop is motion nobody asked for and nobody can stop, so it does not
     start at all under reduced motion — the still frame above is what stays.
     Pausing it also means no spinner, which is itself an animation. */
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setPaused(query.matches)

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  /* One timer per frame rather than one interval for the sequence: each frame
     schedules the next from the state it can see, so a click lands in the loop
     instead of fighting a clock that has already decided what comes next.

     A step past the last one is the settled frame — every step reads as
     completed and none as active, which is the only way the last step's own
     tick is ever seen. */
  React.useEffect(() => {
    if (paused) return

    const settled = step > STEPS.length
    /* Only ever true on the opening frame: every step the loop moves to is
       one it starts checking. */
    const opening = !settled && !loading

    const timer = window.setTimeout(
      () => {
        /* A step that is active is being checked, and the spinner is replaced
           by the tick directly. There used to be a frame in between where the
           step had stopped and not yet handed over, and it read as the number
           blinking on between the two — three things in one circle where the
           story only has two. */
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
                  /* Asymmetric on purpose, over the primitive's own m-0.5.
                     The two ends of this line meet different things: the left
                     one leaves a label, and at 2px it sat against the text, so
                     it clears it by 4. The right one arrives at the next
                     indicator and touches it — a line that stops short of the
                     circle reads as a rule between two steps rather than the
                     track that joins them. The vertical one already runs
                     circle to circle, with nothing to clear at either end. */
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
