"use client"

import * as React from "react"
import { toast } from "sonner"

import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  diffGrants,
  GRANTS,
  HIDDEN_NAV,
  ROLES,
  type PermissionId,
  type Role,
} from "@/lib/mockups/roles-permissions-data"
import { CreateRoleDialog } from "@/components/mockups/roles-permissions/create-role-dialog"
import { CreateRoleIcon } from "@/components/mockups/roles-permissions/icons"
import { RolesMatrix } from "@/components/mockups/roles-permissions/roles-matrix"
import { SaveChangesDialog } from "@/components/mockups/roles-permissions/save-changes-dialog"

type Seat = "super-admin" | "org-admin"

export default function RolesPermissionsPage() {
  const [seat, setSeat] = React.useState<Seat>("super-admin")
  const [roles, setRoles] = React.useState<Role[]>(ROLES)
  const [grants, setGrants] =
    React.useState<Record<string, PermissionId[]>>(GRANTS)
  const [editingRoleId, setEditingRoleId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<PermissionId[]>([])
  const [creating, setCreating] = React.useState(false)
  const [confirming, setConfirming] = React.useState(false)
  const [discarding, setDiscarding] = React.useState(false)

  const canEdit = seat === "super-admin"
  const editing = roles.find((role) => role.id === editingRoleId)
  const diff = editing
    ? diffGrants(grants[editing.id] ?? [], draft)
    : { granted: [], revoked: [] }
  const changes = diff.granted.length + diff.revoked.length

  function startEdit(roleId: string) {
    setEditingRoleId(roleId)
    setDraft([...(grants[roleId] ?? [])])
  }

  function cancelEdit() {
    setEditingRoleId(null)
    setDraft([])
    setDiscarding(false)
  }

  function requestCancel() {
    if (changes === 0) {
      cancelEdit()
      return
    }
    setDiscarding(true)
  }

  function toggle(permission: PermissionId, granted: boolean) {
    setDraft((current) =>
      granted
        ? [...current, permission]
        : current.filter((id) => id !== permission),
    )
  }

  function save() {
    if (!editing) return
    setGrants((current) => ({ ...current, [editing.id]: draft }))
    setConfirming(false)
    toast(`${editing.name} updated`, {
      description: `${editing.people} people in ${editing.organizations} organizations now have this access.`,
    })
    cancelEdit()
  }

  function createRole({
    name,
    permissions,
  }: {
    name: string
    permissions: PermissionId[]
  }) {
    const id = `role-${roles.length + 1}`
    setRoles((current) => [
      ...current,
      {
        id,
        name,
        legacy: null,
        people: 0,
        organizations: 0,
        locked: false,
      },
    ])
    setGrants((current) => ({ ...current, [id]: permissions }))
    setCreating(false)
    setEditingRoleId(id)
    setDraft(permissions)
  }

  return (
    <MockupShell
      actions={
        <>
          <span className="text-xs text-muted-foreground">Seat</span>
          <ToggleGroup
            onValueChange={(value) => {
              if (!value) return
              setSeat(value as Seat)
              cancelEdit()
            }}
            size="sm"
            type="single"
            value={seat}
            variant="outline"
          >
            <ToggleGroupItem value="super-admin">Super admin</ToggleGroupItem>
            <ToggleGroupItem value="org-admin">Org admin</ToggleGroupItem>
          </ToggleGroup>
        </>
      }
      eyebrow="Configuration"
      title="Design view-only role and permissions updates"
    >
      <AppShell
        active="Roles"
        hiddenItems={canEdit ? undefined : HIDDEN_NAV["org-admin"]}
      >
        <main className="flex flex-1 flex-col gap-6 p-3 lg:p-4">
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">Roles</h1>
              <p className="text-sm text-muted-foreground">
                {canEdit
                  ? "What each role can do, everywhere on the platform."
                  : "What each role in your organization can do. Sarj defines these."}
              </p>
            </div>

            {canEdit ? (
              <Button onClick={() => setCreating(true)}>
                <CreateRoleIcon />
                Create role
              </Button>
            ) : null}
          </header>

          <RolesMatrix
            canEdit={canEdit}
            draft={draft}
            editingRoleId={editingRoleId}
            grants={grants}
            onStartEdit={startEdit}
            onToggle={toggle}
            roles={roles}
          />

          {/* Fixed, not sticky: the shell's scroll container never scrolls, so there is nothing to stick to. */}
          {editing ? (
            <Card className="fixed end-6 bottom-6 z-sticky" size="sm">
              <CardContent className="flex items-center gap-2">
                <div className="flex shrink-0 items-center gap-2">
                  <Button onClick={requestCancel} size="sm" variant="ghost">
                    Cancel
                  </Button>
                  <Button
                    disabled={changes === 0}
                    onClick={() => setConfirming(true)}
                    size="sm"
                  >
                    Review changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </main>
      </AppShell>

      <CreateRoleDialog
        onCreate={createRole}
        onOpenChange={setCreating}
        open={creating}
      />

      <AlertDialog onOpenChange={setDiscarding} open={discarding}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Discard {changes} {changes === 1 ? "change" : "changes"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editing?.name} goes back to what it could do before you started.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={cancelEdit}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SaveChangesDialog
        granted={diff.granted}
        onConfirm={save}
        onOpenChange={setConfirming}
        open={confirming}
        revoked={diff.revoked}
        role={editing}
      />
    </MockupShell>
  )
}
