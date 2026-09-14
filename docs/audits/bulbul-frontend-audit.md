# Frontend audit — the product against the design system

The product is `sarj-ai/bulbul`, `typescript/packages/app`, at
`e51fe6f0a [DES-192] refactor(app): platform-wide frontend consistency pass`.
The reference is this repo: `/design-system`, `AGENTS.md`, the ten `sarj/*` lint
rules, and the skills under `.claude/skills/`.

This measures the product against the **design system**, not against the
mockups. Nothing here says "mockup X has not been built". It says where the
shipped product and the written system disagree.

---

## The short version

DES-192 did what it said: 17 list surfaces now share one index-page shape. The
gap is that **it converted pages while the primitives those pages are built from
stayed unconverted**, and nothing enforces the result.

Six findings carry most of the weight:

1. **`components/ui/badge.tsx` still hard-codes `green-50`, `amber-50`,
   `blue-50` and `red-50`** — the exact palettes the DES-192 commit message says
   it removed. They survived because `src/components/ui/**` is in the ESLint
   `ignores` list.
2. **The control scale is one step taller than the system's.** `Input` is `h-9`
   against `h-8`, `Button` default `h-9` against `h-8`, `Select` `h-9`/`h-8`
   against `h-8`/`h-7`. Button sizes are pinned to field heights *so a filter bar
   lines up*; the whole scale is off by 4px, and `Input`, `Select` and
   `Button variant="outline"` also carry `shadow-xs`, which the system bans.
3. **There is no `Drawer` primitive in the product, and no `DataTable` one
   either.** Nine side panels exist, all `Sheet`; against them, 47 files use
   `Dialog` and 27 use `AlertDialog`. The 30 conforming tables each repeat the
   header-band class strings inline.
4. **The `Empty` primitive is used once in the whole product.** Every list
   surface hand-rolls its own, through four different mechanisms, with copy that
   disagrees with itself.
5. **87 files animate; 2 carry `motion-reduce:`.**
6. **The product enforces none of the ten `sarj/*` rules.** Everything above can
   come back the day after it is fixed.

Read §3 first. Most of the rest follows from it.

---

## 1. What was measured

| Chapter | The rule |
|---|---|
| Foundations | 7 non-negotiables — icons (HugeIcons only), shadows (none), typography, spacing, radius, scrollbars, accessibility. Colour: "a colour that is not on this page does not exist." |
| Surfaces | Four: **inline** (configuring, where it fits) · **drawer** (configuring or reading, too big for the page) · **pop-up** (one quick decision) · **multi-step** (creating something that will not fit on one screen). |
| Index page | Header · Controls · Content · Actions · **States: loading, empty, no-results, error, populated**. |
| Tables | The chip vocabulary (`*-tint`, colour only on the status column), **one empty-value convention**, row actions (word → icon → overflow, never more than three), language chips, 40px rows matched to the header band. |
| Forms | 12 settled decisions, from label weight to disabled-and-read-only. |
| Buttons | 4 sizes (24/28/32/36px, pinned to Input and Select heights) × 4 roles. |
| Motion | Two curves, six durations, nothing over 300ms, transform and opacity only, every animated element carrying its own `motion-reduce:`. |
| Patterns | Multi-step creation: step indicator, one decision per step, Back, **Review**, submitting state, failure state naming the broken step. |

Scope is code-level: both trees read and diffed, no browsers run.

**One asymmetry matters.** This lab is deliberately light-mode and
left-to-right, and `ui-review` says not to spend findings on dark mode or RTL
here. The product ships dark tokens, the `tasama` whitelabel and Arabic. So the
token rules bind *harder* in the product than in the lab that wrote them, and
§10 treats them as live.

---

## 2. Four sources of truth, and they disagree

Before anything is fixed, one of these has to win. Today a developer can follow
any of them and be told they are wrong by another.

| Source | Says |
|---|---|
| **This lab** — `/design-system`, `AGENTS.md`, `eslint-rules/` | Newest. Tint tokens, no shadows, HugeIcons, the four surfaces. |
| `bulbul/src/app/doc/design-tokens.md` | Documents `--chart-1 … --chart-5`; `globals.css` ships six. Never mentions the `*-tint` family or `scrollbar-thin` — the tokens DES-192 added and the doc is supposed to cover. |
| `bulbul/.claude/skills/design-system-rules/SKILL.md` | Says light/dark runs on `next-themes` with `attribute="class"`. `next-themes` is **not a dependency**, and there is no theme switcher anywhere in `src/`. |
| This lab's `sarj-brand` skill | Still prescribes `green-50`-style soft badges and "soft shadows" — both overruled since, by the tint tokens and by `no-shadow`. |

**Recommendation:** make `/design-system` canonical, cut the overlapping halves
of the other three down to pointers, and fix the two factual errors
(`chart-1…5`, `next-themes`).

---

## 3. Foundations — the primitives and the tokens

This is the chapter the others depend on. Pages cannot converge while the
primitives they are assembled from disagree.

### 3.1 Inventory

70 primitives here, 53 in the product, 42 shared.

**In the system, absent from the product:** `drawer`, `stepper`, `combobox`,
`accordion`, `toggle` / `toggle-group`, `context-menu`, `hover-card`,
`native-select`, `pagination`, `resizable`, `marker`, `input-otp`,
`aspect-ratio`, `menubar`, `navigation-menu`, and the whole Conversation and
media group (`message`, `bubble`, `attachment`).

`drawer` and `stepper` are the two that cost real behaviour — see §4.

**Installed in the product and used zero times:** `field.tsx`, `item.tsx`. Both
are core to the system (Form structure, and the list row). Forms went to
react-hook-form + `form.tsx` instead, in 21 files. That is a defensible
divergence — the product's own `forms` skill mandates it — but it is a
divergence, and the system's Forms chapter describes `Field`/`FieldLabel`/
`FieldDescription`/`FieldError`. Pick one and say so.

**In the product, undocumented by the system:** `animated-tabs`,
`date-time-picker`, `date-time-range-picker`, `filter-chip`, `labeled-toggle`,
`multi-select`, `segmented-control`, `siri-orb`, `time-picker`,
`timezone-select`, `waveform-player`. The system's Custom components section
lists `FluidOrb`, `MeshOrb`, `Shdr31`, `FileCard`, `DotPattern` — none of which
the product has, and none of which cover `siri-orb`. Eleven components nobody
owns a rule for.

### 3.2 The control scale is one step out

| | System | Product |
|---|---|---|
| `Input` | `h-8` (32px) | `h-9` (36px), plus `shadow-xs` |
| `Select` trigger | `h-8` / `h-7` (sm) | `h-9` / `h-8`, plus `shadow-xs` |
| `Button` | `xs 24 · sm 28 · default 32 · lg 36` | `xs 24 · sm 32 · default 36 · lg 40` |
| Radius | `rounded-lg` | `rounded-md` |
| Press feedback | `active:translate-y-px` | none |

The system pins `sm` to a small Input and `default` to a normal one for one
stated reason — *"which is what makes a filter bar line up instead of
stepping"*. The product's scale breaks that pairing everywhere at once, so no
per-page fix can settle it.

### 3.3 Shadows and Card

`Card` in the system is `ring-1 ring-foreground/10`, no border, no shadow, with
`--card-spacing` at 16px (12px at `size="sm"`) and a `bg-muted/50` footer.

`Card` in the product is `border … py-6 shadow-sm gap-6 px-6` with no `size`
variant, and `CardTitle` is `leading-none font-semibold` against the system's
`font-heading text-base leading-snug font-medium`.

So every card in the product is 24px-padded, bordered, shadowed, and titled a
weight heavier. Add `Input`, `Select` and `Button variant="outline"` carrying
`shadow-xs`, and `--shadow-sidebar-outline` in `globals.css`, and the
"no shadows" foundation is not partially met — it is inverted.

### 3.4 `badge.tsx` — the highest-value single fix

`components/ui/badge.tsx:23-29`:

```
success: "bg-green-50 text-green-700 … dark:bg-green-900/30 dark:text-green-400"
warning: "bg-amber-50 text-amber-700 …"
info:    "bg-blue-50  text-blue-700  …"
error:   "bg-red-50   text-red-700   …"
```

Twenty palette tokens, none reachable by `[data-whitelabel="tasama"]`, one
directory away from the `*-tint` tokens that replaced them. `eslint.config.js`
ignores `src/components/ui/**`, so no lint sees them.

Three live call sites, all `variant="info"`, all in
`app/batch-calls/batch-call-table.tsx:67,79,153` — a route DES-192 converted.
The other three variants are dead API surface inviting reuse.

Separately, `Badge` and `Button` `variant="destructive"` are solid
`bg-destructive text-white` where the system's is a soft tint
(`bg-destructive/10 text-destructive`) — deliberate there, because *"it confirms
first, so it does not also need to shout."*

### 3.5 Tokens

142 tokens here, 114 in the product.

**Missing from the product:**
- the whole `--info` family (`info`, `-foreground`, `-tint`, `-tint-foreground`)
  — which is why `Badge variant="info"` is still on `blue-50`
- the z-index scale (`--z-base` … `--z-tooltip`) — so every layer is a raw
  number; see §7
- `--ease-in-out-cubic` — one of the system's two curves
- `--radius-2xl` / `-3xl` / `-4xl` — `Badge` is `rounded-4xl` here
- `--font-heading`, `--font-mono`

**Present in the product and against the rules:**
- `--shadow-sidebar-outline`
- `--animate-fade-in: fade-in 0.5s ease-out` and `--animate-fade-in-up: … 0.4s`
  — both over the 300ms cap, both on a raw `ease-out` rather than
  `ease-out-cubic`
- `--ease-sidebar`, a fifth curve where the system has two

**Dead on arrival:** the six-slot `--chart-1 … --chart-6` palette DES-192 added
has **zero consumers**. Verified by grep across the whole tree. The product's
only chart, `app/dashboard/call-volume-chart.tsx:51,55`, uses raw
`hsl(276, 100%, 80%)` and `hsl(276, 100%, 60%)`.

---

## 4. Surfaces — "is there any other type of drawer?"

**No. There is no `Drawer` primitive in the product at all.** `Sheet` is the
only side panel, and this is the complete list of them:

| Panel | File | Opened from |
|---|---|---|
| Call detail | `app/calls/call-detail-sheet.tsx` | `/calls` row click **and** `/quality/dashboard` row click |
| Messaging detail | `app/messaging/messaging-detail-sheet.tsx` | `/messaging` row click |
| Batch settings | `app/batch-calls/batch-settings-sheet.tsx` | `/batch-calls/[batchId]` header |
| AI Notes | `app/scenarios/ai-notes-sidebar.tsx`, hosted twice (below) | floating FAB on the scenario editor |
| Tool configuration | `components/scenario/tools-configuration.tsx` | gear on a configured tool |
| Filler words / backchannel | `components/settings/backchannel-settings.tsx:212` | gear on the Backchannel block |
| Background noise | `components/settings/background-noise-settings.tsx:130` | gear on the Background noise block |
| Playground scenario list | `app/(playground)/playground-view.tsx` | mobile "Browse Agents" |
| Mobile app sidebar | `components/ui/sidebar.tsx` | mobile hamburger |

Two notes on that list. `app/calls/call-metadata-sidebar.tsx` is *not* a tenth —
it is the fixed 325px rail inside the call detail sheet. And AI Notes is built
twice — `scenarios/[scenarioId]/scenario-view-edit.tsx:832` and
`scenarios/scenario-form.tsx:754` — two copies of the same mobile panel, one on
the edit screen and one on the create screen, both `mobileAINotesOpen`, both
hosting `ai-notes-sidebar.tsx`. That duplication is worth collapsing on its own.

The two settings sheets are the pattern working. Backchannel and background
noise are configuration too large for the row that opens them, they keep the
page behind them, and they are reused by all three consumers — the persona
create form, the persona update form, and the "Persona Default Values" block of
global settings. Together with the tool-configuration sheet they are three
correct precedents already in the codebase, which is what makes §4.1 a
re-filing job rather than a new pattern.

Against those nine: **47 files import `ui/dialog` and 27 import
`ui/alert-dialog`.**

### 4.1 What is filed as a pop-up but is configuration

The system: a pop-up is *"a quick decision, and only that"*, and explicitly
*"never configuration, and anything with more to read — that is a drawer."*
These are multi-field configuration in a Dialog:

- `admin/phone-numbers/provisioned/manage-outbound-dialog.tsx`
- `admin/phone-numbers/provisioned/edit-trunk-dialog.tsx`
- `admin/phone-numbers/provisioned/change-allocation-dialog.tsx`
- `app/calls/configure-report-dialog.tsx` (678 lines — template picker, three
  column groups, chip reordering, a nested save-as-template dialog)
- `messaging-settings/components/add-config-dialog.tsx` and
  `edit-config-dialog.tsx` (organization, name, provider, token, per-scenario
  mapping rows, enabled switch)
- `admin/voices/components/add-voice-dialog.tsx` / `edit-voice-dialog.tsx`
  (`voice-form.tsx` is 860 lines with provider-conditional field sets)
- `agents/components/add-agent-profile-dialog.tsx` / `edit-agent-profile-dialog.tsx`
- `components/scenario/advanced-settings-section.tsx`
- `components/scenario/sinks/zoho-crm-sink-config.tsx`
- `admin/telephony/connections/[sipConnectionId]/number-format-dialog.tsx`
- `integrations/zoho/management/webhook-management-client.tsx` (module, events
  checklist, scenario, condition builder)

The tool-configuration Sheet is the counter-example, and it is the system's own
named case: *"Agent page → Tools → configure one tool."* The pattern is already
in the codebase, once.

### 4.2 Multi-step creation

Exactly **one** multi-step flow exists:
`app/admin/telephony/connections/new/connection-wizard.tsx`, six steps.

Measured against the pattern's required list:

| Required | Present |
|---|---|
| Step indicator | Yes, but hand-rolled — `Progress` + "Step {n} of 6", because there is no `Stepper` primitive |
| One decision per step | Yes |
| Back | Yes, with state preserved |
| **Review** | **No** — the last step is `step-verification`, which tests the connection rather than showing what is about to be created |
| Submitting state | Yes |
| Failure state naming the step | Partial — `step-collision-check` reports its own failure; other steps do not |

`app/scenarios/new/` is a second stepped flow (industry → use case → name →
form) and also hand-rolls its progression.

The system's *other* named multi-step example is **"Create voice"**. It ships as
a plain Dialog wrapping an 860-line form.

---

## 5. Index pages — the states

### 5.1 Empty states: one primitive, four mechanisms

`components/ui/empty.tsx` is imported by exactly **one** file in the product:
`components/status-page.tsx`. Every list surface does something else:

1. **Hand-rolled cards** — `<h3 className="mb-2 text-lg font-semibold">` inside
   a bordered div. `reports/page.tsx:64`, `variables/client.tsx:149`,
   `messaging-settings/page.tsx:109`, `admin/telephony/providers/page.tsx:130`,
   and others.
2. **Eight separate private `EmptyState` components**, each defined in the file
   that uses it and shared with nothing:
   `admin/phone-numbers/provisioned/provisioned-numbers-panel.tsx`,
   `admin/telephony/connections/page.tsx`,
   `admin/telephony/providers/page.tsx`, `api-keys/client.tsx`
   (`EmptyApiKeyState`), `batch-calls/batch-table.tsx`,
   `calls/call-transcript.tsx`,
   `integrations/salla/salla-integration-content.tsx`,
   `phone-numbers/page.tsx`.
3. **In-table `colSpan` rows** — 7 sites, e.g. "No phone numbers found.",
   "No organizations found."
4. **Nothing at all** — `/calls` renders an empty table under "0 results";
   `/admin/voices` has no empty state.

The copy disagrees with itself too, which the approval checklist gates on
directly ("microcopy consistency (capitalization…)"): *"No Files Yet"*,
*"No tasks found"*, *"No batch calls found."*, *"No providers yet"*,
*"No variables yet"*, *"No reports yet"*.

### 5.2 Loading

37 of 48 routes have `loading.tsx`. The gaps that matter are the ones that own
tables:

- `developer/webhooks` — three tables, no skeleton
- `admin/telephony/kamailio` — two tables, no skeleton
- `admin/scenario-templates/[industryId]` — one table, no skeleton

Plus `developer`, `developer/api-reference`, `connections/new`,
`connections/adopt`, `scenarios/auto-generate` and its `generating`, and
`mcp/authorize`.

**Skeleton parity** — a skeleton that does not match its table reflows the page
on load:

| Route | Skeleton | Real |
|---|---|---|
| `messaging` | 5 columns | 6 for system admins (`Organization` is conditional) |
| `admin/telephony/providers` | a 5×5 grid of `<div>`s — no `<Table>` at all | 5 `<TableHead>` |
| `integrations/zoho/management` | two Cards of stacked rows, no `<Table>` | 6 columns |
| `admin/organizations` | 5 | 5 (orgs tab) / 6 (users tab) |
| `admin/phone-numbers` | 9 | 9 / 5 / 10 across the three tabs |
| `calls` | 9 | 9 default / 10 detailed (admin) |
| `scenarios` | 8 | permission- and status-filtered |

The last four match only their default tab or the default role, which may be an
acceptable call — but it is a call, not currently a documented one.

### 5.3 Error

Nine routes have `error.tsx`: `admin`, `connections/[sipConnectionId]`,
`batch-calls`, `calls`, `dashboard`, `knowledge-bases`, `phone-numbers`,
`scenarios`, plus the root `error.tsx` and `global-error.tsx`.

Falling through to the generic root boundary: `reports`, `messaging`,
`messaging-settings`, `variables`, `webhooks`, `api-keys`, `agents`,
`admin/voices`, `quality/dashboard`, `integrations`.

The converted routes with an `error.tsx` write a specific title ("Could not load
calls"). The ten above get "Something went wrong".

### 5.4 Pagination is three different things

- **Shared cursor `Pagination` + `LimitSelector`** (10/25/50/100, cookie-backed)
  — `calls`, `scenarios`, `agents`, `knowledge-bases`, `batch-calls`,
  `messaging`, `reports`, `admin/voices`, `admin/phone-numbers`.
- **Hand-rolled** — `quality/dashboard` renders its own Previous / "Page 1" /
  Next at a fixed limit of 50, with no limit selector.
- **None** — `phone-numbers`, `messaging-settings`, `variables`, `api-keys`,
  `webhooks`, `admin/organizations`, `admin/scenario-templates`,
  `admin/telephony/*`.

Note there is no `pagination` primitive in `components/ui/`; the shared one is
`components/pagination/pagination.tsx`.

### 5.5 The page shell

`ListPageLayout` reaches 17 surfaces. Not converted:

`api-keys`, `admin/tasks`, `admin/telephony/providers`, `admin/global-prompts`,
`admin/global-settings`, `integrations` (+ `salla/management`,
`zoho/management`), `developer`, `developer/webhooks`, `dashboard`,
`(playground)`, and the detail routes `knowledge-bases/[kbId]`,
`batch-calls/[batchId]`, `admin/organizations/[id]`,
`admin/scenario-templates/[industryId]`, `connections/[sipConnectionId]`,
`scenarios/[scenarioId]`.

`app/phone-numbers/page.tsx` is the half-conversion: it imports `ListPageLayout`
and then keeps the legacy `Card` + `overflow-x-auto rounded-md border` table and
`lg:shadow-sm` inside it.

**48 sites still use `min-h-screen w-full`** — the exact bug `ListPageLayout`'s
own docblock says it exists to kill (*"Asking for 100vh in there demanded a
header's worth more height than existed, so every list page scrolled by ~64px
even when its content fit"*). 36 of them are `min-h-screen w-full bg-white`, so
they carry §10's theming problem at the same time.

---

## 6. Tables

### 6.1 The shape

30 files carry both halves of the converted pattern —
`bg-muted/50 hover:bg-muted/50` on the header row and
`[&_td]:h-10 [&_td]:px-4 [&_th]:px-4` on the table.

**Fourteen live tables in thirteen files do not:**

| File | Wrapper | Band | 40px row |
|---|---|---|---|
| `admin/telephony/kamailio/page.tsx:163` **and `:402`** | `overflow-x-auto rounded-md border` | ✗ | ✗ |
| `admin/telephony/providers/page.tsx:71` | `overflow-x-auto rounded-md border` | ✗ | ✗ |
| `admin/telephony/connections/[sipConnectionId]/page.tsx:299` | `overflow-x-auto rounded-md border` | ✗ | ✗ |
| `admin/phone-numbers/trunk-assignments-table.tsx:60` | `rounded-md border`, no scroll container | ✗ | ✗ |
| `admin/phone-numbers/provisioned/provisioned-numbers-panel.tsx:139` | `overflow-x-auto rounded-md border` | ✗ | ✗ |
| `phone-numbers/page.tsx:54` | legacy Card + `rounded-md border` | ✗ | ✗ |
| `admin/organizations/[id]/page.tsx:125` | bare `CardContent` | ✗ | ✗ |
| `admin/scenario-templates/[industryId]/use-cases-table.tsx:30` | none | ✗ | ✗ |
| `api-keys/client.tsx:276` | `Card` + `CardContent p-6` | ✗ | ✗ (`px-4 py-3`) |
| `integrations/zoho/management/webhook-table.tsx:59` | none | ✗ | ✗ |
| `scenarios/template-variables-table.tsx:145` | `rounded-lg border` | `bg-muted`, no `/50`, no hover lock | ✗ (percentage widths) |
| `developer/webhooks/page.tsx:255, :296, :~359` (3 tables) | `Card` / `CardContent` | ✗ | ✗ (`py-2`) |
| `batch-calls/file-preview.tsx:39` | `overflow-hidden rounded-md border` | `bg-muted/50` **without** the hover lock — the band lights up under the pointer | ✗ |
| `batch-calls/batch-call-table.tsx:215` | bare `<Table>` | ✓ (`:217`) | **✗ — the band without the matching row height** |

Two of these sit inside routes DES-192 converted. `admin/phone-numbers` is the
sharpest case: **three tabs, two table shapes**. Call Activity conforms;
Outbound Assignments and Provisioned do not. That is exactly what this repo's
`src/components/data-table.tsx` docblock predicted in writing:

> On that branch only `call-activity-table.tsx` had been brought across — the
> trunk assignments and provisioned tables were still on plain `<TableHead>`
> inside a `rounded-md border`.

**Five skeleton tables also diverge**: `admin/loading.tsx:20` and
`phone-numbers/loading.tsx:23` (`rounded-md border`, plain `TableRow`),
`admin/organizations/[id]/loading.tsx:14` and `api-keys/loading.tsx:66`
(`min-h-screen w-full bg-white`), and `admin/telephony/providers/loading.tsx`,
which fakes a table out of `<div>`s.

**The structural fix.** The product has **no `DataTable` primitive**. All 30
conforming tables repeat the class strings inline, so nothing holds them there
and the next table starts from whichever neighbour gets copied. Port
`src/components/data-table.tsx` from this repo — `DataTable` /
`DataTableHeaderRow` / `DataTableHead` — and convert the 14. That turns a
recurring styling review into a compile-time choice.

### 6.2 Empty cells: five conventions doing one job

The system's vocabulary is three values and one ban:

| Cell | When |
|---|---|
| `—` | the value cannot exist for this row |
| `Not set` | it could exist and nobody has filled it in |
| `Not analysed` | it could exist and the system has not produced it yet |
| ~~`Unavailable`~~ | **never** — it names no reason, so nobody can act on it |

What the product actually renders:

| Value | Occurrences |
|---|---|
| `—` | 16 |
| `-` (hyphen, not em dash) | 6 |
| `N/A` | 4 |
| `Unknown` | 3 |
| `None` | 2 |
| `Not set` | **0** |
| `Not analysed` | **0** |

So the two values that carry *meaning* are the two that are never used, and a
reader cannot tell "this row can't have one" from "nobody filled it in" from
"the system hasn't produced it yet". Examples:
`calls/call-metadata-sidebar.tsx:85,115,127` uses `—`,
`admin/phone-numbers/trunk-assignments-table.tsx:215` and
`batch-calls/batch-call-table.tsx:102` use `-`,
`batch-calls/batch-table.tsx:156,171` and `batch-calls/[batchId]/page.tsx:185,216`
use `N/A`, and `integrations/zoho/management/webhook-table.tsx:99` and
`scenarios/[scenarioId]/scenario-transfer-ownership.tsx:102` use `Unknown`.

The `—` sites are already right. This is a vocabulary decision plus a shared
`NoValue` component, not a redesign.

### 6.3 Row actions

The rule is a word, then an icon, then the overflow — never more than three
controls on one row — with an `aria-label` on every glyph "because the glyph is
the only name it has."

The product mostly follows the shape. The accessibility half does not: see §8.

---

## 7. Motion

| Rule | Product |
|---|---|
| Every animated element carries `motion-reduce:` | **87 files animate; 2 carry it.** The only `prefers-reduced-motion` block in `globals.css` covers `.thinking-dot` — one loading dot. |
| Transform and opacity only | 42 `transition-all` outside `components/ui/`, plus `calls/call-detail-sheet.tsx:54` and `messaging/messaging-detail-sheet.tsx:51` animating `transition-[width]` |
| Nothing over 300ms | `--animate-fade-in` 500ms, `--animate-fade-in-up` 400ms, `components/ui/sheet.tsx:53` `duration-500`, `components/ui/message-scroller.tsx:99` `duration-400`, `scenarios/auto-generate/client.tsx:402` `duration-500`, and two `duration-500` in `components/scenario/data-extraction.css` |
| Two curves | plus `--ease-sidebar`, and raw `ease-out` on the two animate tokens; `--ease-in-out-cubic` is not defined at all |
| Name the layer, never the number | **no z-index scale exists.** 23 raw sites: `z-[9999]` in `app/components/connection-error-alert.tsx:27`, ten `z-50`, eleven `z-10`. Two `z-50` sticky bars sit at the same layer as five fullscreen `z-50` overlays in `scenarios/auto-generate/generating/generating-content.tsx`, with no ordering guarantee between them. |

The reduced-motion number is the one to act on. It is an accessibility
regression rather than a style preference, and it is 98% unmet.

---

## 8. Accessibility

**43 of 84 icon-only `<Button>`s have no `aria-label` or `aria-labelledby`.**
Parsed structurally, not by line grep — a naive line-based count reports 79 of
79 and is wrong, because the attribute usually sits on its own line.

Among them: `calls/call-transcript.tsx:93`,
`calls/retry-call-outcome-button.tsx:64`, `calls/call-detail-content.tsx:172,449`,
`calls/enhanced-transcript-display.tsx:61`,
`knowledge-bases/kb-table.tsx:160,182,203`,
`admin/phone-numbers/trunk-assignments-table.tsx:221`,
`admin/scenario-templates/[industryId]/delete-use-case-button.tsx:39`.

Some are wrapped in a `Tooltip`, which helps a sighted mouse user and does not
give the control a name. The row-action rule asks for the label directly.

**Headings:** only 14 route files contain an `<h1>`, out of 48. The cause is
architectural rather than careless — page titles live in the app header via
`HeaderSlot`, and `app-header.tsx` renders breadcrumbs, not a heading. But the
result is that most pages have no `h1`, and `ui-review` gates on "exactly one h1
per page". Decide whether the breadcrumb's current crumb becomes the `h1` or
whether `ListPageLayout` grows a title slot.

**Clean:** no hand-rolled `<table>`, `<input>`, `<textarea>` or `<select>`
anywhere outside `components/ui/`, and only two raw `<button>`s, both inside the
primitives layer. The `use-ui-primitives` rule would pass today.

---

## 9. Icons

**162 files import `lucide-react` outside `components/ui/`. 57 use HugeIcons.**
Roughly 3:1 the wrong way.

Worst segments: `admin/telephony/**` (15 files), `calls/**` (13),
`(playground)/**` (10), `batch-calls/**` (9), the root app shell (7),
`scenarios/**` (6), `admin/phone-numbers/**` (6), and `components/**` (43).
Four of those are routes DES-192 converted — it converted the tables, not the
leaf components around them.

Three places make the mixture structural rather than incidental:

- `app/sidebar-nav.tsx:26` imports both libraries and defines a
  `lucideNavIcon()` shim at `:74` to reconcile stroke weights (the comment:
  *"lucide strokes at 2 on a 24 grid, which reads heavier than hugeicons' 1.5"*).
  Used at `:204` (Reports) and `:247` (Webhooks). Both glyphs exist in
  HugeIcons — this repo's `app-shell-icons.tsx` has them.
- `components/scenario/tools/types.ts:7` types the tool registry on
  `LucideIcon`. That contract has to change before any tool icon can.
- `app/error.tsx`, `global-error.tsx`, `not-found.tsx`, `impersonation-banner.tsx`,
  `sandbox-banner.tsx`, `user-button-client.tsx` — the whole app shell.

---

## 10. Dark mode, whitelabel, RTL

**Dark mode is complete and unreachable.** `globals.css` carries a full `.dark`
token set and `@custom-variant dark`, but `next-themes` is not a dependency,
there is no `ThemeProvider` or `useTheme` anywhere, and nothing adds `dark` to
`<html>`. `app/doc/design-tokens.md:113` admits it: *"The app doesn't yet ship an
in-app theme switcher, so flip modes by editing the root `<html>` element in
DevTools."*

That makes the **74 `bg-white` / `text-white` sites across 55 files** latent
rather than visible — but every one of them will break the day a switcher ships,
and they are invisible to a `green-50`-style grep. Worst: `dashboard/page.tsx`
(7), `dashboard/loading.tsx` (4), `batch-calls/form/batch-retry-settings.tsx`
(4), `batch-calls/[batchId]/page.tsx` (4), plus `calls/call-outcome.tsx:49,98`
and `calls/call-flags-list.tsx:47` inside a converted route.

**The whitelabel is wired** — `[data-whitelabel="tasama"]` in `globals.css:186`,
applied at `layout.tsx:73`. Everything in §3.4 and the raw palettes below are
what it cannot reach:

- `calls/call-flag-constants.ts:13-18` — six categorical `bg-*-500` classes, and
  at `:25-30` their six `rgba()` twins. This is precisely the `--chart-1…6` case.
- `scenarios/ai-notes-sidebar.tsx:70-72` — `border-l-purple-500` /
  `-green-500` / `-orange-500`: raw palette *and* a physical border side.
- `lib/json-schema-editor/index.ts:8-19` — 12 palette tokens.
- `components/scenario/data-extraction.css:93-125` — **135 OKLCH literals**, a
  full Tailwind ramp re-declared as `--jsonjoy-color-*`. A second colour system,
  in the second CSS file in the app, that nothing can theme.
- `components/ui/waveform-player.tsx:132-137` — `rgb(181,126,232)` twice (the
  brand purple, hard-coded) and `rgb(226,232,240)`.
- `components/ui/siri-orb.tsx:27-30` — four raw `oklch()` literals.

**RTL is not wired at the root.** `layout.tsx:73` is `lang="en"` with no `dir`,
and there is no locale provider or `[dir=rtl]` rule. What exists is per-element:
nine correct `dir="auto"` sites, and five that **hard-code `dir="rtl"` with
`text-right`** — `components/scenario/tools/voicemail-detection-form.tsx:59`,
`transfer-to-human-form.tsx:89,132`, `end-call-form.tsx:38`,
`code-switching.tsx:41`.

112 physical-direction sites remain across 63 route files. The two that break
layout rather than spacing:

- `scenarios/page.tsx:259,262` — `sticky right-0` pins the Actions column to the
  wrong edge in RTL, in a converted table.
- The paired `pr-10` / `right-0` input adornments in
  `messaging-settings/components/add-config-dialog.tsx:283,287`,
  `edit-config-dialog.tsx:202,206`, and
  `batch-calls/form/batch-retry-settings.tsx:182,198` — both halves must flip
  together or the icon lands on the text.

Also `developer/webhooks/page.tsx` carries nine redundant `text-left` on
`<TableHead>` elements that already left-align — noise that only does something
in RTL, and the wrong thing.

---

## 11. Nothing enforces any of this

This repo enforces ten `sarj/*` rules. The product enforces **none of them**.

`typescript/packages/app/eslint.config.js` has exactly one design-adjacent rule
— `<label>` must be `<Label>` — and its `ignores` block excludes
`src/components/ui/**` entirely, which is how §3.4 survived a commit whose
message was about removing those very palettes.

Ported in this order, the rules pay for themselves fastest:

1. `no-raw-color` — and **lift the `components/ui` exemption for colour
   specifically**, since that is where the worst offender lives.
2. `icon-source` — 162 files, but mechanical, and it stops the count growing.
3. `motion-reduce` — 85 files, each a one-class fix.
4. `z-index-tokens` — needs the token scale added first (§3.5).
5. `no-shadow`, `no-arbitrary-scale`, `motion-tokens`, `no-layout-animation`.

`use-ui-primitives` and `no-primitive-override` can go on immediately at close
to zero cost — §8 shows the first is already clean.

Expect a baseline file rather than a clean first run. The point is the ratchet,
not day-one zero.

---

## 12. Nav and surface coverage

This repo's replica shell (`src/components/app-shell.tsx`) carries two
Configuration items the product has no route for:

- **Roles** — DES-170. No `/roles` in the product; roles are `permissions_for_role()`
  server-side only.
- **Models** — DES-169. `app/admin/models/` exists but has **no `page.tsx`** — it
  is three form fragments (`llm.tsx`, `stt.tsx`, `tts.tsx`) imported only by
  `admin/global-settings/language-settings-tab.tsx`.

Everything else in the replica nav maps to a real route, and the labels match:
the product's sidebar correctly says "Personas" for `/agents` and
"Conversations" for `/calls`. The route paths still say `agents` and `calls`,
which is invisible to users and worth leaving alone.

---

## 13. Per-route scorecard

All 48 routes with a `page.tsx`. Generated mechanically from the tree, so it is
reproducible — rerun the greps in §16 to refresh it.

**Columns.** *Shell* = uses `ListPageLayout`. *Table*: `ok` = header band and
40px rows, `part` = one of the two, `legacy` = neither, `—` = no table.
*Empty* = which mechanism was detected — `Empty` (the primitive), `local` (a
private `EmptyState` defined in that route), `card` (hand-rolled heading), `row`
(in-table `colSpan`), `—` (none found). This column is a pattern match, so treat
it as a pointer; §5.1 has the cases read directly. *Pages* = pagination.
*Icons*: which library the route imports. *Panels* / *Pop-ups* = `Sheet` imports
and `Dialog`+`AlertDialog` imports, counting immediate sub-folders that hold no
page of their own.

| Route | Shell | Table | Load | Empty | Error | Pages | Icons | Panels | Pop-ups |
|---|---|---|---|---|---|---|---|---|---|
| `/(playground)` | · | — | ✓ | — | · | · | lucide | 1 | 2 |
| `/admin/global-prompts` | · | — | ✓ | — | · | · | lucide | 0 | 2 |
| `/admin/global-settings` | · | — | ✓ | — | · | · | lucide | 0 | 2 |
| `/admin/organizations` | ✓ | ok | ✓ | row | · | · | huge | 0 | 2 |
| `/admin/organizations/[id]` | · | legacy | ✓ | row | · | · | lucide | 0 | 1 |
| `/admin/phone-numbers` | ✓ | ok | ✓ | local | · | ✓ | both | 0 | 12 |
| `/admin/scenario-templates` | ✓ | ok | ✓ | card | · | · | both | 0 | 2 |
| `/admin/scenario-templates/[industryId]` | · | legacy | · | card | · | · | lucide | 0 | 0 |
| `/admin/tasks` | · | — | ✓ | — | · | · | lucide | 0 | 0 |
| `/admin/telephony/connections` | ✓ | ok | ✓ | local | · | · | both | 0 | 0 |
| `/admin/telephony/connections/[sipConnectionId]` | · | legacy | ✓ | — | ✓ | · | lucide | 0 | 7 |
| `/admin/telephony/connections/adopt` | · | — | · | — | · | · | — | 0 | 0 |
| `/admin/telephony/connections/new` | · | — | · | card | · | · | lucide | 0 | 0 |
| `/admin/telephony/kamailio` | · | legacy | · | — | · | · | — | 0 | 0 |
| `/admin/telephony/providers` | · | legacy | ✓ | local | · | · | lucide | 0 | 2 |
| `/admin/voices` | ✓ | ok | ✓ | row | · | ✓ | huge | 0 | 2 |
| `/agents` | ✓ | ok | ✓ | card | · | ✓ | huge | 0 | 6 |
| `/api-keys` | · | legacy | ✓ | local | · | · | lucide | 0 | 2 |
| `/batch-calls` | ✓ | ok | ✓ | local | ✓ | ✓ | both | 1 | 1 |
| `/batch-calls/[batchId]` | · | — | ✓ | — | · | ✓ | lucide | 0 | 0 |
| `/batch-calls/create` | · | — | ✓ | — | · | · | — | 0 | 0 |
| `/calls` | ✓ | ok | ✓ | local | ✓ | ✓ | both | 2 | 3 |
| `/dashboard` | · | — | ✓ | — | ✓ | · | lucide | 0 | 0 |
| `/dev/error-boundary` | · | — | · | — | · | · | — | 0 | 0 |
| `/developer` | · | — | · | — | · | · | lucide | 0 | 0 |
| `/developer/api-reference` | · | — | · | — | · | · | — | 0 | 0 |
| `/developer/webhooks` | · | legacy | · | — | · | · | lucide | 0 | 0 |
| `/integrations` | · | — | ✓ | local | · | · | lucide | 0 | 1 |
| `/integrations/salla/management` | · | — | ✓ | card | · | · | — | 0 | 0 |
| `/integrations/zoho/management` | · | legacy | ✓ | card | · | · | lucide | 0 | 2 |
| `/knowledge-bases` | ✓ | ok | ✓ | card | ✓ | ✓ | both | 0 | 6 |
| `/knowledge-bases/[kbId]` | · | — | ✓ | — | · | · | lucide | 0 | 0 |
| `/mcp/authorize` | · | — | · | — | · | · | — | 0 | 0 |
| `/messaging` | ✓ | ok | ✓ | card | · | ✓ | both | 1 | 0 |
| `/messaging-settings` | ✓ | ok | ✓ | card | · | · | both | 0 | 3 |
| `/no-organization` | · | — | ✓ | — | · | · | lucide | 0 | 0 |
| `/phone-numbers` | ✓ | legacy | ✓ | local | ✓ | · | lucide | 0 | 0 |
| `/quality/dashboard` | ✓ | ok | ✓ | card | · | · | huge | 0 | 0 |
| `/reports` | ✓ | ok | ✓ | card | · | ✓ | huge | 0 | 0 |
| `/scenarios` | ✓ | ok | ✓ | card | ✓ | ✓ | both | 1 | 5 |
| `/scenarios/[scenarioId]` | · | — | ✓ | card | · | · | lucide | 1 | 2 |
| `/scenarios/[scenarioId]/run` | · | — | ✓ | — | · | · | — | 0 | 0 |
| `/scenarios/auto-generate` | · | — | · | — | · | · | lucide | 0 | 0 |
| `/scenarios/auto-generate/generating` | · | — | · | — | · | · | lucide | 0 | 0 |
| `/scenarios/new` | · | — | ✓ | card | · | · | lucide | 0 | 0 |
| `/sign-in/[[...sign-in]]` | · | — | · | — | · | · | — | 0 | 0 |
| `/variables` | ✓ | ok | ✓ | card | · | · | huge | 0 | 1 |
| `/webhooks` | ✓ | — | ✓ | — | · | · | huge | 0 | 0 |

### Reading it

- **Fully on the pattern** (shell + `ok` table + loading): `admin/organizations`,
  `admin/phone-numbers`, `admin/scenario-templates`, `admin/telephony/connections`,
  `admin/voices`, `agents`, `batch-calls`, `calls`, `knowledge-bases`,
  `messaging`, `messaging-settings`, `quality/dashboard`, `reports`, `scenarios`,
  `variables`. Fifteen routes.
- **Has a table, on neither half of the pattern**: `admin/organizations/[id]`,
  `admin/scenario-templates/[industryId]`, `admin/telephony/connections/[sipConnectionId]`,
  `admin/telephony/kamailio`, `admin/telephony/providers`, `api-keys`,
  `developer/webhooks`, `integrations/zoho/management`.
- **`phone-numbers` is the one `part` row** — the half-conversion.
- **Pop-up hotspots**: `admin/phone-numbers` (12), `admin/telephony/connections/[sipConnectionId]`
  (7), `agents` (6), `knowledge-bases` (6), `scenarios` (5). §4.1 says which of
  these are configuration in the wrong surface.
- **`lucide` in the Icons column on a route whose table says `ok`** —
  `batch-calls`, `calls`, `knowledge-bases`, `messaging`, `scenarios`,
  `admin/phone-numbers`, `admin/scenario-templates`,
  `admin/telephony/connections` — is DES-192's exact shape: the table was
  converted, the components around it were not.

---

## 14. Design lab hygiene

Small, but the lab is the reference and should be trustworthy.

- `src/lib/thumbnails.json` holds a fingerprint for slug **`telephony`**. No such
  route exists — `phone-numbers` superseded it.
- `README.md` says review settings live in `src/lib/review-settings.ts`. That
  file was deleted with dark mode.
- `CONTEXT.md` documents a route `/conversations-v2` and
  `src/components/conversations-v2/`, both replaced by `/conversations-revamp`.
  It is otherwise the only file that maps mockups to real product paths, so it
  is worth correcting rather than deleting.
- **Only `/phone-numbers` consumes `src/components/data-table.tsx`.** Eight other
  mockups hand-roll `TableRow className="bg-muted/50 hover:bg-muted/50"` +
  `TableHead className="font-semibold text-foreground"` — the exact duplication
  the primitive exists to prevent, and the same failure §6.1 asks the product to
  fix. Fix it here first; it is nine files.
- Two independent copies of the section-register exist
  (`conversations-revamp/drawer/section-register.tsx` and
  `behavioral-alerts/section-register.tsx`), and two of the icon barrel
  (`app-shell-icons.tsx` and `conversations-revamp/list/icons.tsx`).
- `src/components/pixel-perfect/silver-button.tsx` is a deliberate non-Sarj
  specimen with three lint suppressions and no importers. Its own comment says to
  delete it rather than bring it onto the scale. Worth acting on, so a reader
  does not find three `sarj/*` suppressions and conclude they are negotiable.

---

## 15. Backlog, by impact over effort

**Do first — one file each, and they unblock the rest**

1. **`components/ui/badge.tsx:23-29`** → the `*-tint` tokens. Add the `--info`
   family to `globals.css` first. Three call sites to check
   (`batch-calls/batch-call-table.tsx:67,79,153`). Unblocks the whitelabel and
   dark mode for every badge in the product.
2. **Port `data-table.tsx`** into the product and convert the 14 tables in §6.1.
   Turns a recurring review comment into a compile-time choice.
3. **Settle the empty-value vocabulary** and add one shared `NoValue`. 31 sites,
   16 already correct.

**Do next — mechanical, high volume, and they stop the drift growing**

4. **Adopt `Empty`** and retire the eight private `EmptyState` components, the
   hand-rolled cards and the in-table rows. Settle the copy at the same time
   (sentence case, one convention).
5. **Port the lint rules** in the §11 order, with a baseline. Without this, 1–4
   regress.
6. **`motion-reduce:`** across the 85 files, or a global reduced-motion rule in
   `globals.css` — but say which, because per-element is what the rule asks for.
7. **`aria-label` on the 43 unnamed icon buttons.**

**Then — bigger, and each is a decision as much as a change**

8. **The control scale** (§3.2). Input, Select and Button heights, radius, and
   the `shadow-xs`/`shadow-sm` removal from Input, Select, Button and Card. This
   is one commit that moves every screen 4px, so it wants its own PR and its own
   QA pass.
9. **`dashboard`** — untouched by DES-192, holds the product's only chart, and
   that chart ignores the `--chart-1…6` palette DES-192 shipped. 12 shadows, 11
   `bg-white`.
10. **`admin/telephony`** — 15 lucide files, four legacy tables, `kamailio` has
    two tables and no skeleton, `providers/loading.tsx` fakes a table out of
    `<div>`s.
11. **`components/scenario/data-extraction.css`** — 135 OKLCH literals in a
    parallel colour system. Decide whether it maps onto tokens or gets isolated
    and documented as third-party.
12. **Re-file the configuration dialogs as drawers** (§4.1), and give
    `connection-wizard` a Review step. Add `drawer` and `stepper` to
    `components/ui/` first.
13. **RTL** — root `dir`, the five hard-coded `dir="rtl"` components, the
    `sticky right-0` actions column, and the paired `pr-*`/`right-0` adornments.
14. **Dark mode switcher**, or a decision that dark mode is not shipping. Right
    now the product carries a full second palette that no user can reach and no
    reviewer can check, and 74 `bg-white` sites that will surface the moment it
    is turned on.

---

## 16. Reproducing the numbers

Run from `typescript/packages/app/src` unless noted.

```bash
# §3.1 primitive inventory
ls ../../../../new-des-lab/src/components/ui | wc -l ; ls components/ui | wc -l

# §3.5 token diff (from SJ/)
grep -oE '^\s*--[a-z0-9-]+:' new-des-lab/src/app/globals.css | tr -d ' :' | sort -u > /tmp/lab
grep -oE '^\s*--[a-z0-9-]+:' bulbul/typescript/packages/app/src/app/globals.css | tr -d ' :' | sort -u > /tmp/app
comm -23 /tmp/lab /tmp/app

# §3.5 chart palette consumers (expect none)
grep -rn --include='*.tsx' --include='*.ts' -E 'chart-[1-6]|var\(--chart' app/ components/ lib/ | grep -v 'components/ui/chart.tsx'

# §4 surfaces
grep -rl 'components/ui/sheet'  --include='*.tsx' . | wc -l
grep -rl 'components/ui/dialog' --include='*.tsx' . | wc -l
grep -rl 'components/ui/alert-dialog' --include='*.tsx' . | wc -l

# §5.1 the Empty primitive
grep -rl 'components/ui/empty' --include='*.tsx' .

# §6.2 empty-cell conventions
for p in '"—"' '"-"' '"N/A"' '"Unknown"' '"None"' '"Not set"' '"Not analysed"'; do
  printf '%-16s %s\n' "$p" "$(grep -rn --include='*.tsx' -F "$p" . | wc -l)"
done

# §7 reduced motion
grep -rlE --include='*.tsx' '(transition-|animate-)' . | grep -v components/ui/ | wc -l
grep -rl  --include='*.tsx' 'motion-reduce' . | grep -v components/ui/ | wc -l

# §9 icon sources
grep -rl 'lucide-react' --include='*.tsx' --include='*.ts' app/ components/ lib/ | grep -v components/ui/ | wc -l
grep -rl '@hugeicons'   --include='*.tsx' --include='*.ts' app/ components/ lib/ | grep -v components/ui/ | wc -l

# §13 route count
find app -name page.tsx | wc -l
```

§8's icon-button count needs a parser, not a grep — a line-based match reports
79 of 79 because `aria-label` usually sits on its own line. Walk each `<Button`
to the end of its opening tag and test the whole tag.
