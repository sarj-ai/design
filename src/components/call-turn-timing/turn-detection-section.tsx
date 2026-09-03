"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  RECOMMENDED_MAX_WAIT_CEILING_SECONDS,
  formatSeconds,
  type TurnTimingRecord,
} from "@/lib/call-turn-timing-data"

import {
  DetectionPathIcon,
  FellBackIcon,
  FieldHelpIcon,
  NotRecordedIcon,
  ReachedMaximumIcon,
  TurnDetectionIcon,
  WithinWindowIcon,
} from "./icons"

/**
 * The section this ticket adds to a call's Model Settings tab.
 *
 * It answers the one question the tab cannot answer today — why this call was
 * paced the way it was — so it leads the tab rather than trailing the config
 * echoes below it. Three blocks, in the order a pacing complaint gets read:
 * which path ran, what window it was given, and what the caller actually sat
 * through.
 */
export function TurnDetectionSection({
  timing,
}: {
  /** `null` for a call placed before turn timing was recorded. */
  timing: null | TurnTimingRecord
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 text-base font-medium">
          <TurnDetectionIcon />
          Turn detection
        </h3>
        {timing ? <OutcomeBadge timing={timing} /> : null}
      </div>

      {timing ? <RecordedTiming timing={timing} /> : <NotRecorded />}
    </section>
  )
}

function RecordedTiming({ timing }: { timing: TurnTimingRecord }) {
  const fellBack = timing.fallbackReason !== null
  const firstTurnReachedMaximum =
    timing.firstTurnWaitSeconds >= timing.maxWaitSeconds

  return (
    <div className="flex flex-col gap-6">
      <Block
        title="Path that ran"
        help="Chosen in Global Settings. The agent falls back when the configured path cannot start, and the call continues either way."
      >
        <ItemGroup className="gap-2">
          {fellBack ? (
            <Item variant="outline">
              <ItemMedia variant="icon">
                <DetectionPathIcon className="text-muted-foreground" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-muted-foreground">
                  {timing.configured.label}
                </ItemTitle>
                <ItemDescription>
                  {timing.configured.description}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="self-start">
                <Badge variant="outline">Configured</Badge>
              </ItemActions>
            </Item>
          ) : null}

          <Item variant="outline">
            <ItemMedia variant="icon">
              {fellBack ? <FellBackIcon /> : <DetectionPathIcon />}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{timing.ran.label}</ItemTitle>
              <ItemDescription>{timing.ran.description}</ItemDescription>
            </ItemContent>
            <ItemActions className="self-start">
              <Badge variant={fellBack ? "destructive" : "secondary"}>
                {fellBack ? "Ran instead" : "Configured and ran"}
              </Badge>
            </ItemActions>
          </Item>
        </ItemGroup>

        {timing.fallbackReason ? (
          <Alert variant="destructive">
            <FellBackIcon />
            <AlertTitle>
              {timing.configured.label} did not run on this call
            </AlertTitle>
            <AlertDescription>
              {timing.fallbackReason} The wait values below are the ones the
              fallback applied, not the ones configured for{" "}
              {timing.configured.label}.
            </AlertDescription>
          </Alert>
        ) : null}
      </Block>

      <Block
        title="Wait window that applied"
        help="Read once at call start. A settings change since then has not affected this call."
        action={
          <Badge variant="secondary">
            {timing.waitSource === "persona"
              ? `Persona override · ${timing.persona}`
              : `Global default · ${timing.persona} inherits`}
          </Badge>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Stat
            label="Minimum wait"
            value={formatSeconds(timing.minWaitSeconds)}
            caption="Applied on every confident turn."
            help="How long the agent held off once the model was confident the caller had finished."
          />
          <Stat
            label="Maximum wait"
            value={formatSeconds(timing.maxWaitSeconds)}
            caption={
              timing.maxWaitSeconds > RECOMMENDED_MAX_WAIT_CEILING_SECONDS
                ? "Above the recommended ceiling, so an unsure model left callers waiting longer."
                : "Inside the recommended band."
            }
            help="The ceiling the agent waited out whenever the model could not decide."
          />
        </div>
      </Block>

      <Block
        title="What the caller sat through"
        help="Recorded per turn, independent of the detection model — a path that failed to start is still measured."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Stat
            label="Turns at the maximum"
            value={`${timing.turnsAtMaximum} of ${timing.turnCount}`}
            caption={
              timing.turnsAtMaximum === 0
                ? "Every turn resolved before the ceiling."
                : "The model never reached confidence on these, so the full maximum applied."
            }
            tone={timing.turnsAtMaximum === 0 ? "default" : "warning"}
          />
          <Stat
            label="First turn"
            value={formatSeconds(timing.firstTurnWaitSeconds)}
            caption={
              firstTurnReachedMaximum
                ? "Reached the maximum. This is the first thing the caller experienced."
                : "Resolved inside the window."
            }
            tone={firstTurnReachedMaximum ? "warning" : "default"}
          />
        </div>

        {firstTurnReachedMaximum ? (
          <Alert>
            <ReachedMaximumIcon className="text-warning" />
            <AlertTitle>
              The opening turn waited the full{" "}
              {formatSeconds(timing.maxWaitSeconds)}
            </AlertTitle>
            <AlertDescription>
              Lowering the maximum wait on {timing.persona} shortens this
              silence, at the cost of interrupting callers who pause
              mid-sentence.
            </AlertDescription>
          </Alert>
        ) : null}
      </Block>
    </div>
  )
}

/** A call from before turn timing was recorded shows nothing rather than today's settings. */
function NotRecorded() {
  return (
    <Empty className="rounded-lg border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <NotRecordedIcon />
        </EmptyMedia>
        <EmptyTitle>Turn timing was not recorded</EmptyTitle>
        <EmptyDescription>
          This call was placed before the detection path and wait values were
          captured. The settings in effect now are not necessarily the ones this
          call ran with, so they are not shown here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

/** The one-word verdict, so the section can be triaged from the collapsed tab. */
function OutcomeBadge({ timing }: { timing: TurnTimingRecord }) {
  if (timing.fallbackReason !== null) {
    return <Badge variant="destructive">Fell back</Badge>
  }

  if (timing.turnsAtMaximum > 0) {
    return (
      <Badge className="bg-warning/15 text-warning-foreground">
        <ReachedMaximumIcon />
        Reached the maximum
      </Badge>
    )
  }

  return (
    <Badge variant="secondary">
      <WithinWindowIcon />
      Within the window
    </Badge>
  )
}

/**
 * A block of the panel.
 *
 * `help` replaced what used to be a `description` printed under every title.
 * The split that survived review: a sentence that *defines* how the platform
 * works is read once and belongs on the (i); a sentence that *reads this call*
 * is the content and stays on the surface. Three definitions came off this
 * panel that way.
 */
function Block({
  title,
  help,
  action,
  children,
}: {
  title: string
  help: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{title}</span>
          <HelpDot label={`What "${title}" means`}>{help}</HelpDot>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  )
}

function HelpDot({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        className="cursor-help text-muted-foreground"
      >
        <FieldHelpIcon className="size-4" />
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{children}</TooltipContent>
    </Tooltip>
  )
}

/**
 * One reading. `caption` is this call's verdict and stays visible; `help` is
 * the metric's definition and goes on the (i).
 */
function Stat({
  label,
  value,
  caption,
  help,
  tone = "default",
}: {
  label: string
  value: string
  caption: string
  help?: string
  tone?: "default" | "warning"
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted p-4">
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        {label}
        {help ? (
          <HelpDot label={`What "${label}" measures`}>{help}</HelpDot>
        ) : null}
      </span>
      <span
        className={
          tone === "warning"
            ? "text-xl font-semibold text-warning-foreground"
            : "text-xl font-semibold"
        }
      >
        {value}
      </span>
      <p className="text-sm text-muted-foreground">{caption}</p>
    </div>
  )
}
