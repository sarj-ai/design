"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CommentToggle } from "@/components/comment-toggle"
import { BackIcon } from "@/components/workspace-icons"

/**
 * Chrome shared by every mockup page: a way back to the index, and the name of
 * what you are looking at.
 *
 * Nothing here restyles a page. The workspace is light and left-to-right —
 * there is no theme and no direction switch, so a mockup is reviewed in the one
 * mode it ships in.
 */
export function MockupShell({
  title,
  eyebrow,
  actions,
  children,
}: {
  title: string
  eyebrow?: string
  /** Reviewer controls for this mockup (state toggles and the like) — they
   * live up here so the design below stays clean. */
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full grow flex-col">
      <header className="sticky top-0 z-overlay flex flex-wrap items-center gap-3 border-b bg-background px-4 py-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <BackIcon />
            All mockups
          </Link>
        </Button>

        <Separator
          orientation="vertical"
          className="h-5 data-vertical:self-center"
        />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {eyebrow ? (
            <span className="truncate text-sm text-muted-foreground">
              {eyebrow}
            </span>
          ) : null}
          <span className="truncate text-sm font-medium">{title}</span>
        </div>

        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}

        <CommentToggle />
      </header>

      {/* A flex column so a page that wants the remaining height can take it
          with `grow`. Pages that don't keep their content height, so this is
          inert for every mockup that just flows. */}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
