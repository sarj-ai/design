import { Separator } from "@/components/ui/separator"
import { RuleList } from "@/components/design-system/rule-list"
import type { PatternAnatomy as Anatomy } from "@/lib/design-system/data"

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
