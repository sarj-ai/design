"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ConfiguredIcon,
  DismissIcon,
  UnsavedIcon,
} from "@/components/scenario-single-screen/icons"
import { SheetSection } from "@/components/scenario-single-screen/setting-sheet"
import {
  CURRENT_ORGANIZATION,
  type Insight,
  type InsightTarget,
  type Opportunity,
  ORGANIZATIONS,
} from "@/lib/scenario-single-screen-data"

/** What each insight's "take me there" button opens. */
const TARGET_LABELS: Record<InsightTarget, string> = {
  criteria: "success criteria",
  extraction: "data extraction",
  knowledge: "knowledge bases",
  prompt: "the prompt",
  tools: "tools",
}

/* -------------------------------------------------------------- insights -- */

/**
 * Every insight names the setting it is about and opens it.
 *
 * This is the one place the tabbed editor was actively hostile: an insight
 * would tell you the late-arrival policy was wrong and then leave you to work
 * out that the fix lived under a different tab. With one screen the insight
 * can just open the drawer.
 */
export function InsightsDrawerBody({
  dismissed,
  insights,
  onDismiss,
  onOpenTarget,
}: {
  dismissed: string[]
  insights: Insight[]
  onDismiss: (title: string) => void
  onOpenTarget: (target: InsightTarget) => void
}) {
  const open = insights.filter((insight) => !dismissed.includes(insight.title))

  if (open.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ConfiguredIcon />
          </EmptyMedia>
          <EmptyTitle>Nothing left to review</EmptyTitle>
          <EmptyDescription>
            New insights appear as calls come in.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {open.map((insight) => (
        <Card key={insight.title} size="sm">
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{insight.title}</p>
              <p className="text-sm text-muted-foreground">{insight.body}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{insight.calls} calls</Badge>
              <div className="flex-1" />
              <Button
                onClick={() => {
                  onDismiss(insight.title)
                }}
                size="xs"
                variant="ghost"
              >
                <DismissIcon />
                Dismiss
              </Button>
              <Button
                onClick={() => {
                  onOpenTarget(insight.target)
                }}
                size="xs"
                variant="outline"
              >
                Open {TARGET_LABELS[insight.target]}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ------------------------------------------------- optimization opportunities -- */

const IMPACT_VARIANT = {
  high: "default",
  low: "outline",
  medium: "secondary",
} as const

export function OpportunitiesDrawerBody({
  opportunities,
}: {
  opportunities: Opportunity[]
}) {
  return (
    <div className="flex flex-col gap-3">
      {opportunities.map((opportunity) => (
        <Card key={opportunity.title} size="sm">
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{opportunity.title}</p>
              <Badge variant={IMPACT_VARIANT[opportunity.impact]}>
                {opportunity.impact} impact
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {opportunity.detail}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------- ownership -- */

export function OwnershipDrawerBody({
  attachedBases,
}: {
  attachedBases: number
}) {
  const [organization, setOrganization] = React.useState(CURRENT_ORGANIZATION)
  const moving = organization !== CURRENT_ORGANIZATION

  return (
    <SheetSection title="Owning organization">
      <Field>
        <FieldLabel htmlFor="owner-organization">Organization</FieldLabel>
        <Select onValueChange={setOrganization} value={organization}>
          <SelectTrigger id="owner-organization">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORGANIZATIONS.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          Currently owned by {CURRENT_ORGANIZATION}.
        </FieldDescription>
      </Field>

      {moving ? (
        <Alert variant="destructive">
          <UnsavedIcon />
          <AlertTitle>
            {attachedBases} knowledge bases will be detached
          </AlertTitle>
          <AlertDescription>
            Knowledge bases do not move between organizations. Reattach the
            equivalents in {organization} before the next publish.
          </AlertDescription>
        </Alert>
      ) : null}

      <Button disabled={!moving} variant="destructive">
        Transfer to {organization}
      </Button>
    </SheetSection>
  )
}
