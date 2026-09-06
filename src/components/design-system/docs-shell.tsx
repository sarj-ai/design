"use client"

import Image from "next/image"
import Link from "next/link"
import * as React from "react"

import { AppHeader } from "@/components/app-shell"
import { PRIMITIVE_NAMES } from "@/components/design-system/component-catalog"
import {
  CloseIcon,
  SearchIcon,
  SectionToggleIcon,
} from "@/components/design-system/icons"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { BackIcon } from "@/components/workspace-icons"
import {
  DOCS_SECTIONS,
  type DocsPage,
  type DocsSection,
} from "@/lib/design-system-data"
import { cn } from "@/lib/utils"

/**
 * A rail entry while a search is running.
 *
 * Same shape the rail always renders, plus the primitive names that matched
 * under it — the only thing a search puts in the rail that is not otherwise in
 * it, and it hangs off the shelf it belongs to rather than floating loose.
 */
type RailPage = DocsPage & { primitives?: string[] }
type RailGroup = { label?: string; pages: RailPage[] }
type RailSection = DocsPage & { groups: RailGroup[] }

/**
 * The documentation shell: a rail listing every topic, and one topic open
 * beside it.
 *
 * The rail replaces a tab strip that had grown to twelve triggers on two
 * wrapped lines — at that width a tab strip stops being a switch and starts
 * being a list that happens to be horizontal. A rail holds the same list in
 * the shape a list wants, keeps the section it sits under visible, and has
 * room for the twelve primitive groups the strip could never have carried.
 *
 * Views arrive as a prop rather than being built here: the route file stays
 * the place the content lives, which is where anyone editing this page will
 * look first. A topic with no entry in `views` falls back to its section's
 * index — that is what a section header opens.
 */
/**
 * Marks a topic whose answer is ours rather than an inherited default.
 *
 * A dot rather than a word: it sits in a 15rem rail beside titles that already
 * fill it, and a badge saying "custom" on a third of the rows would be read
 * once and then be noise on every visit. `title` carries the meaning for
 * anyone who wants it, and the dot is `aria-hidden` so a screen reader gets
 * the sentence instead of a bullet.
 */
function SarjDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-full bg-primary", className)}
      title="A decision of ours, not a default"
    />
  )
}

export function DesignSystemDocs({
  views,
}: {
  /** Topic id → what its pane renders. */
  views: Record<string, React.ReactNode>
}) {
  const [active, setActive] = React.useState(DOCS_SECTIONS[0].id)
  const [query, setQuery] = React.useState("")

  const term = query.trim().toLowerCase()

  /* Sections open independently. Switching topic never closes a section the
     reader opened — the rail is a map, and a map that rearranges itself under
     you is not one. */
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    [DOCS_SECTIONS[0].id]: true,
  })

  const section =
    DOCS_SECTIONS.find(
      (candidate) =>
        candidate.id === active ||
        candidate.groups.some((group) =>
          group.pages.some((page) => page.id === active),
        ),
    ) ?? DOCS_SECTIONS[0]

  const page =
    section.id === active
      ? section
      : (section.groups
          .flatMap((group) => group.pages)
          .find((candidate) => candidate.id === active) ?? section)

  /* What the rail lists right now: everything, or what the query reaches.
     The search has to reach inside the twelve primitive shelves and not just
     their twelve titles — the rail is how a reader finds out that `Tooltip`
     exists at all, and "Overlays" does not say so. */
  const rail = React.useMemo<RailSection[]>(() => {
    if (!term) return DOCS_SECTIONS

    return DOCS_SECTIONS.flatMap((section) => {
      /* A section whose own title matches keeps everything under it. The match
         is the section, so narrowing what is in it answers a question nobody
         asked. */
      if (section.title.toLowerCase().includes(term)) return [section]

      const groups = section.groups.flatMap((group) => {
        const pages = group.pages.flatMap((page) => {
          const primitives = (PRIMITIVE_NAMES[page.id] ?? []).filter((name) =>
            name.toLowerCase().includes(term),
          )

          if (!primitives.length) {
            return page.title.toLowerCase().includes(term) ? [page] : []
          }

          return [{ ...page, primitives }]
        })

        return pages.length ? [{ ...group, pages }] : []
      })

      return groups.length ? [{ ...section, groups }] : []
    })
  }, [term])

  function openSection(id: string) {
    /* One control, two jobs: it opens the section's index, and it opens the
       section. Pressing the one you are already on is what closes it again —
       a second chevron button beside the label would be a hit target the
       whole rail pays for so that one row can be shut. */
    setOpen((current) => ({
      ...current,
      [id]: active === id ? !current[id] : true,
    }))
    setActive(id)
  }

  return (
    /* The app's own chrome, so the reference reads as a page of the product
       rather than a site beside it: same 15rem inset rail, same header row. */
    <SidebarProvider
      className="min-h-0 flex-1"
      style={{ "--sidebar-width": "15rem" } as React.CSSProperties}
    >
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="px-2 pt-2 pb-1">
          <div className="flex items-center justify-between group-data-[state=collapsed]:justify-center">
            <Image
              alt="sarj.ai"
              className="group-data-[state=collapsed]:hidden"
              height={32}
              priority
              src="/logo.png"
              width={56}
            />
            <SidebarTrigger className="size-8 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground [&>svg]:size-5" />
          </div>

          {/* In the header rather than at the top of the list it filters: a
              field that scrolls away from its own results is one you lose the
              moment you start reading them. */}
          <InputGroup className="group-data-[state=collapsed]:hidden">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search topics and components"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("")
              }}
              placeholder="Search"
              value={query}
            />

            {/* Absent until there is something to clear. */}
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  size="icon-xs"
                >
                  <CloseIcon />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        </SidebarHeader>

        <SidebarContent className="gap-0 py-2">
          {rail.map((entry) => (
            <DocsSectionNav
              active={active}
              key={entry.id}
              onSelect={setActive}
              onToggle={openSection}
              /* Whatever a search leaves standing is open: a match inside a
                 collapsed section is a match the reader is shown and cannot
                 reach. Clearing the field restores what they had open. */
              open={term ? true : (open[entry.id] ?? false)}
              section={entry}
            />
          ))}

          {rail.length === 0 ? (
            <p className="px-4 py-2 text-sm text-muted-foreground">
              Nothing matches.
            </p>
          ) : null}
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0 overflow-hidden">
        {/* The way back to the index, in the row that is already there. The
            page carried a second bar above this one for the same one link. */}
        <AppHeader
          actions={
            <Button asChild size="sm" variant="outline">
              <Link href="/">
                <BackIcon />
                All mockups
              </Link>
            </Button>
          }
          trail={["Design system", page.title]}
        />
        {/* No gutter here: the page owns its p-3 lg:p-4, as the app's do. */}
        <div className="min-h-0 flex-1 overflow-auto">
          {/* Keyed on the topic so React replaces the pane rather than patching
              it, which is what gives the new one an entrance to play. The old
              one leaves without an exit on purpose: crossfading two panes needs
              both of them positioned absolutely, and two documents of different
              heights stacked on each other is a layout problem bought to solve
              a 200ms one.

              One stage, not a stagger. The title and the body arrive together
              because they are one thing arriving — sequencing them would be
              motion answering a question nobody asked, on a surface a reader
              switches a dozen times in a sitting.

              The travel is horizontal, from the rail's side. Vertically it
              read as the page scrolling itself, which is the one thing this
              pane also genuinely does. */}
          <main
            className="flex animate-pane-in flex-col gap-8 p-3 motion-reduce:animate-none lg:p-4"
            key={active}
          >
            <header className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">{page.title}</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {page.description}
              </p>
            </header>

            {views[active] ?? (
              <SectionIndex onSelect={setActive} section={section} />
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

/** One top-level entry and everything filed under it. */
function DocsSectionNav({
  active,
  onSelect,
  onToggle,
  open,
  section,
}: {
  active: string
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  open: boolean
  section: RailSection
}) {
  return (
    <Collapsible open={open}>
      <SidebarGroup className="py-1">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                aria-current={active === section.id ? "page" : undefined}
                aria-expanded={open}
                isActive={active === section.id}
                onClick={() => onToggle(section.id)}
              >
                <SectionToggleIcon
                  className={cn(
                    "transition-transform duration-200 ease-out-cubic motion-reduce:transition-none",
                    open ? "rotate-0" : "-rotate-90 rtl:rotate-90",
                  )}
                />
                <span className="truncate">{section.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>

        <CollapsibleContent>
          {section.groups.map((group, index) => (
            <SidebarGroupContent key={group.label ?? index}>
              {group.label ? (
                <SidebarGroupLabel className="ps-8">
                  {group.label}
                </SidebarGroupLabel>
              ) : null}

              {/* Indented to the width of the chevron above it, so a leaf's
                  label starts where its section's label starts. */}
              <SidebarMenu className="ps-6">
                {group.pages.map((entry) => (
                  <SidebarMenuItem key={entry.id}>
                    <SidebarMenuButton
                      aria-current={active === entry.id ? "page" : undefined}
                      isActive={active === entry.id}
                      onClick={() => onSelect(entry.id)}
                    >
                      <span className="truncate">{entry.title}</span>
                      {entry.sarj ? <SarjDot className="ms-auto" /> : null}
                    </SidebarMenuButton>

                    {/* The primitives a search matched, under the shelf they
                        are on. Mono, because a component name is something you
                        type and a topic title is not — and they open the shelf
                        rather than a page of their own, which is why none of
                        them ever reads as the current one. */}
                    {entry.primitives?.length ? (
                      <SidebarMenuSub>
                        {entry.primitives.map((name) => (
                          <SidebarMenuSubItem key={name}>
                            <SidebarMenuSubButton asChild>
                              <button
                                onClick={() => onSelect(entry.id)}
                                type="button"
                              >
                                <span className="truncate font-mono">
                                  {name}
                                </span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          ))}
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

/**
 * What a section header opens: everything filed under it, with the line each
 * topic opens with, as a way in that does not require reading the rail.
 */
function SectionIndex({
  onSelect,
  section,
}: {
  onSelect: (id: string) => void
  section: DocsSection
}) {
  return (
    <div className="flex flex-col gap-8">
      {section.groups.map((group, index) => (
        <section className="flex flex-col gap-4" key={group.label ?? index}>
          {group.label ? (
            <h2 className="text-lg font-semibold">{group.label}</h2>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.pages.map((page) => (
              <Item asChild key={page.id} variant="outline">
                <button
                  className="h-full items-start text-start hover:bg-muted"
                  onClick={() => onSelect(page.id)}
                  type="button"
                >
                  <ItemContent>
                    <ItemTitle className="flex items-center gap-2">
                      {page.title}
                      {page.sarj ? <SarjDot /> : null}
                    </ItemTitle>
                    <ItemDescription>{page.description}</ItemDescription>
                  </ItemContent>
                </button>
              </Item>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
