import {
  ReferenceName,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { COLOUR_GROUPS } from "@/lib/design-system/colour-tokens"
import { cn } from "@/lib/utils"

const OFF_PAGE = new Set(["Sidebar", "Defined only as a Tailwind alias"])

export function ColourTable() {
  return (
    <div className="flex flex-col gap-8">
      {COLOUR_GROUPS.filter((group) => !OFF_PAGE.has(group.title)).map(
        (group) => (
          <section className="flex flex-col gap-3" key={group.title}>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-medium">{group.title}</h3>
              <p className="text-sm text-muted-foreground">{group.note}</p>
            </div>

            <ReferenceTable
              columns={[
                { header: "Swatch", width: "w-20" },
                { header: "Token", width: "w-64" },
                { header: "Value", width: "w-72" },
                { header: "What it is for" },
              ]}
              rows={group.tokens.map((token) => ({
                key: token.name,
                cells: [
                  <div
                    className={cn(
                      "size-6 rounded-md ring-1 ring-foreground/10",
                      token.swatch,
                    )}
                    key="swatch"
                  />,
                  <ReferenceName key="name">{token.name}</ReferenceName>,
                  <span
                    className="font-mono text-sm text-muted-foreground"
                    key="value"
                  >
                    {token.value}
                  </span>,
                  <ReferenceNote key="use">{token.use}</ReferenceNote>,
                ],
              }))}
            />
          </section>
        ),
      )}
    </div>
  )
}
