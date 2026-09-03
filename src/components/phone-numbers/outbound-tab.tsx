"use client"

import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/data-table"
import {
  AssignIcon,
  DefaultTrunkIcon,
  OrganizationIcon,
  RowActionsIcon,
  UnassignIcon,
} from "@/components/phone-numbers/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TRUNKS, type TrunkRow } from "@/lib/phone-numbers-data"

const ASSIGNED_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

/* Defaults first, then the most-assigned, then alphabetical — the order the
   platform sorts them in. */
const SORTED = TRUNKS.toSorted((a, b) => {
  if (a.isGlobalDefault !== b.isGlobalDefault) return a.isGlobalDefault ? -1 : 1
  const assigned =
    b.assignedOrganizations.length - a.assignedOrganizations.length
  if (assigned !== 0) return assigned
  return a.sipTrunkId.localeCompare(b.sipTrunkId)
})

export function OutboundTab() {
  return (
    <DataTable>
      <TableHeader>
        <DataTableHeaderRow>
          <DataTableHead>Numbers</DataTableHead>
          <DataTableHead>Provider</DataTableHead>
          <DataTableHead>Usage &amp; assignments</DataTableHead>
          <DataTableHead>Assigned on</DataTableHead>
          <DataTableHead className="text-end">Actions</DataTableHead>
        </DataTableHeaderRow>
      </TableHeader>
      <TableBody>
        {SORTED.length === 0 ? (
          <TableRow>
            <TableCell
              className="text-center text-muted-foreground"
              colSpan={5}
            >
              No SIP trunks found.
            </TableCell>
          </TableRow>
        ) : (
          SORTED.map((trunk) => (
            <TableRow key={trunk.sipTrunkId}>
              {/* The trunk id under the numbers rather than beside them: it is
                  what you copy when something is wrong, and it is the only
                  thing that identifies a trunk carrying four numbers. */}
              <TableCell className="whitespace-nowrap">
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {trunk.numbers.slice(0, 3).join(" · ")}
                    {trunk.numbers.length > 3
                      ? ` +${trunk.numbers.length - 3}`
                      : ""}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {trunk.sipTrunkId}
                  </span>
                </span>
              </TableCell>
              <TableCell>{trunk.provider}</TableCell>
              <TableCell>
                <span className="flex flex-wrap items-center gap-2">
                  {trunk.isGlobalDefault ? (
                    <Badge
                      className="bg-primary-tint text-primary-tint-foreground"
                      variant="secondary"
                    >
                      Default
                    </Badge>
                  ) : null}
                  {trunk.assignedOrganizations.map((organization) => (
                    <Badge
                      className="bg-muted text-muted-foreground"
                      key={organization.id}
                      variant="secondary"
                    >
                      <OrganizationIcon />
                      {organization.name}
                    </Badge>
                  ))}
                  {trunk.isInUse ? null : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {trunk.createdAt === null
                  ? "—"
                  : ASSIGNED_FORMAT.format(new Date(trunk.createdAt))}
              </TableCell>
              <TableCell className="text-end">
                <TrunkRowActions trunk={trunk} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </DataTable>
  )
}

function TrunkRowActions({ trunk }: { trunk: TrunkRow }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Actions for trunk ${trunk.sipTrunkId}`}
          size="icon-sm"
          variant="ghost"
        >
          <RowActionsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Manage trunk</DropdownMenuLabel>
        <DropdownMenuItem>
          <AssignIcon />
          Assign to organization
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DefaultTrunkIcon />
          {trunk.isGlobalDefault ? "Remove as default" : "Set as default"}
        </DropdownMenuItem>
        {trunk.assignedOrganizations.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Unassign from</DropdownMenuLabel>
            {trunk.assignedOrganizations.map((organization) => (
              <DropdownMenuItem key={organization.id} variant="destructive">
                <UnassignIcon />
                {organization.name}
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
