"use client"

import * as React from "react"
import { toast } from "sonner"

import { AppShell } from "@/components/app-shell"
import { MockupShell } from "@/components/mockup-shell"
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
} from "@/lib/roles-permissions-data"
import { CreateRoleDialog } from "@/components/roles-permissions/create-role-dialog"
import { CreateRoleIcon } from "@/components/roles-permissions/icons"
import { RolesMatrix } from "@/components/roles-permissions/roles-matrix"
import { SaveChangesDialog } from "@/components/roles-permissions/save-changes-dialog"

/** Which chair the reviewer is sitting in. */
type Seat = "super-admin" | "org-admin"

/**
 * Roles and the permissions behind them — DES-170, from DIS-15 and the
 * Role-Based Access & Permissions PRD.
 *
 * Phase 1 has two halves. One is the split: `user` becomes call-only, `admin`
 * becomes a real org-level role, `superadmin` is unchanged — which this screen
 * both shows and edits. The other is that Sarj can make that change itself,
 * which is why the matrix is editable at all rather than a documentation page.
 *
 * The seat is a reviewer control rather than something to click into, because
 * you cannot become another role from inside the product — and the PRD's
 * fourth goal is about what the *other* seat sees. Flipping it changes the
 * sidebar as well as the page: an admin is handed eight superadmin destinations
 * today that bounce them straight back to the dashboard, and that gap is the
 * thing agent engineering actually ran into.
 */
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

  /** Cancel throws work away, so it asks first once there is work to throw. */
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
    /* The footer bar disappearing is not confirmation that anything saved,
       and this is the one action on the page that reaches other people. */
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

          {/* Fixed, not sticky, and not a card footer. 39 rows put a footer two
              screens below the row you just ticked — a save button nobody
              finds. `sticky` is no help either: the shell's scroll container
              never actually scrolls, so there is nothing to stick to. Pinned to
              the corner it is in reach from any row, and clear of the sidebar. */}
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
