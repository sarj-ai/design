"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import { OrbAvatar } from "@/components/shared/orb-avatar"
import { PageHeader } from "@/components/shared/page-header"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CopyLinkIcon,
  InviteLinkIcon,
  InviteMemberIcon,
  RowActionsIcon,
  SearchListIcon,
} from "@/components/mockups/org-access/icons"
import {
  ELSEWHERE,
  GROUPS,
  INVITES,
  LINK_EXPIRY,
  MEMBERS,
  ORG,
  type Group,
  type Invite,
  type LinkExpiry,
  type Member,
} from "@/lib/mockups/org-access-data"

/**
 * One organization's members, as Sarj staff see it on the organization page.
 *
 * Pending invites sit in the same list as members, tagged Pending, rather
 * than on a tab of their own: an invite is a person who is not in yet, and
 * the admin looking for "is Lama in?" should find the answer in one place.
 *
 * Owner is a tag beside the name, not a fifth group — per the requirements
 * doc it is a designation on an Org Admin's membership. The last owner can be
 * neither removed nor demoted, so those two menu rows are disabled with the
 * reason in place of a silent no.
 */
export type MembersState = "ready" | "loading" | "error" | "no-access"

export function MembersView({ state = "ready" }: { state?: MembersState }) {
  const [members, setMembers] = React.useState(MEMBERS)
  const [invites, setInvites] = React.useState(INVITES)
  const [query, setQuery] = React.useState("")
  const [inviting, setInviting] = React.useState(false)
  const [linking, setLinking] = React.useState(false)
  /* Bumped on every open, so the link dialog starts from what was saved. */
  const [linkKey, setLinkKey] = React.useState(0)
  const [removing, setRemoving] = React.useState<Member | null>(null)
  const [link, setLink] = React.useState<{
    group: Group
    expiry: LinkExpiry
  } | null>(null)

  const owners = members.filter((m) => m.owner).length
  const needle = query.trim().toLowerCase()
  const match = (text: string) => text.toLowerCase().includes(needle)
  const shownInvites = invites.filter((i) => match(i.email))
  const shownMembers = members.filter((m) => match(m.name) || match(m.email))

  const revoke = (invite: Invite) => {
    setInvites((current) => current.filter((i) => i.id !== invite.id))
    toast(`Invite to ${invite.email} revoked`, {
      action: {
        label: "Undo",
        onClick: () => setInvites((current) => [invite, ...current]),
      },
    })
  }

  const setOwner = (member: Member, owner: boolean) => {
    setMembers((current) =>
      current.map((m) => (m.id === member.id ? { ...m, owner } : m)),
    )
    toast.success(
      owner
        ? `${member.name} is now an owner`
        : `${member.name} is no longer an owner`,
    )
  }

  /* A member without member_manage who opens this page. Per the access
     model, the page names what is missing and who can grant it. */
  if (state === "no-access") {
    return (
      <div className="flex flex-col gap-6 p-3 lg:p-4">
        <PageHeader title={ORG.name} description={ORG.domain} />
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>You can’t manage members</EmptyTitle>
            <EmptyDescription>
              Managing members needs the Org Admin group. Fatimah Al-Qahtani,
              the owner of {ORG.name}, can add you to it.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const rows = shownInvites.length + shownMembers.length

  return (
    <div className="flex flex-col gap-6 p-3 lg:p-4">
      <PageHeader title={ORG.name} description={ORG.domain} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <InputGroup className="flex-1">
            <InputGroupAddon>
              <SearchListIcon />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search members"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email"
              value={query}
            />
          </InputGroup>
          <Button
            onClick={() => {
              setLinkKey((k) => k + 1)
              setLinking(true)
            }}
            variant="outline"
          >
            <InviteLinkIcon />
            Invite link
          </Button>
          <Button onClick={() => setInviting(true)}>
            <InviteMemberIcon />
            Invite member
          </Button>
        </div>

        {state === "error" ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>Could not load members</EmptyTitle>
              <EmptyDescription>
                Nothing changed. Try again in a moment.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => toast("Retrying…")} variant="outline">
                Try again
              </Button>
            </EmptyContent>
          </Empty>
        ) : state === "ready" && rows === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No members match “{query.trim()}”</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setQuery("")} variant="outline">
                Clear search
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <DataTable>
            <TableHeader>
              <DataTableHeaderRow>
                <DataTableHead>Member</DataTableHead>
                <DataTableHead>Group</DataTableHead>
                <DataTableHead>Added by</DataTableHead>
                <DataTableHead>Added</DataTableHead>
                <DataTableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </DataTableHead>
              </DataTableHeaderRow>
            </TableHeader>
            <TableBody>
              {state === "loading"
                ? Array.from({ length: 6 }, (_, row) => (
                    <TableRow key={row}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-6 rounded-full motion-reduce:animate-none" />
                          <Skeleton className="h-4 w-56 motion-reduce:animate-none" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 motion-reduce:animate-none" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28 motion-reduce:animate-none" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 motion-reduce:animate-none" />
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                : null}
              {state === "ready" &&
                shownInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* No orb until they join: the orb stands for a person,
                        and this is still only an address. */}
                        <Avatar size="sm">
                          <AvatarFallback>
                            {invite.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{invite.email}</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{invite.group}</TableCell>
                    <TableCell>{invite.invitedBy}</TableCell>
                    <TableCell className="text-muted-foreground">
                      Invited {invite.sent}
                    </TableCell>
                    <TableCell className="py-1.5 text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label={`Actions for ${invite.email}`}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <RowActionsIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              toast.success(`Invite resent to ${invite.email}`)
                            }
                          >
                            Resend invite
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => revoke(invite)}
                            variant="destructive"
                          >
                            Revoke invite
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

              {state === "ready" &&
                shownMembers.map((member) => {
                  const lastOwner = member.owner === true && owners === 1
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <OrbAvatar name={member.name} size="sm" />
                          <div className="flex min-w-0 items-baseline gap-2">
                            <span className="truncate">{member.name}</span>
                            <span className="truncate text-muted-foreground">
                              {member.email}
                            </span>
                          </div>
                          {member.owner ? (
                            <Badge variant="secondary">Owner</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{member.group}</TableCell>
                      <TableCell
                        className={
                          member.addedBy ? undefined : "text-muted-foreground"
                        }
                      >
                        {/* Auto-enrolled before invites existed. Migration keeps
                        them, so the list says how they got in. */}
                        {member.addedBy ?? "Joined by domain"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.added}
                      </TableCell>
                      <TableCell className="py-1.5 text-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-label={`Actions for ${member.name}`}
                              size="icon-sm"
                              variant="ghost"
                            >
                              <RowActionsIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            {/* The last owner keeps both rows, disabled, with the
                            reason above them at full strength — a disabled
                            row's own text is too faint to carry it. */}
                            {lastOwner ? (
                              <>
                                <DropdownMenuLabel className="font-normal text-muted-foreground">
                                  The last owner can’t be removed. Make someone
                                  else owner first.
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                              </>
                            ) : null}
                            {member.group === "Org Admin" ? (
                              member.owner ? (
                                <DropdownMenuItem
                                  disabled={lastOwner}
                                  onSelect={() => setOwner(member, false)}
                                >
                                  Remove as owner
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={() => setOwner(member, true)}
                                >
                                  Make owner
                                </DropdownMenuItem>
                              )
                            ) : null}
                            <DropdownMenuItem
                              disabled={lastOwner}
                              onSelect={() => setRemoving(member)}
                              variant="destructive"
                            >
                              Remove from {ORG.name}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </DataTable>
        )}
      </div>

      <InviteDialog
        invites={invites}
        members={members}
        onInvite={(invite) => {
          setInvites((current) => [invite, ...current])
          toast.success(`Invite sent to ${invite.email}`)
        }}
        onOpenChange={setInviting}
        open={inviting}
      />

      <InviteLinkDialog
        key={linkKey}
        link={link}
        onOpenChange={setLinking}
        onSave={(next) => {
          setLink(next)
          toast.success(
            next
              ? `Invite link on, expires in ${next.expiry}`
              : "Invite link off",
          )
        }}
        open={linking}
      />

      <AlertDialog
        onOpenChange={(open) => (open ? null : setRemoving(null))}
        open={removing !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing?.name} loses access to {ORG.name} straight away. The
              scenarios and calls they worked on stay.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setMembers((current) =>
                  current.filter((m) => m.id !== removing?.id),
                )
                toast.success(`${removing?.name} removed from ${ORG.name}`)
                setRemoving(null)
              }}
              variant="destructive"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/**
 * Invite one person by email, into one group.
 *
 * Any address is accepted, personal ones included — the doc's goal is that a
 * person with any email can be given access. What is refused is named: someone
 * already here, already invited, or already in another organization (V1 keeps
 * a person in one). Checked on Send, then live as the address is corrected.
 */
function InviteDialog({
  open,
  onOpenChange,
  members,
  invites,
  onInvite,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  invites: Invite[]
  onInvite: (invite: Invite) => void
}) {
  const [email, setEmail] = React.useState("")
  const [group, setGroup] = React.useState<Group>("Viewer")
  const [checked, setChecked] = React.useState(false)

  const address = email.trim().toLowerCase()
  const error = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
    ? "Enter an email address"
    : members.some((m) => m.email === address)
      ? `Already a member of ${ORG.name}`
      : invites.some((i) => i.email === address)
        ? "Already invited. Resend it from the list."
        : ELSEWHERE[address]
          ? `Already in ${ELSEWHERE[address]}. A person can be in one organization for now.`
          : null

  const close = (next: boolean) => {
    if (!next) {
      setEmail("")
      setGroup("Viewer")
      setChecked(false)
    }
    onOpenChange(next)
  }

  const send = () => {
    setChecked(true)
    if (error) return
    onInvite({
      id: `i${Date.now()}`,
      email: address,
      group,
      invitedBy: "You",
      sent: "Today",
    })
    close(false)
  }

  return (
    <Dialog onOpenChange={close} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {ORG.name}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            send()
          }}
        >
          <FieldGroup>
            <Field data-invalid={checked && error ? true : undefined}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                aria-invalid={checked && error ? true : undefined}
                autoFocus
                id="invite-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                type="email"
                value={email}
              />
              {checked && error ? <FieldError>{error}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-group">Group</FieldLabel>
              <Select
                onValueChange={(next) => setGroup(next as Group)}
                value={group}
              >
                <SelectTrigger id="invite-group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit">Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * The shareable invite link: off by default, and it expires — both from the
 * requirements doc. Anyone who opens it joins in the group set here, so the
 * group is chosen with the link rather than defaulted silently.
 */
function InviteLinkDialog({
  open,
  onOpenChange,
  link,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: { group: Group; expiry: LinkExpiry } | null
  onSave: (link: { group: Group; expiry: LinkExpiry } | null) => void
}) {
  const [on, setOn] = React.useState(link !== null)
  const [group, setGroup] = React.useState<Group>(link?.group ?? "Viewer")
  const [expiry, setExpiry] = React.useState<LinkExpiry>(
    link?.expiry ?? "7 days",
  )
  const url = "https://platform.sarj.ai/join/zk-7Qm2xV"

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite link</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="link-on">
              Anyone with the link can join
            </FieldLabel>
            <Switch checked={on} id="link-on" onCheckedChange={setOn} />
          </Field>
          {on ? (
            <>
              {link ? (
                <InputGroup>
                  <InputGroupInput
                    aria-label="Invite link"
                    readOnly
                    value={url}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label="Copy link"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(url)
                          .then(() => toast.success("Link copied"))
                          .catch(() => toast.error("Could not copy the link"))
                      }
                      size="icon-xs"
                    >
                      <CopyLinkIcon />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              ) : null}
              <Field>
                <FieldLabel htmlFor="link-group">Joins as</FieldLabel>
                <Select
                  onValueChange={(next) => setGroup(next as Group)}
                  value={group}
                >
                  <SelectTrigger id="link-group">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="link-expiry">Expires after</FieldLabel>
                <Select
                  onValueChange={(next) => setExpiry(next as LinkExpiry)}
                  value={expiry}
                >
                  <SelectTrigger id="link-expiry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {LINK_EXPIRY.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </>
          ) : null}
        </FieldGroup>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(on ? { group, expiry } : null)
              onOpenChange(false)
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
