"use client"

import * as React from "react"

import {
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
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
} from "@/lib/mockups/roles-permissions-data"
import {
  AllowedIcon,
  EditPermissionsIcon,
} from "@/components/mockups/roles-permissions/icons"

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
    /* `--card-spacing: 0` runs the grid to the card's edge; the footer restores its own spacing. */
    <Card className="[--card-spacing:0px]">
      <Table
        /* Fixed layout so role columns keep their width when one switches to checkboxes. */
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
    /* `whitespace-normal` undoes the primitive's `nowrap` so the head wraps in fixed columns. */
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
