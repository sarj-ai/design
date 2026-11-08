"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  EnterFullscreenIcon,
  ExitFullscreenIcon,
  PauseReelIcon,
  PlayReelIcon,
  SoundOffIcon,
  SoundOnIcon,
} from "@/components/reels/icons";
import { cn } from "@/lib/utils";

/** How long the pointer can rest before the controls step aside for the picture. */
const IDLE_MS = 2000;

function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * A rendered reel with the lab's own controls instead of the browser's: a play button
 * on the poster, then a floating bar — play, time, scrubber, sound, full screen — that
 * stays while paused and steps aside while playing once the pointer rests.
 */
export function VideoPlayer({
  src,
  poster,
  title,
  className,
}: {
  src: string;
  poster?: string;
  title: string;
  className?: string;
}) {
  const root = React.useRef<HTMLDivElement>(null);
  const video = React.useRef<HTMLVideoElement>(null);
  const idleTimer = React.useRef<number | undefined>(undefined);

  const [playing, setPlaying] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [full, setFull] = React.useState(false);
  const [idle, setIdle] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  // `timeupdate` fires about four times a second, which steps the scrubber; a frame loop while playing keeps it smooth.
  React.useEffect(() => {
    if (!playing) return;
    let id = 0;
    const tick = () => {
      if (video.current) setTime(video.current.currentTime);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing]);

  React.useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  React.useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  // Server-rendered, the video can load its metadata before hydration attaches `onLoadedMetadata`, so read the duration once on mount too.
  React.useEffect(() => {
    const el = video.current;
    if (el && el.readyState >= 1 && Number.isFinite(el.duration)) {
      setDuration(el.duration);
    }
  }, []);

  function wake() {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
  }

  function toggle() {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
    wake();
  }

  function seek(next: number) {
    const el = video.current;
    if (!el) return;
    el.currentTime = next;
    setTime(next);
  }

  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen();
  }

  const hidden = playing && idle;

  return (
    <div
      className={cn(
        "reel-player group/player relative overflow-hidden rounded-2xl bg-background",
        hidden && "cursor-none",
        className,
      )}
      onPointerLeave={() => playing && setIdle(true)}
      onPointerMove={wake}
      ref={root}
    >
      <video
        aria-label={title}
        className="aspect-video size-full object-contain"
        muted={muted}
        onClick={toggle}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPause={() => setPlaying(false)}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        playsInline
        poster={poster}
        preload="metadata"
        ref={video}
        src={src}
      />

      {/* Before the first play: one large button on the poster, nothing else. */}
      {!started ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            aria-label={`Play ${title}`}
            className="reel-play"
            onClick={toggle}
            variant="outline"
          >
            <PlayReelIcon />
          </Button>
        </div>
      ) : null}

      {started ? (
        <div
          className={cn(
            "reel-bar absolute inset-x-3 bottom-3 flex items-center gap-2",
            hidden && "pointer-events-none",
          )}
          data-hidden={hidden || undefined}
        >
          <Button
            aria-label={playing ? "Pause" : "Play"}
            onClick={toggle}
            size="icon-sm"
            variant="ghost"
          >
            {playing ? <PauseReelIcon /> : <PlayReelIcon />}
          </Button>

          <span className="shrink-0 text-xs font-medium text-foreground tabular-nums select-none">
            {clock(time)} / {clock(duration)}
          </span>

          <Slider
            aria-label="Seek"
            className="mx-2 flex-1"
            max={duration || 1}
            onValueChange={([next]) => seek(next)}
            step={0.01}
            value={[time]}
          />

          <Button
            aria-label={muted ? "Turn sound on" : "Mute"}
            onClick={() => setMuted((value) => !value)}
            size="icon-sm"
            variant="ghost"
          >
            {muted ? <SoundOffIcon /> : <SoundOnIcon />}
          </Button>

          <Button
            aria-label={full ? "Exit full screen" : "Full screen"}
            onClick={fullscreen}
            size="icon-sm"
            variant="ghost"
          >
            {full ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
