/**
 * DES-207 — global vs organization voices.
 *
 * Naming convention the mockup demonstrates:
 * - A voice's name is one given name, spelled one way, unique across the
 *   library. No spelling variants side by side (Khalid / Khaled), no version
 *   words ("new Sarah"), no provider or use case in the name.
 * - The provider is the description under the name.
 * - At most four Sarj voices per language and gender. Nour is not one of them.
 */

export type Owner = "org" | "sarj";
export type Gender = "Female" | "Male";
export type Language = "Arabic" | "English" | "Urdu";

export const LANGUAGES: Language[] = ["Arabic", "English", "Urdu"];
export const GENDERS: Gender[] = ["Male", "Female"];
export const LANGUAGE_CODES: Record<Language, string> = {
  Arabic: "AR",
  English: "EN",
  Urdu: "UR",
};

export type Voice = {
  id: string;
  name: string;
  provider: string;
  owner: Owner;
  language: Language;
  gender: Gender;
};

const v = (
  id: string,
  provider: string,
  owner: Owner,
  language: Language,
  gender: Gender,
): Voice => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  provider,
  owner,
  language,
  gender,
});

export const VOICES: Voice[] = [
  // The organization's own — cloned under DES-198.
  v("saad", "Sarj TTS", "org", "Arabic", "Male"),
  v("maha", "Sarj TTS", "org", "Arabic", "Female"),
  v("hessa", "ElevenLabs", "org", "Arabic", "Female"),
  v("grace", "ElevenLabs", "org", "English", "Female"),
  v("adam", "ElevenLabs", "org", "English", "Male"),

  v("khalid", "ElevenLabs", "sarj", "Arabic", "Male"),
  v("fares", "Azure", "sarj", "Arabic", "Male"),
  v("ibrahim", "Sarj TTS", "sarj", "Arabic", "Male"),
  v("waleed", "Cartesia", "sarj", "Arabic", "Male"),

  v("sara", "ElevenLabs", "sarj", "Arabic", "Female"),
  v("reem", "Azure", "sarj", "Arabic", "Female"),
  v("huda", "Sarj TTS", "sarj", "Arabic", "Female"),
  v("lina", "Cartesia", "sarj", "Arabic", "Female"),

  v("emma", "ElevenLabs", "sarj", "English", "Female"),
  v("olivia", "Azure", "sarj", "English", "Female"),
  v("james", "ElevenLabs", "sarj", "English", "Male"),
  v("ronald", "Azure", "sarj", "English", "Male"),

  v("ayesha", "Azure", "sarj", "Urdu", "Female"),
  v("asad", "Azure", "sarj", "Urdu", "Male"),
];

export type Persona = {
  id: string;
  name: string;
  language: Language;
  gender: Gender;
  voiceId: string;
  isDefault: boolean;
  createdAt: string;
  prompt: string;
};

const p = (
  id: string,
  name: string,
  language: Language,
  gender: Gender,
  voiceId: string,
  createdAt: string,
  isDefault = false,
): Persona => ({
  id,
  name,
  language,
  gender,
  voiceId,
  isDefault,
  createdAt,
  prompt: "",
});

/** فاطمة and نورة share Sara — the duplicate the Voice column now shows. */
export const PERSONAS: Persona[] = [
  p("p1", "فاطمة", "Arabic", "Female", "sara", "Aug 30, 2026"),
  p("p2", "نورة", "Arabic", "Female", "sara", "Aug 27, 2026"),
  p("p3", "Emma", "English", "Female", "emma", "Aug 27, 2026"),
  p("p4", "فارس", "Arabic", "Male", "saad", "Aug 24, 2026"),
  p("p5", "راشد", "Arabic", "Male", "waleed", "Aug 19, 2026"),
  p("p6", "فهد", "Arabic", "Male", "khalid", "Apr 7, 2026"),
  p("p7", "عبدالله", "Arabic", "Male", "ibrahim", "Apr 7, 2026", true),
  p("p8", "Sarj Buddy", "English", "Female", "emma", "May 13, 2026", true),
  p("p9", "Ronald", "English", "Male", "ronald", "Mar 10, 2026"),
  p("p10", "Uzma", "Urdu", "Female", "ayesha", "Jan 14, 2026", true),
].map((persona) =>
  persona.id === "p6"
    ? {
        ...persona,
        prompt:
          "You are Fahad, a calm receptionist who keeps answers short and confirms each booking.",
      }
    : persona,
);

/** The persona whose dialog opens with the page. */
export const EDITING_ID = "p6";

export const voiceById = (id: string) =>
  VOICES.find((voice) => voice.id === id);
