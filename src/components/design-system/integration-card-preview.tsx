"use client"

import * as React from "react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import { cn } from "@/lib/utils"

/**
 * Integration cards, three concepts.
 *
 * The product's card only says whether a service is connected — and says it
 * four times (tick, gear, Configure, clickable card), with the auth type in
 * capitals underneath. What a reader wants from this page is what each
 * connection *does* for their agents: which events start calls, where call
 * results go, and whether it is still working.
 *
 * The flows are the product's own: Salla runs per-event automations into
 * scenarios (`integrations/salla/management`); Zoho starts scenarios from CRM
 * webhooks (`integrations/zoho/management`), receives call results as a sink
 * (`scenario/sinks/zoho-crm-sink-config`) and opens ZohoDesk tickets as a
 * tool. Counts, dates and activity are sample data.
 */

type Flow = { from: string; to: string; direction: "in" | "out" }

type Integration = {
  id: string
  name: string
  logo: string
  description: string
  connected: boolean
  staffOnly: boolean
  flows: Flow[]
  /** Events a day over the last week, oldest first. */
  activity?: number[]
  lastEvent?: string
  health?: { tone: "ok" | "warn"; text: string; action?: string }
  /** For a service not yet connected: what connecting it would do. */
  offers?: string[]
}

const INTEGRATIONS: Integration[] = [
  {
    id: "salla",
    name: "Salla",
    logo: "/integrations/salla.png",
    description: "Saudi e-commerce platform",
    connected: true,
    staffOnly: false,
    flows: [
      { from: "Order shipped", to: "Delivery confirmation", direction: "in" },
      { from: "Abandoned cart", to: "Cart recovery", direction: "in" },
      { from: "Payment failed", to: "Payment reminder", direction: "in" },
    ],
    activity: [42, 51, 38, 64, 58, 71, 66],
    lastEvent: "4 min ago",
    health: { tone: "ok", text: "2 stores connected" },
  },
  {
    id: "zoho",
    name: "Zoho",
    logo: "/integrations/zoho.png",
    description: "CRM, desk and business suite",
    connected: true,
    staffOnly: false,
    flows: [
      { from: "New lead", to: "Lead qualification", direction: "in" },
      { from: "Call results", to: "Zoho CRM", direction: "out" },
      { from: "Escalations", to: "ZohoDesk tickets", direction: "out" },
    ],
    activity: [12, 18, 9, 22, 17, 25, 14],
    lastEvent: "1 h ago",
    health: {
      tone: "warn",
      text: "Access expires in 5 days",
      action: "Reconnect",
    },
  },
  {
    id: "salesforce",
    name: "Salesforce",
    logo: "/integrations/salesforce.jpeg",
    description: "CRM for sales, service and marketing",
    connected: false,
    staffOnly: true,
    flows: [],
    offers: [
      "Start a scenario when a lead or case is created",
      "Write call results back to the record",
    ],
  },
]

const CONNECTED = INTEGRATIONS.filter((item) => item.connected)
const AVAILABLE = INTEGRATIONS.filter((item) => !item.connected)

const VARIANTS = [
  { id: "flow", label: "Flow" },
  { id: "activity", label: "Activity" },
  { id: "hub", label: "Hub" },
]

export function IntegrationCardPreview() {
  const [variant, setVariant] = React.useState("flow")

  return (
    <SecondaryTabs items={VARIANTS} value={variant} onValueChange={setVariant}>
      <TabsContent value="flow">
        <Frame>
          <div className="grid gap-4 lg:grid-cols-3">
            {INTEGRATIONS.map((integration) => (
              <FlowCard key={integration.id} integration={integration} />
            ))}
          </div>
        </Frame>
      </TabsContent>
      <TabsContent value="activity">
        <Frame>
          <div className="grid gap-4 lg:grid-cols-3">
            {INTEGRATIONS.map((integration) => (
              <ActivityCard key={integration.id} integration={integration} />
            ))}
          </div>
        </Frame>
      </TabsContent>
      <TabsContent value="hub">
        <Frame>
          <Hub />
        </Frame>
      </TabsContent>
    </SecondaryTabs>
  )
}

/* ----------------------------------------------------------------- pieces */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <PageHeader title="Integrations" />
        {children}
      </CardContent>
    </Card>
  )
}

function Logo({
  integration,
  size = "md",
}: {
  integration: Integration
  size?: "sm" | "md"
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background ring-1 ring-foreground/10",
        size === "sm" ? "size-5" : "size-10 p-1.5",
      )}
    >
      <Image
        alt={`${integration.name} logo`}
        className="size-full object-contain"
        height={40}
        src={integration.logo}
        width={40}
      />
    </span>
  )
}

function SarjMark() {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background p-1.5 ring-1 ring-foreground/10">
      <Image
        alt="Sarj"
        className="size-full object-contain"
        height={40}
        src="/mark.png"
        width={40}
      />
    </span>
  )
}

function Title({ integration }: { integration: Integration }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center gap-1.5">
        <span className="font-medium">{integration.name}</span>
        {integration.staffOnly ? (
          <Badge className="bg-muted text-muted-foreground" variant="secondary">
            Staff only
          </Badge>
        ) : null}
      </div>
      <span className="truncate text-xs text-muted-foreground">
        {integration.description}
      </span>
    </div>
  )
}

function Health({ integration }: { integration: Integration }) {
  const health = integration.health
  if (!health) return null
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs">
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          health.tone === "ok" ? "bg-success" : "bg-warning",
        )}
      />
      <span
        className={cn(
          "truncate",
          health.tone === "ok"
            ? "text-muted-foreground"
            : "text-warning-tint-foreground",
        )}
      >
        {health.text}
      </span>
    </div>
  )
}

/** Manage when connected, Reconnect when something is about to break. */
function PrimaryAction({ integration }: { integration: Integration }) {
  if (!integration.connected) return <Button size="sm">Connect</Button>
  if (integration.health?.action)
    return (
      <Button size="sm" variant="outline">
        {integration.health.action}
      </Button>
    )
  return (
    <Button size="sm" variant="ghost">
      Manage
    </Button>
  )
}

/* ---------------------------------------------------------- 1. flow card */

/**
 * The pipe itself: each automation as a line between the service and Sarj —
 * pointing in when an event starts a call, out when a call's result goes
 * back. Connecting reads as wiring something up, not ticking a box.
 */
function FlowCard({ integration }: { integration: Integration }) {
  return (
    <Card size="sm">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <Logo integration={integration} />
          <Title integration={integration} />
        </div>

        {integration.connected ? (
          <div className="flex flex-1 flex-col gap-2">
            {integration.flows.map((flow) => (
              <div
                key={flow.from}
                className="grid grid-cols-7 items-center gap-2 text-xs"
              >
                <span className="col-span-3 truncate">{flow.from}</span>
                <FlowLine direction={flow.direction} />
                <span className="col-span-3 truncate text-muted-foreground">
                  {flow.to}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center gap-3 rounded-lg bg-muted/50 py-5">
            <Logo integration={integration} />
            <FlowLine direction="in" pending />
            <SarjMark />
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {integration.connected ? (
            <Health integration={integration} />
          ) : (
            <span className="text-xs text-muted-foreground">Not connected</span>
          )}
          <PrimaryAction integration={integration} />
        </div>
      </CardContent>
    </Card>
  )
}

function FlowLine({
  direction,
  pending = false,
}: {
  direction: "in" | "out"
  pending?: boolean
}) {
  const tone = pending
    ? "border-muted-foreground"
    : direction === "in"
      ? "border-primary"
      : "border-chart-2"

  return (
    <span
      aria-label={direction === "in" ? "starts" : "goes to"}
      className={cn(
        "relative flex h-3 items-center",
        pending ? "w-12" : "w-full",
      )}
    >
      <span
        className={cn(
          "w-full border-t",
          pending ? "border-dashed" : "",
          tone,
        )}
      />
      {/* The arrowhead, at the end the data flows toward. */}
      <span
        className={cn(
          "absolute end-0 size-1.5 rotate-45 border-e border-t",
          tone,
        )}
      />
    </span>
  )
}

/* ------------------------------------------------------ 2. activity card */

/**
 * Proof it is working: a week of events as bars, when the last one arrived,
 * how many automations run on it, and the one thing about to break.
 */
function ActivityCard({ integration }: { integration: Integration }) {
  const activity = integration.activity ?? []
  const peak = Math.max(1, ...activity)
  const total = activity.reduce((sum, value) => sum + value, 0)

  return (
    <Card size="sm">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <Logo integration={integration} />
          <Title integration={integration} />
        </div>

        {integration.connected ? (
          <div className="flex flex-1 items-end justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tabular-nums">
                {total}
              </span>
              <span className="text-xs text-muted-foreground">
                events this week
              </span>
              <span className="text-xs text-muted-foreground">
                {integration.flows.length} automations · last{" "}
                {integration.lastEvent}
              </span>
            </div>
            <div aria-hidden className="flex h-12 items-end gap-1">
              {activity.map((value, index) => (
                <span
                  key={index}
                  className={cn(
                    "w-2 rounded-sm",
                    index === activity.length - 1
                      ? "bg-primary"
                      : "bg-primary/25",
                  )}
                  style={{ height: `${(value / peak) * 100}%` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <ul className="flex flex-1 flex-col gap-1.5 text-xs text-muted-foreground">
            {integration.offers?.map((offer) => (
              <li key={offer} className="flex gap-2">
                <span aria-hidden className="text-primary">
                  +
                </span>
                {offer}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3">
          {integration.connected ? <Health integration={integration} /> : <span />}
          <PrimaryAction integration={integration} />
        </div>
      </CardContent>
    </Card>
  )
}

/* ----------------------------------------------------------------- 3. hub */

/**
 * What is connected gets the room: one wide panel each, listing every
 * automation it runs. What is not connected shrinks to a shelf of chips — it
 * matters once, when someone adds it.
 */
function Hub() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {CONNECTED.map((integration) => (
          <Card key={integration.id} size="sm">
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Logo integration={integration} />
                <Title integration={integration} />
                <div className="ms-auto">
                  <PrimaryAction integration={integration} />
                </div>
              </div>
              <Health integration={integration} />
              <div className="flex flex-col divide-y overflow-hidden rounded-lg bg-muted/40">
                {integration.flows.map((flow) => (
                  <div
                    key={flow.from}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <span className="truncate">
                      {flow.from}
                      <span className="text-muted-foreground">
                        {flow.direction === "in" ? " starts " : " go to "}
                      </span>
                      {flow.to}
                    </span>
                    <Badge
                      className={
                        flow.direction === "in"
                          ? "bg-primary-tint text-primary-tint-foreground"
                          : "bg-muted text-muted-foreground"
                      }
                      variant="secondary"
                    >
                      {flow.direction === "in" ? "Starts a call" : "After a call"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="me-1 text-sm text-muted-foreground">Add more</span>
        {AVAILABLE.map((integration) => (
          <Button key={integration.id} size="sm" variant="outline">
            <Logo integration={integration} size="sm" />
            {integration.name}
            {integration.staffOnly ? (
              <span className="text-xs text-muted-foreground">Staff</span>
            ) : null}
          </Button>
        ))}
      </div>
    </div>
  )
}
