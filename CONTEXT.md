# Handoff — Conversations v2 (Agent Actions: Schedule Outbound Calls)

Read `AGENTS.md` first for how the workspace works. This file is the state of
*this* piece of work: what was decided, what is built, and the one question
still open.

---

## The ticket

`prd.md` in the repo root is the full PRD — **Agent Actions: Schedule Outbound
Calls**. One sentence: the agent can now book its own follow-up call.

It touches three surfaces, but **Fatema settled the scope in Slack**:

> Vansh: "just want to ask if the new addition in this design will have old
> design or will have full new revamp"
> Fatema: "its just conversations page that will be designed. The other parts r
> using existing design"

So:

| Surface | Design work |
|---|---|
| Schedule Callback tool config (Scenario → Agent Tools) | **None.** Existing design. |
| Post-call analyst output (call detail panel) | **None.** Existing design. |
| **Conversations page** | **This is the whole deliverable.** |

The PRD names one field the mockups never showed: a **"does this callback need
human agent support"** checkbox on the tool config, which restricts scheduling
to working hours. It belongs to a surface that is out of design scope, so it is
not built here — just don't lose it.

---

## The design problem

A scheduled call is a call **that has not happened yet**, sitting in a table
built for calls that have. It has no duration, no outcome, no recording, no
transcript. What it does have is a time in the future, a reason, and one action:
cancel it.

**Careful with one argument.** I originally claimed a queued call's future
timestamp scrambles the table's sort. That is weaker than it sounds — the Time
column is *created at*, not *scheduled for*, so a queued call sits at the top of
a descending list and stays there until it fires. Don't lean on it.

---

## SETTLED — one table, one drawer

Vansh, Aug 10: *"make it like how normally it will work."* So the Upcoming zone
is gone and scheduled calls are **rows in the one table**, which is how the PRD
mockup draws it and how the page already behaves — the table carries `queued`
and `dialing` rows today, because batch calls sit in the same queue.

The two options that lost: a separate "Scheduled" drawer (hides the bookings the
PRD says get missed) and the Upcoming zone (ate ~40% of the viewport).

---

## What is built right now

The route is **`/conversations-revamp`**. It was `/conversations-v2` when this
file was first written, and it is no longer the only mockup in the workspace —
`src/lib/mockups-data.ts` is the current list.

```
src/app/conversations-revamp/page.tsx          route and state
src/components/conversations-revamp/list/
  conversations-page.tsx  the page itself
  call-table.tsx          bulbul's table + the Source column + the dial time
  search-filters.tsx      bulbul's filter bar + the Source filter
  status-badges.tsx       Source / Status / Outcome chips
  status-filter.tsx, status-help.tsx, fields-dropdown.tsx
  icons.tsx               HugeIcons, named for the job
src/components/conversations-revamp/drawer/
  call-shell.tsx          bulbul's row drawer + the scheduling record
  cancel-call-dialog.tsx  Cancel, as a pop-up because it is one decision
  pre-call-panel.tsx, completed-schedule-summary.tsx, linked-call.tsx
  recording-player.tsx, transcript-views.tsx, section-register.tsx
  fourth-drawer.tsx, icons.tsx
src/lib/conversations-revamp-list-data.ts      the CALLS array
src/lib/conversations-revamp-drawer-data.ts    the drawer's record
```

The app shell is no longer copied per mockup: `src/components/app-shell.tsx`
and `src/components/mockup-shell.tsx` are shared by every route.

**Every field traces to a PRD line.** Vansh cut the rest on Aug 10 — the dial
time on the row, the pending count beside the results count, "booked from", the
agent's spoken promise, and the needs-a-human-agent note are all gone. Don't
reintroduce them without a line to point at.

How it behaves:

- **One list, one sort** — newest first by creation, unchanged. Everything still
  pending was booked today, so it leads the list without the sort needing to know
  anything about scheduling.
- **Clicking any row opens the drawer.** For a call with a scheduling record it
  gains one card: origin, dial time, reschedule-or-retry count vs limit, the
  context brief, and the analyst's confidence when it inferred the callback.
- **Cancel lives in that card** — behind a confirm naming the scheduled time, and
  **visibly disabled with a tooltip** on the dialing call, because the PRD's Q&A
  says the button deactivates once the scheduler is past the point of no return.
  A vanished action reads as a bug; a disabled one reads as a rule.
- Cancelling **does not move the row.** It flips to `Cancelled` in place, which
  is what every other terminal state on this page does. Tested end to end.
- The closing reason ("Retry limit reached…", "Cancelled by…") is a **tooltip on
  an info mark**, not inline text — a sentence in an eleventh column pushed
  Outcome and Duration off the screen.
- Source chips are **neutral outlines with distinct glyphs**. Status already
  carries severity and Scenario is already the brand chip; a third coloured
  column reads as three competing alarms.

---

## Workspace changes made this session — do not undo

- **Dark mode is gone.** `src/lib/review-settings.ts` and
  `src/components/review-settings.tsx` are deleted, the `.dark` token block is
  out of `globals.css`. **Keep `@custom-variant dark (&:is(.dark *))`** in
  globals.css — the 61 shadcn primitives are full of `dark:` utilities and that
  line binds them to a class nothing sets. Delete it and Tailwind falls back to
  `prefers-color-scheme`, turning the app dark for anyone whose OS is.
- **RTL is gone** too. No direction toggle, `<html dir="ltr">` is fixed. Keep
  writing logical properties (`ms-`, `pe-`, `text-start`) anyway — they cost
  nothing and make RTL possible if it comes back.
- **`npm run shots` takes one screenshot per route** → `screenshots/<route>.png`.
  No modes, no subfolders.
- **Mockups are committed** — Vansh reverted an earlier "mockups stay local"
  setup. `.gitignore` has no mockup rules, `bootstrap-registry.mjs` and
  `mockups-data.example.ts` are deleted. Don't reintroduce them.

---

## Reference

**The real product is at `~/Desktop/mvp/dev/office/sarj/bulbul`** (the
`sarj-ai/bulbul` GitHub repo). The Conversations page lives at
`typescript/packages/app/src/app/calls/`:

| File | What to take from it |
|---|---|
| `page.tsx` | breadcrumb, Export, admin banner, result count, pagination |
| `search-filters.tsx` | the toolbar and its order |
| `call-table.tsx` | column definitions and `DEFAULT_CALL_TABLE_VIEW` |
| `call-status-labels.ts` | all 14 statuses and 3 outcomes, verbatim |
| `call-detail-content.tsx` | the row drawer — header, player, tabs |
| `call-metadata-sidebar.tsx` | the metadata rail |

Today's Default View columns: `Time · User · Type · Direction · Phone Number ·
Scenario · Status · Outcome · Duration`. Detailed View adds `Data` (superadmin).
Ten columns overflow at 1440px — the real app scrolls horizontally and so does
this. `User` is capped at `max-w-28` because it is the same address on every row.

This workspace's remote is `github.com/vansh-nagar/Mock-up-repo` (private).

---

## PRD questions nobody has answered

Flag these rather than inventing answers:

1. **Where is the retry limit configured?** The PRD requires one, but the tool
   config only has *max reschedule attempts*. Different limits, different owners.
2. **What does the agent say when it refuses?** There is copy for a promise it
   can keep and none for one it can't — a customer asks for 11pm, the calling
   window closes at 9pm. The agent currently confirms a time the queue will
   silently move.
3. **The PRD contradicts itself on Cancel** — "unlikely… consider for v2" in the
   user journeys, a hard requirement in the monitoring section.
4. **Nothing groups pending calls except the sort.** Fifteen rows is fine. If a
   busy org books fifty, they still all sit at the top, but page 2 of the table
   would split them. A Status filter preset ("not called yet") is the cheap fix
   if it becomes a problem — not built, nobody has asked.

---

## Working notes

- Vansh wants replies **in points, short, conversational** — answer first, then
  why. See the `talk-like-a-human` memory.
- `npm run lint` must report **zero** problems. The ten `sarj/*` rules are real
  errors, not warnings.
- Verify with `npm run lint && npm run typecheck && npm run shots -- --routes
  /conversations-revamp`, then actually open the screenshot.
- State any addition that is not traceable to the PRD or a screenshot at the end
  of your reply.
