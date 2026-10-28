export type Modality = "llm" | "tts"

export const MODALITIES: { id: Modality; label: string }[] = [
  { id: "llm", label: "LLM" },
  { id: "tts", label: "TTS" },
]

type Provider = {
  id: string
  name: string
  modalities: Modality[]
  listsModels: boolean
}

export const PROVIDERS: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    modalities: ["llm", "tts"],
    listsModels: true,
  },
  { id: "gemini", name: "Gemini", modalities: ["llm"], listsModels: true },
  { id: "groq", name: "Groq", modalities: ["llm"], listsModels: true },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    modalities: ["tts"],
    listsModels: true,
  },
  {
    id: "azure_openai",
    name: "Azure OpenAI",
    modalities: ["llm"],
    listsModels: false,
  },
  { id: "cerebras", name: "Cerebras", modalities: ["llm"], listsModels: false },
  { id: "cartesia", name: "Cartesia", modalities: ["tts"], listsModels: false },
  { id: "deepgram", name: "Deepgram", modalities: ["tts"], listsModels: false },
  { id: "hamsa", name: "Hamsa", modalities: ["tts"], listsModels: false },
]

const LIVE_MODELS: Record<string, Partial<Record<Modality, string[]>>> = {
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
  },
  gemini: { llm: ["pro", "flash", "flash-lite-3.1"] },
  groq: {
    llm: [
      "llama-3.3-70b-versatile",
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "openai/gpt-oss-120b",
      "gemma2-9b-it",
    ],
  },
  elevenlabs: {
    tts: ["eleven_turbo_v2_5", "eleven_multilingual_v2", "eleven_flash_v2_5"],
  },
}

export type CatalogEntry = {
  id: string
  modality: Modality
  providerId: string
  modelId: string
  displayName: string
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
]

export function canOnboard(modality: Modality): boolean {
  return modality === "llm"
}

export function providerById(id: string): Provider | undefined {
  return PROVIDERS.find((provider) => provider.id === id)
}

export function liveModelsFor(
  providerId: string,
  modality: Modality,
): string[] {
  return LIVE_MODELS[providerId]?.[modality] ?? []
}
