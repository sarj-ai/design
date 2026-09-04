"use client"

import * as React from "react"

import { SectionToggleIcon } from "@/components/design-system/icons"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DOCS_SECTIONS, type DocsSection } from "@/lib/design-system-data"
import { cn } from "@/lib/utils"

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
export function DesignSystemDocs({
  views,
}: {
  /** Topic id → what its pane renders. */
  views: Record<string, React.ReactNode>
}) {
  const [active, setActive] = React.useState(DOCS_SECTIONS[0].id)

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
    <SidebarProvider className="min-h-0 flex-1 items-start">
      {/* Pinned under the mockup shell's own 48px header, with its own scroll:
          the rail is longer than the pane on the short topics and shorter on
          the long ones, and neither should drag the other. */}
      <Sidebar
        className="sticky top-12 h-[calc(100svh-3rem)] border-e"
        collapsible="none"
      >
        <SidebarContent className="gap-0 py-2">
          {DOCS_SECTIONS.map((entry) => (
            <DocsSectionNav
              active={active}
              key={entry.id}
              onSelect={setActive}
              onToggle={openSection}
              open={open[entry.id] ?? false}
              section={entry}
            />
          ))}
        </SidebarContent>
      </Sidebar>

      <div className="min-w-0 flex-1">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-8">
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
  section: DocsSection
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
                    </SidebarMenuButton>
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
                    <ItemTitle>{page.title}</ItemTitle>
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
