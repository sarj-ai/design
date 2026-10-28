"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrganisationIcon } from "@/components/design-system/icons"
import { AppShell } from "@/components/shell/app-shell"
import { ConversationsIndexPreview } from "@/components/design-system/conversations-index-preview"

const ORGANISATIONS = ["Sarj.ai", "Rawabi Holding", "Tamimi Markets"]

export function AdminViewSwitcher() {
  const [organisation, setOrganisation] = React.useState(ORGANISATIONS[0])

  return (
    <Select value={organisation} onValueChange={setOrganisation}>
      <SelectTrigger
        aria-label="Admin view"
        size="sm"
        className="border-warning/30 bg-warning-tint text-warning-tint-foreground"
      >
        <OrganisationIcon />
        <span className="font-medium">Admin view:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {ORGANISATIONS.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** `translate-x-0` makes this frame the containing block for the app's fixed sidebar and drawers. */
export function AdminViewPagePreview() {
  return (
    <div className="relative flex h-180 translate-x-0 flex-col overflow-hidden rounded-xl border">
      <AppShell
        active="Conversations"
        scope={<AdminViewSwitcher />}
        underShell={false}
      >
        <ConversationsIndexPreview />
      </AppShell>
    </div>
  )
}
