"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { usePathname, useRouter } from "next/navigation"
import { useAnimate, useReducedMotion } from "motion/react"

import { MOCKUPS } from "@/lib/site/mockups-data"
import { REELS } from "@/lib/site/reels-data"

/**
 * The curtain between screens.
 *
 * A route change here used to be a cut: one screen gone, the next one there.
 * This wraps every route once, in the root layout, and turns a click on an
 * internal link into a wipe that names where the reader is going.
 *
 * Choreography, in three beats. On a click the curtain rises from the foot of
 * the viewport and the page it covers is dragged up a little with it, so the
 * two read as one motion rather than a lid closing over a still. As the
 * curtain clears the middle of the screen the two brackets, which started
 * touching at its centre, part to make room, and the destination's name fades
 * in between them. The route is pushed only once the curtain covers the
 * viewport, so whatever the new page does on mount happens out of sight; the
 * name holds for a beat after the route has rendered, longer if it is slow to
 * arrive, which is also what makes the curtain a loading state. Then the
 * curtain keeps rising off the top while the new page rises into place from
 * below it, at a slower rate, so the two move in parallax and the reveal has
 * depth. The whole thing runs in about a second and a half.
 *
 * The shape is lifted from the page-name wipe on sstr.tech (barba.js and
 * GSAP there); the curves, colours and type are this system's. It runs on
 * the house in-out curve for the curtain and the house out curve for the
 * name, so it reads as kin to the drawers and popovers rather than as a
 * different product's motion.
 *
 * Where it does not play: a click that stays inside one section (the design
 * system's rail, topic to topic) is browsing, not leaving, and gets no
 * curtain. Nor does anything a link opts out of with `data-no-transition`,
 * an external or modified click, the browser's own back and forward, or any
 * navigation at all under reduced motion, where the click falls through to
 * Next and the screens simply swap. Direct loads never see it, so `npm run
 * shots` and the reel renderer capture the page and nothing else.
 */

/* The house curves, as motion wants them: the values behind --ease-in-out-cubic
   and --ease-out-cubic in globals.css. */
const inOutCubic = [0.645, 0.045, 0.355, 1] as const
const outCubic = [0.215, 0.61, 0.355, 1] as const

const COVER = 0.5 // s, the curtain rising to cover the viewport
const HOLD = 0.3 // s, the name on screen once the curtain is up and the route has rendered
const REVEAL = 0.6 // s, the curtain leaving off the top
const PUSH = 32 // px the leaving page is dragged up, and the arriving page rises through
const STALL = 5000 // ms to wait for a route before revealing whatever is there

/* Sections that are one place. A click from one path to another inside the
   same entry is browsing, and browsing does not get a curtain. */
const IN_PLACE = ["/design-system"]

/** What the curtain calls the place a link goes to. */
function labelFor(path: string, link: HTMLAnchorElement): string {
  if (path === "/") return "Design lab"
  if (path === "/reels") return "Reels"
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

  /* The navigation in flight: where it is going, and how to tell the click
     handler the route has rendered. One at a time; a second click while the
     curtain is moving is swallowed rather than queued. */
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
      /* The brackets start touching at the centre, where the name will be,
         and part by half its width each. Measured, because the name is
         whatever the destination is called. Both wait for the curtain's edge
         to pass the middle of the screen (half-way through an in-out curve),
         so the name never shows over the page it is covering. */
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
      /* Under the curtain, the new page is parked below where it will sit. */
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
      /* A transform left on the wrapper would pin every fixed element inside
         the page to it — drawers, dialogs, the app shell's sidebar. Clear it
         entirely rather than leaving translateY(0) behind. */
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

      {/* The curtain. Parked below the viewport and hidden until a click,
          so it costs nothing to a page that is only being read. */}
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
