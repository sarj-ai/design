"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type CopyMenuItem = {
  id: string
  label: string
  onSelect: () => void
}

/**
 * An icon button that opens a plain list of things to copy — the card's
 * links, or its install commands. The design system's own dropdown, opened
 * by a click. Picking a row copies it and closes the menu; the toast
 * `useCopy` raises is the confirmation.
 */
export function CopyMenu({
  label,
  menuLabel,
  icon,
  items,
  tour,
}: {
  /** Accessible name of the trigger. */
  label: string
  /** The menu's heading, and its accessible name. */
  menuLabel: string
  icon: React.ReactNode
  items: CopyMenuItem[]
  /**
   * Marks this menu for the walkthrough in `hey-click.tsx`: the trigger
   * carries `data-tour`, and the content, which is portalled out of the
   * card, carries `data-tour-menu` so its rows can be addressed too.
   */
  tour?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={label}
          data-tour={tour}
          size="icon-sm"
          variant="ghost"
        >
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-label={menuLabel}
        data-tour-menu={tour}
      >
        <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
        {items.map((item) => (
          <DropdownMenuItem key={item.id} onSelect={item.onSelect}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
