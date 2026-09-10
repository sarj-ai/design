"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The reel's words.
 *
 * Video copy fails in a specific way: it gets written like a slide deck, so
 * every card grows a heading, a subheading and a paragraph, and the viewer
 * reads instead of watching. A beat is one idea. The headline carries it; the
 * lead exists only when the headline genuinely cannot.
 *
 * Sentence case throughout. The `sarj-brand` reference allows uppercase in
 * exactly one place — a kicker with tracking — and `Kicker` is that place.
 * Nothing else on a reel is ever uppercased.
 */

/** The small label above a headline. Two or three words: the theme, not a claim. */
export function Kicker({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "text-reel-kicker font-bold tracking-widest text-primary uppercase",
        className,
      )}
    >
      {children}
    </p>
  )
}

/** The one idea of the beat. Aim for six words; hard-stop at twelve. */
export function Headline({
  children,
  className,
  size = "h1",
}: {
  children: React.ReactNode
  className?: string
  size?: "display" | "h1" | "h2"
}) {
  return (
    <h2
      className={cn(
        "font-extrabold tracking-tight text-balance text-foreground",
        size === "display" && "text-reel-display",
        size === "h1" && "text-reel-h1",
        size === "h2" && "text-reel-h2",
        className,
      )}
    >
      {children}
    </h2>
  )
}

/** One sentence, only when the headline cannot carry the idea alone. */
export function Lead({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "max-w-4xl text-reel-lead text-pretty text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  )
}

/**
 * The persistent corner label — which release, which product.
 *
 * Deliberately quiet and in the same place on every frame, so it reads as
 * chrome the eye can ignore rather than a thing to look at.
 */
export function Brandmark({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-14 right-16 flex items-center gap-3">
      <span className="text-reel-kicker font-bold tracking-widest text-muted-foreground uppercase">
        {children}
      </span>
    </div>
  )
}
