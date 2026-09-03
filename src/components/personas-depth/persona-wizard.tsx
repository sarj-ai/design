"use client"

import * as React from "react"

import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  voiceById,
  type PersonaGender,
  type PersonaLanguage,
} from "@/lib/personas-depth-data"
import type { PersonaDraft } from "@/components/personas-depth/persona-dialog"
import { VoicePicker } from "@/components/personas-depth/voice-picker"

/**
 * Creating a persona as a run of single decisions — type, click, click,
 * click, Enter — with segment bars up top filling as each step lands.
 * Option steps advance themselves; only typing steps have a Continue.
 * Editing stays in the tabbed dialog; this is the fast path in.
 */

/**
 * The height morph between steps. Faster than a hover-to-expand spring, because
 * this fires on a committed action — you have already picked, and the dialog
 * catching up should feel like it is keeping pace, not performing. Just enough
 * bounce to read as physical; not enough to overshoot a body of text twice.
 */
const STEP_SPRING = {
  type: "spring",
  visualDuration: 0.26,
  bounce: 0.14,
} as const

const STEPS = [
  "name",
  "language",
  "gender",
  "voice",
  "prompt",
  "review",
] as const
type Step = (typeof STEPS)[number]

const LANGUAGE_OPTIONS: { value: PersonaLanguage; hint: string }[] = [
  { value: "Arabic", hint: "العربية" },
  { value: "English", hint: "English" },
  { value: "Urdu", hint: "اردو" },
]

const GENDER_OPTIONS: { value: PersonaGender; hint: string }[] = [
  { value: "Female", hint: "Female voices only" },
  { value: "Male", hint: "Male voices only" },
]

export function PersonaWizard({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: PersonaDraft) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 512px, not 672px. One question per step means the widest thing here is
          a two-column voice list and a three-up language row — both of which
          fit. At 2xl a step that asks for a name was a single input spanning
          672px, which reads as a form that lost its other fields. */}
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <WizardBody onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function WizardBody({
  onSubmit,
  onClose,
}: {
  onSubmit: (draft: PersonaDraft) => void
  onClose: () => void
}) {
  const [stepIndex, setStepIndex] = React.useState(0)
  const [name, setName] = React.useState("")
  const [language, setLanguage] = React.useState<PersonaLanguage>("Arabic")
  const [gender, setGender] = React.useState<PersonaGender>("Female")
  const [voiceId, setVoiceId] = React.useState("")
  const [prompt, setPrompt] = React.useState("")

  const step: Step = STEPS[stepIndex]
  const voice = voiceById(voiceId)

  function next() {
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1))
  }

  function back() {
    setStepIndex((index) => Math.max(index - 1, 0))
  }

  /**
   * Lets the picked card paint its selected state before the step flips.
   *
   * 120ms, not 200ms: the hold used to be the whole delay before anything
   * moved, and now it sits in front of a 260ms height spring, so the two
   * stacked to 460ms from click to settled. 120ms is still long enough for the
   * selected border to register and takes a third off the felt latency.
   */
  function pickAndAdvance(apply: () => void) {
    apply()
    window.setTimeout(next, 120)
  }

  function create() {
    onSubmit({ name: name.trim(), language, gender, voiceId, prompt })
    onClose()
  }

  const heading: Record<Step, { title: string; hint: string }> = {
    name: {
      title: "Name the persona",
      hint: "What it's called in lists and scenarios.",
    },
    language: {
      title: "What language does it speak?",
      hint: "One persona speaks one language.",
    },
    gender: {
      title: "Who's speaking?",
      hint: "Only matching voices are offered next.",
    },
    voice: {
      title: "Pick the voice",
      hint: "This is the voice it speaks with on every call.",
    },
    prompt: {
      title: "How should it behave?",
      hint: "Optional — identity, personality, and tone. You can refine this any time.",
    },
    review: {
      title: "Ready to create",
      hint: "Conversation behavior starts from the language defaults — tune it later from Edit.",
    },
  }

  return (
    <div className="flex flex-col gap-4">
      {/* One segment per step; a segment's fill scales in as its step lands. */}
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={stepIndex + 1}
        aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}
      >
        {STEPS.map((segment, index) => (
          <div
            key={segment}
            className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full w-full origin-left rounded-full bg-primary transition-transform duration-300 ease-out-cubic motion-reduce:transition-none",
                index <= stepIndex ? "scale-x-100" : "scale-x-0",
              )}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <DialogTitle>{heading[step].title}</DialogTitle>
        <DialogDescription>{heading[step].hint}</DialogDescription>
      </div>

      {/* A small floor, not the voice step's full 288px. The tall step caps
          itself (`max-h-72` inside VoicePicker), so the only thing a 288px
          floor bought was a dialog that never resizes — paid for by every short
          step, and the name step is one input sitting in 250px of nothing. The
          steps size to their content now, and StepBody springs the difference
          so the dialog grows instead of snapping. */}
      <StepBody>
        {step === "name" ? (
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && name.trim()) {
                event.preventDefault()
                next()
              }
            }}
            placeholder="Aisha — Yelo Support"
            aria-label="Persona name"
          />
        ) : null}

        {step === "language" ? (
          <div className="grid gap-3 md:grid-cols-3">
            {LANGUAGE_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                title={option.value}
                hint={option.hint}
                selected={language === option.value}
                onPick={() =>
                  pickAndAdvance(() => {
                    if (option.value !== language) setVoiceId("")
                    setLanguage(option.value)
                  })
                }
              />
            ))}
          </div>
        ) : null}

        {step === "gender" ? (
          <div className="grid gap-3 md:grid-cols-2">
            {GENDER_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                title={option.value}
                hint={option.hint}
                selected={gender === option.value}
                onPick={() =>
                  pickAndAdvance(() => {
                    if (option.value !== gender) setVoiceId("")
                    setGender(option.value)
                  })
                }
              />
            ))}
          </div>
        ) : null}

        {step === "voice" ? (
          <VoicePicker
            language={language}
            gender={gender}
            selectedId={voiceId}
            onSelect={(id) => pickAndAdvance(() => setVoiceId(id))}
          />
        ) : null}

        {step === "prompt" ? (
          <Textarea
            autoFocus
            rows={7}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                next()
              }
            }}
            placeholder="Define the agent's identity, personality, and tone. Shift+Enter for a new line."
            aria-label="Persona prompt"
          />
        ) : null}

        {step === "review" ? (
          <div className="flex flex-col gap-3">
            <ReviewRow label="Name" value={name.trim()} />
            <ReviewRow label="Language" value={`${language} · ${gender}`} />
            <ReviewRow label="Voice" value={voice?.name ?? "—"} />
            <ReviewRow
              label="Prompt"
              value={prompt.trim() || "Starts from the language default."}
              muted={!prompt.trim()}
            />
          </div>
        ) : null}
      </StepBody>

      <div className="flex items-center justify-between gap-2">
        {stepIndex > 0 ? (
          <Button variant="ghost" onClick={back}>
            Back
          </Button>
        ) : (
          <span />
        )}

        {step === "name" ? (
          <Button disabled={!name.trim()} onClick={next}>
            Continue
          </Button>
        ) : null}
        {step === "prompt" ? (
          <Button onClick={next}>
            {prompt.trim() ? "Continue" : "Skip for now"}
          </Button>
        ) : null}
        {step === "review" ? (
          <Button onClick={create}>Create persona</Button>
        ) : null}
      </div>
    </div>
  )
}

/**
 * The step body, springing between step heights instead of snapping.
 *
 * A wrapper measuring its child with a ResizeObserver and animating `height` is
 * the one layout animation the house rules allow, and this is the case they
 * describe: a container morphing to fit new content, on an interaction that
 * happens six times per persona rather than constantly. Motion drives it so the
 * spring is interruptible — stepping back before the previous step settles
 * redirects from wherever it got to, which a CSS transition cannot do.
 *
 * `height: auto` until the first measurement, so the first paint is the real
 * height rather than zero.
 *
 * The clip is on only while the height is actually moving. `overflow-hidden`
 * kept permanently is what cuts a focus ring off at the wrapper's edge — the
 * ring is drawn outside the element's box, so a settled step must not clip at
 * all. During the morph it has to, or the taller step's content spills past a
 * container that has not grown to hold it yet.
 */
function StepBody({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
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

  return (
    <motion.div
      /* No entry animation — the dialog already has its own open transition,
         and a height spring on top of it reads as two things arriving. */
      initial={false}
      animate={{ height }}
      transition={reduce ? { duration: 0 } : STEP_SPRING}
      onAnimationStart={() => setMorphing(true)}
      onAnimationComplete={() => setMorphing(false)}
      className={morphing ? "overflow-hidden" : undefined}
    >
      <div className="flex min-h-32 flex-col gap-4" ref={innerRef}>
        {children}
      </div>
    </motion.div>
  )
}

function OptionCard({
  title,
  hint,
  selected,
  onPick,
}: {
  title: string
  hint: string
  selected: boolean
  onPick: () => void
}) {
  return (
    <Item
      variant="outline"
      asChild
      className={cn(selected && "border-primary bg-primary-tint/40")}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onPick}
        className={cn("w-full text-start", !selected && "hover:bg-muted")}
      >
        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
          <ItemDescription dir="auto">{hint}</ItemDescription>
        </ItemContent>
      </button>
    </Item>
  )
}

function ReviewRow({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-24 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "line-clamp-3 text-sm",
          muted ? "text-muted-foreground" : "font-medium",
        )}
      >
        {value}
      </span>
    </div>
  )
}
