import { SiteNav } from "@/components/shell/site-nav"
import posters from "@/lib/site/reel-posters.json"
import type { Reel } from "@/lib/site/reels-data"

export function VideoReelPage({ reel }: { reel: Reel }) {
  const slug = reel.href.replace("/reels/", "")
  const fingerprint =
    posters.fingerprints[slug as keyof typeof posters.fingerprints]

  return (
    <div className="flex min-h-full grow flex-col">
      <SiteNav eyebrow={reel.meta} title={reel.title} />

      <main className="mx-auto flex w-full max-w-350 flex-col gap-6 px-8 pb-8">
        <video
          className="aspect-video w-full rounded-xl bg-muted ring-1 ring-foreground/10"
          controls
          playsInline
          poster={
            fingerprint
              ? `/reels/${slug}/poster.webp?v=${fingerprint}`
              : undefined
          }
          preload="metadata"
          src={reel.video}
        />
      </main>
    </div>
  )
}
