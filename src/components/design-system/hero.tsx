"use client"

import { SectionMenu } from "@/components/design-system/section-menu"
import ContourMapBackground from "@/components/ui/contour-map-background"
import TextHighlightWave from "@/components/ui/text-highlight-wave"

export function DesignSystemHero({
  views,
  initialSection = null,
  initialTopic = null,
}: {
  views: Record<string, React.ReactNode>
  initialSection?: string | null
  initialTopic?: string | null
}) {
  return (
    <main className="flex flex-1 flex-col">
      {/* `-mt-20` pulls the cover up under the sticky nav, which still occupies its flow at the top. */}
      <ContourMapBackground className="-mt-20" fadeBottom>
        <div className="flex w-full flex-col gap-8 px-6 pt-40 pb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:px-12 lg:pt-56 lg:pb-8">
          <TextHighlightWave
            as="h1"
            className="max-w-3xl text-start text-6xl font-semibold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
            text={"Every rule,\nwritten down."}
          />

          <TextHighlightWave
            as="p"
            charStagger={0.008}
            className="max-w-sm text-start text-base leading-normal font-normal tracking-normal text-pretty text-muted-foreground sm:text-base"
            delay={0.6}
            text="The tokens, primitives and patterns the product is built from, and the lint rules that keep a screen from drifting off them."
          />
        </div>
      </ContourMapBackground>

      <div className="pb-24">
        <SectionMenu
          initialSection={initialSection}
          initialTopic={initialTopic}
          views={views}
        />
      </div>
    </main>
  )
}
