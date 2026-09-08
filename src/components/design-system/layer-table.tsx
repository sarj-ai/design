import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { LAYER_TOKENS } from "@/lib/design-system-data"

/**
 * The nine layer names, in the order they stack.
 *
 * A table and nothing else: the rule is that the names exist, and a diagram of
 * nine translucent planes would be a picture of the same nine words with a
 * perspective added. The value column is there because the numbers are real
 * and someone will need to reason about a third-party widget that has picked
 * one of its own.
 */
export function LayerTable() {
  return (
    <ReferenceTable
      columns={[
        { header: "Layer", width: "w-44" },
        { header: "z-index", width: "w-24" },
        { header: "What sits there" },
      ]}
      rows={LAYER_TOKENS.map((layer) => ({
        key: layer.name,
        cells: [
          <ReferenceName key="name">{layer.name}</ReferenceName>,
          <ReferenceName key="value">{layer.value}</ReferenceName>,
          <ReferenceNote key="what">{layer.what}</ReferenceNote>,
        ],
      }))}
    />
  )
}
