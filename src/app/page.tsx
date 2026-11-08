"use client";

import type * as React from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { OpenIcon } from "@/components/shell/workspace-icons";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteNav } from "@/components/shell/site-nav";
import { HeyClick } from "@/components/site/hey-click";
import { LinkMenu } from "@/components/site/link-menu";
import { OrderRail } from "@/components/site/order-rail";
import { RegistryMenu } from "@/components/site/registry-menu";
import { SurfaceDock } from "@/components/site/surface-dock";
import {
  MOCKUPS,
  addedLabel,
  groupBySurface,
  sortByAdded,
  surfaceId,
  surfaceLabel,
  type Order,
} from "@/lib/site/mockups-data";
import thumbnails from "@/lib/site/thumbnails.json";

export default function Home() {
  const [order, setOrder] = useState<Order>("newest");
  const grouped = order === "section";

  const groups = useMemo(
    () =>
      order === "section"
        ? groupBySurface(sortByAdded(MOCKUPS, "newest"))
        : [{ surface: null, mockups: sortByAdded(MOCKUPS, order) }],
    [order],
  );

  // Memoised: the dock re-measures the page whenever this identity changes.
  const sections = useMemo(
    () =>
      groups.map(({ surface }) => ({
        id: surfaceId(surface),
        label: surfaceLabel(surface),
      })),
    [groups],
  );

  return (
    <>
      <SiteNav actions={<HeyClick />} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 pt-8 pb-8">
        <OrderRail onOrderChange={setOrder} order={order} sections={sections} />

        {/* Narrow screens have no gutter for the rail. */}
        <div className="flex justify-end xl:hidden">
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

            {/* Keyed on the order so a re-sort replays the cards' entrance. */}
            <div className="grid gap-6 md:grid-cols-2" key={order}>
              {mockups.map((mockup, card) => {
                const { href, title, meta, icon, tickets } = mockup;
                const slug = href.slice(1);
                // The walkthrough's install menu: the first card visible after a search.
                const tour = group === 0 && card === 0 ? "install" : undefined;

                return (
                  <article
                    className="site-window window-enter relative flex scroll-mt-24 flex-col"
                    id={`mockup-${slug}`}
                    key={href}
                    style={{ "--i": card } as React.CSSProperties}
                  >
                    {/* The window bar: three dots, the address, and the card's menus. */}
                    <div className="flex items-center gap-3 px-3 pt-1 pb-2">
                      <div
                        aria-hidden
                        className="window-dots flex w-16 gap-1.5"
                      >
                        <span className="size-2.5 rounded-full bg-destructive/70" />
                        <span className="size-2.5 rounded-full bg-warning/70" />
                        <span className="size-2.5 rounded-full bg-success/70" />
                      </div>
                      <span className="window-url flex-1 truncate text-center text-xs text-muted-foreground">
                        design.sarj.ai/{slug}
                      </span>
                      <div className="flex w-16 justify-end">
                        <LinkMenu slug={slug} tickets={tickets} title={title} />
                        <RegistryMenu slug={slug} title={title} tour={tour} />
                      </div>
                    </div>

                    {/* The page inside the window, fading out toward the caption. */}
                    <Link
                      aria-hidden="true"
                      className="window-fade block overflow-hidden rounded-2xl bg-background"
                      href={href}
                      style={{
                        aspectRatio: `${thumbnails.width} / ${thumbnails.height}`,
                      }}
                      tabIndex={-1}
                    >
                      {/* Unoptimized: `npm run thumbs` already wrote a 2x WebP. The fingerprint is the cache key, since redeploys reuse a filename. */}
                      {slug in thumbnails.fingerprints ? (
                        <Image
                          alt=""
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
                    </Link>

                    <div className="-mt-10 flex flex-1 flex-col items-center gap-1 px-6 pb-6 text-center">
                      <span className="site-window-badge relative mb-3 flex size-12 items-center justify-center rounded-full bg-background text-primary">
                        <HugeiconsIcon
                          icon={icon}
                          strokeWidth={1.8}
                          className="size-5"
                        />
                      </span>
                      <h3 className="text-base font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {meta} · {addedLabel(mockup)}
                      </p>
                      <Button className="raised-button mt-4" asChild>
                        <Link href={href}>
                          Open mockup
                          <OpenIcon className="rtl:rotate-180" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {/* Wide screens list the sections in the order rail instead. */}
        {grouped && sections.length > 1 ? (
          <div className="xl:hidden">
            <SurfaceDock sections={sections} />
          </div>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}
