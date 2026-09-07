"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NOW, type ConnectedApp } from "@/lib/connected-apps-data"

/**
 * Registering one of the organization's own systems.
 *
 * Two fields, because a connected app is only a place for tokens to belong to
 * — it holds no credentials of its own. Creating one lands the reader on its
 * empty token list, which is where the work actually starts.
 */
export function CreateAppDialog({
  onCreate,
  onOpenChange,
  open,
}: {
  onCreate: (app: ConnectedApp) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  function create() {
    onCreate({
      createdAt: NOW,
      createdBy: "Nawaf Al-Harbi",
      description: description.trim(),
      id: `app-${Date.now()}`,
      name: name.trim(),
    })
    setName("")
    setDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New connected app</DialogTitle>
          <DialogDescription>
            One of your own systems that calls Sarj. Its access tokens live
            under it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="app-name">Name</FieldLabel>
            <Input
              dir="auto"
              id="app-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Order status sync"
              value={name}
            />
            <FieldDescription>
              Name it after the system, not the team that owns it.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="app-description">Description</FieldLabel>
            <Textarea
              dir="auto"
              id="app-description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What it does with the calls it reads."
              rows={2}
              value={description}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="ghost">
            Cancel
          </Button>
          <Button disabled={name.trim().length === 0} onClick={create}>
            Create app
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
