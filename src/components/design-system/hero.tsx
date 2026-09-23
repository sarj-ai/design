"use client"

import { SectionMenu } from "@/components/design-system/section-menu"
import ContourMapBackground from "@/components/ui/contour-map-background"
import TextHighlightWave from "@/components/ui/text-highlight-wave"

/**
 * `/design-system` — the front door.
 *
 * Replaced the orbit figure, which drew five section labels onto rotating
 * rings around a spinning cube. The figure was the navigation, so it had to be
 * watched before it could be read: a label's position meant nothing, and the
 * dots travelling the paths were the only part of it carrying no information
 * at all. A reader who wants Foundations wants a row that says Foundations.
 *
 * Two bands. A cover carrying the headline over a moving terrain, and the five
 * sections as a menu below it (`section-menu.tsx`). The terrain is drawn at its light end, so
 * the whole page is one surface and the band is a texture on the page rather
 * than a panel cut into it. It still stops above the list: a moving field
 * behind a row of links is a row of links you have to read through weather.
 *
 * The headline and its line resolve under a highlight that washes across
 * them a letter at a time (`text-highlight-wave`) — the same wave the section
 * names run, so the page has one reveal.
 *
 * The supporting line sits in its own narrow column, aligned to the *bottom*
 * of the headline rather than the top. Aligned to the top it reads as a
 * caption hanging off the first line; aligned to the baseline it reads as the
 * second half of one thought, which is what it is.
 */

export function DesignSystemHero({
  views,
}: {
  /** Topic id → what its page renders, for the tiles to open in place. */
  views: Record<string, React.ReactNode>
}) {
  return (
    <main className="flex flex-1 flex-col">
      {/* `-mt-20` pulls the cover up under the nav, which is `sticky top-0`
          and so still occupies its ~76px of flow at the top of the page.
          Without it the terrain starts below the pill and leaves a white strip
          across the top edge, which reads as a rendering fault rather than a
          band. The pill carries `z-nav` and its own surface, so it goes on
          painting over the terrain exactly as it does over any other page.

          The top padding is the point, not an accident of the nav's height. A
          display headline that starts immediately under the chrome reads as
          the first row of a document; the same headline with a screen's worth
          of air above it reads as a cover. */}
      <ContourMapBackground className="-mt-20" fadeBottom>
        <div className="flex w-full flex-col gap-8 px-6 pt-40 pb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:px-12 lg:pt-56 lg:pb-8">
          {/* A highlight washes across the headline a letter at a time,
              lifting each one out of a dimmed rest — the same wave the
              section names below run, so the page has one reveal. The break
              is written in rather than left to wrapping, so the second line
              trails the first as the line it visually is. */}
          <TextHighlightWave
            as="h1"
            className="max-w-3xl text-start text-6xl font-semibold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
            text={"Every rule,\nwritten down."}
          />

          {/* The same wave, starting as the headline's second line finishes.
              Five times the letters, so a fifth of the stagger — at the
              headline's rate the last of them would arrive five seconds in. */}
          <TextHighlightWave
            as="p"
            charStagger={0.008}
            className="max-w-sm text-start text-base leading-normal font-normal tracking-normal text-pretty text-muted-foreground sm:text-base"
            delay={0.6}
            text="The tokens, primitives and patterns the product is built from, and the ten lint rules that keep a screen from drifting off them."
          />
        </div>
      </ContourMapBackground>

      {/* The five sections, as a menu that opens into a grid of each one's
          topics. It replaced a stack of sticky cards that each led to the
          first topic on its shelf rather than to the shelf. */}
      <div className="pb-24">
        <SectionMenu views={views} />
      </div>
    </main>
  )
}
