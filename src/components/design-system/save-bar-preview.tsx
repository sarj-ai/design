"use client"

import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Kbd } from "@/components/ui/kbd"
import { TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/shared/page-header"
import { CloseIcon } from "@/components/design-system/icons"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import { cn } from "@/lib/utils"

/**
 * Unsaved changes, five ways, on the same editable page.
 *
 * The product's bar is a full-width strip with a warning triangle, "You have
 * unsaved changes", Clear and Review Changes. It says something changed but
 * not what, treats a normal state as a warning, and puts Clear beside the
 * primary action. Each variant below answers those differently; they share
 * one review, which marks only the lines that changed.
 */

type Prompt = { id: string; title: string; language: string; body: string }

const PROMPTS: Prompt[] = [
  {
    id: "empathy",
    title: "Empathy",
    language: "EN",
    body: "Empathy: I understand | That makes sense | No problem\nAffirmation: Absolutely | Of course",
  },
  {
    id: "speech-en",
    title: "Speech patterns",
    language: "EN",
    body: "Openers: hmm | oh | okay | got it | right\nHesitations: um | uh | you know\nDo not use fillers at the very beginning of a response.",
  },
  {
    id: "speech-ar",
    title: "Speech patterns",
    language: "AR",
    body: "افتتاح: طيب | تمام | أكيد\nتردد: يعني | خلني أشوف",
  },
]

const VARIANTS = [
  { id: "pill", label: "Floating pill" },
  { id: "header", label: "In the header" },
  { id: "card", label: "Per card" },
  { id: "tray", label: "Docked tray" },
  { id: "drawer", label: "Review drawer" },
]

type Variant = (typeof VARIANTS)[number]["id"]

/* ------------------------------------------------------------------ state */

function useDraft() {
  const [saved, setSaved] = React.useState(PROMPTS)
  const [draft, setDraft] = React.useState(PROMPTS)

  const changed = draft.filter(
    (prompt, index) => prompt.body !== saved[index].body,
  )

  return {
    saved,
    draft,
    changed,
    dirty: changed.length > 0,
    edit(id: string, body: string) {
      setDraft((current) =>
        current.map((item) => (item.id === id ? { ...item, body } : item)),
      )
    },
    revert(id: string) {
      const original = saved.find((item) => item.id === id)
      if (!original) return
      setDraft((current) =>
        current.map((item) => (item.id === id ? original : item)),
      )
    },
    saveOne(id: string) {
      const next = draft.find((item) => item.id === id)
      if (!next) return
      setSaved((current) =>
        current.map((item) => (item.id === id ? next : item)),
      )
      toast.success(`${next.title} (${next.language}) saved`)
    },
    discard() {
      const before = draft
      setDraft(saved)
      toast("Changes discarded", {
        action: { label: "Undo", onClick: () => setDraft(before) },
      })
    },
    save() {
      setSaved(draft)
      toast.success(
        changed.length === 1
          ? "1 prompt saved"
          : `${changed.length} prompts saved`,
      )
    },
  }
}

type Draft = ReturnType<typeof useDraft>

const name = (prompt: Prompt) => `${prompt.title} (${prompt.language})`

function count(n: number) {
  return n === 1 ? "1 change" : `${n} changes`
}

/* ------------------------------------------------------------------- page */

export function SaveBarPreview() {
  const [variant, setVariant] = React.useState<Variant>("pill")

  return (
    <SecondaryTabs
      items={VARIANTS}
      value={variant}
      onValueChange={(next) => setVariant(next as Variant)}
    >
      {VARIANTS.map((entry) => (
        <TabsContent key={entry.id} value={entry.id}>
          {/* Each tab mounts its own page, so every variant starts clean. */}
          <VariantPage variant={entry.id} />
        </TabsContent>
      ))}
    </SecondaryTabs>
  )
}

function VariantPage({ variant }: { variant: Variant }) {
  const state = useDraft()
  const [reviewing, setReviewing] = React.useState(false)

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault()
        if (state.dirty) setReviewing(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [state.dirty])

  const openReview = () => setReviewing(true)

  return (
    <div className="relative h-160 overflow-y-auto rounded-xl border">
      <div className="flex flex-col gap-4 p-4 pb-28">
        {variant === "header" ? (
          <HeaderVariant state={state} onReview={openReview} />
        ) : (
          <PageHeader
            title="Global prompts"
            description="Edit any prompt to see this variant."
          />
        )}

        {state.draft.map((prompt, index) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            edited={prompt.body !== state.saved[index].body}
            state={state}
            perCard={variant === "card"}
          />
        ))}
      </div>

      {variant === "pill" ? (
        <PillVariant state={state} onReview={openReview} />
      ) : null}
      {variant === "tray" ? (
        <TrayVariant state={state} onReview={openReview} />
      ) : null}
      {variant === "drawer" ? <DrawerVariant state={state} /> : null}

      <ReviewDialog
        open={reviewing}
        onOpenChange={setReviewing}
        state={state}
      />
    </div>
  )
}

function PromptCard({
  prompt,
  edited,
  state,
  perCard,
}: {
  prompt: Prompt
  edited: boolean
  state: Draft
  perCard: boolean
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{prompt.title}</span>
          <Badge className="bg-muted text-muted-foreground" variant="secondary">
            {prompt.language}
          </Badge>
          {edited ? (
            <span
              aria-label="Edited"
              className="size-2 rounded-full bg-primary"
            />
          ) : null}
          {/* Variant 3: the card is the unit of saving. */}
          {perCard && edited ? (
            <div className="ms-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => state.revert(prompt.id)}
              >
                Revert
              </Button>
              <Button size="sm" onClick={() => state.saveOne(prompt.id)}>
                Save
              </Button>
            </div>
          ) : null}
        </div>
        <Textarea
          aria-label={name(prompt)}
          dir="auto"
          rows={3}
          value={prompt.body}
          onChange={(event) => state.edit(prompt.id, event.target.value)}
        />
      </CardContent>
    </Card>
  )
}

/* --------------------------------------------------------------- variants */

/** 1. A small dark pill, bottom centre. Says how much, not a warning. */
function PillVariant({
  state,
  onReview,
}: {
  state: Draft
  onReview: () => void
}) {
  return (
    <div
      className={cn(
        "pointer-events-none sticky bottom-4 flex justify-center transition duration-200 ease-out-cubic motion-reduce:transition-none",
        state.dirty ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-xl bg-foreground py-1 ps-4 pe-1 text-background">
        <span className="me-2 text-sm tabular-nums">
          {count(state.changed.length)}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="text-background hover:bg-background/10 hover:text-background"
          onClick={state.discard}
        >
          Discard
        </Button>
        <Button
          size="sm"
          className="bg-background text-foreground hover:bg-background/90"
          onClick={onReview}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

/** 2. No bar: the page header carries the state and the two actions. */
function HeaderVariant({
  state,
  onReview,
}: {
  state: Draft
  onReview: () => void
}) {
  return (
    <PageHeader
      title="Global prompts"
      description="Edit any prompt to see this variant."
      aside={
        state.dirty ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground tabular-nums">
              {count(state.changed.length)}
            </span>
            <Button variant="ghost" onClick={state.discard}>
              Discard
            </Button>
            <Button onClick={onReview}>
              Save
              <Kbd>⌘S</Kbd>
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">All saved</span>
        )
      }
    />
  )
}

/**
 * 4. Docked under the content, full width of it. The change list folds out
 * of the tray, and each line can be put back on its own.
 */
function TrayVariant({
  state,
  onReview,
}: {
  state: Draft
  onReview: () => void
}) {
  if (!state.dirty) return null

  return (
    <div className="sticky bottom-0 border-t bg-background">
      <Collapsible>
        <div className="flex items-center gap-3 px-4 py-3">
          <CollapsibleTrigger asChild>
            <Button size="sm" variant="ghost">
              {count(state.changed.length)}
            </Button>
          </CollapsibleTrigger>
          <span className="truncate text-sm text-muted-foreground">
            {state.changed.map(name).join(", ")}
          </span>
          <div className="ms-auto flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={state.discard}>
              Discard all
            </Button>
            <Button size="sm" onClick={onReview}>
              Review and save
            </Button>
          </div>
        </div>
        <CollapsibleContent className="border-t px-4 py-2">
          {state.changed.map((prompt) => (
            <div
              key={prompt.id}
              className="flex items-center justify-between gap-3 py-1.5 text-sm"
            >
              <span>{name(prompt)}</span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => state.revert(prompt.id)}
              >
                Revert
              </Button>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

/**
 * 5. A slim bar whose only job is to open the review in a drawer: every
 * change with its diff and its own Revert, and Save at the foot.
 */
function DrawerVariant({ state }: { state: Draft }) {
  const [open, setOpen] = React.useState(false)
  const shown = state.dirty || open

  return (
    <>
      {shown ? (
        <div className="pointer-events-none sticky bottom-4 flex justify-end px-4">
          <Button
            className="pointer-events-auto"
            onClick={() => setOpen(true)}
            disabled={!state.dirty}
          >
            Review {count(state.changed.length)}
          </Button>
        </div>
      ) : null}

      <Drawer direction="right" open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="flex flex-row items-center justify-between gap-4 border-b">
            <DrawerTitle>{count(state.changed.length)}</DrawerTitle>
            <DrawerClose asChild>
              <Button aria-label="Close" size="icon-sm" variant="ghost">
                <CloseIcon />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
            {state.changed.map((prompt) => (
              <div key={prompt.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{name(prompt)}</span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => state.revert(prompt.id)}
                  >
                    Revert
                  </Button>
                </div>
                <LineDiff
                  before={
                    state.saved.find((item) => item.id === prompt.id)?.body ??
                    ""
                  }
                  after={prompt.body}
                />
              </div>
            ))}
          </div>
          <DrawerFooter className="flex-row justify-end border-t">
            <Button variant="ghost" onClick={state.discard}>
              Discard all
            </Button>
            <Button
              disabled={!state.dirty}
              onClick={() => {
                state.save()
                setOpen(false)
              }}
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

/* ----------------------------------------------------------------- review */

function ReviewDialog({
  open,
  onOpenChange,
  state,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: Draft
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Save {count(state.changed.length)}?</DialogTitle>
          <DialogDescription>
            These go live on every scenario that uses them.
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-96 flex-col gap-5 overflow-y-auto">
          {state.changed.map((prompt) => (
            <div key={prompt.id} className="flex flex-col gap-2">
              <span className="text-sm font-medium">{name(prompt)}</span>
              <LineDiff
                before={
                  state.saved.find((item) => item.id === prompt.id)?.body ?? ""
                }
                after={prompt.body}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep editing
          </Button>
          <Button
            onClick={() => {
              state.save()
              onOpenChange(false)
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type DiffLine = { kind: "same" | "removed" | "added"; text: string }

/** Line-level diff by longest common subsequence — prompts are short. */
function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n")
  const b = after.split("\n")
  const table = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0),
  )
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      table[i][j] =
        a[i] === b[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1])

  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ kind: "same", text: a[i] })
      i++
      j++
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      out.push({ kind: "removed", text: a[i++] })
    } else {
      out.push({ kind: "added", text: b[j++] })
    }
  }
  while (i < a.length) out.push({ kind: "removed", text: a[i++] })
  while (j < b.length) out.push({ kind: "added", text: b[j++] })
  return out
}

/** Unchanged lines stay muted; only what changed carries colour. */
function LineDiff({ before, after }: { before: string; after: string }) {
  return (
    <div className="overflow-hidden rounded-lg border text-xs">
      {diffLines(before, after).map((line, index) => (
        <div
          key={index}
          dir="auto"
          className={cn(
            "flex gap-2 px-3 py-1 whitespace-pre-wrap",
            line.kind === "removed" &&
              "bg-destructive-tint text-destructive-tint-foreground",
            line.kind === "added" &&
              "bg-success-tint text-success-tint-foreground",
            line.kind === "same" && "text-muted-foreground",
          )}
        >
          <span aria-hidden className="w-3 shrink-0 select-none">
            {line.kind === "removed" ? "−" : line.kind === "added" ? "+" : ""}
          </span>
          <span>{line.text}</span>
        </div>
      ))}
    </div>
  )
}
