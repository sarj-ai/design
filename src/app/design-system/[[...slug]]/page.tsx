import { ButtonRoles } from "@/components/design-system/button-roles"
import { ColourTable } from "@/components/design-system/colour-table"
import { OrbAnatomy } from "@/components/design-system/orb-anatomy"
import { OrbAvatar } from "@/components/shared/orb-avatar"
import { ORB_TONES } from "@/components/shared/orb-tones"
import {
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import { DesignSystemDocs } from "@/components/design-system/docs-shell"
import { MultiStepPreview } from "@/components/design-system/multi-step-preview"
import { PatternAnatomy } from "@/components/design-system/pattern-anatomy"
import { ButtonSizes } from "@/components/design-system/button-sizes"
import { ChipNotes } from "@/components/design-system/chip-notes"
import { SaveBarPreview } from "@/components/design-system/save-bar-preview"
import { SectionCardPreview } from "@/components/design-system/section-card-preview"
import { CreationFlowPreview } from "@/components/design-system/creation-flow-preview"
import { JsonViewPreview } from "@/components/design-system/json-view-preview"
import { AlertPreview } from "@/components/design-system/alert-preview"
import { IntegrationCardPreview } from "@/components/design-system/integration-card-preview"
import { DevelopersPage } from "@/components/mockups/developers/developers-page"
import { DrawerAnatomyPreview } from "@/components/design-system/drawer-anatomy-preview"
import { EmptyValueNotes } from "@/components/design-system/empty-value-notes"
import { FoundationTable } from "@/components/design-system/foundation-tables"
import { FormDemo } from "@/components/design-system/form-demo"
import { LanguageNotes } from "@/components/design-system/language-notes"
import { IndexPageDemo } from "@/components/design-system/index-page-demo"
import { AdminViewPagePreview } from "@/components/design-system/admin-view-preview"
import { IndexPagePreview } from "@/components/design-system/page-preview"
import { RowActionNotes } from "@/components/design-system/row-action-notes"
import { MotionTable } from "@/components/design-system/motion-tables"
import { RuleList } from "@/components/design-system/rule-list"
import { StepperPreview } from "@/components/design-system/stepper-preview"
import { SelectionPreview } from "@/components/design-system/selection-preview"
import { TabsPreview } from "@/components/design-system/tabs-preview"
import { SurfaceDecisionPreview } from "@/components/design-system/surface-decision-preview"
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
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  EMPTY_STATE_RULES,
  ERROR_RULES,
  FORM_RULES,
  GLOBAL_RULES,
  LOADING_RULES,
  MOTION_RULES,
  NO_RESULTS_RULES,
  PATTERNS,
} from "@/lib/design-system/data"
import { docsParams, resolveDocs } from "@/lib/design-system/nav"
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
 * Every topic in `DOCS_SECTIONS` needs an entry here. A section does not: its
 * page is the list of its topics, which the shell draws.
 *
 * No topic repeats its own title in a card header: the heading above the pane
 * has already said it. A live demo still sits on a `Card` — a lone "Open
 * drawer" button on the page background is a control with nothing under it —
 * while a topic that is only a reference table stays bare, because a table
 * inside a card is two edges drawn around one thing.
 */
/* The avatar group on the avatar topic. */
const ORB_NAMES = ["Sara", "Nour", "Yusuf"]

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
      page={location.page}
      section={location.section}
      views={{
        /* Foundations — what is fixed. */
        colour: <ColourTable />,
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
        /* The choice is two questions, so the page asks them. */
        surfaces: <SurfaceDecisionPreview />,

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

        index: <IndexPageDemo />,
        "drawer-anatomy": (
          <Card>
            <CardContent>
              <DrawerAnatomyPreview />
            </CardContent>
          </Card>
        ),
        "admin-view": <AdminViewPagePreview />,
        "section-card": <SectionCardPreview />,
        "creation-flow": <CreationFlowPreview />,
        "json-view": <JsonViewPreview />,
        alert: <AlertPreview />,
        "unsaved-changes": <SaveBarPreview />,
        "integration-card": <IntegrationCardPreview />,
        developers: (
          /* Framed like the admin view: `translate-x-0` makes the frame the
             containing block for the app's fixed sidebar. */
          <div className="relative flex h-180 translate-x-0 flex-col overflow-hidden rounded-xl border">
            <DevelopersPage framed />
          </div>
        ),
        "orb-avatar": (
          <div className="flex flex-col gap-4">
            {/* One height per row: the grid stretches each card to the
                tallest beside it. The demo and the sizes share a row; the six
                tones need one of their own. */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* The shadcn avatar demo, with the orb in place of the photo:
                on its own, with a status badge, and as a group with a
                count. */}
              <Card>
                <CardContent className="flex min-h-48 flex-1 flex-wrap items-center justify-center gap-8">
                  <OrbAvatar name="Layla" />
                  <OrbAvatar name="Omar">
                    <AvatarBadge className="bg-success" />
                  </OrbAvatar>
                  <AvatarGroup>
                    {ORB_NAMES.map((name) => (
                      <OrbAvatar key={name} name={name} />
                    ))}
                    <AvatarGroupCount>+3</AvatarGroupCount>
                  </AvatarGroup>
                </CardContent>
              </Card>
              {/* The primitive's three sizes: 24, 32 and 40px. */}
              <Card>
                <CardContent className="flex min-h-48 flex-1 items-center justify-center gap-6">
                  {(["sm", "default", "lg"] as const).map((size) => (
                    <OrbAvatar key={size} name="Layla" size={size} />
                  ))}
                </CardContent>
              </Card>
              {/* Every tone, on one name, so only the colour changes. */}
              <Card className="sm:col-span-2">
                <CardContent className="flex min-h-48 flex-1 flex-wrap items-center justify-center gap-4">
                  {ORB_TONES.map((tone) => (
                    <OrbAvatar key={tone} name="Layla" size="lg" tone={tone} />
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent>
                <OrbAnatomy className="text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        ),
      }}
    />
  )
}
