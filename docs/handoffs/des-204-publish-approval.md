# DES-204 — Publish approval: handoff for PLT-4477

Mockup: `/publish-approval` (design lab). Spec: the "Publish approval"
requirements doc under INT-253, and its two mockups (Approvals page, bell).
Builds on DES-202 (`/config-versioning`): versions, the version in use,
history.

**Scheduling (TDD, 22 Oct 2026).** The TDD "Live scenarios and configuration
versioning" makes approval a feature of its own, shipped **after** live and
versioning. The first release has no approval. This design was aligned with
the TDD's decisions on 22 Oct 2026; its own open questions (below) are for
when the feature is picked up.

The mockup holds one shared state. Use "Viewing as" to switch between the
requester (Ahmad Khalil, Sarj) and the client approver (Yusuf Al-Amri, Riyad
Bank). A request sent as Ahmad can then be approved or rejected as Yusuf. The
state select jumps straight to each case.

## Decisions recorded

| Question | Decision |
|---|---|
| **Who approves on the client side** (open in the PRD; depends on INT-93 / INT-32) | **Assumed:** a member of the client organization who holds an "Approve changes" permission. Every holder is notified, and the first one to decide settles the request. Sarj staff cannot approve a client's scenario (the PRD rules out any bypass). **Needs confirming with the access model work.** |
| What is gated | **Live scenarios only.** The global prompt has no versions in the first releases (TDD), so the global prompt request and the super admin approver were removed on 22 Oct 2026. |
| Turning a scenario live | **Never needs approval** (TDD 3.1): only the live permission. It doesn't change the version in use either. This was the PRD's open question. |
| Who can request | Anyone who can edit the scenario. A view-only user sees Request approval greyed, with the tooltip "You can view this scenario but not change it". |
| What does approving do | **It publishes.** The button is "Approve and publish", and the version goes in use on approval. There is no separate publish step that someone could forget to do. The toast ("v14 is in use") offers Undo, which puts the request back to waiting and the old version back in use. |
| What is the summary compared against | **The version in use**, not the version it was edited from. The client approves what *their callers* will notice, so a request covering v13 and v14 is summarised as v12 → v14. |
| One request or several | **One waiting request per scenario.** Sending a new one withdraws the old one, and the dialog says so before sending. |
| Saving while a request waits | The request stays **pinned to its version**, so the client approves exactly what they read. The save review says "It isn't added to the request for v14". The editor row then says "v15 was saved after the request and isn't in it" and offers **Request v15 instead**. |
| Applying an older version | Applying is a publish, so it also needs approval. In History, a live scenario's Publish and Apply buttons are both replaced by **Request approval**. While a request waits, History says so instead of offering another. |
| Reject | A reason is required. It is written inline at the top of the record, not in a dialog over the drawer (one overlay at a time). The requester sees the reason in the editor row until they send the next request. |
| Withdraw | Only the requester can withdraw. It happens straight away, with Undo in the toast, because a request can always be sent again. |

## What each person sees

**Requester — scenario editor.** The row under the header (DES-202's
"unpublished" row) carries every approval state:

- Saves ahead of the version in use, nothing requested: "v13 to v14 aren't
  in use yet · Callers hear v12 until Riyad Bank approves a newer version." →
  **Request approval**.
- Waiting: "v14 is waiting for Riyad Bank's approval · Requested by you, today
  09:10 · waiting 5 hours. Callers hear v12." → **View request**.
- Saved again while waiting: see above → **View request**, **Request v15
  instead**.
- Rejected: "Yusuf Al-Amri rejected v14", then the reason in quotes →
  **View request**, **Request approval**.
- Approved: no row. The header line reads "Version in use published by
  Yusuf Al-Amri, just now".

**Request dialog** (448px). The description says who is notified and when
callers hear it. It has two required fields:

- **Summary**: generated, editable, with an (i) hint that it is compared with
  the version in use.
- **Why it's needed**: the requester's note.

The dialog opens with the cursor in the note.

**Approver — Approvals page** (new nav item under Monitor, with the count of
requests waiting on this viewer). It has two tabs:

- **Waiting**: Change, Requested by, Raised, Waiting.
- **Closed**: adds Outcome and Closed by.

Both tabs have search and a "Requested by" filter. Sarj staff also see an
Approver column (the client). A client sees only their own organization's
requests.

**Review record** (1024px, ↑ ↓, actions in the header). It is read in this
order:

1. What callers will notice.
2. Why it's needed, from the requester.
3. Affects, and the version change (v12 → v14).
4. **Show exact changes**: a side-by-side diff of the version in use against
   the requested one.

The header actions depend on who is looking:

- **Approver:** Reject, and Approve and publish.
- **Requester:** Withdraw.
- **Anyone else:** both decision buttons greyed, with the tooltip "Only Riyad
  Bank's approvers can decide".

**Notifications.** A bell in the top bar shows an unread count, as in the PRD
mockup:

- Approvers are told a request is waiting.
- Requesters are told theirs was approved or rejected.

Clicking a notice opens the record. "View all in Approvals" opens the page.
The email is meant to say the same as the notice and link to the record.
**The email itself is not designed here.**

**Scenarios index.** A live scenario with a waiting request gets an
**In review** chip next to its Live badge. Hovering it shows the version and
how long it has waited.

## States

| State | Behaviour |
|---|---|
| Summary still writing | The summary field shows "Writing summary" with a spinner. The note can be typed meanwhile. Sending waits until the summary exists. |
| Summary couldn't be written | Callout "Couldn't write a summary". The requester writes it, and sending is blocked until they do. |
| Missing note or summary | Errors on the label line: "Say why Riyad Bank needs it." / "Write what callers will notice." |
| Send fails | Callout in the dialog: "Couldn't send the request. Nothing reached Riyad Bank." The typed text is kept, and the button becomes Try again. |
| Approve fails | Callout in the record: "Couldn't approve v14. Callers still hear v12. The request is still waiting." The button becomes Try again. |
| Approvals loading | Skeleton rows. |
| Approvals fail to load | "Couldn't load requests" with Try again. |
| Nothing waiting / nothing closed / no match | "Nothing waiting for approval" / "No closed requests" / "No requests match" with Clear filters. |
| No permission | View-only: Request approval greyed. Not the approver: the decision buttons are greyed with a tooltip naming who decides. |

## Acceptance criteria this design maps to

- No version reaches a live scenario's callers without an approval: Publish
  and Apply are gone from live scenarios, and only Approve and publish puts a
  version in use.
- A request cannot be sent without a note: "Why it's needed" is required.
- The requester sees and can edit the summary before sending: it is an
  editable field in the dialog.
- The client is notified by email and in the platform: the bell and Approvals
  page (the email is not designed).
- The client sees an effect-focused summary, with exact changes on expand:
  the record's read order.
- A request never expires and never publishes on its own: nothing in the
  design does either, and "Waiting" counts up.
- The record shows when the request was raised and how long it has waited:
  the Raised and Waiting columns, and the record's status line.

## Open, not designed here

- **Approver role.** The assumption above needs a decision from INT-93 /
  INT-32.
- **A requester who is also an approver.** Can they approve their own
  request? No one in the mockup is both, so it is not shown. This is a call
  for the PM.
- **Email content and layout.**
