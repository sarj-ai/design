# DES-199 — mid-call language switching: handoff notes

Design: `/language-switching` in the design lab
(`src/components/mockups/language-switching/`). It answers DIS-53 (the PRD).
This note lists where the design, which follows the PRD, differs from what
PROD-330 shipped (FE PR #7518, BE PR #7517), so QA and engineering can decide
which side moves.

## What the design does

- **Placement.** The setting sits on the scenario's Persona card, under the
  language tabs and outside them. It's one setting per scenario, so it isn't
  repeated in each tab.
- **Off (continuity, the default).** An optional transition phrase per
  language, typed in that language's direction. An empty phrase means the voice
  carries on without a word.
- **On (handoff).** One block per language other than the start language,
  as the acceptance criteria word it:
  - Persona: required. Only personas in that language are offered.
  - Handoff phrase: optional.
  - Transfer sound: on by default.

  The PRD's behaviour rules also say a two-language scenario "defines the
  target for both switch directions", which would add a block for the start
  language. The design follows the acceptance criteria; confirm with the PM.
- **Validation.** Save with an empty target puts an error on that picker and
  shows a toast naming the language. After that the check runs live as you
  edit.
- **Empty.** If no persona exists in the language, the picker says "No Urdu
  personas yet", as the platform's persona Select already does.
- **One-language scenario.** The setting is absent, because there's nothing to
  switch to.
- **No speech-recognition control** on this screen.

## Acceptance criteria → state in the design

| DIS-53 criterion | Where to see it |
|---|---|
| A single setting on persona configuration, off by default | "Arabic and English" preset, as it opens |
| Off: the voice continues, and the transition phrase plays if set | Off state: transition phrase fields |
| On: save blocked until every non-start language has a target | "Three languages" preset → Save scenario |
| On: target persona, handoff phrase, transfer sound | On state: one block per language |
| Continuity never uses the handoff phrase or sound | Off state: those fields are greyed out and disabled |
| Two scenarios are independent | The setting is stored on the scenario; nothing on the screen is shared |
| Existing scenarios migrate to continuity with no phrase | "Arabic and English" preset opens that way |
| No speech-recognition setting here | None is on screen |

## Gaps between the PRD and PROD-330 — for QA

1. **One switch vs per-direction targets.** The PRD has one scenario-level on/off.
   PROD-330 stores `switchTargets[source][destination]`, so AR→EN can keep the
   voice while EN→AR hands off.

   With two languages, every destination has one source, so the design maps
   cleanly. Off writes "keep" on every pair; on writes the chosen persona on
   every pair. With three languages, one design target is written to every
   source→destination pair for that destination.

   Nothing in the shipped data says "off" or "on". The switch has to be read
   from the targets: **on** if any target isn't the source persona. That
   inference needs agreeing with engineering.
2. **Migration default is the opposite.** The PRD says existing scenarios are
   continuity today. In PROD-330, an absent target means "the destination
   language's start persona", which changes the voice. That matches the Slack
   report attached to PROD-330 ("the Ar to En phrase is pronounced by the En
   persona"). So the de facto behaviour is handoff without a phrase.

   If the UI opens existing scenarios as Off without writing "keep" targets,
   it describes behaviour the pipeline doesn't do. Either migrate the targets
   or change the PRD default. **This is the gap to settle first.**
3. **Required target vs "default" option.** The PRD requires a target for every
   non-start language under handoff. PROD-330 offers "{Language} persona
   (default)", stored as `agentProfileId: null`, which always saves. As
   shipped, the blocked-save state can't occur.
4. **Transfer sound default.** The PRD defaults it on. PROD-330 defaults
   `transferSound` to `false`.
5. **Handoff phrase vs exit message.** The PRD has two mutually exclusive
   phrases: a transition phrase (continuity) and a handoff phrase (handoff).
   PROD-330 ships one `exitMessage` per direction:
   - spoken by the source persona, in the source language's direction;
   - shown even when the voice is kept;
   - falling back to the tool's transition phrase when empty.

   The design follows the PRD: the handoff phrase only under handoff, typed in
   the destination language, matching the PRD's example ("my colleague will
   continue with you in English"). The PROD-330 ticket's own example is in the
   source language. Decide which language the phrase is spoken in.
6. **Where the transition phrase lives.** In PROD-330 it's still a field of the
   code-switching tool's config. The PRD and this design put it on the Persona
   card with the rest of the setting.
7. **When the setting shows.** PROD-330 renders the block only when the
   language-switching tool is enabled. The PRD shows it on any multi-language
   scenario. The design follows the PRD (two or more languages).
8. **Stale "keep".** PROD-330 stores the source persona's id for "keep", which
   goes stale if that persona is changed later (flagged in PR #7518). The
   design avoids it by deriving "keep" from the switch, not from a stored id.
9. **STT.** PROD-330 specifies `switch_stt`, but PR #7518 doesn't expose it.
   The PRD and DES-199 keep recognition off this screen, so the design shows
   none. Consistent, but `switch_stt` has no UI anywhere.
