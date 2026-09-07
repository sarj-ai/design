"use client"

import * as React from "react"
import Link from "next/link"

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

/**
 * Creating a knowledge base.
 *
 * The name is the only thing asked for up front — it is what the index lists
 * and what someone picks from when attaching a knowledge base to an agent.
 * What it covers and what goes in it are written inside it, on a screen that
 * has room for both, so asking for them here would only split one job in two.
 */
export function NewKnowledgeBaseDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = React.useState("")

  const ready = Boolean(name.trim())
  /* The new knowledge base opens on its own screen, carrying the name that was
     just typed — there is nothing to look at on the index until content is in
     it. */
  const href = `/knowledge-base/empty?name=${encodeURIComponent(name.trim())}`

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setName("")
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New knowledge base</DialogTitle>
          <DialogDescription>
            Name it now. What it covers and what goes in it come next.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="new-kb-name">Name</FieldLabel>
          <Input
            id="new-kb-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Quara Collections Handbook"
          />
        </Field>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {ready ? (
            <Button asChild>
              <Link href={href}>Create</Link>
            </Button>
          ) : (
            <Button disabled>Create</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
