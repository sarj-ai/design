"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { toast } from "sonner"

import {
  BankingIcon,
  BuildWithAiIcon,
  ChooseStartIcon,
  CloseIcon,
  CreateScenarioIcon,
  HealthcareIcon,
  RealEstateIcon,
  RestaurantsIcon,
  RetailIcon,
  StartBlankIcon,
  StepBackIcon,
  StepDoneIcon,
  TelecomIcon,
} from "@/components/design-system/icons"
import { OrbAvatar } from "@/components/shared/orb-avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Message } from "@/components/ui/message"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

/**
 * Creating a scenario, as a full-screen flow: one question a screen, the
 * answer is the click, and it ends on a name and Create.
 *
 * The platform splits this across two pages that do not know about each
 * other — /scenarios/auto-generate (describe it, AI builds it) and
 * /scenarios/new (a Blank card over an industry grid, then use cases, then the
 * whole twenty-card editor). Here they are one flow after ElevenLabs' New
 * agent: the AI path is the first row, the industries sit under it, Blank
 * closes the list, and every path lands on the same last screen.
 *
 * Choosing is the step. A card is a button, so a start, an industry and a
 * template each move on the moment they are clicked — no Next to find. Only
 * the two screens you type on have a primary button, and it names what
 * happens: Build scenario, Create scenario.
 *
 * The chrome is three things: Back on the left, Close on the right, the step
 * dots at the foot. The title stays "New scenario" on every screen, because
 * it is one task; what changes is the question under it.
 */

type Template = {
  id: string
  name: string
  /** The template's own first message, which is what its card previews. */
  firstMessage: string
  reply: string
}

type Industry = {
  id: string
  name: string
  Icon: React.ComponentType
  templates: Template[]
}

const INDUSTRIES: Industry[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    Icon: HealthcareIcon,
    templates: [
      {
        id: "appointment-booking",
        name: "Appointment booking",
        firstMessage:
          "Hello, this is Riyadh Dental. Would you like to book a visit?",
        reply: "Yes, next Tuesday if you can.",
      },
      {
        id: "appointment-reminders",
        name: "Appointment reminders",
        firstMessage:
          "Hi {{name}}, a reminder of your check-up tomorrow at 10am.",
        reply: "Can we move it to the afternoon?",
      },
      {
        id: "prescription-refills",
        name: "Prescription refills",
        firstMessage:
          "Your prescription is due for a refill. Shall I order it?",
        reply: "Please, same pharmacy as last time.",
      },
      {
        id: "patient-feedback",
        name: "Patient feedback",
        firstMessage: "Thanks for visiting us. How was your appointment today?",
        reply: "Quick, and the doctor was great.",
      },
    ],
  },
  {
    id: "telecom",
    name: "Telecom",
    Icon: TelecomIcon,
    templates: [
      {
        id: "billing",
        name: "Billing enquiries",
        firstMessage: "Hello {{name}}, how can I help with your bill today?",
        reply: "It's higher than last month.",
      },
      {
        id: "plan-upgrades",
        name: "Plan upgrades",
        firstMessage:
          "You're close to your data limit. Want to see bigger plans?",
        reply: "What does the next one up cost?",
      },
      {
        id: "tech-support",
        name: "Technical support",
        firstMessage: "I can see a fault in your area. Is your line down?",
        reply: "Since this morning, yes.",
      },
    ],
  },
  {
    id: "banking",
    name: "Banking",
    Icon: BankingIcon,
    templates: [
      {
        id: "payment-reminders",
        name: "Payment reminders",
        firstMessage:
          "Hi {{name}}, your card payment of {{amount}} is due Friday.",
        reply: "Can I pay it now over the phone?",
      },
      {
        id: "card-activation",
        name: "Card activation",
        firstMessage: "Your new card has arrived. Shall we activate it now?",
        reply: "Yes, let's do it.",
      },
      {
        id: "loan-follow-up",
        name: "Loan follow-up",
        firstMessage: "You started a loan application. Want to finish it now?",
        reply: "What's left to fill in?",
      },
      {
        id: "fraud-check",
        name: "Fraud check",
        firstMessage:
          "We saw a payment of {{amount}} abroad. Was that you, {{name}}?",
        reply: "No, that wasn't me.",
      },
    ],
  },
  {
    id: "restaurants",
    name: "Restaurants",
    Icon: RestaurantsIcon,
    templates: [
      {
        id: "reservations",
        name: "Table reservations",
        firstMessage: "Good evening, Najd House. For how many guests?",
        reply: "Four, Thursday at eight.",
      },
      {
        id: "order-status",
        name: "Order status",
        firstMessage: "Your order is with the driver, about 15 minutes away.",
        reply: "Great, thank you.",
      },
    ],
  },
  {
    id: "retail",
    name: "Retail",
    Icon: RetailIcon,
    templates: [
      {
        id: "order-tracking",
        name: "Order tracking",
        firstMessage: "Hi {{name}}, your order ships today. Any questions?",
        reply: "When will it arrive?",
      },
      {
        id: "cart-recovery",
        name: "Cart recovery",
        firstMessage: "You left two items in your cart. Can I help you finish?",
        reply: "Is there free delivery?",
      },
      {
        id: "returns",
        name: "Returns",
        firstMessage: "I can help with your return. What's the order number?",
        reply: "It's 40-2291.",
      },
    ],
  },
  /* No templates yet — the one industry that shows the empty state. */
  {
    id: "real-estate",
    name: "Real estate",
    Icon: RealEstateIcon,
    templates: [],
  },
]

/* The platform's quick starts, cut down to their first lines. */
const QUICK_STARTS = [
  {
    label: "Customer service",
    prompt:
      "Role: customer service agent for a telecom company.\nGoal: handle billing enquiries, resolve account issues and process service requests.\nTone: professional and patient, in Saudi Najdi Arabic.\nKnown before the call: customer_name, account_number, account_balance.\nCollect: the nature of the enquiry and how it was resolved.\nTransfer to a human for payment disputes over 500 SAR.",
  },
  {
    label: "Appointment booking",
    prompt:
      "Role: scheduling assistant for a medical clinic.\nGoal: book, reschedule and confirm patient appointments.\nTone: warm and reassuring, in clear Saudi Arabic.\nKnown before the call: patient_name, last_visit_date.\nCollect: preferred date and time, appointment type, preferred doctor.\nTransfer to reception if the doctor is unavailable within two weeks.",
  },
  {
    label: "Restaurant reservations",
    prompt:
      "Role: reservation assistant for a fine dining restaurant.\nGoal: manage table bookings and special requests.\nTone: warm and welcoming, in Saudi Arabic.\nKnown before the call: guest_name, loyalty_status.\nCollect: party size, date and time, occasion, dietary needs.\nTransfer to the manager for groups larger than 15.",
  },
  {
    label: "Sales inquiry",
    prompt:
      "Role: sales assistant for an e-commerce company.\nGoal: answer product questions, recommend products and capture leads.\nTone: knowledgeable and upbeat, in modern Saudi Arabic.\nKnown before the call: customer_name, cart_items, cart_value.\nCollect: product interest, intent, budget, delivery city.\nTransfer to a sales manager for orders of 10 or more items.",
  },
]

const PLACEHOLDER =
  "An appointment booking agent for a dental clinic in Riyadh. Books visits, checks which doctors are free and confirms by SMS. Collects the patient's name and a preferred time. Speaks professional Saudi Arabic, and transfers to reception when a patient asks for a doctor who is booked for two weeks."

const LANGUAGES = [
  { value: "ar", label: "Arabic" },
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
]

/* The platform's generation stages, in its order. */
const STAGES = [
  "Analysing your requirements",
  "Designing the agent's personality",
  "Writing the conversation flow",
  "Tuning the language",
  "Configuring tools",
  "Finishing your scenario",
]

const PROMPT_MIN = 50
const PROMPT_MAX = 10000
const PROMPT_WARN = 8000

/* A demo stand-in for the generation job: one stage every this many ms. */
const STAGE_MS = 700

type Step = "start" | "describe" | "build" | "use-case" | "name"
type Path = "describe" | "template" | "blank"

const PATHS: Record<Path, Step[]> = {
  describe: ["start", "describe", "build", "name"],
  template: ["start", "use-case", "name"],
  blank: ["start", "name"],
}

const QUESTIONS: Record<Step, string> = {
  start: "How do you want to start?",
  describe: "What should the agent do?",
  build: "Building your scenario",
  "use-case": "What will the agent help with?",
  name: "Name your scenario",
}

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
 *   a dot joining or leaving the row (the paths are 2, 3
 *   or 4 steps long) grows in from half size
 * ───────────────────────────────────────────────────────── */
const DOT = {
  /** How far the dots you are not on recede. */
  rest: 0.15,
  enter: 0.5,
  radius: 9999,
  /** No bounce: it is moving, not arriving. */
  spring: { type: "spring", visualDuration: 0.35, bounce: 0 },
} as const

export function CreationFlowPreview() {
  const [open, setOpen] = React.useState(true)
  const [leaving, setLeaving] = React.useState(false)
  const [trail, setTrail] = React.useState<Step[]>(["start"])
  const [direction, setDirection] = React.useState(1)
  const [path, setPath] = React.useState<Path | null>(null)
  const [industryId, setIndustryId] = React.useState<string | null>(null)
  const [templateId, setTemplateId] = React.useState<string | null>(null)
  const [prompt, setPrompt] = React.useState("")
  const [quickStart, setQuickStart] = React.useState<string | null>(null)
  const [languages, setLanguages] = React.useState(["ar"])
  const [stage, setStage] = React.useState(0)
  const [name, setName] = React.useState("")

  const step = trail[trail.length - 1]
  const industry = INDUSTRIES.find((i) => i.id === industryId) ?? null
  const template = industry?.templates.find((t) => t.id === templateId) ?? null

  const go = (next: Step) => {
    setDirection(1)
    setTrail((t) => [...t, next])
  }

  /* Back skips the build screen: it is a wait, not a question, and going back
     to it would run the job again. */
  const back = () => {
    setDirection(-1)
    setTrail((t) => {
      const next = t.slice(0, -1)
      return next[next.length - 1] === "build" ? next.slice(0, -1) : next
    })
  }

  const backTo = (target: Step) => {
    setDirection(-1)
    setTrail((t) => t.slice(0, t.lastIndexOf(target) + 1))
  }

  const reset = () => {
    setTrail(["start"])
    setDirection(1)
    setPath(null)
    setIndustryId(null)
    setTemplateId(null)
    setPrompt("")
    setQuickStart(null)
    setLanguages(["ar"])
    setStage(0)
    setName("")
  }

  const close = () => {
    setOpen(false)
    setLeaving(false)
    reset()
  }

  /* Past the first screen there are answers to lose, so leaving asks. */
  const requestClose = () => (trail.length > 1 ? setLeaving(true) : close())

  const build = () => {
    setStage(0)
    go("build")
  }

  /* The generation job, played at demo speed. When it finishes, the flow
     moves on by itself to the name the job suggested — a wait screen has no
     button to press. */
  React.useEffect(() => {
    if (step !== "build") return
    const timer = window.setTimeout(() => {
      if (stage < STAGES.length) {
        setStage(stage + 1)
        return
      }
      setName(quickStart ?? "Clinic appointment booking")
      setDirection(1)
      setTrail((t) => [...t, "name"])
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [step, stage, quickStart])

  const create = () => {
    toast.success(`${name.trim()} created`, {
      description: "Opening it in the editor.",
    })
    close()
  }

  const reduced = useReducedMotion() ?? false
  const dots = PATHS[path ?? "describe"]
  const at = Math.max(0, dots.indexOf(step))

  return (
    /* The frame stands in for the screen: the real flow is fixed to the
       viewport, and translate-x-0 makes this box its containing block. */
    <div className="relative flex h-180 translate-x-0 flex-col overflow-hidden rounded-xl border bg-background">
      {open ? (
        <>
          <div className="flex h-16 shrink-0 items-center justify-between px-5">
            {trail.length > 1 && step !== "build" ? (
              <Button onClick={back} size="sm" variant="ghost">
                <StepBackIcon />
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button
              aria-label="Close"
              onClick={requestClose}
              size="icon"
              variant="outline"
            >
              <CloseIcon />
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 pt-6 pb-12">
              <AnimatePresence custom={direction} initial={false} mode="wait">
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-8"
                  custom={direction}
                  exit="exit"
                  initial="enter"
                  key={step}
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
                    <h3 className="text-2xl font-semibold tracking-tight">
                      New scenario
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {QUESTIONS[step]}
                    </p>
                  </header>

                  {step === "start" ? (
                    <StartStep
                      onBlank={() => {
                        setPath("blank")
                        setTemplateId(null)
                        setName("")
                        go("name")
                      }}
                      onDescribe={() => {
                        setPath("describe")
                        go("describe")
                      }}
                      onIndustry={(id) => {
                        setPath("template")
                        setIndustryId(id)
                        go("use-case")
                      }}
                    />
                  ) : null}

                  {step === "describe" ? (
                    <DescribeStep
                      languages={languages}
                      onBuild={build}
                      onLanguages={setLanguages}
                      onPrompt={(value, from) => {
                        setPrompt(value)
                        setQuickStart(from)
                      }}
                      prompt={prompt}
                    />
                  ) : null}

                  {step === "build" ? (
                    <BuildStep prompt={prompt} stage={stage} />
                  ) : null}

                  {step === "use-case" && industry ? (
                    <UseCaseStep
                      industry={industry}
                      onDescribe={() => {
                        setPath("describe")
                        go("describe")
                      }}
                      onTemplate={(t) => {
                        setTemplateId(t.id)
                        setName(t.name)
                        go("name")
                      }}
                    />
                  ) : null}

                  {step === "name" ? (
                    <NameStep
                      name={name}
                      onChange={() =>
                        backTo(
                          path === "template"
                            ? "use-case"
                            : path === "describe"
                              ? "describe"
                              : "start",
                        )
                      }
                      onCreate={create}
                      onName={setName}
                      source={
                        path === "template" && industry && template ? (
                          <Source
                            description={`${industry.name} template`}
                            media={<industry.Icon />}
                            title={template.name}
                          />
                        ) : path === "describe" ? (
                          <Source
                            description={prompt.replace(/\s+/g, " ")}
                            media={<OrbAvatar name={prompt} size="sm" />}
                            title="Built from your description"
                          />
                        ) : (
                          <Source
                            description="Starts empty"
                            media={<StartBlankIcon />}
                            title="Blank scenario"
                          />
                        )
                      }
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Where you are, and nothing to click: Back is the way back, and
              a dot you could jump forward to would skip a question. */}
          <div className="flex h-14 shrink-0 items-center justify-center">
            <span className="sr-only">
              Step {at + 1} of {dots.length}
            </span>
            {/* popLayout takes a leaving dot out of the row at once, so the
                others close the gap on the same spring instead of waiting
                for it to fade. */}
            <div aria-hidden className="relative flex items-center gap-1.5">
              <AnimatePresence initial={false} mode="popLayout">
                {dots.map((_, i) => (
                  <motion.span
                    animate={{ opacity: i === at ? 1 : DOT.rest, scale: 1 }}
                    className={cn(
                      "h-1.5 bg-foreground",
                      i === at ? "w-6" : "w-1.5",
                    )}
                    exit={{ opacity: 0, scale: DOT.enter }}
                    initial={{ opacity: 0, scale: DOT.enter }}
                    /* By position, not by step: picking a path keeps the
                       dots already there and only adds or drops the tail. */
                    key={i}
                    layout
                    /* In style rather than rounded-full, so motion can
                       counter-scale it while the width springs — a class
                       radius squashes the ends mid-stretch. */
                    style={{ borderRadius: DOT.radius }}
                    transition={reduced ? { duration: 0 } : DOT.spring}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <Button onClick={() => setOpen(true)}>
            <CreateScenarioIcon />
            New scenario
          </Button>
        </div>
      )}

      {/* A confirm is the one overlay allowed over another. */}
      <AlertDialog onOpenChange={setLeaving} open={leaving}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this scenario?</AlertDialogTitle>
            <AlertDialogDescription>
              Nothing has been created yet, so leaving keeps none of your
              answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction onClick={close} variant="destructive">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* A card that is one choice: the whole card is the button. */
const CHOICE = "cursor-pointer text-start hover:bg-muted/50"

function StartStep({
  onBlank,
  onDescribe,
  onIndustry,
}: {
  onBlank: () => void
  onDescribe: () => void
  onIndustry: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* The AI path first: it is where most scenarios start, and the only
          one that ends with the prompt already written. */}
      <Item asChild className={cn(CHOICE, "p-4")} variant="outline">
        <button onClick={onDescribe} type="button">
          <ItemMedia>
            <OrbAvatar name="Describe it" size="lg" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Describe it</ItemTitle>
            <ItemDescription>
              Say what the agent should do, and AI builds the whole scenario
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <span className="text-muted-foreground transition-transform duration-150 ease-out-cubic group-hover/item:translate-x-0.5 motion-reduce:transition-none [&_svg]:size-4">
              <ChooseStartIcon />
            </span>
          </ItemActions>
        </button>
      </Item>

      <FieldSeparator className="my-3">Or start from a template</FieldSeparator>

      <div className="grid grid-cols-3 gap-3">
        {INDUSTRIES.map((industry) => (
          <Item
            asChild
            className={cn(CHOICE, "py-3")}
            key={industry.id}
            variant="outline"
          >
            <button onClick={() => onIndustry(industry.id)} type="button">
              <ItemMedia className="text-muted-foreground" variant="icon">
                <industry.Icon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{industry.name}</ItemTitle>
              </ItemContent>
            </button>
          </Item>
        ))}
      </div>

      <Item
        asChild
        className={cn(CHOICE, "justify-center py-3")}
        variant="outline"
      >
        <button onClick={onBlank} type="button">
          <ItemMedia className="text-muted-foreground" variant="icon">
            <StartBlankIcon />
          </ItemMedia>
          <ItemTitle>Blank scenario</ItemTitle>
        </button>
      </Item>
    </div>
  )
}

function DescribeStep({
  languages,
  onBuild,
  onLanguages,
  onPrompt,
  prompt,
}: {
  languages: string[]
  onBuild: () => void
  onLanguages: (value: string[]) => void
  onPrompt: (value: string, quickStart: string | null) => void
  prompt: string
}) {
  const length = prompt.trim().length
  const ready = length >= PROMPT_MIN && languages.length > 0

  return (
    <div className="flex flex-col gap-4">
      {/* One composer: what to build, which languages, and Build — so the
          button sits where the typing ends. */}
      <InputGroup>
        <InputGroupTextarea
          aria-label="What the agent should do"
          autoFocus
          className="min-h-44 text-base leading-relaxed"
          maxLength={PROMPT_MAX}
          onChange={(e) => onPrompt(e.target.value, null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && ready)
              onBuild()
          }}
          placeholder={PLACEHOLDER}
          rows={7}
          value={prompt}
        />
        <InputGroupAddon align="block-end" className="justify-between">
          {/* At least one: the last language cannot be switched off. */}
          <ToggleGroup
            aria-label="Languages"
            onValueChange={(value) => value.length && onLanguages(value)}
            size="sm"
            type="multiple"
            value={languages}
            variant="outline"
          >
            {LANGUAGES.map((language) => (
              <ToggleGroupItem key={language.value} value={language.value}>
                {language.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs font-normal tabular-nums",
                length >= PROMPT_MAX
                  ? "text-destructive"
                  : length >= PROMPT_WARN
                    ? "text-warning"
                    : "text-muted-foreground",
              )}
            >
              {length < PROMPT_MIN
                ? `At least ${PROMPT_MIN} characters`
                : `${length.toLocaleString()} / ${PROMPT_MAX.toLocaleString()}`}
            </span>
            <InputGroupButton
              disabled={!ready}
              onClick={onBuild}
              size="sm"
              variant="default"
            >
              <BuildWithAiIcon />
              Build scenario
            </InputGroupButton>
          </div>
        </InputGroupAddon>
      </InputGroup>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Quick start</span>
        {QUICK_STARTS.map((start) => (
          <Button
            key={start.label}
            onClick={() => onPrompt(start.prompt, start.label)}
            size="xs"
            variant="outline"
          >
            {start.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

function BuildStep({ prompt, stage }: { prompt: string; stage: number }) {
  return (
    <div className="flex flex-col items-center gap-10 pt-4">
      {/* The same orb as the Describe it row, grown: the thing you chose is
          the thing working. */}
      <OrbAvatar className="size-24" name={prompt} />

      <ol aria-live="polite" className="flex w-full max-w-xs flex-col gap-3">
        {STAGES.map((label, i) => (
          <li
            className={cn(
              "flex items-center gap-3 text-sm transition-colors duration-200 ease-out-cubic motion-reduce:transition-none",
              i < stage
                ? "text-muted-foreground"
                : i === stage
                  ? "font-medium text-foreground"
                  : "text-muted-foreground/50",
            )}
            key={label}
          >
            <span className="flex size-4 items-center justify-center [&_svg]:size-4">
              {i < stage ? <StepDoneIcon /> : i === stage ? <Spinner /> : null}
            </span>
            {label}
          </li>
        ))}
      </ol>
    </div>
  )
}

function UseCaseStep({
  industry,
  onDescribe,
  onTemplate,
}: {
  industry: Industry
  onDescribe: () => void
  onTemplate: (template: Template) => void
}) {
  if (!industry.templates.length) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyTitle>
            No {industry.name.toLowerCase()} templates yet
          </EmptyTitle>
          <EmptyDescription>
            Describe the agent instead, and AI builds it from scratch.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onDescribe} variant="outline">
            <BuildWithAiIcon />
            Describe it
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {industry.templates.map((template) => (
        <Item
          asChild
          className={cn(
            CHOICE,
            "flex-col items-stretch gap-0 overflow-hidden p-0",
          )}
          key={template.id}
          variant="outline"
        >
          <button onClick={() => onTemplate(template)} type="button">
            {/* The call as the template opens it: its first message, and a
                caller answering. It says what the template does faster than
                a description would. */}
            <div className="flex h-44 flex-col justify-end gap-2 p-4">
              <Message>
                <OrbAvatar
                  className="self-end"
                  name={template.name}
                  size="sm"
                />
                <Bubble variant="muted">
                  <BubbleContent>{template.firstMessage}</BubbleContent>
                </Bubble>
              </Message>
              <Message align="end">
                <Bubble>
                  <BubbleContent>{template.reply}</BubbleContent>
                </Bubble>
              </Message>
            </div>
            <div className="flex items-center justify-center gap-1.5 border-t px-4 py-3 font-medium [&_svg]:size-3.5">
              <span className="text-muted-foreground">
                <industry.Icon />
              </span>
              {template.name}
            </div>
          </button>
        </Item>
      ))}
    </div>
  )
}

/** What the scenario is starting from, with the way back to change it. */
function Source({
  description,
  media,
  title,
}: {
  description: string
  media: React.ReactNode
  title: string
}) {
  return (
    <>
      <ItemMedia className="text-muted-foreground" variant="icon">
        {media}
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription className="line-clamp-1">
          {description}
        </ItemDescription>
      </ItemContent>
    </>
  )
}

function NameStep({
  name,
  onChange,
  onCreate,
  onName,
  source,
}: {
  name: string
  onChange: () => void
  onCreate: () => void
  onName: (value: string) => void
  source: React.ReactNode
}) {
  const ready = name.trim().length > 0

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (ready) onCreate()
      }}
    >
      <Item variant="muted">
        {source}
        <ItemActions>
          <Button onClick={onChange} size="sm" type="button" variant="ghost">
            Change
          </Button>
        </ItemActions>
      </Item>

      <Field>
        <FieldLabel htmlFor="new-scenario-name">Scenario name</FieldLabel>
        <Input
          autoFocus
          id="new-scenario-name"
          onChange={(e) => onName(e.target.value)}
          placeholder="Payment reminders"
          value={name}
        />
      </Field>

      <div className="flex justify-end">
        <Button disabled={!ready} type="submit">
          Create scenario
        </Button>
      </div>
    </form>
  )
}
