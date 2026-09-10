"use client"

import { FPS, interpolate, seconds, stagger } from "@/lib/reels/anim"
import { tour } from "@/lib/reels/cursor"
import { Appear, Scene, useFrame } from "@/components/reels/stage"
import { Shot } from "@/components/reels/shot"
import { Cursor } from "@/components/reels/cursor"
import { Brandmark, Headline, Kicker, Lead } from "@/components/reels/type"

/**
 * The callback-tool release reel.
 *
 * This file is the EDITORIAL layer — what this release says, and how it is
 * paced. It is written from scratch per reel, on purpose. The old engine took
 * the opposite bet: one renderer, one card shape, a JSON spec of headline plus
 * sub, and every release came out looking like the last one because
 * structurally it *was* the last one. Here the shared layer is the canvas, the
 * camera and the type — things that must not vary — and everything above that
 * is free.
 *
 * Note the beats below use three different layouts. That is the point.
 *
 * SHOTS: `public/reels/callback-tool/*.png`, captured at 2x with the design-lab
 * shell and the Agentation dev overlay cropped off. They are stand-ins from
 * design-lab mockups — swap in real platform captures and update the focus
 * rects, which are in the screenshot's own pixels.
 *
 * COPY: placeholder framing. Replace with the release's real story before this
 * goes anywhere near Slack.
 */

const SHOT = { width: 2880, height: 1545 } as const

/**
 * Regions of `scenario-editor.png`, in that file's own pixels.
 *
 * Named once and used twice — the tour below aims at these, and anything else
 * that wants to point at a control (`Spotlight`, `Pin`) takes the same rects.
 * Naming them is what lets the script read as verbs instead of coordinates.
 */
const EDITOR = {
  card: { x: 904, y: 281, width: 1535, height: 839 },
  attempts: { x: 936, y: 457, width: 256, height: 123 },
  window: { x: 936, y: 862, width: 500, height: 99 },
  save: { x: 2127, y: 1030, width: 281, height: 58 },
}

/**
 * The set-up beat, as a hand using the product.
 *
 * The camera and the pointer come off this one script, so the frame follows
 * the hand rather than being timed against it by eye. Travel times are not
 * written here on purpose — each hop is derived from how far it actually is,
 * which is what stops a tour sounding metronomic.
 */
const SETUP = tour(SHOT, EDITOR, (s) =>
  s
    .parkAt("card")
    /* 2880 source / 1535 card = 1.88, so this frames the card almost exactly.
       Anything less leaves the controls too small to read at Slack size. */
    .zoomTo("card", { z: 1.85, duration: 1.3 })
    .enter(0.4)
    .moveTo("attempts")
    .click()
    .wait(0.9)
    .moveTo("window")
    .click()
    .wait(0.9)
    .moveTo("save")
    .click()
    .wait(0.8)
    .leave(),
)

/* One place to read the running order. Every `from` below is derived, so a
   scene can be re-timed without renumbering the ones after it. */
const HOOK = { from: 0, duration: seconds(4.5) }
const TITLE = { from: 125, duration: seconds(5.2) }
const CONFIGURE = { from: 270, duration: seconds(10) }
const ON_CALL = { from: 560, duration: seconds(9.7) }
const OUTCOME = { from: 840, duration: seconds(6) }
const END = { from: 1010, duration: seconds(4.3) }

export const DURATION = 38 * FPS

export function CallbackToolReel() {
  return (
    <>
      <Brandmark>Release 16</Brandmark>

      {/* 1 — the problem, before the product appears. A reel that opens on a
          screenshot has skipped the only question the viewer has. */}
      <Scene {...HOOK}>
        <div className="flex size-full flex-col justify-center gap-6 px-32">
          <Appear delay={0}>
            <Kicker>Release 16</Kicker>
          </Appear>
          <Appear delay={6} exitAt={12}>
            <Headline size="display">A caller asks to be called back.</Headline>
          </Appear>
          <Appear delay={16} exitAt={12}>
            <Lead>Someone has to remember. Someone usually does not.</Lead>
          </Appear>
        </div>
      </Scene>

      {/* 2 — name it once, on its own, so the name lands before the UI does. */}
      <Scene {...TITLE}>
        <div className="flex size-full flex-col justify-center gap-6 px-32">
          <Appear delay={4} exitAt={14}>
            <Headline size="display">Callback tool</Headline>
          </Appear>
          <Appear delay={14} exitAt={14}>
            <Lead>The agent books the callback during the call.</Lead>
          </Appear>
        </div>
      </Scene>

      {/* 3 — text above, shot below. The camera pushes from the whole screen
          into the settings card, so the viewer sees where they are before they
          are asked to read anything. */}
      <Scene {...CONFIGURE}>
        <div className="flex size-full flex-col gap-10 px-32 pt-24">
          <div className="flex flex-col gap-3">
            <Appear delay={0}>
              <Kicker>Set up</Kicker>
            </Appear>
            <Appear delay={6}>
              <Headline size="h2">Configured once, on the scenario</Headline>
            </Appear>
          </div>

          {/* No spotlight and no pin on this beat: the pointer is already
              saying "this control", and the field it lands on is labelled.
              A ring plus a label plus a cursor is three things pointing at one
              thing. */}
          <Appear delay={10} className="self-center">
            <Shot
              alt="The scenario editor, with the callback settings card open"
              src="/reels/callback-tool/scenario-editor.png"
              width={SHOT.width}
              height={SHOT.height}
              frameWidth={1400}
              camera={SETUP}
            >
              <Cursor tour={SETUP} />
            </Shot>
          </Appear>
        </div>
      </Scene>

      {/* 4 — a different shape: text left, shot bled off the right edge. The
          crop implies the screen continues past the frame, which reads as a
          product rather than a slide. */}
      <Scene {...ON_CALL}>
        <div className="relative size-full">
          <div className="absolute top-0 bottom-0 left-32 flex w-2xl flex-col justify-center gap-5">
            <Appear delay={0}>
              <Kicker>On the call</Kicker>
            </Appear>
            <Appear delay={6}>
              <Headline size="h2">The agent offers it, then books it</Headline>
            </Appear>
            <Appear delay={12}>
              <Lead>
                No note to action afterwards. It is already scheduled.
              </Lead>
            </Appear>
          </div>

          <Appear delay={14} className="absolute top-40 -right-40">
            <Shot
              alt="A conversation where the agent schedules a callback"
              src="/reels/callback-tool/conversation.png"
              width={SHOT.width}
              height={SHOT.height}
              frameWidth={1180}
              origin={{ x: 700, y: 0, width: 2180, height: 1170 }}
              focus={{ x: 900, y: 120, width: 1700, height: 912 }}
              at={[20, 260]}
            />
          </Appear>
        </div>
      </Scene>

      {/* 5 — the payoff. Shot large and quiet, one line over it. */}
      <Scene {...OUTCOME}>
        <div className="flex size-full flex-col items-center justify-center gap-10">
          <Appear delay={0}>
            <Shot
              alt="The routing options drawer"
              src="/reels/callback-tool/routing.png"
              width={SHOT.width}
              height={SHOT.height}
              frameWidth={1240}
              /* The drawer only. The left of this screenshot is the dimmed
                 page behind it, which reads as a dead grey slab on a canvas
                 this size. */
              origin={{ x: 1344, y: 0, width: 1536, height: 824 }}
              focus={{ x: 1344, y: 200, width: 1536, height: 824 }}
              at={[0, 170]}
            />
          </Appear>
          <Appear delay={12}>
            <Headline size="h2" className="text-center">
              Every reason gets a destination
            </Headline>
          </Appear>
        </div>
      </Scene>

      {/* 6 — the end card, with the one detail a viewer might act on. */}
      <Scene {...END}>
        <EndCard />
      </Scene>
    </>
  )
}

/**
 * The closing frame.
 *
 * Written out rather than assembled from `Appear` because the rule underneath
 * it is doing something the shared helper does not: the three lines share one
 * rise so they read as a single block arriving, instead of a stagger that
 * makes the viewer's eye track three separate arrivals on the last beat.
 */
function EndCard() {
  const frame = useFrame()
  const lines = ["Callback tool", "Release 16", "sarj.ai"]

  return (
    <div className="flex size-full flex-col items-center justify-center gap-8">
      <div
        className="h-1 rounded-full bg-primary"
        style={{ width: interpolate(frame, [0, 26], [0, 220]) }}
      />

      <div className="flex flex-col items-center gap-4">
        {lines.map((line, index) => (
          <div
            key={line}
            style={{
              opacity: interpolate(
                frame,
                [stagger(index, 5, 8), stagger(index, 5, 8) + 14],
                [0, 1],
              ),
              transform: `translateY(${interpolate(
                frame,
                [stagger(index, 5, 8), stagger(index, 5, 8) + 14],
                [14, 0],
              ).toFixed(3)}px)`,
            }}
          >
            {index === 0 ? (
              <Headline size="h1">{line}</Headline>
            ) : (
              <p
                className={
                  index === 1
                    ? "text-reel-lead text-muted-foreground"
                    : "text-reel-body font-semibold text-primary"
                }
              >
                {line}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
