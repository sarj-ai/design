import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { LAYER_TOKENS } from "@/lib/design-system/data"

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
