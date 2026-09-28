---
name: sarj-components
description: How to continue the design-system Components work in this repo — the shared page blocks (PageHeader, ActionTile, FilterBar, ListFooter), the decided layouts for index pages, drawers, unsaved-changes bars, the admin view and the Developers page, how to add a Components topic, how to frame a whole app page inside the design system, the ElevenLabs reference, and how Vansh likes to iterate. Load before adding or changing anything under /design-system/product-components, before building an index page, drawer, filter bar, pagination footer or save bar in a mockup, or when picking up this work in a new session.
---

# Sarj components — where this work stands and how to carry it on

The **Components** section of `/design-system` (`product-components` in the
URL) is where the product's own page-level patterns are designed, one topic per
pattern, each a live, clickable demo. Most of it was built in one long session
driven by screenshot feedback. This file is what that session knew.

Read AGENTS.md first — it still rules. This skill adds the decisions made since.

---

## How Vansh works — follow this or you will redo things

- **Feedback arrives as screenshots and Agentation notes** ("Page Feedback …
  Location … Feedback: …"). The note's selector says *which element*; the
  words are terse. Fix exactly that element, screenshot it, reply in 2–4 lines.
- **Don't ask; decide and state it.** He has said "don't ask me, just make
  it". Ask only when two readings lead to genuinely different builds (e.g.
  "developers page" = design-system docs vs product mockup). Then one short
  question, never a menu tool.
- **"Looks shitty" means rethink, not tweak.** Offer several structurally
  different takes as tabs of one demo (the Unsaved changes topic has five).
  He picks; you don't make him describe the fix.
- **"Revert" means revert only that last change.** Use `git checkout -- <file>`
  only when the file had no other uncommitted work; otherwise undo by hand.
- **He commits himself, often mid-session.** Check `git status` before assuming
  what is uncommitted. Never commit or push unless he says so.
- **Don't run `npm run registry` or `npm run thumbs` unasked** — he has
  rejected both mid-iteration. Mention they are pending instead.
- **No rule tables in demos.** A topic shows the thing working. He deleted the
  rule list under the Drawer demo ("we don't want this here"). Reasoning goes
  in code comments and in your reply.
- **Never edit a reviewed mockup to try an idea.** Build the idea in a
  design-system preview that reuses the mockup's pieces (see
  `conversations-index-preview.tsx`, which reuses `conversations-revamp`'s
  table and data but changes the frame around them).
- Keep replies short. Lead with what changed; list anything added that he did
  not ask for so he can cut it.

## Verify by looking, every time

The dev server is usually already running — `cat .next/dev/lock` for the
port. Screenshot with a Playwright script in the scratchpad (import Playwright
by absolute path: `/Users/vanshnagar/Desktop/mvp/dev/office/S/design-lab/node_modules/playwright/index.mjs`),
viewport **1502×863** (his), then read the PNG. For interactions: click tabs by
role, type into fields by label. **Never press Escape** in a script on a
`/design-system` topic — it closes the topic sheet; click outside instead.
Crop with PIL before reading when only one region matters. `npm run lint` and
`npm run typecheck` before every reply.

---

## Adding a Components topic

1. Add an entry to `PRODUCT_COMPONENTS` in `src/lib/design-system/data.ts`
   (`id`, `title`, one-sentence `description`, `sarj: true`). Ids are unique
   across **every** section — `index` not `index-page`, `drawer-anatomy` not
   `drawer`.
2. Add a view under that id in the `views` map in
   `src/app/design-system/[[...slug]]/page.tsx`.
3. Put the demo in `src/components/design-system/<name>-preview.tsx`.
4. A demo that is a whole page goes in `FULL_WIDTH_TOPICS` in
   `src/components/design-system/section-menu.tsx`, so the topic sheet drops
   its reading-column width.
5. The topic card on the section page is blank until someone draws a figure
   for it (`sarj-figure` skill, `topic-figures/`). Mention it; don't block on it.

Current topics: **Index page** · **Drawer** · **Integration card** ·
**Unsaved changes** · **Developers** · **Admin view** · **Avatar**.

### Showing the real app inside a topic

```tsx
<div className="relative flex h-180 translate-x-0 flex-col overflow-hidden rounded-xl border">
  <AppShell active="Conversations" underShell={false} scope={<AdminViewSwitcher />}>
    …page…
  </AppShell>
</div>
```

- `translate-x-0` makes the frame the containing block for the sidebar's
  `fixed` positioning, so the app stays inside the demo.
- `underShell={false}` drops the sidebar's `pt-12`, which exists only to clear
  the mockup shell's header on real mockup routes.
- Portalled overlays (Drawer, Dialog) still cover the whole viewport — fine.

---

## Shared blocks (`src/components/shared/`)

| Block | What it is |
|---|---|
| `page-header.tsx` → `PageHeader` | Title left; optional one-line description (most pages have none); `aside` on the right for page *state* (a quota, a link out) — never the create action. `actions` renders a tile row. |
| `page-header.tsx` → `ActionTile` | ElevenLabs-style tile: icon over a verb, `w-36 p-3 gap-2`, icon at text size (`size-4`). For pages with **several ways to add** (a knowledge base: URL, files, text, folder, sync). |
| `filter-bar.tsx` | `FilterBar` + `SelectFilter` (multi, "+ Field" → "Field: value" / "Field: 3" + ×), `DateFilter` (one range chip: Today / Last 7 / Last 30 + calendar), `AddFilter` (the "+ Filter" overflow). Clear all appears at two set filters. |
| `list-footer.tsx` → `ListFooter` | Under the table, `text-xs`: "1–10 of 12" left; "10 / page" select + First/Previous/Next as a joined icon `ButtonGroup` right. No labels, no noun, no page numbers. |
| `data-table.tsx` | The table shape (header band, 40px rows). Use it for every list. |

## Decided layouts

**Index page** (topic `index`; demo `scenario-index-preview.tsx`, second
example `knowledge-index-preview.tsx`), top to bottom:
1. `PageHeader` title.
2. **Views as tabs directly under the title** — `SecondaryTabs` from
   `design-system/tabs-preview.tsx` (the house underline tabs with the sliding
   bar, icons on each). They pick the list, so they come before what narrows it.
3. Search **filling the row**, the page's buttons at its end — secondary
   outlined first, the create action last and the only filled one.
4. Filter chips on the line under the search, `gap-2` from it (search + filters
   are one control).
5. Table, then `ListFooter`.
6. A page with several ways to add puts `ActionTile`s under the title
   (24px above them) and keeps the search row button-free; a single-view list
   has no tabs.
The state switch of the demo itself (Populated / Loading / Empty / No results /
Error) is `PrimaryTabs`, **outside** the card.

**Drawer** (topic `drawer-anatomy`; `drawer-anatomy-preview.tsx`):
- Header: title + Close only, one line, rule under it. No description when the
  opening button already named it. No icon tile.
- Body is the only scroller. Sections start with a **shaded band**
  (`bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground`) —
  like a table header row — not a hairline + grey label (he called that shitty).
- A switch the rest depends on is one row: label left, switch right. Dependent
  fields are **absent** while it is off, not greyed.
- No explainer line under every field. A limit becomes a live reading
  ("~6s of 20s", red past the limit).
- Footer stays put: Cancel, then Save (disabled until dirty). Every exit
  (Close, Cancel, Esc, outside click) routes through one guard that asks
  "Discard your changes?" when dirty.
- 384px for settings; `sm:max-w-3xl!` for records you read.

**Unsaved changes** (topic `unsaved-changes`; `save-bar-preview.tsx`) — five
variants as tabs, all sharing `useDraft` and a line-level `LineDiff`
(unchanged lines muted, −/+ lines tinted):
floating pill · in the header · per card · docked tray · review drawer.
Rules common to all: unsaved is a state, not a warning (no triangle); say what
changed; Discard is one click with an Undo toast, not a confirm; ⌘S opens the
review. Recommended: **review drawer** for prompts (live everywhere, per-change
revert), **in the header** for short settings pages. He liked this one — reuse
its tone.

**Integration card** (topic `integration-card`;
`integration-card-preview.tsx`) — three variants as tabs: cards, rows,
connected-first (connected as rows, available as cards). One "Connected"
tint chip, one action (Manage / Connect), a "Staff only" chip for
`requiresSuperAdmin`, no auth type (OAUTH/CUSTOM is plumbing). Logos are the
product's, copied to `public/integrations/`.

**Admin view** (topic `admin-view`; `admin-view-preview.tsx`): the superadmin
org switcher lives in the **app top bar** (`AppShell`'s `scope` slot), as a
warning-tinted `SelectTrigger size="sm"` reading "Admin view: Sarj.ai" — not a
band above the list. Demo shows the conversations list rebuilt to the index
rules (`conversations-index-preview.tsx`).

**Developers** (mockup `/developers` + topic `developers`;
`mockups/developers/`): top bar gets a **Developers** button instead of
"Developer Doc" (`AppShell developers="open" | "link"`); API Keys, Variables,
Webhooks and Developer Docs leave the sidebar and become tabs (Overview, API
keys, Webhooks, Variables). Overview = quickstart card with a real code block
(`POST https://platform-api.sarj.ai/api/v1/calls`, Bearer key, `phone_number`,
`scenario_id`, `language`, `variables` — read from `sarj-ai/platform`
`python/webserver/.../public_api`) + four quick links. Applied to this mockup
only; making it the shell default is one flag.

## App-shell props added (`src/components/shell/app-shell.tsx`)

`scope` (top-bar slot, first in the right row) · `developers` ("link" | "open")
· `underShell` (default true) · existing `hiddenItems`, `breadcrumb`.

## Standing rules this work added

- Every `<SelectContent>` gets `position="popper"` (the list opens *below* the
  trigger). Already applied repo-wide; in `sarj-mockup` and `ui-review`.
- Footer/meta text is `text-xs`.
- Chips and tiles take icons at text size.
- Filters are chips, never a row of dropdowns sharing the search's line.

---

## ElevenLabs as the reference

He uses ElevenLabs Agents as the visual bar ("same to same" for layout). Take
**structure, placement, interaction and states**; never its monochrome style
or features the ticket did not ask for (a RAG storage meter, Create folder,
Sync, promo cards). Mobbin has ~56 of its in-app screens (`mcp__mobbin__*`);
the signed-in app is in his Brave, but reading it needs Brave's *View →
Developer → Allow JavaScript from Apple Events*, and screenshots fail when Brave
sits on another macOS Space. Say so rather than guessing a page.

## Open threads he may pick up

- Nav consolidation proposed (not built): staff-only items (Scenario
  Templates, Global Prompts, Voice Library, Tasks, Organizations, Models,
  Telephony, Global/Messaging Settings) → one Admin page off the settings gear;
  Messaging → a channel filter on Conversations; Reports → exports on
  Conversations; Organizations + Roles + Phone Numbers → one Organization page.
  Start with Admin — same move as Developers.
- Drawer ideas offered: per-field "edited" dots + "3 changes · Save" footer;
  sticky section bands as a jump bar; ▶ play the voicemail message in the
  persona's voice; test detection against a sample recording.
- Topic cards need figures. The old Patterns › Drawer topic still uses (i)
  tooltips and disagrees with the new Drawer topic — reconcile or retire it.
- `npm run registry` / `npm run thumbs` are pending for the changed mockups.
