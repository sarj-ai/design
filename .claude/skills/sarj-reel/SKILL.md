---
name: sarj-reel
description: Build release and feature videos ("reels") in the design-lab repo — React compositions on a 1920x1080 canvas rendered to MP4, including the scripted-cursor tour system that drives a pointer through real product screenshots. Use whenever asked to make, edit, or review a release video, feature demo, product tour, changelog video, or any animated video in this repo.
---

# Reels — release and feature videos

A reel is a **React composition on a 1920x1080 canvas**, rendered to MP4 by
stepping one frame number. `/reels` is its index, beside the mockup one.

```bash
npm run new:reel -- release-17     # route + starting composition + card
npm run reel -- release-17         # → reels/release-17.mp4 (1080p h264)
```

---

## The one rule

**A reel is a pure function of one integer.** Given a frame number the
composition draws exactly one picture. No `transition-*`, no `animate-*`, no
timers, no `useEffect` that moves something.

That is not style — it is what makes the system work. Playback is a rAF loop
advancing the number; rendering is Playwright setting the number and
screenshotting. They cannot disagree, so what you watch in the browser is what
ships. Break this rule and the export silently differs from the preview.

Everything that moves comes from `src/lib/reels/anim.ts`:

| Helper | Use |
|---|---|
| `interpolate(frame, [in], [out], {easing})` | the workhorse — any value, any curve |
| `enter(frame, {delay, distance})` | rise and fade in |
| `exit(frame, sceneDuration)` | fade and lift out |
| `stagger(i, step, base)` | nth item's delay in a group |
| `seconds(n)` / `FPS` / `timecode(f)` | authoring in seconds, thinking in frames |
| `easeOutCubic` / `easeInOutCubic` | the design system's curves, ported to JS |
| `easeOutBack` | overshoot — **cursor clicks only**, nothing in the app overshoots |

`<Appear>` covers the common entrance. Reach past it to `interpolate` the
moment it is not the move you want; that freedom is the point.

---

## Never a template

The shared layer is the canvas, the camera and the type — the things that must
not vary. **Above that, write each reel from scratch and vary the layout every
beat.**

The engine this replaced took the opposite bet: one card shape and a JSON spec
of headline-plus-sub. Every release looked like the last one because
structurally it *was* the last one. If three beats in a row share a layout, the
reel has become a slideshow — change one.

Layouts that work, mix them: text above a centred shot · text left with the
shot bled off the right edge · a large quiet shot with one line under it · text
alone on the canvas for a hook or an end card.

---

## Show the product

The old engine's hard rule was "motif cards, not screenshots", and no viewer
could tell from a shield or a bolt what had shipped. **Put real screenshots in
`public/reels/<slug>/`.**

- **Capture at 2x.** Downscaling a 2x shot into a 1080p frame stays sharp;
  upscaling a 1x shot to fill the frame does not.
- **Crop off the design-lab shell header and the Agentation dev overlay** if you
  captured from a dev server. Neither is product UI. `scripts/screenshots.mjs`
  avoids Agentation by running against a production build — do the same, or crop.
- **Real customer names must not reach a video that leaves the company.**
- **Always frame with `focus`.** A 2880px screenshot dropped whole onto a 1080p
  canvas renders every control at about a third of readable size, which defeats
  the entire point of using a screenshot.

```tsx
const SHOT = { width: 2880, height: 1545 } as const

const EDITOR = {
  card: { x: 904, y: 281, width: 1535, height: 839 },
  attempts: { x: 936, y: 457, width: 256, height: 123 },
  save: { x: 2127, y: 1030, width: 281, height: 58 },
}

<Shot
  alt="The scenario editor"
  src="/reels/callback-tool/scenario-editor.png"
  width={SHOT.width} height={SHOT.height}
  frameWidth={1400}
  focus={EDITOR.card}
  at={[20, 150]}
>
  <Spotlight rect={EDITOR.attempts} at={[150, 165]} />
  <Pin rect={EDITOR.attempts} label="How many tries" side="end" at={[158, 175]} />
</Shot>
```

Rects are in the **screenshot's own pixels**. `Spotlight` and `Pin` travel with
the camera because they live inside it. `Pin side="end"` is the one that
survives a dense form — anything below a field lands on the next field's label.

---

## The scripted cursor

For "here is how you use it", drive a pointer through the screenshot instead of
cutting between framings. Author it as verbs; the engine compiles them to
keyframe tracks on one clock and samples at the playhead.

```tsx
const SETUP = tour(SHOT, EDITOR, (s) =>
  s.parkAt("card")
   .zoomTo("card", { z: 1.65, duration: 1.3 })
   .enter(0.4)
   .moveTo("attempts").click().wait(0.9)
   .moveTo("save").click().wait(0.8)
   .leave(),
)

<Shot … camera={SETUP}>
  <Cursor tour={SETUP} />
</Shot>
```

Verbs: `parkAt` `enter` `leave` `wait` `moveTo` `click` `zoomTo` `zoomOut`.
Times are in **seconds**.

Four things carry the whole illusion. Do not re-tune them per reel:

1. **Targets are named regions, never pixels.** `moveTo("save")` resolves
   against the same rects `focus` and `Spotlight` use, so the pointer lands dead
   centre on the control at any framing.
2. **Travel time is derived from distance**, not fixed — roughly the
   screenshot's width per 1.75s, clamped to 0.4–1.6s. A short hop stays quick, a
   long sweep never drags. This is most of why it reads as a hand and not a
   tween. Passing an explicit `duration` throws that away; do it only when a
   beat genuinely needs to land on a mark.
3. **A click is a press then a release** — press takes 40% and squashes to 0.86,
   release returns on `easeOutBack` so it overshoots slightly and settles.
4. **The pointer counter-scales against the camera.** `<Cursor>` handles it. A
   pointer that grows with the zoom reads as a sticker on a photograph.

Pass `camera={tour}` and one script owns both the frame and the hand, so the
camera follows the pointer instead of being timed against it by eye.

**Do not add a `Spotlight` or a `Pin` to a control the cursor is clicking.** A
ring plus a label plus a pointer is three things pointing at one thing.

Ported from the tines.com demo player rebuilt in Vansh's reverse-engineer
vault. The technique travels; none of its styling does — that original leans on
drop shadows, which this repo bans.

---

## Copy

`sarj-no-slop` applies in full. On a reel it bites harder, because a viewer
cannot re-read a frame that has gone.

- **Sentence case.** `Kicker` is the one place uppercase is allowed, matching
  `sarj-brand`.
- **A beat is one idea.** The headline carries it. `Lead` exists only when the
  headline genuinely cannot — most beats do not need one.
- **Six words in a headline, twelve at the outside.**
- **Open on the problem, not on a screenshot.** A reel that starts on UI has
  skipped the only question the viewer has.
- **Never caption what the picture already says.** If the shot shows a queue,
  the headline is not "the queue".

Editorial: lead with the release's real story and show 3–4 headline features
working. Fold the rest — CI, deps, refactors — into one honest card. Covering
every PR equally is what makes a video a narrated changelog.

---

## Lint applies in full

A reel is `src/` like everything else, so all ten rules bite. This is
deliberate: the previous engine rendered every video in `#674EA7`, a
pre-rebrand purple, for as long as nobody hand-checked it.

- Colours are tokens. There is no reel palette.
- **No shadows.** A screenshot on a white canvas gets an edge — `<Shot>` already
  puts a `border` and a radius on it.
- **No gradients**, no glass, no animated background blobs. `sarj-brand` bans
  them for Sarj-branded output and a video is exactly that.
- Type on the canvas uses the `--text-reel-*` tokens via `Headline`, `Lead`,
  `Kicker`. Never an arbitrary size.
- Frame-driven inline `style` for geometry is correct and expected —
  `no-raw-color` reserves the style prop for exactly this. Colour still never
  goes there.

---

## Files

```
src/lib/reels/anim.ts          the kernel — interpolate, easings, Rect
src/lib/reels/cursor.ts        the tour engine — verbs to keyframe tracks
src/lib/reels-data.ts          the /reels index registry
src/lib/reel-posters.json      generated by the renderer; do not hand-edit
src/components/reels/          stage · shot · cursor · type · player · reel-page
src/components/reels/<slug>/   one composition per reel
src/app/reels/<slug>/page.tsx  the route, thin — reads ?render=1
public/reels/<slug>/           that reel's screenshots
scripts/new-reel.mjs           the scaffold
scripts/render-reel.mjs        frames to ffmpeg, plus the poster
reels/<slug>.mp4               output, gitignored
```

`?render=1` strips the player and pins the canvas to 1:1. The renderer loads the
page **once** and seeks — it never reloads per frame.

---

## Before you finish

- `npm run lint` — zero problems
- `npm run typecheck`
- `npm run reel -- <slug>`, then **watch the MP4**. Pull frames with
  `ffmpeg -ss <t> -i reels/<slug>.mp4 -frames:v 1 out.png` and look at the beats.
- Check a cursor beat frame-by-frame: does the pointer land *on* the control,
  or near it?
- `sarj-no-slop` pass — delete 30% of the words and see if it reads clearer
- Say which copy is yours and which came from the release notes
