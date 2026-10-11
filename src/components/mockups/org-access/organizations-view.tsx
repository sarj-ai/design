"use client"

import * as React from "react"
import { toast } from "sonner"

import { FieldHint } from "@/components/design-system/field-hint"
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import { ChoiceFilter, FilterBar } from "@/components/shared/filter-bar"
import { PageHeader } from "@/components/shared/page-header"
import { PrimaryTabs } from "@/components/design-system/tabs-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
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
import { TabsContent } from "@/components/ui/tabs"
import {
  CopyIdIcon,
  CreateOrganizationIcon,
  OrganizationsTabIcon,
  SearchListIcon,
  UnassignedUsersIcon,
} from "@/components/mockups/org-access/icons"
import {
  GROUPS,
  ORGANIZATIONS,
  UNASSIGNED_USERS,
  type Organization,
  type UnassignedUser,
} from "@/lib/mockups/org-access-data"

/**
 * Sarj's admin Organizations page, as the platform ships it, with who owns
 * each organization added.
 *
 * Everything but Owner and Members is the platform's page today: the two
 * views, Create user beside Create organization, the Settings filter, and the
 * ID, domain, data retention and settings columns. Owner is the column this
 * ticket adds. Migration leaves every existing organization without one until
 * Sarj names it, so "No owner" with Set owner beside it is the migration pass,
 * done row by row from the list Sarj already works in. Zain KSA and Yaqoot
 * both carry sa.zain.com: a domain grants nothing now, so sharing one needs no
 * special state.
 */
export function OrganizationsView({
  onOpen,
}: {
  onOpen: (name: string) => void
}) {
  const [orgs, setOrgs] = React.useState(ORGANIZATIONS)
  const [users, setUsers] = React.useState(UNASSIGNED_USERS)
  const [view, setView] = React.useState("organizations")
  const [query, setQuery] = React.useState("")
  const [settings, setSettings] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [creatingUser, setCreatingUser] = React.useState(false)
  const [owning, setOwning] = React.useState<Organization | null>(null)

  const needle = query.trim().toLowerCase()
  const shownOrgs = orgs.filter(
    (o) =>
      (o.name.toLowerCase().includes(needle) ||
        o.domain.toLowerCase().includes(needle)) &&
      (settings === null || o.customSettings === (settings === "custom")),
  )
  const shownUsers = users.filter((u) => u.email.includes(needle))

  return (
    <div className="flex flex-col gap-4 p-3 lg:p-4">
      <PageHeader title="Organizations" />

      <PrimaryTabs
        items={[
          {
            id: "organizations",
            label: "Organizations",
            Icon: OrganizationsTabIcon,
          },
          {
            id: "users",
            label: `Unassigned users (${users.length})`,
            Icon: UnassignedUsersIcon,
          },
        ]}
        onValueChange={setView}
        value={view}
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="min-w-64 flex-1">
              <InputGroupAddon>
                <SearchListIcon />
              </InputGroupAddon>
              <InputGroupInput
                aria-label={
                  view === "users"
                    ? "Search unassigned users by email"
                    : "Search organizations by name or domain"
                }
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  view === "users"
                    ? "Search by email..."
                    : "Search by name or domain..."
                }
                value={query}
              />
            </InputGroup>
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreatingUser(true)} variant="outline">
                Create user
              </Button>
              <Button onClick={() => setCreating(true)}>
                <CreateOrganizationIcon />
                Create organization
              </Button>
            </div>
          </div>

          {view === "organizations" ? (
            <FilterBar activeCount={settings ? 1 : 0}>
              <ChoiceFilter
                field="Settings"
                onChange={setSettings}
                options={SETTINGS_OPTIONS}
                value={settings}
              />
            </FilterBar>
          ) : null}
        </div>

        <TabsContent value="organizations">
          <DataTable>
            <TableHeader>
              <DataTableHeaderRow>
                <DataTableHead className="w-32">ID</DataTableHead>
                <DataTableHead>Name</DataTableHead>
                <DataTableHead>Domain</DataTableHead>
                <DataTableHead>Owner</DataTableHead>
                <DataTableHead>Data retention</DataTableHead>
                <DataTableHead>Settings</DataTableHead>
                <DataTableHead className="text-end">Members</DataTableHead>
              </DataTableHeaderRow>
            </TableHeader>
            <TableBody>
              {shownOrgs.map((org) => (
                <TableRow
                  className="cursor-pointer"
                  key={org.id}
                  onClick={() => onOpen(org.name)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    <span
                      className="inline-flex items-center gap-1"
                      title={org.id}
                    >
                      {org.id.slice(0, 8)}
                      <Button
                        aria-label={`Copy ID of ${org.name}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          void navigator.clipboard.writeText(org.id)
                          toast("Copied organization ID")
                        }}
                        size="icon-xs"
                        variant="ghost"
                      >
                        <CopyIdIcon />
                      </Button>
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    {org.domain ? (
                      <Badge className="bg-muted text-muted-foreground">
                        {org.domain}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-1.5">
                    {org.owner === null ? (
                      <div className="flex items-center gap-3">
                        <span className="text-warning">No owner</span>
                        <Button
                          onClick={(event) => {
                            event.stopPropagation()
                            setOwning(org)
                          }}
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
                  <TableCell className="text-muted-foreground">
                    {org.retention}
                  </TableCell>
                  <TableCell>
                    {org.customSettings ? (
                      <Badge className="bg-primary-tint text-primary-tint-foreground">
                        Custom
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground">
                        Global
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {org.members}
                  </TableCell>
                </TableRow>
              ))}
              {shownOrgs.length === 0 ? (
                <NoResults
                  colSpan={7}
                  noun="organizations"
                  onClear={() => {
                    setQuery("")
                    setSettings(null)
                  }}
                  query={query}
                />
              ) : null}
            </TableBody>
          </DataTable>
        </TabsContent>

        <TabsContent value="users">
          <DataTable>
            <TableHeader>
              <DataTableHeaderRow>
                <DataTableHead className="w-28">ID</DataTableHead>
                <DataTableHead>Email</DataTableHead>
                <DataTableHead>Role</DataTableHead>
                <DataTableHead>Add to organization</DataTableHead>
                <DataTableHead>Impersonate</DataTableHead>
              </DataTableHeaderRow>
            </TableHeader>
            <TableBody>
              {shownUsers.map((user) => (
                <UnassignedUserRow
                  key={user.id}
                  onAdd={(orgId) => {
                    const org = orgs.find((o) => o.id === orgId)
                    if (!org) return
                    setUsers((current) =>
                      current.filter((u) => u.id !== user.id),
                    )
                    setOrgs((current) =>
                      current.map((o) =>
                        o.id === orgId ? { ...o, members: o.members + 1 } : o,
                      ),
                    )
                    toast.success(`${user.email} added to ${org.name}`)
                  }}
                  orgs={orgs}
                  user={user}
                />
              ))}
              {shownUsers.length === 0 ? (
                <NoResults
                  colSpan={5}
                  noun="users"
                  onClear={() => setQuery("")}
                  query={query}
                />
              ) : null}
            </TableBody>
          </DataTable>
        </TabsContent>
      </PrimaryTabs>

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

      <CreateUserDialog
        onCreate={(email) => {
          setUsers((current) => [
            ...current,
            { id: crypto.randomUUID(), email, role: "Viewer" },
          ])
          toast.success(`${email} created`)
        }}
        onOpenChange={setCreatingUser}
        open={creatingUser}
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

const SETTINGS_OPTIONS = [
  { label: "Custom", value: "custom" },
  { label: "Global", value: "global" },
]

/** The row a search or filter leaves empty, with the way back. */
function NoResults({
  colSpan,
  noun,
  query,
  onClear,
}: {
  colSpan: number
  noun: string
  query: string
  onClear: () => void
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="py-8" colSpan={colSpan}>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No {noun} match</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={onClear} variant="outline">
              {query ? "Clear search" : "Clear filters"}
            </Button>
          </EmptyContent>
        </Empty>
      </TableCell>
    </TableRow>
  )
}

/**
 * A person with an account and no organization, as the platform lists them:
 * change their role, add them to an organization, or impersonate them. The
 * platform's Remove is left out — it is always disabled for someone with no
 * organization to be removed from.
 */
function UnassignedUserRow({
  user,
  orgs,
  onAdd,
}: {
  user: UnassignedUser
  orgs: Organization[]
  onAdd: (orgId: string) => void
}) {
  const [role, setRole] = React.useState<string>(user.role)
  const [orgId, setOrgId] = React.useState(orgs[0]?.id ?? "")

  return (
    <TableRow>
      <TableCell className="text-muted-foreground tabular-nums" title={user.id}>
        {user.id.slice(0, 8)}
      </TableCell>
      <TableCell className="font-medium">{user.email}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Select onValueChange={setRole} value={role}>
            <SelectTrigger
              aria-label={`Role of ${user.email}`}
              className="w-36"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => toast.success(`${user.email} is now ${role}`)}
            size="sm"
          >
            Update
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Select onValueChange={setOrgId} value={orgId}>
            <SelectTrigger
              aria-label={`Organization for ${user.email}`}
              className="w-44"
              size="sm"
            >
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent position="popper">
              {orgs.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => onAdd(orgId)} size="sm" variant="outline">
            Add
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <Button
          onClick={() => toast(`Signed in as ${user.email}`)}
          size="sm"
          variant="outline"
        >
          Impersonate
        </Button>
      </TableCell>
    </TableRow>
  )
}

/** The platform's Create user: an account with no organization yet. */
function CreateUserDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (email: string) => void
}) {
  const [email, setEmail] = React.useState("")
  const [checked, setChecked] = React.useState(false)
  const error = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? null
    : "Enter an email"

  const close = (next: boolean) => {
    if (!next) {
      setEmail("")
      setChecked(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog onOpenChange={close} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            They join no organization until you add them to one.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            setChecked(true)
            if (error) return
            onCreate(email.trim().toLowerCase())
            close(false)
          }}
        >
          <Field data-invalid={checked && error ? true : undefined}>
            <FieldLabel htmlFor="user-email">Email</FieldLabel>
            <Input
              aria-invalid={checked && error ? true : undefined}
              autoFocus
              id="user-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              type="email"
              value={email}
            />
            {checked && error ? <FieldError>{error}</FieldError> : null}
          </Field>
          <DialogFooter>
            <Button
              onClick={() => close(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit">Create user</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
      id: crypto.randomUUID(),
      name: name.trim(),
      domain: cleanDomain,
      owner: owner.trim().toLowerCase(),
      ownerPending: true,
      members: 0,
      retention: "2 years",
      customSettings: false,
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
