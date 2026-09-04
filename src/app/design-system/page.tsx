import { MockupShell } from "@/components/mockup-shell"
import { ButtonRoles } from "@/components/design-system/button-roles"
import { ColourTable } from "@/components/design-system/colour-table"
import {
  ReferenceLabel,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { ComponentCatalog } from "@/components/design-system/component-catalog"
import { DesignSystemDocs } from "@/components/design-system/docs-shell"
import { MultiStepPreview } from "@/components/design-system/multi-step-preview"
import { PatternAnatomy } from "@/components/design-system/pattern-anatomy"
import { ButtonSizes } from "@/components/design-system/button-sizes"
import { ChipNotes, ChipTable } from "@/components/design-system/chip-notes"
import { DrawerPreview } from "@/components/design-system/drawer-preview"
import { EmptyValueNotes } from "@/components/design-system/empty-value-notes"
import { FoundationTable } from "@/components/design-system/foundation-tables"
import { FormDemo } from "@/components/design-system/form-demo"
import { LanguageNotes } from "@/components/design-system/language-notes"
import { IndexPagePreview } from "@/components/design-system/page-preview"
import { RuleList } from "@/components/design-system/rule-list"
import { StepperPreview } from "@/components/design-system/stepper-preview"
import { TabsPreview } from "@/components/design-system/tabs-preview"
import { SurfaceDemo } from "@/components/design-system/surface-demos"
import { SurfaceDiagram } from "@/components/design-system/surface-diagram"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CATALOG_GROUPS,
  FORM_RULES,
  GLOBAL_RULES,
  PATTERNS,
  SURFACE_CHOICES,
} from "@/lib/design-system-data"

/**
 * `/design-system` — the rules and the patterns, written down.
 *
 * A reference page rather than a mockup of a product screen, so it is reachable
 * from the index header rather than carrying a card in the list. The list table
 * folded into it when `/tables` was removed, and it is the only reference page
 * left since `/colors` was removed too.
 *
 * It reads as a documentation site: a rail listing every topic the system has,
 * and one topic open beside it. `DesignSystemDocs` owns the rail, the heading
 * and the switching; this file owns what each topic actually renders, keyed by
 * the ids in `DOCS_SECTIONS`.
 *
 * A topic left out of this map falls back to its section's index, which is why
 * `foundations` and `patterns` are absent — a list of what is in them is the
 * right thing for a section header to open, and the shell builds it from the
 * same data the rail is built from.
 *
 * No topic repeats its own title in a card header: the heading above the pane
 * has already said it. A live demo still sits on a `Card` — a lone "Open
 * drawer" button on the page background is a control with nothing under it —
 * while a topic that is only a reference table stays bare, because a table
 * inside a card is two edges drawn around one thing.
 */
export default function DesignSystemPage() {
  return (
    <MockupShell title="Design system">
      <DesignSystemDocs
        views={{
          /* Foundations — what is fixed. */
          colour: (
            <div className="flex flex-col gap-8">
              <ColourTable />

              {/* The five tints the chips are painted with are rows in the
                  table above, but a token name does not tell you it is the
                  Completed chip. Same data as the key on the index page —
                  the rows are one component, so they cannot drift apart. */}
              <section className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base font-medium">
                    In use — status chips
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Where the intent tints actually land. A chip is its own
                    swatch, so this is the tint shown doing its job rather than
                    a second square of it.
                  </p>
                </div>

                <ChipTable />
              </section>
            </div>
          ),
          ...Object.fromEntries(
            GLOBAL_RULES.map((rule) => [
              rule.id,
              <FoundationTable id={rule.id} key={rule.id} />,
            ]),
          ),

          /* Components — the guidance, then the inventory. */
          buttons: (
            <div className="flex flex-col gap-8">
              <ButtonSizes />
              <ButtonRoles />
            </div>
          ),
          forms: (
            <Card>
              <CardContent className="grid gap-8 lg:grid-cols-2">
                <FormDemo />
                <RuleList rules={FORM_RULES} />
              </CardContent>
            </Card>
          ),
          components: <ComponentCatalog />,
          ...Object.fromEntries(
            CATALOG_GROUPS.map((group) => [
              group.id,
              <ComponentCatalog group={group.id} key={group.id} />,
            ]),
          ),

          /* Patterns — what the decisions produce. */
          surfaces: (
            /* Three rows rather than three cards: the choice between them is
               a comparison, and the criteria only answer it side by side.
               The diagram says where the surface sits and the demo says what
               being in it is like, so both stay — as columns. */
            <ReferenceTable
              columns={[
                { header: "Surface", width: "w-32" },
                { header: "Where it sits", width: "w-56" },
                { header: "Reach for it when", width: "w-80" },
                { header: "Examples", width: "w-88" },
                { header: "Try it" },
              ]}
              rows={SURFACE_CHOICES.map((choice) => ({
                key: choice.id,
                cells: [
                  <ReferenceLabel key="title">{choice.title}</ReferenceLabel>,
                  <SurfaceDiagram key="diagram" variant={choice.id} />,
                  <ReferenceNote key="criterion">
                    {choice.criterion}
                  </ReferenceNote>,
                  <ReferenceNote key="examples">
                    {choice.examples}
                  </ReferenceNote>,
                  <SurfaceDemo key="demo" variant={choice.id} />,
                ],
              }))}
            />
          ),

          /* Named by Abdulrahman alongside the index page: the other shape a
             product this size actually needs written down. */
          [PATTERNS[0].id]: (
            <Card>
              <CardContent className="flex flex-col gap-6">
                <MultiStepPreview />

                <Separator />
                <PatternAnatomy pattern={PATTERNS[0]} />
              </CardContent>
            </Card>
          ),
          tabs: (
            <Card>
              <CardContent>
                <TabsPreview />
              </CardContent>
            </Card>
          ),

          /* Its own topic, and pointedly not a variant of the one above: a
             drawer keeps the page behind it, which is the opposite of what a
             creation flow wants, so it never carries steps. */
          drawer: (
            <Card>
              <CardContent className="flex flex-col">
                <DrawerPreview />
              </CardContent>
            </Card>
          ),

          /* Separate from the multi-step pattern because it is the component,
             not the pattern: that topic answers what a multi-step creation
             must contain, this one answers what the stepper inside it looks
             like at each orientation. */
          stepper: (
            <Card>
              <CardContent>
                <StepperPreview />
              </CardContent>
            </Card>
          ),
          "index-page": (
            <Card>
              <CardContent className="flex flex-col gap-6">
                <IndexPagePreview />

                {/* The colour, empty-cell and language keys belong against the
                    rows they explain, so they ride under this preview. */}
                <Separator />
                <ChipNotes />
                <EmptyValueNotes />
                <LanguageNotes />
              </CardContent>
            </Card>
          ),
        }}
      />
    </MockupShell>
  )
}
