import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { LINT_RULES } from "@/lib/design-system/data"

export function LintRules() {
  return (
    <ReferenceTable
      columns={[
        { header: "Rule", width: "w-52" },
        { header: "Banned", width: "w-96" },
        { header: "Write instead" },
      ]}
      rows={LINT_RULES.map((rule) => ({
        key: rule.id,
        cells: [
          <ReferenceName key="id">sarj/{rule.id}</ReferenceName>,
          <ReferenceNote key="bans">{rule.bans}</ReferenceNote>,
          <ReferenceNote key="instead">{rule.instead}</ReferenceNote>,
        ],
      }))}
    />
  )
}
