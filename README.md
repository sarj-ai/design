# Design lab

A workspace for building design mockups that look like they shipped from the
Sarj app. Every screen here is real React built from the same shadcn primitives
and brand tokens the product uses, so a reviewer can click it and poke at it —
instead of guessing from a static image.

One request is one mockup: one route, one card on the index at `/`. Alternate
views of the same design go in tabs inside that page, never as sibling routes.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Adding a mockup

```bash
npm run new -- call-recording --title "Call recording consent" \
  --meta "Dialog · in progress" --icon Mic01Icon --tickets DES-201
```

That writes `src/app/(mockups)/call-recording/page.tsx` and adds the card to
the index. It creates nothing else on purpose — components go in
`src/components/mockups/<slug>/` and mock data in
`src/lib/mockups/<slug>-data.ts` when the ticket actually needs them.

Then read `.claude/skills/sarj-mockup/SKILL.md` before writing the screen. It
has the primitive inventory, the page skeleton, the layout rhythm, and the
reject list.

## Checking one

```bash
npm run lint       # the design system, enforced
npm run typecheck
npm run shots      # every route
```

`npm run shots` writes `screenshots/<route>.png`. Narrow it while you work:

```bash
npm run shots -- --routes /call-recording
```

It captures each route as it loads — it does not click into dialogs or
drawers. A mockup whose subject is an overlay should open it on mount.

## Installing one into the product

Every mockup is also a shadcn registry item. The product is `sarj-ai/platform`,
a Yarn 4 workspace monorepo (default branch `dev`) whose frontend package
`products/platform/apps/web` (`@sarj/platform-web`) holds the repo's only
`components.json` — so the command runs from the platform root and points
shadcn at that package:

```bash
yarn dlx shadcn@latest add https://design.sarj.ai/r/<slug>.json --cwd products/platform/apps/web
```

The `</>` menu on each index card carries this line, and the MCP server at
`/api/mcp` hands an agent the unattended form (`yes n | … --yes`) with a brief
of what to expect. Expect four things: the platform's primitives are Base UI
(`render`) and this repo's are Radix (`asChild`), so each `asChild` needs
converting; tokens arrive light-only, with nothing for `.dark` or the tasama
whitelabel; a route item lands a live `src/app/<slug>/page.tsx` that nests this
repo's shell inside the real product sidebar; and only the `yes n` guard keeps
the platform's `src/lib/utils.ts` from being replaced by shadcn's stock one.
`AGENTS.md` has the full account.

## The rules

`AGENTS.md` is the full brief and loads into every agent session. The short
version:

- **Build the ticket, nothing else.** The ticket, the PRD, and attached
  screenshots are the entire spec. No invented fields, tabs, screens, or
  "out of scope" sections.
- **Components come from `src/components/ui/` only.** All 61 shadcn primitives
  are installed. Never hand-roll a `<div>` that duplicates one.
- **Colors come from the tokens in `src/app/globals.css` only.** No hex, no
  `oklch()`, no `bg-purple-600`. Literals dodge the token system entirely.
- **Icons are HugeIcons.** `lucide-react` is legal only inside
  `src/components/ui/`, which shadcn regenerates.
- **Mockups are flat, motion is tokenised and capped at 300ms, and every
  animation carries `motion-reduce:`.**

Ten of these are real ESLint rules under `sarj/*`, not guidance —
`.claude/skills/sarj-lint/SKILL.md` explains what each one bans and what to
write instead.

`npm run lint` reports zero problems, and it is worth keeping it there: the
moment a warning is normal, new ones stop being visible. The only exemption in
`eslint.config.mjs` is `src/components/ui` and `src/hooks`, which
`npx shadcn add` regenerates wholesale.

## Layout

```
src/app/(mockups)/<slug>/page.tsx   one route per mockup
src/components/mockups/<slug>/      that mockup's components
src/components/ui/                  shadcn primitives — generated, do not edit
src/components/shell/               the chrome screens sit in
src/components/shared/              building blocks more than one area uses
src/lib/mockups/<slug>-data.ts      mock data
src/lib/site/mockups-data.ts        the index registry
src/app/globals.css                 every token: colour, z-layers
eslint-rules/                       the sarj/* plugin
scripts/                            new-mockup.mjs, screenshots.mjs
.claude/skills/                     every skill — sarj-mockup, sarj-lint, sarj-brand…
docs/                               audits and handoff notes
```

The workspace is light and left-to-right. There is no theme switch and no
direction switch — the product ships one look, and a second palette nobody
opens is a second set of colours to keep correct for no reader.

Responsive is deliberately unenforced — these mockups are desktop-first.
