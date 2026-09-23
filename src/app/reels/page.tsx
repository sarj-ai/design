import { readFileSync } from "node:fs"
import { join } from "node:path"

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
import { REELS } from "@/lib/site/reels-data"
import posters from "@/lib/site/reel-posters.json"
import { PlayReelIcon } from "@/components/reels/icons"
import { SiteNav } from "@/components/shell/site-nav"
import { CopySkillButton } from "@/components/reels/copy-skill-button"

/**
 * The skill that builds a reel, read once while this page is prerendered.
 *
 * The route is static, so the read happens during the build and the file
 * travels inside the page — `node:fs` never runs on the Worker, and the
 * button needs no round trip. Reading it rather than keeping a copy is the
 * point: a copy would be a second version of the skill, wrong the first time
 * anybody edited the real one. If the file moves, the build fails here rather
 * than the page shipping a stale one.
 */
const SKILL_PATH = ".claude/skills/sarj-reel/SKILL.md"
const SKILL = readFileSync(join(process.cwd(), SKILL_PATH), "utf8")

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
    <>
      {/* The skill is what an agent reads to build one of these, and it is
          useful in whatever tool you are working in — not only to an agent
          that already has this repo checked out. */}
      <SiteNav
        actions={<CopySkillButton content={SKILL} path={SKILL_PATH} />}
      />

      <main className="mx-auto flex w-full max-w-360 flex-col gap-8 px-8 pb-8">
        <h1 className="text-2xl font-semibold">Reels</h1>

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
    </>
  )
}
