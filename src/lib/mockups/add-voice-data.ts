type Option = { value: string; label: string }

export const LANGUAGES: Option[] = [
  { value: "ar", label: "AR" },
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
  { value: "hi", label: "HI" },
  { value: "ur", label: "UR" },
]

export const GENDERS: Option[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
]

type Provider = Option & { defaultModel: string }

export const PROVIDERS: Provider[] = [
  {
    value: "eleven-labs",
    label: "Eleven Labs",
    defaultModel: "eleven_multilingual_v2",
  },
  { value: "sarj-omni", label: "Sarj Omni", defaultModel: "omni-tts-1" },
  { value: "cartesia", label: "Cartesia", defaultModel: "sonic-2" },
  { value: "azure", label: "Azure", defaultModel: "neural-hd" },
]

type FallbackVoice = {
  id: string
  name: string
  vibe: string
  gender: string
  provider: string
}

export const FALLBACK_VOICES: FallbackVoice[] = [
  {
    id: "faisal",
    name: "Faisal",
    vibe: "Calm and steady",
    gender: "Male",
    provider: "Sarj Omni",
  },
  {
    id: "noura",
    name: "Noura",
    vibe: "Bright and helpful",
    gender: "Female",
    provider: "Sarj Omni",
  },
  {
    id: "abdullah",
    name: "Abdullah",
    vibe: "Confident and professional",
    gender: "Male",
    provider: "Cartesia",
  },
  {
    id: "layla",
    name: "Layla",
    vibe: "Warm and reassuring",
    gender: "Female",
    provider: "Azure",
  },
]

export const DEFAULT_FALLBACK_VOICE_ID = "faisal"
