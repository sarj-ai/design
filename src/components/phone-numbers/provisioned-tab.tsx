"use client"

import * as React from "react"

import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/data-table"
import {
  NoNumbersIcon,
  RowActionsIcon,
  SearchIcon,
} from "@/components/phone-numbers/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  NUMBER_DIRECTION_LABELS,
  ORGANIZATIONS,
  PROVIDERS,
  PROVISIONED,
} from "@/lib/phone-numbers-data"

const ALL = "all"

const REGISTERED_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

export function ProvisionedTab() {
  const [organization, setOrganization] = React.useState(ALL)
  const [provider, setProvider] = React.useState(ALL)
  const [ownedOnly, setOwnedOnly] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const query = search.trim().toLowerCase()
  const hasFilters =
    organization !== ALL || provider !== ALL || ownedOnly || query !== ""

  const rows = PROVISIONED.filter((row) => {
    const organizationName =
      ORGANIZATIONS.find((item) => item.id === organization)?.name ?? null
    const providerName =
      PROVIDERS.find((item) => item.id === provider)?.name ?? null
    return (
      (organization === ALL || row.organizationName === organizationName) &&
      (provider === ALL || row.providerName === providerName) &&
      (!ownedOnly || row.isClientOwned) &&
      (query === "" ||
        row.phoneNumber.toLowerCase().includes(query) ||
        (row.organizationName ?? "").toLowerCase().includes(query))
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm">Register number</Button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pn-organization">Organization</Label>
            <Select onValueChange={setOrganization} value={organization}>
              <SelectTrigger className="w-50" id="pn-organization" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All organizations</SelectItem>
                {ORGANIZATIONS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pn-provider">Provider</Label>
            <Select onValueChange={setProvider} value={provider}>
              <SelectTrigger className="w-50" id="pn-provider" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All providers</SelectItem>
                {PROVIDERS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex h-8 items-center gap-2">
            <Checkbox
              checked={ownedOnly}
              id="pn-owned-only"
              onCheckedChange={(checked) => {
                setOwnedOnly(checked === true)
              }}
            />
            <Label className="cursor-pointer" htmlFor="pn-owned-only">
              Client owned only
            </Label>
          </div>
        </div>

        <InputGroup className="w-full sm:w-72">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search provisioned numbers"
            onChange={(event) => {
              setSearch(event.target.value)
            }}
            placeholder="Search number or organization…"
            value={search}
          />
        </InputGroup>
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NoNumbersIcon />
            </EmptyMedia>
            <EmptyTitle>
              {hasFilters
                ? "No matching numbers"
                : "No provisioned numbers yet"}
            </EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? "No provisioned numbers match the current filters. Try clearing them."
                : "Provisioned numbers will appear here once they are added."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable>
          <TableHeader>
            <DataTableHeaderRow>
              <DataTableHead>Number</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead>Organization</DataTableHead>
              <DataTableHead>Connection</DataTableHead>
              <DataTableHead>Provider / trunk</DataTableHead>
              <DataTableHead>Direction</DataTableHead>
              <DataTableHead>Owned</DataTableHead>
              <DataTableHead>Scenario</DataTableHead>
              <DataTableHead>Registered</DataTableHead>
              <DataTableHead>
                <span className="sr-only">Actions</span>
              </DataTableHead>
            </DataTableHeaderRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.provisionedNumberId}>
                <TableCell className="font-medium whitespace-nowrap">
                  {row.phoneNumber}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      row.status === "active"
                        ? "bg-success-tint text-success-tint-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                    variant="secondary"
                  >
                    {row.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.organizationName ?? (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {row.connectionLabel === null ? (
                    <span className="text-muted-foreground">Not linked</span>
                  ) : (
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span className="underline underline-offset-4">
                        Linked
                      </span>
                      {row.connectionPending ? (
                        <Badge
                          className="bg-warning-tint text-warning-tint-foreground"
                          variant="secondary"
                        >
                          Pending
                        </Badge>
                      ) : null}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="flex flex-col gap-0.5">
                    <span>{row.providerName}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {row.sipTrunkId}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge
                    className="bg-muted text-muted-foreground"
                    variant="secondary"
                  >
                    {NUMBER_DIRECTION_LABELS[row.direction]}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge
                    className={
                      row.isClientOwned
                        ? "bg-primary-tint text-primary-tint-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                    variant="secondary"
                  >
                    {row.ownershipLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.scenarioName ?? (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {REGISTERED_FORMAT.format(new Date(row.registeredAt))}
                </TableCell>
                <TableCell className="text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={`Actions for ${row.phoneNumber}`}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <RowActionsIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Manage number</DropdownMenuLabel>
                      <DropdownMenuItem>Change organization</DropdownMenuItem>
                      <DropdownMenuItem>Change allocation</DropdownMenuItem>
                      <DropdownMenuItem>Manage outbound</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        {row.connectionLabel === null
                          ? "Link connection"
                          : "Unlink connection"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      )}
    </div>
  )
}
