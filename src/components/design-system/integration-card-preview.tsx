"use client"

import * as React from "react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"
import { TabsContent } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"

/**
 * Integration cards, three ways.
 *
 * The product's card says one thing four times: a green tick, a gear, a
 * Configure button and a clickable card all lead to the same dialog. Its
 * footer shows the auth type in capitals — OAUTH, CUSTOM — which is how the
 * integration is built, not anything the reader decides with. And each card
 * is mostly empty space around a two-line description.
 *
 * Every variant here keeps one signal for "connected" (a tinted chip), one
 * action (Manage when connected, Connect when not), and drops the auth type.
 * Names, descriptions, logos and the staff-only Salesforce are the
 * product's own (`app/integrations/default-integrations.ts`).
 */

type Integration = {
  id: string
  name: string
  description: string
  logo: string
  connected: boolean
  /** `requiresSuperAdmin` in the product. */
  staffOnly: boolean
}

const INTEGRATIONS: Integration[] = [
  {
    id: "zoho",
    name: "Zoho",
    description: "Business suite for CRM, accounting and project management.",
    logo: "/integrations/zoho.png",
    connected: true,
    staffOnly: false,
  },
  {
    id: "salla",
    name: "Salla",
    description:
      "Saudi e-commerce platform with built-in payments and logistics.",
    logo: "/integrations/salla.png",
    connected: true,
    staffOnly: false,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM platform for sales, service and marketing teams.",
    logo: "/integrations/salesforce.jpeg",
    connected: false,
    staffOnly: true,
  },
]

const VARIANTS = [
  { id: "cards", label: "Cards" },
  { id: "rows", label: "Rows" },
  { id: "grouped", label: "Connected first" },
]

export function IntegrationCardPreview() {
  const [variant, setVariant] = React.useState("cards")

  return (
    <SecondaryTabs items={VARIANTS} value={variant} onValueChange={setVariant}>
      <TabsContent value="cards">
        <Frame>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </Frame>
      </TabsContent>

      <TabsContent value="rows">
        <Frame>
          <IntegrationRows integrations={INTEGRATIONS} />
        </Frame>
      </TabsContent>

      <TabsContent value="grouped">
        <Frame>
          <div className="flex flex-col gap-6">
            <Group label="Connected">
              <IntegrationRows
                integrations={INTEGRATIONS.filter((item) => item.connected)}
              />
            </Group>
            <Group label="Available">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {INTEGRATIONS.filter((item) => !item.connected).map(
                  (integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                    />
                  ),
                )}
              </div>
            </Group>
          </div>
        </Frame>
      </TabsContent>
    </SecondaryTabs>
  )
}

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

function Group({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
      {children}
    </section>
  )
}

/** The logo on a white tile, so a JPEG's background never shows a seam. */
function Logo({ src, name }: { src: string; name: string }) {
  return (
    <ItemMedia
      variant="image"
      className="size-10 border bg-background p-1.5 [&_img]:object-contain"
    >
      <Image alt={`${name} logo`} height={40} src={src} width={40} />
    </ItemMedia>
  )
}

function Status({ integration }: { integration: Integration }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {integration.connected ? (
        <Badge
          className="bg-success-tint text-success-tint-foreground"
          variant="secondary"
        >
          Connected
        </Badge>
      ) : null}
      {integration.staffOnly ? (
        <Badge className="bg-muted text-muted-foreground" variant="secondary">
          Staff only
        </Badge>
      ) : null}
    </div>
  )
}

function Action({ integration }: { integration: Integration }) {
  return integration.connected ? (
    <Button size="sm" variant="outline">
      Manage
    </Button>
  ) : (
    <Button size="sm">Connect</Button>
  )
}

/** Variant 1: a compact card — who, whether, what, and one action. */
function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <Card size="sm">
      <CardContent className="flex h-full flex-col gap-3">
        <Item className="p-0">
          <Logo name={integration.name} src={integration.logo} />
          <ItemContent>
            <ItemTitle>{integration.name}</ItemTitle>
            <Status integration={integration} />
          </ItemContent>
        </Item>
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {integration.description}
        </p>
        <div className="flex justify-end">
          <Action integration={integration} />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Variant 2: one row each, in a single card. Reads faster once there are more
 * than a handful, and the action lines up down one edge.
 */
function IntegrationRows({ integrations }: { integrations: Integration[] }) {
  return (
    <Card className="[--card-spacing:0px]">
      <ItemGroup className="gap-0">
        {integrations.map((integration, index) => (
          <React.Fragment key={integration.id}>
            {index > 0 ? <ItemSeparator className="my-0" /> : null}
            <Item className="rounded-none px-4 py-3">
              <Logo name={integration.name} src={integration.logo} />
              <ItemContent>
                <div className="flex items-center gap-2">
                  <ItemTitle>{integration.name}</ItemTitle>
                  <Status integration={integration} />
                </div>
                <ItemDescription>{integration.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Action integration={integration} />
              </ItemActions>
            </Item>
          </React.Fragment>
        ))}
      </ItemGroup>
    </Card>
  )
}
