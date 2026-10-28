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
  SidebarMenuBadge,
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
} from "@/components/shell/app-shell-icons"

interface NavItem {
  /** Label for the hover "+". */
  action?: string
  /** A count beside the label — what is waiting on the viewer there. */
  badge?: number
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
      { icon: RolesIcon, title: "Roles" },
      { icon: MobileIcon, title: "Phone Numbers" },
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
        className="border border-transparent hover:bg-accent hover:text-accent-foreground data-active:border-sidebar-accent-foreground/10"
        isActive={active}
        tooltip={item.title}
        onClick={() => onNavigate?.(item.title)}
      >
        <item.icon />
        <span className="truncate transition-opacity duration-200 ease-out-cubic group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none">
          {item.title}
        </span>
      </SidebarMenuButton>
      {/* `size-2.5` on purpose: the app's `size-full` would draw this HugeIcons plus at 12px. */}
      {item.action ? (
        <SidebarMenuAction
          aria-label={item.action}
          className="top-1.5 right-2 rounded-sm border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground [&>svg]:size-2.5"
        >
          <NewItemIcon />
        </SidebarMenuAction>
      ) : null}
      {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  )
}

/** Collapsed to the icon rail there is no room for a label, so groups are forced open and the label disabled. */
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

function AppHeader({
  actions,
  scope,
  developers,
  trail,
  showSettings,
}: {
  /** Swaps "Developer Doc" for a Developers button; "open" when that page is showing. */
  developers?: "link" | "open"
  /** The admin view a superadmin is reading the page as. */
  scope?: React.ReactNode
  /** Replaces the account row entirely. */
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
        {scope}
        {actions ?? (
          <>
            {developers ? (
              <Button
                aria-current={developers === "open" ? "page" : undefined}
                size="sm"
                variant={developers === "open" ? "secondary" : "outline"}
              >
                <DeveloperDocsIcon />
                Developers
              </Button>
            ) : (
              <Button size="sm" variant="outline">
                <DeveloperDocsIcon />
                Developer Doc
              </Button>
            )}
            {showSettings ? (
              <Button
                aria-label="Global settings"
                size="icon-sm"
                variant="outline"
              >
                <SettingsIcon />
              </Button>
            ) : null}
            {/* Wrapped rather than `self-center`: the primitive's `data-vertical:self-stretch` outranks a plain utility. */}
            <div className="flex items-center">
              <Separator className="mx-1 h-4" orientation="vertical" />
            </div>
            {/* Squared to `rounded-lg` to match the app's Clerk avatar; `after:` and the fallback carry the primitive's `rounded-full` too. */}
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
  scope,
  developers,
  underShell = true,
  breadcrumb,
  hiddenItems,
  addedItems,
  onNavigate,
  children,
}: {
  /** Title of the sidebar item this screen lives under, e.g. "Personas". */
  active: string
  /** The admin view, in the top bar. */
  scope?: React.ReactNode
  developers?: "link" | "open"
  /** Whether the mockup shell's header sits above, which the sidebar has to
   *  clear. Off when the app is shown inside a frame on its own. */
  underShell?: boolean
  /** Crumbs after Home; a bare string is a single one. Defaults to `active`. */
  breadcrumb?: string | readonly string[]
  /** Nav item titles this viewer's role cannot open. */
  hiddenItems?: readonly string[]
  /** Nav items a mockup proposes, each placed after an existing one. */
  addedItems?: readonly { after: string; item: NavItem }[]
  /** Called with a nav item's title on click. Items the mockup ignores stay inert. */
  onNavigate?: (title: string) => void
  children: React.ReactNode
}) {
  const hidden = new Set(hiddenItems ?? [])
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items
      .flatMap((item) => [
        item,
        ...(addedItems ?? [])
          .filter((added) => added.after === item.title)
          .map((added) => added.item),
      ])
      .filter((item) => !hidden.has(item.title)),
  })).filter((group) => group.items.length > 0)

  return (
    // The app's sidebar is 15rem; shadcn ships 16rem. Set here because the primitive is generated.
    <SidebarProvider
      className="min-h-0 flex-1"
      style={{ "--sidebar-width": "15rem" } as React.CSSProperties}
    >
      {/* Starts below the mockup shell's 48px bar. */}
      <Sidebar
        className={underShell ? "pt-12" : undefined}
        collapsible="icon"
        variant="inset"
      >
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
              {index > 0 ? (
                <div className="mx-2 my-1 hidden h-px shrink-0 bg-sidebar-border group-data-[collapsible=icon]:block" />
              ) : null}
              <NavGroup
                active={active}
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
          developers={developers}
          scope={scope}
          trail={
            breadcrumb === undefined
              ? [active]
              : typeof breadcrumb === "string"
                ? [breadcrumb]
                : breadcrumb
          }
          showSettings={!hidden.has("Global Settings")}
        />
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
