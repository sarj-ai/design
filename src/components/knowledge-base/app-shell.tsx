"use client"

import * as React from "react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  AudioIcon,
  BuildingIcon,
  CallOutgoingIcon,
  ChecklistIcon,
  ChevronDownIcon,
  CodeIcon,
  DashboardIcon,
  DatabaseIcon,
  FileIcon,
  FlagIcon,
  FlowIcon,
  KeyIcon,
  KnowledgeIcon,
  MessageIcon,
  MessagesIcon,
  MobileIcon,
  PhoneCallIcon,
  PlaybackIcon,
  PlugIcon,
  SettingsIcon,
  SidebarIcon,
  TelephonyIcon,
  TemplateIcon,
  UsersIcon,
  VariablesIcon,
  WebhooksIcon,
} from "@/components/knowledge-base/icons"

/**
 * The app around the screen, so the knowledge base is read in place rather
 * than against an approximation. Nothing here is part of the change.
 */

const NAV = [
  {
    label: "Build",
    items: [
      { title: "Playground", icon: PlaybackIcon },
      { title: "Personas", icon: UsersIcon },
      { title: "Scenarios", icon: FlowIcon },
      { title: "Knowledge Bases", icon: KnowledgeIcon, active: true },
      { title: "Batch Calls", icon: CallOutgoingIcon },
      { title: "Scenario Templates", icon: TemplateIcon },
      { title: "Global Prompts", icon: FileIcon },
      { title: "Voice Library", icon: AudioIcon },
    ],
  },
  {
    label: "Monitor",
    items: [
      { title: "Dashboard", icon: DashboardIcon },
      { title: "Conversations", icon: PhoneCallIcon },
      { title: "Messaging", icon: MessageIcon },
      { title: "Quality Dashboard", icon: FlagIcon },
      { title: "Reports", icon: DatabaseIcon },
      { title: "Tasks", icon: ChecklistIcon },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "API Keys", icon: KeyIcon },
      { title: "Variables", icon: VariablesIcon },
      { title: "Webhooks", icon: WebhooksIcon },
      { title: "Integrations", icon: PlugIcon },
      { title: "Developer Docs", icon: CodeIcon },
      { title: "Organizations", icon: BuildingIcon },
      { title: "Phone Numbers", icon: MobileIcon },
      { title: "Telephony", icon: TelephonyIcon },
      { title: "Global Settings", icon: SettingsIcon },
      { title: "Messaging Settings", icon: MessagesIcon },
    ],
  },
]

export function KnowledgeAppShell({
  crumb,
  children,
}: {
  /** The page's own name at the end of the trail, or nothing on the index. */
  crumb?: string
  children: React.ReactNode
}) {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="none" className="h-auto">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <span className="text-base font-semibold">sarj.ai</span>
            <SidebarTrigger>
              <SidebarIcon />
            </SidebarTrigger>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {NAV.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="justify-between">
                {group.label}
                <ChevronDownIcon className="size-4" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={item.active}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 px-2 py-1">
            <Avatar className="size-8">
              <AvatarFallback>TA</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                Taynam Alzamel
              </span>
              <span className="truncate text-xs text-muted-foreground">
                talzamel@sarj.ai
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {crumb ? (
                  <BreadcrumbLink asChild>
                    <Link href="/knowledge-base">Knowledge Bases</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>Knowledge Bases</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {crumb ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{crumb}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : null}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Capped, so a wide monitor doesn't stretch a text field into a
            200-character line. */}
        <div className="mx-auto flex w-full max-w-300 flex-col gap-6 p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
