"use client"

import { SectionMenu } from "@/components/design-system/section-menu"
import CurrencySkyBackground from "@/components/ui/currency-sky-background"
import TextInlineChipReveal from "@/components/ui/text-inline-chip-reveal"

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
 * The headline resolves a word at a time: each one arrives as a purple glow
 * and inks in behind it, on a hue that sweeps across the whole line. That
 * reveal is the emphasis device, so the headline is one even weight of ink
 * rather than the two-tone split it started as.
 *
 * The supporting line sits in its own narrow column, aligned to the *bottom*
 * of the headline rather than the top. Aligned to the top it reads as a
 * caption hanging off the first line; aligned to the baseline it reads as the
 * second half of one thought, which is what it is.
 */

export function DesignSystemHero() {
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
      <CurrencySkyBackground className="-mt-20" fadeBottom tone="light">
        <div className="flex w-full flex-col gap-8 px-6 pt-32 pb-16 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:px-12 lg:pt-44 lg:pb-20">
          {/* The headline resolves word by word, each one arriving as a purple
              glow before it inks in. That reveal is now the emphasis device,
              which is why the two-tone split it replaced is gone: holding the
              first clause back in half-strength ink *and* lighting every word
              on the way in are two answers to the same question, and running
              both makes the line fussy rather than twice as deliberate.

              Ordinary `foreground` ink, because the terrain is drawn on white
              now. The page has one surface again, so nothing here needs the
              light-on-dark pair it used while the cover was near-black.

              Chips off. They are five cycling colour tiles built for a long
              sentence; on a four-word headline only the first slot is even in
              range, which lands one tile after "Every" for no reason. */}
          <TextInlineChipReveal
            as="h1"
            chipAfter={[]}
            className="max-w-3xl text-start text-6xl font-semibold leading-none tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
            text="Every rule, written down."
          />

          {/* The same reveal as the headline, trailing it by a third of a
              second so the two read as one event with an order rather than as
              two things starting at once. Its stagger is halved: this line has
              five times the words, and at the headline's rate the last of them
              would still be arriving two seconds in. */}
          <TextInlineChipReveal
            chipAfter={[]}
            className="max-w-sm text-start text-base leading-normal font-normal tracking-normal text-pretty text-muted-foreground sm:text-base md:text-base"
            delay={0.35}
            stagger={0.025}
            text="The tokens, primitives and patterns the product is built from, and the ten lint rules that keep a screen from drifting off them."
          />
        </div>
      </CurrencySkyBackground>

      {/* The five sections, as a menu that opens into a grid of each one's
          topics. It replaced a stack of sticky cards that each led to the
          first topic on its shelf rather than to the shelf. */}
      <div className="pb-24">
        <SectionMenu />
      </div>
    </main>
  )
}
