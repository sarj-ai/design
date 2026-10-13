# DES-202 — Configuration versioning: handoff for PLT-4477

Mockup: `/config-versioning` (design lab). Spec: the "Configuration versioning"
requirements doc under INT-253. Builds on DES-203 (`/live-scenarios`, status-menu
header). Approval is DES-204 and is not designed here.

## Decisions recorded

| Question (from the PRD / ticket) | Decision |
|---|---|
| Is a scenario versioned as one item or in parts? | **One item.** One save = one version number for the whole scenario. The summary names which parts changed. Rolling back restores a combination that actually ran together, never an untested mix of parts. |
| What does "restore" do on a live item? | Two actions, named apart. **Publish vN / Roll back to vN** moves the live marker (no new version). **Edit from here** opens vN in the editor; saving makes a new version on top, recorded as edited from vN. On a not-live scenario only Edit from here exists. |
| Turning live off while the marker is behind newer saves | Asks first: "Turn off live? The latest version starts running instead of the live one from the next call, without a publish." Only shown when the marker is behind; otherwise it toggles straight away, with Undo. |
| How versions are named on screen | **The editor never shows a version number.** It names two versions: **the live version** (what callers hear) and **the latest** (the newest save). Numbers appear only in History, where you pick one; there the newest carries a **Latest** badge and the marker a **Live** badge. Changed after review on 13 Oct 2026 (Fatma: a screen with v9, v12, v13 and v14 at once was confusing). Langfuse's `production` / `latest` labels are the model. |
| Trying a version without publishing it | **Test in Playground** on every version in History opens it in the Playground. It makes no version and moves no marker, so view-only users can use it too. Requested in review on 13 Oct 2026; **not in the PRD**. |
| Unpublished marker on the scenarios index | Not in this ticket. Editor only. DES-204 adds pending approval to the index. |

Decided with Vansh on 12 Oct 2026; naming and Test in Playground revised
after Fatma's review on 13 Oct 2026. Still to review with Nasr Maswood and the
delivery team (ticket success criterion), and to align with the TDD once it
exists.

## What the user sees

**Editor header** (DES-203's status-menu take). Under the title, one line:
`Live version published by Sami Rahman, yesterday 16:40`. On a not-live
scenario: `Saved by You, today 14:02`. History sits beside the Live button. The global
prompt has no Live button (always live) — only History.

**Live menu.** Under the Live switch: "Turned on by Nouf Al-Harbi, 28 Sep"
(or "Turned off by …"). Toggling makes no version, so this is where the PRD's
record of who toggled it and when shows.

**Unpublished row.** On a live item whose newest version is ahead of the marker:
"Unpublished changes · 2 saves since the live version. Callers don't hear them
yet." with **Review and publish**. Absent when there is nothing to publish.

**Editing an older version** (after Edit from here): an alert above the fields,
"Editing an older version · Nouf Al-Harbi, 28 Sep. Saving makes it the latest;
nothing is lost." with **Back to latest**.

**Save.** Unchanged entry (save bar → review drawer, 448px, line diff), with one
line that says what the save does:
- Live / global prompt: "Callers keep hearing the live version until you publish."
- Not live: "It runs from the next call."
- Button: **Save**. Toast: "Saved".

**History** — record drawer, 1024px. The header names the live number
("Branch visit survey · Live: v12"). List newest first: number, author, time,
summary; on live items a **Live** badge on the marker, **Latest** on the newest
save while it isn't live, and **Was live** on any version that has been live.
Each version offers **Test in Playground**, **Edit from here**, and Publish or
Roll back. No filter: the PRD's "filterable to your own
versions" was cut on 13 Oct 2026, since every row already names its author
and a scenario's history is short — confirm with the PM. The pane compares the
selected version side by side with the version it was edited from (default),
or any version picked in "Compared with". Unchanged fields are listed in one
line, not drawn.

**Publish / roll back** happen in the history pane, with the comparison on
screen. Review and publish opens history on the newest version compared with
live. Toast "v14 is live" with Undo (moves the marker back). Rollback toast:
"Rolled back from v14. No version was made."

## States

| State | Behaviour |
|---|---|
| Summary still generating | "Writing summary" with a spinner in the list and the pane. The save is never blocked. |
| Summary generation failed | "No summary — compare to see the change". |
| Concurrent save | In the save review: "Ahmad Khalil saved a newer version while you were editing. Saving now leaves out their change: '…' Both stay in history." The diff is against their version, so their change shows as removed. Button becomes **Save anyway**. |
| History fails to load | Empty state in the drawer: "Couldn't load versions" + Try again. |
| Publish fails | Alert in the pane: "Couldn't publish v14. Callers still hear v12." The button becomes Try again. |
| View only | Fields greyed; Review and publish, Publish, Roll back and Edit from here greyed with a tooltip "You can view versions but not change them". History stays readable. |
| Loading | Skeleton list and pane while versions load. |

## Acceptance criteria this design maps to

- Saving creates a version on live and not-live alike — save review, Save vN.
- Not live: no publish action, newest runs — no unpublished row, no Publish in history.
- Live / global prompt: saving doesn't change callers; publishing is separate — save line + unpublished row.
- The live version can be older than the newest and both are visible — header line + unpublished row + badges.
- Moving the marker makes no version — rollback toast and pane line say so.
- Editing an earlier version makes a new version on top, recorded as edited from it — Edit from here + "edited from vN" in history.
- Summary compares against the edited-from version — default comparison in the pane.
- Published versions can't be edited or deleted — no edit or delete on any version; Edit from here always makes a new one.
- Stale save warns first — concurrent-save alert.
- Failed or slow summary doesn't block the save — states above.

## Open, not designed here

- Who may publish. Assumed: anyone who can edit (approval is DES-204). Who may
  toggle live depends on INT-93.
- Telephony, persona and organization settings (PRD non-goals).
