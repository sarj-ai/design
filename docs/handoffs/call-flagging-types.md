# Call flagging — shared types for front end and back end

First pass at the types for INT-95 (discovery DIS-50, design DES-167,
implementation PROD-423), written so the front end and the back end can agree on
one shape and then ship independently. Nothing here is merged anywhere; it is a
draft for review.

The front-end half already exists as code:
`src/lib/mockups/call-flagging-data.ts` in the design lab, which the pop-up at
`/call-flagging` renders from. It installs into the platform with the mockup.

## What the platform has today

One flat value per flag, in four places that must change together:

| Where | What |
|---|---|
| `products/platform/datastores/postgres/schema.sql` | `call_flag.issue_type text NOT NULL`, plus `comment text` (max 1000), `status text DEFAULT 'open'`, `timestamp_ms integer` |
| `python/common/sarj/plt/common/call_flag/call_flag.py` | `class IssueType(StrEnum)` and `CallFlag` / `CallFlagCreate` / `FlagListParams` |
| `products/platform/typescript/precedent-node/src/services/call-service.ts` | `ISSUE_TYPES`, `IssueTypeSchema`, `CallFlagCreateSchema`, `CallFlagFromApiSchema` |
| `products/platform/typescript/internal-client/src/generated/` | the generated `IssueType` union and `zIssueType` |

The six values are `pronunciation`, `connectivity`, `flow`, `silence`, `latency`,
`other`. The front end keys its labels, colours and badge icons off them in
`apps/web/src/app/calls/call-flag-constants.ts` and
`apps/web/src/app/quality/dashboard/issue-type-badge.tsx`, and the quality
dashboard filters and exports by them.

## What DIS-50 asks for

A flag is **one parent category plus any number of that parent's
subcategories**. Single-select on the parent so a flag routes to one team,
multi-select beneath it so one moment does not need several flags.

| Category | Subcategories | Rule |
|---|---|---|
| `stt` | `missed_words`, `non_arab_dialect`, `incorrect_names_entities`, `numbers_structured_data`, `transcription`, `stopped` | required |
| `tts` | `pronunciation_tashkeel`, `pace_pauses`, `style`, `saudization`, `stopped` | required |
| `llm` | `stopped`, `response_templates` | required |
| `latency` | `stt`, `tts`, `llm` | optional |
| `conversation_flow_logic` | none | none |
| `turn_taking` | `turn_detector`, `backchanneler` | required |
| `gender_mismatch` | `customer`, `voice_persona_tts` | required |
| `connectivity` | none | none |
| `voicemail` | none | none |
| `other` | none | none |

`optional` is latency only: DIS-50 keeps it optional because the person flagging
often cannot tell which stage was slow. `none` is complete on its own.

In the pop-up, latency's empty case is a "Not sure" row. That row is not an enum
value: it submits `latency` with `subcategories: []`. The pop-up also draws the
four `none` categories as one block at the end of the list; the enum order above
is DIS-50's and does not change.

**A subcategory id is not unique.** `stopped` sits under three parents and
`stt` / `tts` / `llm` reappear under latency. Identity is the pair. Nothing
should store, filter on or display a subcategory without its category.

## Proposed TypeScript

Same shape as the design lab file, in the platform's zod style:

```ts
export const FLAG_CATEGORIES = [
  "stt", "tts", "llm", "latency", "conversation_flow_logic",
  "turn_taking", "gender_mismatch", "connectivity", "voicemail", "other",
] as const;
export type FlagCategory = (typeof FLAG_CATEGORIES)[number];

export const FLAG_SUBCATEGORIES = {
  stt: ["missed_words", "non_arab_dialect", "incorrect_names_entities",
        "numbers_structured_data", "transcription", "stopped"],
  tts: ["pronunciation_tashkeel", "pace_pauses", "style", "saudization", "stopped"],
  llm: ["stopped", "response_templates"],
  latency: ["stt", "tts", "llm"],
  conversation_flow_logic: [],
  turn_taking: ["turn_detector", "backchanneler"],
  gender_mismatch: ["customer", "voice_persona_tts"],
  connectivity: [],
  voicemail: [],
  other: [],
} as const satisfies Record<FlagCategory, readonly string[]>;

export const FLAG_SUBCATEGORY_RULES: Record<FlagCategory, "required" | "optional" | "none"> = {
  stt: "required", tts: "required", llm: "required", latency: "optional",
  conversation_flow_logic: "none", turn_taking: "required",
  gender_mismatch: "required", connectivity: "none", voicemail: "none", other: "none",
};

export const CallFlagCreateSchema = z
  .object({
    category: z.enum(FLAG_CATEGORIES),
    subcategories: z.array(z.string()).default([]),
    comment: z.string().max(1000).nullish(),
    timestampMs: z.number().int().nonnegative(),
  })
  .superRefine((flag, ctx) => {
    const allowed: readonly string[] = FLAG_SUBCATEGORIES[flag.category];
    const unknown = flag.subcategories.filter((id) => !allowed.includes(id));
    if (unknown.length > 0) {
      ctx.addIssue({ code: "custom", path: ["subcategories"],
        message: `Not subcategories of ${flag.category}: ${unknown.join(", ")}` });
    }
    if (FLAG_SUBCATEGORY_RULES[flag.category] === "required" && flag.subcategories.length === 0) {
      ctx.addIssue({ code: "custom", path: ["subcategories"],
        message: `${flag.category} needs at least one subcategory` });
    }
  });
```

## Proposed Python

```python
class FlagCategory(StrEnum):
    STT = "stt"
    TTS = "tts"
    LLM = "llm"
    LATENCY = "latency"
    CONVERSATION_FLOW_LOGIC = "conversation_flow_logic"
    TURN_TAKING = "turn_taking"
    GENDER_MISMATCH = "gender_mismatch"
    CONNECTIVITY = "connectivity"
    VOICEMAIL = "voicemail"
    OTHER = "other"


FLAG_SUBCATEGORIES: dict[FlagCategory, tuple[str, ...]] = {
    FlagCategory.STT: ("missed_words", "non_arab_dialect", "incorrect_names_entities",
                       "numbers_structured_data", "transcription", "stopped"),
    FlagCategory.TTS: ("pronunciation_tashkeel", "pace_pauses", "style", "saudization", "stopped"),
    FlagCategory.LLM: ("stopped", "response_templates"),
    FlagCategory.LATENCY: ("stt", "tts", "llm"),
    FlagCategory.CONVERSATION_FLOW_LOGIC: (),
    FlagCategory.TURN_TAKING: ("turn_detector", "backchanneler"),
    FlagCategory.GENDER_MISMATCH: ("customer", "voice_persona_tts"),
    FlagCategory.CONNECTIVITY: (),
    FlagCategory.VOICEMAIL: (),
    FlagCategory.OTHER: (),
}

SUBCATEGORY_OPTIONAL = {FlagCategory.LATENCY}


class CallFlagCreate(BaseModel):
    timestamp_ms: int = Field(ge=0)
    category: FlagCategory
    subcategories: list[str] = Field(default_factory=list)
    comment: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def _subcategories_belong_to_category(self) -> "CallFlagCreate":
        allowed = FLAG_SUBCATEGORIES[self.category]
        unknown = [s for s in self.subcategories if s not in allowed]
        if unknown:
            raise ValueError(f"not subcategories of {self.category}: {unknown}")
        if allowed and self.category not in SUBCATEGORY_OPTIONAL and not self.subcategories:
            raise ValueError(f"{self.category} needs at least one subcategory")
        return self
```

Subcategories stay `str` rather than one enum because the ids repeat across
parents; a single `StrEnum` would need prefixed members (`STT_STOPPED`,
`TTS_STOPPED`) and the prefix would leak onto the wire.

## Proposed storage

```sql
ALTER TABLE call_flag
  ADD COLUMN category text,
  ADD COLUMN subcategories text[] NOT NULL DEFAULT '{}';
-- backfill from issue_type (table below), then:
ALTER TABLE call_flag ALTER COLUMN category SET NOT NULL;
-- issue_type stays until every reader has moved, then drops.
```

| `issue_type` today | becomes |
|---|---|
| `pronunciation` | `tts` + `{pronunciation_tashkeel}` |
| `connectivity` | `connectivity` |
| `flow` | `conversation_flow_logic` |
| `latency` | `latency` (no subcategory, which is why it must stay optional) |
| `other` | `other` |
| `silence` | **open** — see question 1 |

## Open questions for the review

1. **`silence` has no home in DIS-50.** The closest reading is a `stopped`
   subcategory, but under which parent cannot be recovered from an old row.
   Options: map to `other`, or add `silence` as an eleventh category. Needs a
   product call.
2. **Are subcategories really required** for STT, TTS, LLM, turn-taking and
   gender mismatch? DIS-50 only says latency's are optional, which implies it,
   but does not state it. If someone knows it is STT and none of the six fit,
   the only path today is the `other` category.
3. **Comment.** The current dialog has an optional comment and the table keeps
   the column. The approved Figma frame shows none. The draft keeps the field;
   the pop-up does not draw it until design says where it goes.
4. **Dashboard.** `/quality/dashboard` filters, exports and badges by
   `issue_type`. Filtering by category is a rename; filtering by subcategory
   needs the pair, not the id.
5. **Colour** is front-end only, one entry per category (ten), and should move
   to design tokens: the current map is raw Tailwind palette
   (`bg-red-500`, `rgba(239, 68, 68, 0.4)`), which the design system bans.
6. **Generated client.** `internal-client` regenerates from the OpenAPI spec,
   so the Python model change has to land before the TypeScript types exist.

## Review thread — draft, not posted

For #team-engineering-reviews. Replace the placeholder with the back-end owner.

> @<back-end owner> first pass at the shared types for the flagging categories
> work (INT-95 / PROD-423), so FE and BE can agree on one shape and ship
> independently.
>
> Proposal: a flag becomes `category` (one of ten) + `subcategories[]` scoped to
> that category, replacing the flat six-value `issue_type`. Single-select
> parent, multi-select beneath it, latency's subcategories optional, four
> categories with none. Full draft with TS, Python, the migration sketch and the
> legacy mapping: `docs/handoffs/call-flagging-types.md` in sarj-ai/design.
>
> Three things I need a call on before building against it:
> 1. `silence` has no equivalent in the new taxonomy. Map old rows to `other`,
>    or keep it as a category?
> 2. Subcategory ids repeat (`stopped` ×3, `stt`/`tts`/`llm` under latency), so
>    I have them as `text[]` validated against the category rather than one
>    enum. OK on your side, or do you want prefixed enum members?
> 3. Add `category` + `subcategories` beside `issue_type` and backfill, or
>    replace the column in one migration?
>
> The pop-up is live at design.sarj.ai/call-flagging and renders from the same
> constants.
