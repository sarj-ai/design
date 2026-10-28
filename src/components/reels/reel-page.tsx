"use client"

import * as React from "react"

import { SiteNav } from "@/components/shell/site-nav"
import { Stage } from "@/components/reels/stage"
import { ReelPlayer } from "@/components/reels/player"

/** `?render=1` strips the chrome and pins the canvas at 1920x1080 for `scripts/render-reel.mjs`. */
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
      <SiteNav eyebrow={eyebrow} title={title} />

      <main className="mx-auto flex w-full max-w-350 flex-col gap-6 px-8 pb-8">
        <ReelPlayer duration={duration}>{children}</ReelPlayer>
      </main>
    </div>
  )
}

/** Fixed to the viewport's top-left so the renderer's screenshot clip is always the same rectangle. */
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
