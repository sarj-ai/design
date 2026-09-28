"use client"

import {
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { icon } from "@/components/shared/icon"

const FirstIcon = icon(ArrowLeftDoubleIcon, "FirstIcon")
const PreviousIcon = icon(ArrowLeft01Icon, "PreviousIcon")
const NextIcon = icon(ArrowRight01Icon, "NextIcon")

export const PAGE_SIZES = [10, 25, 50, 100] as const

/**
 * The row under a list.
 *
 * Where you are on the left — "1–10 of 12", nothing more. On the right, the
 * page size ("10 / page") and the cursor: First, Previous and Next as one
 * joined group of icons, because they are one control that moves through the
 * list. No labels — the select's value and the arrows say it. No page
 * numbers: a list being written to cannot promise page four twice.
 */
export function ListFooter({
  from,
  shown,
  total,
  noun,
  pageSize,
  onPageSizeChange,
  atStart = true,
  atEnd = false,
  onFirst,
  onPrevious,
  onNext,
}: {
  /** Position of the first row on this page, counting from 1. */
  from: number
  /** Rows on this page. */
  shown: number
  /** Rows across every page. */
  total: number
  /** Plural, lower case: "scenarios", "calls". */
  noun: string
  pageSize: number
  onPageSizeChange?: (size: number) => void
  atStart?: boolean
  atEnd?: boolean
  onFirst?: () => void
  onPrevious?: () => void
  onNext?: () => void
}) {
  const to = from + shown - 1

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
      <span className="tabular-nums">
        {total ? `${from}–${to} of ${total}` : `No ${noun}`}
      </span>

      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(next) => onPageSizeChange?.(Number(next))}
        >
          <SelectTrigger aria-label="Rows per page" size="sm" className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ButtonGroup aria-label="Pages">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="First page"
            disabled={atStart}
            onClick={onFirst}
          >
            <FirstIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={atStart}
            onClick={onPrevious}
          >
            <PreviousIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={atEnd}
            onClick={onNext}
          >
            <NextIcon />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
