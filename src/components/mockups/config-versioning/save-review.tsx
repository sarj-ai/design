"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LineDiff } from "@/components/shared/line-diff"
import { CloseIcon } from "@/components/mockups/config-versioning/icons"
import type { Subject, Version } from "@/lib/mockups/config-versioning-data"

export function SaveReview({
  open,
  onOpenChange,
  subject,
  base,
  draft,
  rival,
  failed = false,
  onSave,
  liveLine,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Subject
  /** The version the draft was edited from. */
  base: number
  draft: Record<string, string>
  /** A version someone else saved after this page loaded. */
  rival: Version | null
  failed?: boolean
  onSave: (note: string) => void
  liveLine?: string
}) {
  const [note, setNote] = React.useState("")
  const newest = subject.versions[0]
  const changed = subject.fields.filter(
    (field) => draft[field.id] !== newest.body[field.id],
  )

  return (
    <Drawer
      direction="right"
      onOpenChange={(next) => {
        if (!next) setNote("")
        onOpenChange(next)
      }}
      open={open}
    >
      <DrawerContent className="sm:max-w-md!">
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <DrawerTitle>
            {changed.length === 1
              ? "Review 1 change"
              : `Review ${changed.length} changes`}
          </DrawerTitle>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div
          className="flex flex-1 flex-col gap-5 overflow-y-auto p-4"
          data-vaul-no-drag
        >
          {failed ? (
            <Alert className="bg-destructive-tint" variant="destructive">
              <AlertTitle>Couldn’t save</AlertTitle>
              <AlertDescription>
                Nothing was written. Your changes are still here.
              </AlertDescription>
            </Alert>
          ) : rival ? (
            <Alert className="bg-warning-tint text-warning-tint-foreground">
              <AlertTitle>
                {rival.author} saved a newer version while you were editing
              </AlertTitle>
              <AlertDescription className="text-warning-tint-foreground">
                Saving now leaves out their change
                {rival.note ? `: “${rival.note}”` : ""}. Both stay in history.
              </AlertDescription>
            </Alert>
          ) : null}

          <p className="text-sm text-muted-foreground">
            {base !== newest.n && !rival ? "From an older version. " : ""}
            {subject.live
              ? (liveLine ??
                "Callers keep getting the version in use until you publish.")
              : "It’s in use from the next call."}
          </p>

          {changed.map((field) => (
            <div className="flex flex-col gap-2" key={field.id}>
              <span className="text-sm font-medium">{field.label}</span>
              <LineDiff
                after={draft[field.id]}
                before={newest.body[field.id]}
              />
            </div>
          ))}

          <Field>
            <FieldLabel htmlFor="save-note">
              Note
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id="save-note"
              maxLength={80}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Callback offer for low ratings"
              value={note}
            />
          </Field>
        </div>

        <DrawerFooter className="flex-row justify-end border-t">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            onClick={() => {
              onSave(note.trim())
            }}
          >
            {failed ? "Try again" : rival ? "Save anyway" : "Save"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
