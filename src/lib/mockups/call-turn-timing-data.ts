type DetectionPathId = "livekit_v1_mini" | "sarj_eou" | "vad"

export type DetectionPath = {
  id: DetectionPathId
  label: string
  description: string
}

const DETECTION_PATHS: Record<DetectionPathId, DetectionPath> = {
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

export type WaitSource = "global" | "persona"

export type TurnTimingRecord = {
  configured: DetectionPath
  /** What actually ran. Differs from `configured` only after a fallback. */
  ran: DetectionPath
  fallbackReason: null | string
  minWaitSeconds: number
  maxWaitSeconds: number
  waitSource: WaitSource
  persona: string
  turnCount: number
  turnsAtMaximum: number
  firstTurnWaitSeconds: number
}

export type CallCase = {
  id: string
  label: string
  summary: string
  call: {
    id: string
    organization: string
    direction: string
    duration: string
    language: string
  }
  voice: { name: string; language: string; gender: string }
  /** `null` for a call placed before turn timing was recorded. */
  timing: null | TurnTimingRecord
}

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

export const RECOMMENDED_MAX_WAIT_CEILING_SECONDS = 3

export function formatSeconds(seconds: number): string {
  return `${seconds.toFixed(1)}s`
}
