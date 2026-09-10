import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { REELS } from "@/lib/reels-data"
import posters from "@/lib/reel-posters.json"
import { BackToReelsIcon, PlayReelIcon } from "@/components/reels/icons"

export const metadata = {
  title: "Reels",
  description: "Release and feature videos built from the Sarj design system.",
}

/**
 * The reel gallery.
 *
 * Deliberately the same shape as the mockup index — cards, one per reel, each
 * opening its own route. A reel is a design artefact like a mockup is, and the
 * two get reviewed the same way: open the thing, watch it, comment on it.
 */
export default function ReelsIndex() {
  return (
    <main className="mx-auto flex w-full max-w-350 flex-col gap-8 p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Reels</h1>
          <p className="text-sm text-muted-foreground">
            Release and feature videos. Every one is a React composition on the
            same 1920&times;1080 canvas, rendered to MP4 with{" "}
            <code className="font-mono">npm run reel</code>.
          </p>
        </div>

        <Button asChild size="sm" variant="outline">
          <Link href="/">
            <BackToReelsIcon />
            Design lab
          </Link>
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {REELS.map(({ href, title, meta, description, icon }) => {
          const slug = href.replace("/reels/", "")
          const fingerprint =
            posters.fingerprints[slug as keyof typeof posters.fingerprints]

          return (
            /* `relative` so the poster's link can sit over it. Positioning
               only — Card still owns its radius, ring and padding. */
            <Card className="relative" key={href}>
              {/* Card drops its own top padding for a leading image. The
                  poster is a frame from the reel itself rather than a picked
                  still, so a card can never advertise something the video does
                  not contain.

                  Unoptimized: `npm run reel` already wrote a 1280-wide WebP,
                  which is wider than a card renders it. The fingerprint is the
                  cache key — the filename is reused on every render, so
                  without it a reader keeps seeing the old poster. */}
              {fingerprint ? (
                <Image
                  alt=""
                  className="border-b"
                  height={posters.height}
                  src={`/reels/${slug}/poster.webp?v=${fingerprint}`}
                  unoptimized
                  width={posters.width}
                />
              ) : null}

              {/* The poster opens the reel too — it is the biggest thing on
                  the card and reads as the video itself. Hidden from assistive
                  tech and skipped by Tab: it goes where "Watch reel" already
                  goes, and a second unnamed link per card is a tab stop that
                  leads nowhere new. */}
              {fingerprint ? (
                <Link
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 rounded-t-xl transition-colors duration-150 ease-out-cubic hover:bg-foreground/5 motion-reduce:transition-none"
                  href={href}
                  style={{
                    aspectRatio: `${posters.width} / ${posters.height}`,
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
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3">
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>

            <CardFooter>
              <Button asChild size="sm" variant="outline">
                <Link href={href}>
                  <PlayReelIcon />
                  Watch reel
                </Link>
              </Button>
            </CardFooter>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
