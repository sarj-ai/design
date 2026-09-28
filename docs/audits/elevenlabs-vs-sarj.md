# ElevenLabs vs Sarj — and what the design system is missing

Date: 2026-09-28. Three things measured against each other:

- **ElevenLabs Agents** ("ElevenAgents"), the closest competitor UI. Sources: 56 in-app
  screens on Mobbin captured Mar–Apr 2026, plus the public docs at `elevenlabs.io/docs`.
  An in-app walk in a signed-in browser is still pending, see [§7](#7-what-was-not-checked).
- **The Sarj product**: `sarj-ai/platform`, `products/platform/apps/web/src`, read from source
  (51 routes, import graph per `page.tsx`).
- **The design system**: this repo. `/design-system` (`src/lib/design-system/data.ts`),
  `globals.css`, `src/components/ui`, `src/components/shared`, the `sarj/*` lint rules, the skills
  and the 20 mockups.

The goal is the third one. The competitor and the product are measured so the design system
can decide what it owns next. Nothing was changed in either repo by this audit.

Source tags: **[M]** a Mobbin screen (link given), **[docs]** ElevenLabs documentation,
**[P]** a file in the product (path relative to `apps/web/src`), **[DS]** a file in this repo.
Claims without a tag in §4–§5 were verified in source unless marked *(inferred)*.

---

## 1. The short version

1. **The design system covers the generic parts of a SaaS app and almost none of the voice
   product.** Surfaces, forms, tables, index-page states, motion and z-layers are written down.
   The recording player, transcript, turn timing and latency, live-call state, charts, value
   formatting and Arabic content are not. The product builds all of them by hand, and so do
   the mockups, and both already disagree with themselves.
2. **The design system and the product are two different shadcn styles.** The product is
   `new-york` on Base UI, and the design system is `radix-nova` on Radix. Every shared control
   is one step taller in the product (Button and Input `h-9` vs `h-8`). The
   `control-scale` topic says 24/28/32/36 px; the product ships 24/32/36/40. Every mockup
   installed through the registry renders one step smaller than the product around it.
3. **Status is painted five ways in the product and four ways in the mockups.** The design
   system has the tint tokens but no Badge variant that uses them, and its chip key covers only
   four call statuses. The product's Badge falls back to raw `green-50`/`amber-50`/`red-50`.
4. **The documentation contradicts the code in six places.** The worst:
   - AGENTS.md and four skills say charts are "one purple ramp". Since DES-174,
     `globals.css:79-108` defines six separate hues.
   - `data.ts:439` still says drawers use an (i) tooltip, which contradicts the inline-description
     house rule.
5. **ElevenLabs is ahead on three things Sarj has no pattern for:**
   - **Versioning** (draft → diff → publish, with branches).
   - **Per-turn latency in the transcript.**
   - **Evaluation criteria and extracted data**, defined and inspected on one screen.

   Sarj is ahead on quality flags pinned to the waveform, the Scenario Copilot, the Arabic
   end-of-utterance model, batch calling with retries, and the Salla and Zoho automations.
   None of those has a design-system pattern either.

The ranked fix list is [§6](#6-recommended-design-system-fixes-in-order).

---

## 2. How the three are organised

| | ElevenLabs | Sarj product | Design system |
|---|---|---|---|
| Top-level grouping | Sidebar by lifecycle: **Configure** (Agents, Knowledge Base, Tools, Integrations, Voices) · **Monitor** (Conversations, Users, Tests) · **Deploy** (Phone Numbers, WhatsApp, Outbound) [M: [294390cf](https://mobbin.com/screens/294390cf-8038-4610-996c-332a3734d536)] | Playground on top, then **Agents** (Personas, Scenarios, Knowledge Bases, Batch Calls, admin items) · **Monitor** (Dashboard, Conversations, Messaging, Quality, Reports) · **Configuration** [P: `app/sidebar-nav.tsx`, `lib/sidenav-groups.ts`] | Eight Linear **Surfaces** (Conversations, Personas, Scenarios Index, Scenario Edit, Knowledge Bases, Integrations, Playground, Settings) [DS: `src/lib/site/mockups-data.ts`] |
| The "agent" | One object: the agent. Prompt, voice, LLM, tools, knowledge and analysis all live on it. | Split in two. The **scenario** holds prompt, tools, knowledge, analysis and success criteria. The **persona** holds voice, persona prompt and behaviour. LLM, STT, turn detection and interruptions are global or per-organisation only [P: `app/admin/global-settings/*`]. | No pattern says how a scenario, a persona and global settings relate on screen. |
| Shared libraries | Knowledge Base, Tools and Tests exist both globally and per agent: you build a library and attach from it [M: [67e87818](https://mobbin.com/screens/67e87818-fd79-43a6-a0e3-cc6d795f7478)] | Knowledge bases are global and attached per scenario. Tools are per scenario only. | — |

The split between scenario and persona is Sarj's decision and not a gap. It does mean every
comparison below maps one ElevenLabs agent onto **two** Sarj screens plus admin settings.

---

## 3. Surface by surface

Each table row reads: what ElevenLabs does → what the Sarj product does → what the design system
says. The last column is the gap the design system should close.

### 3.1 Conversations

| Aspect | ElevenLabs | Sarj product | Design system | Gap |
|---|---|---|---|---|
| List | Table: Date, Agent + branch, Duration, Messages, Call status. Search plus 12 "+ filter" chips [M: [9369bd47](https://mobbin.com/screens/9369bd47-0cec-4ff6-bc1e-0e087830e574)] | Table: Time, User, Type, Direction, Phone, Scenario, Status, Outcome, Duration. Filter bar, active-filter chips, time-range analytics strip, cursor pagination [P: `app/calls/*`] | `index-page` and `tables` topics; `DataTable` shared block; the chip key covers 4 statuses | **No filter-bar pattern.** The product has ~16 filter bars; so does the `conversations-revamp` mockup. |
| Detail container | Wide sheet over the list with prev/next "2/3" [M: [133736a1](https://mobbin.com/screens/133736a1-0af5-40ad-8039-c937a7d6f904)] | Sheet `sm:max-w-6xl` via `?callId=` [P: `calls/call-detail-sheet.tsx:59`] | `drawer` topic says a panel is 384px | **Two sizes of side panel are needed** (settings panel vs record viewer). The system defines one. Nothing covers prev/next. |
| Recording | Waveform, play, 1.0x, ±skip | wavesurfer.js with flag regions; clicking a flag seeks [P: `ui/waveform-player.tsx`, raw colours ×6] | **Nothing.** Two mockups hand-roll `recording-player.tsx` (216 and 229 lines) | **Recording player pattern + shared block.** |
| Transcript | Chat bubbles. Each agent turn is labelled with its workflow node and branch. **Latency chips per turn (TTS 146 ms, LLM 1.2 s).** Routing and tool events as inline system rows. "Turn this into a test" per message [M: [0ce2e993](https://mobbin.com/screens/0ce2e993-4b26-4e04-bfeb-ac0a44dc226c)] | Enhanced / Raw toggle; raw shows tool names. 5 transcript renderers across calls, quality, playground and messaging. **No per-turn latency anywhere.** [P: `calls/call-transcript.tsx`, `calls/enhanced-transcript-display.tsx`] | **Nothing.** `Message`/`Bubble`/`MessageScroller` primitives exist; no mockup uses them. Two mockups fork `TranscriptPanel` with different data models (`speaker` vs `role`, `at` s vs `timestampMs`) | **Transcript pattern + shared block**, including tool rows and latency. |
| Analysis | Overview tab: AI summary, call status with re-run, "How the call ended", **criteria "4 of 4 successful", each with a written rationale** [M: [133736a1](https://mobbin.com/screens/133736a1-0af5-40ad-8039-c937a7d6f904)] | Overview: outcome + reason, success-criteria results, "Generate report" if missing; callback card [P: `calls/call-outcome*.tsx`] | Nothing | **Evaluation result pattern**: pass/fail per criterion plus a reason. |
| Metadata | Right column: date, environment, duration, cost, LLM cost/min | Right sidebar: Call ID, caller, callee, times, SIP status, trunk, org, each with a hand-rolled copy button [P: `calls/call-metadata-sidebar.tsx:382`] | Nothing | **Copy button + ID display**, and a **key-value list** pattern. |
| Quality | Not observed | Flag Issue dialog (6 issue types), flags as waveform regions, Quality dashboard with an inline-editable status [P: `app/quality/*`] | `call-flagging` mockup only | Sarj is ahead. The system should still own the **flag marker** on the player. |

### 3.2 Scenario edit (ElevenLabs: agent editor)

| Aspect | ElevenLabs | Sarj product | Design system | Gap |
|---|---|---|---|---|
| Structure | 10 tabs: Agent, Workflow, Branches, Knowledge Base, Analysis, Tools, Tests, Widget, Security, Advanced [M: [294390cf](https://mobbin.com/screens/294390cf-8038-4610-996c-332a3734d536)] | Tabs: Scenario, Configuration, Schedule, Optimization (superadmin) [P: `scenarios/[scenarioId]/scenario-view-edit.tsx`] | `tabs` topic; the `scenario-single-screen` mockup (no ticket) tries a one-screen layout | The system has no position on **how a long config object is laid out** (tabs vs one scroll with anchors vs a settings rail). |
| Header | Name / branch switcher / "Live 100%" / Draft badge / `{ } Variables` / Preview / Publish split [M: [618baeaf](https://mobbin.com/screens/618baeaf-1522-4b97-92db-e61f36b76331)] | Name edited inline, Active/Archived badge, Run / Import / Delete | Nothing | **Page header pattern** (the product has 19 `<h1>` at three sizes). |
| Prompt | Large textarea, expand, AI-improve, `{{` inserts variables [M: [618baeaf](https://mobbin.com/screens/618baeaf-1522-4b97-92db-e61f36b76331)] | Lexical rich-text editor with variable chips; 3 separate `{{var}}` parsers [P: `components/rich-text-editor/*`] | `variable-mentions` mockup only; `variable`/`variable-background` are raw-hex tokens [DS: `globals.css:141-142`] | **Prompt editor + variable chip pattern.** Move `variable` onto a real token. |
| First message | "Interruptible" toggle sits on the first-message field itself | First message with an on/off switch; RTL for Arabic | Nothing | Pattern note: a setting that changes one field sits on that field. |
| Tools | Library + attach; system tools (end call, detect language, transfer to agent/number, keypad tone, voicemail) as toggles with a gear each [M: [91e14363](https://mobbin.com/screens/91e14363-35ec-4a12-8d4b-4b0d6a9c4ece), [4926af8f](https://mobbin.com/screens/4926af8f-a525-43f2-be83-0d1313cb169b)] | Nine tool types in a registry; HTTP tool with a full API-endpoint editor; transfer with warm/cold, working hours, DTMF [P: `components/scenario/tools/*`, `components/api-endpoint-editor/*`] | `transfer-routing` mockup only | **Key-value editor, code/JSON block, "test request" result** patterns. |
| Turn-taking | Turn eagerness, silence timeout 1–30 s, soft-timeout filler, max duration, per agent [docs: [conversation-flow](https://elevenlabs.io/docs/eleven-agents/customization/conversation-flow)] | Global/org only: EOU model, threshold, min/max wait, allow interruptions [P: `components/settings/turn-detection-settings.tsx`] | `eou-timing` and `call-turn-timing` mockups; their two `formatSeconds` disagree ("3.0s" vs "3s") | **Timing-value formatting rule** and a **slider + number setting row**. |
| Analysis config | Right rail on the Analysis tab: evaluation criteria, data points, analysis language, next to the results table; rows expand to show extracted values [M: [7071365d](https://mobbin.com/screens/7071365d-8de3-4587-bfb5-065632afb6d2)] | "Call Analytics & Data Collection": JSON-schema visual editor; success criteria on the Configuration tab [P: `components/scenario/data-extraction.tsx`, `components/json-schema-editor/*`] | Nothing | **Schema/field-list editor** pattern. |
| Save / publish | Drafts; "Review Changes" dialog with side-by-side diff and a version note; branches with traffic %; "someone published — Sync now" banner [M: [ff16450b](https://mobbin.com/screens/ff16450b-9de9-4c60-8738-770be8df0a5c), [bef0eb4f](https://mobbin.com/screens/bef0eb4f-240a-4751-895a-e56279440892), [cefd7b8a](https://mobbin.com/screens/cefd7b8a-df77-4216-9475-8a8b0fab8264)] | No versions or drafts. Sticky "unsaved changes" bar → diff dialog "Confirm your changes" (added/removed/modified) → saved live [P: `scenarios/scenario-submit-dialog.tsx`, `field-diff-list.tsx`]. Global settings and global prompts each have their own review-diff dialog. | One line on form actions [DS: `data.ts` ~476] | **Unsaved-changes bar + review-diff dialog pattern.** The product already has 7 files doing it 3 ways. Versioning is a product decision; the diff pattern is needed either way. |
| AI assist | AI-improve icon on the prompt | Scenario Copilot sheet: AI decisions, action required, opportunities, Apply/Dismiss [P: `ai-notes-sidebar.tsx`] | Nothing | Sarj is ahead. The system needs a **suggestion card** pattern (apply/dismiss). |

### 3.3 Scenarios index

| Aspect | ElevenLabs | Sarj product | Design system | Gap |
|---|---|---|---|---|
| List | Name, Created by, Created at; filters Creator, Archived; row overflow menu [M: [02042d42](https://mobbin.com/screens/02042d42-1cb8-47ba-89d5-c8c99e719d7c)] | Name, Languages, Status, Created, Last update at/by, Success criteria; Active / Recently deleted | `index-page`, `tables`, row-action rules | Covered. The product breaks the language-chip rule (3 renderings). |
| Retire | Archive, with an Archived filter | Delete → Recently deleted → Restore / Delete permanently | Nothing on soft delete | **Soft delete / restore** pattern. |
| Create | Template band on the list + template gallery that previews the workflow graph, then a 3-step wizard [M: [ebc17c84](https://mobbin.com/screens/ebc17c84-6c86-44ce-9e2b-5345f71d69f1), [88ed2c5d](https://mobbin.com/screens/88ed2c5d-b81f-4194-b364-e47aec63b506)] | AI generator ("Describe your voice agent" + chips) → generating screen; or a step wizard Industry → Use case → Name [P: `scenarios/auto-generate/*`, `scenarios/new/*`] | `multi-step-create` and `stepper` topics; the product has no Stepper and uses Progress | **Template gallery** and **AI-generating progress** patterns. |

### 3.4 Personas

| Aspect | ElevenLabs | Sarj product | Design system | Gap |
|---|---|---|---|---|
| Voice | A list on the agent (primary + additional voices); Expressive mode opt-in; Voice Design generates 3 candidates to audition [M: [7f50c3a2](https://mobbin.com/screens/7f50c3a2-42a9-4dae-9939-d48ea5fcd1ca)] | One voice, filtered by language and gender; speed slider when the TTS supports it [P: `components/voice-selector.tsx`] | `add-voice`, `personas-depth` mockups | **Voice option row** (name, tags, preview) and **audio preview button**. The product has 3 hand-rolled `new Audio()` previews. |
| Pronunciation | Uploaded `.pls` dictionaries [docs: [pronunciation](https://elevenlabs.io/docs/eleven-agents/customization/voice/pronunciation-dictionary)] | Word → replacement table, search, bulk upload [P: `agents/components/pronunciation-*.tsx`] | `persona-pronunciation` mockup | Sarj is ahead. The system lacks a **file dropzone** (4 in the product). |
| Behaviour | Soft-timeout filler at the agent level | Backchannel, filler words, background noise, end-on-silence [P: `components/settings/*`] | `listener-cues`, `phrase-mappings` mockups | Sarj is ahead. **Settings row** is the missing pattern (22 product files, two shapes). |

### 3.5 Knowledge bases

| Aspect | ElevenLabs | Sarj product | Design system | Gap |
|---|---|---|---|---|
| Add content | Four action tiles: Add URL / Add files / Create text / Create folder. URL dialog has Single URL / Sitemap / Whole website. **RAG storage meter** [M: [67e87818](https://mobbin.com/screens/67e87818-fd79-43a6-a0e3-cc6d795f7478), [9b4931a8](https://mobbin.com/screens/9b4931a8-d847-4956-b7b5-5ef236ef371e)] | Add files (.pdf/.docx/.txt/.md, with "images were not read" warnings), Add text. No URL source [P: `knowledge-bases/[kbId]/*`] | `knowledge-base` mockup; `FileCard` custom component | **Dropzone**, **usage meter**, and **processing status** (extracting / ready / failed) in the status system. |

### 3.6 Playground

| Aspect | ElevenLabs | Sarj product | Design system | Gap |
|---|---|---|---|---|
| Live test | Full-screen preview: orb, mute, live transcript, end state "Agent ended the call" → New conversation / View details; history drawer of past tests [M: [5de031ac](https://mobbin.com/screens/5de031ac-ea60-46c7-869a-32b443d38647)] | LiveKit room, voice ↔ chat switch with confirm, template-variable input form, live transcript, thumbs rating at the end. No latency or debug panel [P: `app/(playground)/*`] | Nothing. No playground mockup | **Live-call state** (connecting, live + elapsed, ended, failed) and the live transcript. |
| Automated tests | Tests tab: simulated conversations, pass/fail with rationale, tool calls with the parameters the LLM extracted, retry failed / retry all [M: [d9cd8778](https://mobbin.com/screens/d9cd8778-5d88-4b16-92a0-c548cd1e67b6)] | None | Nothing | A product decision first. If it is built, it reuses the transcript and evaluation-result patterns above. |

### 3.7 Integrations and settings

| Aspect | ElevenLabs | Sarj product | Design system | Gap |
|---|---|---|---|---|
| Phone numbers | Empty state → Import from Twilio / SIP in a sheet; each number has an assigned agent and an Outbound call button [M: [9bbe934b](https://mobbin.com/screens/9bbe934b-020d-4da6-a9e8-f0d8c94d171f), [abc6f139](https://mobbin.com/screens/abc6f139-f0bd-471a-af75-563f9bf22e22)] | Read-only table for org users. Admins get a 6-step SIP connection wizard, trunks, Kamailio state, call activity [P: `app/phone-numbers`, `app/admin/phone-numbers/*`] | `phone-numbers` mockup | **Phone number display** rule: format and `dir="ltr"`. Only messaging formats numbers today. |
| Integrations | Marked Alpha; integration tools appear in the tool library | Cards + modal; Salla per-event automations; Zoho webhook table | `connected-apps` mockup | Covered by existing patterns. |
| Credentials | — | API keys shown once; auth connections with test / rotate / "fix now"; variables with secret show/hide [P: `app/api-keys`, `app/authentication`, `app/variables`] | `connected-apps` token table | **Secret value** display rule: masked, reveal, copy, never in a toast. |

---

## 4. Component matrix — product vs design system

This is the core of the audit. One row per component or pattern. "Prim" is a file in
`src/components/ui`, and "Shared" is a block in `src/components/shared` (only `icon`, `data-table`
and `figure` exist). "Topic" is a `/design-system` page.

### 4.1 Shared primitives that behave differently

| Primitive | Product | Design system | Difference that matters |
|---|---|---|---|
| Button | `h-9` default, sm `h-8`, lg `h-10`; destructive solid; outline has `shadow-xs` [P: `ui/button.tsx:20-27`] | `h-8`, sm `h-7`, lg `h-9`; destructive is a `/10` tint | **The whole control scale is one step apart.** |
| Input / Select | `h-9`, `rounded-md`, `px-3` | `h-8`, `rounded-lg`, `px-2.5` | Same. |
| Badge | Extra `success`/`warning`/`info`/`error`/`primary` on raw Tailwind colours; destructive solid. 70 files use it. | No intent variants, though `--*-tint` tokens exist | **The system should ship the intent variants on its tint tokens.** |
| Dialog, Popover, Menu | `p-6 rounded-lg`, `p-4 rounded-md`, item `py-1.5` | `p-4 rounded-xl`, `p-2.5 rounded-lg`, item `py-1` | Density differs throughout. |
| Sheet | Widths ad hoc: 6xl, 4xl, lg, `w-80` | `drawer` topic: 384px, built on `Drawer` (vaul), which the product lacks | Pick Sheet or Drawer; define two widths. |
| Spinner | `size` sm/md/lg, default 48px | fixed 16px | — |
| Field vs Form | `form.tsx` (react-hook-form) in 24 files; `field.tsx` in **0** | Teaches `Field` only | **The system documents a form layer the product does not use.** |
| Engine | 22 of 41 shared primitives are Base UI (`render` prop) | Radix (`asChild`) | Known; the registry install breaks on it (AGENTS.md). |

`table.tsx` and `empty.tsx` are identical on both sides.

### 4.2 Primitives only one side has

- **Product only (12):** `segmented-control` (7 files), `multi-select` (6), `timezone-select` (5),
  `time-picker` (4), `animated-tabs` (3), `date-time-picker`, `date-time-range-picker`,
  `filter-chip`, `labeled-toggle`, `waveform-player`, `siri-orb`, `form`. The first six are real,
  repeated needs the system has no answer for.
- **Design system only (33):** includes `drawer`, `stepper`, `pagination` and `combobox`, which
  its own topics are built on and the product does not have. The product uses Sheet, Progress,
  its own cursor pagination, and Popover + Command instead. 11 more are imported by nothing:
  `animated-beam`, `currency-sky-background`, `direction`, `fluid-orb`, `mesh-orb`,
  `multi-step-loader`, `message-scroller`, `orbkit-core`, `shdr-31`, `shdr-31-sarj`,
  `text-inline-chip-reveal`.

### 4.3 Patterns with no owner on either side

Ranked by how many times the product builds them. Counts are greps.

| # | Pattern | Product | Mockups | ElevenLabs has it | Proposed decision |
|---|---|---|---|---|---|
| 1 | **Filter bar** (search, selects, active chips, clear) | ~16 files | `conversations-revamp` hand-rolls one | Yes, "+ filter" chips | Topic + shared block |
| 2 | **Copy button** (copy → check state) | 14 sites, 5 hand-rolled states | — | Yes | Shared block |
| 3 | **Status badge** (status → intent → tint, icon rule, live state) | 7 components + ~6 inline maps, 5 paint systems | 3 `StatusBadge`s + severity/priority/sentiment | Yes | Badge variants + topic + shared block |
| 4 | **Value formatting** (date, duration, latency, count, file size, phone, empty value) | ~10 date formatters, 3 duration formats, `"—"` ×24 / `"-"` ×13 / `"N/A"` ×4 | 4 date formats, 7 formatters, two `formatSeconds` that disagree | — | Foundation topic + `src/lib/format.ts` |
| 5 | **Searchable picker / multi-select** | 8 implementations | — | — | Document Combobox for single and multi |
| 6 | **Empty state** usage | ~12 hand-rolled despite `Empty` | 14 files use `Empty` correctly | Uniform: icon, title, reason, action [M: [4926af8f](https://mobbin.com/screens/4926af8f-a525-43f2-be83-0d1313cb169b)] | Topic exists; enforce |
| 7 | **Settings row** (label, description, control) | ~22 files, two shapes | Several | Yes | Topic (Item vs Field decided once) |
| 8 | **Transcript** | 5 renderers | 2 forks | Yes, with latency | Voice topic + shared block |
| 9 | **Code / JSON block** | 10 `<pre>` + `json-data-display` | — | Yes (JSON diff, tool params) | Shared block |
| 10 | **Review diff before save / publish** | 7 files, 3 flows | `roles-permissions` confirm | Yes | Topic |
| 11 | **Page header** | 19 `<h1>` at 3 sizes | Shell title | Yes | Topic |
| 12 | **Table container / header** | ~5 header treatments, 4 wrapper radii | `DataTable` used by 10 files | — | Shared block exists; ship to product |
| 13 | **Time-range filter** | 4 variants | — | Date before/after chips | Part of the filter-bar topic |
| 14 | **File dropzone** | 4 | — | Yes | Shared block |
| 15 | **Recording player** (+ markers) | 1 player + 3 preview buttons | 2 forks | Yes | Voice topic + shared block |
| 16 | **Stat tile** | 7 tiles on 2 pages, with shadows | — | — | Part of a charts topic |
| 17 | **Language display** | 3 renderings | 3 `dir` heuristics (one leaves Urdu LTR) | Default + additional languages | Existing LANGUAGES rule + Arabic content topic |
| 18 | **Variable token** `{{x}}` | 3 parsers + Lexical node | `variable-mentions` | `{{` inserts | Topic + real token |
| 19 | **Multi-step wizard** | 2 flows, no stepper | `personas-depth` wizard | 3-step create | Topic exists; product lacks Stepper |
| 20 | **ID display** (mono + copy) | ~4 | — | Conversation ID in header | With #2 |

**Not a pattern today:** bulk row selection. No product table has a select-all or
indeterminate state, so the system should not add one until a ticket asks.

### 4.4 Tokens

| Token | Product | Design system |
|---|---|---|
| Core palette, `--radius` | Same values | Same values |
| `--*-tint`, `--info*` | **Missing**; `badge.tsx` fills the gap with raw colours | Defined |
| `--z-*` (9 layers) | **Missing**; `z-40` ×30, `z-10` ×26, `z-50` ×2, `z-[9999]` ×1 | Defined + lint rule |
| `--chart-1…6` | Stock shadcn (orange, teal, blue, yellow, amber) | Primary first, then 5 separate hues |
| `--ease-out-cubic` | `cubic-bezier(0.33,1,0.68,1)` | `cubic-bezier(0.215,0.61,0.355,1)` |
| Shadows | 92 `shadow-*` outside `ui/` | Banned by lint |

---

## 5. The design system against itself

### 5.1 Where the docs contradict the code

| # | The docs say | The code says |
|---|---|---|
| a | Charts are "one purple ramp, never a rainbow" — AGENTS.md:182, `sarj-lint:54`, `sarj-mockup:145,290`, `sarj-no-slop:34`, `sarj-brand:294` | `globals.css:79-108`: six separate hues since DES-174; the comment says the ramp was replaced |
| b | Help text in a drawer is an (i) tooltip — `data.ts:438-441`, `sarj-no-slop:111-116,303` | AGENTS.md house pattern and `ui-review:24` both say inline `FieldDescription`. The AGENTS.md note blaming `ui-review` is stale; the stale one is `sarj-no-slop` |
| c | Scrollbars: "one width and one token" (`data.ts:57-62`) | `globals.css` hides every scrollbar |
| d | Shadows: "one shared set" (`data.ts:44`); `sarj-brand` prescribes `shadow-xs`/`sm` | `no-shadow` bans them all |
| e | Radius: buttons and inputs are `rounded-md` (`foundation-tables.tsx`) | `ui/button.tsx`, `ui/input.tsx`, `ui/select.tsx` use `rounded-lg` |
| f | "61 shadcn primitives" (AGENTS.md, `sarj-lint`) | 74 files in `src/components/ui` |
| g | Inputs 36px (`sarj-brand:230`) | `control-scale`: 32px |
| h | AGENTS.md colour list: "there are no others" | Omits `info` and the `*-tint` tokens; `globals.css:128-142` also holds raw-hex `manafa-*`, `tailwind-black`, `variable` (a blue next to `info` blue with a different meaning) |
| i | Motion ≤300 ms, two curves, reduced motion always | `--animate-fade-in` 500 ms, `--ease-sidebar` a third curve, `.highlight-pulse` 1 s with no reduced-motion guard. CSS is not linted |
| j | Destructive actions confirm every time (`ui-review:38`) | `model-catalog` deactivates with an undo toast by design |
| k | Drawer is one surface | Mockups use `Sheet` ×4 and `Drawer direction="right"` ×4; `right` is a physical side |

### 5.2 Mockup code that should be shared

| Block | Duplicated in |
|---|---|
| RecordingPlayer + `formatTimeSeconds` | `behavioral-alerts/recording-player.tsx`, `conversations-revamp/drawer/recording-player.tsx` |
| TranscriptPanel, TurnRow, search highlight | `behavioral-alerts/transcript-panel.tsx`, `conversations-revamp/drawer/transcript-views.tsx` |
| Call detail section register | `behavioral-alerts/section-register.tsx` (668 lines) vs `conversations-revamp/drawer/section-register.tsx` (764) |
| CallHeader | `behavioral-alerts/call-drawer.tsx:264`, `conversations-revamp/drawer/call-shell.tsx:44` |
| StatusBadge / tone map | `connected-apps`, `knowledge-base`, `conversations-revamp`, `behavioral-alerts`, `call-turn-timing` |
| Language → `dir` | `scenario-single-screen` (ar + ur), `variable-mentions` (ar only — Urdu stays LTR, a bug), `v2/prompt-builder` (a prop) |
| Tables not on `DataTable` | `model-catalog`, `persona-pronunciation`, both `scenario-single-screen` config drawers |

### 5.3 Coverage holes that are not voice-specific

- **Toasts:** no rules for when to use a toast rather than inline feedback, for copy, duration or
  undo. One mockup puts a secret in a toast description (`connected-apps/create-token-dialog.tsx:228`).
- **Accessibility:** the page has two rows. It is missing contrast per token pair, the
  24 px hit-target floor (17 `icon-xs` buttons), icon-button naming, heading levels, live
  regions for call status, and an audio keyboard map.
- **Content:** it lives only in `sarj-no-slop`, a skill for agents. The written system has no
  Content section: product nouns, error and empty copy formulas.
- **Arabic content:** `ui-review:15` tells reviewers not to flag RTL. For an Arabic-first product,
  that waiver should cover UI mirroring only, not Arabic text inside the UI. No page covers
  `dir="auto"`, bidi isolation, the Arabic fallback font (Nunito has no Arabic glyphs —
  *inferred*), or numerals.
- **Pagination:** it is a written pattern, yet no mockup shows it and the `Pagination`
  primitive is unused.

---

## 6. Recommended design-system fixes, in order

Ranked by reach × how fast it drifts ÷ effort. Each item is sized as one ticket.

| # | Fix | Size | Why now |
|---|---|---|---|
| 1 | **Correct the six documentation contradictions** (§5.1 a–h): chart wording, help-text rule, scrollbars, shadows, radius, primitive count, token list. | S | Agents follow these skills today and build monochrome charts and (i) tooltips against the rules. |
| 2 | **Decide the control scale.** Either the system moves to the product's 36 px default, or the product migrates to 32 px. Record the decision in `control-scale`. *Needs a design-lead decision.* | S to decide | Every registry install is off by one step until this is settled. |
| 3 | **Intent Badge + Status topic.** Add `success`/`warning`/`info` Badge variants on the tint tokens. Write one status map (call, live call, batch, flag, source, token, connection, report) with icon rules and the live signal (dot + elapsed time, reduced-motion safe). Ship the tint tokens to the product. | M | 5 paint systems in the product, 4 in mockups. |
| 4 | **Formatting foundation + `src/lib/format.ts`.** One date format with relative-time rules; `m:ss` / `h:mm:ss` durations; latency in ms under 1 s and one decimal above; counts; file size; phone with `dir="ltr"`; one empty-value glyph; `tabular-nums` on numeric columns. | M | ~10 formatters in the product, 7 in mockups, two disagreeing for the same ticket. |
| 5 | **Voice pattern group + shared blocks:** `RecordingPlayer` (markers for flags and alerts, speed, keyboard, unavailable state), `Transcript` (speaker roles, tool rows, per-turn latency, search, seek, follow the playhead), `CallHeader`, and a metadata key-value list. Promote from the two mockup forks with one data model. | L | It is the product's core surface, and the largest block of duplicated UI. It is also where ElevenLabs is visibly ahead (per-turn latency). |
| 6 | **Filter bar + time range + copy button + page header** as shared blocks and topics. | M | The top two repeated patterns in the product. |
| 7 | **Review-diff pattern:** unsaved-changes bar, review dialog (added / removed / modified), optional note, and a concurrent-edit banner. Versioning stays a product call; the pattern is needed either way. | M | 7 product files, 3 flows. |
| 8 | **Arabic content page:** `dir="auto"` for user content, one `languageDir()` (ar, ur → rtl), bidi isolation, fallback font and line height, numerals. Narrow the `ui-review:15` waiver to UI mirroring. | S | An Arabic-first product with no Arabic rule, and a live Urdu bug. |
| 9 | **Charts + stat tile rules:** which chart for volume, outcomes and latency distribution; axes and grid on `border`/`muted-foreground`; empty and partial charts; the tile anatomy. | M | Six chart tokens and no rules; the product's tiles use shadows. |
| 10 | **Forms decision:** document `Form` (react-hook-form) beside `Field`, or state that `Field` replaces it. Add the **settings row** shape (label + description + control, slider + number). | S | The system teaches a form layer the product never uses. |
| 11 | **Pickers:** Combobox for single and multi; time, timezone and date-range pickers either as primitives or documented compositions. | M | Six product-only primitives exist because the system has no answer. |
| 12 | **Destructive + toast page:** confirm vs undo (settle `model-catalog` vs `ui-review:38`), dialog copy formula, toast types, and no secrets in toasts. | S | Two rules already conflict. |
| 13 | **Editors:** long-prompt editor, `{{variable}}` chip spec on a real token, code/JSON block, key-value editor. | M | The product has three editors and three variable parsers. |
| 14 | **Hygiene:** delete or document the 11 dead primitives; lint motion in `globals.css`; pick Sheet or Drawer with a logical side; give `scenario-single-screen` a ticket or drop v1. | S | Keeps the numbers honest. |
| 15 | **Accessibility and Content sections** expanded as in §5.3. | M | Needed before any external audit. |

Patterns from ElevenLabs worth adopting when their tickets arrive (structure only, never style):
- per-turn latency chips and inline tool rows in the transcript;
- evaluation criteria with a pass/fail and a reason each;
- definition and results on one screen for analysis;
- a setting that changes one field sits on that field (Interruptible on the first message);
- system tools as one toggle list with a gear per tool;
- a template gallery that previews a template's structure;
- a uniform empty state (icon, title, reason, action).

Don't take: promo cards inside working screens, ten editor tabs mixing deployment with agent
config, or long filter-chip rows with no grouping.

---

## 7. What was not checked

- **ElevenLabs in-app walk.** Pending until browser access is available. The following are not
  captured on Mobbin and are unverified: the in-editor voice settings (stability, speed), the
  Users page, some Advanced sections, Settings, Developers and WhatsApp. Everything in §3 marked
  [M] is from Mobbin captures dated Mar–Apr 2026 and may have changed.
- No route was rendered, and no lint, typecheck or screenshot was run on either repo. UI claims come from source.
- The product audit reads the code; it does not know which admin screens real users see
  most.
- Whether the product mixes inline help and (i) tooltips on one screen was not checked per
  screen.
