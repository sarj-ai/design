"use client"

import * as React from "react"

import { toast } from "sonner"

import { DrawerAnatomyPreview } from "@/components/design-system/drawer-anatomy-preview"
import { FieldHint } from "@/components/design-system/field-hint"
import { CreationFlowPreview } from "@/components/design-system/creation-flow-preview"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArchiveIcon,
  CloseIcon,
  CopyKeyIcon,
  CreateInListIcon,
  NextRecordIcon,
  PreviousRecordIcon,
} from "@/components/design-system/icons"
import { DEMO_VOICES, type SurfaceId } from "@/lib/design-system/data"

/**
 * The eight surfaces, opened rather than described.
 *
 * The diagram says where a surface sits; this says what being in it is like,
 * which is the half a criterion cannot carry. Each demo is a real Sarj task
 * the decision sends to that surface, and each keeps the surface's shape —
 * the widths, the footer, the guard — so the demo is also the reference.
 */
export function SurfaceDemo({ variant }: { variant: SurfaceId }) {
  switch (variant) {
    case "inline":
      return <InlineDemo />
    case "popover":
      return <AttachKnowledgeDemo />
    case "undo":
      return <ArchiveDemo />
    case "dialog":
      return <CreateApiKeyDialog />
    case "confirm":
      return <DeletePersonaDialog />
    case "drawer":
      return <DrawerAnatomyPreview />
    case "record":
      return <CallRecordDemo />
    case "page":
      return <CreationFlowPreview />
  }
}

/**
 * Inline: the page is already about this, so there is nothing to open. The
 * field swaps in where the value was and the reader never leaves.
 */
function InlineDemo() {
  const [editing, setEditing] = React.useState(false)
  const [voice, setVoice] = React.useState(DEMO_VOICES[0].id)
  const [draft, setDraft] = React.useState(voice)

  const current = DEMO_VOICES.find((entry) => entry.id === voice)

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Voice</span>
          <span className="text-sm text-muted-foreground">
            {current?.label}
          </span>
        </div>
        <Button
          onClick={() => {
            setDraft(voice)
            setEditing(true)
          }}
          size="sm"
          variant="outline"
        >
          Change
        </Button>
      </div>
    )
  }

  return (
    <Field>
      <FieldLabel htmlFor="surface-inline-voice">Voice</FieldLabel>
      <Select onValueChange={setDraft} value={draft}>
        <SelectTrigger className="w-full" id="surface-inline-voice">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {DEMO_VOICES.map((entry) => (
            <SelectItem key={entry.id} value={entry.id}>
              {entry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Save and Cancel belong to the field, not to a form: inline editing
          that saves on blur leaves a reader unsure whether it took. */}
      <div className="flex justify-end gap-2">
        <Button onClick={() => setEditing(false)} size="sm" variant="ghost">
          Cancel
        </Button>
        <Button
          onClick={() => {
            setVoice(draft)
            setEditing(false)
          }}
          size="sm"
        >
          Save
        </Button>
      </div>
    </Field>
  )
}

/**
 * Popover: attaching knowledge bases to a scenario, the platform's own picker.
 * Anchored to the button that asked, searchable, no footer — and the way to
 * make a new one at its foot, which closes the popover, opens a dialog in its
 * place, and comes back with the new one attached.
 */
const KNOWLEDGE_BASES = [
  { id: "returns", label: "Returns policy", language: "AR" },
  { id: "pricing", label: "Pricing 2026", language: "EN" },
  { id: "branches", label: "Branch hours", language: "AR" },
  { id: "card-faq", label: "Card FAQ", language: "AR" },
]

function AttachKnowledgeDemo() {
  const [bases, setBases] = React.useState(KNOWLEDGE_BASES)
  const [picked, setPicked] = React.useState<string[]>(["returns"])
  const [open, setOpen] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [name, setName] = React.useState("")

  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    )

  return (
    <div className="flex flex-col items-start gap-3">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            <CreateInListIcon />
            Attach knowledge base
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="gap-0 p-0">
          <Command>
            <CommandInput placeholder="Search knowledge bases" />
            <CommandList>
              <CommandEmpty>No knowledge base matches.</CommandEmpty>
              <CommandGroup>
                {bases.map((base) => (
                  <CommandItem
                    data-checked={picked.includes(base.id)}
                    key={base.id}
                    onSelect={() => toggle(base.id)}
                    value={base.label}
                  >
                    <span className="flex-1">{base.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {base.language}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="border-t p-1">
            <Button
              className="w-full justify-start"
              onClick={() => {
                setOpen(false)
                setCreating(true)
              }}
              size="sm"
              variant="ghost"
            >
              <CreateInListIcon />
              Create knowledge base
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-1.5">
        {picked.map((id) => (
          <Badge key={id} variant="secondary">
            {bases.find((base) => base.id === id)?.label}
          </Badge>
        ))}
      </div>

      {/* Replaces the popover rather than stacking on it, and returns with
          the new knowledge base already attached. */}
      <Dialog
        onOpenChange={(next) => {
          setCreating(next)
          if (!next) setName("")
        }}
        open={creating}
      >
        <DialogContent className="sm:max-w-md">
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const label = name.trim() || "Untitled knowledge base"
              const id = `kb-${bases.length}`
              setBases((current) => [...current, { id, label, language: "AR" }])
              setPicked((current) => [...current, id])
              setCreating(false)
              setName("")
              toast(`${label} created and attached`)
            }}
          >
            <DialogHeader>
              <DialogTitle>Create knowledge base</DialogTitle>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="surface-kb-name">Name</FieldLabel>
              <Input
                id="surface-kb-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Warranty terms"
                value={name}
              />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create and attach</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Undo: archiving a scenario, which the platform does today on one click
 * with no word at all. Nothing asks first; the toast says what happened and
 * Undo puts it back in its place.
 */
const SCENARIO_NAMES = [
  "Appointment booking",
  "Delivery confirmation",
  "Renewal follow-up",
]

function ArchiveDemo() {
  const [rows, setRows] = React.useState(SCENARIO_NAMES)

  const archive = (name: string) => {
    setRows((current) => current.filter((entry) => entry !== name))
    toast(`${name} moved to Recently deleted`, {
      action: {
        label: "Undo",
        onClick: () =>
          setRows((current) =>
            SCENARIO_NAMES.filter(
              (entry) => entry === name || current.includes(entry),
            ),
          ),
      },
    })
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          All three archived.
        </span>
        <Button
          onClick={() => setRows(SCENARIO_NAMES)}
          size="sm"
          variant="outline"
        >
          Restore all
        </Button>
      </div>
    )
  }

  return (
    <ItemGroup className="gap-2">
      {rows.map((name) => (
        <Item key={name} size="sm" variant="outline">
          <ItemContent>
            <ItemTitle>{name}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Button
              aria-label={`Archive ${name}`}
              onClick={() => archive(name)}
              size="icon-sm"
              variant="ghost"
            >
              <ArchiveIcon />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}

/**
 * Dialog: creating an API key. One field, so it is a dialog; the platform
 * asks "Create API key?" instead, a confirm about something harmless. The key
 * is shown once, in the same dialog after the create — a second dialog would
 * be two overlays for one task.
 */
const DEMO_KEY = "sk_live_4f9a2c7e1b8d3a60e5c1"

function CreateApiKeyDialog() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [missing, setMissing] = React.useState(false)
  const [created, setCreated] = React.useState(false)

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setName("")
          setMissing(false)
          setCreated(false)
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button className="self-start" size="sm" variant="outline">
          Create API key
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>{name.trim()} is ready</DialogTitle>
              <DialogDescription>
                Copy it now. Once this closes it cannot be shown again.
              </DialogDescription>
            </DialogHeader>
            <InputGroup>
              <InputGroupInput
                aria-label="API key"
                className="font-mono text-xs"
                readOnly
                value={DEMO_KEY}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Copy key"
                  onClick={() => toast("Key copied")}
                  size="icon-xs"
                >
                  <CopyKeyIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  toast("Key copied")
                  setOpen(false)
                }}
              >
                Copy and close
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* Create stays on and says what is missing when pressed, rather
             than sitting disabled with no reason given. */
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (!name.trim()) {
                setMissing(true)
                return
              }
              setCreated(true)
            }}
          >
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
            </DialogHeader>
            <Field data-invalid={missing}>
              <FieldHint
                hint="Tells this key apart when it is time to revoke one."
                htmlFor="surface-key-name"
              >
                Name
              </FieldHint>
              <Input
                aria-invalid={missing}
                id="surface-key-name"
                onChange={(event) => {
                  setName(event.target.value)
                  setMissing(false)
                }}
                placeholder="Zoho sync"
                value={name}
              />
              {missing ? <FieldError>Give the key a name.</FieldError> : null}
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create key</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Confirm: deleting a persona that answers a live number, so the one case
 * where the name is typed. The title names it; the body says what goes, what
 * stops and what stays; the button is the verb, in red because it destroys.
 * No warning icon — the sentence is the warning.
 */
const PERSONA = "Reservations"

function DeletePersonaDialog() {
  const [typed, setTyped] = React.useState("")

  return (
    <AlertDialog onOpenChange={(next) => (next ? null : setTyped(""))}>
      <AlertDialogTrigger asChild>
        <Button className="self-start" size="sm" variant="outline">
          Delete persona
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {PERSONA}?</AlertDialogTitle>
          <AlertDialogDescription>
            It answers +966 11 234 5678, which stops taking calls the moment it
            goes. Its four scenarios move to your default persona; past calls
            keep their transcripts.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Field>
          <FieldLabel htmlFor="surface-confirm-name">
            Type {PERSONA} to confirm
          </FieldLabel>
          <Input
            autoComplete="off"
            id="surface-confirm-name"
            onChange={(event) => setTyped(event.target.value)}
            value={typed}
          />
        </Field>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={typed !== PERSONA}
            onClick={() =>
              toast(`${PERSONA} deleted`, {
                description: "+966 11 234 5678 no longer answers.",
              })
            }
            variant="destructive"
          >
            Delete persona
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Record: a call opened from the list. Wide enough for the transcript and a
 * details column, narrow enough that the list stays at the edge; ↑ and ↓ (the
 * buttons or the keys) move through the list without closing it. No footer —
 * nothing here is being saved.
 */
/**
 * ↑ and ↓ step through the list while a record is open, wherever focus is —
 * except in a field, where the arrows belong to the text.
 */
export function useRecordKeys(active: boolean, step: (by: number) => void) {
  const latest = React.useRef(step)
  React.useEffect(() => {
    latest.current = step
  })
  React.useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable]")) return
      if (event.key === "ArrowDown") latest.current(1)
      if (event.key === "ArrowUp") latest.current(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active])
}

type DemoCall = {
  id: string
  caller: string
  scenario: string
  outcome: string
  duration: string
  started: string
  turns: { speaker: "Agent" | "Caller"; text: string }[]
}

const DEMO_CALLS: DemoCall[] = [
  {
    id: "CL-8840",
    caller: "+966 55 201 7734",
    scenario: "Appointment booking",
    outcome: "Booked",
    duration: "3:12",
    started: "28 Sep 2026, 10:11",
    turns: [
      { speaker: "Agent", text: "Hello, this is the clinic. How can I help?" },
      { speaker: "Caller", text: "I need to see a dentist this week." },
      { speaker: "Agent", text: "Thursday at 4:30 is free. Shall I book it?" },
      { speaker: "Caller", text: "Yes, please." },
    ],
  },
  {
    id: "CL-8841",
    caller: "+966 50 118 4420",
    scenario: "Delivery confirmation",
    outcome: "Rescheduled",
    duration: "1:48",
    started: "28 Sep 2026, 10:26",
    turns: [
      {
        speaker: "Agent",
        text: "Your order arrives tomorrow between 2 and 6.",
      },
      { speaker: "Caller", text: "I won't be home. Can it come Saturday?" },
      { speaker: "Agent", text: "Saturday morning it is." },
    ],
  },
  {
    id: "CL-8842",
    caller: "+966 56 930 0215",
    scenario: "Renewal follow-up",
    outcome: "No answer",
    duration: "0:31",
    started: "28 Sep 2026, 10:40",
    turns: [
      {
        speaker: "Agent",
        text: "Hello, I'm calling about your policy renewal.",
      },
    ],
  },
]

function CallRecordDemo() {
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(0)
  const call = DEMO_CALLS[index]

  const step = (by: number) =>
    setIndex((current) =>
      Math.min(DEMO_CALLS.length - 1, Math.max(0, current + by)),
    )
  useRecordKeys(open, step)

  return (
    <>
      <ItemGroup className="gap-2">
        {DEMO_CALLS.map((entry, position) => (
          <Item
            asChild
            className="text-start transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none"
            key={entry.id}
            size="sm"
            variant="outline"
          >
            <button
              onClick={() => {
                setIndex(position)
                setOpen(true)
              }}
              type="button"
            >
              <ItemContent>
                <ItemTitle>{entry.caller}</ItemTitle>
                <ItemDescription>
                  {entry.scenario} · {entry.duration}
                </ItemDescription>
              </ItemContent>
            </button>
          </Item>
        ))}
      </ItemGroup>

      <Drawer direction="right" onOpenChange={setOpen} open={open}>
        {/* 1024: the one record width. `!` because the primitive pins its
            width on a data-attribute variant. */}
        <DrawerContent className="sm:max-w-5xl!">
          <DrawerHeader className="flex flex-row items-center justify-between gap-4 border-b">
            <div className="flex flex-col gap-0.5">
              <DrawerTitle>{call.caller}</DrawerTitle>
              <DrawerDescription>
                {call.id} · {call.started}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {index + 1} of {DEMO_CALLS.length}
              </span>
              <ButtonGroup>
                <Button
                  aria-label="Previous call"
                  disabled={index === 0}
                  onClick={() => step(-1)}
                  size="icon-sm"
                  variant="outline"
                >
                  <PreviousRecordIcon />
                </Button>
                <Button
                  aria-label="Next call"
                  disabled={index === DEMO_CALLS.length - 1}
                  onClick={() => step(1)}
                  size="icon-sm"
                  variant="outline"
                >
                  <NextRecordIcon />
                </Button>
              </ButtonGroup>
              <DrawerClose asChild>
                <Button aria-label="Close" size="icon-sm" variant="ghost">
                  <CloseIcon />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1">
            <ol className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {call.turns.map((turn, position) => (
                <li className="flex flex-col gap-0.5" key={position}>
                  <span className="text-xs font-medium text-muted-foreground">
                    {turn.speaker}
                  </span>
                  <span className="text-sm">{turn.text}</span>
                </li>
              ))}
            </ol>
            <dl className="flex w-72 shrink-0 flex-col gap-4 border-s p-4">
              {[
                ["Scenario", call.scenario],
                ["Outcome", call.outcome],
                ["Duration", call.duration],
                ["Started", call.started],
              ].map(([term, value]) => (
                <div className="flex flex-col gap-0.5" key={term}>
                  <dt className="text-xs text-muted-foreground">{term}</dt>
                  <dd className="text-sm">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
