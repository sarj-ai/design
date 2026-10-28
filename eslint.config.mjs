import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import sarj, { recommended as sarjRecommended } from "./eslint-rules/index.mjs"

// Files exempt from one rule since it was switched on. Fix a file and delete its line; never add one.
const LEGACY = {
  "sarj/copy-conventions": [
    "src/components/mockups/conversations-revamp/list/status-badges.tsx",
    "src/components/mockups/knowledge-base/knowledge-base-detail.tsx",
    "src/components/mockups/phone-numbers/call-activity-tab.tsx",
    "src/components/mockups/phone-numbers/outbound-tab.tsx",
  ],
  "sarj/destructive-variant": [
    "src/components/mockups/connected-apps/create-token-dialog.tsx",
  ],
  "sarj/dialog-shape": [
    "src/components/design-system/save-bar-preview.tsx",
    "src/components/mockups/call-flagging/flag-call-dialog.tsx",
    "src/components/mockups/configure-report/configure-report-dialog.tsx",
    "src/components/mockups/knowledge-base/source-table.tsx",
    "src/components/mockups/roles-permissions/save-changes-dialog.tsx",
  ],
  "sarj/footer-actions": [
    "src/components/mockups/behavioral-alerts/alert-form-dialog.tsx",
    "src/components/mockups/connected-apps/create-app-dialog.tsx",
    "src/components/mockups/connected-apps/create-token-dialog.tsx",
    "src/components/mockups/conversations-revamp/drawer/fourth-drawer.tsx",
    "src/components/mockups/developers/developers-page.tsx",
    "src/components/mockups/knowledge-base/new-knowledge-base-dialog.tsx",
    "src/components/mockups/listener-cues/listener-cues-drawer.tsx",
    "src/components/mockups/model-catalog/add-model-dialog.tsx",
    "src/components/mockups/personas-depth/scenario-assignment-dialog.tsx",
    "src/components/mockups/phrase-mappings/filler-words-drawer.tsx",
    "src/components/mockups/roles-permissions/create-role-dialog.tsx",
    "src/components/mockups/scenario-single-screen/setting-sheet.tsx",
    "src/components/mockups/scenario-single-screen/v2/setting-sheet.tsx",
  ],
  "sarj/form-labels": [
    "src/components/mockups/call-flagging/flag-call-dialog.tsx",
  ],
  "sarj/motion-reduce": [
    "src/components/mockups/model-catalog/catalog-page.tsx",
    "src/components/mockups/personas-depth/personas-index.tsx",
    "src/components/mockups/personas-depth/voice-library.tsx",
    "src/components/mockups/variable-mentions/mention-editor.tsx",
  ],
  "sarj/no-header-icon": [
    "src/components/mockups/connected-apps/token-table.tsx",
    "src/components/mockups/listener-cues/cue-row.tsx",
    "src/components/mockups/phrase-mappings/mapping-row.tsx",
  ],
  "sarj/no-scrollbar-style": [
    "src/components/mockups/behavioral-alerts/section-register.tsx",
    "src/components/mockups/behavioral-alerts/transcript-panel.tsx",
    "src/components/mockups/conversations-revamp/drawer/fourth-drawer.tsx",
    "src/components/mockups/conversations-revamp/drawer/section-register.tsx",
    "src/components/mockups/conversations-revamp/drawer/transcript-views.tsx",
  ],
  "sarj/sentence-case": [
    "src/app/(mockups)/behavioral-alerts/page.tsx",
    "src/app/(mockups)/configure-report/page.tsx",
    "src/components/mockups/behavioral-alerts/transcript-panel.tsx",
    "src/components/mockups/configure-report/configure-report-dialog.tsx",
    "src/components/mockups/conversations-revamp/drawer/fourth-drawer.tsx",
    "src/components/mockups/conversations-revamp/drawer/transcript-views.tsx",
    "src/components/mockups/conversations-revamp/list/search-filters.tsx",
    "src/components/mockups/conversations-revamp/list/status-filter.tsx",
    "src/components/mockups/eou-timing/global-turn-detection.tsx",
    "src/components/mockups/eou-timing/persona-turn-timing.tsx",
    "src/components/mockups/transfer-routing/transfer-tool-drawer.tsx",
    "src/components/shell/app-shell.tsx",
  ],
  "sarj/surface-width": [
    "src/components/design-system/save-bar-preview.tsx",
    "src/components/mockups/add-voice/add-voice-dialog.tsx",
    "src/components/mockups/behavioral-alerts/alert-form-dialog.tsx",
    "src/components/mockups/behavioral-alerts/call-drawer.tsx",
    "src/components/mockups/call-flagging/flag-call-dialog.tsx",
    "src/components/mockups/configure-report/configure-report-dialog.tsx",
    "src/components/mockups/connected-apps/create-token-dialog.tsx",
    "src/components/mockups/conversations-revamp/drawer/fourth-drawer.tsx",
    "src/components/mockups/knowledge-base/add-sources.tsx",
    "src/components/mockups/knowledge-base/new-knowledge-base-dialog.tsx",
    "src/components/mockups/knowledge-base/source-table.tsx",
    "src/components/mockups/listener-cues/listener-cues-drawer.tsx",
    "src/components/mockups/model-catalog/add-model-dialog.tsx",
    "src/components/mockups/persona-pronunciation/edit-persona-dialog.tsx",
    "src/components/mockups/personas-depth/persona-dialog.tsx",
    "src/components/mockups/personas-depth/persona-wizard.tsx",
    "src/components/mockups/personas-depth/scenario-assignment-dialog.tsx",
    "src/components/mockups/phrase-mappings/filler-words-drawer.tsx",
    "src/components/mockups/roles-permissions/create-role-dialog.tsx",
    "src/components/mockups/roles-permissions/save-changes-dialog.tsx",
    "src/components/mockups/scenario-single-screen/setting-sheet.tsx",
    "src/components/mockups/scenario-single-screen/v2/raw-prompt-drawer.tsx",
    "src/components/mockups/scenario-single-screen/v2/setting-sheet.tsx",
    "src/components/mockups/transfer-routing/transfer-tool-drawer.tsx",
  ],
  "sarj/table-shape": ["src/components/design-system/reference-table.tsx"],
  "sarj/type-scale": ["src/app/(mockups)/behavioral-alerts/page.tsx"],
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Replaces eslint-config-next's default ignores, so those are re-listed here.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The bundled server handler is one 10MB line; linting it exhausts the heap.
    ".open-next/**",
    ".wrangler/**",
  ]),

  {
    name: "sarj/design-system",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { sarj },
    rules: sarjRecommended,
  },

  // Reels: a 1920x1080 canvas with its own type ladder; Kicker and Brandmark are the sanctioned uppercase.
  {
    name: "sarj/reels",
    files: ["src/components/reels/**"],
    rules: { "sarj/type-scale": "off" },
  },
  {
    name: "sarj/reels-kicker",
    files: ["src/components/reels/type.tsx"],
    rules: { "sarj/sentence-case": "off" },
  },

  ...Object.entries(LEGACY).map(([rule, files]) => ({
    name: `sarj/legacy/${rule.replace("sarj/", "")}`,
    files,
    rules: { [rule]: "off" },
  })),

  // Generated by `npx shadcn add`, which overwrites these wholesale. set-state-in-effect (use-mobile) and
  // refs (stepper hands its ref to Base UI's useRender) are upstream's to fix.
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
