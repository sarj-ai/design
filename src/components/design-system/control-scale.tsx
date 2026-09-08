import { NarrowIcon } from "@/components/design-system/icons"
import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CONTROL_STEPS } from "@/lib/design-system-data"

/**
 * The four heights, and the demo that says why they are pinned together.
 *
 * The table alone would read as trivia — four numbers, one per size name. What
 * makes it a rule is the pairing: `sm` is the height of a small field and
 * `default` is the height of a normal one, so a row of mixed controls has one
 * top edge and one bottom edge. Move any of the four and every filter bar in
 * the product steps.
 */
export function ControlScale() {
  return (
    <div className="flex flex-col gap-8">
      <ReferenceTable
        columns={[
          { header: "Height", width: "w-24" },
          { header: "Button", width: "w-40" },
          { header: "Field at the same height", width: "w-64" },
          { header: "Reach for it when" },
        ]}
        rows={CONTROL_STEPS.map((step) => ({
          key: step.button,
          cells: [
            <ReferenceName key="px">{step.px}px</ReferenceName>,
            <ReferenceName key="button">{step.button}</ReferenceName>,
            step.field ? (
              <ReferenceName key="field">{step.field}</ReferenceName>
            ) : (
              /* An em dash rather than "None", by the same vocabulary the
                 tables use: no field is 24 or 36px, so nothing is missing. */
              <ReferenceNote key="field">—</ReferenceNote>
            ),
            <ReferenceNote key="when">{step.when}</ReferenceNote>,
          ],
        }))}
      />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-medium">The reason — a filter bar</h2>
          <p className="text-sm text-muted-foreground">
            An Input, a Select and two Buttons, none of them carrying a height
            of its own. They line up because they are all on the same step.
          </p>
        </div>

        {/* A muted inset rather than a second bordered box: this already sits
            inside a Card, and a card in a card draws two edges around one
            thing. */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-4">
          <Input className="w-56" placeholder="Search calls" />

          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <NarrowIcon />
            Filters
          </Button>

          <Button className="ms-auto">Export</Button>
        </div>
      </section>
    </div>
  )
}
