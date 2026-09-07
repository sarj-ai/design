"use client"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import type { CallLink } from "@/lib/conversations-revamp-drawer-data"
import {
  LinkedCallIcon,
  OpenLinkedCallIcon,
} from "@/components/conversations-revamp/drawer/icons"

/**
 * The other call in a scheduling relationship, as a row you can follow.
 *
 * A callback and the call that caused it are one story told across two rows,
 * and the table is sorted by time rather than by story — so without this the
 * reader has to remember a phone number and go hunting. It points both ways:
 * "Booked from" on a call that was scheduled, "Callback booked" on the call
 * that scheduled it.
 *
 * The status is printed rather than implied. A link to a callback that has
 * since been cancelled should say so on the way in, not after the click.
 */
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
