"use client"

import * as React from "react"

import { SiteNav } from "@/components/shell/site-nav"

/**
 * Chrome shared by every mockup page: the lab's nav, carrying the name of what
 * you are looking at and whatever this mockup gives a reviewer to press.
 *
 * It used to be a bar of its own — a back link, a separator and the title —
 * which was the same bar `ReelPage` drew and neither of them was how you
 * reached the design system. `SiteNav` is that bar everywhere now, and it
 * floats rather than sitting in a strip of its own.
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
      <SiteNav actions={actions} eyebrow={eyebrow} title={title} />

      {/* A flex column so a page that wants the remaining height can take it
          with `grow`. Pages that don't keep their content height, so this is
          inert for every mockup that just flows. */}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
