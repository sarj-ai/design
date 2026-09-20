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
    /* `bg-sidebar`, because the nav reserves a strip and nothing was painting
       it. `SiteNav` is `sticky`, which still takes its height out of the flow,
       and that strip plus every ancestor above it is transparent — so it fell
       through to the body's pure-white `--background` while the shell below
       painted `--sidebar` at 0.985. A 1.5% step across the full width is
       exactly the sort of difference that reads as a seam rather than as a
       shade. Painting the strip the shell's own colour closes it. */
    <div className="flex min-h-full grow flex-col bg-sidebar">
      <SiteNav actions={actions} eyebrow={eyebrow} title={title} />

      {/* A flex column so a page that wants the remaining height can take it
          with `grow`. Pages that don't keep their content height, so this is
          inert for every mockup that just flows. */}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
