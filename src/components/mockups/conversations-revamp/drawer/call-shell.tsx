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
} from "@/lib/mockups/conversations-revamp-drawer-data"
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
} from "@/components/mockups/conversations-revamp/drawer/icons"

export function CallHeader({
  actions,
  channel = "call",
  state = "complete",
  title,
}: {
  actions?: React.ReactNode
  channel?: Channel
  state?: CallState
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

export function Seekable({
  children,
  className,
  enabled = true,
  label,
  onActivate,
}: {
  children: React.ReactNode
  className?: string
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
