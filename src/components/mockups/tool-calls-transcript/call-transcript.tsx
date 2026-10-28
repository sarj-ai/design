"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  AgentIcon,
  CopiedIcon,
  CopyIcon,
  ExpandIcon,
  ToolCompletedIcon,
  ToolFailedIcon,
  ToolIcon,
} from "@/components/mockups/tool-calls-transcript/icons"
import { JsonView } from "@/components/design-system/json-view-preview"
import { OrbAvatar } from "@/components/shared/orb-avatar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type {
  TranscriptMessage,
  TranscriptRole,
} from "@/lib/mockups/tool-calls-transcript-data"
import { cn } from "@/lib/utils"

type Call = Extract<TranscriptMessage, { type: "function_call" }>
type Result = Extract<TranscriptMessage, { type: "function_call_output" }>
type Speech = Extract<TranscriptMessage, { type: "message" }>
type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

type Row =
  | { kind: "speech"; key: string; message: Speech }
  | { kind: "tool"; key: string; call?: Call; result?: Result }

/** A result whose call is missing still gets its own row where it landed. */
function toRows(messages: TranscriptMessage[]): Row[] {
  const rows: Row[] = []
  const tools = new Map<string, Extract<Row, { kind: "tool" }>>()

  messages.forEach((message, index) => {
    if (message.type === "message") {
      rows.push({ kind: "speech", key: `m${index}`, message })
      return
    }

    const existing = tools.get(message.toolCallId)
    if (message.type === "function_call_output" && existing) {
      existing.result = message
      return
    }

    const row: Extract<Row, { kind: "tool" }> =
      message.type === "function_call"
        ? { kind: "tool", key: message.toolCallId, call: message }
        : { kind: "tool", key: message.toolCallId, result: message }
    tools.set(message.toolCallId, row)
    rows.push(row)
  })

  return rows
}

/** A tool joins the agent message before it, else the one after; with neither it stands alone. */
function toTurns(rows: Row[]): Row[][] {
  const turns: Row[][] = []
  const isAgent = (row?: Row) =>
    row?.kind === "tool" ||
    (row?.kind === "speech" && row.message.role === "assistant")

  for (const row of rows) {
    const last = turns.at(-1)

    if (row.kind === "tool" && last && isAgent(last.at(-1))) {
      last.push(row)
    } else if (
      row.kind === "speech" &&
      row.message.role === "assistant" &&
      last &&
      !last.some((item) => item.kind === "speech")
    ) {
      last.push(row)
    } else {
      turns.push([row])
    }
  }

  return turns
}

export function CallTranscript({
  messages,
  startedAt,
}: {
  messages: TranscriptMessage[]
  startedAt: number
}) {
  return (
    <div className="flex flex-col gap-4">
      {toTurns(toRows(messages)).map((turn) => (
        <div className="flex flex-col gap-1.5" key={turn[0].key}>
          {turn.map((row) =>
            row.kind === "speech" ? (
              <SpeechTurn
                key={row.key}
                message={row.message}
                startedAt={startedAt}
              />
            ) : (
              <ToolRow
                call={row.call}
                key={row.key}
                result={row.result}
                startedAt={startedAt}
              />
            ),
          )}
        </div>
      ))}
    </div>
  )
}

const SPEAKERS: Record<TranscriptRole, { label: string; isCaller: boolean }> = {
  assistant: { label: "Agent", isCaller: false },
  user: { label: "Customer", isCaller: true },
  "human agent": { label: "Human agent", isCaller: false },
}

function SpeechTurn({
  message,
  startedAt,
}: {
  message: Speech
  startedAt: number
}) {
  const speaker = SPEAKERS[message.role]

  return (
    <div className={cn("flex gap-3", speaker.isCaller && "flex-row-reverse")}>
      {message.role === "assistant" ? (
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary">
            <AgentIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
      ) : (
        <OrbAvatar name={speaker.label} />
      )}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1 rounded-lg px-4 py-2.5",
          speaker.isCaller
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <span className="flex items-center gap-4 text-xs opacity-70">
          <span className="font-medium">{speaker.label}</span>
          <span className="ms-auto tabular-nums">
            {formatOffset(message.startAt, startedAt)}
          </span>
        </span>
        {/* Each line takes its direction from its first strong character. */}
        <p className="text-sm" dir="auto">
          {message.content}
        </p>
      </div>
    </div>
  )
}

/** Never "0 ms" for a duration nobody measured. */
function formatDuration(ms: number | null | undefined) {
  if (ms === null || ms === undefined) return null
  if (ms < 1000) return `${Math.round(ms)} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`
  const seconds = Math.round(ms / 1000)
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`
}

function formatOffset(at: number, startedAt: number) {
  const seconds = Math.max(0, Math.round(at - startedAt))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function parseJson(text: string): Json | null {
  const trimmed = text.trim()
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null
  try {
    return JSON.parse(trimmed) as Json
  } catch {
    return null
  }
}

function isEmptyArguments(value: string) {
  const json = parseJson(value)
  return (
    value.trim() === "" ||
    (json !== null &&
      typeof json === "object" &&
      Object.keys(json).length === 0)
  )
}

function humanize(name: string) {
  const words = name.replace(/[_-]+/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function ToolRow({
  call,
  result,
  startedAt,
}: {
  call?: Call
  result?: Result
  startedAt: number
}) {
  const toolName = call?.toolName ?? result?.toolName ?? ""
  const failed = result?.isError === true
  const output = result?.output.trim() ?? ""
  const completed = result !== undefined && !failed && output === ""
  const duration = formatDuration(result?.durationMs)
  const calledAt = call?.startAt ?? result?.startAt
  const hasArguments = call !== undefined && !isEmptyArguments(call.arguments)
  const label = humanize(toolName)

  return (
    <Collapsible className="ms-11 flex flex-col items-start">
      <CollapsibleTrigger className="group/tool -mx-2 -my-1 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground outline-none transition-colors duration-150 ease-out-cubic hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none">
        {failed ? (
          <ToolFailedIcon className="size-3.5 shrink-0 text-destructive" />
        ) : completed ? (
          <ToolCompletedIcon className="size-3.5 shrink-0 text-success" />
        ) : (
          <ToolIcon className="size-3.5 shrink-0" />
        )}
        <span>
          {label}
          {failed ? <span className="text-destructive"> failed</span> : null}
          {completed ? " completed" : null}
        </span>
        {result === undefined ? <span>· No result</span> : null}
        {calledAt !== undefined ? (
          <span className="tabular-nums">
            · {formatOffset(calledAt, startedAt)}
          </span>
        ) : null}
        <ExpandIcon className="size-3.5 transition-transform duration-150 ease-out-cubic group-data-[state=open]/tool:rotate-180 motion-reduce:transition-none" />
      </CollapsibleTrigger>

      <CollapsibleContent className="self-stretch overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
        <div className="mt-3 flex flex-col gap-4 rounded-lg bg-muted p-4">
          {hasArguments ? (
            <Section label="Called with">
              <Payload value={call.arguments} />
            </Section>
          ) : null}
          <div className="flex gap-8">
            {duration ? (
              <Fact label="Duration">
                <span className="tabular-nums">{duration}</span>
              </Fact>
            ) : null}
            <Fact label="Tool">
              <span className="font-mono" dir="ltr">
                {toolName}
              </span>
            </Fact>
          </div>
          {output !== "" ? (
            <Section label="Returned">
              <Payload value={output} />
            </Section>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function Section({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <Collapsible className="flex flex-col gap-2" defaultOpen>
      <CollapsibleTrigger className="group/section -mx-1 flex w-fit items-center gap-1 rounded-sm px-1 text-xs text-muted-foreground outline-none transition-colors duration-150 ease-out-cubic hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none">
        <ExpandIcon className="size-3.5 transition-transform duration-150 ease-out-cubic group-data-[state=closed]/section:-rotate-90 motion-reduce:transition-none" />
        {label}
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function Fact({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}

/** Pinned LTR so an Arabic page does not reorder its punctuation. */
function Payload({ value }: { value: string }) {
  const json = parseJson(value)
  const [copied, setCopied] = React.useState(false)

  if (json !== null) {
    return (
      <div className="rounded-lg bg-background" dir="ltr">
        <JsonView value={json} />
      </div>
    )
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Could not copy — select the text instead")
    }
  }

  return (
    <div className="relative rounded-lg border bg-background" dir="ltr">
      <pre className="max-h-64 overflow-auto py-3 ps-3 pe-12 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
        {value}
      </pre>
      <div className="absolute end-2 top-2">
        <Button
          aria-label={copied ? "Copied" : "Copy"}
          onClick={() => void copy()}
          size="icon-sm"
          variant="ghost"
        >
          {copied ? <CopiedIcon /> : <CopyIcon />}
        </Button>
      </div>
    </div>
  )
}
