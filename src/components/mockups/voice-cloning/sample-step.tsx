"use client"

import * as React from "react"

import { errorId, FieldHeader } from "@/components/design-system/field-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  RecordingIndicator,
  useMicrophoneLevels,
} from "@/components/shared/recording-indicator"
import {
  formatSeconds,
  playTone,
  usePlayback,
} from "@/components/mockups/voice-cloning/audio"
import {
  PauseVoiceIcon,
  PlayVoiceIcon,
  RecordIcon,
  StopRecordingIcon,
  UploadSampleIcon,
} from "@/components/mockups/voice-cloning/icons"
import {
  SAMPLE_LIMITS,
  SCRIPT,
  TRANSCRIPT,
} from "@/lib/mockups/voice-cloning-data"

export type Take = {
  source: "recording" | "upload"
  label: string
  seconds: number
  /** Null while transcription runs. */
  transcript: string | null
  noisy: boolean
}

export type Capture =
  | { kind: "idle"; error: string | null }
  | { kind: "countdown"; count: number }
  | { kind: "recording"; startedAt: number; elapsed: number }
  | { kind: "take"; take: Take }

export const EMPTY_CAPTURE: Capture = { kind: "idle", error: null }

const COUNTDOWN_FROM = 3
const TICK_MS = 100
const ACCEPT = SAMPLE_LIMITS.formats.map((format) => `.${format}`).join(",")

export function SampleStep({
  capture,
  setCapture,
  noisy,
  showErrors,
}: {
  capture: Capture
  setCapture: React.Dispatch<React.SetStateAction<Capture>>
  /** Reviewer switch: every take comes back noisy. */
  noisy: boolean
  showErrors: boolean
}) {
  const fileInput = React.useRef<HTMLInputElement>(null)

  /* Opens with the countdown so the permission prompt never eats into the take. */
  const mic = useMicrophoneLevels(
    capture.kind === "countdown" || capture.kind === "recording",
  )

  React.useEffect(() => {
    if (mic.state !== "unavailable") return
    setCapture({
      kind: "idle",
      error:
        "The microphone is off. Allow it in your browser to record, or upload a file.",
    })
  }, [mic.state, setCapture])

  React.useEffect(() => {
    if (capture.kind !== "countdown" || mic.state !== "live") return
    const timer = setTimeout(() => {
      if (capture.count > 1) {
        setCapture({ kind: "countdown", count: capture.count - 1 })
        return
      }
      playTone("start")
      setCapture({ kind: "recording", startedAt: Date.now(), elapsed: 0 })
    }, 1000)
    return () => clearTimeout(timer)
  }, [capture, mic.state, setCapture])

  const finish = React.useCallback(
    (elapsed: number) => {
      playTone("stop")
      if (elapsed < SAMPLE_LIMITS.minSeconds) {
        setCapture({
          kind: "idle",
          error: `That take was too short. Record at least ${SAMPLE_LIMITS.minSeconds} seconds.`,
        })
        return
      }
      setCapture({
        kind: "take",
        take: {
          source: "recording",
          label: "Recording",
          seconds: elapsed,
          transcript: null,
          noisy,
        },
      })
    },
    [noisy, setCapture],
  )

  React.useEffect(() => {
    if (capture.kind !== "recording") return
    if (capture.elapsed >= SAMPLE_LIMITS.maxSeconds) {
      finish(SAMPLE_LIMITS.maxSeconds)
      return
    }
    const timer = setTimeout(
      () =>
        setCapture((current) =>
          current.kind === "recording"
            ? {
                ...current,
                elapsed: (Date.now() - current.startedAt) / 1000,
              }
            : current,
        ),
      TICK_MS,
    )
    return () => clearTimeout(timer)
  }, [capture, finish, setCapture])

  const transcribing =
    capture.kind === "take" && capture.take.transcript === null
  React.useEffect(() => {
    if (!transcribing) return
    const timer = setTimeout(
      () =>
        setCapture((current) =>
          current.kind === "take"
            ? {
                kind: "take",
                take: { ...current.take, transcript: TRANSCRIPT },
              }
            : current,
        ),
      1200,
    )
    return () => clearTimeout(timer)
  }, [transcribing, setCapture])

  const upload = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
    if (!(SAMPLE_LIMITS.formats as readonly string[]).includes(extension)) {
      setCapture({
        kind: "idle",
        error: "Upload a WAV, MP3, FLAC or OGG file.",
      })
      return
    }
    const megabytes = file.size / 1024 / 1024
    if (megabytes > SAMPLE_LIMITS.maxMegabytes) {
      setCapture({
        kind: "idle",
        error: `That file is ${megabytes.toFixed(1)} MB. Upload one up to ${SAMPLE_LIMITS.maxMegabytes} MB.`,
      })
      return
    }
    const seconds = await readDuration(file)
    if (seconds === null) {
      setCapture({
        kind: "idle",
        error:
          "That file couldn’t be played. Upload a WAV, MP3, FLAC or OGG file.",
      })
      return
    }
    if (seconds > SAMPLE_LIMITS.maxSeconds) {
      setCapture({
        kind: "idle",
        error: `That file is ${Math.round(seconds)} seconds. Trim it to ${SAMPLE_LIMITS.maxSeconds} or less.`,
      })
      return
    }
    if (seconds < SAMPLE_LIMITS.minSeconds) {
      setCapture({
        kind: "idle",
        error: `That file is ${Math.round(seconds)} seconds. Upload at least ${SAMPLE_LIMITS.minSeconds}.`,
      })
      return
    }
    setCapture({
      kind: "take",
      take: {
        source: "upload",
        label: file.name,
        seconds,
        transcript: null,
        noisy,
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {capture.kind === "take" ? (
        <TakeView
          take={capture.take}
          onReplace={() => setCapture(EMPTY_CAPTURE)}
          onTranscriptChange={(transcript) =>
            setCapture({ kind: "take", take: { ...capture.take, transcript } })
          }
          showErrors={showErrors}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Script</span>
            <p
              className="rounded-lg bg-muted p-4 text-base leading-relaxed"
              dir="rtl"
            >
              {SCRIPT}
            </p>
          </div>

          {/* Every capture state is one row of the same shape — two choices,
              then the countdown, then the take in progress, then the take —
              so the card never changes height while the reader speaks. */}
          {capture.kind === "idle" ? (
            <div className="flex flex-col gap-2">
              {capture.error || showErrors ? (
                <FieldError>
                  {capture.error ?? "Record or upload a sample first."}
                </FieldError>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Each limit sits on the choice it limits: length on
                    recording, format and size on a file. */}
                <SourceChoice
                  description={`${SAMPLE_LIMITS.minSeconds}–${SAMPLE_LIMITS.maxSeconds} seconds, 6–10 is best`}
                  icon={<RecordIcon />}
                  onSelect={() =>
                    setCapture({ kind: "countdown", count: COUNTDOWN_FROM })
                  }
                  title="Record"
                />
                <SourceChoice
                  description={`WAV, MP3, FLAC or OGG · ${SAMPLE_LIMITS.maxMegabytes} MB`}
                  icon={<UploadSampleIcon />}
                  onSelect={() => fileInput.current?.click()}
                  title="Upload a file"
                />
              </div>
              <Input
                accept={ACCEPT}
                aria-label="Upload a sample"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (file) void upload(file)
                }}
                ref={fileInput}
                tabIndex={-1}
                type="file"
              />
            </div>
          ) : null}

          {capture.kind === "countdown" ? (
            <Item variant="outline">
              <ItemMedia className="group-has-data-[slot=item-description]/item:translate-y-0 group-has-data-[slot=item-description]/item:self-center">
                <span
                  aria-live="assertive"
                  className="flex size-8 items-center justify-center rounded-full bg-primary-tint text-sm font-semibold text-primary-tint-foreground tabular-nums"
                >
                  {mic.state === "live" ? capture.count : "…"}
                </span>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {mic.state === "live" ? "Get ready" : "Allow the microphone"}
                </ItemTitle>
                <ItemDescription>
                  {mic.state === "live"
                    ? "Start reading after the tone"
                    : "Your browser is asking to use it"}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  onClick={() => setCapture(EMPTY_CAPTURE)}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              </ItemActions>
            </Item>
          ) : null}

          {capture.kind === "recording" ? (
            <RecordingView
              elapsed={capture.elapsed}
              levels={mic.levels}
              onStop={() => finish(capture.elapsed)}
            />
          ) : null}
        </>
      )}
    </div>
  )
}

function SourceChoice({
  title,
  description,
  icon,
  onSelect,
}: {
  title: string
  description: string
  icon: React.ReactNode
  onSelect: () => void
}) {
  return (
    <Item
      asChild
      className="cursor-pointer hover:bg-muted/50"
      variant="outline"
    >
      <button onClick={onSelect} type="button">
        {/* Centred on title and description together, in a tinted square:
            the primitive pins media to the first line, which on a two-line
            tile leaves the glyph floating above the block it labels. */}
        <ItemMedia
          className="size-8 group-has-data-[slot=item-description]/item:translate-y-0 group-has-data-[slot=item-description]/item:self-center rounded-md bg-primary-tint text-primary-tint-foreground"
          variant="icon"
        >
          {icon}
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
          <ItemDescription>{description}</ItemDescription>
        </ItemContent>
      </button>
    </Item>
  )
}

function RecordingView({
  elapsed,
  levels,
  onStop,
}: {
  elapsed: number
  levels: readonly number[]
  onStop: () => void
}) {
  const short = elapsed < SAMPLE_LIMITS.minSeconds

  return (
    <Item variant="outline">
      <ItemMedia className="group-has-data-[slot=item-description]/item:translate-y-0 group-has-data-[slot=item-description]/item:self-center">
        <RecordingIndicator levels={levels} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="tabular-nums">
          <span>
            Recording {formatSeconds(elapsed)}
            <span className="font-normal text-muted-foreground">
              {" "}
              / {formatSeconds(SAMPLE_LIMITS.maxSeconds)}
            </span>
          </span>
        </ItemTitle>
        {/* The one moving fact the reader needs while speaking: whether
            stopping now keeps the take. */}
        <ItemDescription aria-live="polite">
          {short
            ? `Keep going — ${SAMPLE_LIMITS.minSeconds} seconds minimum`
            : `Stops on its own at ${SAMPLE_LIMITS.maxSeconds} seconds`}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button onClick={onStop} size="sm">
          <StopRecordingIcon />
          Stop
        </Button>
      </ItemActions>
      <ItemFooter>
        <Progress
          aria-label="Recording length"
          className="flex-1"
          value={(elapsed / SAMPLE_LIMITS.maxSeconds) * 100}
        />
      </ItemFooter>
    </Item>
  )
}

function TakeView({
  take,
  onReplace,
  onTranscriptChange,
  showErrors,
}: {
  take: Take
  onReplace: () => void
  onTranscriptChange: (transcript: string) => void
  showErrors: boolean
}) {
  const playback = usePlayback(take.seconds)
  const transcriptMissing =
    showErrors && take.transcript !== null && take.transcript.trim() === ""

  return (
    <>
      <div className="flex flex-col gap-3">
        <Item variant="outline">
          <ItemMedia>
            <Button
              aria-label={playback.playing ? "Pause sample" : "Play sample"}
              onClick={playback.toggle}
              size="icon-sm"
              variant="outline"
            >
              {playback.playing ? <PauseVoiceIcon /> : <PlayVoiceIcon />}
            </Button>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{take.label}</ItemTitle>
            <ItemDescription className="tabular-nums">
              {formatSeconds(take.seconds)}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button onClick={onReplace} size="sm" variant="ghost">
              Replace
            </Button>
          </ItemActions>
        </Item>

        {take.noisy ? (
          <Alert className="bg-warning-tint text-warning-tint-foreground">
            <AlertTitle>Background noise in this sample</AlertTitle>
            <AlertDescription className="text-warning-tint-foreground">
              It will be cloned with the voice. Replace it with a take from a
              quieter room for a cleaner clone.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <Field>
        <FieldHeader
          error={transcriptMissing ? "Add what was said." : null}
          htmlFor="clone-transcript"
        >
          Transcript
        </FieldHeader>
        {/* A page explains inline, under the label (a drawer would use an
            (i)). */}
        <FieldDescription>
          The clone is built from this text and the audio together. Fix any word
          that doesn’t match what was said.
        </FieldDescription>
        {take.transcript === null ? (
          <div
            aria-label="Transcribing"
            className="flex flex-col gap-2 py-2"
            role="status"
          >
            <Skeleton className="h-4 w-full motion-reduce:animate-none" />
            <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
          </div>
        ) : (
          <Textarea
            aria-describedby={
              transcriptMissing ? errorId("clone-transcript") : undefined
            }
            aria-invalid={transcriptMissing || undefined}
            dir="auto"
            id="clone-transcript"
            onChange={(event) => onTranscriptChange(event.target.value)}
            rows={3}
            value={take.transcript}
          />
        )}
      </Field>
    </>
  )
}

function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    const done = (value: number | null) => {
      URL.revokeObjectURL(url)
      resolve(value)
    }
    audio.addEventListener("loadedmetadata", () =>
      done(Number.isFinite(audio.duration) ? audio.duration : null),
    )
    audio.addEventListener("error", () => done(null))
    audio.src = url
  })
}
