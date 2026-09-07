import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { COLOUR_GROUPS } from "@/lib/colour-tokens"
import { cn } from "@/lib/utils"

/**
 * Every colour in the system, read as a list rather than as a wall of chips.
 *
 * A grid of swatches answers "what does it look like" and nothing else. The
 * questions people actually arrive with — what is this one called, what is it
 * for, is it the same as that one — are all comparisons down a column, so the
 * shape is a table, and the same table the rest of the page uses.
 *
 * The swatch keeps a ring at every row: half of these are white or near-white
 * and would otherwise be an invisible cell.
 */
export function ColourTable() {
  return (
    <div className="flex flex-col gap-8">
      {COLOUR_GROUPS.map((group) => (
        <section className="flex flex-col gap-3" key={group.title}>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-medium">{group.title}</h3>
            <p className="text-sm text-muted-foreground">{group.note}</p>
          </div>

          <ReferenceTable
            columns={[
              { header: "Swatch", width: "w-20" },
              { header: "Token", width: "w-64" },
              { header: "Value", width: "w-72" },
              { header: "What it is for" },
            ]}
            rows={group.tokens.map((token) => ({
              key: token.name,
              cells: [
                <div
                  className={cn(
                    "size-6 rounded-md ring-1 ring-foreground/10",
                    token.swatch,
                  )}
                  key="swatch"
                />,
                <ReferenceName key="name">{token.name}</ReferenceName>,
                <span
                  className="font-mono text-sm text-muted-foreground"
                  key="value"
                >
                  {token.value}
                </span>,
                <ReferenceNote key="use">{token.use}</ReferenceNote>,
              ],
            }))}
          />
        </section>
      ))}
    </div>
  )
}
