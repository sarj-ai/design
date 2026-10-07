"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { BackIcon } from "@/components/shell/workspace-icons"

/**
 * Chrome shared by every mockup page: one thin bar above the design.
 *
 * Back to the index, the mockup's name, and whatever it gives a reviewer to
 * press — nothing else. The lab's own nav (sections, search, logo) stays on
 * the index pages; on a mockup it only competed with the product chrome
 * underneath for the reader's eye.
 *
 * The bar is the shell's `bg-sidebar`, so it and the app below read as one
 * surface, and it is 48px — `AppShell` starts its fixed sidebar under it.
 *
 * Nothing here restyles a page. The workspace is light and left-to-right —
 * there is no theme and no direction switch, so a mockup is reviewed in the one
 * mode it ships in.
 */
export function MockupShell({
  title,
  actions,
  children,
}: {
  title: string
  /** Kept for the callers that pass it; the bar shows the title alone. */
  eyebrow?: string
  /** Reviewer controls for this mockup (state toggles and the like) — they
   * live up here so the design below stays clean. */
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full grow flex-col bg-sidebar">
      <header className="sticky top-0 z-nav flex h-12 shrink-0 items-center gap-2 border-b bg-sidebar px-3">
        <Button aria-label="All mockups" asChild size="icon-sm" variant="ghost">
          <Link href="/">
            <BackIcon />
          </Link>
        </Button>
        <span
          className="min-w-0 flex-1 truncate text-sm font-medium"
          title={title}
        >
          {title}
        </span>
        {actions ? (
          <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
        ) : null}
      </header>

      {/* A flex column so a page that wants the remaining height can take it
          with `grow`. Pages that don't keep their content height, so this is
          inert for every mockup that just flows. */}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
