import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import sarj, { recommended as sarjRecommended } from "./eslint-rules/index.mjs"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare build output. The bundled server handler is a single 10MB
    // line, and linting it exhausts the heap before it fails.
    ".open-next/**",
    ".wrangler/**",
  ]),

  /**
   * The design system, enforced. Full rule reference and the reasoning behind
   * each one: .claude/skills/sarj-lint/SKILL.md
   */
  {
    name: "sarj/design-system",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { sarj },
    rules: sarjRecommended,
  },

  /**
   * src/components/ui and src/hooks are generated. `npx shadcn@latest add
   * <name>` overwrites these files wholesale — lucide imports, z-50, shadow-md
   * and all — so policing them would mean re-patching the primitives after
   * every add, for no visual gain. The primitives ARE the design system; these
   * rules exist to stop authored code from drifting away from them.
   *
   * `react-hooks/set-state-in-effect` is off here for the same reason: carousel
   * and use-mobile both trip it, both are regenerated, and both are upstream's
   * problem to fix. Authored code is still held to it.
   *
   * `react-hooks/refs` joins it for stepper, which hands its own ref to Base
   * UI's `useRender` — the documented way to use that hook, and not something
   * this repo can fix without forking the primitive.
   */
  {
    name: "sarj/generated-primitives",
    files: ["src/components/ui/**", "src/hooks/**"],
    rules: {
      ...Object.fromEntries(
        Object.keys(sarjRecommended).map((rule) => [rule, "off"]),
      ),
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
])

export default eslintConfig
