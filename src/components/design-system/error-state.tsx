"use client"

import * as React from "react"

import { RetryIcon, WarningIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

/**
 * The one error block: what failed, why it is safe to try again, and Try
 * again. Every scope above a field uses it — a card's body, a table's rows, a
 * page's area — so a failure reads the same wherever it lands.
 *
 * It draws no box of its own. The container it replaces already has one (the
 * card, the table, the page), and the block takes that container's place at
 * that container's size, so nothing around it moves.
 *
 * The title names the thing ("Could not load call volume"); the description
 * says what the reader can rely on, not what the server said. While a retry is
 * running the button keeps its label and shows a spinner, and stays where it
 * is, so a second click lands on the same place.
 */
export function ErrorState({
  title,
  description = "Nothing was changed, so trying again is safe.",
  onRetry,
  retrying = false,
  className,
}: {
  /** What failed, named: "Could not load scenarios". Never "Something went
   *  wrong". */
  title: string
  description?: string
  onRetry: () => void
  retrying?: boolean
  className?: string
}) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          disabled={retrying}
          onClick={onRetry}
          size="sm"
          variant="outline"
        >
          {retrying ? <Spinner /> : <RetryIcon />}
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  )
}

/**
 * A retry that takes as long as a request does, so the spinner is seen. The
 * second attempt succeeds, which is what most retries do: the failure was one
 * request that timed out.
 */
export function useRetry() {
  const [failed, setFailed] = React.useState(true)
  const [retrying, setRetrying] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  return {
    failed,
    retrying,
    retry() {
      setRetrying(true)
      timer.current = setTimeout(() => {
        setRetrying(false)
        setFailed(false)
      }, 900)
    },
  }
}
