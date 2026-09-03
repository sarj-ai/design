/**
 * Mock data for the personas depth pass (DES-117).
 *
 * Shapes mirror the product: a persona owns a voice (provider and model come
 * with the voice, never picked separately), exactly one persona per language
 * is the default, and a scenario holds one persona per language.
 */

export type PersonaLanguage = "Arabic" | "English" | "Urdu"
export type PersonaGender = "Female" | "Male"

export type Voice = {
  id: string
  name: string
  /** Short personality blurb shown wherever the voice is listed. */
  vibe: string
  language: PersonaLanguage
  gender: PersonaGender
  provider: string
  active: boolean
}

export type Persona = {
  id: string
  name: string
  language: PersonaLanguage
  gender: PersonaGender
  voiceId: string
  isDefault: boolean
  prompt: string
  scenarioIds: string[]
  createdAt: string
}

export type Scenario = {
  id: string
  name: string
  languages: PersonaLanguage[]
}

export const LANGUAGES: PersonaLanguage[] = ["Arabic", "English", "Urdu"]
export const GENDERS: PersonaGender[] = ["Female", "Male"]

export const VOICES: Voice[] = [
  {
    id: "v-nourah",
    name: "Nourah",
    vibe: "Warm and unhurried — reads numbers and dates carefully.",
    language: "Arabic",
    gender: "Female",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-salma",
    name: "Salma",
    vibe: "هادئة وواضحة، مناسبة للتذكيرات والمواعيد.",
    language: "Arabic",
    gender: "Female",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-arabic-f1",
    name: "Arabic Female 1",
    vibe: "Neutral news-reader tone from the first voice batch.",
    language: "Arabic",
    gender: "Female",
    provider: "Azure",
    active: true,
  },
  {
    id: "v-lulwa",
    name: "Lulwa",
    vibe: "Soft and reassuring — a natural fit for healthcare calls.",
    language: "Arabic",
    gender: "Female",
    provider: "Groq Orpheus",
    active: true,
  },
  {
    id: "v-aisha-voice",
    name: "Aisha",
    vibe: "Youthful and energetic, quick on greetings.",
    language: "Arabic",
    gender: "Female",
    provider: "Groq Orpheus",
    active: true,
  },
  {
    id: "v-jood",
    name: "Jood",
    vibe: "Polished and formal — suits banking and government.",
    language: "Arabic",
    gender: "Female",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-reem",
    name: "Reem",
    vibe: "لهجة خليجية دافئة، مناسبة لخدمة العملاء.",
    language: "Arabic",
    gender: "Female",
    provider: "Cartesia",
    active: true,
  },
  {
    id: "v-dana",
    name: "Dana",
    vibe: "Crisp and businesslike, keeps a steady pace.",
    language: "Arabic",
    gender: "Female",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-farah",
    name: "Farah",
    vibe: "Light and friendly with a Levantine touch.",
    language: "Arabic",
    gender: "Female",
    provider: "OpenAI",
    active: true,
  },
  {
    id: "v-arabic-f2",
    name: "Arabic Female 2",
    vibe: "Slower read from the first voice batch.",
    language: "Arabic",
    gender: "Female",
    provider: "Azure",
    active: true,
  },
  {
    id: "v-arabic-f3",
    name: "Arabic Female 3",
    vibe: "Retired after the Omni voices landed.",
    language: "Arabic",
    gender: "Female",
    provider: "Azure",
    active: false,
  },
  {
    id: "v-ibrahim",
    name: "Ibrahim",
    vibe: "Confident and friendly, with a light Najdi accent.",
    language: "Arabic",
    gender: "Male",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-fares",
    name: "Fares",
    vibe: "Bright and upbeat — suits outbound and sales calls.",
    language: "Arabic",
    gender: "Male",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-emma",
    name: "Emma",
    vibe: "Calm mid-thirties British voice with a soft close.",
    language: "English",
    gender: "Female",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-english-f2",
    name: "English Female 2",
    vibe: "Legacy default before the Omni voices landed.",
    language: "English",
    gender: "Female",
    provider: "Azure",
    active: false,
  },
  {
    id: "v-daniel",
    name: "Daniel",
    vibe: "Deep and measured — good for payment conversations.",
    language: "English",
    gender: "Male",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-english-m1",
    name: "English Male 1",
    vibe: "Flat, even IVR tone. Reliable, not warm.",
    language: "English",
    gender: "Male",
    provider: "Azure",
    active: true,
  },
  {
    id: "v-urdu-f1",
    name: "Urdu Female 1",
    vibe: "Clear and formal, careful with honorifics.",
    language: "Urdu",
    gender: "Female",
    provider: "Azure",
    active: true,
  },
  {
    id: "v-bilal",
    name: "Bilal",
    vibe: "Warm conversational Karachi accent.",
    language: "Urdu",
    gender: "Male",
    provider: "ElevenLabs",
    active: true,
  },

  /* The other five combinations, filled to the depth Arabic Female already had.
     Only that one combo held a real list; the rest had one or two voices, so
     five of the six paths through the picker showed a search box with nothing
     to search and a scroll window with nothing to scroll. The comment at the
     top of VoicePicker already says production combos hold dozens — this is the
     data catching up with it. */

  {
    id: "v-khalid",
    name: "Khalid",
    vibe: "صوت رسمي وواثق، مناسب للتحصيل والمتابعة.",
    language: "Arabic",
    gender: "Male",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-omar",
    name: "Omar",
    vibe: "Brisk and businesslike — good for short confirmations.",
    language: "Arabic",
    gender: "Male",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-tariq",
    name: "Tariq",
    vibe: "نبرة ودودة تميل إلى الطمأنة أكثر من الإلحاح.",
    language: "Arabic",
    gender: "Male",
    provider: "Groq Orpheus",
    active: true,
  },
  {
    id: "v-yousef",
    name: "Yousef",
    vibe: "Even and unhurried; handles long account numbers well.",
    language: "Arabic",
    gender: "Male",
    provider: "Cartesia",
    active: true,
  },
  {
    id: "v-majed",
    name: "Majed",
    vibe: "أعمق نبرة في المجموعة، واضح على الخطوط الضعيفة.",
    language: "Arabic",
    gender: "Male",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-sami",
    name: "Sami",
    vibe: "Younger, lighter read — softens a collections script.",
    language: "Arabic",
    gender: "Male",
    provider: "OpenAI",
    active: true,
  },
  {
    id: "v-rashed",
    name: "Rashed",
    vibe: "خليجي واضح، يحافظ على إيقاع ثابت في المكالمات الطويلة.",
    language: "Arabic",
    gender: "Male",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-arabic-m1",
    name: "Arabic Male 1",
    vibe: "Flat IVR read. Predictable, never expressive.",
    language: "Arabic",
    gender: "Male",
    provider: "Azure",
    active: true,
  },

  {
    id: "v-olivia",
    name: "Olivia",
    vibe: "Warm British RP — reads figures without sounding clipped.",
    language: "English",
    gender: "Female",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-sophie",
    name: "Sophie",
    vibe: "Bright and quick. Best on short confirmation calls.",
    language: "English",
    gender: "Female",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-grace",
    name: "Grace",
    vibe: "Calm and measured, holds up through a long explanation.",
    language: "English",
    gender: "Female",
    provider: "Cartesia",
    active: true,
  },
  {
    id: "v-hannah",
    name: "Hannah",
    vibe: "Neutral American; the safe default for mixed audiences.",
    language: "English",
    gender: "Female",
    provider: "OpenAI",
    active: true,
  },
  {
    id: "v-ava",
    name: "Ava",
    vibe: "Friendly and informal — softer for retention scripts.",
    language: "English",
    gender: "Female",
    provider: "Groq Orpheus",
    active: true,
  },
  {
    id: "v-chloe",
    name: "Chloe",
    vibe: "Crisp and efficient, barely pauses between clauses.",
    language: "English",
    gender: "Female",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-ruby",
    name: "Ruby",
    vibe: "Lower register; steady on difficult conversations.",
    language: "English",
    gender: "Female",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-english-f1",
    name: "English Female 1",
    vibe: "Flat IVR tone. Reliable, not warm.",
    language: "English",
    gender: "Female",
    provider: "Azure",
    active: true,
  },

  {
    id: "v-oliver",
    name: "Oliver",
    vibe: "Measured British RP, formal without sounding stiff.",
    language: "English",
    gender: "Male",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-noah",
    name: "Noah",
    vibe: "Neutral American, easy pace — the general-purpose pick.",
    language: "English",
    gender: "Male",
    provider: "OpenAI",
    active: true,
  },
  {
    id: "v-ethan",
    name: "Ethan",
    vibe: "Warm and conversational; good when the news is bad.",
    language: "English",
    gender: "Male",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-lucas",
    name: "Lucas",
    vibe: "Quick and light. Suits reminders more than collections.",
    language: "English",
    gender: "Male",
    provider: "Groq Orpheus",
    active: true,
  },
  {
    id: "v-marcus",
    name: "Marcus",
    vibe: "Deep and authoritative — carries a firm script.",
    language: "English",
    gender: "Male",
    provider: "Cartesia",
    active: true,
  },
  {
    id: "v-theo",
    name: "Theo",
    vibe: "Even and unhurried, reads long reference numbers cleanly.",
    language: "English",
    gender: "Male",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-english-m2",
    name: "English Male 2",
    vibe: "Second Azure read — slightly warmer than English Male 1.",
    language: "English",
    gender: "Male",
    provider: "Azure",
    active: true,
  },

  {
    id: "v-ayesha",
    name: "Ayesha",
    vibe: "نرم اور واضح لہجہ، یاد دہانی کے لیے موزوں۔",
    language: "Urdu",
    gender: "Female",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-zainab",
    name: "Zainab",
    vibe: "Formal Lahore accent — careful with names and honorifics.",
    language: "Urdu",
    gender: "Female",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-hina",
    name: "Hina",
    vibe: "پرسکون اور دھیمی رفتار، لمبی وضاحت کے لیے بہتر۔",
    language: "Urdu",
    gender: "Female",
    provider: "Cartesia",
    active: true,
  },
  {
    id: "v-sana",
    name: "Sana",
    vibe: "Brighter and quicker; suits short confirmations.",
    language: "Urdu",
    gender: "Female",
    provider: "Groq Orpheus",
    active: true,
  },
  {
    id: "v-mehwish",
    name: "Mehwish",
    vibe: "گرم جوش لہجہ، سخت اسکرپٹ کو نرم کر دیتا ہے۔",
    language: "Urdu",
    gender: "Female",
    provider: "OpenAI",
    active: true,
  },
  {
    id: "v-nadia",
    name: "Nadia",
    vibe: "Lower register, steady through difficult calls.",
    language: "Urdu",
    gender: "Female",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-urdu-f2",
    name: "Urdu Female 2",
    vibe: "Second Azure read — flatter, closer to an IVR prompt.",
    language: "Urdu",
    gender: "Female",
    provider: "Azure",
    active: true,
  },

  {
    id: "v-hamza",
    name: "Hamza",
    vibe: "رسمی اور بارعب آواز، تحصیل کی کالوں کے لیے۔",
    language: "Urdu",
    gender: "Male",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-usman",
    name: "Usman",
    vibe: "Even and unhurried; reads account numbers carefully.",
    language: "Urdu",
    gender: "Male",
    provider: "Cartesia",
    active: true,
  },
  {
    id: "v-faisal",
    name: "Faisal",
    vibe: "ہلکا اور تیز لہجہ، مختصر تصدیقی کالوں کے لیے۔",
    language: "Urdu",
    gender: "Male",
    provider: "Groq Orpheus",
    active: true,
  },
  {
    id: "v-imran",
    name: "Imran",
    vibe: "Deeper Islamabad accent, clear on weak connections.",
    language: "Urdu",
    gender: "Male",
    provider: "ElevenLabs",
    active: true,
  },
  {
    id: "v-adnan",
    name: "Adnan",
    vibe: "دوستانہ اور اطمینان بخش، سختی سے گریز کرتا ہے۔",
    language: "Urdu",
    gender: "Male",
    provider: "OpenAI",
    active: true,
  },
  {
    id: "v-kashif",
    name: "Kashif",
    vibe: "Brisk and businesslike — keeps a long script moving.",
    language: "Urdu",
    gender: "Male",
    provider: "Sarj Omni",
    active: true,
  },
  {
    id: "v-urdu-m1",
    name: "Urdu Male 1",
    vibe: "Flat IVR read. Predictable, never expressive.",
    language: "Urdu",
    gender: "Male",
    provider: "Azure",
    active: true,
  },
]

export const SCENARIOS: Scenario[] = [
  {
    id: "s-yelo-booking",
    name: "Yelo — Booking reminders",
    languages: ["Arabic", "English"],
  },
  {
    id: "s-yelo-pickup",
    name: "Yelo — Missed pickup follow-up",
    languages: ["Arabic"],
  },
  {
    id: "s-clinic",
    name: "Clinic appointment confirmations",
    languages: ["Arabic", "English", "Urdu"],
  },
  {
    id: "s-collections",
    name: "Late payment collections",
    languages: ["Arabic", "English"],
  },
  {
    id: "s-renewals",
    name: "Renewal outreach — Q3",
    languages: ["English"],
  },
  {
    id: "s-csat",
    name: "CSAT follow-up calls",
    languages: ["Arabic", "English", "Urdu"],
  },
  {
    id: "s-delivery",
    name: "Delivery ETA updates",
    languages: ["Arabic", "Urdu"],
  },
  {
    id: "s-onboarding",
    name: "Driver onboarding",
    languages: ["Urdu"],
  },
]

export const PERSONAS: Persona[] = [
  {
    id: "p-default-ar",
    name: "Default Arabic",
    language: "Arabic",
    gender: "Female",
    voiceId: "v-nourah",
    isDefault: true,
    prompt:
      "You are {{agent_name}}, a courteous Arabic-speaking assistant. Keep sentences short and confirm details back to the caller.",
    scenarioIds: ["s-csat"],
    createdAt: "Jan 12, 2026",
  },
  {
    id: "p-aisha",
    name: "Aisha — Yelo Support",
    language: "Arabic",
    gender: "Female",
    voiceId: "v-salma",
    isDefault: false,
    prompt:
      "You are {{agent_name}}, Yelo's booking assistant. Stay friendly, apologise once for delays, and always offer the next available slot.",
    scenarioIds: ["s-yelo-booking", "s-yelo-pickup"],
    createdAt: "Feb 3, 2026",
  },
  {
    id: "p-rania",
    name: "Rania — Collections",
    language: "Arabic",
    gender: "Female",
    voiceId: "v-arabic-f1",
    isDefault: false,
    prompt:
      "You are {{agent_name}}, calling about an overdue invoice. Be firm but respectful; never threaten, always offer a payment plan.",
    scenarioIds: ["s-collections"],
    createdAt: "Feb 19, 2026",
  },
  {
    id: "p-khalid",
    name: "Khalid — Delivery Updates",
    language: "Arabic",
    gender: "Male",
    voiceId: "v-ibrahim",
    isDefault: false,
    prompt:
      "You are {{agent_name}}, sharing a delivery window. Keep the call under a minute unless the customer asks to reschedule.",
    scenarioIds: ["s-delivery"],
    createdAt: "Mar 8, 2026",
  },
  {
    id: "p-zaid",
    name: "Zaid — Sales Outreach",
    language: "Arabic",
    gender: "Male",
    voiceId: "v-fares",
    isDefault: false,
    prompt:
      "You are {{agent_name}}, introducing the annual plan. Lead with the discount, and stop pitching after the second no.",
    scenarioIds: [],
    createdAt: "Jul 30, 2026",
  },
  {
    id: "p-default-en",
    name: "Default English",
    language: "English",
    gender: "Female",
    voiceId: "v-emma",
    isDefault: true,
    prompt:
      "You are {{agent_name}}, a helpful English-speaking assistant. Mirror the caller's pace and confirm every detail you capture.",
    scenarioIds: ["s-clinic"],
    createdAt: "Jan 12, 2026",
  },
  {
    id: "p-grace",
    name: "Grace — Onboarding Calls",
    language: "English",
    gender: "Female",
    voiceId: "v-emma",
    isDefault: false,
    prompt:
      "You are {{agent_name}}, walking a new customer through setup. One step at a time; check understanding before moving on.",
    scenarioIds: [],
    createdAt: "Apr 22, 2026",
  },
  {
    id: "p-adam",
    name: "Adam — Renewals",
    language: "English",
    gender: "Male",
    voiceId: "v-daniel",
    isDefault: false,
    prompt:
      "You are {{agent_name}}, calling ahead of contract renewal. Summarise current usage first, then present the renewal terms.",
    scenarioIds: ["s-renewals"],
    createdAt: "May 5, 2026",
  },
  {
    id: "p-marcus",
    name: "Marcus — Collections",
    language: "English",
    gender: "Male",
    voiceId: "v-english-m1",
    isDefault: false,
    prompt:
      "You are {{agent_name}}, following up on a missed payment. State the amount and due date early, and log every promise to pay.",
    scenarioIds: ["s-collections"],
    createdAt: "Mar 27, 2026",
  },
  {
    id: "p-default-ur",
    name: "Default Urdu",
    language: "Urdu",
    gender: "Female",
    voiceId: "v-urdu-f1",
    isDefault: true,
    prompt:
      "You are {{agent_name}}, a polite Urdu-speaking assistant. Use formal address throughout and repeat times in both formats.",
    scenarioIds: ["s-clinic"],
    createdAt: "Jan 20, 2026",
  },
  {
    id: "p-hira",
    name: "Hira — Payment Reminders",
    language: "Urdu",
    gender: "Female",
    voiceId: "v-urdu-f1",
    isDefault: false,
    prompt:
      "You are {{agent_name}}, reminding customers of an upcoming instalment. Keep amounts exact and offer the payment link by SMS.",
    scenarioIds: ["s-csat"],
    createdAt: "Jun 2, 2026",
  },
  {
    id: "p-bilal",
    name: "Bilal — Driver Onboarding",
    language: "Urdu",
    gender: "Male",
    voiceId: "v-bilal",
    isDefault: false,
    prompt:
      "You are {{agent_name}}, onboarding a new delivery driver. Confirm documents one by one and close with the training schedule.",
    scenarioIds: ["s-onboarding", "s-delivery"],
    createdAt: "Jun 14, 2026",
  },
]

export function voiceById(id: string): Voice | undefined {
  return VOICES.find((voice) => voice.id === id)
}

export function scenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id)
}
