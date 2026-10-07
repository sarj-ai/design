"use client"

import * as React from "react"
import { toast } from "sonner"

import { FieldHint } from "@/components/design-system/field-hint"
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
  CreateOrganizationIcon,
  SearchListIcon,
} from "@/components/mockups/org-access/icons"
import { ORGANIZATIONS, type Organization } from "@/lib/mockups/org-access-data"

/**
 * Sarj's list of organizations, with who owns each one.
 *
 * Owner is the column this ticket adds. Migration leaves every existing
 * organization without one until Sarj names it, so "No owner" with Set owner
 * beside it is the migration pass, done row by row from the list Sarj already
 * works in. Zain KSA and Yaqoot both carry sa.zain.com: a domain grants
 * nothing now, so sharing one needs no special state.
 */
export function OrganizationsView({
  onOpen,
}: {
  onOpen: (name: string) => void
}) {
  const [orgs, setOrgs] = React.useState(ORGANIZATIONS)
  const [query, setQuery] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [owning, setOwning] = React.useState<Organization | null>(null)

  const needle = query.trim().toLowerCase()
  const shown = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(needle) ||
      o.domain.toLowerCase().includes(needle),
  )

  return (
    <div className="flex flex-col gap-6 p-3 lg:p-4">
      <PageHeader title="Organizations" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <InputGroup className="flex-1">
            <InputGroupAddon>
              <SearchListIcon />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search organizations"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or domain"
              value={query}
            />
          </InputGroup>
          <Button onClick={() => setCreating(true)}>
            <CreateOrganizationIcon />
            Create organization
          </Button>
        </div>

        <DataTable>
          <TableHeader>
            <DataTableHeaderRow>
              <DataTableHead>Organization</DataTableHead>
              <DataTableHead>Domain</DataTableHead>
              <DataTableHead>Owner</DataTableHead>
              <DataTableHead className="text-end">Members</DataTableHead>
            </DataTableHeaderRow>
          </TableHeader>
          <TableBody>
            {shown.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <Button
                    className="-ms-2.5"
                    onClick={() => onOpen(org.name)}
                    variant="link"
                  >
                    {org.name}
                  </Button>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {org.domain || "—"}
                </TableCell>
                <TableCell className="py-1.5">
                  {org.owner === null ? (
                    <div className="flex items-center gap-3">
                      <span className="text-warning">No owner</span>
                      <Button
                        onClick={() => setOwning(org)}
                        size="xs"
                        variant="outline"
                      >
                        Set owner
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{org.owner}</span>
                      {org.ownerPending ? (
                        <Badge variant="outline">Invited</Badge>
                      ) : null}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  {org.members}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      </div>

      <CreateOrganizationDialog
        onCreate={(org) => {
          setOrgs((current) => [org, ...current])
          toast.success(`${org.name} created`, {
            description: `Owner invite sent to ${org.owner}`,
          })
        }}
        onOpenChange={setCreating}
        open={creating}
        orgs={orgs}
      />

      <SetOwnerDialog
        key={owning?.id ?? "none"}
        onOpenChange={(open) => (open ? null : setOwning(null))}
        onSet={(org, owner) => {
          setOrgs((current) =>
            current.map((o) => (o.id === org.id ? { ...o, owner } : o)),
          )
          toast.success(`${owner} is now the owner of ${org.name}`)
        }}
        org={owning}
      />
    </div>
  )
}

/**
 * The one flow the doc gives Sarj: name the organization, record its domain,
 * name its owner. The owner gets an invite; nobody else is added here.
 *
 * The domain is optional — a client on personal addresses has none — and is
 * explained once, behind the (i): it is a record, not a gate. A domain that
 * another organization already carries is said plainly under the field, since
 * that is the moment Sarj might be about to make a duplicate by mistake.
 */
function CreateOrganizationDialog({
  open,
  onOpenChange,
  orgs,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgs: Organization[]
  onCreate: (org: Organization) => void
}) {
  const [name, setName] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const [owner, setOwner] = React.useState("")
  const [checked, setChecked] = React.useState(false)

  const cleanDomain = domain.trim().toLowerCase()
  const sharing = cleanDomain
    ? orgs.filter((o) => o.domain === cleanDomain).map((o) => o.name)
    : []
  const nameError = name.trim() ? null : "Enter a name"
  const ownerError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.trim())
    ? null
    : "Enter the owner's email"

  const close = (next: boolean) => {
    if (!next) {
      setName("")
      setDomain("")
      setOwner("")
      setChecked(false)
    }
    onOpenChange(next)
  }

  const create = () => {
    setChecked(true)
    if (nameError || ownerError) return
    onCreate({
      id: `o${Date.now()}`,
      name: name.trim(),
      domain: cleanDomain,
      owner: owner.trim().toLowerCase(),
      ownerPending: true,
      members: 0,
    })
    close(false)
  }

  return (
    <Dialog onOpenChange={close} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            create()
          }}
        >
          <FieldGroup>
            <Field data-invalid={checked && nameError ? true : undefined}>
              <FieldLabel htmlFor="org-name">Name</FieldLabel>
              <Input
                aria-invalid={checked && nameError ? true : undefined}
                autoFocus
                id="org-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Zain Business"
                value={name}
              />
              {checked && nameError ? (
                <FieldError>{nameError}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldHint
                hint="Optional, and kept for reference only. It gives no one access, and other organizations can use it too."
                htmlFor="org-domain"
              >
                Domain
              </FieldHint>
              <Input
                id="org-domain"
                onChange={(event) => setDomain(event.target.value)}
                placeholder="sa.zain.com"
                value={domain}
              />
              {sharing.length > 0 ? (
                <FieldDescription>
                  Also used by {sharing.join(" and ")}
                </FieldDescription>
              ) : null}
            </Field>
            <Field data-invalid={checked && ownerError ? true : undefined}>
              <FieldLabel htmlFor="org-owner">Owner’s email</FieldLabel>
              <Input
                aria-invalid={checked && ownerError ? true : undefined}
                id="org-owner"
                onChange={(event) => setOwner(event.target.value)}
                placeholder="name@company.com"
                type="email"
                value={owner}
              />
              {checked && ownerError ? (
                <FieldError>{ownerError}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              onClick={() => close(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit">Create organization</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * The migration pass for one organization: pick its owner from the people
 * already in it. An owner is an Org Admin, so picking someone who is not one
 * says so before it happens.
 */
function SetOwnerDialog({
  org,
  onOpenChange,
  onSet,
}: {
  org: Organization | null
  onOpenChange: (open: boolean) => void
  onSet: (org: Organization, owner: string) => void
}) {
  const [picked, setPicked] = React.useState("")
  const candidates = org?.candidates ?? []
  const choice = candidates.find((c) => c.name === picked)

  return (
    <Dialog onOpenChange={onOpenChange} open={org !== null}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set owner of {org?.name}</DialogTitle>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="owner-pick">Owner</FieldLabel>
          <Select onValueChange={setPicked} value={picked}>
            <SelectTrigger id="owner-pick">
              <SelectValue placeholder="Choose a member" />
            </SelectTrigger>
            <SelectContent position="popper">
              {candidates.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                  <span className="text-muted-foreground">{c.group}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {choice && choice.group !== "Org Admin" ? (
            <FieldDescription>
              {choice.name} moves from {choice.group} to Org Admin.
            </FieldDescription>
          ) : null}
        </Field>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={!choice}
            onClick={() => {
              if (org && choice) onSet(org, choice.name)
              onOpenChange(false)
            }}
          >
            Set owner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
