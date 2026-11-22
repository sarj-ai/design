import type { CSSProperties } from "react";

import type { ToastKind } from "@/lib/mockups/custom-toasts-data";
import { cn } from "@/lib/utils";

const DRAW: CSSProperties & Record<"--draw-length", number> = {
  strokeDasharray: "1 2",
  "--draw-length": 1.2,
};
const OWN_BOX: CSSProperties = { transformBox: "fill-box" };

export type GlyphKind = ToastKind | "loading";

const TONE: Partial<Record<GlyphKind, string>> = {
  success: "text-success",
  info: "text-info",
  error: "text-destructive",
};

export function KindGlyph({ kind }: { kind: GlyphKind }) {
  if (kind === "loading") {
    return (
      <svg
        aria-hidden="true"
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
      aria-hidden="true"
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

export const TEXT_IN = "animate-glyph-text motion-reduce:animate-none";

export function textDelay(kind: GlyphKind, line: 0 | 1 | 2): CSSProperties {
  const start = TONE[kind] === undefined ? 0.2 : 0.3;
  const style: CSSProperties & Record<"--text-delay", string> = {
    "--text-delay": `${String(start + line * 0.06)}s`,
  };
  return style;
}
