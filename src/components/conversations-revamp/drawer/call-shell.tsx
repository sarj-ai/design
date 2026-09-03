"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  CALL_DETAIL,
  type CallIdentity,
  type CallState,
  type Channel,
  type RevampTurn,
} from "@/lib/conversations-revamp-drawer-data"
import {
  AgentIcon,
  CallerIcon,
  CompletedIcon,
  CopyIcon,
  CopyLinkIcon,
  HumanAgentIcon,
  LanguageIcon,
  OrganizationIcon,
  ChatChannelIcon,
  OutboundIcon,
  OwnerIcon,
  QueuedIcon,
  ScheduledIcon,
} from "@/components/conversations-revamp/drawer/icons"

/**
 * The pieces the drawer shares across its transcript and its section panel.
 *
 * They came out of the earlier drawer variants, which this mockup does not
 * carry — only revamp 4 ships here, so the parts it still needs live on their
 * own rather than inside a variant nobody renders.
 */

/**
 * The metadata that gets read, in one line under the title. The two IDs sit
 * beside the title as buttons, the way the copy-link button already did.
 */
export function CallHeader({
  /** Appended after Link and Call ID. Omitted, the header is unchanged. */
  actions,
  channel = "call",
  state = "complete",
  title,
}: {
  actions?: React.ReactNode
  /** A chat has no phone number to print in the rail. */
  channel?: Channel
  /** A call that has not run has no duration and no time it started. */
  state?: CallState
  /**
   * The clicked row. Without it the header printed one hardcoded call for
   * every row in the table, so opening the 3307 Instalment Plan Offer read as
   * the 4477 Collections Follow Up. The rest of the rail — organization,
   * owner, language — is still the shared sample.
   */
  title?: CallIdentity
} = {}) {
  const call = CALL_DETAIL
  const scenario = title?.scenario ?? call.scenario
  const phoneNumber = title?.phoneNumber ?? call.phoneNumber
  const startedAt = title?.startedAt ?? call.startedAt
  const duration = title?.duration ?? call.connectionDuration
  const ran = state === "complete"
  const isChat = channel === "chat"

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-semibold text-foreground">
              {scenario}
            </h2>
            {ran ? (
              <Badge className="bg-success-tint text-success-tint-foreground">
                <CompletedIcon />
                {call.status}
              </Badge>
            ) : state === "scheduled" ? (
              <Badge className="bg-primary-tint text-primary-tint-foreground">
                <ScheduledIcon />
                scheduled
              </Badge>
            ) : (
              <Badge className="bg-warning-tint text-warning-tint-foreground">
                <QueuedIcon />
                queued
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {/* A chat has no number and no direction. The channel takes the
                slot instead of leaving a gap, so the rail still opens with what
                kind of session this is. */}
            <span className="flex items-center gap-1 font-medium text-foreground">
              {isChat ? (
                <ChatChannelIcon className="size-3.5" />
              ) : (
                <OutboundIcon className="size-3.5" />
              )}
              {isChat ? "Chat" : phoneNumber}
            </span>
            <Separator className="h-3" orientation="vertical" />
            <span className="flex items-center gap-1">
              <OrganizationIcon className="size-3.5" />
              {call.organization}
            </span>
            <span className="flex items-center gap-1">
              <OwnerIcon className="size-3.5" />
              {call.user}
            </span>
            <span className="flex items-center gap-1">
              <LanguageIcon className="size-3.5" />
              {call.language}
            </span>
            {/* A call that has not run has no start time and no duration, and
                printing the ones from a finished call would be a lie the
                reader has no way to spot. */}
            {ran ? (
              <>
                <Separator className="h-3" orientation="vertical" />
                <span>{startedAt}</span>
                <span>{duration}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button size="sm" variant="ghost">
            <CopyLinkIcon />
            Link
          </Button>
          <Button size="sm" variant="ghost">
            <CopyIcon />
            Call ID
          </Button>
          {actions}
        </div>
      </div>
    </div>
  )
}

/**
 * A clickable surface that is not a Button: the bubbles, chips and the waveform
 * track carry their own shape, and a Button would fight its own padding and
 * radius. Keyboard behaviour is the part that has to be kept by hand.
 */
export function Seekable({
  children,
  className,
  enabled = true,
  label,
  onActivate,
}: {
  children: React.ReactNode
  className?: string
  /**
   * False on a chat, where there is no recording to seek into. The turn still
   * renders identically — it just stops claiming to be clickable, because a
   * pointer cursor and a focus ring on something that does nothing is worse
   * than no affordance at all.
   */
  enabled?: boolean
  label: string
  onActivate: () => void
}) {
  if (!enabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      aria-label={label}
      className={cn(
        "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onActivate()
        }
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  )
}

export function SpeakerAvatar({ role }: { role: RevampTurn["role"] }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-4xl",
        role === "caller"
          ? "bg-muted text-foreground"
          : "bg-primary/10 text-primary",
      )}
    >
      {role === "caller" ? (
        <CallerIcon className="size-4" />
      ) : role === "human agent" ? (
        <HumanAgentIcon className="size-4" />
      ) : (
        <AgentIcon className="size-4" />
      )}
    </span>
  )
}
