---
name: sarj-no-slop
description: Strip the tells that make a screen read as AI-generated — ALL CAPS labels, paragraphs where a label belongs, a heading over every block, launch-page copy, decoration that does no work, an icon on every line, motion that answers nothing. The Sarj-tuned variant of the global `no-ai-slop` skill: it names which slop signs this repo's lint rules already kill, so it only covers what is left. Use while writing any page, screen, or copy in this repo, and as a pass before a design ticket moves to In Review.
---

# No AI slop (Sarj repo edition)

AI-generated UI has a recognisable accent. Not one big mistake — a dozen small
ones that each look defensible and together make a screen read as *made by a
machine that has seen a lot of SaaS*: everything shouting, everything explained,
everything decorated, nothing prioritised.

This skill is the accent-removal pass. It covers **only** what the repo does not
already catch — the lint rules and `sarj-mockup` handle most of the visual half.
What is left is the half that lives in copy, in density, and in decisions about
what to *add*, and no linter can see any of it.

**The one-line test, applied to every screen before you ship it:**

> If I delete 30% of this, does the product get clearer?

If yes, it was slop. Delete it. That test is the whole skill; everything below is
the specific shapes it usually finds.

---

## Already handled — do not re-litigate these

Half the usual slop list is dead on arrival in this repo. Don't spend a review
round on them, and don't treat this skill as permission to re-check them:

| Slop sign | Already killed by |
|---|---|
| Purple/blue/pink AI gradients, twelve accent colours | `no-raw-color` — only tokens exist, and charts are one purple ramp |
| Random glows, floating shadows, fake depth | `no-shadow` |
| 16–24px radius on literally everything | `no-arbitrary-scale` + `no-primitive-override` — primitives own their radius |
| Uneven spacing, cramped next to cavernous | `sarj-mockup` Step 4 — one gap scale, one rhythm per page |
| Card inside card inside card | `sarj-mockup` Step 4 — never nest a `Card` |
| Everything centered | `sarj-mockup` Step 5 — start-align by default |
| 72px headline over 32px subtitle over 18px body | `sarj-mockup` Step 5 — three type levels, max |
| Sparkle and star **emoji** | `icon-source` — emoji are banned outright |
| Bouncy 500ms hover animations | `motion-tokens`, `motion-reduce`, `no-layout-animation` |
| Invented features, extra tabs, bonus screens | `AGENTS.md` scope rules — the ticket is the spec |

Everything from here down is **not** caught by anything else.

---

## 1. Sentence case. Always.

**No ALL CAPS. Anywhere.** Not headings, not buttons, not labels, not table
headers, not eyebrows, not badges, not section kickers. `uppercase` +
`tracking-wide` is the single loudest tell in the list, and it is never load-bearing
— it is decoration applied to text.

Title Case is the quieter version of the same mistake. Sarj writes **sentence
case**: capital on the first word and on proper nouns, nothing else.

```tsx
// ❌ every one of these
<span className="text-xs font-medium tracking-wide uppercase">ACTIVE CAMPAIGNS</span>
<TableHead>CUSTOMER NAME</TableHead>
<Button>SAVE CHANGES</Button>
<CardTitle>Monthly Spend Overview</CardTitle>   // Title Case
<Badge>NEW</Badge>

// ✅
<CardTitle>Active campaigns</CardTitle>
<TableHead>Customer name</TableHead>
<Button>Save changes</Button>
<CardTitle>Monthly spend</CardTitle>
<Badge>New</Badge>
```

Proper nouns keep their capital — *Sarj*, *WhatsApp*, *Insights*, a persona's
name. Acronyms stay acronyms — *API*, *CSV*, *SLA*, *IVR*. Nothing else gets one.

**The eyebrow is not an exception.** `01 / FEATURE` above a huge headline is the
AI launch-page signature, not a Sarj pattern. If a section needs a label, it is a
sentence-case heading at the right size, or it needs nothing.

## 2. Cut the text, then cut it again

The slop instinct is to explain everything. The product instinct is to label it
and let the user look.

**A label beats a sentence. A sentence beats a paragraph. Nothing beats a
paragraph that restates the label.**

```tsx
// ❌ four lines to say "recording"
<Field>
  <FieldLabel>Call recording</FieldLabel>
  <FieldDescription>
    Enable call recording to automatically capture and store audio from your
    conversations. Recordings help your team review interactions and improve
    quality over time.
  </FieldDescription>
  <Switch />
</Field>

// ✅
<Field orientation="horizontal">
  <FieldLabel>Record calls</FieldLabel>
  <Switch />
</Field>
```

Rules that follow from it:

- **A setting shows no inline explainer by default.** If the consequence is
  genuinely non-obvious, it goes in an `(i)` tooltip, one sentence, and that
  sentence never restates the label. Inline sentences are reserved for
  destructive or irreversible settings. (This is Fatma's helper-text principle
  from `ui-review` — it is the single most-repeated finding in real review rounds.)
- **Never describe what a control obviously does.** No "click play to hear the
  recording" under a play button.
- **Delete disclaimers that carry no decision.** "Calls won't interrupt at
  inappropriate moments" tells the user nothing they can act on. Default is delete.
- **Never render the same number twice** in one component. A count in the heading
  and the same count in a badge below it is padding, not reinforcement.
- **Empty values get one convention per screen** — `—` everywhere, or "Not set"
  everywhere. Never both.

Every string is a thing a real person has to read. Make it earn the read.

## 3. One heading per thing that needs one

Slop gives every block a heading, so nothing leads. A heading means "a new kind
of thing starts here" — if it isn't that, it is a label or it is nothing.

- One `<h1>`-weight page title per route. One.
- A section gets a heading only when the page has **more than one** section and
  they hold different kinds of content.
- Three or four sibling cards under one section heading need **zero** additional
  headings — `CardTitle` already is one.
- A card holds **one** `CardTitle`. Rows inside it get labels, not headings.
- If a heading and the thing under it say the same words, delete the heading.

If you count more than four heading-weight strings on a screen, the screen is
either mis-structured or over-labelled. Usually over-labelled.

## 4. Write like the product, not like a launch page

Marketing voice in an app is instant slop. The user is already logged in — they
bought it, they don't need selling.

| Never | Because |
|---|---|
| "Unlock the full power of your call data" | Nobody unlocks anything; they open a page |
| "Transform your workflow" | It transforms nothing; it filters a list |
| "Built for modern teams" | Nobody reads this in a settings panel |
| "Seamlessly manage everything in one place" | Zero information |
| "🚀 Supercharge your agents" | All of the above, plus an emoji |

Write what the thing does, in the words the product already uses. Reuse the
platform's existing terms — if the app says *Session*, the mockup says *Session*,
never *call*. A vague pair like "select variable" vs "select data" is a finding.
Every CTA carries a verb and names its real destination: "Back to conversations",
never "Home" when home isn't anywhere.

**Mock data is copy too.** "Item 1", "Lorem ipsum", "John Doe", `example@example.com`,
and four rows of identical-length strings all read as unfinished. Use real-looking
names, plausible numbers, varied lengths, and one row that's awkward — a long name,
a zero value, a missing field — because that's the row that proves the layout works.

## 5. Decoration has to do a job

The lint rules kill hex gradients and shadows. They do not kill a
token-coloured gradient, a blur, or an absolutely-positioned blob — those pass
lint and still read as slop.

```tsx
// ❌ passes lint, still slop
<div className="bg-linear-to-br from-primary to-primary-dark p-8" />
<div className="bg-card/60 backdrop-blur-lg ring-1 ring-foreground/10" />
<div className="absolute -top-10 -end-10 size-40 rounded-full bg-primary/10 blur-3xl" />
<Separator className="bg-linear-to-r from-transparent via-border to-transparent" />
```

- **No gradients on product surfaces.** A surface is `bg-card`, `bg-muted`,
  `bg-primary-tint`, or `bg-background`. Flat.
- **No glassmorphism.** `backdrop-blur` belongs to the overlay primitives, which
  already apply it. Never hand-roll blur + transparency + ring as a "premium" look.
- **No decorative shapes.** Blobs, orbs, floating squares, dot grids, corner
  glows, animated meshes. If deleting it changes nothing the user can do, delete it.
- **Ghost numerals and watermarks** need a token and a reason. `--text-status-code`
  on the 404 page is the one worked example in this repo — it is the page's entire
  content, not garnish on top of real content.

The test for any purely visual element: *what does a user learn or do because
this is here?* No answer means no element.

## 6. An icon per line is noise

An icon earns its place by being **faster to scan than its word**, or by being
the only thing there. One next to every string turns a list into a sticker sheet
and quietly says "generated".

| Icon | Verdict |
|---|---|
| Status per row (`success`/`warning`/`destructive` glyph) | ✅ scannable at speed |
| Icon-only button in a tight action column | ✅ the icon is the label |
| Nav item, menu item | ✅ the convention users expect |
| Empty-state media, one per state | ✅ the icon *is* the point |
| An icon before every field label in a form | ❌ delete all of them |
| An icon in every `CardTitle` on a stat grid | ❌ pick zero, or make it the metric's real signifier |
| An icon inside a `Badge` that already says the word | ❌ one or the other |
| An icon next to a heading that already leads the page | ❌ delete |

One icon set (HugeIcons), one size relationship to its text, and a name that says
what it does *here* — `<DisconnectIcon />`, not `<Unplug />`.

## 7. Pills mean something — don't pill everything

In this system a pill is a **status**. `Badge` ships as `rounded-4xl` because a
badge is a chip. When buttons, cards, inputs, filters, tabs, and containers all
go fully round, the pill stops meaning anything and the screen reads as decorated.

- `Badge` — pill. That's the point.
- `Button` — its own radius from the variant. Never `rounded-full` unless it is a
  genuine icon-only floating action.
- `Card`, `Input`, `Select`, panels, tiles — the primitive's radius, untouched.

Same principle for the "everything is a card" reflex: a card is a **surface with
its own identity**. Three related rows are an `ItemGroup` or a table, not three
cards. Four cards each holding one number are fine; four cards each holding one
sentence are a list wearing a costume.

## 8. Motion answers a question or it doesn't exist

The lint rules govern *how* you animate — tokens, reduced-motion, transform-only.
They cannot tell you whether the animation should exist. Most shouldn't.

Motion is legitimate when it answers one of: *what just changed?*, *where did it
come from?*, *is it still working?*, *did my click land?* Everything else is
garnish.

```tsx
// ❌ nothing here was asked
<Card className="transition-transform duration-200 ease-out-cubic hover:scale-[1.02] motion-reduce:transition-none" />
<h1 className="animate-in fade-in slide-in-from-bottom-4" />   // headings don't need entrances
<Badge className="animate-pulse" />                            // pulsing a static status

// ✅ each answers something
<Button />                       // press feedback — the primitive already has it
<DialogContent />                // where it came from — the primitive already has it
<Skeleton />                     // still working
```

Hover-scale on cards, glow on hover, staggered entrance on a list that was already
there on load, a pulsing badge that isn't live — all noise. And never animate a
whole page in on mount: the user asked for the page, not for a performance.

## 9. Empty states are one line and one action

The over-designed empty state is a reliable slop marker: giant illustration,
giant heading, a paragraph of encouragement, and two buttons — for a list that
just doesn't have rows yet.

```tsx
// ✅ the whole thing
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><HugeiconsIcon icon={CallIcon} /></EmptyMedia>
    <EmptyTitle>No calls yet</EmptyTitle>
    <EmptyDescription>Calls appear here once your first campaign runs.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent><Button>Create campaign</Button></EmptyContent>
</Empty>
```

Title says what's missing. Description says how it gets filled — one sentence, and
only if that isn't already obvious. **One** action, the one that fixes it. A
secondary "Learn more" is the third thing to cut.

A filtered-empty result is a different state and gets different words: "No calls
match these filters" plus "Clear filters" — never the same illustration as the
never-used state.

## 10. Don't ship the default dashboard

Sidebar, four stat cards, one line chart, an activity feed. It fits every product
and serves none, which is exactly why the model reaches for it. It is also usually
a scope violation — `AGENTS.md` is explicit that nothing gets built unless the
ticket names it.

Before you place a stat row, ask what the user came to this screen to **do**, and
lead with that. If the ticket asks for a call-review screen, the screen is the
call list and the transcript — not a metrics band on top of it because dashboards
usually have one.

Same for the generic filter bar, the generic search field, the generic export
button, and the generic "recent activity" panel. Each of those is a feature. If
the ticket didn't name it, it doesn't exist.

---

## Reject list

- `uppercase` on any product-surface string → sentence case
- Title Case in a heading, button, label, or table header → sentence case
- A `FieldDescription` under a non-destructive setting → delete it, or `(i)` tooltip, one sentence
- A sentence that restates its own label or its own control → delete
- A disclaimer the user cannot act on → delete
- The same count or value rendered twice in one component → keep one
- Two empty-value conventions on one screen → pick one
- More than four heading-weight strings on a screen → over-labelled
- A section heading over a single section → delete
- "Unlock", "transform", "seamlessly", "supercharge", "modern teams" → say what it does
- "Item 1", "Lorem ipsum", `example@example.com`, four same-length rows → real-looking data
- `bg-linear-*` / `bg-gradient-*` on a product surface → flat token surface
- Hand-rolled `backdrop-blur` + transparency → the overlay primitive already blurs
- An absolutely-positioned blob, orb, glow, or dot grid → delete
- An icon before every label in a form or every title in a grid → delete all of them
- An icon inside a badge that repeats the badge's word → one or the other
- `rounded-full` on anything that isn't a `Badge` or an avatar → the primitive's radius
- Three related rows rendered as three cards → `ItemGroup` or `Table`
- `hover:scale-*` or `hover:*glow*` on a card → delete
- An entrance animation on a heading, a section, or a page on mount → delete
- `animate-pulse` on something that isn't loading or live → delete
- An empty state with two actions, or a paragraph, or both → one line, one action
- The same empty state reused for "never used" and "no results" → different words
- A stat row, filter bar, search field, or activity feed the ticket never named → delete

## Self-check before returning

1. **Grep your own output for `uppercase`** — zero hits outside a slide deck.
2. **Read every string aloud.** Any that a logged-in user would skip: delete it.
3. **Count heading-weight strings.** More than four means over-labelled.
4. **Count `FieldDescription` / helper sentences.** Each one that isn't guarding a
   destructive action is a finding against you.
5. **Grep for `gradient`, `linear-to`, `radial`, `backdrop-blur`, `blur-`, `rounded-full`, `hover:scale`** —
   each hit needs a sentence of justification you'd say out loud in review.
6. **List every purely decorative element** and say what a user learns from it. No
   answer, no element.
7. **Delete 30% and look again.** If it reads clearer, keep it deleted — you found
   the slop.
