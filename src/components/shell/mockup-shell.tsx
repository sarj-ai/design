"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { BackIcon } from "@/components/shell/workspace-icons"

/** 48px tall: `AppShell` starts its fixed sidebar under it. */
export function MockupShell({
  title,
  actions,
  children,
}: {
  title: string
  /** Kept for the callers that pass it; the bar shows the title alone. */
  eyebrow?: string
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

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
