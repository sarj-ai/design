"use client"

import { FPS, interpolate, seconds, stagger } from "@/lib/reels/anim"
import { tour } from "@/lib/reels/cursor"
import { Appear, Scene, useFrame } from "@/components/reels/stage"
import { Shot } from "@/components/reels/shot"
import { Cursor } from "@/components/reels/cursor"
import { Brandmark, Headline, Kicker, Lead } from "@/components/reels/type"

const SHOT = { width: 2880, height: 1545 } as const

/** Regions of `scenario-editor.png`, in that file's own pixels. */
const EDITOR = {
  card: { x: 904, y: 281, width: 1535, height: 839 },
  attempts: { x: 936, y: 457, width: 256, height: 123 },
  window: { x: 936, y: 862, width: 500, height: 99 },
  save: { x: 2127, y: 1030, width: 281, height: 58 },
}

const SETUP = tour(SHOT, EDITOR, (s) =>
  s
    .parkAt("card")
    // 2880 source / 1535 card = 1.88, so this frames the card almost exactly.
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

      <Scene {...OUTCOME}>
        <div className="flex size-full flex-col items-center justify-center gap-10">
          <Appear delay={0}>
            <Shot
              alt="The routing options drawer"
              src="/reels/callback-tool/routing.png"
              width={SHOT.width}
              height={SHOT.height}
              frameWidth={1240}
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

      <Scene {...END}>
        <EndCard />
      </Scene>
    </>
  )
}

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
