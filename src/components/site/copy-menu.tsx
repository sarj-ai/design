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

type CopyMenuItem = {
  id: string
  label: string
  onSelect: () => void
}

export function CopyMenu({
  label,
  menuLabel,
  icon,
  items,
  tour,
}: {
  label: string
  menuLabel: string
  icon: React.ReactNode
  items: CopyMenuItem[]
  /** Marks this menu for the walkthrough in `hey-click.tsx`; the portalled content carries `data-tour-menu`. */
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
