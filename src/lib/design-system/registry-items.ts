/*
 * What the design system publishes to the shadcn registry. `/r/*` is the one path on design.sarj.ai
 * that Cloudflare Access lets through, so the registry is how the system reaches anyone who cannot
 * sign in: the markdown as one item, and every Components topic's demo as an item of its own.
 * scripts/build-registry.mjs reads this file; the markdown links each component to its item.
 */

import { INSTALL_COMMANDS, registryUrl } from "@/lib/site/registry";

/** The whole-system markdown, installed as a Claude skill. */
export const DESIGN_SYSTEM_ITEM = "design-system";

/** Where `shadcn add` writes the markdown in the consumer — `~/` is the package root it runs in. */
export const DESIGN_SYSTEM_TARGET =
  "~/.claude/skills/sarj-design-system/SKILL.md";

/** Components topic id → the file under src/ that renders its demo on the topic page. */
export const COMPONENT_ENTRIES: Record<string, string> = {
  colour: "components/design-system/colour-table.tsx",
  index: "components/design-system/index-page-demo.tsx",
  surfaces: "components/design-system/surface-decision-preview.tsx",
  "drawer-anatomy": "components/design-system/drawer-anatomy-preview.tsx",
  "integration-card": "components/design-system/integration-card-preview.tsx",
  "section-card": "components/design-system/section-card-preview.tsx",
  "creation-flow": "components/design-system/creation-flow-preview.tsx",
  "json-view": "components/design-system/json-view-preview.tsx",
  alert: "components/design-system/alert-preview.tsx",
  "unsaved-changes": "components/design-system/save-bar-preview.tsx",
  developers: "components/mockups/developers/developers-page.tsx",
  "admin-view": "components/design-system/admin-view-preview.tsx",
  notifications: "components/design-system/notifications-preview.tsx",
  "orb-avatar": "components/shared/orb-avatar.tsx",
  recording: "components/design-system/recording-preview.tsx",
  "agent-states": "components/design-system/agent-state-preview.tsx",
};

/** `ds-` keeps a component's item from colliding with a mockup slug of the same name. */
export function componentItem(topicId: string): string {
  return `ds-${topicId}`;
}

/** The platform is a Yarn workspace, so the yarn command — with its `--cwd` — is the one to hand out. */
export function installCommand(item: string): string {
  return INSTALL_COMMANDS[0].command(registryUrl(item));
}
