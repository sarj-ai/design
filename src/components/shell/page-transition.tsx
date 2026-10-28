"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { usePathname, useRouter } from "next/navigation"
import { useAnimate, useReducedMotion } from "motion/react"

import { MOCKUPS } from "@/lib/site/mockups-data"
import { REELS } from "@/lib/site/reels-data"

// The values behind --ease-in-out-cubic and --ease-out-cubic in globals.css.
const inOutCubic = [0.645, 0.045, 0.355, 1] as const
const outCubic = [0.215, 0.61, 0.355, 1] as const

const COVER = 0.5 // s, the curtain rising to cover the viewport
const HOLD = 0.3 // s, the name on screen once the curtain is up and the route has rendered
const REVEAL = 0.6 // s, the curtain leaving off the top
const PUSH = 32 // px the leaving page is dragged up, and the arriving page rises through
const STALL = 5000 // ms to wait for a route before revealing whatever is there

const IN_PLACE = ["/design-system"]

function labelFor(path: string, link: HTMLAnchorElement): string {
  if (path === "/") return "Design lab"
  if (path === "/reels") return "Reels showcase"
  if (path === "/changelog") return "Changelog"
  if (path.startsWith("/design-system")) return "Design system"
  const mockup = MOCKUPS.find((entry) => entry.href === path)
  if (mockup) return mockup.title
  const reel = REELS.find((entry) => entry.href === path)
  if (reel) return reel.title
  return (
    link.getAttribute("aria-label") || link.textContent?.trim() || "Design lab"
  )
}

function samePlace(from: string, to: string) {
  return IN_PLACE.some(
    (prefix) => from.startsWith(prefix) && to.startsWith(prefix),
  )
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms))

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()
  const [scope, animate] = useAnimate()
  const [label, setLabel] = React.useState("")

  // One navigation at a time; a second click while the curtain moves is swallowed.
  const pending = React.useRef<{ path: string; arrive: () => void } | null>(
    null,
  )
  const busy = React.useRef(false)

  React.useEffect(() => {
    if (pending.current?.path === pathname) pending.current.arrive()
  }, [pathname])

  React.useEffect(() => {
    if (reducedMotion) return

    const part = (selector: string) =>
      scope.current.querySelector(selector) as HTMLElement

    async function cover() {
      const panel = part("[data-transition-panel]")
      const brackets = scope.current.querySelectorAll(
        "[data-transition-bracket]",
      )
      const text = part("[data-transition-text]")
      // Measured, because the name's width varies. Both wait for the curtain's edge to pass mid-screen so the name never shows over the page it covers.
      const half = text.offsetWidth / 2 + 16

      panel.style.visibility = "visible"
      await Promise.all([
        animate(
          panel,
          { y: ["100%", "0%"] },
          { duration: COVER, ease: inOutCubic },
        ),
        animate(
          "[data-transition-content]",
          { y: [0, -PUSH] },
          { duration: COVER, ease: inOutCubic },
        ),
        animate(
          "[data-transition-label]",
          { opacity: [0, 1] },
          { duration: 0.3, delay: COVER / 2, ease: outCubic },
        ),
        animate(
          brackets[0],
          { x: [half, 0] },
          { duration: 0.45, delay: COVER / 2, ease: outCubic },
        ),
        animate(
          brackets[1],
          { x: [-half, 0] },
          { duration: 0.45, delay: COVER / 2, ease: outCubic },
        ),
      ])
    }

    async function reveal() {
      const panel = part("[data-transition-panel]")
      const content = part("[data-transition-content]")
      await animate(content, { y: PUSH }, { duration: 0 })
      await Promise.all([
        animate(
          panel,
          { y: ["0%", "-100%"] },
          { duration: REVEAL, ease: inOutCubic },
        ),
        animate(
          "[data-transition-label]",
          { opacity: 0 },
          { duration: 0.2, ease: outCubic },
        ),
        animate(
          content,
          { y: [PUSH, 0] },
          { duration: REVEAL, ease: inOutCubic },
        ),
      ])
      panel.style.visibility = "hidden"
      await animate(panel, { y: "100%" }, { duration: 0 })
      // Clear the transform entirely: even translateY(0) makes the wrapper the containing block for every fixed element inside.
      content.style.transform = ""
    }

    async function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const link = (event.target as Element | null)?.closest?.("a[href]")
      if (!(link instanceof HTMLAnchorElement)) return
      if (link.target && link.target !== "_self") return
      if (link.hasAttribute("download") || "noTransition" in link.dataset) {
        return
      }
      const url = new URL(link.href, window.location.href)
      const from = window.location.pathname
      if (url.origin !== window.location.origin) return
      if (url.pathname === from) return
      if (samePlace(from, url.pathname)) return

      event.preventDefault()
      event.stopPropagation()
      if (busy.current) return
      busy.current = true

      try {
        /* Synchronous, so the name is in the DOM to be measured before the
           brackets are placed around it. */
        flushSync(() => setLabel(labelFor(url.pathname, link)))

        const arrived = new Promise<void>((resolve) => {
          pending.current = { path: url.pathname, arrive: resolve }
        })

        await cover()
        router.push(url.pathname + url.search + url.hash)
        await Promise.all([
          Promise.race([arrived, wait(STALL)]),
          wait(HOLD * 1000),
        ])
        pending.current = null
        await reveal()
      } finally {
        pending.current = null
        busy.current = false
      }
    }

    /* Capture phase on the document, ahead of React's own listener, so the
       Link never sees the click and the push is ours to time. */
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [animate, reducedMotion, router, scope])

  return (
    <div ref={scope} className="contents">
      <div data-transition-content className="flex min-h-full grow flex-col">
        {children}
      </div>

      <div
        aria-hidden="true"
        data-transition-panel
        className="fixed inset-0 z-tooltip flex items-center justify-center bg-primary text-primary-foreground"
        style={{ transform: "translateY(100%)", visibility: "hidden" }}
      >
        <div
          data-transition-label
          className="flex items-center gap-4 opacity-0"
        >
          <span
            data-transition-bracket
            className="h-9 w-3 shrink-0 border-2 border-e-0 border-primary-foreground"
          />
          <span data-transition-text className="text-3xl font-semibold">
            {label}
          </span>
          <span
            data-transition-bracket
            className="h-9 w-3 shrink-0 border-2 border-s-0 border-primary-foreground"
          />
        </div>
      </div>
    </div>
  )
}
