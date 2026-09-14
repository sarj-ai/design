/**
 * Mock data for the Add new voice dialog.
 *
 * The library is global — one list of voices every workspace picks from — so
 * these options are platform-wide, not per-customer.
 */

export type Option = { value: string; label: string }

/** The languages the library currently carries voices for. */
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

/**
 * A TTS provider and the model it renders with unless the voice names another
 * one — the model field takes the provider's default when left blank.
 */
export type Provider = Option & { defaultModel: string }

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

/**
 * A voice already in the library, offered as the one to fall back to.
 *
 * The picked row and the picker say different second things about the same
 * voice, and both are deliberate: the row names the **provider**, because the
 * point of a fallback is that it is not the provider that just failed; the
 * picker names the **gender**, because that is what you match on while
 * choosing.
 */
export type FallbackVoice = {
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
