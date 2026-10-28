import { NarrowIcon } from "@/components/design-system/icons"
import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CONTROL_STEPS } from "@/lib/design-system/data"

export function ControlScale() {
  return (
    <div className="flex flex-col gap-8">
      <ReferenceTable
        columns={[
          { header: "Height", width: "w-24" },
          { header: "Button", width: "w-40" },
          { header: "Field at the same height", width: "w-64" },
          { header: "Reach for it when" },
        ]}
        rows={CONTROL_STEPS.map((step) => ({
          key: step.button,
          cells: [
            <ReferenceName key="px">{step.px}px</ReferenceName>,
            <ReferenceName key="button">{step.button}</ReferenceName>,
            step.field ? (
              <ReferenceName key="field">{step.field}</ReferenceName>
            ) : (
              <ReferenceNote key="field">—</ReferenceNote>
            ),
            <ReferenceNote key="when">{step.when}</ReferenceNote>,
          ],
        }))}
      />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-medium">The reason — a filter bar</h2>
          <p className="text-sm text-muted-foreground">
            An Input, a Select and two Buttons, none of them carrying a height
            of its own. They line up because they are all on the same step.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-4">
          <Input className="w-56" placeholder="Search calls" />

          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <NarrowIcon />
            Filters
          </Button>

          <Button className="ms-auto">Export</Button>
        </div>
      </section>
    </div>
  )
}
