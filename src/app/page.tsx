"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { OpenIcon } from "@/components/shell/workspace-icons"
import { SiteNav } from "@/components/shell/site-nav"
import { HeyClick } from "@/components/site/hey-click"
import { LinkMenu } from "@/components/site/link-menu"
import { RegistryMenu } from "@/components/site/registry-menu"
import { SurfaceDock } from "@/components/site/surface-dock"
import {
  MOCKUPS,
  addedLabel,
  groupBySurface,
  sortByAdded,
  surfaceId,
  surfaceLabel,
  type Order,
} from "@/lib/site/mockups-data"
import thumbnails from "@/lib/site/thumbnails.json"

export default function Home() {
  const [order, setOrder] = useState<Order>("newest")
  const grouped = order === "section"

  const groups = useMemo(
    () =>
      order === "section"
        ? groupBySurface(sortByAdded(MOCKUPS, "newest"))
        : [{ surface: null, mockups: sortByAdded(MOCKUPS, order) }],
    [order],
  )

  // Memoised: the dock re-measures the page whenever this identity changes.
  const sections = useMemo(
    () =>
      groups.map(({ surface }) => ({
        id: surfaceId(surface),
        label: surfaceLabel(surface),
      })),
    [groups],
  )

  return (
    <>
      <SiteNav actions={<HeyClick />} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 pb-8">
        <div className="flex justify-end">
          <Select
            onValueChange={(next) => setOrder(next as Order)}
            value={order}
          >
            <SelectTrigger aria-label="Order" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="section">By section</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {groups.map(({ surface, mockups }, group) => (
          <section
            key={grouped ? surfaceId(surface) : "all"}
            id={grouped ? surfaceId(surface) : undefined}
            className="flex scroll-mt-8 flex-col gap-4"
            aria-label={grouped ? surfaceLabel(surface) : "Mockups"}
          >
            {grouped ? (
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold">
                  {surfaceLabel(surface)}
                </h2>
                <Separator className="flex-1" />
              </div>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2">
              {mockups.map((mockup, card) => {
                const { href, title, meta, icon, tickets } = mockup
                const slug = href.slice(1)
                // The walkthrough's install menu: the first card visible after a search.
                const tour = group === 0 && card === 0 ? "install" : undefined

                return (
                  <Card className="relative" key={href}>
                    {/* Unoptimized: `npm run thumbs` already wrote a 2x WebP. The fingerprint is the cache key, since redeploys reuse a filename. */}
                    {slug in thumbnails.fingerprints ? (
                      <Image
                        alt=""
                        className="border-b"
                        height={thumbnails.height}
                        src={`/thumbs/${slug}.webp?v=${
                          thumbnails.fingerprints[
                            slug as keyof typeof thumbnails.fingerprints
                          ]
                        }`}
                        unoptimized
                        width={thumbnails.width}
                      />
                    ) : null}

                    {/* An overlay, not a wrapping link: Card drops its top padding via `has-[>img:first-child]`, which an anchor in between would break. */}
                    {slug in thumbnails.fingerprints ? (
                      <Link
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 rounded-t-xl transition-colors duration-150 ease-out-cubic hover:bg-foreground/5 motion-reduce:transition-none"
                        href={href}
                        style={{
                          aspectRatio: `${thumbnails.width} / ${thumbnails.height}`,
                        }}
                        tabIndex={-1}
                      />
                    ) : null}

                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary-tint-foreground">
                          <HugeiconsIcon
                            icon={icon}
                            strokeWidth={1.8}
                            className="size-4"
                          />
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <CardTitle>{title}</CardTitle>
                          <CardDescription>
                            {meta} · {addedLabel(mockup)}
                          </CardDescription>
                        </div>
                      </div>

                      <CardAction className="flex items-center gap-1">
                        <LinkMenu slug={slug} tickets={tickets} title={title} />
                        <RegistryMenu slug={slug} title={title} tour={tour} />
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={href}>
                          Open mockup
                          <OpenIcon className="rtl:rotate-180" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </section>
        ))}

        {grouped && sections.length > 1 ? (
          <SurfaceDock sections={sections} />
        ) : null}
      </main>
    </>
  )
}
