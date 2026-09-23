"use client";

/**
 * A highlight colour washes across a headline character by character, lifting
 * each glyph out of a dimmed rest state as it passes, line after line.
 *
 * Ported from a GSAP original to motion/react, which the lab already ships —
 * GSAP would have been a second animation library, and every registry install
 * that reached this file would have pulled it into the platform. The timings
 * are the original's. Each glyph is a keyframe track with its own delay, so
 * the wave is declarative rather than a hand-built timeline.
 *
 * Lines are the `\n` breaks in `text`. The original also split a line that
 * wraps by measuring each glyph's `offsetTop`; that pass is left out, so a
 * paragraph that wraps runs as one continuous wave rather than line by line.
 */

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/** How long a glyph takes to pick up, or drop, the highlight colour. */
const FADE = 0.1;
/** How long a glyph stays fully highlighted before it returns to the base colour. */
const HOLD = 0.05;
/** The opacity lift trails the colour change by this much, so the wave reads as a band. */
const LIFT_DELAY = 0.1;
/** One glyph's whole highlight, from picking up the colour to dropping it. */
const SPAN = LIFT_DELAY + FADE + HOLD + FADE;

interface TextHighlightWaveProps {
  /** Headline copy. A newline starts a new line. */
  text?: string;
  /** Any CSS colour, including a theme token such as `var(--chart-6)`. */
  highlightColor?: string;
  /** Seconds between one character and the next. */
  charStagger?: number;
  /** Seconds each line trails the line above it. */
  lineStagger?: number;
  /** Seconds before the first character starts. */
  delay?: number;
  /** Opacity of a character before the wave reaches it. */
  restOpacity?: number;
  /** Replay every time the headline scrolls back into view instead of only once. */
  replay?: boolean;
  /** The element to render. */
  as?: "div" | "h1" | "h2" | "h3" | "p";
  className?: string;
}

export default function TextHighlightWave({
  text = "Light travels\nleft to right",
  highlightColor = "var(--chart-6)",
  charStagger = 0.04,
  lineStagger = 0.15,
  delay = 0,
  restOpacity = 0.15,
  replay = false,
  as = "div",
  className,
}: TextHighlightWaveProps) {
  const reduced = useReducedMotion() ?? false;
  const Tag =
    as === "h1"
      ? motion.h1
      : as === "h2"
        ? motion.h2
        : as === "h3"
          ? motion.h3
          : as === "p"
            ? motion.p
            : motion.div;

  return (
    <Tag
      className={cn(
        "text-foreground text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl",
        className
      )}
      initial="rest"
      whileInView="lit"
      viewport={{ once: !replay, margin: "0px 0px -15% 0px" }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split("\n").map((line, lineIndex) => {
          /* Position along the line, counting only glyphs — the spaces between
             words do not take a beat, as in the original. */
          let position = 0;
          return (
            <span key={lineIndex} className="block">
              {line.split(" ").map((word, wordIndex, words) => (
                <Fragment key={wordIndex}>
                  <span className="inline-block">
                    {[...word].map((char, charIndex) => {
                      const at = delay + lineIndex * lineStagger + position++ * charStagger;
                      return (
                        <motion.span
                          key={charIndex}
                          className="relative inline-block"
                          variants={{
                            rest: { opacity: reduced ? 1 : restOpacity },
                            lit: {
                              opacity: 1,
                              transition: reduced
                                ? { duration: 0 }
                                : { duration: FADE, delay: at + LIFT_DELAY, ease: "easeOut" },
                            },
                          }}
                        >
                          {char}
                          <motion.span
                            className="pointer-events-none absolute top-0 left-0"
                            style={{ color: highlightColor }}
                            variants={{
                              rest: { opacity: 0 },
                              lit: {
                                opacity: reduced ? 0 : [0, 1, 1, 0],
                                transition: reduced
                                  ? { duration: 0 }
                                  : {
                                      duration: SPAN,
                                      delay: at,
                                      times: [0, FADE / SPAN, (LIFT_DELAY + FADE + HOLD) / SPAN, 1],
                                      ease: ["easeOut", "linear", "easeIn"],
                                    },
                              },
                            }}
                          >
                            {char}
                          </motion.span>
                        </motion.span>
                      );
                    })}
                  </span>
                  {wordIndex < words.length - 1 ? " " : null}
                </Fragment>
              ))}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
