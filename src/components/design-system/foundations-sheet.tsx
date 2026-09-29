"use client"

import { toast } from "sonner"

import { CopySkillIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import { type DocsSection } from "@/lib/design-system/data"
import { FOUNDATIONS_SKILL } from "@/lib/design-system/foundations-skill"

/** Copies every foundation rule out as one skill file. */
export function CopySkillButton() {
  async function copy() {
    try {
      await navigator.clipboard.writeText(FOUNDATIONS_SKILL)
      toast.success("Copied as a skill")
    } catch {
      toast.error("Could not copy the skill")
    }
  }

  return (
    <Button onClick={copy} variant="secondary">
      <CopySkillIcon />
      Copy as skill
    </Button>
  )
}

/**
 * Every Foundations topic on one sheet, instead of a grid of tiles that each
 * open one. There is not enough of it to be worth the extra click.
 *
 * Each view sits on the page surface, so its tables and cards read as they
 * do anywhere else rather than inheriting the cover's purple.
 */
export function FoundationsSheet({
  section,
  views,
}: {
  section: DocsSection
  views: Record<string, React.ReactNode>
}) {
  return (
    <div className="flex flex-col gap-12">
      {section.groups
        .flatMap((group) => group.pages)
        .map((topic) => (
          <section className="flex flex-col gap-4" id={topic.id} key={topic.id}>
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-semibold text-primary-foreground">
                {topic.title}
              </h3>
              <p className="max-w-2xl text-sm text-primary-foreground/70">
                {topic.description}
              </p>
            </div>
            <div className="rounded-2xl bg-background p-4 text-foreground">
              {views[topic.id]}
            </div>
          </section>
        ))}
    </div>
  )
}
