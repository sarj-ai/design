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
import type {
  TranscriptMessage,
  TranscriptRole,
} from "@/lib/mockups/tool-calls-transcript-data"
import { cn } from "@/lib/utils"

/**
 * The call transcript with tool calls — DES-205.
 *
 * The speech is drawn the way the reviewed call drawer draws it
 * (`/conversations-revamp`): a tinted avatar, a bubble with the speaker and the
 * time into the call on its first line. The design system has no transcript
 * pattern of its own yet, so that drawer is the reference.
 *
 * A call and its result are one row. They arrive as two items linked by
 * `toolCallId`, often with speech between them, and as two pills the reader
 * had to match them up by eye. The row sits where the call was made and
 * carries its result, so whatever was said while the tool ran reads after it.
 *
 * The UI only knows `isError`, so a failure is the one state it can name from
 * the flag: colour, an icon of its own and the word "Failed", so it cannot be
 * read as anything else, in colour or without it. A tool that returned text —
 * an availability check, an instruction to retry — prints that text and no
 * status word, because "Transfer NOT COMPLETED" comes back without the flag.
 * A tool that returned nothing and no error finished with nothing to add —
 * a transfer that handed off, an end_call — and reads "Completed". That is
 * the only case a check can mark without contradicting what it says.
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
        {/* The call is usually Arabic and the UI English: each line picks its
            own direction from its first strong character. */}
        <p className="text-sm" dir="auto">
          {message.content}
        </p>
        {/* What was said leads; who and when sit under it, because the side,
            the avatar and the colour already say who. */}
        <span className="flex items-center gap-4 text-xs opacity-70">
          <span className="font-medium">{speaker.label}</span>
          <span className="ms-auto tabular-nums">
            {formatOffset(message.startAt, startedAt)}
          </span>
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- tool */

/**
 * The first line of what the tool returned, or why there is nothing to show.
 * Null when the status word already says it all.
 */
function summary(call?: Call, result?: Result) {
  if (!result) return call ? "No result recorded" : null
  if (result.output.trim() !== "") return result.output.split("\n")[0] ?? null
  return result.isError ? "No output" : null
}

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
  const line = summary(call, result)

  /* Every row with something in it opens, so the chevron means the same on
     every row. Open, the summary line steps aside for the full output below
     it, so the text is never on screen twice. Only an empty row stays shut. */
  const showOutput = output !== ""
  const canOpen = hasArguments || showOutput

  const header = (
    <>
      <span
        className={cn(
          "flex h-4 shrink-0 items-center [&_svg]:size-4",
          failed
            ? "text-destructive"
            : completed
              ? "text-success"
              : "text-muted-foreground",
        )}
      >
        {failed ? (
          <ToolFailedIcon />
        ) : completed ? (
          <ToolCompletedIcon />
        ) : (
          <ToolIcon />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="font-mono font-medium text-foreground" dir="ltr">
            {toolName}
          </span>
          {failed ? (
            <span className="font-medium text-destructive">Failed</span>
          ) : null}
          {completed ? (
            <span className="font-medium text-foreground">Completed</span>
          ) : null}
          <span className="ms-auto flex items-center gap-3 text-muted-foreground tabular-nums">
            {duration ? <span>{duration}</span> : null}
            {calledAt !== undefined ? (
              <span>{formatOffset(calledAt, startedAt)}</span>
            ) : null}
          </span>
        </span>
        {/* Output is English written for the model, capitals for emphasis
            included. Monospace, like the payload it previews, so it reads as
            what the model was told and not as the page talking. Pinned
            left-to-right so an Arabic page does not reorder its punctuation.
            "No result recorded" and "No output" are the page talking, so they
            stay in the page's type. */}
        {line !== null ? (
          <span
            className={cn(
              "truncate text-muted-foreground group-data-[state=open]/tool:hidden",
              showOutput && "font-mono",
            )}
            dir="ltr"
          >
            {line}
          </span>
        ) : null}
      </span>
    </>
  )

  const surface = cn(
    "ms-11 rounded-lg",
    failed ? "bg-destructive/10" : "bg-muted",
  )

  if (!canOpen) {
    return (
      <div className={surface}>
        <div className="flex items-start gap-2 px-3 py-2 text-xs">
          {header}
          {/* Holds the chevron's column so every row's numbers line up. */}
          <span className="size-4 shrink-0" />
        </div>
      </div>
    )
  }

  return (
    <Collapsible className={surface}>
      <CollapsibleTrigger className="group/tool flex w-full items-start gap-2 rounded-lg px-3 py-2 text-start text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        {header}
        <span className="flex h-4 shrink-0 items-center text-muted-foreground [&_svg]:size-4">
          <ExpandIcon className="transition-transform duration-150 ease-out-cubic group-data-[state=open]/tool:rotate-180 motion-reduce:transition-none" />
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
        <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
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
