"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Permission, Role } from "@/lib/roles-permissions-data"

/**
 * What a role change costs, before it costs it.
 *
 * A role edit is a bulk action wearing a checkbox: one tick moves access for
 * everyone holding that role, in every organization, with no per-person step
 * to catch it. So the confirmation is the diff and the headcount, not "are you
 * sure" — and it says plainly which of the changes the backend does not
 * enforce yet, because a permission nobody checks is a promise, not a control.
 */
export function SaveChangesDialog({
  granted,
  onConfirm,
  onOpenChange,
  open,
  revoked,
  role,
}: {
  granted: Permission[]
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  revoked: Permission[]
  role: Role | undefined
}) {
  if (!role) return null

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      {/* The primitive caps at `sm:max-w-sm` through a `data-[size]` variant,
          which outranks a plain utility — a diff of a dozen permission names
          needs the important modifier to get the room. */}
      <AlertDialogContent className="sm:max-w-lg!">
        <AlertDialogHeader>
          <AlertDialogTitle>Change what {role.name} can do?</AlertDialogTitle>
          <AlertDialogDescription>
            {role.people} people in {role.organizations} organizations hold this
            role.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="max-h-64">
          <div className="flex flex-col gap-3">
            {granted.length > 0 ? (
              <ChangeList heading="Gains" permissions={granted} />
            ) : null}
            {revoked.length > 0 ? (
              <ChangeList heading="Loses" permissions={revoked} />
            ) : null}
          </div>
        </ScrollArea>

        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Save changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ChangeList({
  heading,
  permissions,
}: {
  heading: string
  permissions: Permission[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{heading}</span>
      <ul className="flex flex-col gap-1 text-sm">
        {permissions.map((permission) => (
          <li key={permission.id}>{permission.label}</li>
        ))}
      </ul>
    </div>
  )
}
