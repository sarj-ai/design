<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Design lab — the whole brief

This is the only file you have to read to work here. It loads into every session
(`CLAUDE.md` is a one-line import of it). Everything else is deep reference, and
the [Skills](#skills--what-each-one-is-for) section says exactly when to open which.

**What this repo is.** A workspace for design mockups that look like they shipped
from the Sarj app. Every screen is real React built from the same shadcn
primitives and brand tokens the product uses, so a reviewer can click it and
poke at it — instead of guessing from a static image.

---

## Scope — build the ticket, nothing else

The ticket and the PRD are the spec. Screenshots the user attaches are the spec. **Nothing else is.**

1. **Never invent a field, section, screen, setting, tab, or route that the ticket does not ask for.** Not to "show the full surface", not to "make it feel real", not as a placeholder. If it isn't in the ticket, the PRD, or a screenshot, it does not get built.
2. **One request = one mockup = one route = one card on the landing index.** Alternate views of the same design go in tabs inside that page, never as sibling routes. Every existing mockup stays listed.
3. **Supporting material is not a deliverable.** Design-rationale pages, state galleries, handoff docs, annotation grids — none of these get built unless asked for. Put the reasoning in your reply instead.
4. **A section labelled "out of scope" is a section that should not exist.** If you catch yourself writing that label, delete the section.
5. **Don't scaffold context around the deliverable.** If the ticket is about a dialog, ship the dialog and a button that opens it — not a fake list page for it to sit on top of.
6. **When the ticket is silent on something you think is needed, ask — don't build it and explain later.** One short question beats a screen the user has to ask you to delete.
7. **When asked to remove something, remove it.** Do not relocate it, hide it behind a tab, or keep it "because the DoD mentions it". The user's instruction outranks your reading of the DoD.
8. **State your additions.** If anything in a deliverable is not traceable to the ticket, PRD, or a screenshot, list it plainly at the end of your reply so the user can cut it.

---

## Commands

| Command | What it does |
|---|---|
| `npm run new -- <slug>` | Scaffolds a mockup: writes the route, registers the card. Nothing else. |
| `npm run dev` | http://localhost:3000 |
| `npm run lint` | The design system, enforced. **Must report zero problems.** |
| `npm run lint:fix` | The same, with the auto-fixable ones applied |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier (skips generated and markdown files) |
| `npm run shots` | Screenshots every route → `screenshots/` |
| `npm run registry` | Regenerates `registry.json` + `public/r/*.json` from the import graph |
| `npm run thumbs` | Regenerates the index card previews → `public/thumbs/*.webp`. **A new mockup's card is blank until this runs.** |
| `npm run build` | Production build |

`npm run new` takes `--title`, `--description`, `--meta`, `--icon`, `--tickets`, `--eyebrow`.
`npm run shots` takes `--routes /a,/b`, `--skip-build`. `npm run thumbs:check` reports
stale thumbnails without rewriting them — nothing runs it for you.

---

## Where everything lives

```
src/app/<slug>/page.tsx        one route per mockup
src/components/<slug>/         that mockup's components
src/components/<slug>/icons.tsx  its icons, named for what they do here
src/lib/<slug>-data.ts         its mock data
src/components/ui/             61 shadcn primitives — GENERATED, do not edit
src/components/icon.tsx        the icon() factory every icons.tsx is built on
src/components/mockup-shell.tsx  the chrome every mockup page wraps itself in
src/lib/mockups-data.ts        the landing index registry
src/app/design-system/[[...slug]]/page.tsx  the written system, one URL per topic
src/lib/design-system-data.ts  its content — the rail tree and every rule
src/lib/design-system-nav.ts   slug <-> topic, and generateStaticParams
src/app/globals.css            every token: colour, z-layers, motion
src/app/page.tsx               the index — renders the registry, nothing else
eslint-rules/                  the sarj/* plugin, one file per rule
scripts/                       new-mockup.mjs, screenshots.mjs
.claude/skills/                the deep reference — see below
PRD/                           local PRD snapshots — gitignored, see PRD/README.md
```

**The design system is addressable.** `/design-system` is the overview,
`/design-system/<section>` a section index, and `/design-system/<section>/<topic>`
one topic — every one of them prerendered, so any topic can be sent to someone
on its own. The tree lives in `DOCS_SECTIONS`; add a page there and give its id
a view in the route file, and the URL, the rail entry and the static path all
follow. A topic with no view falls back to its section's index.

**PRDs live on `wiki.sarj.ai`, behind a Google sign-in nothing here can read.**
That makes the review checklist's "matches the PRD exactly" gate unrunnable
unless someone pastes the document in. `PRD/` is the stopgap: one markdown
snapshot per PRD, gitignored, deleted once PRDs move onto Linear. Check it before
concluding a PRD is unavailable, and add a snapshot whenever one is pasted into a
session — otherwise the next reviewer re-does the same archaeology.

**Mockups are committed like everything else.** All four paths a mockup occupies
— its route, its component folder, its data file, and its entry in
`src/lib/mockups-data.ts` — are tracked and pushed. Only build output, review
screenshots, and env files stay out of git.

A mockup carries the ticket it answers and real customer names in its mock data,
so treat the remote accordingly: keep it private, and don't put anything in mock
data you wouldn't want on it.

Anything genuinely shared lives at the root of its folder — `src/components/ui`,
`mockup-shell.tsx`, `src/lib/utils.ts`.

---

## Building a mockup, start to finish

1. **Read the ticket.** The scope rules above are the whole contract.
2. **Look at how it is already solved** — Mobbin if connected, `ui-ux-pro-max` for UX patterns. See [Reference sources](#reference-sources).
3. **`npm run new -- <slug>`** — the route and the index card, wired to the shell.
4. **Load `sarj-mockup`** before writing the screen. It has the primitive inventory, the page skeleton, the layout rhythm, and the reject list.
5. **Build it.** Primitives from `src/components/ui`, colours from `globals.css`, and nothing the ticket did not ask for. Keep `sarj-no-slop` open while writing copy — sentence case, a label instead of a paragraph, no decoration that does no work.
6. **Verify:** `npm run lint && npm run typecheck`, then `npm run shots -- --routes /<slug>` and actually look at it.
7. **Self-review with `ui-review`** before the ticket moves to In Review. Fix or explicitly waive each finding in the ticket.
8. **Reply with what you added** that the ticket did not name, and what you referenced.

---

## The ten rules — enforced, not advisory

`npm run lint` runs a local ESLint plugin. These are real errors everywhere
outside `src/components/ui` and `src/hooks`, which `npx shadcn add` regenerates
wholesale. **Zero warnings is the standing state** — the moment one warning is
normal, new ones stop being visible.

| Rule | Banned | Write instead |
|---|---|---|
| `no-raw-color` | `#hex`, `oklch()`, `rgb()`, `bg-purple-600`, `text-gray-500`, colour in `style` | the semantic token |
| `no-arbitrary-scale` | `gap-[13px]`, `rounded-[10px]`, `text-[0.625rem]`, anything under `text-xs` | the scale — `gap-4`, `rounded-lg`, `text-xs` |
| `no-shadow` | `shadow-md`, `hover:shadow-lg`, `drop-shadow-*` | `<Card>`'s ring, a `bg-muted` inset, or an overlay primitive |
| `z-index-tokens` | `z-50`, `z-[9999]` | `z-base` `z-raised` `z-sticky` `z-nav` `z-overlay` `z-modal` `z-popover` `z-toast` `z-tooltip` |
| `use-ui-primitives` | raw `<button>` `<input>` `<select>` `<table>`; a `<div>` with radius **and** edge **and** padding | the primitive; a raw element is fine as an `asChild` child |
| `no-primitive-override` | `<Button className="h-10 px-4 rounded-md">`, `py-0` on a Card | a `size` or a `variant` — margins and layout classes are always legal |
| `icon-source` | `lucide-react` outside `src/components/ui` | HugeIcons via the mockup's `icons.tsx` |
| `motion-tokens` | `duration-500`, `ease-out`, raw cubic-bezier | `duration-150` press · `200` popover · `200–300` dialog; `ease-out-cubic` / `ease-in-out-cubic` |
| `motion-reduce` | any `transition-*` or `animate-*` on its own | pair it with `motion-reduce:transition-none` / `motion-reduce:animate-none` |
| `no-layout-animation` | `transition-all`, `transition-[width]`, `transition-[height]` | animate transform and opacity only |

**Colour tokens — there are no others.** Surfaces `background` `card` `popover`
`muted` `secondary` `accent` `sidebar` · Text `foreground` `muted-foreground`
plus every surface's `-foreground` · Brand `primary` `primary-tint`
`primary-highlight` `primary-light` `primary-dark` · Intent `destructive`
`warning` `success` · Lines `border` `input` `ring` · Charts `chart-1`…`chart-6`,
one purple ramp, never a rainbow. Always pair a surface with its own foreground.

Nunito is global — never declare a font family. Responsive is deliberately
unenforced; these mockups are desktop-first.

**Icons.** Each mockup owns `src/components/<slug>/icons.tsx`, built on the
`icon()` factory in `src/components/icon.tsx`, naming each glyph for what it does
on that screen — `<DisconnectIcon />`, not `<Unplug />`. Never emoji, never a
second icon set.

**Adding to the scale.** If a value genuinely is not on the scale, add a token to
`globals.css` and use it — do not inline an arbitrary value. `--text-status-code`
(the ghost numeral on the 404 page) is the worked example.

---

## House patterns — decided once, applied everywhere

Lint cannot see these. They are the answers to questions that came up in review
and should not be re-decided per mockup.

**A drawer header is a title, a description and a Close button. No icon tile.**
The platform does not put one there, and a glyph beside a title the title
already names is decoration. The shape is fixed:

```tsx
<DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
  <div className="flex flex-col gap-0.5">
    <DrawerTitle>…</DrawerTitle>
    <DrawerDescription>…</DrawerDescription>
  </div>
  <DrawerClose asChild>
    <Button aria-label="Close" size="icon-sm" variant="ghost"><CloseIcon /></Button>
  </DrawerClose>
</DrawerHeader>
```

An icon *does* belong in `ItemMedia variant="icon"` on a settings row — there it
distinguishes one row from the next in a list. A drawer has no list to be
distinguished within.

**One explanation language per screen.** A field either carries an inline
description or an `(i)` tooltip — never both on one screen. **Default to the
inline description** (`FieldDescription` under the label, above the control).
Note that `ui-review` records the opposite house rule from Aug 2026; the
inline-description direction is the later call, from review on DES phrase
mappings. Whichever a screen uses, it uses for every field on it.

**One read-only language per screen: grey it out.** When a scope is inheriting
and nothing is editable, keep every control on screen and disable it — switches
and the Save/Done button included, so the reader can still see what is on. Do
not mix "greyed", "swapped for a plain value" and "removed" in one panel.

**Do not caption the greyed state.** No banner, no explainer section, and no
description that swaps text when a switch flips. The control that turns editing
on is on the same screen, and a panel of dead controls under it says the rest.
A line that appears only in one state is a section the reader has to re-read
every visit.

**A control that has nothing to act on is not disabled, it is absent.** The
frequency slider goes when the last filler word is deleted; it returns with the
first one. A live control over an empty list reads as a bug.

---

## One mode, and why

The workspace is **light and left-to-right**. There is no theme switch and no
direction switch — the product ships one look, and a second palette nobody
opens is a second set of colours to keep correct for no reader.

The colour rule is still absolute, because a literal is a literal: it dodges the
token system, so it never picks up a brand change or a whitelabel. Keep using
logical properties (`ms-`, `pe-`, `text-start`) too — they cost nothing and they
are what makes an Arabic mirror possible if it is ever wanted back.

---

## Reference sources

**Mobbin MCP — production UX reference.** If Mobbin tools are available in this
session (any tool whose name contains `mobbin` — it is not always connected),
search it before designing any pattern shipped products have already solved:
onboarding, empty states, filtering, bulk selection, search, permissions,
settings, notifications, pagination, multi-step forms, destructive confirmations.

Take **layout, hierarchy, the interaction sequence, and which states exist**
(empty, loading, partial, error, success, over-limit). That last one is where
mockups usually fall short — production apps handle cases you would not think to
draw.

Never take: **features** (the ticket is still the entire spec — reference informs
*how*, never *what*) or **visual style** (Mobbin shows you Linear, Stripe, Notion;
their colours, type, radius, spacing, and shadows must not leak in. Structure
travels, styling does not).

**Say what you referenced** in your reply — which apps, what you took, one line.
If Mobbin is not connected, say so once and design from the rules here. Never
fabricate what a reference app does.

---

## Skills — what each one is for

Seven skills are installed at `.claude/skills/`. Load them with the Skill tool
(or read the `SKILL.md`). They are deep reference, deliberately not inlined here
— this file is what you need to act; they are what you need to get a specific
thing exactly right.

| Skill | What is in it | Load it when |
|---|---|---|
| **`sarj-mockup`** | The build procedure: the three laws, the full primitive inventory mapped to what you need, the page skeleton, layout rhythm, visual hierarchy, the reject list, a self-check | **Before writing any page, screen, or component in this repo.** The default first move for any build request. |
| **`sarj-no-slop`** | The tells lint cannot see: ALL CAPS and Title Case, paragraphs where a label belongs, a heading over every block, launch-page copy, token-coloured gradients and glass, an icon per line, pills on everything, motion that answers nothing, over-designed empty states, the default dashboard | **While writing any copy or screen**, alongside `sarj-mockup`, and as a pass before a ticket moves to In Review. It lists what the lint rules already kill, so it never re-litigates those. |
| **`sarj-lint`** | The ten rules above, rule by rule: what each bans, the reasoning, and exactly what to write instead — plus escape hatches and how to name a token | Before writing a className, and any time `npm run lint` reports a `sarj/*` error you are not sure how to resolve |
| **`sarj-brand`** | The brand itself: every colour as OKLCH + hex across light and dark (it also documents a dark palette and the tasama whitelabel, neither of which this workspace renders), the Nunito type system, spacing/radius/motion scales, the chart ramp, component recipes, a copy-paste starter | Producing something Sarj-branded **outside this app** — slides, standalone HTML, an artifact, a diagram, a marketing page. Inside the app you want tokens, not values, so reach for `sarj-mockup` instead. |
| **`ui-ux-pro-max`** | A searchable database: `ux-guidelines.csv`, `products.csv`, `ui-reasoning.csv`, `charts.csv`, `app-interface.csv` | Choosing a pattern for a product type, picking a chart, or reasoning about an interaction. **Ignore its `colors.csv`, `google-fonts.csv`, `typography.csv`, `styles.csv`** — generic palettes and font pairings that contradict the tokens and Nunito, and lint will reject them. Take the reasoning, not the values. |
| **`web-animation-design`** | Easing blueprints, duration guidance, springs, performance, accessibility, and this repo's motion house rules | Adding or reviewing motion beyond the tokenised defaults. The rules above cover the common cases; this covers the judgement calls. |
| **`ui-review`** | The Sarj Design Approval Checklist as hard gates, plus the review rules mined from real DES rounds (the helper-text principle, the no-flags ban, state coverage, PRD conformance) and a full UI/UX lens pass | **Before moving a design ticket to In Review.** Self-review the live route, then fix or explicitly waive every finding in the ticket. Also for reviewing any screenshot or mockup on request. |

---

## Before you finish

- `npm run lint` — zero problems, not "only warnings"
- `npm run typecheck`
- `npm run shots -- --routes /<slug>` and look at it
- `npm run registry` if you added, renamed or deleted a mockup, or changed what one imports
- `npm run thumbs` if you added a mockup or changed how an existing one looks — the
  index card renders blank without it
- `sarj-no-slop` self-check — no `uppercase`, no explainer under every setting, delete 30% and see if it reads clearer
- `ui-review` on the route if the ticket is about to move to In Review
- List anything you built that the ticket, PRD, or a screenshot did not name
- Say what you referenced, in one line

---

## The password on the deployed site

`src/proxy.ts` puts the whole published site behind HTTP Basic auth — every
route, every static asset, and `public/r/*`. The browser asks, and until it is
answered nothing renders at all.

The password is **`SITE_PASSWORD`**, never a literal in this repo — the remote
is pushed, and a literal here would publish the password beside the thing it
protects. It lives in two places:

```bash
# localhost, so the prompt can be seen while working. Gitignored via .env*
echo 'SITE_PASSWORD=sarj123' > .env.local

# the deployed site
vercel env add SITE_PASSWORD production
vercel env add SITE_PASSWORD preview
```

Any username works; only the password is checked, so a reviewer needs one
string and no account.

Three behaviours worth knowing:

- **The gate is on wherever the password is set**, localhost included. Delete
  `.env.local` and local goes back to open.
- **It fails closed on Vercel.** A deploy with no `SITE_PASSWORD` is
  unreachable rather than public, so a missing variable can never silently undo
  the gate. With no password set, only *local* stays open.
- **`npm run shots` and `npm run thumbs` carry the password themselves.** They
  read `.env.local` through `@next/env` and hand it to the capture browser —
  Node does not read that file on its own, and without it every capture comes
  back as a blank 401.

It gates `public/r/*.json` too, so `npx shadcn@latest add <url>` needs the
credentials in the URL:

```bash
npx shadcn@latest add https://x:PASSWORD@mock-up-repo.vercel.app/r/<slug>.json
```

Basic auth over HTTPS keeps the site out of a browser and off a search engine.
It is not a defence against someone guessing a short password, so treat the
mock data the way `Where everything lives` already says to.

---

## The shadcn registry

Every mockup is published as a shadcn registry item, so a screen can be pulled
into another repo with one command instead of copied file by file. Each card on
the index carries a `</>` menu with the command for npm, pnpm, bun and yarn,
plus the raw URL.

```bash
npx shadcn@latest add https://mock-up-repo.vercel.app/r/<slug>.json
```

That installs the route, its components, its mock data and the shared shell into
the consumer's own `components/` and `lib/` — and installs every shadcn
primitive it uses from *their* registry, so their `Button` is not overwritten
with this repo's copy.

**`registry.json` is generated, never hand-edited.** `scripts/build-registry.mjs`
starts at each route in `src/lib/mockups-data.ts`, follows every local import,
and writes whatever it reaches. Hand-maintained file lists go stale the moment
someone adds an import, and the failure is silent — the consumer installs a
screen that does not compile.

- `src/components/ui/*` is never copied; it becomes `registryDependencies`.
- npm packages become `dependencies`.
- Route files need a `~/`-prefixed target. A bare `app/...` target is dropped
  without an error.
- `public/r/*.json` is build output but **is committed** — Vercel serves it
  statically, so an unbuilt registry means the published URLs are stale.

Run `npm run registry` whenever a mockup is added, renamed, deleted, or changes
what it imports.

---

## Review comments on the deployed site

Reviewers leave comments through the Vercel toolbar, which carries Vercel
Comments. Preview deployments get it automatically. **Production does not** —
so `src/components/staff-toolbar.tsx` mounts it there, and the comment button
at the end of every mockup's shell header turns it on.

That button is the way in. It is the last thing in the `MockupShell` header,
identical on every mockup, and it needs no briefing — which the query param it
replaced did, so a link sent without one was a dead end.

The flag still exists and still works:

```
https://mock-up-repo.vercel.app/<slug>?toolbar=1   turn it on (sticks)
https://mock-up-repo.vercel.app/<slug>?toolbar=0   turn it off
```

`?toolbar=1` is what the button writes into the address bar when you press it —
no reload, but the URL is then worth copying, because the next reviewer gets a
link that arrives already opted in. Opting in sticks across every mockup until
you turn it off.

`?toolbar=0` hides the comment button as well as the toolbar: no toolbar, and
nothing offering to turn one on. `npm run shots` and `npm run thumbs` drive
every route with it, so a capture carries the design and not the chrome a
reviewer uses to talk about it. Anything else that screenshots a route must
pass it too.

**The toolbar is opt-in on purpose.** Mounting it for everyone prompts *every*
visitor to log in to Vercel, on top of the site password they have already
given. A button mounts nothing — only pressing it does — so a reviewer gets one
click and nobody else is asked for anything.

Everyone who comments needs a Vercel account; a free one is enough, and they do
not have to join the team. Reviewers log in through the toolbar itself, not
through a separate invite. On a Pro team the **Pro Viewer** role is free and
carries commenting, so reviewers cost nothing; external collaborators are
invited per deployment through **Share**, several on Pro and Enterprise but
only one at a time on Hobby. Comments on production do not email anyone by
default — @-mention the person, or connect the Slack integration.

If the toolbar refuses to appear after pressing the button, check Settings →
General → **Vercel Toolbar** → Production is **On** at team or project level.
It defaults to preview-only, and when it is off the flag mounts the script and
Vercel renders nothing.
