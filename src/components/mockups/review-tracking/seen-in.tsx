"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  PATTERN,
  SEEN_IN,
  type IdeaId,
} from "@/lib/mockups/review-tracking-data"

export function SeenIn({ idea }: { idea: IdeaId }) {
  const references = SEEN_IN[idea]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          Seen in {references.length} apps
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-80 flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">How others do it</span>
          <span className="text-sm text-muted-foreground">{PATTERN[idea]}</span>
        </div>
        <ul className="flex flex-col gap-3">
          {references.map((reference) => (
            <li className="flex flex-col gap-0.5" key={reference.app}>
              <a
                className="text-sm font-medium text-primary hover:underline"
                href={reference.url}
                rel="noreferrer"
                target="_blank"
              >
                {reference.app}
              </a>
              <span className="text-sm text-muted-foreground">
                {reference.how}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
