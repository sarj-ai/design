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
import { BUTTON_ROLES } from "@/lib/design-system/data"

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
