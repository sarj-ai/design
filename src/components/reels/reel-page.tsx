"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Stage } from "@/components/reels/stage"
import { ReelPlayer } from "@/components/reels/player"
import { BackToReelsIcon } from "@/components/reels/icons"

/**
 * One reel, at its own address.
 *
 * Two modes behind one route. `?render=1` strips every piece of chrome and
 * pins the canvas to exactly 1920x1080 with no scaling, which is what
 * `scripts/render-reel.mjs` drives. Without it you get the player.
 *
 * Sharing a route rather than splitting into `/render` keeps a single source of
 * truth for what a reel *is*. A second route is a second place to forget to
 * update, and the failure would only ever show up in the exported MP4 — after
 * the render, which is the expensive step.
 */
export function ReelPage({
  title,
  eyebrow,
  duration,
  render = false,
  children,
}: {
  title: string
  eyebrow?: string
  duration: number
  render?: boolean
  children: React.ReactNode
}) {
  if (render) return <RenderCanvas duration={duration}>{children}</RenderCanvas>

  return (
    <div className="flex min-h-full grow flex-col">
      <header className="sticky top-0 z-overlay flex flex-wrap items-center gap-3 border-b bg-background px-4 py-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/reels">
            <BackToReelsIcon />
            All reels
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
      </header>

      <main className="mx-auto flex w-full max-w-350 flex-col gap-6 p-8">
        <ReelPlayer duration={duration}>{children}</ReelPlayer>
      </main>
    </div>
  )
}

/**
 * The bare canvas the renderer screenshots.
 *
 * Fixed to the top-left corner of the viewport so the screenshot clip is
 * always the same rectangle, whatever the page around it decides to do.
 */
function RenderCanvas({
  duration,
  children,
}: {
  duration: number
  children: React.ReactNode
}) {
  const [frame, setFrame] = React.useState(0)

  return (
    <div className="fixed top-0 left-0" data-reel-root="">
      <Stage duration={duration} frame={frame} onSeek={setFrame} render>
        {children}
      </Stage>
    </div>
  )
}
