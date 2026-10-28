"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Notification01Icon } from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"
import { cn } from "@/lib/utils"

const NotificationsIcon = icon(Notification01Icon, "NotificationsIcon")

export type Notice = {
  /** The request it opens. */
  id: string
  title: string
  detail: string
  at: string
}

export function Notifications({
  notices,
  read,
  onRead,
  onOpen,
  onViewAll,
  viewAll,
  defaultOpen = false,
}: {
  notices: Notice[]
  read: ReadonlySet<string>
  onRead: (ids: string[]) => void
  onOpen: (id: string) => void
  onViewAll: () => void
  /** The page the foot leads to, e.g. "Approvals". */
  viewAll: string
  /** Open on mount — for a demo, not for the product. */
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const unread = notices.filter((notice) => !read.has(notice.id)).length

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={
            unread ? `Notifications, ${unread} unread` : "Notifications"
          }
          className="relative"
          size="icon-sm"
          variant="outline"
        >
          <NotificationsIcon />
          {unread ? (
            <span
              aria-hidden
              className="absolute end-1 top-1 size-2 rounded-full bg-primary ring-2 ring-background"
            />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-96 flex-col gap-0 p-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <span className="text-sm font-medium">Notifications</span>
          {unread ? (
            <Button
              onClick={() => onRead(notices.map((notice) => notice.id))}
              size="xs"
              variant="ghost"
            >
              Mark all read
            </Button>
          ) : null}
        </div>
        <Separator />
        {notices.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No notifications</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="gap-1 p-2">
            {notices.map((notice) => (
              <Item
                asChild
                className={cn(
                  "cursor-pointer text-start hover:bg-muted/50",
                  !read.has(notice.id) && "bg-primary-tint/50",
                )}
                key={notice.id}
                size="sm"
              >
                <button
                  onClick={() => {
                    onRead([notice.id])
                    setOpen(false)
                    onOpen(notice.id)
                  }}
                  type="button"
                >
                  <ItemContent className="min-w-0">
                    <ItemTitle className="tabular-nums">
                      {notice.title}
                    </ItemTitle>
                    <ItemDescription>
                      {notice.detail} · {notice.at}
                    </ItemDescription>
                  </ItemContent>
                </button>
              </Item>
            ))}
          </ItemGroup>
        )}
        <Separator />
        <div className="p-2">
          <Button
            className="w-full"
            onClick={() => {
              setOpen(false)
              onViewAll()
            }}
            variant="ghost"
          >
            View all in {viewAll}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
