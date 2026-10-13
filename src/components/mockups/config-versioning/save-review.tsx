"use client"

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
import { LineDiff } from "@/components/shared/line-diff"
import { CloseIcon } from "@/components/mockups/config-versioning/icons"
import type { Subject, Version } from "@/lib/mockups/config-versioning-data"

/**
 * DES-203's save review — what changed, line by line, then Save — with the
 * one fact versioning changes put at the top:
 *
 *  - Live scenario or global prompt: the save makes a version and callers
 *    keep hearing the live one. DES-203's "callers hear this from the next
 *    call" warning moves to publishing, where it is now true.
 *  - Not-live scenario: the save makes a version and that version runs.
 *
 * No version numbers here — the review names "the live version", not v12
 * (review, 13 Oct 2026). The concurrent-edit warning (PRD: "told a newer
 * version exists and that saving now will not include those changes") sits
 * above the diff, and the verb becomes Save anyway, the choice the PRD asks
 * the editor to make.
 */
export function SaveReview({
  open,
  onOpenChange,
  subject,
  base,
  draft,
  rival,
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
  onSave: () => void
  /** What a save means for callers on a live item, when something other
   *  than a publish puts it on calls — DES-204's approval. */
  liveLine?: string
}) {
  const newest = subject.versions[0]
  const changed = subject.fields.filter(
    (field) => draft[field.id] !== newest.body[field.id],
  )
  const live = subject.marker !== null

  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
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
          {rival ? (
            <Alert className="bg-warning-tint text-warning-tint-foreground">
              <AlertTitle>
                {rival.author} saved a newer version while you were editing
              </AlertTitle>
              <AlertDescription className="text-warning-tint-foreground">
                Saving now leaves out their change: “{rival.summary}” Both stay
                in history.
              </AlertDescription>
            </Alert>
          ) : null}

          <p className="text-sm text-muted-foreground">
            {base !== newest.n && !rival ? "From an older version. " : ""}
            {live
              ? (liveLine ??
                "Callers keep hearing the live version until you publish.")
              : "It runs from the next call."}
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
        </div>

        <DrawerFooter className="flex-row justify-end border-t">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button onClick={onSave}>{rival ? "Save anyway" : "Save"}</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
