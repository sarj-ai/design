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
import { ConversationsPage } from "@/components/mockups/conversations-revamp/list/conversations-page"

const ORGANISATIONS = ["Sarj.ai", "Rawabi Holding", "Tamimi Markets"]

/**
 * The organisation a superadmin is reading a page as, in the top bar.
 *
 * It is the scope of the whole screen, not of one list, so it sits with the
 * app's own controls rather than in a band above the page's content — and it
 * stays in the same place on every page. Tinted with warning, because every
 * row under it may belong to someone else's organisation.
 */
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

/**
 * The conversations index, as the mockup ships it, with the admin view in
 * its top bar. Framed so the app's sidebar and drawers stay inside the demo:
 * `translate-x-0` makes the frame the containing block for their fixed
 * positioning.
 */
export function AdminViewPagePreview() {
  return (
    <div className="relative flex h-180 translate-x-0 flex-col overflow-hidden rounded-xl border">
      <ConversationsPage scope={<AdminViewSwitcher />} />
    </div>
  )
}
