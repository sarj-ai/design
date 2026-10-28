import {
  ReferenceLabel,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import type { Rule } from "@/lib/design-system/data"

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
