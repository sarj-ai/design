import type { CSSProperties } from "react";

import type { ToastKind } from "@/lib/mockups/custom-toasts-data";
import { cn } from "@/lib/utils";

// A toast's kind icon, drawn here rather than taken from HugeIcons so each
// stroke can move on its own. pathLength=1 lets one dash length (1) draw any
// stroke. Order: ring, mark, then the toast's text (TEXT_IN), then a reaction.
// Remount it (a new key) to play it again.

// The dash starts parked just before the path (offset 1.2 of a length-1 path, with
// a gap of 2 behind it), so not even its round cap shows until drawing begins.
const DRAW = { strokeDasharray: "1 2", "--draw-length": 1.2 } as CSSProperties;
// Dots scale and drop around their own centre, not the icon's.
const OWN_BOX: CSSProperties = { transformBox: "fill-box" };

/** The toast kinds, plus "loading" for a toast that is still working. */
export type GlyphKind = ToastKind | "loading";

const TONE: Partial<Record<GlyphKind, string>> = {
  success: "text-success",
  info: "text-info",
  error: "text-destructive",
};

export function KindGlyph({ kind }: { kind: GlyphKind }) {
  if (kind === "loading") {
    // A faint track and a quarter arc turning on it.
    return (
      <svg
        aria-hidden
        className="size-5 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-20" cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    );
  }

  const tone = TONE[kind];
  if (!tone) return null;

  const reaction =
    kind === "success"
      ? "animate-glyph-pop"
      : kind === "error"
        ? "animate-glyph-shake"
        : "";

  return (
    <svg
      aria-hidden
      className={cn(
        "size-5 shrink-0 origin-center overflow-visible motion-reduce:animate-none",
        tone,
        reaction,
      )}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle
        className="animate-glyph-ring motion-reduce:animate-none"
        cx="12"
        cy="12"
        pathLength={1}
        r="10"
        style={DRAW}
        transform="rotate(-90 12 12)"
      />
      {kind === "success" && (
        <path
          className="animate-glyph-mark motion-reduce:animate-none"
          d="M8 12.5l2.75 2.75L16.5 9.5"
          pathLength={1}
          style={DRAW}
        />
      )}
      {kind === "info" && (
        <>
          <path
            className="animate-glyph-drop motion-reduce:animate-none"
            d="M12 7.75h.01"
            strokeWidth="2.4"
            style={OWN_BOX}
          />
          <path
            className="animate-glyph-mark motion-reduce:animate-none"
            d="M12 11v5.25"
            pathLength={1}
            style={DRAW}
          />
        </>
      )}
      {kind === "error" && (
        <>
          <path
            className="animate-glyph-mark motion-reduce:animate-none"
            d="M12 7v5.5"
            pathLength={1}
            style={DRAW}
          />
          <path
            className="origin-center animate-glyph-dot motion-reduce:animate-none"
            d="M12 16.25h.01"
            strokeWidth="2.4"
            style={OWN_BOX}
          />
        </>
      )}
    </svg>
  );
}

/** The toast's lines arrive one after another: title, description, action. */
export const TEXT_IN = "animate-glyph-text motion-reduce:animate-none";

/** With a glyph the title waits for its mark (0.3s); without one it waits for the card to land (0.2s). Each next line is 60ms later. */
export function textDelay(kind: GlyphKind, line: 0 | 1 | 2): CSSProperties {
  const start = TONE[kind] ? 0.3 : 0.2;
  return { "--text-delay": `${start + line * 0.06}s` } as CSSProperties;
}
