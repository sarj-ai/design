import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { LINT_RULES } from "@/lib/design-system-data"

/**
 * The ten rules that are errors rather than advice.
 *
 * The rest of this site is a set of decisions a reader can disagree with in
 * review. These ten are checked by `npm run lint` and fail the build, and the
 * only way to learn them was to break one and read the message — which is a
 * poor way to find out that a colour literal was never an option.
 *
 * The "write instead" column is the half that makes the page usable. A rule
 * that only says what is banned leaves the reader to guess the replacement,
 * and the guess is usually a suppression comment.
 */
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
