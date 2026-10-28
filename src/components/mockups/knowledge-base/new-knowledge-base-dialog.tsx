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

export function NewKnowledgeBaseDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = React.useState("")

  const ready = Boolean(name.trim())
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
