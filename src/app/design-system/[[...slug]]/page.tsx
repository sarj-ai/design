import { ButtonRoles } from "@/components/design-system/button-roles"
import { ColourTable } from "@/components/design-system/colour-table"
import {
  ReferenceLabel,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { ComponentCatalog } from "@/components/design-system/component-catalog"
import { FileTypeIllustrations } from "@/components/design-system/file-type-illustrations"
import { DotPattern } from "@/components/ui/dot-pattern"
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
import { RowActionNotes } from "@/components/design-system/row-action-notes"
import { MotionTable } from "@/components/design-system/motion-tables"
import { RuleList } from "@/components/design-system/rule-list"
import { StepperPreview } from "@/components/design-system/stepper-preview"
import { SelectionPreview } from "@/components/design-system/selection-preview"
import { TabsPreview } from "@/components/design-system/tabs-preview"
import { SurfaceDemo } from "@/components/design-system/surface-demos"
import { SurfaceDiagram } from "@/components/design-system/surface-diagram"
import { ControlScale } from "@/components/design-system/control-scale"
import { LayerTable } from "@/components/design-system/layer-table"
import { LintRules } from "@/components/design-system/lint-rules"
import { PaginationPreview } from "@/components/design-system/pagination-preview"
import {
  EmptyStatePreview,
  ErrorStatePreview,
  LoadingPreview,
  NoResultsPreview,
} from "@/components/design-system/state-previews"
import { TableAnatomy } from "@/components/design-system/table-anatomy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CATALOG_GROUPS,
  EMPTY_STATE_RULES,
  ERROR_RULES,
  FORM_RULES,
  GLOBAL_RULES,
  LOADING_RULES,
  MOTION_RULES,
  NO_RESULTS_RULES,
  PATTERNS,
  SURFACE_CHOICES,
} from "@/lib/design-system-data"
import { docsParams, resolveDocs } from "@/lib/design-system-nav"
import { notFound } from "next/navigation"

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
 * Every topic in `DOCS_SECTIONS` needs an entry here. A section does not: it is
 * a shelf in the rail that opens in place, not a page.
 *
 * No topic repeats its own title in a card header: the heading above the pane
 * has already said it. A live demo still sits on a `Card` — a lone "Open
 * drawer" button on the page background is a control with nothing under it —
 * while a topic that is only a reference table stays bare, because a table
 * inside a card is two edges drawn around one thing.
 */
export async function generateStaticParams() {
  return docsParams()
}

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const location = resolveDocs(slug)

  /* A slug that names nothing is a 404 rather than a quiet fall back to the
     overview: a link that lands somewhere else never tells the person who sent
     it that they sent the wrong one. */
  if (!location) notFound()

  return (
    <DesignSystemDocs
      activeId={location.activeId}
      page={location.page}
      section={location.section}
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
                <h2 className="text-base font-medium">In use — status chips</h2>
                <p className="text-sm text-muted-foreground">
                  Where the intent tints actually land. A chip is its own
                  swatch, so this is the tint shown doing its job rather than a
                  second square of it.
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

        /* Bare, like the colour table above it: a reference table inside a
           card is two edges drawn around one thing. */
        layering: <LayerTable />,
        "control-scale": <ControlScale />,
        enforcement: <LintRules />,

        /* Motion — the three enforced rules, plus the curve and the step to
           pick. Wrapped in a Card like every other reference pane. */
        ...Object.fromEntries(
          MOTION_RULES.map((rule) => [
            rule.id,
            <Card key={rule.id}>
              <CardContent>
                <MotionTable id={rule.id} />
              </CardContent>
            </Card>,
          ]),
        ),

        /* Patterns — what the decisions produce. */
        surfaces: (
          /* Four rows rather than four cards: the choice between them is
               a comparison, and the criteria only answer it side by side.
               The diagram says where the surface sits and the demo says what
               being in it is like, so both stay — as columns. */
          <div className="flex flex-col gap-6">
            <ReferenceTable
              columns={[
                { header: "Surface", width: "w-32" },
                { header: "Where it sits", width: "w-56" },
                { header: "Reach for it when", width: "w-80" },
                { header: "Examples" },
              ]}
              rows={SURFACE_CHOICES.map((choice) => ({
                key: choice.id,
                cells: [
                  <ReferenceLabel key="title">{choice.title}</ReferenceLabel>,
                  <SurfaceDiagram key="diagram" variant={choice.id} />,
                  <div className="flex flex-col gap-1.5" key="criterion">
                    <ReferenceNote>{choice.criterion}</ReferenceNote>
                    {/* The exclusion is the half that gets argued, so it is
                        written beside the rule rather than inferred from it. */}
                    <ReferenceNote>
                      <span className="font-medium text-foreground">
                        Never for{" "}
                      </span>
                      {choice.avoid}
                    </ReferenceNote>
                  </div>,
                  <ReferenceNote key="examples">
                    {choice.examples}
                  </ReferenceNote>,
                ],
              }))}
            />

            {/* The demos were a fifth column, which left a whole form — a
                  label, a value and a button — about 120px to render in once
                  the four fixed columns had taken their width. They are the
                  half of the page a reader cannot get from a criterion, so
                  they get room instead of a cell. */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {SURFACE_CHOICES.map((choice) => (
                <Card key={choice.id} size="sm">
                  <CardHeader>
                    <CardTitle>{choice.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SurfaceDemo variant={choice.id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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

        /* Its own topic rather than a note on the index page: the same edge
           answers a picker in a drawer, a wizard step and a row in a list, and
           before this it was re-decided in each of them. */
        selection: (
          <Card>
            <CardContent>
              <SelectionPreview />
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

              {/* The colour, empty-cell, language and action keys belong
                    against the rows they explain, so they ride under this
                    preview. The three lookups first, then the one decision. */}
              <Separator />
              <ChipNotes />
              <EmptyValueNotes />
              <LanguageNotes />
              <RowActionNotes />
            </CardContent>
          </Card>
        ),
        /* The table shape, then the four states of the page it usually sits
           on. Each state is one Card, because each is a live surface rather
           than a reference table — and the rules ride under the demo they
           describe rather than in a list of their own. */
        tables: (
          <Card>
            <CardContent>
              <TableAnatomy />
            </CardContent>
          </Card>
        ),
        pagination: (
          <Card>
            <CardContent>
              <PaginationPreview />
            </CardContent>
          </Card>
        ),
        loading: (
          <Card>
            <CardContent className="flex flex-col gap-6">
              <LoadingPreview />
              <Separator />
              <RuleList rules={LOADING_RULES} />
            </CardContent>
          </Card>
        ),
        "empty-state": (
          <Card>
            <CardContent className="flex flex-col gap-6">
              <EmptyStatePreview />
              <Separator />
              <RuleList rules={EMPTY_STATE_RULES} />
            </CardContent>
          </Card>
        ),
        "no-results": (
          <Card>
            <CardContent className="flex flex-col gap-6">
              <NoResultsPreview />
              <Separator />
              <RuleList rules={NO_RESULTS_RULES} />
            </CardContent>
          </Card>
        ),
        "error-state": (
          <Card>
            <CardContent className="flex flex-col gap-6">
              <ErrorStatePreview />
              <Separator />
              <RuleList rules={ERROR_RULES} />
            </CardContent>
          </Card>
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
        ...Object.fromEntries(
          CATALOG_GROUPS.map((group) => [
            group.id,
            <ComponentCatalog group={group.id} key={group.id} />,
          ]),
        ),

        "file-card": (
          <Card>
            <CardContent>
              <FileTypeIllustrations />
            </CardContent>
          </Card>
        ),
        "dot-pattern": (
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="flex flex-col gap-3">
                <span className="text-sm font-medium">Plain</span>
                <div className="relative h-72 w-full overflow-hidden rounded-md">
                  <DotPattern className="text-border" />
                </div>
              </CardContent>
            </Card>

            {/* The variation worth having: a field that runs to the container
                edge ends in a hard line, which reads as a cropped texture
                rather than a background. The mask dissolves it instead. */}
            <Card>
              <CardContent className="flex flex-col gap-3">
                <span className="text-sm font-medium">Radial mask</span>
                <div className="relative h-72 w-full overflow-hidden rounded-md">
                  <DotPattern className="text-border" mask="radial" />
                </div>
              </CardContent>
            </Card>

            {/* Ripple carries the mask as well: a travelling ring that stops
                dead at the container edge is the same cropped-texture problem
                the mask exists to solve, and the motion makes it louder.

                Darker than the two above, which sit at text-border. A static
                field only has to be seen; a moving one has to be seen changing,
                and border grey has almost no room above itself to brighten
                into. */}
            <Card>
              <CardContent className="flex flex-col gap-3">
                <span className="text-sm font-medium">Ripple</span>
                <div className="relative h-72 w-full overflow-hidden rounded-md">
                  <DotPattern
                    className="text-muted-foreground/30"
                    mask="radial"
                    ripple
                  />
                </div>
              </CardContent>
            </Card>

            {/* The only variant that reacts to the reader rather than running
                on its own: the dots under the pointer swell and settle back
                to the plain field a thumb's width away, in the field's own
                colour. Move the pointer over the panel. */}
            <Card>
              <CardContent className="flex flex-col gap-3">
                <span className="text-sm font-medium">Hover</span>
                <div className="relative h-72 w-full overflow-hidden rounded-md">
                  <DotPattern className="text-border" hover />
                </div>
              </CardContent>
            </Card>
          </div>
        ),
      }}
    />
  )
}
