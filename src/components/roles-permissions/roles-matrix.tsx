"use client"

import * as React from "react"

import { DataTableHead, DataTableHeaderRow } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  SECTIONS,
  type Permission,
  type PermissionId,
  type Role,
} from "@/lib/roles-permissions-data"
import {
  AllowedIcon,
  EditPermissionsIcon,
} from "@/components/roles-permissions/icons"

/**
 * Every permission the platform has, against every role that can hold it.
 *
 * One grid rather than a page per role, because the question this screen
 * answers is comparative — "what does an admin get that a caller does not" —
 * and the PRD's problem statement is that nobody could answer it without
 * reading source. Reading down a column tells you what a role is; reading
 * across a row tells you where the line sits.
 *
 * Only one column is editable at a time. The others stay as marks, so a change
 * is always made against the roles it has to stay distinct from.
 */
export function RolesMatrix({
  canEdit,
  draft,
  editingRoleId,
  grants,
  onStartEdit,
  onToggle,
  roles,
}: {
  canEdit: boolean
  /** The editing role's working set, before it is saved. */
  draft: PermissionId[]
  editingRoleId: string | null
  grants: Record<string, PermissionId[]>
  onStartEdit: (roleId: string) => void
  onToggle: (permission: PermissionId, granted: boolean) => void
  roles: Role[]
}) {
  function held(roleId: string): PermissionId[] {
    return roleId === editingRoleId ? draft : (grants[roleId] ?? [])
  }

  return (
    /* `--card-spacing: 0` rather than a padding override, the way the token
       table does it: the grid runs edge to edge, so the header band meets the
       card's own corners instead of floating in a strip of card behind it. The
       footer puts the spacing back for itself. */
    <Card className="[--card-spacing:0px]">
      <Table
        /* Cells keep their inset; the rules run the full width of the card.

           Fixed layout so the role columns hold their width when one of them
           turns into checkboxes — an auto table re-flows the whole grid on the
           first click, and a matrix that moves under you while you edit it is
           a matrix you stop trusting. */
        className="table-fixed [&_tbody_tr:last-child]:border-0 [&_td]:px-4 [&_th]:px-4"
      >
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Permission</DataTableHead>
            {roles.map((role) => (
              <RoleHead
                canEdit={canEdit && editingRoleId === null}
                held={held(role.id).length}
                key={role.id}
                onStartEdit={onStartEdit}
                role={role}
              />
            ))}
          </DataTableHeaderRow>
        </TableHeader>

        <TableBody>
          {SECTIONS.map((section, index) => (
            <React.Fragment key={section.id}>
              {/* Only where the rules change. The first 21 rows are the
                  default case and need no label — the band that matters is the
                  one saying "everything below here is platform tier", which is
                  also where the role names come back, two screens down from a
                  header that cannot be made sticky inside this card. */}
              {index > 0 ? (
                <DataTableHeaderRow>
                  <TableCell className="py-2 font-medium">
                    {section.label}
                  </TableCell>
                  {roles.map((role) => (
                    <TableCell className="py-2" key={role.id}>
                      <span className="text-xs text-muted-foreground">
                        {role.name}
                      </span>
                    </TableCell>
                  ))}
                </DataTableHeaderRow>
              ) : null}

              {PERMISSIONS[section.id].map((permission) => (
                <TableRow
                  className="transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none"
                  key={permission.id}
                >
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{permission.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {permission.id}
                      </span>
                    </div>
                  </TableCell>

                  {roles.map((role) => (
                    <GrantCell
                      editing={role.id === editingRoleId}
                      granted={held(role.id).includes(permission.id)}
                      key={role.id}
                      onToggle={onToggle}
                      permission={permission}
                      role={role}
                    />
                  ))}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

/**
 * A role's column head: what it is called, the role string the platform still
 * stores for it, how far it reaches, and how much of the taxonomy it holds.
 *
 * That last number is the PRD's opening argument in one line — three roles
 * that today resolve to 21, 21 and 39.
 */
function RoleHead({
  canEdit,
  held,
  onStartEdit,
  role,
}: {
  canEdit: boolean
  held: number
  onStartEdit: (roleId: string) => void
  role: Role
}) {
  return (
    /* `whitespace-normal` undoes the primitive's `nowrap`: with fixed column
       widths a role's line has to wrap rather than run past its cell. Every
       head is the same three lines — name, what it is for, what it holds — so
       the three titles land on one baseline instead of one of them wrapping
       under the padlock. */
    <TableHead className="w-64 align-top whitespace-normal">
      <div className="flex flex-col gap-0.5 py-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{role.name}</span>

          {role.locked ? (
            <Tooltip>
              <TooltipTrigger className="ms-auto text-xs font-normal text-muted-foreground">
                Locked
              </TooltipTrigger>
              <TooltipContent>
                Holds every permission, in every organization, so someone can
                always put one back together.
              </TooltipContent>
            </Tooltip>
          ) : null}

          {canEdit && !role.locked ? (
            <Button
              className="ms-auto"
              onClick={() => onStartEdit(role.id)}
              size="xs"
              variant="outline"
            >
              <EditPermissionsIcon />
              Edit
            </Button>
          ) : null}
        </div>

        {/* The role string the platform stores, and how much of the taxonomy
            this role holds. Support and engineering read a 403 against
            `admin`, not against "Org admin". */}
        <span className="text-xs font-normal text-muted-foreground tabular-nums">
          {role.legacy ? (
            <>
              <span className="font-mono">{role.legacy}</span> ·{" "}
            </>
          ) : null}
          {held} of {ALL_PERMISSIONS.length}
        </span>
      </div>
    </TableHead>
  )
}

/**
 * One role's answer for one permission.
 *
 * Static columns carry a mark or a dash and nothing else — 39 rows of the word
 * "Allowed" is a wall. The column being edited spells its state out next to
 * the box, because that is the moment someone is about to change access for a
 * few hundred people and a bare tick is one glance away from being misread.
 */
function GrantCell({
  editing,
  granted,
  onToggle,
  permission,
  role,
}: {
  editing: boolean
  granted: boolean
  onToggle: (permission: PermissionId, granted: boolean) => void
  permission: Permission
  role: Role
}) {
  if (editing) {
    return (
      <TableCell>
        <div className="flex items-center gap-2">
          <Checkbox
            aria-label={`${permission.id} for ${role.name}`}
            checked={granted}
            onCheckedChange={(checked) =>
              onToggle(permission.id, checked === true)
            }
          />
          <span
            className={cn(
              "text-sm",
              granted ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {granted ? "Allowed" : "Not allowed"}
          </span>
        </div>
      </TableCell>
    )
  }

  return (
    <TableCell>
      {granted ? <AllowedIcon className="size-4" /> : null}
      <span aria-hidden={granted} className="text-muted-foreground">
        {granted ? "" : "—"}
      </span>
      <span className="sr-only">{granted ? "Allowed" : "Not allowed"}</span>
    </TableCell>
  )
}
