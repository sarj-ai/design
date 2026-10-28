"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

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

export function Brandmark({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-14 right-16 flex items-center gap-3">
      <span className="text-reel-kicker font-bold tracking-widest text-muted-foreground uppercase">
        {children}
      </span>
    </div>
  )
}
