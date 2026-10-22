# DES-202 — Configuration versioning: handoff for PLT-4477

Mockup: `/config-versioning` (design lab). Spec: the TDD "Live scenarios and
configuration versioning" (Fatma Moanes, 22 Oct 2026), and Fatma's design
feedback on DES-202 the same day. It builds on DES-203 (`/live-scenarios`), the
live switch, badge and warning, which ships first. Approval is DES-204, a
separate feature after both, and the first release has none.

Use the toggle at the top to switch between a **live scenario**, a **not-live
scenario** and a **call's conversation details**. The state menu beside it
jumps to each case listed under States.

## Decisions (from the TDD)

| Question | Decision |
|---|---|
| What is versioned | **Scenarios only, and only the prompt and the first message.** They are saved together and always restored together, so the greeting matches the instructions it was saved with. The global prompt and global settings get versions in later releases. |
| What a save does | **Every save makes a version**, with no choice. On a **live** scenario the save doesn't change what callers get; **Publish** puts it in use, after the extra warning. On a scenario that **isn't live**, the save is in use from the next call, as today. |
| The version in use | Every scenario has one: what the next call runs. On screen it's always **"in use"**, never "Live". "Live" is only the scenario's switch and badge. |
| Live | A switch and a badge with **its own permission**, separate from editing. One click, nothing asked. Turning it on or off **doesn't change the version in use**. Someone without the permission sees the switch greyed. |
| Approval | **None in v1.** Anyone who can edit can publish or apply. History records who applied each version and when. |
| Going back to an older version | **Apply vN** points at vN again. **No new version is made**, and history still ends at the newest. The editor then opens on vN, and saving from there makes the next version, edited from vN. On a live scenario, a version newer than the one in use is **Publish vN** and an older one **Apply vN**. Both go through the extra warning. |
| Edit from here | Copies a version into the editor. Saving makes a new version on top, recorded as edited from it. Versions themselves are never edited or deleted. |
| Note on save | Optional, one line, in the save review. It shows on the version's row in History. |
| Generated summary per version | **Removed from this design.** The TDD has no generated summary and Fatma lists it as open, to confirm with Abdulrahman. Rows show the note instead. |
| Test in Playground on older versions | **Removed.** Not in v1 (TDD: "Test calls on older versions" is out). |
| Version numbers | The editor still never shows one: it speaks of "the version in use" and "the latest". Numbers appear in History and on a call's details. |

## What the user sees

**Editor header.** Under the title:
`Version in use published by Sami Rahman, yesterday 16:40`. The verb follows
how it got there: published, applied, or (not live) saved. On the right: the
Live switch, History, Run scenario and the more menu.

**Live switch.** A "Live" label and a switch in an outline control the height
of the buttons beside it, right in the header: one click, nothing asked (TDD
3.1). It is the same control as DES-203's (`shared/live-switch.tsx`), so
live and versioning ship one switch. It replaced DES-203's popover, which took
two clicks for one value (feedback, 22 Oct).

- Hovering it shows who last turned it on or off: "Turned on by Nouf
  Al-Harbi, 28 Sep". Toggling makes no version, so this is its only record.
- Without the live permission it is greyed, and the hover says "You don't
  have permission to turn this on or off."
- Toggling shows a toast with Undo: "Branch visit survey is live · The
  version in use doesn't change. Saves now wait for a publish." Turning it off:
  "… is no longer live · The version in use doesn't change. Saves now apply
  straight away."

**Unpublished row** (live only). When saves sit ahead of the version in use:
"Unpublished changes · 2 saves since the version in use. Callers don't get
them yet." with **Review and publish** (opens History on the newest, compared
with the version in use). Absent when there's nothing to publish.

**Editing an older version** (after Edit from here or Apply): an alert above
the fields, "Editing an older version · Nouf Al-Harbi, 28 Sep. Saving makes it
the latest; nothing is lost." with **Back to latest**.

**Save review** (448px drawer, line diff). One line on what the save does:
live "Callers keep getting the version in use until you publish." / not live
"It's in use from the next call." Then the diff, then **Note (optional)**
with an example placeholder. Button **Save**. Toast "Saved".

**History** (1024px record drawer). Header "Branch visit survey · In use: v12".
List newest first, **5 at a time with Load more**. Each row: number, time, who
and "from vN" (edited from). **In use** badge (green dot on the rail) on the
version in use; **Latest** on the newest while it isn't in use.

The pane, top to bottom:

- `v12` with the In use badge, the note, then `Sami Rahman · Yesterday,
  16:25` (who saved it).
- One line for each time the version was put in use: `Published by Sami
  Rahman, yesterday 16:40`, `Applied by Nouf Al-Harbi, 3 Oct, 08:15`. This is
  the TDD's record of who applied each version and when (3.2). A save that put
  it in use on a scenario that isn't live gets no line, because the saved-by
  line already says it.
- Edit from here, and Publish vN / Apply vN.
- Two tabs. **Changes** (default) is a split diff against the edited-from
  version, or any version in "Compared with". Unchanged fields say
  "Unchanged" and unchanged lines fold. **Full version** shows both fields
  whole, read-only: the version as it was (TDD 3.6). The first version has
  nothing to compare, so it shows whole with no tabs.

There's no facts strip and no Unified view. "In use", "edited from" and the
change count were each already said by the badge, the row and the diff. The
platform's change summary is split-only.

**Extra warning** (confirm, 384px), live only: "Publish v14?" / "Apply v9?" —
"Branch visit survey is live. Callers get v14's prompt and first message from
the next call. Calls already running finish on v12." Cancel, then the verb.

**Applied toast**: "v9 is in use · Callers get it from the next call. No
version was made." On a scenario that isn't live, with Undo (it applied
without a warning).

**Conversation details.** The version the call ran with sits beside the
scenario name as **v12**. It opens that version in the scenario's History.
The conversations list does not show it.

## States

| State | Behaviour |
|---|---|
| Someone saves while you edit | In the save review: "Ahmad Khalil saved a newer version while you were editing. Saving now leaves out their change: '…'. Both stay in history." Button **Save anyway**; the save goes through as the next version. |
| Save fails | In the save review: "Couldn't save · Nothing was written. Your changes are still here." Button **Try again**. |
| History fails to load | Empty state in the drawer: "Couldn't load versions" + Try again. |
| Loading | Skeleton list and pane; a spinner on Load more. |
| View only | Fields greyed; Review and publish, Publish, Apply and Edit from here greyed with "You can view versions but not change them". History stays readable. |
| No live permission | Can edit and save; the Live switch is greyed with "You don't have permission to turn this on or off." |
| Publish or apply fails | Alert in the pane: "Couldn't publish v14 · v12 is still in use. Nothing else changed." Button becomes Try again. |
| Version uses something deleted | Alert in the pane: "Can't apply v11 · It uses the tool "Book callback", which was deleted from this scenario. v14 is still in use. To keep this version's wording, edit from here and save." Apply is greyed. |
| Version has a removed block | It applies, and the toast says "Sentiment tags was skipped. It's no longer in the product." |

## Acceptance criteria this design maps to

- Every save makes a version, live or not — save review, Save.
- Live: a save doesn't change what callers get; Publish does, after a
  warning — save line, unpublished row, extra warning.
- Not live: a save is in use from the next call — save line, header verb.
- The version in use is marked "in use", never "Live" — History badge, header
  line, drawer header, facts strip.
- Applying an older version makes no version, and the editor opens on it —
  toast, alert above the fields.
- Prompt and first message restore together — extra warning names both.
- Every row shows who, when and edited from; the note is in the pane (the
  TDD puts it on the row: moved by design feedback, 22 Oct); Load more pages
  the rest — History list.
- History shows who applied each version and when — the pane's Published by /
  Applied by lines.
- Opening a version shows it as it was — Full version tab.
- Compare defaults to the edited-from version; any two can be compared —
  "Compared with".
- Stale save warns first and still saves as the next version — concurrent-save
  alert.
- Live has its own permission — the no-live-permission state.
- Deleted reference blocks applying; a removed block is skipped with a notice
  — the two apply states.
- A call shows the version it ran with, in its details only — conversation
  details surface.

## Open, not designed here

- **Generated summary per version**: to confirm with Abdulrahman. If it comes
  back, it sits under the note on each row, as it did before 22 Oct.
- **Save warning once Publish exists** (TDD open): with versioning, only
  Publish and Apply carry the warning; Save on a live scenario has none here.
  Confirm it goes away.
- **A save that touches only fields outside the prompt and first message**
  (TDD open): what its version means isn't decided.
- **Which role gets the live permission**: a role choice in the platform.
- Deleting a live scenario, trying a change without saving, versions of tools
  and knowledge bases: later releases.
