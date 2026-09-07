import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { EMPTY_VALUES } from "@/lib/design-system-data"

/**
 * The empty-cell key, laid out like the chips section above it: the value as it
 * renders, then the condition it belongs to and the reason.
 *
 * The last row is the anti-pattern rather than an option, and it is written
 * the way it renders. This column says what a value looks like in a cell, so
 * striking it through would be lying about the specimen to carry a verdict the
 * word "Never" beside it already carries.
 */
export function EmptyValueNotes() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium">Empty cells</span>
        <span className="text-sm text-muted-foreground">
          One reason, one rendering, across the whole table.
        </span>
      </div>

      <ReferenceTable
        columns={[
          /* w-40, not w-24: "Unavailable" is 92px and the old column left 64px
             after its padding, so the longest value in the column ran into the
             one beside it and "Not analysed" wrapped. */
          { header: "Cell", width: "w-40" },
          { header: "When", width: "w-72" },
          { header: "Why" },
        ]}
        rows={EMPTY_VALUES.map((value) => ({
          key: value.sample,
          cells: [
            <ReferenceName key="sample">{value.sample}</ReferenceName>,
            <span className="text-sm" key="when">
              {value.when}
            </span>,
            <ReferenceNote key="why">{value.why}</ReferenceNote>,
          ],
        }))}
      />
    </section>
  )
}
