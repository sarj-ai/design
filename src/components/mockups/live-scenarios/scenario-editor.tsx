"use client"

import * as React from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EditorHeader } from "@/components/mockups/live-scenarios/editor-header"
import { LineDiff } from "@/components/shared/line-diff"
import { CloseReviewIcon } from "@/components/mockups/live-scenarios/icons"
import {
  PROMPT_FIELDS,
  type EditorCase,
  type LiveRecord,
  type PromptField,
} from "@/lib/mockups/live-scenarios-data"

/**
 * The scenario editor, cut to what DES-203 changes: the Live switch at the
 * top of the page (editor-header.tsx), and the save review, which on a live
 * scenario is the warning.
 *
 * Why the warning lives in the review and not in its own dialog: the product
 * already stops every save on a review of what changed. A live scenario adds
 * one fact to that step — callers hear this from the next call — so it says
 * that there and renames the verb. No extra click, and nothing to suppress:
 * a "don't show again" would switch off the only thing Live is for.
 *
 * Save is the one door the warning guards (it also carries Import and the
 * AI notes, since both only fill the form). Delete is not: the TDD leaves
 * deleting a live scenario to a later release, and today a deleted
 * scenario is only archived and still answers calls (TDD 7), so a warning
 * that callers stop reaching it would be untrue. Delete works as on any
 * scenario: it moves to Recently deleted, with Undo.
 */
export function ScenarioEditor({ editorCase }: { editorCase: EditorCase }) {
  const [live, setLive] = React.useState<LiveRecord | null>(editorCase.live)
  const [pending, setPending] = React.useState(false)
  /* The goes-live case: true once the review has found that someone else
     turned the scenario live after this page loaded. */
  const [liveChangedUnderUs, setLiveChangedUnderUs] = React.useState(false)

  const [saved, setSaved] = React.useState(PROMPT_FIELDS)
  const [draft, setDraft] = React.useState(PROMPT_FIELDS)
  const [reviewing, setReviewing] = React.useState(false)

  const changed = draft.filter(
    (field, index) => field.body !== saved[index].body,
  )
  const dirty = changed.length > 0

  function flipLive(on: boolean) {
    setPending(true)
    window.setTimeout(() => {
      setPending(false)
      if (editorCase.toggleFails) {
        toast.error(on ? "Couldn't turn live on" : "Couldn't turn live off", {
          description: "Nothing changed. Try again.",
          action: { label: "Retry", onClick: () => flipLive(on) },
        })
        return
      }
      const before = live
      const next = on ? { by: "You", at: "just now" } : null
      setLive(next)
      toast(
        on
          ? `${editorCase.scenario} is live`
          : `${editorCase.scenario} is no longer live`,
        {
          description: on
            ? "Saving now asks before a change reaches callers."
            : "Saving applies straight away, without the warning.",
          action: { label: "Undo", onClick: () => setLive(before) },
        },
      )
    }, 700)
  }

  function openReview() {
    if (editorCase.turnedLiveElsewhere && !live) {
      setLive(editorCase.turnedLiveElsewhere)
      setLiveChangedUnderUs(true)
    }
    setReviewing(true)
  }

  function save() {
    setSaved(draft)
    setReviewing(false)
    toast.success(live ? "Saved to the live scenario" : "Saved", {
      description: live ? "The next call uses these changes." : undefined,
    })
  }

  function discard() {
    const before = draft
    setDraft(saved)
    toast("Changes discarded", {
      action: { label: "Undo", onClick: () => setDraft(before) },
    })
  }

  function remove() {
    toast(`${editorCase.scenario} moved to Recently deleted`, {
      action: { label: "Undo", onClick: () => {} },
    })
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8 pb-28">
      <EditorHeader
        scenario={editorCase.scenario}
        live={live}
        pending={pending}
        canToggle={editorCase.canToggle}
        onToggle={flipLive}
        onDelete={remove}
      />

      <FieldGroup>
        {draft.map((field, index) => (
          <PromptField
            key={field.id}
            field={field}
            onChange={(body) =>
              setDraft((current) =>
                current.map((item, i) =>
                  i === index ? { ...item, body } : item,
                ),
              )
            }
          />
        ))}
      </FieldGroup>

      {dirty ? (
        <Card className="sticky bottom-4" size="sm">
          <CardContent className="flex items-center gap-3">
            <span className="text-sm tabular-nums">
              {changed.length === 1 ? "1 change" : `${changed.length} changes`}
            </span>
            <div className="ms-auto flex items-center gap-2">
              <Button variant="ghost" onClick={discard}>
                Discard
              </Button>
              <Button onClick={openReview}>Review and save</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <SaveReview
        open={reviewing}
        onOpenChange={setReviewing}
        scenario={editorCase.scenario}
        live={live}
        liveChangedUnderUs={liveChangedUnderUs}
        changed={changed}
        saved={saved}
        onSave={save}
      />
    </main>
  )
}

/**
 * A prompt field as the editor's Scenario tab has it: the first message is
 * one line, the instruction prompt grows with what it holds. No card around
 * either — a bordered field inside a ringed card was a box in a box.
 */
function PromptField({
  field,
  onChange,
}: {
  field: PromptField
  onChange: (body: string) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
      {field.id === "first-message" ? (
        <Input
          id={field.id}
          dir="auto"
          value={field.body}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Textarea
          id={field.id}
          dir="auto"
          value={field.body}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  )
}

/**
 * The save review: what changed, line by line, and Save. On a live scenario
 * the top of it says so and the verb becomes Save to live; on any other
 * scenario it is the review the product already has.
 */
function SaveReview({
  open,
  onOpenChange,
  scenario,
  live,
  liveChangedUnderUs,
  changed,
  saved,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenario: string
  live: LiveRecord | null
  liveChangedUnderUs: boolean
  changed: PromptField[]
  saved: PromptField[]
  onSave: () => void
}) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-md!">
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <DrawerTitle>
            {changed.length === 1
              ? "Review 1 change"
              : `Review ${changed.length} changes`}
          </DrawerTitle>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseReviewIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
          {live ? (
            <Alert>
              <AlertTitle>{scenario} is live</AlertTitle>
              <AlertDescription>
                {liveChangedUnderUs
                  ? `${live.by} turned it live at ${live.at.split(", ")[1]}, after you opened it. Saving changes what callers hear from the next call.`
                  : "Saving changes what callers hear from the next call."}
              </AlertDescription>
            </Alert>
          ) : null}

          {changed.map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
              <span className="text-sm font-medium">{field.label}</span>
              <LineDiff
                before={saved.find((item) => item.id === field.id)?.body ?? ""}
                after={field.body}
              />
            </div>
          ))}
        </div>

        <DrawerFooter className="flex-row justify-end border-t">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button onClick={onSave}>{live ? "Save to live" : "Save"}</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
