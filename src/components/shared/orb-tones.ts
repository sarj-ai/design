/** Kept out of orb-avatar.tsx: a server page importing a value from a client module gets a reference, not the array. Written as classes so Tailwind emits the colour variables. */
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
