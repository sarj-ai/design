"use client"

import * as React from "react"

import { Item } from "@/components/ui/item"

export function PageHeader({
  title,
  description,
  aside,
  actions,
}: {
  title: React.ReactNode
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
      className="w-36 flex-col items-start gap-2 p-3 [&_svg]:size-4 text-start transition-colors duration-150 ease-out-cubic hover:bg-muted motion-reduce:transition-none"
    >
      <button type="button" onClick={onClick}>
        {icon}
        <span className="font-medium">{label}</span>
      </button>
    </Item>
  )
}
