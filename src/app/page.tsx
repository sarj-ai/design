"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import {
  ClearIcon,
  OpenIcon,
  RulesIcon,
  SearchIcon,
  TicketLinkIcon,
} from "@/components/workspace-icons"
import { ReelIcon } from "@/components/reels/icons"
import { LinkMenu } from "@/components/link-menu"
import { RegistryMenu } from "@/components/registry-menu"
import { RegistryOnboarding } from "@/components/registry-onboarding"
import { SurfaceDock } from "@/components/surface-dock"
import {
  groupBySurface,
  searchMockups,
  surfaceId,
  surfaceLabel,
} from "@/lib/mockups-data"
import { linearIssueUrl } from "@/lib/linear"
import thumbnails from "@/lib/thumbnails.json"

export default function Home() {
  const [query, setQuery] = useState("")
  const groups = useMemo(
    () =>
      groupBySurface(searchMockups(query), { ranked: query.trim().length > 0 }),
    [query],
  )

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

  const search = useRef<HTMLInputElement>(null)

  /* This page is a search field and the list it filters, so the browser's own
     find bar is the wrong tool on it — that one searches the cards already on
     screen, not the mockups the query has hidden. ⌘F goes to the field. */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "f") return
      if (!event.metaKey && !event.ctrlKey) return

      event.preventDefault()
      search.current?.focus()
      search.current?.select()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const modifier = useModifierKey()

  return (
    <main className="mx-auto flex w-full max-w-350 flex-col gap-8 p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Design lab</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Opens itself once on a first visit; this button is how it is
              reached every time after that. */}
          <RegistryOnboarding />

          {/* The design system is not a mockup, so it has no card in the list
              below — it lives up here, where it is reachable from the index
              without a search that would only ever return one result. */}
          <Button asChild size="sm" variant="outline">
            <Link href="/design-system">
              <RulesIcon />
              Design system
            </Link>
          </Button>

          {/* Reels are not mockups, so they have no card in the list below —
              they get their own index, reached from here for the same reason
              the design system is. */}
          <Button asChild size="sm" variant="outline">
            <Link href="/reels">
              <ReelIcon />
              Reels
            </Link>
          </Button>

          <InputGroup className="w-full sm:w-80">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              ref={search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search mockups"
              aria-label="Search mockups"
            />
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <ClearIcon />
                </InputGroupButton>
              </InputGroupAddon>
            ) : modifier ? (
              <InputGroupAddon align="inline-end">
                <Kbd>{modifier}F</Kbd>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        </div>
      </header>

      {groups.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>No mockups match “{query}”</EmptyTitle>
            <EmptyDescription>
              Try fewer characters, a ticket ID like DES-149, a surface like
              Settings, or a word from the description.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        groups.map(({ surface, mockups }) => (
          <section
            key={surfaceId(surface)}
            id={surfaceId(surface)}
            className="flex scroll-mt-8 flex-col gap-4"
            aria-label={surfaceLabel(surface)}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold">{surfaceLabel(surface)}</h2>
              <Badge variant="secondary">{mockups.length}</Badge>
              <Separator className="flex-1" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {mockups.map(
                ({ href, title, meta, description, icon, tickets }) => {
                  const slug = href.slice(1)

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
                          <RegistryMenu slug={slug} title={title} />
                        </CardAction>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-3">
                        <p className="text-sm text-muted-foreground">
                          {description}
                        </p>
                        {tickets.length ? (
                          <div className="flex flex-wrap gap-2">
                            {/* The chip names the ticket and opens it. It used
                                to do neither and be shadowed by a row of
                                "DES-110 in Linear" buttons in the footer —
                                every ticket printed twice, and on a card
                                answering four of them the footer wrapped onto
                                a second line of near-identical buttons. */}
                            {tickets.map((ticket) => (
                              <Badge asChild key={ticket} variant="outline">
                                <a
                                  href={linearIssueUrl(ticket)}
                                  rel="noreferrer"
                                  target="_blank"
                                  title={`Open ${ticket} in Linear`}
                                >
                                  {ticket}
                                  <TicketLinkIcon data-icon="inline-end" />
                                </a>
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </CardContent>
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
                },
              )}
            </div>
          </section>
        ))
      )}

      {/* Nothing to navigate between until there are two groups, and the
          reader who has just searched the list down to one does not need a
          control telling them so. */}
      {sections.length > 1 ? <SurfaceDock sections={sections} /> : null}
    </main>
  )
}

/** The keyboard never changes under us, so there is nothing to subscribe to. */
const NEVER_CHANGES = () => () => {}

/**
 * Which modifier to print in the shortcut hint.
 *
 * It depends on the reader's keyboard, which the server has no way to know, so
 * the hint is empty until hydration rather than rendering one modifier and
 * correcting itself to the other in front of the reader.
 */
function useModifierKey() {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => (navigator.userAgent.includes("Mac") ? "⌘" : "Ctrl"),
    () => "",
  )
}
