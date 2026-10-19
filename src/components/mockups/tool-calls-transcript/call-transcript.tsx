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
 * time into the call on its first line, and a tool as a line on a rule between
 * the turns. The design system has no transcript pattern of its own yet, so
 * that drawer is the reference.
 *
 * A call and its result are one line. They arrive as two items linked by
 * `toolCallId`, often with speech between them, and as two pills the reader
 * had to match them up by eye. The line sits where the call was made and
 * carries its result, so whatever was said while the tool ran reads after it.
 *
 * The UI only knows `isError`, so a failure is the one state it can name from
 * the flag: colour, an icon of its own and the word "failed", so it cannot be
 * read as anything else, in colour or without it. A tool that returned text —
 * an availability check, an instruction to retry — keeps the plain wrench and
 * no status word, because "Transfer NOT COMPLETED" comes back without the
 * flag; its text is one click away. A tool that returned nothing and no error
 * finished with nothing to add — a transfer that handed off, an end_call —
 * and reads "completed". That is the only case a check can mark without
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

/**
 * transfer_call → Transfer call. The tool's own name is written for the
 * model; the transcript is read by a person, so it says the same thing in
 * words. The name as written is still one click away, for whoever needs it.
 */
function humanize(name: string) {
  const words = name.replace(/[_-]+/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * {"account_number":"4471 0928"} → Account number · 4471 0928, when every
 * value is a plain one. Anything nested stays as the JSON it is.
 */
function plainFields(value: string): [string, string][] | null {
  const json = parseJson(value)
  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    return null
  }
  const entries = Object.entries(json)
  if (
    entries.some(([, field]) => field !== null && typeof field === "object")
  ) {
    return null
  }
  return entries.map(([key, field]) => [humanize(key), String(field)])
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

  /* One quiet line on a rule: what the agent did, in words, and when. It sits
     between the turns as something that happened on the call, not as a
     fourth speaker, and it is set lighter than the speech so the
     conversation stays the thing being read. Everything technical — what was
     sent, what came back, how long it took, the tool's own name — is one
     click away, below it. */
  return (
    <Collapsible className="flex flex-col">
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <CollapsibleTrigger
          className={cn(
            "group/tool flex items-center gap-1.5 rounded-sm text-xs outline-none transition-colors duration-150 ease-out-cubic focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
            failed
              ? "text-destructive"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {failed ? (
            <ToolFailedIcon className="size-3.5 shrink-0" />
          ) : completed ? (
            <ToolCompletedIcon className="size-3.5 shrink-0 text-success" />
          ) : (
            <ToolIcon className="size-3.5 shrink-0" />
          )}
          <span>
            {failed
              ? `${label} failed`
              : completed
                ? `${label} completed`
                : label}
          </span>
          {/* The call went out and nothing came back. */}
          {result === undefined ? <span>· No result</span> : null}
          {calledAt !== undefined ? (
            <span className="tabular-nums">
              · {formatOffset(calledAt, startedAt)}
            </span>
          ) : null}
          <ExpandIcon className="size-3.5 transition-transform duration-150 ease-out-cubic group-data-[state=open]/tool:rotate-180 motion-reduce:transition-none" />
        </CollapsibleTrigger>
        <Separator className="flex-1" />
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
        <div className="mt-2 flex flex-col gap-2.5 rounded-lg bg-muted p-3 text-xs">
          {hasArguments ? (
            <Detail label="Called with">
              <Payload value={call.arguments} />
            </Detail>
          ) : null}
          {output !== "" ? (
            <Detail label="Returned">
              <Payload value={output} />
            </Detail>
          ) : null}
          {duration ? (
            <Detail label="Took">
              <span className="tabular-nums">{duration}</span>
            </Detail>
          ) : null}
          <Detail label="Tool">
            <span className="font-mono" dir="ltr">
              {toolName}
            </span>
          </Detail>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function Detail({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="flex gap-4">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <div className="min-w-0 flex-1 text-foreground">{children}</div>
    </div>
  )
}

/**
 * What went to the tool or came back. Plain fields read as a short list in
 * the page's type. Anything else is shown verbatim in monospace, JSON
 * pretty-printed, so it reads as what the model saw, capitals included, and
 * not as the page talking. Pinned left-to-right so an Arabic page does not
 * reorder its punctuation.
 */
function Payload({ value }: { value: string }) {
  const fields = plainFields(value)

  if (fields) {
    return (
      <span className="flex flex-col gap-0.5" dir="ltr">
        {fields.map(([key, field]) => (
          <span key={key}>
            <span className="text-muted-foreground">{key}</span> {field}
          </span>
        ))}
      </span>
    )
  }

  const json = parseJson(value)

  return (
    <pre
      className="max-h-64 overflow-auto font-mono text-xs leading-relaxed whitespace-pre-wrap"
      dir="ltr"
    >
      {json !== null ? JSON.stringify(json, null, 2) : value}
    </pre>
  )
}
