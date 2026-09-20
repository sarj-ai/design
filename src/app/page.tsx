"use client"

import { useMemo } from "react"
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
import { Separator } from "@/components/ui/separator"
import { OpenIcon } from "@/components/shell/workspace-icons"
import { SiteNav } from "@/components/shell/site-nav"
import { HeyClick } from "@/components/site/hey-click"
import { LinkMenu } from "@/components/site/link-menu"
import { RegistryMenu } from "@/components/site/registry-menu"
import { SurfaceDock } from "@/components/site/surface-dock"
import {
  MOCKUPS,
  groupBySurface,
  surfaceId,
  surfaceLabel,
} from "@/lib/site/mockups-data"
import thumbnails from "@/lib/site/thumbnails.json"

export default function Home() {
  /* Every mockup, always. The field that used to filter this list lives in
     the nav now and reaches the reels and the design system too, so it
     navigates rather than filtering — which means this page has nothing left
     to hide and no empty state to reach. */
  const groups = useMemo(() => groupBySurface(MOCKUPS), [])

  /* Memoised because the dock re-measures the page whenever this identity
     changes, and a fresh array every render would mean every render. */
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
      {/* The design system and the reels used to be two outline buttons in
          a header on this page. They are two menus in the nav now, on every
          page rather than on this one, and the search field went with them:
          on the index the nav is where you say what you are looking for,
          and being sticky it stays within reach however far the list goes. */}
      <SiteNav
        actions={<HeyClick />}
      />

      <main className="mx-auto flex w-full max-w-350 flex-col gap-8 px-8 pb-8">
        {          groups.map(({ surface, mockups }, group) => (
            <section
              key={surfaceId(surface)}
              id={surfaceId(surface)}
              className="flex scroll-mt-8 flex-col gap-4"
              aria-label={surfaceLabel(surface)}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold">
                  {surfaceLabel(surface)}
                </h2>
                <Separator className="flex-1" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {mockups.map(({ href, title, meta, icon, tickets }, card) => {
                  const slug = href.slice(1)
                  /* The walkthrough points at one install menu, and this is
                     how it finds it. First card of the first group *after*
                     the search, so a reader who started the tour with a query
                     typed still gets pointed at a card they can see. */
                  const tour = group === 0 && card === 0 ? "install" : undefined

                  return (
                    /* `relative` so the thumbnail's link can sit over it.
                       Positioning only — Card still owns its own padding,
                       radius and ring. */
                    <Card className="relative" key={href}>
                      {/* Card already expects a leading image — it drops its own
                        top padding and rounds the corners for one. Unoptimized
                        because `npm run thumbs` already wrote a WebP at twice
                        the width a card gives it; Vercel re-encoding it would
                        spend quota to produce the same picture. Its intrinsic
                        size comes from the manifest rather than being written
                        here too, so the crop cannot change under it.

                        The fingerprint is the cache key. Redeploys reuse a
                        filename, so without it a reader who has seen the old
                        thumbnail keeps seeing it. */}
                      {slug in thumbnails.fingerprints ? (
                        <Image
                          alt=""
                          /* A hairline, because both the thumbnail and the
                             card are white and a screen with no chrome down
                             its left edge otherwise bleeds into the title
                             underneath it. */
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

                      {/* The thumbnail opens the mockup too — it is the
                          biggest thing on the card and reads as the screen
                          itself, so clicking it and getting nothing is the
                          surprise.

                          An overlay rather than a link wrapped around the
                          image: Card drops its top padding via
                          `has-[>img:first-child]`, so an anchor between the
                          two would put a white strip above every thumbnail.
                          The aspect ratio comes from the thumbnail manifest,
                          the same numbers the image is sized from, so the
                          overlay covers the picture exactly at any card width.

                          Hidden from assistive tech and skipped by Tab: it
                          goes to the same route as `Open mockup` below, and a
                          second unnamed link per card is sixteen extra tab
                          stops that lead nowhere new. */}
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
                            <CardDescription>{meta}</CardDescription>
                          </div>
                        </div>

                        {/* Pinned to the title's line rather than centred on the
                          two-line block — CardAction already does that. */}
                        <CardAction className="flex items-center gap-1">
                          {/* Two errands, two menus: this one hands a link to
                              someone else, the next installs the screen into
                              their repo. */}
                          <LinkMenu
                            slug={slug}
                            tickets={tickets}
                            title={title}
                          />
                          <RegistryMenu slug={slug} title={title} tour={tour} />
                        </CardAction>
                      </CardHeader>
                      {/* No body: the thumbnail and title say what the mockup
                          is, and the tickets it answers live in the link menu
                          above, where they can be copied. */}
                      <CardFooter>
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

        {/* Nothing to navigate between until there are two groups, and the
          reader who has just searched the list down to one does not need a
          control telling them so. */}
        {sections.length > 1 ? <SurfaceDock sections={sections} /> : null}
      </main>
    </>
  )
}

