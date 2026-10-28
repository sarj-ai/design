import {
  CompletedIcon,
  FailedIcon,
  InboundIcon,
  RunningIcon,
  ScheduledIcon,
} from "@/components/design-system/icons"
import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Badge } from "@/components/ui/badge"
import { CHIP_NOTES } from "@/lib/design-system/data"

const CHIP_ICONS = {
  completed: CompletedIcon,
  failed: FailedIcon,
  inbound: InboundIcon,
  running: RunningIcon,
  scheduled: ScheduledIcon,
}

function ChipTable() {
  return (
    <ReferenceTable
      columns={[
        { header: "Chip", width: "w-40" },
        { header: "Token", width: "w-56" },
        { header: "What it means" },
      ]}
      rows={CHIP_NOTES.map((chip) => {
        const Icon = chip.icon ? CHIP_ICONS[chip.icon] : null

        return {
          key: chip.label,
          cells: [
            <Badge className={chip.tone} key="chip" variant="secondary">
              {Icon ? <Icon /> : null}
              {chip.label}
            </Badge>,
            <ReferenceName key="token">{chip.token}</ReferenceName>,
            <ReferenceNote key="why">{chip.why}</ReferenceNote>,
          ],
        }
      })}
    />
  )
}

export function ChipNotes() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium">The chips</span>
        <span className="text-sm text-muted-foreground">
          Colour is the verdict, so only the state column carries one.
        </span>
      </div>

      <ChipTable />
    </section>
  )
}
