import type * as React from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";

import { REELS } from "@/lib/site/reels-data";
import posters from "@/lib/site/reel-posters.json";
import { SiteNav } from "@/components/shell/site-nav";
import { CopySkillButton } from "@/components/reels/copy-skill-button";
import { VideoPlayer } from "@/components/reels/video-player";
import SKILL from "../../../.claude/skills/sarj-reel/SKILL.md";

/** Imported as raw text (see next.config.ts). Not readFileSync: the Cloudflare Worker has no file system at request time. */
const SKILL_PATH = ".claude/skills/sarj-reel/SKILL.md";

export const metadata = {
  title: "Reels showcase",
  description: "Release and feature videos built from the Sarj design system.",
};

export default function ReelsIndex() {
  return (
    <>
      <SiteNav
        actions={<CopySkillButton content={SKILL} path={SKILL_PATH} />}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 pt-8 pb-8">
        <h1 className="sr-only">Reels showcase</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {REELS.map(({ href, title, meta, icon, video }, i) => {
            const slug = href.replace("/reels/", "");
            const fingerprint =
              posters.fingerprints[slug as keyof typeof posters.fingerprints];
            const poster = fingerprint
              ? `/reels/${slug}/poster.webp?v=${fingerprint}`
              : undefined;
            if (!video && !poster) return null;

            // The same browser-window frame as the mockup index. The poster filename is reused on every render, so its fingerprint is the cache key.
            return (
              <article
                className="site-window window-enter flex flex-col"
                key={href}
                style={{ "--i": i + 1 } as React.CSSProperties}
              >
                <div className="flex items-center gap-3 px-3 pt-1 pb-2">
                  <div aria-hidden className="flex w-16 gap-1.5">
                    <span className="size-2.5 rounded-full bg-destructive/70" />
                    <span className="size-2.5 rounded-full bg-warning/70" />
                    <span className="size-2.5 rounded-full bg-success/70" />
                  </div>
                  <span className="flex-1 truncate text-center text-xs text-muted-foreground">
                    design.sarj.ai{href}
                  </span>
                  <div aria-hidden className="w-16" />
                </div>

                {video ? (
                  <VideoPlayer poster={poster} src={video} title={title} />
                ) : (
                  <Image
                    alt={title}
                    className="rounded-2xl"
                    height={posters.height}
                    src={poster as string}
                    unoptimized
                    width={posters.width}
                  />
                )}

                <div className="flex items-center gap-3 px-3 pt-4 pb-3">
                  <span className="site-window-badge relative flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                    <HugeiconsIcon
                      className="size-4"
                      icon={icon}
                      strokeWidth={1.8}
                    />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h2 className="truncate text-base font-semibold">
                      {title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{meta}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}
