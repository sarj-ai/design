"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

/** `sm:max-w-xl!`: SheetContent's `data-[side=right]:sm:max-w-sm` outranks a plain utility. */
export function SettingSheet({
  children,
  description,
  onOpenChange,
  open,
  title,
}: {
  children: React.ReactNode
  description: string
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="gap-0 p-0 sm:max-w-xl!" side="right">
        <SheetHeader className="border-b pe-12">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 p-4">{children}</div>
        </ScrollArea>

        {/* Row, not the primitive's stacked column: one button that closes a
            panel is not a page-width commitment, and drawing it as one makes
            it read like a save. */}
        <SheetFooter className="flex-row justify-end border-t">
          <Button
            onClick={() => {
              onOpenChange(false)
            }}
          >
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function SheetSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description?: string
  title: string
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
