/**
 * Mock data for the turn detection panel on a call's Model Settings tab.
 *
 * The wire names and the default wait values are the platform's own —
 * `sarj_eou` waits 0.5s–3.0s, `livekit_v1_mini` waits 0.3s–2.5s — so a reader
 * comparing the mockup against a real call sees the same vocabulary.
 */

/** The three detection paths a call can run, by their platform wire type. */
export type DetectionPathId = "livekit_v1_mini" | "sarj_eou" | "vad"

export type DetectionPath = {
  id: DetectionPathId
  label: string
  /** What the path does, for a reader who has not met the model. */
  description: string
}

export const DETECTION_PATHS: Record<DetectionPathId, DetectionPath> = {
  livekit_v1_mini: {
    id: "livekit_v1_mini",
    label: "LiveKit v1-mini",
    description:
      "Semantic model. Scores how likely the caller is to keep talking. Arabic and English only.",
  },
  sarj_eou: {
    id: "sarj_eou",
    label: "Sarj Arabic EOU",
    description:
      "Semantic model. Scores how likely the caller is to keep talking. Arabic only.",
  },
  vad: {
    id: "vad",
    label: "VAD / silence-based",
    description:
      "Silence only. Waits out a pause using voice activity detection; no semantic model runs.",
  },
}

/** Whether the wait values came from Global Settings or from a persona override. */
export type WaitSource = "global" | "persona"

export type TurnTimingRecord = {
  /** The path Global Settings asked for. */
  configured: DetectionPath
  /** What actually ran. Differs from `configured` only after a fallback. */
  ran: DetectionPath
  /** Why the configured path did not run, or `null` when it did. */
  fallbackReason: null | string
  minWaitSeconds: number
  maxWaitSeconds: number
  waitSource: WaitSource
  /** The persona the call ran under, named whether or not it overrode anything. */
  persona: string
  turnCount: number
  /** Turns where the model never reached confidence, so the ceiling applied. */
  turnsAtMaximum: number
  /** What the caller sat through before the agent's first word. */
  firstTurnWaitSeconds: number
}

export type CallCase = {
  id: string
  /** Tab label — the state, not the call. */
  label: string
  /** The one line that says why this state is worth drawing. */
  summary: string
  call: {
    id: string
    organization: string
    direction: string
    duration: string
    language: string
  }
  /** The voice this call ran, so the TTS section below agrees with its language. */
  voice: { name: string; language: string; gender: string }
  /** `null` for a call placed before turn timing was recorded. */
  timing: null | TurnTimingRecord
}

/** Unchanged by this ticket — the sections the new one sits above. */
export const MODEL_SETTINGS = {
  llm: { provider: "Anthropic", model: "claude-sonnet-4-5" },
  stt: { provider: "Deepgram", model: "nova-3" },
  tts: { provider: "ElevenLabs", model: "eleven_flash_v2_5" },
}

const ARABIC_VOICE = { name: "Layla", language: "Arabic", gender: "Female" }
const ENGLISH_VOICE = { name: "Amira", language: "English", gender: "Female" }

export const CALL_CASES: CallCase[] = [
  {
    id: "within",
    label: "Within the window",
    summary:
      "The configured path ran and every turn resolved before the ceiling. Nothing to diagnose — the panel says so in one read.",
    call: {
      id: "019fa760-6e93-774e-a591-fc9877604229",
      organization: "Al Rajhi Bank",
      direction: "Inbound",
      duration: "4m 12s",
      language: "Arabic",
    },
    voice: ARABIC_VOICE,
    timing: {
      configured: DETECTION_PATHS.sarj_eou,
      ran: DETECTION_PATHS.sarj_eou,
      fallbackReason: null,
      minWaitSeconds: 0.4,
      maxWaitSeconds: 2,
      waitSource: "persona",
      persona: "Support — Arabic",
      turnCount: 31,
      turnsAtMaximum: 0,
      firstTurnWaitSeconds: 0.6,
    },
  },
  {
    id: "reached-maximum",
    label: "Reached the maximum",
    summary:
      "The complaint case: the model was unsure on the opening turn, so the caller waited the full ceiling before the agent said anything.",
    call: {
      id: "019fa7c1-04b2-7f18-9d40-2ae61c73b885",
      organization: "stc",
      direction: "Outbound",
      duration: "2m 48s",
      language: "Arabic",
    },
    voice: ARABIC_VOICE,
    timing: {
      configured: DETECTION_PATHS.sarj_eou,
      ran: DETECTION_PATHS.sarj_eou,
      fallbackReason: null,
      minWaitSeconds: 0.5,
      maxWaitSeconds: 3,
      waitSource: "global",
      persona: "Collections — Arabic",
      turnCount: 24,
      turnsAtMaximum: 4,
      firstTurnWaitSeconds: 3,
    },
  },
  {
    id: "fell-back",
    label: "Fell back",
    summary:
      "Detection was configured one way and ran another. Today this is invisible from the platform and surfaces only when the client reports callers hanging up.",
    call: {
      id: "019fa804-55d1-71c6-b0e3-4419fa22cd07",
      organization: "Tamara",
      direction: "Inbound",
      duration: "1m 39s",
      language: "English",
    },
    voice: ENGLISH_VOICE,
    timing: {
      configured: DETECTION_PATHS.livekit_v1_mini,
      ran: DETECTION_PATHS.vad,
      fallbackReason:
        "The LiveKit model did not load at call start, so detection fell through to silence.",
      minWaitSeconds: 0.3,
      maxWaitSeconds: 2.5,
      waitSource: "global",
      persona: "Order support — English",
      turnCount: 18,
      turnsAtMaximum: 6,
      firstTurnWaitSeconds: 2.5,
    },
  },
  {
    id: "not-recorded",
    label: "Not recorded",
    summary:
      "A call placed before turn timing was recorded. The panel says nothing was captured rather than showing today's settings as if they were the call's.",
    call: {
      id: "019f2a13-8c07-70bd-b1ee-6d2f0c4a91f3",
      organization: "Jahez",
      direction: "Inbound",
      duration: "3m 05s",
      language: "Arabic",
    },
    voice: ARABIC_VOICE,
    timing: null,
  },
]

/** The floor the persona and global editors already warn below. */
export const RECOMMENDED_MAX_WAIT_CEILING_SECONDS = 3

export function formatSeconds(seconds: number): string {
  return `${seconds.toFixed(1)}s`
}
