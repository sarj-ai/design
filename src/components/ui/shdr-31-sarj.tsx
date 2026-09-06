import { ShaderOrb, type OrbVariant } from "@/components/ui/orbkit-core"
import { shdr31Orb, type Shdr31Props } from "@/components/ui/shdr-31"

/**
 * SHDR-31 in the brand purple.
 *
 * The installed orb is colourless — `colors: []`, and its shader writes the
 * raw accumulated light, which is white. Tinting it is therefore a change to
 * the shader itself, and this file makes that change without touching
 * `shdr-31.tsx`: that file is what `shadcn add zzzzshawn/orbkit/shdr-31`
 * rewrites, so an edit there is one reinstall away from disappearing with no
 * error to notice.
 *
 * The hex lives here rather than in a screen because a WebGL uniform cannot
 * read a token class — the same reason FluidOrb keeps its own. Keep it in step
 * with `--primary` in globals.css.
 */
const PRIMARY = "#392868"

/**
 * The shader's last line, and the only one that has to change.
 *
 * Its output is premultiplied emitted light: rgb is what the orb *adds* to the
 * page, alpha is only how much of the page it hides. That rules out every
 * blend which lifts black — `mix(tint, glow, col)` would leave rgb high where
 * alpha is zero and haze the whole canvas purple. A multiply is the one
 * operation that keeps an unlit pixel unlit, so it changes the hue and nothing
 * else about the shape.
 *
 * The tint is normalised to its brightest channel first, because light cannot
 * be dark. Multiplying by `--primary` raw (0.22, 0.16, 0.41) scales every
 * channel down, so the shell dimmed toward the page and only the hottest
 * pixels held any colour at all — a white orb with purple caves. Dividing by
 * the max channel keeps the ratio between channels, which is the hue, and
 * throws away the darkness, which belongs to a surface and not to a glow.
 */
const OUTPUT = "gl_FragColor = vec4(col, a);"
const TINTED_OUTPUT = `vec3 brandHue = uC_tint / max(max(uC_tint.r, max(uC_tint.g, uC_tint.b)), 0.0001);
  gl_FragColor = vec4(col * brandHue, a);`

const hasHook = shdr31Orb.frag.includes(OUTPUT)

if (!hasHook && process.env.NODE_ENV !== "production") {
  /* Fails loudly rather than quietly rendering white. If a reinstall brings a
     shader whose output line has been rewritten, this is the one thing that
     says so — the orb would otherwise just look wrong. */
  console.warn(
    "[shdr-31-sarj] The shader's output line has changed upstream, so the brand tint could not be applied. Re-check the replacement in shdr-31-sarj.tsx.",
  )
}

/* A key of its own: the runtime caches a compiled program per variant, and two
   variants sharing a key would share a program that only one of them wants. */
const sarjShdr31Orb: OrbVariant = {
  ...shdr31Orb,
  key: `${shdr31Orb.key}-sarj`,
  frag: hasHook ? shdr31Orb.frag.replace(OUTPUT, TINTED_OUTPUT) : shdr31Orb.frag,
  colors: hasHook ? [{ key: "tint", label: "Tint", default: PRIMARY }] : [],
}

export function SarjShdr31({ size = 280, ...rest }: Shdr31Props) {
  return <ShaderOrb variant={sarjShdr31Orb} size={size} {...rest} />
}
