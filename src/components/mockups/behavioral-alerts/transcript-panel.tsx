"use client"

import * as React from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import type {
  AlertSeverity,
  CallRow,
} from "@/lib/mockups/behavioral-alerts-data"
import {
  AgentIcon,
  CallerIcon,
  ClearSearchIcon,
  NextMatchIcon,
  PrevMatchIcon,
  SearchIcon,
} from "@/components/mockups/behavioral-alerts/icons"
import {
  formatTimeSeconds,
  RecordingPlayer,
  type RecordingMarker,
} from "@/components/mockups/behavioral-alerts/recording-player"
import { Seekable } from "@/components/mockups/behavioral-alerts/seekable"
import { SeverityBadge } from "@/components/mockups/behavioral-alerts/severity"

export type Evidence = { name: string; severity: AlertSeverity }

export function TranscriptPanel({
  at,
  call,
  evidence,
  markers,
  onSeek,
}: {
  at: number
  call: CallRow
  evidence: Map<number, Evidence>
  markers: RecordingMarker[]
  onSeek: (seconds: number) => void
}) {
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const turnRefs = React.useRef<Record<number, HTMLDivElement | null>>({})

  const matches = React.useMemo(() => {
    const ranges = new Map<number, [number, number][]>()
    const offsets = new Map<number, number>()
    let total = 0

    call.transcript.forEach((line, index) => {
      const found = findMatches(line.text, query)
      ranges.set(index, found)
      offsets.set(index, total)
      total += found.length
    })

    return { offsets, ranges, total }
  }, [call.transcript, query])

  const search: Search = { ...matches, activeIndex: active }

  function runSearch(next: string) {
    setQuery(next)
    setActive(0)
  }

  function step(by: number) {
    if (!matches.total) return
    setActive((current) => (current + by + matches.total) % matches.total)
  }

  React.useEffect(() => {
    if (!matches.total) return

    const index = call.transcript.findIndex((_, turn) => {
      const offset = matches.offsets.get(turn) ?? 0
      const count = matches.ranges.get(turn)?.length ?? 0
      return active >= offset && active < offset + count
    })
    if (index === -1) return

    scrollTo(turnRefs.current[index])
    onSeek(call.transcript[index].at)
  }, [active, call.transcript, matches, onSeek])

  React.useEffect(() => {
    const index = activeTurn(call, at)
    if (index !== -1) scrollTo(turnRefs.current[index])
  }, [at, call])

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-x-clip">
      <RecordingPlayer
        at={at}
        duration={call.duration}
        markers={markers}
        onSeek={onSeek}
      />

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

      {call.transcript.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No transcript for this call.
        </p>
      ) : (
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1">
          {call.transcript.map((line, index) => {
            const next = call.transcript[index + 1]

            return (
              <TurnRow
                evidence={evidence.get(line.at)}
                isPlaying={at >= line.at && (!next || at < next.at)}
                key={index}
                line={line}
                onSeek={onSeek}
                ref={(node) => {
                  turnRefs.current[index] = node
                }}
                search={search}
                turnIndex={index}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function activeTurn(call: CallRow, at: number) {
  return call.transcript.findIndex((line, index) => {
    const next = call.transcript[index + 1]
    return at >= line.at && (!next || at < next.at)
  })
}

function scrollTo(node: HTMLDivElement | null) {
  node?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "center",
  })
}

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

type Search = {
  activeIndex: number
  offsets: Map<number, number>
  ranges: Map<number, [number, number][]>
  total: number
}

function TurnRow({
  evidence,
  isPlaying,
  line,
  onSeek,
  ref,
  search,
  turnIndex,
}: {
  evidence?: Evidence
  isPlaying: boolean
  line: CallRow["transcript"][number]
  onSeek: (seconds: number) => void
  ref: (node: HTMLDivElement | null) => void
  search: Search
  turnIndex: number
}) {
  const isCaller = line.speaker === "caller"

  return (
    <div
      className={cn("flex scroll-mt-1 gap-3", isCaller && "flex-row-reverse")}
      ref={ref}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-4xl",
          isCaller ? "bg-muted text-foreground" : "bg-primary/10 text-primary",
        )}
      >
        {isCaller ? (
          <CallerIcon className="size-4" />
        ) : (
          <AgentIcon className="size-4" />
        )}
      </span>

      <Seekable
        className={cn(
          "flex max-w-[80%] flex-col items-start gap-1 rounded-lg px-4 py-2.5 text-start transition-colors duration-150 ease-out-cubic motion-reduce:transition-none",
          isCaller
            ? "bg-primary text-primary-foreground hover:bg-primary-dark"
            : "bg-muted text-foreground hover:bg-accent",
          isPlaying && "ring-2 ring-primary",
        )}
        label={`Seek to ${formatTimeSeconds(line.at)}`}
        onActivate={() => {
          onSeek(line.at)
        }}
      >
        <span className="flex w-full items-center gap-2 text-xs opacity-70">
          <span className="font-semibold tracking-wide uppercase">
            {isCaller ? "Customer" : "Agent"}
          </span>
          <span className="ms-auto tabular-nums">
            {formatTimeSeconds(line.at)}
          </span>
        </span>

        <span className="text-sm" dir="auto">
          <Highlighted search={search} text={line.text} turnIndex={turnIndex} />
        </span>

        {evidence ? (
          <span className="flex items-center gap-2 pt-1">
            <SeverityBadge severity={evidence.severity} />
            <span className="text-xs opacity-70">{evidence.name}</span>
          </span>
        ) : null}
      </Seekable>
    </div>
  )
}

function Highlighted({
  search,
  text,
  turnIndex,
}: {
  search: Search
  text: string
  turnIndex: number
}) {
  const ranges = search.ranges.get(turnIndex)
  if (!ranges?.length) return text

  const offset = search.offsets.get(turnIndex) ?? 0
  const parts: React.ReactNode[] = []
  let cursor = 0

  ranges.forEach(([start, end], index) => {
    if (start > cursor) parts.push(text.slice(cursor, start))
    parts.push(
      <mark
        className={cn(
          "rounded-sm bg-warning/25 text-foreground",
          offset + index === search.activeIndex && "bg-primary/30",
        )}
        key={start}
      >
        {text.slice(start, end)}
      </mark>,
    )
    cursor = end
  })

  if (cursor < text.length) parts.push(text.slice(cursor))

  return parts
}
