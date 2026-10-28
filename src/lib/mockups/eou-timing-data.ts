export const MAX_WAIT_CEILING_SECONDS = 10

export const RECOMMENDED_MAX_WAIT_FLOOR_SECONDS = 0.5

export const RECOMMENDED_MAX_WAIT_CEILING_SECONDS = 3

export type DetectionModelId = "livekit_v1_mini" | "sarj_eou" | "vad"

type DetectionModel = {
  id: DetectionModelId
  label: string
  support: string
  semantic: boolean
}

export const DETECTION_MODELS: DetectionModel[] = [
  {
    id: "livekit_v1_mini",
    label: "LiveKit v1-mini",
    support: "Supports Arabic and English only.",
    semantic: true,
  },
  {
    id: "sarj_eou",
    label: "Sarj Arabic EOU",
    support: "Supports Arabic only.",
    semantic: true,
  },
  {
    id: "vad",
    label: "VAD / silence-based (no semantic EOU)",
    support:
      "Listens for silence only. No semantic model runs, so there is no wait window to tune.",
    semantic: false,
  },
]

export const SAVED_GLOBAL = {
  detectionModelId: "livekit_v1_mini" as DetectionModelId,
  maxWaitSeconds: 1,
  minWaitSeconds: 0.2,
}

export const PERSONA = {
  name: "نورة",
  role: "Collections",
  /** Saved override, or null while it follows the global values. */
  override: null as null | { maxWaitSeconds: number; minWaitSeconds: number },
}

export function formatSeconds(seconds: number): string {
  return `${Number(seconds.toFixed(1))}s`
}
