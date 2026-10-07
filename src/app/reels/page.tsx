import { readFileSync } from "node:fs"
import { join } from "node:path"

import Image from "next/image"

import { REELS } from "@/lib/site/reels-data"
import posters from "@/lib/site/reel-posters.json"
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
  title: "Reels showcase",
  description: "Release and feature videos built from the Sarj design system.",
}

/**
 * The reel gallery.
 *
 * A grid of the videos themselves, each playable in place. Each reel still
 * has its own route, which the nav search reaches.
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

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 pb-8">
        <h1 className="text-2xl font-semibold">Reels showcase</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {REELS.map(({ href, title, video }) => {
            const slug = href.replace("/reels/", "")
            const fingerprint =
              posters.fingerprints[slug as keyof typeof posters.fingerprints]
            const poster = fingerprint
              ? `/reels/${slug}/poster.webp?v=${fingerprint}`
              : undefined

            /* The video and nothing else: it plays right here with the
               browser's own controls, and its first frame says what it is
               better than a title and a line under it did. The poster's
               fingerprint is the cache key — the filename is reused on every
               render, so without it a reader keeps seeing the old one. */
            return video ? (
              <video
                aria-label={title}
                className="aspect-video w-full rounded-xl bg-muted ring-1 ring-foreground/10"
                controls
                key={href}
                playsInline
                poster={poster}
                preload="metadata"
                src={video}
              />
            ) : poster ? (
              <Image
                alt={title}
                className="rounded-xl ring-1 ring-foreground/10"
                height={posters.height}
                key={href}
                src={poster}
                unoptimized
                width={posters.width}
              />
            ) : null
          })}
        </div>
      </main>
    </>
  )
}
