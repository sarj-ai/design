import Image from "next/image"

import { REELS } from "@/lib/site/reels-data"
import posters from "@/lib/site/reel-posters.json"
import { SiteNav } from "@/components/shell/site-nav"
import { CopySkillButton } from "@/components/reels/copy-skill-button"
import SKILL from "../../../.claude/skills/sarj-reel/SKILL.md"

/** Imported as raw text (see next.config.ts). Not readFileSync: the Cloudflare Worker has no file system at request time. */
const SKILL_PATH = ".claude/skills/sarj-reel/SKILL.md"

export const metadata = {
  title: "Reels showcase",
  description: "Release and feature videos built from the Sarj design system.",
}

export default function ReelsIndex() {
  return (
    <>
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

            // The poster filename is reused on every render, so its fingerprint is the cache key.
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
