"use client"

import Image from "next/image"
import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  BatchCallsIcon,
  BuildingIcon,
  ChevronDownIcon,
  ConversationsIcon,
  DashboardIcon,
  DeveloperDocsIcon,
  GlobalPromptsIcon,
  IntegrationsIcon,
  KeyIcon,
  KnowledgeIcon,
  MessagingIcon,
  MessagingSettingsIcon,
  MobileIcon,
  ModelsIcon,
  NewItemIcon,
  PersonasIcon,
  PlaygroundIcon,
  QualityIcon,
  ReportsIcon,
  RolesIcon,
  ScenariosIcon,
  SettingsIcon,
  TasksIcon,
  TelephonyIcon,
  TemplateIcon,
  VariablesIcon,
  VoiceLibraryIcon,
  WebhooksIcon,
} from "@/components/app-shell-icons"

/**
 * The app around any mockup screen, shared by every mockup that wants the
 * product chrome: an inset sidebar over a tinted page, and a header carrying
 * the breadcrumb and the account. Pass `active` to highlight the nav item the
 * screen lives under.
 *
 * Playground sits above the groups rather than inside one — it is the entry
 * point, not a build step. Configuration starts closed because it is the group
 * you visit once and then leave alone.
 */

interface NavItem {
  /** Label for the hover "+", on the two things you create most. */
  action?: string
  icon: React.ComponentType
  title: string
}

const PLAYGROUND: NavItem = { icon: PlaygroundIcon, title: "Playground" }

const NAV: { defaultOpen: boolean; items: NavItem[]; label: string }[] = [
  {
    defaultOpen: true,
    label: "Agents",
    items: [
      { action: "New persona", icon: PersonasIcon, title: "Personas" },
      { action: "New scenario", icon: ScenariosIcon, title: "Scenarios" },
      { icon: KnowledgeIcon, title: "Knowledge Bases" },
      { icon: BatchCallsIcon, title: "Batch Calls" },
      { icon: TemplateIcon, title: "Scenario Templates" },
      { icon: GlobalPromptsIcon, title: "Global Prompts" },
      { icon: VoiceLibraryIcon, title: "Voice Library" },
    ],
  },
  {
    defaultOpen: true,
    label: "Monitor",
    items: [
      { icon: DashboardIcon, title: "Dashboard" },
      { icon: ConversationsIcon, title: "Conversations" },
      { icon: MessagingIcon, title: "Messaging" },
      { icon: QualityIcon, title: "Quality Dashboard" },
      { icon: ReportsIcon, title: "Reports" },
      { icon: TasksIcon, title: "Tasks" },
    ],
  },
  {
    defaultOpen: false,
    label: "Configuration",
    items: [
      { icon: KeyIcon, title: "API Keys" },
      { icon: VariablesIcon, title: "Variables" },
      { icon: WebhooksIcon, title: "Webhooks" },
      { icon: IntegrationsIcon, title: "Integrations" },
      { icon: DeveloperDocsIcon, title: "Developer Docs" },
      { icon: BuildingIcon, title: "Organizations" },
      /* DES-170. Roles are platform-wide and Sarj-only in Phase 1, so they sit
         beside Organizations rather than inside one. */
      { icon: RolesIcon, title: "Roles" },
      { icon: MobileIcon, title: "Phone Numbers" },
      /* DES-169. The catalog needs a home in the nav, and Configuration is
         where the other platform-wide, Sarj-staff-only surfaces already sit. */
      { icon: ModelsIcon, title: "Models" },
      { icon: TelephonyIcon, title: "Telephony" },
      { icon: SettingsIcon, title: "Global Settings" },
      { icon: MessagingSettingsIcon, title: "Messaging Settings" },
    ],
  },
]

function NavLink({
  active,
  item,
  onNavigate,
}: {
  active: boolean
  item: NavItem
  onNavigate?: (title: string) => void
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        /* Two differences from the primitive's defaults, both as the app has
           them: hover lands on the neutral `accent` rather than the purple
           `sidebar-accent`, and the active item carries a hairline of its own
           foreground so the filled pill reads as a border, not just a wash. */
        className="border border-transparent hover:bg-accent hover:text-accent-foreground data-active:border-sidebar-accent-foreground/10"
        isActive={active}
        tooltip={item.title}
        onClick={() => onNavigate?.(item.title)}
      >
        <item.icon />
        {/* Closing to the rail fades the label out rather than clipping it. */}
        <span className="truncate transition-opacity duration-200 ease-out-cubic group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none">
          {item.title}
        </span>
      </SidebarMenuButton>
      {/* `rounded-sm` in place of the primitive's `rounded-md` and `right-2` in
          place of `right-1`, both as the app has them.

          The glyph size is deliberately NOT the app's `[&>svg]:size-full`. That
          class works there because its plus is a hand-drawn 20×20 icon whose
          path spans only 6.5→13.5, so filling the box still draws a 7px plus.
          Ours is HugeIcons' PlusSignIcon, whose ink fills 16 of its 24 viewBox
          units — the same class drew a 12px plus, nearly twice the app's.
          `size-2.5` renders it at 10px, putting the drawn plus at 6.7px. */}
      {item.action ? (
        <SidebarMenuAction
          aria-label={item.action}
          className="top-1.5 right-2 rounded-sm border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground [&>svg]:size-2.5"
        >
          <NewItemIcon />
        </SidebarMenuAction>
      ) : null}
    </SidebarMenuItem>
  )
}

/**
 * Collapsed to the icon rail there is no room for a section label, so the
 * groups are forced open and the label — the only thing that could close them —
 * is disabled.
 */
function NavGroup({
  active,
  defaultOpen,
  items,
  label,
  onNavigate,
}: {
  active: string
  defaultOpen: boolean
  items: NavItem[]
  label: string
  onNavigate?: (title: string) => void
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <Collapsible
      disabled={isCollapsed}
      onOpenChange={isCollapsed ? undefined : setOpen}
      open={isCollapsed || open}
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between hover:bg-accent/50">
            <span>{label}</span>
            <ChevronDownIcon
              className={cn(
                "transition-transform duration-200 ease-out-cubic motion-reduce:transition-none",
                open ? "rotate-0" : "-rotate-90",
              )}
            />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <NavLink
                  active={item.title === active}
                  item={item}
                  key={item.title}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

/** Breadcrumb start, account end — the row every page in the app sits under. */
export function AppHeader({
  actions,
  trail,
  showSettings,
}: {
  /** Replaces the account row entirely. The design-system page uses it to
   *  carry the way back to the index; a mockup leaves it off and gets the
   *  row the app itself shows. */
  actions?: React.ReactNode
  /** Crumbs after Home. The last is the page; earlier ones are links. */
  trail: readonly string[]
  showSettings?: boolean
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-4">
      <Breadcrumb>
        {/* The app spaces its crumbs at 2.5; the primitive ships 1.5. */}
        <BreadcrumbList className="gap-2.5">
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {trail.map((crumb, index) => (
            <React.Fragment key={crumb}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === trail.length - 1 ? (
                  <BreadcrumbPage>{crumb}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href="#">{crumb}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex shrink-0 items-center gap-2">
        {actions ?? (
          <>
            <Button size="sm" variant="outline">
              <DeveloperDocsIcon />
              Developer Doc
            </Button>
            {/* The same allowlist the nav reads. The app has this gear on its own
            check today, which is how an admin gets a second dead end to the
            page the sidebar already sent them to. */}
            {showSettings ? (
              <Button
                aria-label="Global settings"
                size="icon-sm"
                variant="outline"
              >
                <SettingsIcon />
              </Button>
            ) : null}
            {/* Wrapped, rather than given `self-center`: the primitive ships
            `data-vertical:self-stretch`, and an attribute variant outranks a
            plain utility, so the rule stretched to the 28px row, got held to
            h-4, and settled at the top of it — 6px above the centre the buttons
            and the avatar share. Inside a wrapper of its own the flex line is
            the rule's own height, so stretching changes nothing and the wrapper
            is what the header centres. */}
            <div className="flex items-center">
              <Separator className="mx-1 h-4" orientation="vertical" />
            </div>
            {/* A rounded square at the same radius and height as the two buttons,
            not a circle. The app's account button is Clerk's, and Clerk does not
            inherit the app's CSS vars — so the real header sets its avatar
            radius to a 0.625rem literal, which is `--radius`, which is
            `rounded-lg`. A circle here is the one thing in this row that would
            not be in the app. `after:` and the fallback carry the primitive's
            own `rounded-full`, so both have to be squared off with it. */}
            <Avatar className="size-7 rounded-lg after:rounded-lg">
              <AvatarFallback className="rounded-lg">TA</AvatarFallback>
            </Avatar>
          </>
        )}
      </div>
    </header>
  )
}

export function AppShell({
  active,
  breadcrumb,
  hiddenItems,
  onNavigate,
  children,
}: {
  /** Title of the sidebar item this screen lives under, e.g. "Personas". */
  active: string
  /** Crumbs after Home; a bare string is a single one. Defaults to `active`. */
  breadcrumb?: string | readonly string[]
  /**
   * Nav item titles this viewer's role cannot open, so the menu holds only
   * what they can reach. Omit it and the nav is the full one, which is what
   * every other mockup wants.
   */
  hiddenItems?: readonly string[]
  /** Called with a nav item's title when it is clicked, so a mockup can make
   * the destinations it covers actually switch. Items it ignores stay inert. */
  onNavigate?: (title: string) => void
  children: React.ReactNode
}) {
  const hidden = new Set(hiddenItems ?? [])
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !hidden.has(item.title)),
  })).filter((group) => group.items.length > 0)

  return (
    /* The app sizes its sidebar at 15rem; the shadcn primitive ships 16rem.
       Set here rather than in the primitive, which is generated. */
    <SidebarProvider
      className="min-h-0 flex-1"
      style={{ "--sidebar-width": "15rem" } as React.CSSProperties}
    >
      {/* The sidebar pins to the viewport as it does in the app, so it clears
          the mockup shell's own header rather than sliding under it. */}
      <Sidebar className="pt-12" collapsible="icon" variant="inset">
        <SidebarHeader className="px-2 pt-2 pb-1">
          <div className="flex items-center justify-between group-data-[state=collapsed]:justify-center">
            {/* 56×32 is the size the app's own header renders it at. */}
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
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="pt-2 pb-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <NavLink
                  active={PLAYGROUND.title === active}
                  item={PLAYGROUND}
                  onNavigate={onNavigate}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {groups.map((group, index) => (
            <React.Fragment key={group.label}>
              {/* The rail hides section labels, so a rule stands in for the
                  grouping those labels carry when the nav is open. */}
              {index > 0 ? (
                <div className="mx-2 my-1 hidden h-px shrink-0 bg-sidebar-border group-data-[collapsible=icon]:block" />
              ) : null}
              <NavGroup
                active={active}
                /* A closed group hiding the item the screen is on reads as the
                   nav having lost its place, so the active item's group opens
                   regardless of where the group would otherwise start. */
                defaultOpen={
                  group.defaultOpen ||
                  group.items.some((item) => item.title === active)
                }
                items={group.items}
                label={group.label}
                onNavigate={onNavigate}
              />
            </React.Fragment>
          ))}
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0 overflow-hidden">
        <AppHeader
          trail={
            breadcrumb === undefined
              ? [active]
              : typeof breadcrumb === "string"
                ? [breadcrumb]
                : breadcrumb
          }
          showSettings={!hidden.has("Global Settings")}
        />
        {/* No gutter here: the page owns its p-3 lg:p-4, matching the header. */}
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
