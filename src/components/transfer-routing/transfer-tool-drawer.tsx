"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { FieldSeparator } from "@/components/ui/field"
import {
  DEFAULT_ROUTE_ID,
  KEYPAD_KEYS,
  ROUTES,
  SHARED_SETTINGS,
  effectiveMode,
  emptyRoute,
  findOverlaps,
  overlappingCases,
  overriddenFields,
  type Route,
  type SharedSettings as SharedSettingsValue,
} from "@/lib/transfer-routing-data"
import { RouteCard } from "@/components/transfer-routing/route-card"
import { SharedSettings } from "@/components/transfer-routing/shared-settings"
import {
  AddRouteIcon,
  CloseIcon,
  OverlapIcon,
} from "@/components/transfer-routing/icons"

/**
 * The Transfer tool, configured with more than one destination.
 *
 * Routes are a flat, reorderable list rather than a graph: they are parallel
 * cases the agent weighs once, not a branching sequence, so a list is what
 * matches how the matching actually runs.
 *
 * A right-side drawer rather than a centre modal — the list grows with every
 * route a client adds, and a drawer has the height to take it.
 */
export function TransferToolDrawer() {
  const [open, setOpen] = React.useState(true)
  const [routes, setRoutes] = React.useState<Route[]>(ROUTES)
  const [defaultRouteId, setDefaultRouteId] = React.useState(DEFAULT_ROUTE_ID)
  const [shared, setShared] =
    React.useState<SharedSettingsValue>(SHARED_SETTINGS)

  /** The card whose grip is held, and the card being dragged over it. */
  const [armedId, setArmedId] = React.useState<string | null>(null)
  const [draggingId, setDraggingId] = React.useState<string | null>(null)

  const overlaps = findOverlaps(routes)
  const flagged = overlappingCases(overlaps)
  const overlappingRouteIds = new Set(overlaps.flatMap((item) => item.routeIds))

  /** One panel starts open so the override state is visible without a click. */
  const firstOverriding = routes.find((route) => overriddenFields(route).length)

  function addRoute() {
    const taken = new Set(routes.map((route) => route.keypadKey))
    const free = KEYPAD_KEYS.find((key) => !taken.has(key)) ?? ""
    setRoutes([...routes, emptyRoute(`route-${routes.length + 1}`, free)])
  }

  function move(fromId: string, toId: string) {
    if (fromId === toId) return

    const next = [...routes]
    const from = next.findIndex((route) => route.id === fromId)
    const to = next.findIndex((route) => route.id === toId)
    if (from < 0 || to < 0) return

    next.splice(to, 0, ...next.splice(from, 1))
    setRoutes(next)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction="right"
      // The cards own drag-to-reorder, so the drawer must not read a drag as a
      // dismiss gesture. Dragging is confined to the handle — of which a
      // right-side drawer has none — leaving Escape and the overlay to close it.
      handleOnly
    >
      <DrawerTrigger asChild>
        <Button variant="outline">Configure Transfer tool</Button>
      </DrawerTrigger>

      <DrawerContent className="sm:max-w-3xl!">
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="flex flex-col gap-0.5">
            <DrawerTitle>Transfer to a Human Agent</DrawerTitle>
            <DrawerDescription>
              Send the caller to a human based on why they&apos;re calling.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Close">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-medium">Routing options</h3>
              <p className="text-sm text-muted-foreground">
                Add a destination for every reason a caller might need a human.
                The agent picks the route that best matches what the caller
                said.
              </p>
            </div>

            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isDefault={route.id === defaultRouteId}
                shared={shared}
                overlappingCases={flagged}
                hasOverlap={overlappingRouteIds.has(route.id)}
                dragging={draggingId === route.id}
                armed={armedId === route.id}
                settingsOpen={route.id === firstOverriding?.id}
                onChange={(next) =>
                  setRoutes(
                    routes.map((item) => (item.id === next.id ? next : item)),
                  )
                }
                onDelete={() =>
                  setRoutes(routes.filter((item) => item.id !== route.id))
                }
                onSetDefault={() => setDefaultRouteId(route.id)}
                onArm={(armed) => setArmedId(armed ? route.id : null)}
                onDragStart={() => setDraggingId(route.id)}
                onDragEnter={() => {
                  if (draggingId) move(draggingId, route.id)
                }}
                onDragEnd={() => {
                  setDraggingId(null)
                  setArmedId(null)
                }}
              />
            ))}

            {overlaps.map((overlap) => {
              const [first, second] = overlap.routeIds.map(
                (id) => routes.find((route) => route.id === id)?.name ?? "",
              )

              return (
                <Alert
                  key={`${overlap.cases[0]}-${overlap.cases[1]}`}
                  className="bg-warning/10 text-warning-foreground"
                >
                  <OverlapIcon />
                  <AlertTitle>
                    &ldquo;{overlap.cases[0]}&rdquo; in {first} sounds similar
                    to &ldquo;{overlap.cases[1]}&rdquo; in {second}
                  </AlertTitle>
                  <AlertDescription className="text-warning-foreground/80">
                    The agent may have trouble telling these two routes apart.
                    Try making one more specific.
                  </AlertDescription>
                </Alert>
              )
            })}

            <Button variant="outline" onClick={addRoute} className="w-full">
              <AddRouteIcon />
              Add another route
            </Button>
          </section>

          <FieldSeparator />

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-medium">Shared settings</h3>
              <p className="text-sm text-muted-foreground">
                Every route uses these unless it overrides them in its own
                settings.
              </p>
            </div>

            <SharedSettings
              value={shared}
              warmInUse={routes.some(
                (route) => effectiveMode(route, shared) === "warm",
              )}
              onChange={setShared}
            />
          </section>
        </div>

        <DrawerFooter className="flex-row justify-end border-t bg-muted/50">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button onClick={() => setOpen(false)}>Save changes</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
