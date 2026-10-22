# DES-205 — Tool calls in the call transcript: handoff for Telephony

Mockup: `/tool-calls-transcript` (design lab). Spec: DES-205. It replaces the
interim pill that shipped under TEL-263 (platform PR #8837).

Component to change: `ToolPill` in
`products/platform/apps/web/src/app/calls/call-transcript.tsx`, and the
`tool-pill.ts` helpers next to it. The mockup's version is
`src/components/mockups/tool-calls-transcript/call-transcript.tsx`. It reads
the same `TranscriptMessage` fields the platform has, so `toRows` and the
formatting helpers can be lifted as written. No backend change is needed.

Use the "Call" select in the header to switch between the two sample calls:

- **Transfer failed.** A custom tool with arguments and a JSON output, an
  availability check, a transfer the caller cancelled by speaking, a transfer
  nobody picked up, and a retry that rang until the caller hung up.
- **Transfer connected.** An availability check, then a transfer that handed
  off with an empty output.

## Decisions

The transcript is read by people who do not know what a tool call is, so a
tool reads as a quiet line of muted text saying what the agent did, in words. Everything
technical (what was sent, what came back, how long it took, the tool's own
name) is one click away. Review feedback on the earlier pill was that it
looked too technical for normal users.

| Question in the ticket | Decision |
|---|---|
| Pair the call and result, collapse them, or keep two rows | **Collapse them into one line, in the agent's column.** The line sits where the call is, aligned with the agent's bubbles (past the avatar), because a tool is something the agent does. An earlier version centred it on a rule across the transcript; review found the rule read as a section break, as if the turns either side were separate conversations. ElevenLabs keeps a tool inside the agent's turn for the same reason. The result is matched by `toolCallId` and folded into that line instead of getting one of its own. Speech that happened while the tool ran comes after the line, which is the order it happened in. The line sits tight against the agent message it belongs to (the one just before it, or failing that the one after) and turns keep the wider gap, so it reads as part of that turn. |
| How the tool is named | **In words, not as the tool's own name.** `transfer_call` reads "Transfer call", `check_transfer_availability` reads "Check transfer availability": underscores become spaces and the first letter is capitalised. A client's custom tool gets the same treatment. If the platform holds a display name for a tool, use that instead. The name as written is shown in the details, in monospace, for whoever is debugging. |
| Is "success" a state | **Only for an empty output.** The UI only knows `isError`, and "Transfer NOT COMPLETED" comes back without it, so a result with text cannot be called a success. A result with no output and no error is a tool that finished with nothing to add (a transfer that handed off, `end_call`), and that one reads **"Transfer call completed"** with a green check. It is the only case where a check cannot contradict the text behind it. |
| Status for the four result kinds | Every line is plain muted text with no fill or outline, so it never competes with the speech bubbles; any shape around it drew the eye away from the conversation. Only the status carries colour. **Failed** (`isError`): a cross icon and the word "failed" in `text-destructive` ("Transfer call failed"). **Completed** (no error, empty output): green check, "Transfer call completed". **Everything else** (no error, some output): the wrench icon and the tool's name alone. The output carries the meaning ("Transfer NOT COMPLETED: …", "AVAILABLE: …") and is one click away. **No result** (a call whose output never arrived): the line ends "· No result". |
| Long output and arguments | **None of it on the line; all of it when the line is clicked.** Clicking opens a muted block under the line, as wide as the agent's column, in place rather than in a side panel, so the reader keeps their place in the call. It is laid out the way ElevenLabs lays out its tool details: **Called with** (a section, open by default, folded by its label), then two facts, **Duration** and **Tool** (the raw name, monospace), each a small label over its value, then **Returned** (a section like the first). Each payload sits in the design system's code block: JSON in `JsonView` (line numbers, folds, Copy), any other text verbatim in the same bordered block in monospace, with Copy in the same corner. Every line opens, so the chevron means the same thing everywhere. |
| Capitals in the output ("AVAILABLE: … IS available") | **Shown as written, only in the details.** The capitals are in the agent's own strings (`transfer_to_human.py`), as emphasis for the model. Rewriting them in the UI would mean the transcript no longer shows what the model was told. They appear only after a click, in monospace, so they read as the model's text and not as the page talking. Dropping the capitals is a change to the agent's copy, outside this ticket. |
| Duration and timing | The line ends with the time into the call when the tool was called (`· 0:41`), matching the time on every speech bubble. The duration (`640 ms`, `4.2 s`, `1 min 12 s`) moves into the details as **Duration**. When `durationMs` is null, it is left out. Never show `0 ms`. |
| A tool that never returned because the caller hung up | **No special state.** The agent fills in an `isError` result at call end ("Transfer interrupted — caller disconnected before completion.") with the real start time, so the line reads "Transfer call failed", and opening it shows that text and how long it rang. |
| RTL | Speech bubbles take `dir="auto"`, so each Arabic line runs right to left. The tool name, arguments and output are pinned `dir="ltr"`, because they are English written for the model. Everything uses logical properties only (`ms-`, `ps-`, `text-start`). |
| Light and dark | Tokens only (`bg-muted`, `text-destructive`, `text-success`, `text-muted-foreground`), so the platform's `.dark` block covers it. The design lab renders light only, so dark has **not been checked visually** here. Check it in the platform. |

## Acceptance criteria (for the Telephony ticket)

1. A `function_call` and the `function_call_output` with the same `toolCallId`
   render as **one line** at the call's position, aligned with the agent's
   bubbles (`ms-11`, past the avatar). No rule across the transcript.
   The output item is not rendered on its own.
   **Spacing:** a tool belongs to the agent message just before it, or
   failing that the one just after it, and sits 6px (`gap-1.5`) from it.
   Turns are 16px (`gap-4`) apart. A tool with no agent message either side
   stands on its own, 16px from its neighbours.
2. An output with no matching call still renders as its own line, at its own
   position.
3. The tool is named in words: underscores and hyphens become spaces, the
   first letter is capitalised. A display name from the platform wins if one
   exists.
4. `isError: true` → cross icon and the word "failed" in `text-destructive`:
   "<Tool> failed". The rest of the line stays muted; no fill or outline.
5. `isError: false` with an empty output → muted, green check
   (`text-success`), "<Tool> completed".
6. `isError: false` with output → muted, wrench icon, the tool's name with no
   status word. A green check never appears on a line that has output text.
7. A call with no output → muted, "<Tool> · No result".
8. Collapsed, the line shows the icon, the words above, `· m:ss` (time into
   the call) and a chevron. No output, arguments, duration or raw tool name on
   the line. It is plain `text-xs` `text-muted-foreground` text with no fill,
   border or padding, going `text-foreground` on hover.
9. Clicking the line opens a `bg-muted` block under it, as wide as the
   agent's column, laid out as ElevenLabs' tool details:
   - **Called with**: a section with a chevron and its label, open by
     default, folding on its label. Left out for `{}` or empty arguments.
   - **Duration** and **Tool**: side by side, each a `text-xs` muted label
     over its value. Duration is left out when `durationMs` is null; Tool is
     the raw name in monospace.
   - **Returned**: a section like Called with. Left out for an empty output.

   Each payload is in the design system's code block on `bg-background`:
   JSON in `JsonView` (`design-system/json-view-preview.tsx`, with line
   numbers, folds and Copy); any other text verbatim in a bordered block in
   monospace, max height 256px then it scrolls, with the same ghost Copy
   button top-right. The output is shown as the agent wrote it, capitals
   included.
10. Duration format: under 1 s in `ms`, under 1 min in `s` to one decimal,
    otherwise `N min N s`.
11. The tool name, arguments and output are `dir="ltr"`, and speech bubbles
    are `dir="auto"`. Check this with an Arabic transcript.
12. Tool lines are still visible only to users with `PLATFORM_READ`. This
    does not change.
13. The line is a keyboard-reachable button with a visible focus ring, and
    its expand animation respects reduced motion.
14. Check in light and dark themes.

## Not in this design

- The copy-JSON button is unchanged. The speech bubbles in the mockup follow
  the reviewed call drawer (`/conversations-revamp`): the speaker and time on
  the first line. Avatars follow the design system: people (the customer, a
  human agent) get `OrbAvatar`, seeded by the speaker; the AI agent is not a
  person and keeps the bot mark the call page uses today. That is the
  reference for how the transcript looks around the tool lines, not part of
  this ticket's scope. The mockup's sample calls are in English; the product's
  are usually Arabic, which the `dir` rules above cover.
- No new backend fields. A "success" signal for tools that return text would
  need the tool to report one, which is a separate decision for the agent team.
  So would dropping the capitals from the agent's output strings.
