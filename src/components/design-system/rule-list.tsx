import {
  ReferenceLabel,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import type { Rule } from "@/lib/design-system-data"

/**
 * A named rule over the line that explains it, repeated down a card.
 *
 * Every list on this page is this shape, so the page reads as one document
 * rather than as six blocks that each chose their own layout — which is now
 * one table rather than one grid, so the names line up in a column instead of
 * restarting at every row.
 */
export function RuleList({ rules }: { rules: Rule[] }) {
  return (
    <ReferenceTable
      columns={[{ header: "Rule", width: "w-64" }, { header: "What it means" }]}
      rows={rules.map((rule) => ({
        key: rule.label,
        cells: [
          <ReferenceLabel key="label">{rule.label}</ReferenceLabel>,
          <ReferenceNote key="detail">{rule.detail}</ReferenceNote>,
        ],
      }))}
    />
  )
}
