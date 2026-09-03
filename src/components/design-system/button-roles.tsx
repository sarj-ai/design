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
import { BUTTON_ROLES } from "@/lib/design-system-data"

/**
 * Which variant carries which kind of action — the half of a button that size
 * deliberately does not answer.
 *
 * `ButtonGroup` is named in the description rather than given a row, because it
 * is not a fifth role: it joins buttons that are parts of one control, and a
 * footer's Cancel and Save are two controls that happen to sit together.
 *
 * A table for the same reason as the sizes: picking a variant is a comparison
 * between them, and comparisons want a column.
 */
export function ButtonRoles() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Button roles</CardTitle>
        <CardDescription>
          The variant says how important the action is. ButtonGroup joins
          buttons that are parts of one control — never a footer’s Cancel and
          Save.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReferenceTable
          columns={[
            { header: "Variant", width: "w-40" },
            { header: "Example", width: "w-32" },
            { header: "Reach for it" },
          ]}
          rows={BUTTON_ROLES.map((role) => ({
            key: role.variant,
            cells: [
              <ReferenceName key="variant">{role.variant}</ReferenceName>,
              <Button key="sample" size="sm" variant={role.variant}>
                {role.label}
              </Button>,
              <ReferenceNote key="when">{role.when}</ReferenceNote>,
            ],
          }))}
        />
      </CardContent>
    </Card>
  )
}
