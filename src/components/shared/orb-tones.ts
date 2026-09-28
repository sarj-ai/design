/**
 * The orb's tones, kept out of orb-avatar.tsx because that file is a client
 * module, and a server page importing a plain value from one gets a reference
 * instead of the array.
 *
 * Violet has three stops of its own in globals.css, matched to the
 * reference. Every other tone is one token: its body and light are that
 * colour mixed toward white, so a tone is a single decision. Written as
 * classes rather than variable names because Tailwind only emits a colour
 * variable something uses, and these class strings make it emit them.
 */
export const TONES = {
  violet: ["bg-orb-deep", "bg-orb-body", "bg-orb-light"],
  brand: ["bg-primary"],
  blue: ["bg-chart-2"],
  teal: ["bg-chart-3"],
  amber: ["bg-chart-4"],
  rose: ["bg-chart-5"],
} as const

export type OrbTone = keyof typeof TONES
export const ORB_TONES = Object.keys(TONES) as OrbTone[]
