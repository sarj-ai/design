"use client"

import type * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  AgentIcon,
  CallerIcon,
  ExpandIcon,
  HumanAgentIcon,
  ToolCompletedIcon,
  ToolFailedIcon,
  ToolIcon,
} from "@/components/mockups/tool-calls-transcript/icons"
import { Separator } from "@/components/ui/separator"
import type {
  TranscriptMessage,
  TranscriptRole,
} from "@/lib/mockups/tool-calls-transcript-data"
import { cn } from "@/lib/utils"

/**
 * The call transcript with tool calls — DES-205.
 *
 * Drawn the way the reviewed call drawer draws a transcript
 * (`/conversations-revamp`): a tinted avatar, a bubble with the speaker and the
 * time into the call on its first line, and a tool as a pill on a rule between
 * the turns. The design system has no transcript pattern of its own yet, so
 * that drawer is the reference.
 *
 * A call and its result are one pill. They arrive as two items linked by
 * `toolCallId`, often with speech between them, and as two pills the reader
 * had to match them up by eye. The pill sits where the call was made and
 * carries its result, so whatever was said while the tool ran reads after it.
 *
 * The UI only knows `isError`, so a failure is the one state it can name from
 * the flag: colour, an icon of its own and the word "Failed", so it cannot be
 * read as anything else, in colour or without it. A tool that returned text —
 * an availability check, an instruction to retry — keeps the plain wrench and
 * no status word, because "Transfer NOT COMPLETED" comes back without the
 * flag; its text is one click away. A tool that returned nothing and no error
 * finished with nothing to add — a transfer that handed off, an end_call —
 * and reads "Completed". That is the only case a check can mark without
 * contradicting what it says.
 */

type Call = Extract<TranscriptMessage, { type: "function_call" }>
type Result = Extract<TranscriptMessage, { type: "function_call_output" }>
type Speech = Extract<TranscriptMessage, { type: "message" }>
type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

type Row =
  | { kind: "speech"; key: string; message: Speech }
  | { kind: "tool"; key: string; call?: Call; result?: Result }

/**
 * Folds each result into its call's row. A result whose call is missing still
 * gets a row of its own where it landed, so nothing the agent recorded drops
 * off the transcript.
 */
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

export function CallTranscript({
  messages,
  startedAt,
}: {
  messages: TranscriptMessage[]
  startedAt: number
}) {
  return (
    <div className="flex flex-col gap-4">
      {toRows(messages).map((row) =>
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
  )
}

/* ------------------------------------------------------------------ speech */

const SPEAKERS: Record<
  TranscriptRole,
  { icon: React.ReactNode; label: string; isCaller: boolean }
> = {
  assistant: {
    icon: <AgentIcon className="size-4" />,
    label: "Agent",
    isCaller: false,
  },
  user: {
    icon: <CallerIcon className="size-4" />,
    label: "Customer",
    isCaller: true,
  },
  "human agent": {
    icon: <HumanAgentIcon className="size-4" />,
    label: "Human agent",
    isCaller: false,
  },
}

function SpeakerAvatar({
  isCaller,
  icon,
}: {
  isCaller: boolean
  icon: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-4xl",
        isCaller ? "bg-muted text-foreground" : "bg-primary/10 text-primary",
      )}
    >
      {icon}
    </span>
  )
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
      <SpeakerAvatar icon={speaker.icon} isCaller={speaker.isCaller} />
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1 rounded-lg px-4 py-2.5",
          speaker.isCaller
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {/* Who and when on the first line, as the call drawer has it. */}
        <span className="flex items-center gap-4 text-xs opacity-70">
          <span className="font-medium">{speaker.label}</span>
          <span className="ms-auto tabular-nums">
            {formatOffset(message.startAt, startedAt)}
          </span>
        </span>
        {/* The call is usually Arabic and the UI English: each line picks its
            own direction from its first strong character. */}
        <p className="text-sm" dir="auto">
          {message.content}
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- tool */

/** 640 ms · 4.2 s · 1 min 12 s. Never "0 ms" for a duration nobody measured. */
function formatDuration(ms: number | null | undefined) {
  if (ms === null || ms === undefined) return null
  if (ms < 1000) return `${Math.round(ms)} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`
  const seconds = Math.round(ms / 1000)
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`
}

/** Time into the call, as the recording player counts it. */
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

  /* Every pill with something in it opens, so the chevron means the same on
     every pill. Only an empty one stays shut. */
  const showOutput = output !== ""
  const canOpen = hasArguments || showOutput

  const pill = (
    <>
      {failed ? (
        <ToolFailedIcon className="size-3 shrink-0" />
      ) : completed ? (
        <ToolCompletedIcon className="size-3 shrink-0 text-success" />
      ) : (
        <ToolIcon className="size-3 shrink-0" />
      )}
      <span className="font-mono" dir="ltr">
        {toolName}
      </span>
      {failed ? <span className="font-medium">Failed</span> : null}
      {completed ? <span className="font-medium">Completed</span> : null}
      {/* The call went out and nothing came back — not a state the tool
          reported, so it is the page talking, in the page's quiet voice. */}
      {result === undefined ? (
        <span className="text-muted-foreground">No result</span>
      ) : null}
      {duration ? (
        <span className="text-muted-foreground tabular-nums">{duration}</span>
      ) : null}
      {calledAt !== undefined ? (
        <span className="text-muted-foreground tabular-nums">
          {formatOffset(calledAt, startedAt)}
        </span>
      ) : null}
      {canOpen ? (
        <ExpandIcon className="size-3 transition-transform duration-150 ease-out-cubic group-data-[state=open]/tool:rotate-180 motion-reduce:transition-none" />
      ) : null}
    </>
  )

  /* A pill on a rule, as the call drawer draws a tool: it sits between the
     turns as something that happened on the call, not as a fourth speaker.
     It carries only what fits on one short line; what the tool returned is
     one click away, below it. */
  const pillClass = cn(
    "flex items-center gap-2 rounded-4xl px-3 py-1 text-xs",
    failed
      ? "bg-destructive/10 text-destructive"
      : "bg-secondary text-secondary-foreground",
  )

  if (!canOpen) {
    return (
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <div className={pillClass}>{pill}</div>
        <Separator className="flex-1" />
      </div>
    )
  }

  return (
    <Collapsible className="flex flex-col">
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <CollapsibleTrigger
          className={cn(
            pillClass,
            "group/tool outline-none transition-colors duration-150 ease-out-cubic focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
            failed ? "hover:bg-destructive/20" : "hover:bg-accent",
          )}
        >
          {pill}
        </CollapsibleTrigger>
        <Separator className="flex-1" />
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
        <div className="mt-2 flex flex-col gap-3 rounded-lg bg-muted p-3">
          {hasArguments ? (
            <Payload label="Arguments" value={call.arguments} />
          ) : null}
          {showOutput ? <Payload label="Output" value={output} /> : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * What went to the tool or came back, verbatim, in monospace — so it reads as
 * "this is what the model saw", not as page copy. JSON is pretty-printed into
 * the same block. No border: the white block on the row's tint is the edge.
 */
function Payload({ label, value }: { label: string; value: string }) {
  const json = parseJson(value)

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <pre
        className="max-h-64 overflow-auto rounded-lg bg-background px-3 py-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground"
        dir="ltr"
      >
        {json !== null ? JSON.stringify(json, null, 2) : value}
      </pre>
    </div>
  )
}
