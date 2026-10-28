"use client"

import * as React from "react"

import { InviteeView } from "@/components/mockups/org-access/invitee-view"
import {
  MembersView,
  type MembersState,
} from "@/components/mockups/org-access/members-view"
import { OrganizationsView } from "@/components/mockups/org-access/organizations-view"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ORG, type InviteeState } from "@/lib/mockups/org-access-data"

const VIEWS = [
  {
    group: "Sarj",
    items: [{ id: "organizations", label: "Organizations" }],
  },
  {
    group: ORG.name,
    items: [
      { id: "members", label: "Members" },
      { id: "members-loading", label: "Members · loading" },
      { id: "members-error", label: "Members · error" },
      { id: "members-no-access", label: "Members · no access" },
    ],
  },
  {
    group: "Invited person",
    items: [
      { id: "invite", label: "Invite" },
      { id: "wrong-account", label: "Wrong account" },
      { id: "expired", label: "Link expired" },
      { id: "no-invite", label: "No invite" },
    ],
  },
] as const

type View = (typeof VIEWS)[number]["items"][number]["id"]

const MEMBERS_STATE: Partial<Record<View, MembersState>> = {
  members: "ready",
  "members-loading": "loading",
  "members-error": "error",
  "members-no-access": "no-access",
}

const INVITEE_VIEWS: View[] = [
  "invite",
  "wrong-account",
  "expired",
  "no-invite",
]

export default function OrgAccessPage() {
  const [view, setView] = React.useState<View>("members")
  const membersState = MEMBERS_STATE[view]

  return (
    <MockupShell
      title="Invite-only organization access"
      actions={
        <Select onValueChange={(next) => setView(next as View)} value={view}>
          <SelectTrigger aria-label="View" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {VIEWS.map((section) => (
              <SelectGroup key={section.group}>
                <SelectLabel>{section.group}</SelectLabel>
                {section.items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      }
    >
      {INVITEE_VIEWS.includes(view) ? (
        <InviteeView state={view as InviteeState} />
      ) : (
        <AppShell
          active="Organizations"
          breadcrumb={
            view === "organizations"
              ? "Organizations"
              : ["Organizations", ORG.name]
          }
        >
          {membersState ? (
            // Keyed so each state starts from the same list.
            <MembersView key={view} state={membersState} />
          ) : (
            <OrganizationsView
              onOpen={(name) => {
                if (name === ORG.name) setView("members")
              }}
            />
          )}
        </AppShell>
      )}
    </MockupShell>
  )
}
