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
import { PatternAnatomy } from "@/components/design-system/pattern-anatomy"
import { ButtonSizes } from "@/components/design-system/button-sizes"
import { ChipNotes } from "@/components/design-system/chip-notes"
import { SaveBarPreview } from "@/components/design-system/save-bar-preview"
import { SectionCardPreview } from "@/components/design-system/section-card-preview"
import { CreationFlowPreview } from "@/components/design-system/creation-flow-preview"
import { JsonViewPreview } from "@/components/design-system/json-view-preview"
import { AlertPreview } from "@/components/design-system/alert-preview"
import { RecordingPreview } from "@/components/design-system/recording-preview"
import { IntegrationCardPreview } from "@/components/design-system/integration-card-preview"
import { DevelopersPage } from "@/components/mockups/developers/developers-page"
import { DrawerAnatomyPreview } from "@/components/design-system/drawer-anatomy-preview"
import { EmptyValueNotes } from "@/components/design-system/empty-value-notes"
import { FoundationTable } from "@/components/design-system/foundation-tables"
import { FormDemo } from "@/components/design-system/form-demo"
import { LanguageNotes } from "@/components/design-system/language-notes"
import { IndexPageDemo } from "@/components/design-system/index-page-demo"
import { AdminViewPagePreview } from "@/components/design-system/admin-view-preview"
import { NotificationsPreview } from "@/components/design-system/notifications-preview"
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

  if (!location) notFound()

  return (
    <DesignSystemDocs
      page={location.page}
      section={location.section}
      views={{
        colour: <ColourTable />,
        ...Object.fromEntries(
          GLOBAL_RULES.map((rule) => [
            rule.id,
            <FoundationTable id={rule.id} key={rule.id} />,
          ]),
        ),

        layering: <LayerTable />,
        "control-scale": <ControlScale />,
        enforcement: <LintRules />,

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

        surfaces: <SurfaceDecisionPreview />,

        tabs: (
          <Card>
            <CardContent>
              <TabsPreview />
            </CardContent>
          </Card>
        ),

        selection: (
          <Card>
            <CardContent>
              <SelectionPreview />
            </CardContent>
          </Card>
        ),

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

              <Separator />
              <ChipNotes />
              <EmptyValueNotes />
              <LanguageNotes />
              <RowActionNotes />
            </CardContent>
          </Card>
        ),
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
        notifications: <NotificationsPreview />,
        "section-card": <SectionCardPreview />,
        "creation-flow": (
          <div className="flex flex-col gap-4">
            <CreationFlowPreview />
            <Card>
              <CardContent>
                <PatternAnatomy pattern={PATTERNS[0]} />
              </CardContent>
            </Card>
          </div>
        ),
        "json-view": <JsonViewPreview />,
        alert: <AlertPreview />,
        recording: <RecordingPreview />,
        "unsaved-changes": <SaveBarPreview />,
        "integration-card": <IntegrationCardPreview />,
        developers: (
          // `translate-x-0` makes the frame the containing block for the app's fixed sidebar.
          <div className="relative flex h-180 translate-x-0 flex-col overflow-hidden rounded-xl border">
            <DevelopersPage framed />
          </div>
        ),
        "orb-avatar": (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
              <Card>
                <CardContent className="flex min-h-48 flex-1 items-center justify-center gap-6">
                  {(["sm", "default", "lg"] as const).map((size) => (
                    <OrbAvatar key={size} name="Layla" size={size} />
                  ))}
                </CardContent>
              </Card>
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
