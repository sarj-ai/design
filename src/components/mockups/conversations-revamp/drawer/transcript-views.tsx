"use client"

import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  RECORDING_SECONDS,
  V4_TRANSCRIPT,
  type Channel,
  type TranscriptionError,
  type V4Turn,
} from "@/lib/mockups/conversations-revamp-drawer-data"
import {
  RecordingPlayer,
  formatTimeSeconds,
} from "@/components/mockups/conversations-revamp/drawer/recording-player"
import {
  Seekable,
  SpeakerAvatar,
} from "@/components/mockups/conversations-revamp/drawer/call-shell"
import {
  AddedIcon,
  BackchannelIcon,
  ChevronDownIcon,
  ClearSearchIcon,
  CorrectionIcon,
  NextMatchIcon,
  PrevMatchIcon,
  SearchIcon,
  ToolIcon,
} from "@/components/mockups/conversations-revamp/drawer/icons"

function enhancedText(turn: V4Turn) {
  return turn.enhanced ?? turn.content
}

type Heard = { at: number; text: string }

// Corrections are keyed by text, not offset. Search from the previous hit so
// repeats land on distinct occurrences; misses go to `unplaced`.
function corrections(turn: V4Turn) {
  const text = enhancedText(turn)
  const heard: Heard[] = []
  const unplaced: TranscriptionError[] = []
  let cursor = 0

  for (const error of turn.errors ?? []) {
    const at = text.indexOf(error.correction, cursor)

    if (at === -1) {
      unplaced.push(error)
      continue
    }

    heard.push({ at, text: error.incorrect_text })
    cursor = at + error.correction.length
  }

  return { heard, unplaced }
}

type Run = { key: string; text: string; turnIndex: number }

function findMatches(text: string, query: string): [number, number][] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []

  const haystack = text.toLowerCase()
  const found: [number, number][] = []
  let from = 0

  for (;;) {
    const index = haystack.indexOf(needle, from)
    if (index === -1) break
    found.push([index, index + needle.length])
    from = index + needle.length
  }

  return found
}

export function TranscriptPanel({
  actions,
  at,
  channel = "call",
  flags,
  onSeek,
}: {
  actions?: React.ReactNode
  at: number
  channel?: Channel
  flags?: { id: string; label: string; timestampMs: number; tone: string }[]
  onSeek: (seconds: number) => void
}) {
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const turnRefs = React.useRef<Record<number, HTMLDivElement | null>>({})

  const runs = React.useMemo(() => {
    const collected: Run[] = []

    V4_TRANSCRIPT.forEach((turn, index) => {
      if (turn.kind === "tool") return

      collected.push({
        key: `${index}-line`,
        text: enhancedText(turn),
        turnIndex: index,
      })

      for (const heard of corrections(turn).heard) {
        collected.push({
          key: `${index}-heard-${heard.at}`,
          text: heard.text,
          turnIndex: index,
        })
      }
    })

    return collected
  }, [])

  const matches = React.useMemo(() => {
    const ranges = new Map<string, [number, number][]>()
    const offsets = new Map<string, number>()
    let total = 0

    for (const run of runs) {
      const found = findMatches(run.text, query)
      ranges.set(run.key, found)
      offsets.set(run.key, total)
      total += found.length
    }

    return { offsets, ranges, runs, total }
  }, [runs, query])

  const search: Search = { ...matches, activeIndex: active }

  function runSearch(next: string) {
    setQuery(next)
    setActive(0)
  }

  React.useEffect(() => {
    if (!matches.total) return

    const run = matches.runs.find((item) => {
      const offset = matches.offsets.get(item.key) ?? 0
      const count = matches.ranges.get(item.key)?.length ?? 0
      return active >= offset && active < offset + count
    })
    if (!run) return

    turnRefs.current[run.turnIndex]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    })
    onSeek(V4_TRANSCRIPT[run.turnIndex].at)
  }, [active, matches, onSeek])

  function step(by: number) {
    if (!matches.total) return
    setActive((current) => (current + by + matches.total) % matches.total)
  }

  return (
    // `clip`, not `hidden`, so this does not become a scroll container.
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-x-clip">
      {channel === "chat" ? (
        actions ? (
          <div className="flex shrink-0 items-center justify-end gap-2">
            {actions}
          </div>
        ) : null
      ) : (
        <RecordingPlayer
          actions={actions}
          at={at}
          duration={RECORDING_SECONDS}
          flags={flags}
          onFlagClick={onSeek}
          onSeek={onSeek}
        />
      )}

      <InputGroup className="shrink-0">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          onChange={(event) => {
            runSearch(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") runSearch("")
            if (event.key === "Enter") {
              event.preventDefault()
              step(event.shiftKey ? -1 : 1)
            }
          }}
          placeholder="Search transcript"
          value={query}
        />
        {query ? (
          <InputGroupAddon align="inline-end">
            <span
              className={cn(
                "tabular-nums",
                search.total ? "text-muted-foreground" : "text-destructive",
              )}
            >
              {search.total ? `${active + 1} of ${search.total}` : "0"}
            </span>
            <InputGroupButton
              aria-label="Previous match"
              disabled={!search.total}
              onClick={() => {
                step(-1)
              }}
              size="icon-xs"
            >
              <PrevMatchIcon />
            </InputGroupButton>
            <InputGroupButton
              aria-label="Next match"
              disabled={!search.total}
              onClick={() => {
                step(1)
              }}
              size="icon-xs"
            >
              <NextMatchIcon />
            </InputGroupButton>
            <InputGroupButton
              aria-label="Clear search"
              onClick={() => {
                runSearch("")
              }}
              size="icon-xs"
            >
              <ClearSearchIcon />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>

      <TurnList
        channel={channel}
        at={at}
        onSeek={onSeek}
        search={search}
        turnRefs={turnRefs}
      />
    </div>
  )
}

function TurnList({
  at,
  channel,
  onSeek,
  search,
  turnRefs,
}: {
  channel: Channel
  at: number
  onSeek: (seconds: number) => void
  search: Search
  turnRefs: React.RefObject<Record<number, HTMLDivElement | null>>
}) {
  return (
    <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1">
      {V4_TRANSCRIPT.map((turn, index) => {
        const next = V4_TRANSCRIPT[index + 1]

        return (
          <TurnRow
            channel={channel}
            isPlaying={at >= turn.at && (!next || at < next.at)}
            key={index}
            onSeek={onSeek}
            ref={(node) => {
              turnRefs.current[index] = node
            }}
            search={search}
            turn={turn}
            turnIndex={index}
          />
        )
      })}
    </div>
  )
}

type Search = {
  activeIndex: number
  offsets: Map<string, number>
  ranges: Map<string, [number, number][]>
  runs: Run[]
  total: number
}

function TurnRow({
  channel,
  isPlaying,
  onSeek,
  ref,
  search,
  turn,
  turnIndex,
}: {
  channel: Channel
  isPlaying: boolean
  onSeek: (seconds: number) => void
  ref: (node: HTMLDivElement | null) => void
  search: Search
  turn: V4Turn
  turnIndex: number
}) {
  if (turn.kind === "tool") {
    return (
      <div ref={ref}>
        <ToolRow onSeek={onSeek} turn={turn} />
      </div>
    )
  }

  if (turn.kind === "backchannel") {
    const isCaller = turn.role === "caller"

    return (
      <div className={cn("flex", isCaller && "justify-end")} ref={ref}>
        <Seekable
          enabled={channel !== "chat"}
          className={cn(
            "flex items-center gap-2 rounded-4xl bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors duration-150 ease-out-cubic hover:bg-accent motion-reduce:transition-none",
            isPlaying && "bg-accent",
          )}
          label={`Seek to ${formatTimeSeconds(turn.at)}`}
          onActivate={() => {
            onSeek(turn.at)
          }}
        >
          <BackchannelIcon className="size-3" />
          <span>{isCaller ? "Customer" : "Agent"} backchannel</span>
          <span dir="auto">
            <Highlighted
              runKey={`${turnIndex}-line`}
              search={search}
              text={enhancedText(turn)}
            />
          </span>
          <span className="tabular-nums">{formatTimeSeconds(turn.at)}</span>
        </Seekable>
      </div>
    )
  }

  return (
    <SpeechTurn
      channel={channel}
      isPlaying={isPlaying}
      onSeek={onSeek}
      ref={ref}
      search={search}
      turn={turn}
      turnIndex={turnIndex}
    />
  )
}

function SpeechTurn({
  channel,
  isPlaying,
  onSeek,
  ref,
  search,
  turn,
  turnIndex,
}: {
  channel: Channel
  isPlaying: boolean
  onSeek: (seconds: number) => void
  ref: (node: HTMLDivElement | null) => void
  search: Search
  turn: V4Turn
  turnIndex: number
}) {
  const [rawOpen, setRawOpen] = React.useState(false)

  const isCaller = turn.role === "caller"
  const text = enhancedText(turn)
  const { heard, unplaced } = corrections(turn)

  const raw = turn.content
  const hasRaw = Boolean(raw.trim()) && raw !== text

  return (
    <div className={cn("flex gap-3", isCaller && "flex-row-reverse")} ref={ref}>
      <SpeakerAvatar role={turn.role} />

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isCaller ? "items-end" : "items-start",
        )}
      >
        <Seekable
          enabled={channel !== "chat"}
          className={cn(
            "flex flex-col items-start gap-1 rounded-lg px-4 py-2.5 text-start transition-colors duration-150 ease-out-cubic motion-reduce:transition-none",
            isCaller
              ? "bg-primary text-primary-foreground hover:bg-primary-dark"
              : "bg-muted text-foreground hover:bg-accent",
            isPlaying && "ring-2 ring-primary",
          )}
          label={`Seek to ${formatTimeSeconds(turn.at)}`}
          onActivate={() => {
            onSeek(turn.at)
          }}
        >
          <Collapsible
            className="flex w-full flex-col"
            onOpenChange={setRawOpen}
            open={rawOpen}
          >
            {/* Gap lives here, not on the Collapsible, so it does not hold 4px
               open at the end of the close. */}
            <div className="flex flex-col gap-1">
              <span className="flex w-full items-center gap-2 text-xs">
                <span className="font-semibold tracking-wide uppercase opacity-70">
                  {turn.role === "caller"
                    ? "Customer"
                    : turn.role === "human agent"
                      ? "Human agent"
                      : "Agent"}
                </span>
                <span className="ms-auto tabular-nums opacity-70">
                  {formatTimeSeconds(turn.at)}
                </span>
                {hasRaw ? (
                  <CollapsibleTrigger
                    className="flex items-center gap-1 rounded-sm opacity-60 transition-opacity duration-150 ease-out-cubic hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                    onClick={(event) => {
                      // The bubble underneath seeks; opening the raw line must
                      // not.
                      event.stopPropagation()
                    }}
                    onKeyDown={(event) => {
                      event.stopPropagation()
                    }}
                  >
                    Raw
                    <ChevronDownIcon
                      className={cn(
                        "size-3 transition-transform duration-150 ease-out-cubic motion-reduce:transition-none",
                        rawOpen && "rotate-180",
                      )}
                    />
                  </CollapsibleTrigger>
                ) : null}
              </span>

              <span className="text-sm" dir="auto">
                <TurnLine
                  heard={heard}
                  search={search}
                  text={text}
                  turnIndex={turnIndex}
                />
              </span>

              {unplaced.length ? (
                <span className="flex flex-col gap-0.5 pt-1 text-xs opacity-70">
                  {unplaced.map((error) => (
                    <span
                      className="flex flex-wrap items-center gap-1.5"
                      key={error.incorrect_text}
                    >
                      <CorrectionIcon className="size-3 shrink-0" />
                      <span className="line-through" dir="auto">
                        {error.incorrect_text}
                      </span>
                      <span aria-hidden>→</span>
                      <span dir="auto">{error.correction}</span>
                    </span>
                  ))}
                </span>
              ) : null}
            </div>

            {/* Opacity, not a muted token, matching the struck words: it must
               read on both bubble colours. */}
            {hasRaw ? (
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
                <span
                  className="mt-1 flex border-t border-current/20 pt-2 text-sm opacity-60"
                  dir="auto"
                >
                  {raw}
                </span>
              </CollapsibleContent>
            ) : null}
          </Collapsible>
        </Seekable>

        {turn.addedInEnhanced ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AddedIcon className="size-3.5 shrink-0" />
            Not in the live transcript
          </span>
        ) : null}
      </div>
    </div>
  )
}

function TurnLine({
  heard,
  search,
  text,
  turnIndex,
}: {
  heard: Heard[]
  search: Search
  text: string
  turnIndex: number
}) {
  const parts: React.ReactNode[] = []
  let cursor = 0

  for (const word of heard) {
    if (word.at > cursor) {
      parts.push(
        <Highlighted
          from={cursor}
          key={`line-${cursor}`}
          runKey={`${turnIndex}-line`}
          search={search}
          text={text}
          to={word.at}
        />,
      )
    }

    parts.push(
      <React.Fragment key={`heard-${word.at}`}>
        {/* Opacity, not a muted token: it must read on both bubble colours. */}
        <span className="line-through opacity-60" dir="auto">
          <Highlighted
            runKey={`${turnIndex}-heard-${word.at}`}
            search={search}
            text={word.text}
          />
        </span>{" "}
      </React.Fragment>,
    )

    cursor = word.at
  }

  parts.push(
    <Highlighted
      from={cursor}
      key="line-tail"
      runKey={`${turnIndex}-line`}
      search={search}
      text={text}
    />,
  )

  return parts
}

function ToolRow({
  onSeek,
  turn,
}: {
  onSeek: (seconds: number) => void
  turn: V4Turn
}) {
  const tool = turn.tool
  if (!tool) return null

  return (
    <Collapsible className="flex flex-col">
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <CollapsibleTrigger
          className="flex items-center gap-2 rounded-4xl bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors duration-150 ease-out-cubic hover:bg-accent motion-reduce:transition-none"
          onClick={() => {
            onSeek(turn.at)
          }}
        >
          <ToolIcon className="size-3" />
          <span className="font-mono">{tool.name}</span>
          <span className="text-muted-foreground">{tool.ms}ms</span>
          <span className="text-muted-foreground tabular-nums">
            {formatTimeSeconds(turn.at)}
          </span>
          <ChevronDownIcon className="size-3" />
        </CollapsibleTrigger>
        <Separator className="flex-1" />
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
        <div className="mt-2 flex flex-col gap-2 rounded-lg bg-muted p-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Called with
            </span>
            <code className="font-mono text-xs text-foreground">
              {tool.args}
            </code>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Returned
            </span>
            <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap text-foreground">
              {tool.response}
            </pre>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// `from`/`to` render a window of the run; search still runs over the whole
// line.
function Highlighted({
  from = 0,
  runKey,
  search,
  text,
  to,
}: {
  from?: number
  runKey: string
  search: Search
  text: string
  to?: number
}) {
  const end = to ?? text.length
  const ranges = search.ranges.get(runKey)
  if (!ranges?.length) return text.slice(from, end)

  const offset = search.offsets.get(runKey) ?? 0
  const parts: React.ReactNode[] = []
  let cursor = from

  ranges.forEach(([start, stop], index) => {
    const markStart = Math.max(start, from)
    const markEnd = Math.min(stop, end)
    if (markEnd <= markStart) return

    if (markStart > cursor) parts.push(text.slice(cursor, markStart))
    parts.push(
      <mark
        className={cn(
          "rounded-sm bg-warning/25 text-foreground",
          offset + index === search.activeIndex && "bg-primary/30",
        )}
        key={start}
      >
        {text.slice(markStart, markEnd)}
      </mark>,
    )
    cursor = markEnd
  })

  if (cursor < end) parts.push(text.slice(cursor, end))

  return parts
}
