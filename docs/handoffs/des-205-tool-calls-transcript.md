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

| Question in the ticket | Decision |
|---|---|
| Pair the call and result, collapse them, or keep two rows | **Collapse them into one row.** The row sits where the call is. The result is matched by `toolCallId` and folded into that row instead of getting a row of its own. Speech that happened while the tool ran comes after the row, which is the order it happened in. |
| Is "success" a state | **No.** The UI only knows `isError`. A connected transfer, an instruction to retry and an empty output all look the same: the tool returned, and the row prints what it returned. Nothing is green, and nothing has a check. |
| Status for the four result kinds | **Failed** (`isError`): destructive tint, cross icon, and the word "Failed" beside the tool name. **Everything else**: muted background with the wrench icon, and no status word. The output text carries the meaning: "Transfer NOT COMPLETED: …", "AVAILABLE: …", or "No output". |
| Long output and arguments | **A truncated first line on the row, with full detail when the row is clicked.** The row expands in place, not in a side panel, so the reader keeps their place in the call. Open, it shows **Arguments** and **Output** verbatim, in monospace on a borderless white block. JSON is pretty-printed, and other text keeps its line breaks. The summary line stays in place while the row is open, so the header never moves during the animation. Every row with arguments or output opens, so the chevron means the same thing on every row. Only a row with neither ("No output") stays closed. |
| Duration and timing | The end of the row shows the duration (`640 ms`, `4.2 s`, `1 min 12 s`), then the time into the call when the tool was called (`0:41`), matching the time on every speech bubble. When `durationMs` is null, no duration is shown. Never show `0 ms`. |
| A tool that never returned because the caller hung up | **No special state.** The agent fills in an `isError` result at call end ("Transfer interrupted — caller disconnected before completion.") with the real start time, so the row reads Failed, shows that text, and shows how long it rang. |
| RTL | Speech bubbles take `dir="auto"`, so each Arabic line runs right to left. The tool name, arguments and output are pinned `dir="ltr"`, because they are English written for the model. The row uses logical properties only (`ms-`, `ps-`, `text-start`). |
| Light and dark | Tokens only (`bg-muted`, `bg-destructive/10`, `text-destructive`, `text-muted-foreground`), so the platform's `.dark` block covers it. The design lab renders light only, so dark has **not been checked visually** here. Check it in the platform. |

## Acceptance criteria (for the Telephony ticket)

1. A `function_call` and the `function_call_output` with the same `toolCallId`
   render as **one row**, at the call's position. The output item is not
   rendered on its own.
2. An output with no matching call still renders as its own row, at its own
   position.
3. A call with no output renders a row whose summary reads "No result
   recorded".
4. `isError: true` → destructive tint, cross icon and the word "Failed". There
   is no green and no check anywhere on a tool row.
5. `isError: false` → muted row with the wrench icon and no status word.
6. Collapsed, the row shows the tool name (monospace), the first line of the
   output truncated to one line, and at the end the duration and the time into
   the call (`m:ss` from call start). An empty output reads "No output".
7. Clicking the row expands it in place, showing Arguments and Output in
   monospace on a borderless `bg-background` block (max height 256px, then
   it scrolls). JSON is pretty-printed; other text keeps its line breaks.
   `{}` or empty arguments leave the Arguments block out, and an empty output
   leaves the Output block out. A row with neither has no chevron and does
   not open.
8. The summary line stays visible while the row is open. Hiding it on open
   makes the header jump while the body animates.
9. Duration format: under 1 s in `ms`, under 1 min in `s` to one decimal,
   otherwise `N min N s`. If `durationMs` is null, show no duration.
10. The tool name, arguments and output are `dir="ltr"`, and speech bubbles are
   `dir="auto"`. Check this with an Arabic transcript.
11. Tool rows are still visible only to users with `PLATFORM_READ`. This does
    not change.
12. The row is a keyboard-reachable button with a visible focus ring, and its
    expand animation respects reduced motion.
13. Check in light and dark themes.

## Not in this design

- The copy-JSON button is unchanged. The speech bubbles in the mockup follow
  the reviewed call drawer (`/conversations-revamp`): a tinted avatar and the
  speaker and time on the first line. That is the reference for how the
  transcript looks around the tool rows, not part of this ticket's scope.
- No new backend fields. A real "success" signal would need the tool to report
  one, which is a separate decision for the agent team.
