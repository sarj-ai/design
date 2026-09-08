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
import { docsHref } from "@/lib/design-system-nav"
import { CopyLinkButton } from "@/components/design-system/copy-link-button"
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
 * look first. Every topic has one; a section does not, because a section is a
 * shelf in the rail rather than a page.
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
  activeId,
  page,
  section,
  views,
}: {
  /** The rail entry that reads as current. Empty on the overview. */
  activeId: string
  /** The topic whose pane is open, or null on the overview. */
  page: DocsPage | null
  /** The section that topic sits under, or null on the overview. */
  section: DocsSection | null
  /** Topic id → what its pane renders. */
  views: Record<string, React.ReactNode>
}) {
  const [query, setQuery] = React.useState("")

  const term = query.trim().toLowerCase()

  /* Sections open independently, and the one being read starts open. An
     override map rather than initial state: the reader arrives by URL, so the
     section that has to be open is not known until render, and a rail that
     collapsed the row you just landed on would hide where you are. */
  const [open, setOpen] = React.useState<Record<string, boolean>>({})

  const openFor = (id: string) => open[id] ?? id === section?.id

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

  function toggleSection(id: string) {
    /* One job: open the shelf, or shut it. A section is not a page — pressing
       its row has never had a second thing to mean. */
    setOpen((current) => ({
      ...current,
      [id]: !(current[id] ?? id === section?.id),
    }))
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
              active={activeId}
              key={entry.id}
              onToggle={toggleSection}
              /* Whatever a search leaves standing is open: a match inside a
                 collapsed section is a match the reader is shown and cannot
                 reach. Clearing the field restores what they had open. */
              open={term ? true : openFor(entry.id)}
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
            <>
              {/* Every topic has an address now, so the one thing a reader
                  wants from a reference page — hand this exact page to someone
                  — is a control rather than a trip to the address bar. */}
              <CopyLinkButton />
              <Button asChild size="sm" variant="outline">
                <Link href="/">
                  <BackIcon />
                  All mockups
                </Link>
              </Button>
            </>
          }
          trail={
            page && section && page.id !== section.id
              ? ["Design system", section.title, page.title]
              : ["Design system", ...(page ? [page.title] : [])]
          }
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
            key={activeId}
          >
            <header className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">
                {page ? page.title : "Design system"}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {page
                  ? page.description
                  : "Every rule, pattern and primitive the product is built from. Each topic is its own address, so any one of them can be sent on its own."}
              </p>
            </header>

            {page ? views[activeId] : <DocsOverview />}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

/** One top-level entry and everything filed under it. */
function DocsSectionNav({
  active,
  onToggle,
  open,
  section,
}: {
  /** The topic that reads as current, if it is one of this section's. */
  active: string
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
                aria-expanded={open}
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
                      asChild
                      isActive={active === entry.id}
                    >
                      <Link href={docsHref(entry.id)}>
                        <span className="truncate">{entry.title}</span>
                        {entry.sarj ? <SarjDot className="ms-auto" /> : null}
                      </Link>
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
                              <Link href={docsHref(entry.id)}>
                                <span className="truncate font-mono">
                                  {name}
                                </span>
                              </Link>
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
 * What `/design-system` itself opens: every topic, filed under its section.
 *
 * The root used to be whichever section happened to be first in the rail,
 * which made the shortest link in the system — the one anybody sends — open a
 * page about colour rather than a map. A reader who was sent the root wants to
 * know what is in here; a reader who wants colour was sent the colour link.
 *
 * The topics themselves rather than a count of them, because a section is no
 * longer a page: this is the one place a reader who has not learned the rail
 * can see the whole system at once, and a card that only said "12 topics"
 * would have nowhere left to send them.
 */
function DocsOverview() {
  return (
    /* Stretched, not ragged: five cards of five different heights read as five
       unrelated things. `grow-0` on the content below is what keeps each list
       under its description rather than pushed to the floor of the card. */
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {DOCS_SECTIONS.map((section) => (
        <Item
          className="flex-col flex-nowrap items-start gap-4"
          key={section.id}
          variant="outline"
        >
          {/* `grow-0`: ItemContent is `flex-1`, which in a column stretched to
              the tallest card in the row would push the list to the floor. */}
          <ItemContent className="grow-0">
            <ItemTitle className="flex items-center gap-2">
              {section.title}
              {section.sarj ? <SarjDot /> : null}
            </ItemTitle>
            <ItemDescription>{section.description}</ItemDescription>
          </ItemContent>

          {section.groups.map((group, index) => (
            <div
              className="flex w-full flex-col gap-0.5"
              key={group.label ?? index}
            >
              {group.label ? (
                <p className="px-2 pb-1 text-xs font-medium">{group.label}</p>
              ) : null}

              {group.pages.map((page) => (
                <Link
                  className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  href={docsHref(page.id)}
                  key={page.id}
                >
                  {page.title}
                </Link>
              ))}
            </div>
          ))}
        </Item>
      ))}
    </div>
  )
}
