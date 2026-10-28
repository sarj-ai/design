"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ActionTile } from "@/components/shared/page-header"
import {
  AddFilesIcon,
  AddTextIcon,
  AddUrlIcon,
} from "@/components/mockups/knowledge-base/icons"

export type AddKind = "files" | "url" | "text"

export function AddSources({ onOpen }: { onOpen: (kind: AddKind) => void }) {
  return (
    <>
      <ActionTile
        icon={<AddFilesIcon />}
        label="Add files"
        onClick={() => onOpen("files")}
      />
      <ActionTile
        icon={<AddUrlIcon />}
        label="Add a URL"
        onClick={() => onOpen("url")}
      />
      <ActionTile
        icon={<AddTextIcon />}
        label="Add text"
        onClick={() => onOpen("text")}
      />
    </>
  )
}

export function AddSourceDialog({
  kind,
  onOpenChange,
  onAdd,
}: {
  kind: AddKind | null
  onOpenChange: (open: boolean) => void
  onAdd: (
    kind: AddKind,
    source: { name: string; url?: string; body?: string },
  ) => void
}) {
  const [url, setUrl] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")

  const isUrl = kind === "url"

  const ready = Boolean(title.trim() && (isUrl ? url.trim() : body.trim()))

  function submit() {
    if (!kind || !ready) return
    onAdd(kind, {
      name: title.trim(),
      url: isUrl ? url.trim() : undefined,
      body: isUrl ? undefined : body.trim(),
    })
    setUrl("")
    setTitle("")
    setBody("")
    onOpenChange(false)
  }

  return (
    <Dialog
      open={kind === "url" || kind === "text"}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isUrl ? "Add a URL" : "Add text"}</DialogTitle>
          <DialogDescription>
            {isUrl
              ? "The page is fetched once and its text kept. Linked pages aren't followed."
              : "Goes in as-is. Nothing is extracted, so it's usable straight away."}
          </DialogDescription>
        </DialogHeader>

        {isUrl ? (
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="add-url">Page address</FieldLabel>
              <Input
                id="add-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://sarj.ai/help/late-payment-fees"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="add-title">Title</FieldLabel>
              <Input
                id="add-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Late payment fees"
              />
            </Field>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="add-title">Title</FieldLabel>
              <Input
                id="add-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Escalation wording"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="add-body">Content</FieldLabel>
              <Textarea
                id="add-body"
                rows={6}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Paste or type what the agent should know."
              />
            </Field>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!ready}>
            Add to knowledge base
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
