"use client"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import type { CallLink } from "@/lib/mockups/conversations-revamp-drawer-data"
import {
  LinkedCallIcon,
  OpenLinkedCallIcon,
} from "@/components/mockups/conversations-revamp/drawer/icons"

export function LinkedCall({
  label,
  link,
}: {
  /** What this call is to the one being read. */
  label: string
  link: CallLink
}) {
  return (
    <Item className="bg-card" size="sm" variant="outline">
      <ItemMedia variant="icon">
        <LinkedCallIcon />
      </ItemMedia>

      <ItemContent>
        <ItemTitle>
          {label} · {link.scenario}
        </ItemTitle>
        <ItemDescription>
          {link.status} · {link.when}
        </ItemDescription>
      </ItemContent>

      <Button size="sm" variant="outline">
        Open
        <OpenLinkedCallIcon className="rtl:rotate-180" />
      </Button>
    </Item>
  )
}
