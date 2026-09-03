"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { OpenSettingIcon } from "@/components/scenario-single-screen/icons"

/**
 * One setting in the rail: what it is, what it is currently set to, and the
 * drawer that edits it.
 *
 * The value line is the point of the row. A rail that only listed setting
 * names would still make you open nine drawers to learn what the scenario
 * does — printing the current value is what lets the whole configuration be
 * read off one screen, which is the thing the tabs were costing.
 *
 * `ItemMedia variant="icon"` sizes the glyph to the text and top-aligns it to
 * the title, which is the correct relationship for a 16px icon labelling a
 * two-line block.
 */
export function SettingRow({
  icon: Icon,
  onOpen,
  title,
  value,
}: {
  icon: React.ComponentType
  onOpen: () => void
  title: string
  value: string
}) {
  return (
    <Item asChild size="sm">
      <button
        className="cursor-pointer text-start hover:bg-accent"
        onClick={onOpen}
        type="button"
      >
        <ItemMedia variant="icon">
          <Icon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
          <ItemDescription>{value}</ItemDescription>
        </ItemContent>
        <ItemActions className="text-muted-foreground">
          <OpenSettingIcon />
        </ItemActions>
      </button>
    </Item>
  )
}

/**
 * A labelled group of rows.
 *
 * Nine flat rows read as a list to get through. Grouped by when they matter —
 * how it speaks, what it knows, what happens after the call — the rail reads
 * as a summary of the scenario instead.
 */
export function RailGroup({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-0">{children}</ItemGroup>
      </CardContent>
    </Card>
  )
}
