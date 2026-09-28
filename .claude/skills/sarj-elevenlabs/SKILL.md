---
name: sarj-elevenlabs
description: ElevenLabs Agents (ElevenAgents) as the competitor reference for Sarj — what its dashboard does on every surface Sarj also has (conversations, agent editor, personas/voice, knowledge, playground/tests, phone numbers, publish/versioning), mapped to the Sarj product and to this design system, with a take / don't-take list and a compare checklist. Use when designing or reviewing any Sarj surface ElevenLabs also has, when asked "how does ElevenLabs do X", when comparing Sarj against competitors, or when deciding what the design system should own next.
---

# ElevenLabs as the reference

The full comparison, with the product component matrix and the ranked design-system fixes, is
`docs/audits/elevenlabs-vs-sarj.md`. This skill is the part you need while designing.

**The rule from AGENTS.md still holds:** a reference informs *how*, never *what*. The ticket
is the spec. Take structure, interaction sequence and which states exist. Never take
ElevenLabs' features uninvited, and never its visual style (monochrome black and white, its
type, its radii). Say in your reply what you took.

Sources: Mobbin captures of the ElevenAgents app (Mar–Apr 2026) and `elevenlabs.io/docs`.
Mobbin links are given so you can look at the real screen. Anything marked *(docs)* was not
seen in the UI.

---

## The one structural difference

ElevenLabs has **one object, the agent**. Prompt, voice, LLM, tools, knowledge, tests and
analysis all live on it, in ten tabs.

Sarj splits it:
- The **scenario** holds prompt, tools, knowledge, analysis and success criteria.
- The **persona** holds voice, persona prompt and behaviour (backchannel, filler words, noise,
  pronunciation).
- LLM, STT, turn detection and interruptions sit in admin **Global Settings** and a per-org override.

So one ElevenLabs screen maps onto two or three Sarj screens. Never "fix" this in a mockup by
merging them — that is a product decision, not a design one.

---

## Surface by surface

### Conversations
- **List:** Date, Agent + branch, Duration, Messages, Call status (Successful / Failed / Unknown).
  Search plus "+ filter" chips (date, status, criteria, data, duration, rating, agent, tools,
  language, user, channel). [screen](https://mobbin.com/screens/9369bd47-0cec-4ff6-bc1e-0e087830e574)
- **Detail opens as a wide sheet over the list, with prev/next ("2/3")**, so reviewing many calls
  never leaves the list. [screen](https://mobbin.com/screens/133736a1-0af5-40ad-8039-c937a7d6f904)
- The detail has three parts:
  - **Header:** a waveform with play, speed and skip.
  - **Tabs:** Overview, Transcription and Client data.
  - **Metadata column on the right:** date, environment, duration, cost.
- **Overview:** AI summary, call status with a re-run control, "how the call ended", and
  **criteria "4 of 4 successful", each with a pass/fail and a written reason**.
- **Transcription:** bubbles; each agent turn names the workflow node and branch it came from;
  **per-turn latency chips (TTS 146 ms, LLM 1.2 s)**; routing and tool calls as inline system
  rows with collapsible payloads; a per-message action to turn the turn into a test.
  [screen](https://mobbin.com/screens/0ce2e993-4b26-4e04-bfeb-ac0a44dc226c)

**Sarj today:** the list, sheet and waveform exist. Flags are pinned to the waveform as regions,
which ElevenLabs does not do. There is **no per-turn latency** anywhere. The transcript has
Enhanced and Raw views.

### Agent editor → Sarj scenario edit
- **Header, always visible:** name / branch switcher / "Live 100%" / Draft badge / `{ } Variables`
  / Preview / Publish split. [screen](https://mobbin.com/screens/618baeaf-1522-4b97-92db-e61f36b76331)
- **Agent tab, two columns:** prompt and first message on the left; voices, language and LLM on
  the right. The **Interruptible toggle sits on the first-message field itself**: a setting that
  changes one field lives on that field.
- **Prompt:** large textarea, expand, AI-improve, `{{` inserts a variable.
- **Tools:** a library you attach from, plus **system tools as one toggle list with a gear each**:
  end call, detect language, transfer to agent, transfer to number, keypad tone, voicemail.
  [screen](https://mobbin.com/screens/91e14363-35ec-4a12-8d4b-4b0d6a9c4ece)
- **Analysis tab:** the conversation table on the left; a right rail defines evaluation criteria,
  data points and analysis language. Rows expand to show the extracted values. **Definition and
  results on one screen.** [screen](https://mobbin.com/screens/7071365d-8de3-4587-bfb5-065632afb6d2)
- **Advanced:** two-column settings — section title and one line on the left, controls on the
  right. [screen](https://mobbin.com/screens/462dcfce-cb89-42f1-a01e-7d076ced91dd)
- **Turn-taking** *(docs)*: turn eagerness (eager / normal / patient), silence timeout 1–30 s,
  soft-timeout filler, max duration, all per agent.
- **Publish:** edits are a draft. "Review changes" shows a side-by-side diff with an optional
  version note. Branches carry a traffic %. A banner says "Someone published changes — Sync
  now". [diff](https://mobbin.com/screens/ff16450b-9de9-4c60-8738-770be8df0a5c) ·
  [branches](https://mobbin.com/screens/bef0eb4f-240a-4751-895a-e56279440892) ·
  [banner](https://mobbin.com/screens/cefd7b8a-df77-4216-9475-8a8b0fab8264)

**Sarj today:**
- Four tabs: Scenario, Configuration, Schedule, Optimization.
- A Lexical prompt editor with variable chips.
- Nine tool types, including a full HTTP endpoint editor and warm/cold transfer.
- A JSON-schema editor for data collection.
- An unsaved-changes bar and a diff dialog, but **no drafts or versions** — saving goes live.
- The Scenario Copilot sheet, which ElevenLabs does not have.

### Scenarios index
- Table: Name, Created by, Created at; retire by **archive**, with an Archived filter.
  [screen](https://mobbin.com/screens/02042d42-1cb8-47ba-89d5-c8c99e719d7c)
- A dismissible template band above the table. The template gallery previews each template's
  structure (tool and knowledge counts, flow graph) before "Use template". Then a 3-step
  create wizard. [gallery](https://mobbin.com/screens/ebc17c84-6c86-44ce-9e2b-5345f71d69f1)

**Sarj today:** Active / Recently deleted with restore; an AI generator ("Describe your voice
agent") and an Industry → Use case → Name wizard.

### Personas (voice)
- Voices are a list on the agent (primary + additional). Voice Design generates **three
  candidates to audition** before saving. [screen](https://mobbin.com/screens/7f50c3a2-42a9-4dae-9939-d48ea5fcd1ca)
- Pronunciation *(docs)*: uploaded `.pls` dictionaries.
- Multilingual *(docs)*: a default language plus additional ones; "detect language" is a system tool.

**Sarj today:** one voice filtered by language and gender; a word → replacement pronunciation
table with bulk upload; backchannel, filler words and background noise. Sarj is ahead here.

### Knowledge bases
- Four action tiles: Add URL / Add files / Create text / Create folder. The URL dialog offers
  **Single URL / Sitemap / Whole website**. A **storage meter**.
  [screen](https://mobbin.com/screens/67e87818-fd79-43a6-a0e3-cc6d795f7478)

**Sarj today:** files and text, no URL source.

### Playground and tests
- **Preview:** full screen, orb, mute, live transcript, end state "Agent ended the call" → New
  conversation / View details, and a history drawer of past tests.
  [screen](https://mobbin.com/screens/5de031ac-ea60-46c7-869a-32b443d38647)
- **Tests:** simulated conversations; pass/fail with a reason; tool calls show the parameters
  the LLM extracted; retry failed / retry all. [screen](https://mobbin.com/screens/d9cd8778-5d88-4b16-92a0-c548cd1e67b6)

**Sarj today:** LiveKit voice and chat, a template-variable form, a thumbs rating at the end. No
automated tests and no latency panel.

### Phone numbers
- Empty state → Import from Twilio / SIP in a sheet. Each number has an assigned agent and an
  Outbound call button. [screen](https://mobbin.com/screens/9bbe934b-020d-4da6-a9e8-f0d8c94d171f)

**Sarj today:** read-only for org users; a 6-step SIP wizard, trunks and call activity for admins.

### Empty states
Uniform across the app: icon, one-line title, one-line reason, one action ("No tools found /
This agent has no attached tools yet / Add tool"). This matches our `empty-state` topic.
[screen](https://mobbin.com/screens/4926af8f-a525-43f2-be83-0d1313cb169b)

---

## Take

Structure and behaviour worth adopting when a ticket calls for the surface:

1. Per-turn latency chips and inline tool / routing rows in the transcript.
2. Conversation detail as a sheet over the list, with prev/next.
3. A metadata column beside the transcript, not a header stack.
4. Evaluation criteria as "N of M", each with a pass/fail and a reason.
5. Analysis definitions and results on one screen.
6. A setting that changes one field sits on that field.
7. System tools as one toggle list with per-tool config.
8. Review diff before publish, with an optional note; live/draft state always in the header.
9. A concurrent-edit banner when someone else saves.
10. A template gallery that previews the template's structure.
11. The uniform empty state.

## Don't take

- Their visual style — monochrome, their type, their radii. Tokens and Nunito only.
- Promo cards inside working screens (Expressive Mode, a video over an empty state).
- Ten editor tabs that mix deployment (Widget, Security) with agent config.
- Long filter-chip rows with no grouping.
- Features the ticket did not ask for — tests, branches, traffic split, URL crawling. If one
  seems needed, ask.

---

## Compare checklist for a new mockup

Run this when a mockup covers a surface above. Each question is a prompt to think, not a
requirement to build.

- [ ] Which ElevenLabs screen covers the same job? Open the Mobbin link.
- [ ] Which **states** does it show that the mockup does not (empty, loading, failed, live,
      ended, draft, archived)? States are in scope; features are not.
- [ ] Is the **interaction sequence** shorter there? Count clicks for the primary task.
- [ ] Does the mockup put a setting far from the field it changes?
- [ ] Does anything the mockup needs already exist in the design system — `DataTable`, `Empty`,
      the chip key, the `drawer` topic? Use it before building.
- [ ] Is the mockup about to hand-roll a pattern listed as missing in
      `docs/audits/elevenlabs-vs-sarj.md` §4.3 (status badge, filter bar, recording player,
      transcript, formatter, copy button)? Flag it in your reply, so the design system can
      absorb it.
- [ ] Say in the reply which ElevenLabs screens you referenced and what you took, in one line.

---

## Refreshing this reference

- Mobbin: the `mcp__mobbin__search_screens` tool, platform `web`, query
  "ElevenLabs agent …" / "ElevenAgents …".
- The live app (signed in): drive the user's own browser read-only — navigate and open menus
  only. Never save, publish, create, delete or start a call.
- Docs: `elevenlabs.io/docs/eleven-agents/*` and the changelog.
- Update this file and the audit together, and date what changed.
