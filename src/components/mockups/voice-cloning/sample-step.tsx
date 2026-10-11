"use client"

import * as React from "react"

import { FieldHint } from "@/components/design-system/field-hint"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
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

/**
 * Step 1 of the clone flow: one reference sample, recorded or uploaded, and
 * the transcript the clone is built from.
 *
 * The PRD puts the transcript after preview; it sits here instead, beside the
 * take it describes. The TTS contract registers audio and text together, so a
 * transcript corrected after the clone is a clone built from the wrong text —
 * here, Next clones from text the reader has already checked, and the preview
 * on step 2 is the final voice.
 *
 * The limits are enforced, not warned: stopping before 6 seconds discards the
 * take, recording stops itself at 20, and an upload over 20 seconds or 10 MB
 * never becomes a take. Noise is the one thing only warned about — it still
 * clones, just badly.
 */

export type Take = {
  source: "recording" | "upload"
  /** "Recording", or the uploaded file's name. */
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
  /** The reviewer's forced outcome: every take comes back noisy. */
  noisy: boolean
  /** Set once Next has been pressed with something missing. */
  showErrors: boolean
}) {
  const fileInput = React.useRef<HTMLInputElement>(null)

  /* 3, 2, 1, then the start tone and capture. */
  React.useEffect(() => {
    if (capture.kind !== "countdown") return
    const timer = setTimeout(() => {
      if (capture.count > 1) {
        setCapture({ kind: "countdown", count: capture.count - 1 })
        return
      }
      playTone("start")
      setCapture({ kind: "recording", startedAt: Date.now(), elapsed: 0 })
    }, 1000)
    return () => clearTimeout(timer)
  }, [capture, setCapture])

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

  /* The clock, and the hard stop at 20 seconds. */
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

  /* Transcription comes back a moment after the take lands. */
  const transcribing = capture.kind === "take" && capture.take.transcript === null
  React.useEffect(() => {
    if (!transcribing) return
    const timer = setTimeout(
      () =>
        setCapture((current) =>
          current.kind === "take"
            ? { kind: "take", take: { ...current.take, transcript: TRANSCRIPT } }
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
        error: "That file couldn’t be played. Upload a WAV, MP3, FLAC or OGG file.",
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

          {capture.kind === "idle" ? (
            <div className="flex flex-col gap-2">
              {capture.error || showErrors ? (
                <FieldError>
                  {capture.error ?? "Record or upload a sample first."}
                </FieldError>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() =>
                    setCapture({ kind: "countdown", count: COUNTDOWN_FROM })
                  }
                  size="lg"
                >
                  <RecordIcon />
                  Start recording
                </Button>
                <Button
                  onClick={() => fileInput.current?.click()}
                  size="lg"
                  variant="outline"
                >
                  <UploadSampleIcon />
                  Upload a file
                </Button>
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
              <p className="text-sm text-muted-foreground">
                {SAMPLE_LIMITS.minSeconds} to {SAMPLE_LIMITS.maxSeconds}{" "}
                seconds, 6 to 10 is best. Files: WAV, MP3, FLAC or OGG, up to{" "}
                {SAMPLE_LIMITS.maxMegabytes} MB.
              </p>
            </div>
          ) : null}

          {capture.kind === "countdown" ? (
            <div className="flex items-center gap-4">
              <span
                aria-live="assertive"
                className="w-8 text-2xl font-semibold tabular-nums"
              >
                {capture.count}
              </span>
              <span className="flex-1 text-sm text-muted-foreground">
                Recording starts after the tone
              </span>
              <Button
                onClick={() => setCapture(EMPTY_CAPTURE)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          ) : null}

          {capture.kind === "recording" ? (
            <RecordingView
              elapsed={capture.elapsed}
              onStop={() => finish(capture.elapsed)}
            />
          ) : null}
        </>
      )}
    </div>
  )
}

function RecordingView({
  elapsed,
  onStop,
}: {
  elapsed: number
  onStop: () => void
}) {
  const short = elapsed < SAMPLE_LIMITS.minSeconds

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span
            aria-hidden
            className="size-2 animate-pulse rounded-full bg-destructive motion-reduce:animate-none"
          />
          Recording
        </span>
        <span className="flex-1 text-sm tabular-nums">
          {formatSeconds(elapsed)}
          <span className="text-muted-foreground">
            {" "}
            / {formatSeconds(SAMPLE_LIMITS.maxSeconds)}
          </span>
        </span>
        <Button onClick={onStop}>
          <StopRecordingIcon />
          Stop
        </Button>
      </div>
      <Progress
        aria-label="Recording length"
        value={(elapsed / SAMPLE_LIMITS.maxSeconds) * 100}
      />
      {/* The one moving fact the reader needs while speaking: whether
          stopping now keeps the take. */}
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {short
          ? `Keep going — ${SAMPLE_LIMITS.minSeconds} seconds minimum`
          : `Stops on its own at ${SAMPLE_LIMITS.maxSeconds} seconds`}
      </p>
    </div>
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
        <FieldHint
          hint="The clone is built from this text and the audio together. Fix any word that doesn’t match what was said."
          htmlFor="clone-transcript"
        >
          Transcript
        </FieldHint>
        {transcriptMissing ? (
          <FieldError>Add what was said in the sample.</FieldError>
        ) : null}
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

/** Reads a file's real length, or null when the browser cannot decode it. */
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

