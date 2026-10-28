"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { UserJourney } from "@/lib/mockups/behavioral-alerts-data"
import {
  PurposeMetIcon,
  PurposeMissedIcon,
  RationaleIcon,
  RatingStarIcon,
} from "@/components/mockups/behavioral-alerts/icons"
import { SentimentBadge } from "@/components/mockups/behavioral-alerts/severity"

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

function Rating({ rating, rationale }: { rating: number; rationale: string }) {
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
            // Thinner than the 1.8 default: at 14px a 1.8 stroke makes filled
            // and empty stars look the same.
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
