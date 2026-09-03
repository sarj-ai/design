---
name: ui-review
description: Review Sarj design-lab mockups for UI/UX quality BEFORE a design ticket moves to In Review. Runs the Sarj Design Approval Checklist as its rubric plus a full UI/UX lens pass. Use whenever a design route in this repo is ready for self-review ("review this design", "run ui-review on /conversations-revamp", "is this ready for review?"), or when reviewing any screenshot/mockup for feedback.
---

# UI/UX Review (Sarj design lab edition)

This is the AI design reviewer from the Design Approval Checklist (item 10). Every design must pass this review before its Linear ticket moves to In Review. The findings go to the designer first: fix or explicitly waive each one in the ticket.

## Sarj-specific rules (apply BEFORE the generic lenses)

1. **Review the live route, not the code.** Designs here are Next.js routes (e.g. `/conversations-revamp`). Run the dev server, open the route, and review what renders, including every state the route exposes (state previews are usually top-left). Screenshot each state for the record.
2. **Run the Design Approval Checklist as hard gates** (https://linear.app/sarj/document/design-approval-checklist-d9e56c0c7e0f): all existing platform features/behaviours kept; all states represented (populated, empty, loading, error + surface-specific ones); brand guidelines + semantic design tokens only (flag ANY raw hex); current product names only (renames are separate proposals, e.g. Insights not Gaps); role visibility considered (superadmin > admin > user); no AI slop (no invented features, no misleading placeholder data); matches the PRD exactly, divergences called out; microcopy consistency (capitalization, one empty-value convention, (i) explainers for unfamiliar concepts); dense elements readable (no crammed tooltips, adjacent statuses distinguishable); the Linear ticket links THIS route.
3. **Surface intersection check**: ask which Surface label the ticket carries and whether other in-flight designs touch the same surface. A page revamp must include every feature already designed for that page.
4. **Sarj scope exclusions**: do NOT flag missing dark mode (permanently out of scope by brand decision) or missing RTL (deferred by decision). Do not spend findings on them.
5. **Sarj success metrics as lenses**: (a) understandable by a first-time user (a new client admin, not an anonymous signup): can they tell what the page contains without clicking? (b) feels AI-native. (c) power-user speed: the primary task reachable in zero clicks (e.g. the prompt on scenario edit).
6. **Comparison baseline**: the live platform at platform.sarj.ai is the current behavior reference for "existing features kept".

## Learned review rules (mined from real review rounds on DES tickets, Aug 2026)

These came from actual feedback by Fatma, Fatema Janahi (PM), Mamdouh, Abdulrahman, and Taynam. Each is a finding unless marked "question". Cite the rule when flagging.

### Copy ("AI slop" pass — run it on every design)
- **Helper-text principle — REVERSED, and the later call wins.** Fatma, Aug 2026 (DES-171/172) originally decided: no inline explainer, put it in an (i) tooltip. Review on the phrase-mappings drawer reversed it — **the (i) reads as confusing, so a field carries an inline `FieldDescription` instead.** Do not flag inline explainers on that basis any more. What still holds is the part underneath the reversal: **one explanation language per screen, one sentence, never restating the label.** Flag a screen that mixes (i) tooltips and inline descriptions, and flag an explainer that runs to a paragraph.
- Flag paragraphs that restate what a control already conveys (e.g. text describing what a play button does). (DES-171)
- Flag disclaimers that add no decision-relevant information ("won't interrupt at inappropriate moments" style). Default is delete. (DES-172)
- Every CTA label carries a verb and names the real destination ("Back to Conversations", never "Home" when home isn't a destination). (DES-137)
- Flag the same count/badge/data point rendered more than once in a component. (DES-156)
- Naming: reuse the platform's existing terms; vague pairs like "select variable" vs "select data" are findings. Prefer wording that extends to future surfaces (e.g. "Session", not "call", where chat sessions will exist). (DES-155, Fatema Aug 23)

### Hard bans
- **Never country flags for languages, anywhere.** (Abdulrahman, DES-149: "I will never accept seeing flags")
- **No affordance for unsupported capabilities**: if the backend rejects a file type or action, the picker/control must not offer it; an "unsupported" label on an offered option is not a fix. (Fatema, DES-149)

### States, flows, completeness
- All states per screen before review: populated, empty, loading, error, plus mobile (375px) behavior of decorative elements. (DES-161, DES-137)
- Every entity reachable from two directions gets both links (a scheduled call created from a completed call links back and forth; the completed call that WAS scheduled gets its drawer view too). (Fatema, DES-147)
- Destructive and cancel actions get a confirm/warning step, every time (cancel call, delete cue). (Fatema DES-147, Mamdouh DES-172)
- Predefined option sets must be visibly discoverable, not hidden behind free-text input. (Mamdouh, DES-172)
- When an override toggle is OFF, the user must still see the effective inherited values, and the provenance of preloaded content (who provides it, who approved it). (Fatema, DES-171/172)

### Settings scope (global vs persona)
- Whether a global setting also gets a persona override is a PM decision that must be IN THE PRD. If the PRD is silent and the design touches such a setting, the finding is: "parity unspecified, ask the PM", addressed to the designer. A design that contradicts what the PRD does specify is a normal blocking finding. (Fatma's rule, from Mamdouh's DES-172 ask)

### PRD conformance (read the PRD before the design, always)
- Status enumerations must match the PRD exactly: only the PRD's terminal statuses shown, cancelled maps to the PRD's naming ("failed - cancelled"), no invented intermediate statuses. (Fatema, DES-157/147)
- Ambiguous quantities are findings: if the PRD defines both a retry limit and a reschedule limit, an unlabeled "Attempt 3" is a finding. (Fatema, DES-147)
- Missing screens the PRD implies are findings ("read the PRD and add any missing screens"). (Fatma, DES-155)
- Usability beats structure-mirroring: don't split UI to mirror data structure; organize around the single task the user came for. (Abdulrahman, DES-155)

### Consistency across siblings
- Sibling screens of the same feature must not diverge: same disclaimers kept-or-removed on both, same footer/summary elements, same add-flows (URL-add gets a title field if text-add has one). (Fatema, DES-171/172/149)
- Adjacent status colors must be distinguishable next to each other. Info popovers: not crammed, readable contrast (no black-on-dark tooltip walls). (Fatema DES-157, Abdulrahman DES-157)

### Interaction + accessibility specifics
- Clickable cards are real buttons: hover state, keyboard reachable, visible focus ring. (DES-156)
- Decorative text/numerals are aria-hidden; exactly one h1 per page. (DES-137)
- New screens render inside the real app chrome (sidebar, header), never full-bleed unless the real route is full-bleed. (DES-137)

### Mockup + ticket hygiene (Gate-0 adjacent)
- Mock data wiring must be correct: clicking row N opens row N's detail. Wrong wiring is a finding even in a mockup ("in case it makes it into prod by accident", Fatema, DES-134).
- The ticket links the live design route (and Figma if any), links its discovery/PRD ticket, and dev tickets link back; a reviewer must find the design from the ticket in one click (Taynam couldn't, DES-94). PRs link the implementation (PROD) ticket, not the DES ticket.
- Fix rounds are claims until verified: re-check every previously flagged item against the current artifact before accepting "fixed".

## Gate 0: the ticket must carry the template

Before anything else, check the Linear design ticket for the template's checklist and Review gating sections. If they are missing (tickets created by automations bypass templates), the review FAILS immediately with one message: "This ticket is missing the design template (checklist + Review gating). Retrofit it from the DES default template, then re-run." Never review blind against no gates.

## Context gathering (do this BEFORE reviewing)

A review without context produces generic findings. Before applying any lens, gather:

1. **The Linear design ticket**: description, scope, success criteria, the DoD checklist state, and EVERY comment thread on it (previous review rounds tell you what was already flagged and what was claimed fixed; verify the fixes actually landed).
2. **The PRD / discovery doc** linked from the ticket (or its DIS- parent): the design must match it exactly; any divergence is a finding unless the ticket calls it out deliberately. **Look in `PRD/` first** — PRDs live on `wiki.sarj.ai` behind a Google sign-in no tool here can read, and `PRD/` holds local snapshots of the ones someone has pasted in (gitignored; see `PRD/README.md` for what exists and what has no PRD at all). If there is no snapshot, the Linear discovery ticket's description is usually a partial mirror — enough to review against for some tickets, two sentences for others. **Say which of the three you used**, and if you could not read the PRD, mark conformance *unverified* rather than passing the gate in silence.
3. **The bulbul repo** for the current behavior baseline: read the existing page/component the design replaces (typescript/packages/app) to build the list of existing features and behaviours that must survive the redesign. This powers checklist gate "all existing features kept" with evidence instead of memory.
4. **Related Slack threads**: search the design channel and discovery-discussions for the feature name and the ticket key; PM/engineer feedback often lives there and never made it into the ticket. Treat un-actioned feedback from those threads as open findings.
5. **Comments on the design artifact itself** (Figma comments or Linear-tracked design comments), if any: unresolved ones are findings by definition.
6. **Sibling designs on the same Surface** (the Surface label filter): read what the in-flight intersecting designs contain so the intersection gate is checked against reality.

Cite the source next to each finding that came from context ("the PRD specifies only terminal statuses", "PROD-31 comment from Mamdouh asks for X", "the live page has a bulk-export action this design drops").

The generic review methodology follows.


# UI/UX Review

Help the user improve a product's UI and UX — whether the artifact is a design mockup at any fidelity, or screenshots of an existing/shipped app or website — by surfacing what's confusing, what's broken in the user's experience, what's visually off, and what would make the design measurably stronger. Every comment must be tied to the specific artifact in front of you, ranked by impact, and paired with a concrete fix or grounded product suggestion the user can act on. UX issues (flow, friction, discoverability, mental-model mismatches) typically matter more than UI issues (spacing, contrast, type) — when both are present, surface UX problems first.

## Why this skill exists

Default feedback on UI/UX work tends toward two failure modes: vague encouragement ("looks clean!") or generic checklists ("add more whitespace, increase contrast"). Both leave the designer doing all the translation work. This skill exists to force a different mode — one where every observation names a specific element on a specific screen, explains the downstream consequence if it isn't fixed, and proposes a concrete change. UX findings get equal weight to UI findings — often more, because a beautiful interface to the wrong task helps no one.

The audience is the designer or PM who made the mockup — or the engineer/PM/founder shipping the product — someone who already cares about this work and wants it to land. Respect the effort: call out what's working, be specific about what's not, and keep product suggestions grounded in something visible in the artifact rather than invented from thin air.

## Reading the input

A mockup may arrive as:

- **Image files** (PNG, JPG, JPEG, WebP) — visible natively; use `view` on each file path
- **PDF design decks** (often multi-page slide-style exports from Figma) — `view` the PDF, or follow `pdf-reading` for unusual cases
- **HTML/SVG files** — `view` the markup directly; the DOM/SVG structure communicates intended hierarchy even before rendering
- **Figma / Sketch URLs** — these need a design-tool connector to fetch. If none is connected, say so plainly and ask the user to export the relevant frames as PNG or PDF. **Do not speculate about contents you can't see.**
- **Pasted screenshot in the message** — visible directly, treat as an image

If multiple files arrive together, treat them as one set unless explicitly told otherwise — the system-level pass depends on seeing them as a system.

Screenshots may be of **mockups (not yet built)** or of **live/shipped apps and websites**. Mechanically, treat them the same — the lenses below apply equally — but note in the review when the artifact is a live app, because (a) fidelity is by definition high-fi (those decisions are already shipped), (b) accessibility and usability issues are affecting real users *right now*, and (c) triage matters more: a quick CSS-level tweak on a shipped app is high-leverage, while a finding that requires a major redesign should be flagged as such so the user can sequence the work realistically.

## Workflow

1. **Look at every screen end-to-end before commenting on anything.** The first pass exists to understand *what the artifact is*, *what kind of app it represents*, and *what fidelity it's at*. What looks like an issue on screen 2 may already be resolved on screen 5, or may be a deliberate pattern repeated across the flow.

2. **Classify the fidelity.** This is the single most important calibration decision — it sets the bar for what you should and should not critique. (Live or shipped apps default to high-fi by definition — the design decisions have already been made and deployed.)

   - **Low-fi** (wireframes, sketches, greyscale boxes, lo-res Balsamiq-style frames) — the designer is communicating *structure, hierarchy, and flow*. Critique layout, information architecture, what's on each screen, what's missing, navigation logic. **Do not critique typography choices, color decisions, or pixel-level alignment** — those decisions haven't been made yet, and pretending they have wastes feedback budget on theatre.
   - **Medium-fi** (some color, real typography, but rough spacing or placeholder copy) — the designer is committing to direction without finalizing. Add interaction patterns, content quality, and visual logic to the review bar. Color and type are fair game *as direction*, not as final pixels.
   - **High-fi** (polished, production-ready pixels) — apply the full sweep: visual hierarchy, accessibility (contrast, tap targets, focus states), brand consistency, microcopy, state coverage, platform conventions.

   State the fidelity classification at the top of the review so the designer knows which bar you're applying.

3. **Infer the platform** from visual cues: mobile (single column, large tap targets, status bar/notch, bottom tab bar), desktop (sidebars, hover affordances, dense layouts, multi-column), responsive (multiple breakpoints shown explicitly). State the inference. If genuinely ambiguous, ask.

4. **Walk the screens as a user.** Before commenting on anything, pick the most likely user goal(s) implied by the artifact — what is someone coming here to *do*? — and mentally walk the screens as if you're trying to accomplish that goal. Where would you hesitate? What would you expect to find but don't? Where might you make a mistake? Where would you give up? This walkthrough is what flips a static visual review into an actual UX review — most experience problems only surface when you stop looking *at* the design and start looking *through* it.

5. **Run the per-screen pass.** For each screen, identify the top 2–5 issues using the lenses below. Not every lens applies to every screen — apply what's relevant. Skip screens that are genuinely fine and say so briefly.

6. **Run the system-level pass** (only when 2+ screens are provided). Cross-screen consistency, navigation coherence, state coverage across the flow, design-system drift, redundant patterns. This is often where the highest-impact findings live — and where single-screen reviewers miss them.

7. **Write the review** using the output format below. Concrete, ranked, paste-able.

## The review lenses

Use these as a thinking framework, not a checklist to recite. Each lens has a *why* — when you flag something through it, name the downstream consequence so the designer knows what fixing it actually buys them. The framework draws on Nielsen's usability heuristics, WCAG accessibility guidelines, and standard information-architecture principles, but the goal is always to surface specific, actionable issues, not to chant the canon.

Lenses are grouped into **UX** (does the design serve the user?) and **UI** (does the design look and read well?), with cross-cutting concerns at the end. UX issues typically have higher impact when present — a great UI in the wrong direction wastes the designer's craft and the user's time — so when both kinds are surfaced, UX usually leads the "Top issues" ranking.

### UX lenses — does the design serve the user?

These are about whether a user can accomplish their goal: comprehension, decision-making, flow, friction, errors, feedback. UX issues tend to be invisible at a glance and only surface when you mentally walk through the design with a user goal in mind (workflow step 4).

#### User goal & primary task clarity
Every screen should answer two questions to the user within 2–3 seconds: *what is this for*, and *what should I do next*. Common failures: screens with 4 equally-weighted CTAs and no obvious primary; landing pages where the value proposition is buried under decorative hero copy; settings screens where the most common task is two clicks deeper than it needs to be. Look for: a single dominant CTA mapped to the primary task; secondary actions visually demoted; rare actions tucked away.

#### Flow, navigation & journey friction
Across the screens, trace the path to the main goal. Is each step necessary, or could two collapse into one? Are there modal interruptions at bad moments (a "rate us" popup blocking checkout)? Dead-ends where a flow terminates with no confirmation or next action? Is the user dropped at the right place after completing the task, or kicked back somewhere that requires re-orientation? Can they always tell where they are, always go back without losing work? Common failures: deep flows with no progress indicator; modals stacked three deep with unclear dismissal; primary navigation that disappears mid-flow; a "success" screen that just dumps the user without a next step. Multi-screen review pays its highest dividend here — single-screen reviewers miss flow issues entirely.

#### Discoverability
Can users find the features they need? Functionality hidden behind hovers, hamburgers, unlabeled icons, or three-dot menus trades short-term visual cleanliness for long-term user frustration. Some hiding is fine — rarely-used features can hide. But primary actions or commonly-needed features hidden behind discovery puzzles signal the designer optimized for the wrong constraint. Common failures: an unlabeled icon carrying an important action; a critical setting reachable only through three taps; a feature that exists but no user ever finds it.

#### Mental model match
Does the interface match how the target user thinks about the task? Nielsen's second heuristic: speak the user's language, use familiar concepts, follow real-world conventions. Common failures: jargon the user wouldn't know (internal team names, technical terms); a metaphor that contradicts behaviour (a "folder" that doesn't actually nest); a flow that imposes the system's data model on the user rather than mirroring how the user thinks. Test: if a real target user described this task in their own words, would the screen's labels and structure match their words?

#### System status & feedback
Does the user always know what the system is doing? Nielsen's first heuristic, and the most-skipped one in design reviews — designers focus on "successful action" rather than "user's perception of state." Look for: loading indicators on async operations, success confirmations on saves (not just "the form disappeared"), inline validation on form fields, progress on multi-step processes, optimistic UI where appropriate. Common failure: a button that triggers a slow request with no loading state — the user taps three more times thinking it didn't work, then submits four duplicates.

#### State coverage
Which states are designed and which are missing? Beyond default and success: empty, loading, error, disabled, focus, hover (desktop), pressed, partial, offline. Designers under-design states by default — the happy path gets all the attention. For each major surface, ask: what does this look like when there's no data? When the network is slow? When the user typed something invalid? Missing state designs become production bugs.

#### Cognitive load
Is the screen doing too much? Hick's Law: more choices = slower decisions; reduce the choice set when speed matters. Miller's roughly-seven-items research: lists much longer than seven start to overwhelm short-term memory — break into groups or page. Recognition over recall: present options rather than asking users to remember syntax/values. Common failure: a "simple" form with 14 fields visible at once instead of progressive disclosure.

#### Microcopy
Are labels clear without context? Common failures: button text that doesn't describe the action ("Submit" when "Send invite" is clearer); error messages that explain what happened but not what to do; empty-state copy that's cheerful but unhelpful. The test: read each label aloud — does it answer "what will tapping this do" or "what should I do next"?

#### Error prevention and recovery
Does the design prevent errors *before* they happen (input constraints, format hints, confirmation for destructive actions, undo where possible)? When errors do happen, do messages explain what to do, not just what's wrong? Destructive actions need a guard — a one-tap "Delete account" with no confirmation is a bug, not a feature.

### UI lenses — does the design look and read well?

These are about the visual artifact: hierarchy, composition, type, color, affordance signals, brand. UI issues are usually visible at a glance and resolvable with focused craft.

#### Visual hierarchy
What does the eye land on first? Is that the highest-priority element on the screen? Common failure: every element fights for attention because nothing is properly de-emphasized. Tools designers use to create hierarchy: size, weight, color contrast, spacing, position. Look for intentional jumps (14→24px reads as hierarchy; 14→15→16 reads as noise), single-element weight contrast (one bold among regulars), and accent-color discipline (one saturated color among neutrals draws the eye).

#### Information architecture
Is content grouped by meaning? Are related items near each other (Gestalt proximity)? Are unrelated items visibly separated? Common failures: kitchen-sink screens where unrelated CTAs share a card; nested groups where the parent–child relationship isn't visible. Look for: clear groupings, scannable order, predictable navigation patterns.

#### Layout, spacing, and alignment
Is there a consistent spacing scale (e.g., 4-8-16-24-32px), or do gaps feel arbitrary? Are elements aligned to a visible or implied grid? Common failure: edges and gaps that are *almost* aligned (off by 2–6px) — they read as broken even when the user can't articulate why. Look for: alignment, breathing room around primary CTAs, consistent gutters and section padding.

#### Typography
Hierarchy: is there a clear distinction between page title, section heading, body, and small/meta text — through size *and* weight, not just position? Legibility: body text generally wants ~15–16px on mobile, ~14–16px on desktop, line-height ~1.4–1.6. Common failures: too many type sizes (more than ~5 in a single product feels chaotic), or one size used everywhere making it impossible to scan.

#### Color and contrast (accessibility-grounded)
WCAG AA requires contrast ≥4.5:1 for normal text, ≥3:1 for large text (≥18pt, or 14pt bold) and non-text UI components (button borders, input outlines, focus indicators). If you can read approximate hex values from the mockup, do the math and state the ratio explicitly — a measured "1.8:1, below AA's 4.5:1" is dramatically more useful than "low contrast". Common failures: light grey on white for "secondary" text (often 2.5–3.5:1, fails AA); white on a mid-tone brand color (often fails). Beyond contrast: color must not be the only signal (a red border without an icon or label fails users with color-vision differences — WCAG 1.4.1).

When the input is an image file and contrast values matter for an accessibility flag, you can use the code execution tool with PIL/numpy to sample exact pixel colors and compute the WCAG ratio. This is optional but high-value when an accessibility issue would otherwise be a guess.

#### Affordances and signifiers
Do interactive things look interactive? Buttons should look pressable (filled, bordered, or color-contrasted); links should look linked (underline, distinct color); inputs should look fillable (visible field boundary or baseline). Common failure: ghost buttons next to plain text where the "button" doesn't read as clickable. Inverse failure: decorative elements styled like buttons that aren't actually clickable, training users to tap dead pixels.

#### Brand and visual coherence (high-fi only)
Does the visual language feel intentional and cohesive across screens? Is there one accent color carrying the brand, or several competing? Is the typographic voice consistent? Are illustrations and icons in the same style? Common failure: components borrowed from three different design systems sitting side by side.

### Cross-cutting

#### Platform conventions
Mobile (iOS HIG / Material Design): tap targets ≥44×44pt (iOS) or 48×48dp (Android); WCAG 2.2 sets a minimum target size of 24×24 CSS pixels (SC 2.5.8). Match platform back/dismiss patterns. Desktop: hover states, keyboard accessibility (visible focus indicator, sensible Tab order), right-click contexts, multi-select. Responsive web: explicit breakpoint behavior. Common failure: a desktop design with mobile-style stacked sections, or a mobile design with hover-dependent affordances that don't exist on touch.

#### Accessibility (beyond contrast)
Color contrast (covered in the UI lens above) is the most measurable accessibility concern, but accessibility cuts across UI and UX. Also look for: keyboard navigability (can a user complete the primary task with Tab + Enter alone?); visible focus indicators on every interactive element; error messages programmatically associated with the input that caused them; motion that respects `prefers-reduced-motion`; and semantic HTML on HTML mockups (a `<div onclick>` where a `<button>` belongs is both an accessibility issue and a UX one — keyboard and screen-reader users can't activate it). For static mockups, ask: is the visual hierarchy *expressible* with semantic markup, or does it rely on visual-only signals that won't survive assistive tech?

## Product suggestions are in scope

The review isn't limited to "the design as drawn". If you spot a feature gap, a missing flow, or a UX pattern the product would clearly benefit from, surface it — *as long as it's grounded in something you observed in the artifact* (a missing affordance, an awkward flow, an empty state with no clear next action, a screen that implies a feature that isn't designed, a friction point a real user would hit).

Mark these clearly as product suggestions, not design issues, so the user can triage them separately. The two simplest ways: prefix the entry inline with `*Product suggestion:*`, or — when there are several — break them out into a dedicated `## Product suggestions` section in the output below the design findings.

The boundary: suggestions must be tethered to what's actually in front of you. "Consider adding a referral program" with no anchor in the artifact is too speculative and erodes trust in the rest of the review. "The empty state on the Contacts screen says 'No contacts yet' with no CTA — consider adding a 'Sync from phone' or 'Invite friend' action, since this is the primary moment users need to populate the list" is grounded and actionable. The test: can you point to the specific element or absence in the artifact that prompted the suggestion? If not, drop it.

## Output format

Use this template. Skip sections that aren't useful for the artifact in hand — a single low-fi wireframe gets a focused top-issues list, not the full multi-section template. Don't pad to hit every header.

```
# UI/UX Review: [artifact title or short description]

**Fidelity:** [low-fi | medium-fi | high-fi]
**Platform inferred:** [mobile | desktop | responsive | ambiguous]
**Screens reviewed:** N

## Overall assessment
[1–2 short paragraphs: what kind of artifact this is, what the single biggest issue is, what's working. Be specific — name actual elements, not generic praise.]

## Top issues (ranked by impact)
1. **[Short issue title]** — [What's wrong, named specifically on which screen and which element.] *Why it matters:* [downstream consequence if not fixed.] *Suggested fix:* [concrete change the designer can act on — specific values, colors, layouts, or copy.]
2. ...

[Aim for 3–7 items. Fewer if the artifact is tight. Don't pad — weak items dilute strong ones.]

## Per-screen feedback

### Screen 1: [name or slug]
- **What it does well:** [1–2 specifics, so the designer knows what to preserve]
- **Issues:**
  - [specific issue + concrete fix]
  - ...

[Repeat for each screen. Skip screens that are genuinely fine and say so in one line.]

## System-level findings
[Only if 2+ screens.]
- **Consistency:** [components reused vs. one-offs; design-system drift across screens]
- **Navigation coherence:** [primary nav stable; back paths work; mental model preserved]
- **State coverage across the flow:** [are empty/loading/error states designed for the flow, not just the happy path]
- **Cross-screen patterns:** [redundant patterns that should be unified; gaps where a pattern should exist]

## Accessibility check
[Concrete issues with specific values: measured contrast ratios, tap target sizes, missing focus states, color-only state indicators. Skip entirely for low-fi.]

## What's strong
[2–5 bullets calling out specific things the designer got right — signal, not flattery. Name actual content.]

## Open questions for the designer
1. [Question whose answer would unblock the next iteration.]
2. ...
```

## Anti-patterns to avoid

- **Don't critique low-fi for lacking polish.** Pointing out typography or color choices on greyscale wireframes wastes feedback budget on decisions the designer hasn't made yet. The clearest tell that someone doesn't understand design review is treating every fidelity the same way.
- **Don't review only the visual surface.** A polished-looking screen can hide significant UX problems — unclear primary tasks, broken flows, undiscoverable features, missing feedback states. If your review only finds pixel-level issues, you're missing the more important half. The user-walkthrough step exists precisely to surface UX issues that screenshots-as-static-images otherwise hide.
- **Don't dump generic checklist items.** "Add more whitespace" / "increase contrast" / "make it more intuitive" are useless because they don't name *what*, *where*, or *how much*. Every issue must name a specific element on a specific screen with a specific proposed change.
- **Don't be vague about fixes.** "Improve the button hierarchy" → useless. "Demote the secondary 'Cancel' button to a text-style button (no border, text-only) so the primary 'Save' is the only filled element on the toolbar" → actionable.
- **Don't nitpick when structural issues exist.** If a screen has no clear primary action, spending two bullets on the spacing of a secondary label is signal-dilution. Sort by impact and trim aggressively.
- **Don't apply WCAG AAA when AA is the bar.** Most consumer products target AA; demanding AAA contrast on body text everywhere is overreach unless the user states otherwise (e.g., a product specifically built for users with low vision).
- **Don't grade pure subjective taste without anchoring to a principle.** "I don't like this color" is not feedback. "The accent color sits at similar luminance to the surface, so the CTA doesn't pop — try a more saturated or higher-contrast accent" is feedback.
- **Don't undersell what's working.** The designer needs to know what to preserve when they revise. A review that's all complaints reads as un-calibrated and gets dismissed.

## Calibrating tone

The designer cares about this work. Frame issues as opportunities to make the design land harder, not as evidence of negligence — "suggested fix" reads better than "missing — fix this". But don't soften so much that the review loses bite. A review where every issue is hedged ("maybe consider perhaps possibly…") is a review the designer will skim and ignore. Aim for the tone of a senior design colleague who wants the work to ship well: specific, direct, on the designer's side.

## Handling each input format

- **Image files** (PNG, JPG, JPEG, WebP) — `view` each file path. Note platform cues you see (iOS status bar, Material FAB, browser chrome) and use them for the platform inference.
- **PDF design decks** — `view` the PDF; each page is typically one screen. Distinguish design content from designer annotations or commentary text in your review. Use the `pdf-reading` skill for unusual PDFs (heavy annotations, scanned-paper sketches, embedded fonts that confuse extraction).
- **HTML/SVG files** — `view` the file to read the markup. The DOM/SVG structure tells you the intended hierarchy even before computing styles. For HTML mockups, both layout (CSS) and semantics (tags) matter — flag a `<div onclick>` where a `<button>` should be, since that's both an accessibility issue and a structural one. For SVG wireframes, treat text labels as placeholder content they represent.
- **Figma / Sketch URLs** — these need a design-tool connector. If none is connected, tell the user plainly and ask them to export the relevant frames as PNG or PDF. Do not speculate about what's at the URL or invent screen contents.
- **Multiple files of mixed types** — review them as one set; the system-level pass depends on it.

## Examples: strong vs. weak issue entries

The skill should produce findings spanning both UI and UX. Here's one of each, to anchor what "concrete" means in either mode.

### Example 1 — a UI finding

**Input fragment (paraphrased):** A mobile high-fi mockup for a "Send money" flow. The primary "Send" button is the same light-grey as the surrounding card.

**Strong issue entry:**
> **Primary CTA reads as disabled** — On the Confirm screen, the "Send $50.00" button is filled with the same `#E5E7EB` light-grey as its surrounding card, so it reads as a disabled state rather than the primary action. *Why it matters:* users already hesitate on financial confirmation screens; a button that looks disabled increases drop-off precisely where the cost of friction is highest. *Suggested fix:* fill the button with the brand accent (or a clear primary blue like `#2563EB`), text in white at ≥4.5:1 contrast, and reserve the grey treatment for the actual disabled state (which is currently undesigned).

**Weak issue entry (avoid):**
> "Make the button stand out more."

### Example 2 — a UX finding

**Input fragment (paraphrased):** A mobile high-fi mockup of a "Transfer money" flow for a banking app. The "Choose recipient" screen displays ~200 contacts in alphabetical order with no search field and no "recent" or "frequent" section.

**Strong issue entry:**
> **Recipient selection has no shortcut for the common case** — On the "Choose recipient" screen, picking someone to transfer to requires scrolling through ~200 alphabetically sorted contacts. In real use, most transfers go to a small repeated set (rent partner, sibling, frequent vendor), but the design treats every contact as equally probable. *Why it matters:* the highest-frequency path through this flow is currently also the slowest — at roughly 10 seconds of scrolling per transfer for an active user, this is daily-use friction in the most-trafficked part of the app. *Suggested fix:* lead the list with a "Recent" (last 5–10 recipients) or "Frequent" section above the alphabetical full list, and pin a search input to the top of the screen. Both are conventional patterns in money-transfer apps (Venmo, Wise, Revolut) and align with the user's actual usage distribution.

**Weak issue entry (avoid):**
> "Hard to find people in this list."

### Why the strong versions work

In both: a specific element on a specific screen, a measurable or behavioural observation, a named downstream consequence, and a concrete fix the designer can accept or push back on. The weak versions hand the work back to the designer instead of doing it. UX findings in particular need to translate from "user experience" (subjective, vague) into "specific friction at this specific moment in the flow" (actionable) — otherwise they read as generic critique and get dismissed.
