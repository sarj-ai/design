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
import { OpenSettingIcon } from "@/components/mockups/scenario-single-screen/icons"

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
