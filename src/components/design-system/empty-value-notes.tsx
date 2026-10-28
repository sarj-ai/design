import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { EMPTY_VALUES } from "@/lib/design-system/data"

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
          /* w-40: anything narrower lets "Unavailable" run into the next column. */
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
