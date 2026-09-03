import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BUTTON_SIZES } from "@/lib/design-system-data"

/**
 * Which of the four sizes to reach for, with the button itself as the sample.
 *
 * A table rather than a grid of pairs: the question is which rung to pick, and
 * that is a comparison down a column. The four buttons sitting in one column
 * also show the ladder as a ladder, which two-per-row did not.
 */
export function ButtonSizes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Button sizes</CardTitle>
        <CardDescription>
          Size answers how dense the row around it is. How important the action
          is belongs to the variant. The icon sizes are the same four steps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReferenceTable
          columns={[
            { header: "Size", width: "w-24" },
            { header: "Example", width: "w-32" },
            { header: "Reach for it", width: "w-80" },
            { header: "Why" },
          ]}
          rows={BUTTON_SIZES.map((note) => ({
            key: note.size,
            cells: [
              <ReferenceName key="size">{note.size}</ReferenceName>,
              <Button key="sample" size={note.size} variant="outline">
                {note.size}
              </Button>,
              <span className="text-sm" key="when">
                {note.when}
              </span>,
              <ReferenceNote key="why">{note.why}</ReferenceNote>,
            ],
          }))}
        />
      </CardContent>
    </Card>
  )
}
