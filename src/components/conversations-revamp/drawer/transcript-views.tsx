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
} from "@/lib/conversations-revamp-drawer-data"
import {
  RecordingPlayer,
  formatTimeSeconds,
} from "@/components/conversations-revamp/drawer/recording-player"
import {
  Seekable,
  SpeakerAvatar,
} from "@/components/conversations-revamp/drawer/call-shell"
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
} from "@/components/conversations-revamp/drawer/icons"

/**
 * The transcript: one view, with what the live pass misheard marked in place.
 *
 * There were two here — the enhanced transcription, and a Show changes switch
 * that laid the live one underneath it. Review vetoed the switch. A call is
 * usually opened to explain a complaint, and the explanation is usually what
 * the live STT actually heard; a reader who does not know a second mode exists
 * never gets to it, and a link shared without saying which mode to turn on
 * lands on a different screen from the one that was being discussed.
 *
 * So there is one transcript and it is the enhanced one — punctuated,
 * diacritised, readable by someone who has never seen an STT output before.
 * Everything the live pass got wrong is marked inside it rather than behind a
 * control:
 *
 *   a misheard word   struck through, immediately before the word that
 *                     replaced it, in the line where it happened
 *   a missed line     recovered by the enhanced pass, so the agent never heard
 *                     it — labelled under the bubble
 *   a tool call       stays on the timeline; only the live pass records one,
 *                     and dropping it would take the agent's actions off a
 *                     transcript being read to work out what it did
 *   the whole line    any turn whose raw differs opens it under the clean one,
 *                     because the corrections list only reports what analysis
 *                     noticed, and a word dropped unnoticed leaves no strike
 *
 * Nothing is a mode, so nothing is hidden, and the clean read survives: strike
 * one word out of a sentence and the sentence still reads.
 */

function enhancedText(turn: V4Turn) {
  return turn.enhanced ?? turn.content
}

/** A misheard word, located in the line that replaced it. */
type Heard = { at: number; text: string }

/**
 * Where each correction belongs in the enhanced line.
 *
 * The corrections arrive as a separate list from post-call analysis, keyed by
 * the text rather than by an offset, so they have to be found. Searching from
 * the end of the previous hit keeps two corrections of the same word landing on
 * two different occurrences. One that cannot be found is not dropped — it falls
 * through to `unplaced` and prints under the line, because a correction nobody
 * can see is the thing this panel exists to stop.
 */
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

/**
 * A stretch of text search can run over. A speech turn contributes its line,
 * plus one run for each misheard word printed inside it — both are on screen,
 * so both are findable, and the match count is what the eye can actually find.
 */
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
  /**
   * A chat has no recording, so there is no player and no timeline for a turn
   * to seek into. Everything else in this panel — search, the turn list — is
   * the same, which is why this is a flag rather than a second panel.
   */
  channel?: Channel
  flags?: { id: string; label: string; timestampMs: number; tone: string }[]
  onSeek: (seconds: number) => void
}) {
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const turnRefs = React.useRef<Record<number, HTMLDivElement | null>>({})

  // Every searchable stretch, in the order it is rendered.
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

  /** A shorter result list must not leave the cursor pointing past the end. */
  function runSearch(next: string) {
    setQuery(next)
    setActive(0)
  }

  // Walking to a match moves the playhead too — the point of finding a line is
  // usually to hear it.
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
    /* `overflow-x-clip` because a transcript that scrolls sideways cuts the
       first characters off every line, and this panel is resizable down to a
       third of the drawer. `clip` rather than `hidden`: it does not turn the
       panel into a scroll container, so the vertical scrolling inside the turn
       list is untouched. */
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-x-clip">
      {/* No recording on a chat, so no player. The actions the player would
          have carried move up on their own row rather than disappearing. */}
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
  /** Which hit the counter is pointing at, across every run. */
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

/**
 * One spoken turn: the clean line, the mishearings marked inside it, and the
 * live pass's own line one click away.
 *
 * Raw is not a second view of the strikes, it is the thing the strikes cannot
 * cover. The corrections are post-call analysis reporting what it *noticed*; a
 * word the live pass dropped without noticing leaves no strike behind, and the
 * only place it shows up is the line the live pass actually produced — which is
 * the line the agent answered. So every turn whose raw differs can open it.
 *
 * The control is on screen at rest rather than appearing under the pointer.
 * This design gets reviewed as screenshots pasted into a thread, and a control
 * that only exists on hover is not in a screenshot; it is also nothing on a
 * touch screen, and it would compete with the click this bubble already has.
 */
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

  /* Nothing to open when the live pass produced the same line, and nothing to
     open when it produced none — that turn carries its own label instead. */
  const raw = turn.content
  const hasRaw = Boolean(raw.trim()) && raw !== text

  return (
    <div className={cn("flex gap-3", isCaller && "flex-row-reverse")} ref={ref}>
      <SpeakerAvatar role={turn.role} />

      {/* The bubble sizes itself to its line; the column exists so the missed-
          line label can sit under it without being inside it, where it would
          have to be legible on two different bubble colours. */}
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
            {/* The gap lives in here rather than on the Collapsible, so it is
                not still holding 4px open at the end of the close. */}
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
                      // The bubble underneath seeks. Reading what the live pass
                      // heard is not a request to move the playhead.
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

              {/* A correction whose word could not be found in the line. It still
                prints, under the line it belongs to, rather than vanishing. */}
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

            {/* `current` rather than a token, and the same 60% the struck words
                use: one quiet weight for everything the live pass produced,
                readable on the customer's tinted bubble and the agent's grey
                one alike. */}
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

        {/* Recovered from the audio, which means the agent never heard it —
            the answer to half the "it ignored me" reports. */}
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

/**
 * The line, with each misheard word struck through in front of the word that
 * replaced it. Wrong-then-right rather than right-then-wrong: it leaves the
 * punctuation attached to the word that survives, and a struck word reads as
 * one to skip, so the sentence still runs.
 */
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
        {/* `opacity` rather than a muted token: the same mark has to read on
            the customer's tinted bubble and the agent's grey one. */}
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

/** A tool the agent called, in the order it was called. */
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

/**
 * Marks every hit, and the one the counter is pointing at.
 *
 * `from`/`to` render a window of the run rather than all of it, because a line
 * is drawn in pieces with the misheard words inserted between them — while the
 * search itself still runs over the whole line, so a phrase spanning a
 * correction is still found.
 */
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
