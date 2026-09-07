/**
 * Mock data for the model catalog (DES-169 / DIS-9).
 *
 * Shapes mirror the platform: the providers and model IDs here are the ones
 * bulbul's own enums carry today — `LLMConfig`, `STTProvider`, `TTSVoice` and
 * the model lists hardcoded in `admin/models/{llm,stt,tts}.tsx` — so the
 * catalog reads as the same platform rather than an invented one.
 *
 * The columns are the PRD's five and nothing else: Provider, Model, Display
 * name, Status, and the deactivate/reactivate action.
 */

export type Modality = "llm" | "tts" | "stt"

/**
 * LLM, TTS and STT only.
 *
 * EOU is deliberately absent. The PRD's Q&A answers it directly: choosing
 * between Sarj's classifier and LiveKit's is already self-service through the
 * existing turn detection control in Global Settings, and onboarding a new EOU
 * model is an ONNX export plus an image rebuild — a deploy pipeline no form
 * can reach.
 */
export const MODALITIES: { id: Modality; label: string }[] = [
  { id: "llm", label: "LLM" },
  { id: "tts", label: "TTS" },
  { id: "stt", label: "STT" },
]

/**
 * A provider we already hold credentials for.
 *
 * `listsModels` is the whole reason the add flow has two shapes. Where a
 * provider exposes its own model-listing endpoint, the key we already call it
 * with can fetch that list, so onboarding is "pick one". Where it does not, the
 * admin types the model ID and proves it with a test instead.
 */
export type Provider = {
  id: string
  name: string
  modalities: Modality[]
  /** Whether the provider publishes a live model-listing endpoint. */
  listsModels: boolean
}

/* The four that publish a list are the four the PRD names: OpenAI, Gemini,
   Groq and ElevenLabs. */
export const PROVIDERS: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    modalities: ["llm", "tts", "stt"],
    listsModels: true,
  },
  { id: "gemini", name: "Gemini", modalities: ["llm"], listsModels: true },
  {
    id: "groq",
    name: "Groq",
    modalities: ["llm", "stt"],
    listsModels: true,
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    modalities: ["tts", "stt"],
    listsModels: true,
  },
  {
    id: "azure_openai",
    name: "Azure OpenAI",
    modalities: ["llm", "stt"],
    listsModels: false,
  },
  { id: "cerebras", name: "Cerebras", modalities: ["llm"], listsModels: false },
  { id: "cartesia", name: "Cartesia", modalities: ["tts"], listsModels: false },
  {
    id: "deepgram",
    name: "Deepgram",
    modalities: ["tts", "stt"],
    listsModels: false,
  },
  {
    id: "speechmatics",
    name: "Speechmatics",
    modalities: ["stt"],
    listsModels: false,
  },
  {
    id: "hamsa",
    name: "Hamsa",
    modalities: ["tts", "stt"],
    listsModels: false,
  },
]

/**
 * What a provider's live list comes back with, keyed by provider then modality.
 * Only the providers with `listsModels` have one — the rest reach the manual
 * path, and so does any provider whose fetch fails.
 */
export const LIVE_MODELS: Record<
  string,
  Partial<Record<Modality, string[]>>
> = {
  openai: {
    llm: [
      "gpt-5.6",
      "gpt-5.5",
      "gpt-5.4",
      "gpt-5.4-mini",
      "gpt-5.4-nano",
      "gpt-5.2",
      "gpt-5.1",
      "gpt-4.1",
      "o4-mini",
    ],
    tts: ["gpt-4o-mini-tts", "tts-1-hd", "tts-1"],
    stt: ["gpt-4o-transcribe", "gpt-4o-mini-transcribe", "whisper-1"],
  },
  gemini: { llm: ["pro", "flash", "flash-lite-3.1"] },
  groq: {
    llm: [
      "llama-3.3-70b-versatile",
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "openai/gpt-oss-120b",
      "gemma2-9b-it",
    ],
    stt: ["whisper-large-v3", "whisper-large-v3-turbo"],
  },
  elevenlabs: {
    tts: ["eleven_turbo_v2_5", "eleven_multilingual_v2", "eleven_flash_v2_5"],
    stt: ["scribe_v1"],
  },
}

export type CatalogEntry = {
  id: string
  modality: Modality
  providerId: string
  /** The identifier sent to the provider verbatim, e.g. `gpt-5.4-mini`. */
  modelId: string
  /** What this model is called in the Global and Org Settings pickers. */
  displayName: string
  /**
   * The one optional free-text field the PRD asks for. TTS and STT carry
   * compatibility baggage a plain string cannot express — voice or language
   * support — and the PRD is explicit that this is one notes field, not a
   * schema per provider.
   */
  notes: null | string
  active: boolean
}

export const CATALOG: CatalogEntry[] = [
  {
    id: "mc_llm_1",
    modality: "llm",
    providerId: "openai",
    modelId: "gpt-5.5",
    displayName: "GPT-5.5",
    notes: null,
    active: true,
  },
  {
    id: "mc_llm_2",
    modality: "llm",
    providerId: "openai",
    modelId: "gpt-5.4-mini",
    displayName: "GPT-5.4 Mini",
    notes: null,
    active: true,
  },
  {
    id: "mc_llm_3",
    modality: "llm",
    providerId: "openai",
    modelId: "o3-mini",
    displayName: "o3 Mini",
    notes: null,
    active: false,
  },
  {
    id: "mc_llm_4",
    modality: "llm",
    providerId: "gemini",
    modelId: "flash",
    displayName: "Gemini Flash",
    notes: null,
    active: true,
  },
  {
    id: "mc_llm_5",
    modality: "llm",
    providerId: "groq",
    modelId: "llama-3.3-70b-versatile",
    displayName: "Llama 3.3 70B",
    notes: null,
    active: true,
  },
  {
    id: "mc_llm_6",
    modality: "llm",
    providerId: "cerebras",
    modelId: "llama-3.1-8b-instruct",
    displayName: "Llama 3.1 8B",
    notes: "Cerebras publishes no model list — this one was added by ID.",
    active: true,
  },

  {
    id: "mc_tts_1",
    modality: "tts",
    providerId: "elevenlabs",
    modelId: "eleven_turbo_v2_5",
    displayName: "ElevenLabs Turbo v2.5",
    notes: "Arabic only on the multilingual voice set.",
    active: true,
  },
  {
    id: "mc_tts_2",
    modality: "tts",
    providerId: "cartesia",
    modelId: "sonic-2",
    displayName: "Cartesia Sonic 2",
    notes: "English and Arabic only. Voice IDs do not carry over from Sonic 1.",
    active: true,
  },
  {
    id: "mc_tts_3",
    modality: "tts",
    providerId: "openai",
    modelId: "gpt-4o-mini-tts",
    displayName: "OpenAI Mini TTS",
    notes: null,
    active: true,
  },
  {
    id: "mc_tts_4",
    modality: "tts",
    providerId: "hamsa",
    modelId: "hamsa-tts-ar-v2",
    displayName: "Hamsa Arabic v2",
    notes:
      "Gulf dialect only. No English fallback — pair it with a second model.",
    active: false,
  },

  {
    id: "mc_stt_1",
    modality: "stt",
    providerId: "openai",
    modelId: "gpt-4o-transcribe",
    displayName: "OpenAI Transcribe",
    notes: null,
    active: true,
  },
  {
    id: "mc_stt_2",
    modality: "stt",
    providerId: "groq",
    modelId: "whisper-large-v3",
    displayName: "Groq Whisper Large v3",
    notes: null,
    active: true,
  },
  {
    id: "mc_stt_3",
    modality: "stt",
    providerId: "elevenlabs",
    modelId: "scribe_v1",
    displayName: "ElevenLabs Scribe",
    notes: null,
    active: true,
  },
  {
    id: "mc_stt_4",
    modality: "stt",
    providerId: "speechmatics",
    modelId: "enhanced-ar",
    displayName: "Speechmatics Enhanced (AR)",
    notes: "Speechmatics exposes no model list — this one was added by ID.",
    active: true,
  },
]

export function providerById(id: string): Provider | undefined {
  return PROVIDERS.find((provider) => provider.id === id)
}

/** What the live list comes back with for a provider in a given modality. */
export function liveModelsFor(
  providerId: string,
  modality: Modality,
): string[] {
  return LIVE_MODELS[providerId]?.[modality] ?? []
}
