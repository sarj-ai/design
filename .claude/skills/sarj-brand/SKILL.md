---
name: sarj-brand
description: The complete Sarj brand reference — every color (OKLCH + hex, light/dark/tasama whitelabel), the Nunito type system, spacing/radius/shadow scales, chart palette, and component recipes. Use whenever producing ANYTHING that should look like Sarj — app UI, standalone HTML, slide decks, presentations, artifacts, mockups, diagrams, marketing pages — or when restyling an existing design to the Sarj brand. Self-contained: all values inlined, no codebase access needed.
---

# Sarj Brand & Design System

Single source of truth for making anything look like Sarj. Self-contained — every value is a concrete number, so it applies inside this app, in a standalone HTML page, in a slide deck, or in Figma.

**Brand in one sentence:** deep purple `#392868` on clean neutral grays, Nunito (rounded, friendly sans), 10px-radius corners, soft shadows, generous whitespace.

## Two modes — pick one before writing anything

1. **Inside this Next.js app** → use semantic tokens and the shadcn primitives (`bg-primary`, `<Button>`, `<Card>`). **Never** write raw hex/OKLCH in a component. The `sarj-mockup` skill is the build procedure and the enforcement layer; this file is the reference for what each token *is*.
2. **Outside the app** (slides, artifacts, standalone HTML, emails, diagrams, Figma) → use the hex values and the copy-paste CSS at §5. There are no tokens there; this document *is* the token source.

"Make it match the Sarj brand" = swap accent to `#392868`, font to Nunito, neutrals to the gray ramp, radius to the scale, status colors to the semantic set. Keep content; replace style.

> ## ⭐ Priority #1: spacing, padding, hierarchy — before color
>
> Correct colors on a badly-spaced layout still looks cheap; neutral colors on a well-spaced layout looks premium. The biggest driver of whether something reads as Sarj is **consistent spacing, padding, and title hierarchy** — especially in cards, decks, and any card-like surface.
>
> - **Padding**: one value per surface (cards 16–24px; slides 64px), never mixed within a view.
> - **Gaps**: one 4/8px grid — icon↔text 8, card rows 12–16, card↔card 24, title→body 24–48. If two gaps look nearly equal (16 vs 20), snap both to the scale.
> - **Hierarchy**: exactly one title per card (16px semibold), description in muted gray under it, then body. Never two competing headings.
>
> §4 (Cards) and §4.5 (Presentations) are mandatory, not optional. Color is step two.

---

## 1. Color

Defined in OKLCH in code; hex computed for external use. Light mode is the default brand look — prefer it for slides and documents.

### 1.1 Brand palette

| Name | Hex | OKLCH | Use |
|---|---|---|---|
| **Brand purple (primary)** | `#392868` | `oklch(0.334 0.107 291.8)` | Buttons, links, active states, accents. Same in light & dark. |
| Primary highlight | `#52467f` | `color-mix(in oklch, #392868 85%, white)` | Hover tints, subtle brand emphasis |
| Primary light | `#6d6595` | `color-mix(in oklch, #392868 70%, white)` | Soft brand fills, secondary brand text |
| Primary dark | `#281b4b` | `color-mix(in oklch, #392868 80%, black)` | Pressed states, dark brand headers |
| Primary tint (surface) | `#eeecfa` | `oklch(0.948 0.019 291.8)` | Selected/active row, sidebar item, icon container |
| Primary tint foreground | `#4d3d80` | `oklch(0.411 0.108 291.8)` | Text/icon on the tint surface |
| Text on primary | `#ffffff` | `oklch(1 0 0)` | Always white on brand purple |

Brand-static extras (rare): `tailwind-black #06050f`, `manafa-blue #0d6efd`, `manafa-light-blue #3d8bfd`, `variable #0369a1` on `variable-background #e0f2fe` (template-variable chips).

### 1.2 Neutrals — light mode (default)

| Token | Hex | OKLCH | Use |
|---|---|---|---|
| `background` | `#ffffff` | `oklch(1 0 0)` | Page background |
| `foreground` | `#0a0a0a` | `oklch(0.145 0 0)` | Body text |
| `card` / `popover` | `#ffffff` | `oklch(1 0 0)` | Card & popover surfaces (separated by border/ring + shadow, not fill) |
| `secondary` / `muted` / `accent` | `#f5f5f5` | `oklch(0.97 0 0)` | Subtle fills: secondary buttons, muted panels, hover |
| `secondary-foreground` / `accent-foreground` | `#171717` | `oklch(0.205 0 0)` | Text on subtle fills; heading-strength ink |
| `muted-foreground` | `#737373` | `oklch(0.556 0 0)` | Secondary text, captions, placeholders |
| `border` / `input` | `#e5e5e5` | `oklch(0.922 0 0)` | Borders, dividers, input outlines |
| `ring` | `#a1a1a1` | `oklch(0.708 0 0)` | Focus rings (50% opacity, 3px) |
| `sidebar` | `#fafafa` | `oklch(0.985 0 0)` | Sidebar bg (one step off-white) |

### 1.3 Status / intent — light mode

| Intent | Fill hex | OKLCH | Text on fill |
|---|---|---|---|
| Destructive / error | `#e7000b` | `oklch(0.577 0.245 27.325)` | `#fafafa` |
| Warning | `#fe9a00` | `oklch(0.769 0.188 70.08)` | `#421d00` (`oklch(0.28 0.07 55)`) |
| Success | `#16a34a` | `oklch(0.627 0.17 149.2)` | `#fafafa` |

For statuses in tables/lists, prefer **soft badges** over solid fills: success green-50/green-700, warning amber-50/amber-700, info blue-50/blue-700. (Dark: `*-900/30` bg, `*-400` text.) In-app, the `Badge`/`Button` `destructive` variant is already the soft form (`bg-destructive/10 text-destructive`).

### 1.4 Dark mode

Primary purple stays `#392868` with white text. Neutrals invert:

| Token | Hex | OKLCH |
|---|---|---|
| `background` | `#0a0a0a` | `oklch(0.145 0 0)` |
| `foreground` | `#fafafa` | `oklch(0.985 0 0)` |
| `card` / `popover` | `#171717` | `oklch(0.205 0 0)` |
| `secondary` / `muted` / `accent` | `#262626` | `oklch(0.269 0 0)` |
| `muted-foreground` | `#a1a1a1` | `oklch(0.708 0 0)` |
| `border` | white @ 10% | `oklch(1 0 0 / 10%)` |
| `input` | white @ 15% | `oklch(1 0 0 / 15%)` |
| `ring` | `#737373` | `oklch(0.556 0 0)` |
| `destructive` | `#ff6467` | `oklch(0.704 0.191 22.216)` |
| `warning` | `#ffb900` | `oklch(0.828 0.189 84.429)` |
| `success` | `#00bc7d` | `oklch(0.696 0.17 162.48)` |
| `sidebar` | `#171717` | `oklch(0.205 0 0)` |
| primary tint / `sidebar-accent` | `#4d3d80` | `oklch(0.411 0.108 291.8)` — white text |

### 1.5 Chart palette — brand purple only

**Charts use only brand purple, never a multi-color rainbow.** A Sarj chart is monochrome: one hue, differentiated by lightness. This keeps decks and dashboards calm and on-brand.

- **Single series** → solid `#392868`.
- **Multiple series** → step down the ramp, darkest first:

  | Step | Hex | |
  |---|---|---|
  | 1 | `#281b4b` | primary, dark |
  | 2 | `#392868` | primary |
  | 3 | `#4d3d80` | |
  | 4 | `#6d6595` | |
  | 5 | `#948fb3` | |
  | 6 | `#b9b6ce` | |

  Cap at 5–6 series; beyond that, split the chart. Gridlines/axes stay `#e5e5e5` / `#737373`.

- **Emphasis**: hero segment `#392868`, everything else muted to `#b9b6ce`. One purple hero, the rest quiet.
- In this app the ramp is `--chart-1 … --chart-6`, derived from `--primary` via `color-mix`, so it follows the whitelabel automatically. Use `var(--color-chart-N)`.
- (tasama material uses the equivalent blue ramp off `#10069f`.)

### 1.6 tasama whitelabel

`[data-whitelabel="tasama"]` swaps brand purple for **blue `#10069f`** (`oklch(0.326 0.214 267.2)`); tint becomes `#ecebf9` with `#10069f` text; derived shades highlight `#243fb0`, light `#4564c1`, dark `#090375`. Everything else identical. This is *why* app code must use tokens, never literals. For external assets, default to Sarj purple; use tasama blue only when explicitly producing tasama material.

---

## 2. Typography

**Nunito** — Google Font, loaded via `next/font` as `--font-nunito`. Stack: `Nunito, ui-sans-serif, system-ui, sans-serif`. The rounded terminals are core to the brand's friendly voice — never substitute Inter/Roboto/Arial in brand material. In slides/HTML load weights 400–800. Mono: default `ui-monospace` stack.

| Role | Size / line-height | Weight | Color |
|---|---|---|---|
| Page title | 24px / 32px (`text-2xl`) | 600 | foreground |
| Section heading | 18–20px (`text-lg`/`text-xl`) | 600 | foreground |
| Card title | 16px (`text-base`) | 500–600 | card-foreground |
| Body / controls | 14px / 20px (`text-sm`) | 400–500 | foreground |
| Descriptions, captions | 14px or 12px (`text-xs`) | 400 | muted-foreground `#737373` |
| Badges / labels | 12px (`text-xs`) | 500 | per variant |

UI default is **14px, medium-ish, not bold-heavy** — emphasis comes from weight 500/600 and muted-vs-foreground contrast, not size jumps. Never below 12px. For decks scale up proportionally (title 40–56px/800, section 28–32px/700, body 18–20px/400) keeping the same hierarchy pattern.

---

## 3. Spacing, radius, shadows, motion

### 3.1 Spacing

4px base (`1`=4, `2`=8, `3`=12, `4`=16, `6`=24, `8`=32):

- Icon↔label inside a control: **8px**
- Related controls / form internals: **8–12px**
- Card internal padding: **16px** in-app (Nova `--card-spacing`), **24px** in decks/external mockups; card section gap: **24px**
- Between form fields: **16px**; between page sections: **24–32px**
- Page side padding: **32px**; content max-width **1400px**, centered
- Table cells: **8px** vertical, **12–16px** horizontal

Always scale values (including halves: 2, 6, 10, 14px) — never 13px or 18px.

### 3.2 Radius

`--radius` = **10px** (`0.625rem`). Scale: `sm` 6px · `md` 8px · `lg` 10px · `xl` 14px · `2xl` 18px · `3xl` 22px · `4xl` 26px · pill.

- Buttons, inputs, selects, menus: **8–10px** (`rounded-md`/`rounded-lg`)
- Cards, dialogs: **14px** (`rounded-xl`)
- Badges/chips, avatars: **pill**
- Nothing square; nothing past 16px except pills.

### 3.3 Shadows

Soft and minimal — elevation is border/ring + a tiny shadow, never heavy drop shadows:

- Inputs / outline buttons: `shadow-xs` → `0 1px 2px rgb(0 0 0 / 0.05)`
- Cards: `shadow-sm` → `0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`
- Popovers/dropdowns `shadow-md`; dialogs `shadow-lg`
- Every elevated surface also carries a 1px `#e5e5e5` border (in-app Nova cards use `ring-1 ring-foreground/10`).

### 3.4 Motion

150–300ms, `ease-out`. House animations: `fade-in` (opacity + 8px rise, 500ms), `fade-in-up` (16px rise, 400ms), accordion 200ms. Popovers: fade + 2% zoom + 8px slide from the trigger side. Attention: brand-purple box-shadow ring pulsing 40%→20%→0. Don't bounce; don't exceed ~500ms.

---

## 4. Component recipes

In-app: import from `@/components/ui/*` and let the primitive own these values — the numbers below are for external media and for judging whether something looks right.

### Buttons

Inline-flex, centered, 8px gap, `rounded-lg`, 14px/500, 16px icons, transition-all; disabled 50% opacity; focus 3px `ring` at 50%.

In-app sizes (Nova): `xs` 24px · `sm` 28px · `default` 32px · `lg` 36px, plus `icon-xs`/`icon-sm`/`icon`/`icon-lg`. External mockups may scale to 36px default / 40px lg.

| Variant | Recipe |
|---|---|
| default | bg `#392868`, white text; hover 80% opacity |
| outline | 1px `#e5e5e5`, page bg, shadow-xs; hover bg `#f5f5f5` |
| secondary | bg `#f5f5f5`, text `#171717` |
| ghost | transparent; hover bg `#f5f5f5` |
| destructive | **soft**: `#e7000b` @10% bg, `#e7000b` text |
| link | text `#392868`, underline on hover |

### Cards — strict anatomy (⭐ highest priority)

The card is the core Sarj surface; sloppy cards make the whole design look sloppy regardless of color.

**Container** — card bg, 1px `#e5e5e5` border (in-app: `ring-1 ring-foreground/10`), **14px radius**, shadow-sm. All together; a card missing its border or wearing a heavy shadow is off-brand. **One padding value on all four sides** — 16px in-app, 24px external; compact tiles may use less, but then *every* card in that group matches. Never nest a card in a card — group with spacing or a `#f5f5f5` inset panel (8px radius, 12–16px padding).

**Vertical rhythm (top → bottom)** — measure these, don't eyeball:
1. **Header**: title, optional description **4–6px** under it. Optional icon/action top-right on the title line, never below. Icon↔text gap **8px** (10–12px if the icon sits in a tinted square).
2. **16–24px** between header and body.
3. **Body**: rows separated by **12–16px** — one gap value per card. Icon↔label inside a row: **8px**, same every row.
4. Optional **footer**: 16–24px above; actions end-aligned, 8px apart.

No extra dividers between every row, no random 10/20px gaps. When something looks "off," it's almost always a padding or gap that broke the rhythm — fix spacing before touching color.

**Title hierarchy — exactly three levels**

| Level | Spec |
|---|---|
| Card title | 16px, 500–600, `#0a0a0a`, line-height snug, sentence case |
| Description | 14px, 400, `#737373`, directly under the title |
| Body labels | 12–14px medium `#737373` for labels; 14px `#0a0a0a` for values |

The card title is **never** purple, never 800-weight, never uppercase, never larger than the heading above it. One title per card. Need a sub-section? Use a 12px medium `#737373` label — not a second semibold title.

**Stat/KPI variant**: label first (13–14px medium `#737373`), value under it (28–36px, 600–700, `#0a0a0a`; purple only for THE hero number, max one per view), optional delta badge beside it, optional 16px icon top-right in an `#eeecfa` 8px-radius square. 8px label→value gap.

**Card grids**: equal heights per row, one gap everywhere — 16px (compact) or 24px (default), never both. 2–4 columns; align titles across a row.

### Badges

Pill, 12px medium, ~8px×2px padding, 4px gap, 12px icons. Variants: default (purple/white), secondary (`#f5f5f5`/`#171717`), outline, destructive (soft red), and soft statuses — success `#f0fdf4`/`#15803d`, warning `#fffbeb`/`#b45309`, info `#eff6ff`/`#1d4ed8`.

### Inputs / selects

36px height (sm 32px), `rounded-md`, 1px `#e5e5e5`, 12px padding-x, 14px text, placeholder `#737373`, shadow-xs. Focus: border → ring + 3px ring at 50%. Invalid: destructive border + 20% destructive ring.

### Tables

Header: 14px medium `#737373`, transparent bg, bottom border `#e5e5e5`. Rows: 14px foreground, row borders, hover `#f5f5f5`, selected `#eeecfa`. No zebra striping.

### Sidebar / navigation

Bg `#fafafa`, end-side border `#e5e5e5`. Items 14px medium, 8px radius; hover `#f5f5f5`; **active: bg `#eeecfa`, text `#4d3d80`** — the brand-tint signature, keep it in any nav mockup.

### Charts

**Purple only.** Single series solid `#392868`; multi-series the §1.5 ramp, darkest first. Gridlines `#e5e5e5`, axis labels 12px `#737373`, rounded bar corners 4–6px, 2px line width. Tooltip = popover recipe. No legend for a single series.

### Icons

Sparing and purposeful — Sarj is typographic, not icon-cluttered.

- **Real icon components only** (Lucide), one family, outline, 2px stroke. **Never emoji.**
- **No decorative scatter** — no icon next to every bullet, label, or card title just to fill space. If it carries no meaning, drop it.
- **In-UI: small and consistent** — 16px in buttons/inputs/rows (12px dense), 20px standalone nav/toolbar.
- **Feature/hero: big and deliberate** — 32–64px (up to ~96px for an empty state or slide hero) when the icon *is* the focal point. One per card/slide, usually in an `#eeecfa` square (8–12px radius) or brand purple.
- Color follows text: `#737373` supporting, `#392868` / `#4d3d80` brand, matching status color for status. Never multicolor.
- Directional icons flip in RTL (`rtl:rotate-180`).

---

## 4.5 Presentations & slide decks

**Slide frame** — 16:9, white bg, **64px padding all sides** (min 48px); content never touches the edge. One 8px grid deck-wide: every gap is 8/16/24/32/48/64. Max **one** hero color moment per slide.

**Title hierarchy** (identical on every content slide):
1. Optional kicker: 14–16px semibold `#392868`, uppercase with tracking — the one place uppercase is allowed.
2. Title: 32–40px bold (700) `#0a0a0a`, start-aligned, sentence case.
3. Optional subtitle: 18–20px regular `#737373`, 8px under.
4. **32–48px** between title block and body, consistent deck-wide.

Title/section slides may center; content slides are start-aligned. Never center body text on content slides.

**Body** — one idea per slide: a card grid, OR a chart, OR a comparison, OR a statement. Cards follow §4 exactly, 24px apart, 3 per row max (4 for small stat tiles). Bullets: max 5, 18–20px, 12–16px apart, one level deep — prefer a 2–3 stat-card row over a list of numbers. Charts: one per slide, title as a normal slide title (not inside the chart), footnote 12px `#737373` bottom-start. Statement slides: one sentence, 40–56px bold, at most one purple-highlighted phrase.

**Deck consistency checklist** — same padding, same title position and size on every slide (a viewer flipping through sees the title in the exact same spot). Optional footer 12px `#737373`: page number bottom-end, wordmark bottom-start, same everywhere. Whole deck uses ≤2 text grays (`#0a0a0a`, `#737373`) plus purple and status/chart colors only where data demands. No gradients, no stock-photo backgrounds, no shadow heavier than shadow-sm, no full-bleed purple except (optionally) cover and closing — those may invert to `#392868` bg with white and `#eeecfa` accents.

---

## 5. Copy-paste starter (external use)

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

:root {
  /* brand */
  --primary: #392868;          --primary-foreground: #ffffff;
  --primary-light: #6d6595;    --primary-dark: #281b4b;
  --primary-tint: #eeecfa;     --primary-tint-foreground: #4d3d80;
  /* neutrals (light) */
  --background: #ffffff;       --foreground: #0a0a0a;
  --card: #ffffff;             --card-foreground: #0a0a0a;
  --muted: #f5f5f5;            --muted-foreground: #737373;
  --secondary: #f5f5f5;        --secondary-foreground: #171717;
  --border: #e5e5e5;           --ring: #a1a1a1;
  --sidebar: #fafafa;
  /* status */
  --destructive: #e7000b;      --warning: #fe9a00;      --success: #16a34a;
  /* charts — brand-purple ramp only, darkest first */
  --chart-1: #281b4b; --chart-2: #392868; --chart-3: #4d3d80;
  --chart-4: #6d6595; --chart-5: #948fb3; --chart-6: #b9b6ce;
  /* shape & type */
  --radius: 10px;  --radius-md: 8px;  --radius-xl: 14px;
  --font-sans: 'Nunito', ui-sans-serif, system-ui, sans-serif;
  --shadow-xs: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}
body { font-family: var(--font-sans); color: var(--foreground); background: var(--background); }
```

Dark variant: swap neutrals per §1.4 (background `#0a0a0a`, card `#171717`, muted `#262626`, muted-foreground `#a1a1a1`, border `rgb(255 255 255 / 0.1)`); primary stays `#392868`.

## 6. Hard rules (any medium)

1. **One accent.** Brand purple is the only accent; status colors appear only for actual status. No rainbow UI. **Charts are brand-purple only** — differentiate by lightness (§1.5), never by adding hues.
2. **Icons purposeful, not decorative.** Real components only (never emoji), one family. Small (16–20px) inline; large (32–64px+) only as a focal point.
3. **Nunito everywhere.** Headings 600–800, body 400–500.
4. **Whitespace over lines.** Prefer spacing and the `#f5f5f5`/`#fafafa` surface steps; borders are 1px `#e5e5e5` when needed.
5. **Rounded, soft, calm.** 8–10px controls / 14px cards / pill badges; shadow-xs/sm; 150–300ms ease-out.
6. **White on purple, always** — never gray or purple-tinted text on `#392868`.
7. **Muted gray `#737373` for all secondary text** — don't invent intermediate grays.
8. **Cards follow §4 anatomy exactly** — one padding, one gap value per card, three-level title hierarchy. Consistent gaps matter more than any individual choice.
9. **In-app: tokens only** (`bg-primary`, not `#392868`). The hexes here are for media where tokens don't exist.
10. **RTL-aware in-app** (Arabic is first-class): logical properties (`ms-`/`me-`/`ps-`/`pe-`), flip directional icons.
