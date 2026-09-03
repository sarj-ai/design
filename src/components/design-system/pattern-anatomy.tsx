import { Separator } from "@/components/ui/separator"
import { RuleList } from "@/components/design-system/rule-list"
import type { PatternAnatomy as Anatomy } from "@/lib/design-system-data"

/**
 * A pattern's parts, split into the bare minimum and the rest.
 *
 * Two labelled lists rather than a marker per row: the question people actually
 * arrive with is "what is the least I can ship", and a column answers that in
 * one glance where an asterisk scattered down a list does not.
 */
export function PatternAnatomy({ pattern }: { pattern: Anatomy }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-medium">Bare minimum</span>
          <span className="text-sm text-muted-foreground">
            Leave one of these out and it is not this pattern any more.
          </span>
        </div>
        <RuleList rules={pattern.required} />
      </section>

      {/* A pattern with nothing optional shows no Optional heading — an empty
          section under a rule is worse than no section. */}
      {pattern.optional.length > 0 ? (
        <>
          <Separator />

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-medium">Optional</span>
              <span className="text-sm text-muted-foreground">
                Absent by default. Each one has to earn its place on the
                surface.
              </span>
            </div>
            <RuleList rules={pattern.optional} />
          </section>
        </>
      ) : null}
    </div>
  )
}
