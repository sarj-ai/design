"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { UserJourney } from "@/lib/behavioral-alerts-data"
import {
  PurposeMetIcon,
  PurposeMissedIcon,
  RationaleIcon,
  RatingStarIcon,
} from "@/components/behavioral-alerts/icons"
import { SentimentBadge } from "@/components/behavioral-alerts/severity"

/**
 * What the caller's side of the call was like, generated for every analysed
 * call whether or not a single flag is configured.
 *
 * It leads the panel because it is the reading that always exists. The
 * detections under it are the exceptions; this is the baseline they are
 * exceptions to.
 */
export function UserExperienceBody({ journey }: { journey: UserJourney }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SentimentBadge sentiment={journey.sentiment} />
        <Rating rating={journey.rating} rationale={journey.ratingRationale} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Purpose</span>
        <p className="text-sm text-foreground">{journey.purpose}</p>
      </div>

      {/* The verdict on the purpose above it, as a chip rather than a band.
          Full width, it was a lot of filled surface for one short line — most
          of it empty — sitting on the section's own surface, which is already
          sitting on the panel's. Sized to itself it stops competing, and it
          matches the sentiment chip at the top of the same card.

          It keeps the green: the PRD needs "got what they rang for" to be able
          to sit next to a low rating without the two reading as a
          contradiction. Missing it stays neutral rather than red — the caller
          not getting what they rang for is the finding, not a failure to
          alarm about. */}
      <Badge
        className={cn(
          "self-start",
          journey.purposeAchieved &&
            "bg-success-tint text-success-tint-foreground",
        )}
        variant={journey.purposeAchieved ? "secondary" : "outline"}
      >
        {journey.purposeAchieved ? <PurposeMetIcon /> : <PurposeMissedIcon />}
        {journey.purposeAchieved
          ? "The caller got what they rang for"
          : "The caller did not get what they rang for"}
      </Badge>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Feeling</span>
        <div className="flex flex-wrap gap-2">
          {journey.keywords.map((keyword) => (
            <Badge key={keyword} variant="outline">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>
    </>
  )
}

const STARS = [1, 2, 3, 4, 5]

/**
 * The satisfaction rating, and the rationale behind it in the (i).
 *
 * Inline the rationale would be a sentence under every rating on every call —
 * the helper text this repo keeps deleting. In the tooltip it is there for the
 * one reader who disagrees with the number, which is who it is for.
 *
 * The stars are the brand purple rather than gold. Gold is not a token here,
 * and a rating is not a warning — `warning` would be the only near-miss and it
 * would read as "something is wrong with this call" on a five-star row.
 */
function Rating({ rating, rationale }: { rating: number; rationale: string }) {
  /* Every glyph here is 14px, level with the `2 / 5` beside them. At 16px the
     stars stood taller than the number they were restating and read as the
     loudest thing in a card whose actual finding is the sentiment. */
  return (
    <div className="flex items-center gap-2">
      <span
        aria-label={`${rating} out of 5`}
        className="flex items-center gap-0.5"
        role="img"
      >
        {STARS.map((star) => (
          <RatingStarIcon
            className={cn(
              "size-3.5",
              star <= rating
                ? "fill-current text-primary [&_path]:fill-current"
                : "text-muted-foreground",
            )}
            key={star}
            /* Lighter than the repo's 1.8 default. This glyph is a rounded
               star, and at 14px an 1.8 stroke thickens the points until a
               filled star and an empty one are the same silhouette — which is
               the whole reading. */
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="text-sm font-medium tabular-nums">{rating} / 5</span>
      <Tooltip>
        <TooltipTrigger
          aria-label="Why this rating"
          className="text-muted-foreground"
        >
          <RationaleIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{rationale}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
