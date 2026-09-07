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

/**
 * The one shape every setting drawer takes: a title and the sentence that
 * explains the setting, the depth in a scroller, and a single way out.
 *
 * There is no Cancel. Edits here land on the scenario the same way the prompt
 * on the page does, and the save bar at the bottom of the page is what commits
 * them — so a second commit point inside the drawer would be a second, quieter
 * meaning of "saved".
 *
 * `sm:max-w-xl!` is not a gratuitous override. `SheetContent` pins a right-side
 * panel to `sm:max-w-sm` through a `data-[side=right]:` variant, and an
 * attribute variant outranks a plain utility — the important modifier is the
 * documented way past it.
 */
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

/**
 * A titled block inside a drawer. Drawers hold two or three related things —
 * languages and the timezone they are read against, extraction fields and
 * where they are sent — and this keeps the second one from reading as a
 * continuation of the first.
 */
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
