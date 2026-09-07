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
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { GRANTS, ROLES, type PermissionId } from "@/lib/roles-permissions-data"

/**
 * A new role, which Phase 1 gives Sarj without an engineering release.
 *
 * It starts from an existing role rather than from nothing, because every real
 * role Sarj has asked for so far has been "an org admin who cannot do one
 * thing" — starting empty means ticking twenty-five boxes to get back to where
 * you meant to start.
 */
export function CreateRoleDialog({
  onCreate,
  onOpenChange,
  open,
}: {
  onCreate: (role: { name: string; permissions: PermissionId[] }) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const [name, setName] = React.useState("")
  const [startFrom, setStartFrom] = React.useState("org-admin")

  function reset() {
    setName("")
    setStartFrom("org-admin")
  }

  function submit() {
    onCreate({
      name: name.trim(),
      permissions: startFrom === "blank" ? [] : [...(GRANTS[startFrom] ?? [])],
    })
    reset()
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
      open={open}
    >
      {/* Same 512px as the save dialog — the two are a pair, and the
          primitive's `sm:max-w-sm` is the same width the diff was cramped in. */}
      <DialogContent className="sm:max-w-lg!">
        <DialogHeader>
          <DialogTitle>Create a role</DialogTitle>
          <DialogDescription>
            A role is defined once and applies in every organization.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="role-name">Name</FieldLabel>
            <Input
              id="role-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Support"
              value={name}
            />
          </Field>

          <Field>
            {/* FieldTitle, not FieldLabel: a radio group has no single id. */}
            <FieldTitle>Start from</FieldTitle>
            <RadioGroup
              className="gap-2"
              onValueChange={setStartFrom}
              value={startFrom}
            >
              {ROLES.filter((role) => !role.locked).map((role) => (
                <FieldLabel htmlFor={`start-${role.id}`} key={role.id}>
                  <Field orientation="horizontal">
                    <FieldTitle>
                      {role.name} · {GRANTS[role.id]?.length ?? 0} permissions
                    </FieldTitle>
                    <RadioGroupItem id={`start-${role.id}`} value={role.id} />
                  </Field>
                </FieldLabel>
              ))}
              <FieldLabel htmlFor="start-blank">
                <Field orientation="horizontal">
                  <FieldTitle>Nothing · 0 permissions</FieldTitle>
                  <RadioGroupItem id="start-blank" value="blank" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </Field>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button disabled={name.trim().length === 0} onClick={submit}>
            Create and edit permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
