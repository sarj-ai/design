/**
 * The values this screen configures, mirrored from what the platform ships
 * today so the mockup cannot drift from the thing it is redesigning.
 *
 * Nothing here exists that the PRD does not name. The PRD is the spec.
 */

/** Hard ceiling the numeric fields enforce. Above this will not save. */
export const MAX_WAIT_CEILING_SECONDS = 10

/** Under this, a lower maximum starts cutting callers off mid-sentence. */
export const RECOMMENDED_MAX_WAIT_FLOOR_SECONDS = 0.5

/**
 * Over this, an unsure model leaves the caller sitting in silence.
 *
 * Not a PRD requirement — the PRD asks only for the floor warning — but it
 * ships in `turn-wait-fields.tsx` today, so dropping it here would show a
 * weaker screen than the live one.
 */
export const RECOMMENDED_MAX_WAIT_CEILING_SECONDS = 3

export type DetectionModelId = "livekit_v1_mini" | "sarj_eou" | "vad"

export type DetectionModel = {
  id: DetectionModelId
  label: string
  /** Languages it runs on. Picking one it cannot serve is silent today. */
  support: string
  /** Whether a wait window applies. VAD has no semantic verdict to wait on. */
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

/** What the org has saved today. */
export const SAVED_GLOBAL = {
  detectionModelId: "livekit_v1_mini" as DetectionModelId,
  maxWaitSeconds: 1,
  minWaitSeconds: 0.2,
}

/** The persona the override surface is read against. */
export const PERSONA = {
  name: "نورة",
  role: "Collections",
  /** Saved override, or null while it follows the global values. */
  override: null as null | { maxWaitSeconds: number; minWaitSeconds: number },
}

/** One decimal, and no trailing `.0` on whole seconds. */
export function formatSeconds(seconds: number): string {
  return `${Number(seconds.toFixed(1))}s`
}
