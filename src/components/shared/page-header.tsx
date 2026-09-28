"use client"

import * as React from "react"

import { Item } from "@/components/ui/item"

/**
 * The top of a page, one shape everywhere.
 *
 * Title on the left, with one line of description under it only when the
 * title does not say enough on its own. Whatever describes the page's state —
 * a quota, a sync status — sits on the right, level with the title. The ways
 * of adding to the page come after, as a row of tiles directly under the
 * title, so the reader meets the actions before the list they fill.
 *
 * The layout follows ElevenLabs' knowledge base page; the look is ours.
 */
export function PageHeader({
  title,
  description,
  aside,
  actions,
}: {
  title: React.ReactNode
  /** Optional. Leave it out when the title already says what the page is. */
  description?: React.ReactNode
  /** Page state, shown on the right of the title — never an action. */
  aside?: React.ReactNode
  /** `ActionTile`s. A page with nothing to add has none. */
  actions?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {aside}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  )
}

/**
 * One way of adding to the page: an icon over a label, nothing else. The
 * label carries the verb, so there is no second line explaining it — what a
 * choice accepts is said in the dialog it opens.
 */
export function ActionTile({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <Item
      variant="outline"
      asChild
      /* On the Item, not the button: Slot joins the two class lists without
         merging them, so the Item's own w-full and padding would win. */
      className="w-36 flex-col items-start gap-3 p-4 [&_svg]:size-4 text-start transition-colors duration-150 ease-out-cubic hover:bg-muted motion-reduce:transition-none"
    >
      <button type="button" onClick={onClick}>
        {icon}
        <span className="font-medium">{label}</span>
      </button>
    </Item>
  )
}
