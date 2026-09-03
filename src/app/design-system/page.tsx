import { MockupShell } from "@/components/mockup-shell"
import { ButtonRoles } from "@/components/design-system/button-roles"
import { ColourTable } from "@/components/design-system/colour-table"
import {
  ReferenceLabel,
  ReferenceNote,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { ComponentCatalog } from "@/components/design-system/component-catalog"
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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
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
 * It runs in the source document's order — what is fixed, then what is a
 * decision, then what the decision produces — because the fixed half is what
 * stops the decisions from being re-argued.
 */
export default function DesignSystemPage() {
  return (
    <MockupShell title="Design system">
      <main className="mx-auto flex w-full max-w-350 flex-col gap-8 p-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Design system</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            The rules every screen follows, and the patterns to reach for first.
          </p>
        </header>

        {/* Tabs rather than routes: AGENTS.md keeps alternate views of one
            thing on one route. A tab per foundation rather than one table of
            them all — each is a topic with its own worked example, and a row
            each gave every one a third of a line.

            The list wraps, because ten of them do not fit a single row at any
            width this workspace targets. */}
        <Tabs className="gap-8" defaultValue="colour">
          <TabsList className="flex-wrap">
            <TabsTrigger value="colour">Colour</TabsTrigger>
            {GLOBAL_RULES.map((rule) => (
              <TabsTrigger key={rule.id} value={rule.id}>
                {rule.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          {GLOBAL_RULES.map((rule) => (
            <TabsContent
              className="flex flex-col gap-8"
              key={rule.id}
              value={rule.id}
            >
              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold">{rule.label}</h2>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {rule.detail}
                  </p>
                </div>

                <FoundationTable id={rule.id} />
              </section>
            </TabsContent>
          ))}

          <TabsContent className="flex flex-col gap-8" value="colour">
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Every colour</h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  All 57 in globals.css. A colour that is not on this page does
                  not exist — a literal in a component dodges the theme and the
                  whitelabel both.
                </p>
              </div>

              <ColourTable />

              {/* The five tints the chips are painted with are rows in the
                  table above, but a token name does not tell you it is the
                  Completed chip. Same data as the key on the index page —
                  the rows are one component, so they cannot drift apart. */}
              <section className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-medium">
                    In use — status chips
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Where the intent tints actually land. A chip is its own
                    swatch, so this is the tint shown doing its job rather than
                    a second square of it.
                  </p>
                </div>

                <ChipTable />
              </section>
            </section>
          </TabsContent>

          <TabsContent className="flex flex-col gap-8" value="components">
            <ButtonSizes />

            <ButtonRoles />

            <Card>
              <CardHeader>
                <CardTitle>Forms</CardTitle>
                <CardDescription>
                  Eight decisions, all eight visible in the form beside them.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8 lg:grid-cols-2">
                <FormDemo />
                <RuleList rules={FORM_RULES} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Every primitive</CardTitle>
                <CardDescription>
                  All 62 in src/components/ui, grouped by the job they do. If
                  one of these covers it, nothing gets hand-rolled.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComponentCatalog />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="flex flex-col gap-8" value="patterns">
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Choosing a surface</h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Do I still need the page behind this? The amount of content
                  never decides it.
                </p>
              </div>

              {/* Three rows rather than three cards: the choice between them is
                  a comparison, and the criteria only answer it side by side.
                  The diagram says where the surface sits and the demo says what
                  being in it is like, so both stay — as columns. */}
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
            </section>

            {/* Named by Abdulrahman alongside the index page: the other shape
                a product this size actually needs written down. */}
            <Card>
              <CardHeader>
                <CardTitle>{PATTERNS[0].title}</CardTitle>
                <CardDescription>{PATTERNS[0].description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <MultiStepPreview />

                <Separator />
                <PatternAnatomy pattern={PATTERNS[0]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tabs</CardTitle>
                <CardDescription>
                  One object, several views of it. Never steps in a flow, and
                  never two different objects — a tab has no address to send
                  anyone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TabsPreview />
              </CardContent>
            </Card>

            {/* Its own card, and pointedly not a variant of the one above: a
                drawer keeps the page behind it, which is the opposite of what
                a creation flow wants, so it never carries steps. */}
            <Card>
              <CardHeader>
                <CardTitle>Drawer</CardTitle>
                <CardDescription>
                  Configuring one thing, or showing one thing, beside the page
                  it belongs to. Never a flow — if it needs a second screen it
                  was a modal all along.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col">
                <DrawerPreview />
              </CardContent>
            </Card>

            {/* Its own card because it is the component, not the pattern: the
                card above answers what a multi-step creation must contain,
                this one answers what the stepper inside it looks like at each
                orientation. */}
            <Card>
              <CardHeader>
                <CardTitle>Stepper</CardTitle>
                <CardDescription>
                  Vertical where each step needs a line of its own, horizontal
                  where the labels fit. One step between them — clicking either
                  moves both.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StepperPreview />
              </CardContent>
            </Card>
            {/* No section heading over it: it is one card, and the detail and
                create shapes it used to sit beside were generic enough that the
                product does not need them written down. */}
            <Card>
              <CardHeader>
                <CardTitle>Index page</CardTitle>
                <CardDescription>
                  A collection of one kind of object — agents, voices, API keys.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <IndexPagePreview />

                {/* The colour, empty-cell and language keys belong against the rows
                    they explain, so they ride inside this card. */}
                <Separator />
                <ChipNotes />
                <EmptyValueNotes />
                <LanguageNotes />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </MockupShell>
  )
}
