"use client"

import * as React from "react"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrganisationIcon } from "@/components/design-system/icons"

const ORGANISATIONS = ["Sarj.ai", "Rawabi Holding", "Tamimi Markets"]

/**
 * The organisation a superadmin is reading a page as, and the control that
 * changes it — as the product draws it today, above an index page's list: a
 * warning-tinted band, because every row under it belongs to someone else's
 * organisation and that should never be missed.
 *
 * On its own page while where it belongs is being worked out.
 */
export function AdminViewPreview() {
  const [organisation, setOrganisation] = React.useState(ORGANISATIONS[0])

  return (
    <Item
      variant="outline"
      className="border-warning/30 bg-warning-tint text-warning-tint-foreground"
    >
      <ItemMedia variant="icon">
        <OrganisationIcon />
      </ItemMedia>
      <ItemContent className="flex-none">
        <ItemTitle>Admin view</ItemTitle>
      </ItemContent>
      <ItemActions>
        <Select value={organisation} onValueChange={setOrganisation}>
          <SelectTrigger
            aria-label="Organisation"
            className="w-56 bg-background"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORGANISATIONS.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ItemActions>
    </Item>
  )
}
