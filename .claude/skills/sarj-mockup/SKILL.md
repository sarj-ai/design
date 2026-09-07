---
name: sarj-mockup
description: Build any page, screen, mockup, or UI in this repo using ONLY the shadcn primitives in src/components/ui and ONLY the brand tokens in src/app/globals.css — never hand-rolled markup, never a hex/oklch/raw-Tailwind color. Use whenever asked to create, mock up, design, prototype, build, or restyle a page, screen, dashboard, form, landing page, component, or any visual UI in this project.
---

# Sarj Mockup

Turn a request like *"make me a billing dashboard"* into a page that looks like it shipped from the Sarj design system. Two inputs, nothing else: **the primitives in `src/components/ui/`** and **the tokens in `src/app/globals.css`**.

For what the brand *is* (hex values, the purple ramp, typography, the reasoning behind a rule) see the `sarj-brand` skill. This skill is the build procedure.

**Ten of the rules below are enforced by `npm run lint`.** The `sarj-lint` skill is
the rule-by-rule reference — what each one bans, why, and exactly what to write
instead. Read it before writing a className; it is faster than fixing errors after.

---

## The three laws

Everything below is elaboration. These three are the whole job:

1. **Every visual element is a `@/components/ui/*` primitive.** If you typed `<div className="rounded-lg border p-4 shadow-sm">`, you rebuilt `<Card>` — delete it and import the real one.
2. **Every color is a semantic token.** No `#hex`, no `oklch()`, no `rgb()`, no `bg-purple-600`, no `text-gray-500`, no inline `style` color. If a color isn't in `globals.css`, you don't get to use it.
3. **Layout is the only thing you write by hand** — and only with scale spacing (`gap-4`, `p-6`, `grid-cols-3`). Never `gap-[13px]`.

A mockup that breaks any of these is wrong even if it looks fine in isolation, because it silently breaks dark mode and the `tasama` whitelabel.

---

## Step 0 — look at how this is already solved

Before drawing anything, spend one step on reference. Skip only if the ticket is a small change to an existing screen.

**Mobbin MCP, if it is connected** (look for a tool whose name contains `mobbin` — it is not always available). Search the pattern you are about to build: empty state, filter bar, bulk select, multi-step form, permissions screen, destructive confirm. Read two or three real examples.

What you are looking for:

| Take | Leave |
|---|---|
| Layout and hierarchy — what sits where, what leads | Their colors, type, radius, spacing, shadows |
| The interaction sequence — what happens in what order | Their features, fields, tabs, and screens |
| **Which states exist** — empty, loading, partial, error, over-limit | Their information architecture |
| What the affordances are called | Their brand voice |

The states column is the one that matters most. Production apps handle cases you would not think to draw, and a mockup missing its empty state is the most common thing that comes back in review.

The two lines you must not cross:

1. **Reference tells you *how*, never *what*.** The ticket, PRD, and attached screenshots are the entire spec. A reference app having a feature is not a reason to build it — see the scope rules in `AGENTS.md`.
2. **Structure travels, styling does not.** Everything visual still comes from the tokens in `globals.css` and the primitives in `src/components/ui/`. `npm run lint` will catch you if it leaks.

Then **say what you referenced** in your reply — which apps, what you took, one line.

**`ui-ux-pro-max` skill.** For UX guidelines, product-type patterns, and chart selection: `ux-guidelines.csv`, `products.csv`, `ui-reasoning.csv`, `charts.csv`. Ignore its `colors.csv`, `google-fonts.csv`, `typography.csv`, and `styles.csv` — generic palettes and font pairings contradict this repo's tokens and Nunito.

If neither is available, say so once and design from the rules here. Don't invent what a reference app does.

## Step 1 — map the request to primitives before writing anything

Sixty primitives are installed. Almost nothing needs to be built. Find yours here first:

| You need | Import |
|---|---|
| Page section / panel / tile | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` |
| Any clickable action | `Button` · grouped: `ButtonGroup`, `ButtonGroupSeparator` |
| Status / count / label chip | `Badge` |
| A list row (icon + title + description + actions) | `Item`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`, `ItemGroup` |
| Form field + label + help + error | `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`, `FieldLegend` |
| Text entry | `Input`, `Textarea`, `InputGroup` (+ `InputGroupAddon`, `InputGroupButton`, `InputGroupInput`), `InputOTP` |
| Choice | `Select`, `NativeSelect`, `Combobox`, `RadioGroup`, `Checkbox`, `Switch`, `Slider`, `ToggleGroup`, `Toggle` |
| Data grid | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` |
| Charts | `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent` (Recharts inside) |
| App shell / nav | `Sidebar` family + `SidebarProvider`, `SidebarInset`; `NavigationMenu`, `Menubar`, `Breadcrumb`, `Tabs` |
| Overlays | `Dialog`, `AlertDialog`, `Sheet`, `Drawer`, `Popover`, `HoverCard`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `Command`/`CommandDialog` |
| Inline notice | `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction` |
| "Nothing here yet" | `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` |
| Loading | `Skeleton`, `Spinner`, `Progress` |
| People | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`, `AvatarBadge` |
| Chat / messages | `Message` family, `Bubble` family, `MessageScroller`, `Attachment` family |
| Misc | `Accordion`, `Collapsible`, `Carousel`, `Calendar`, `Separator`, `ScrollArea`, `Resizable`, `AspectRatio`, `Pagination`, `Kbd`, `Marker`, `Label` |
| Toasts | `toast()` from `sonner` — `<Toaster />` is already mounted in `layout.tsx` |

Anything genuinely missing: `npx shadcn@latest add <name>`. Do **not** hand-roll it.

## Step 2 — use the primitive as-is

The primitives already encode the brand: padding, radius, ring, type size, hover, focus, dark mode. **Your `className` is for layout only.**

```tsx
// ✅ className adds layout, nothing else
<Card className="col-span-2">
  <CardHeader>
    <CardTitle>Monthly spend</CardTitle>
    <CardDescription>Billing period to date</CardDescription>
    <CardAction><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></CardAction>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">…</CardContent>
</Card>

// ❌ every one of these fights the primitive
<Card className="rounded-xl border p-6 shadow-sm bg-white" />
<CardTitle className="text-lg font-bold text-[#392868]" />
<Button className="h-10 rounded-md bg-primary px-4 text-white" />
```

Specifics that trip people up in this repo:

- **`Card` owns its own padding** via `--card-spacing` (16px; 12px with `size="sm"`). Never add `p-*` to `Card`. Use `size="sm"` for dense tiles — and then every card in that group uses it.
- **`Card` uses `ring-1 ring-foreground/10`, not `border`.** Don't add a border.
- **`CardTitle` is `text-base font-medium`.** Don't upgrade it to `text-lg font-bold`, don't color it purple. One title per card.
- **`Button` sizes are `xs | sm | default | lg` + `icon-xs | icon-sm | icon | icon-lg`.** Never set `h-*` or `px-*` yourself.
- **`Button`/`Badge` `variant="destructive"` is a soft tint** (`bg-destructive/10 text-destructive`), not solid red. That's intentional — don't "fix" it.
- **`Badge` is already a pill** (`rounded-4xl`, `h-5`, `text-xs`).
- **`DrawerContent` for `direction="left|right"` pins itself to `sm:max-w-sm`** via a direction-scoped class that outranks a plain `sm:max-w-2xl`. A wide side panel needs the important modifier — `className="sm:max-w-3xl!"`. This is the one place overriding a primitive's width is expected.
- Compose classes with `cn()` from `@/lib/utils`. Never string-concatenate.

## Step 3 — color: tokens only

These are the only color names that exist. Use them with a `bg-` / `text-` / `border-` / `ring-` prefix.

**Surfaces** `background` · `card` · `popover` · `muted` · `secondary` · `accent` · `sidebar`
**Text** `foreground` · `muted-foreground` — plus the `-foreground` pair for every surface
**Brand** `primary` / `primary-foreground` · `primary-tint` / `primary-tint-foreground` (the `#eeecfa` selected-row & icon-container surface) · `primary-highlight` · `primary-light` · `primary-dark`
**Intent** `destructive` · `warning` · `success` — each with a `-foreground`
**Lines** `border` · `input` · `ring`
**Sidebar** `sidebar-foreground` · `sidebar-primary` · `sidebar-accent` · `sidebar-border` · `sidebar-ring`
**Charts** `chart-1` … `chart-6`

Always use a surface with its own foreground — `bg-card text-card-foreground`, `bg-primary text-primary-foreground` — so contrast survives a theme flip.

```tsx
// ❌ dead on theme flip, dead under the whitelabel
<div className="bg-[#392868] text-white" />
<p className="text-gray-500" />
<span className="bg-purple-100 text-purple-800" />
<div style={{ borderColor: "#e5e5e5" }} />

// ✅
<div className="bg-primary text-primary-foreground" />
<p className="text-muted-foreground" />
<span className="bg-primary-tint text-primary-tint-foreground" />
<div className="border-border" />
```

**Charts are one hue.** `--chart-1..6` is a purple ramp built from `--primary`, darkest first — never a rainbow. Single series → `var(--color-chart-2)`. Multiple → walk the ramp in order. To spotlight one bar, give it `chart-2` and mute the rest to `chart-6`. Axes and gridlines stay `border` / `muted-foreground`. Cap at 6 series; past that, split the chart.

**Typography needs no classes.** Nunito is already the `font-sans` default on `<html>`. Never set a font family. Size/weight come from the primitives; for your own text use `text-sm`/`text-base`/`text-lg`/`text-xl`/`text-2xl` with `font-medium` or `font-semibold`. Never below `text-xs`.

## Step 4 — layout: one grid, one rhythm

This is what separates a clean mockup from a cheap one. **Correct colors on badly-spaced layout still looks cheap.**

Every gap comes from the 4px scale — `gap-2` (8) · `gap-3` (12) · `gap-4` (16) · `gap-6` (24) · `gap-8` (32). Never `gap-[Npx]`.

| Relationship | Value |
|---|---|
| Icon ↔ its label | `gap-2` |
| Rows inside a card | `gap-3` or `gap-4` — **pick one per card** |
| Card ↔ card in a grid | `gap-4` (compact) or `gap-6` (default) — **pick one per page** |
| Page section ↔ section | `gap-6` to `gap-8` |
| Page padding | `p-6` to `p-8`, `max-w-350 mx-auto` (1400px) |

Hierarchy: exactly one `<h1>`-weight page title, then section headings, then card titles. A card title is never larger than the section heading above it. Descriptions go in `text-muted-foreground` directly under their title.

Grids: equal columns, `md:grid-cols-2 lg:grid-cols-3`, 3 per row max (4 only for small stat tiles). Never nest a `Card` inside a `Card` — group with spacing or a `bg-muted rounded-lg p-4` inset panel.

**RTL-safe:** use `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-start`/`text-end`, never `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`/`text-left`/`text-right`. Flip directional icons with `rtl:rotate-180`.

**Icons:** HugeIcons only, never emoji, never a second icon set — mixed stroke weights are what make a UI read as assembled rather than built.

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings01Icon } from "@hugeicons/core-free-icons"

<HugeiconsIcon icon={Settings01Icon} />
```

(`lucide-react` stays inside `src/components/ui/` only — shadcn regenerates those files. Never import it into a page or feature component.)

16px inline (the primitives size them automatically — just drop the icon in). Large 32–64px only when the icon *is* the point (empty state, feature card), usually inside a `bg-primary-tint rounded-lg p-2` square. No decorative icon next to every label.

**Shadows:** none. Depth is `<Card>`'s `ring-1 ring-foreground/10`, or a `bg-muted rounded-lg p-4` inset. If it genuinely floats it is an overlay — `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, which bring their own.

**Stacking:** name the layer, never pick a number. `z-raised` (10) · `z-sticky` (20) · `z-nav` (30) · `z-overlay` (40) · `z-modal` (50) · `z-popover` (60) · `z-toast` (70) · `z-tooltip` (80). `z-modal` is 50, matching the shadcn overlays, so anything that must sit above a dialog is `z-popover` or higher.

**Motion:** `duration-150` hover/press · `duration-200` tooltip, popover, dropdown · `duration-200`–`300` dialog, drawer. Nothing over 300ms. Easing is `ease-out-cubic` (entering/leaving) or `ease-in-out-cubic` (moving/resizing) — never a raw `cubic-bezier()`. Animate transform and opacity only, never `transition-all`. Every animated element carries `motion-reduce:transition-none` or `motion-reduce:animate-none`, with no exception for opacity. Full reasoning: the `web-animation-design` skill.

## Step 5 — visual hierarchy & alignment

Spacing decides how much room things get; **alignment decides whether it looks built or assembled.** Both are mechanical — apply the rules, don't eyeball.

### One start edge

Everything in a column shares one inline-start edge: heading, description, body, inputs, helper text. Media (icon, avatar, checkbox) lives in its own column *outside* that edge and never pushes the text column in and out between rows. If two sibling rows have text starting at different x positions, that's a bug.

A separated band — a header or footer with its own `border-b`/`border-t` — is its own zone and may carry leading media that indents its text. Consistency is required *within* a zone, not across a divider.

### Icon ↔ text — the three cases

The single most common alignment mistake. Match the icon to **the line it labels**, not to the block it sits beside:

| The icon labels… | Rule |
|---|---|
| **One line** (button, badge, table row, menu item, nav item) | `flex items-center gap-2` — optical centers coincide |
| **A 2-line title + description block** | Wrap icon + text in `flex items-center gap-3`. A 32–40px tinted square optically balances exactly two lines. |
| **A 3+ line block**, or the icon is text-sized | `items-start` — the icon centers on the *first line*, never on the whole block |

A 36px icon `items-start` against two lines floats above the title. The same icon centered against a five-line paragraph sits in the middle of nowhere. Both read as sloppy for the same reason: the icon lost its relationship to the line it belongs to.

### Trailing actions pin to the first line

Close buttons, `CardAction` menus, "Use Template" buttons — align to the **title's line** via `self-start` (or `items-start` on the row), never to the vertical middle of a multi-line block. `CardAction` already does this; don't fight it.

### Label ↔ control on one row

When a section label and its control share a row ("Calling Window" + a Restrict checkbox), both are single-line, so center them on each other: `flex items-center justify-between gap-4`.

### Proximity encodes hierarchy

The gap between a title and its own description must be **visibly tighter** than the gap to the next block. When those two gaps are close in value the hierarchy collapses and the whole surface reads as one flat list.

| Pair | Gap |
|---|---|
| Title → its own description | `gap-0.5`–`gap-1` (2–4px) |
| Label → its control | `gap-2` (8px) |
| Control → its helper text | `gap-1`–`gap-2` |
| Block → next block | `gap-4`–`gap-6` (16–24px) |
| Section → next section | `gap-6`–`gap-8`, or a `FieldSeparator` |

Rule of thumb: **the gap inside a group is at most half the gap between groups.**

### Hierarchy comes from weight and color, not size

Step down one property at a time:

`text-base font-medium text-foreground` (title) → `text-sm text-muted-foreground` (description) → `text-sm text-foreground` (body value)

Three levels is the maximum on one surface; a fourth means the content needs splitting, not a smaller font. Never jump two steps (`text-xl` straight to `text-xs`), never shrink text to mean "less important" when `text-muted-foreground` says it better, and never let a child heading outweigh its parent.

### Icon size tracks text size

16px icon with 14px text; 20px with 16–18px; 24px+ only standalone or hero. A 24px icon beside 14px text always looks wrong. The primitives size icons automatically — if you're writing `size-*` on an icon inside a `Button`/`Badge`/`Item`, you're probably fixing the wrong thing.

### Align across siblings

Cards in a row need **identical header structure** so their titles land on one baseline. If one card has a description and its neighbour doesn't, either give them all one or move it into the body. Ragged sibling headers are the most common "this looks unfinished" tell.

### Start-align by default

Body text, labels, and headings are `text-start`. Center only inside `Empty` states and short dialog confirmation copy. Numbers in tables end-align, and their column header end-aligns with them.

## Step 6 — page skeleton

Start every mockup page from this shape:

```tsx
export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-350 flex-col gap-8 p-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Page title</h1>
          <p className="text-sm text-muted-foreground">One-line description.</p>
        </div>
        <Button>Primary action</Button>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Cards — same structure in every sibling */}
      </section>
    </main>
  )
}
```

Mock data goes in a `const` array above the component. Keep it realistic — real-looking names, plausible numbers, varied string lengths — a mockup full of "Lorem ipsum" and "Item 1" reads as unfinished.

---

## Reject list — do not ship a mockup containing any of these

- A `#hex`, `oklch()`, `rgb()`, or `style={{ color/background }}` literal → use a token
- `bg-blue-500`, `text-gray-400`, `border-slate-200` → use the semantic token
- A hand-built `<div>` that duplicates an installed primitive → import the primitive
- `p-*` on a `Card`, or `h-*`/`px-*` on a `Button` → the primitive already sets it
- `gap-[13px]`, `mt-[18px]`, `rounded-[10px]` → snap to the scale
- A `font-family` declaration → Nunito is already global
- Two different card gaps or two different card paddings in one view → pick one
- A card title in purple, bold-700, or uppercase → `CardTitle` as-is
- Rainbow chart colors → the `chart-1..6` purple ramp
- Emoji, `lucide-react`, or a second icon set in a page or feature component → HugeIcons
- `shadow-md`, `hover:shadow-lg`, `drop-shadow-*` → mockups are flat; use `<Card>`'s ring or an overlay primitive
- `z-50`, `z-[9999]` → name the layer: `z-modal`, `z-popover`, `z-toast`
- `duration-500`, `ease-out`, `ease-[cubic-bezier(…)]` → `duration-200`, `ease-out-cubic`
- A `transition-*` or `animate-*` with no `motion-reduce:` counterpart → add it, opacity included
- `transition-all` or `transition-[width]`/`[height]` → animate transform and opacity
- `ml-`/`pr-`/`text-left` → logical properties
- A 32–40px icon `items-start` beside a two-line title block → center icon and text together
- A trailing action (close, menu, button) centered on a multi-line block → pin it to the title line
- Title→description gap the same size as block→block gap → tighten the inner one
- Sibling cards in a row with different header structures → make them identical
- Four type levels on one surface, or a size jump used where muted color would do

## Self-check before returning

1. Grep your own output for `#`, `oklch(`, `rgb(`, `style={{` — zero hits.
2. Every visual element traces to an `@/components/ui/*` import.
3. One card padding, one card gap, one grid across the whole page.
4. **Trace one vertical line down each column** — does every text row start on it?
5. **Check every icon against the line it labels** — centered on one line, centered on a two-line block, or top-aligned to the first line of a long one.
6. **Compare the gap inside each group to the gap between groups** — the inner one must be visibly smaller.
7. Toggle `class="dark"` on `<html>` mentally: does anything go invisible? If you used only tokens, no.
8. Run `npm run lint` — zero `sarj/*` errors in the files you touched.
9. Run `npm run build` — it must compile.
