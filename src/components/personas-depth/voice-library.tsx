"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertAction } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LANGUAGES, VOICES } from "@/lib/personas-depth-data"
import {
  LoadErrorIcon,
  PlayPreviewIcon,
  RetryIcon,
  SearchIcon,
  StopPreviewIcon,
  VoiceWaveIcon,
} from "@/components/personas-depth/icons"
import type { PreviewState } from "@/components/personas-depth/personas-index"

const PROVIDERS = [...new Set(VOICES.map((voice) => voice.provider))]

/**
 * The voice library as a browsing surface: every voice with its metadata and
 * a sample one click away, filterable the same way personas are.
 */
export function VoiceLibrary({ state }: { state: PreviewState }) {
  const [search, setSearch] = React.useState("")
  const [language, setLanguage] = React.useState("all")
  const [gender, setGender] = React.useState("all")
  const [provider, setProvider] = React.useState("all")
  const [playingId, setPlayingId] = React.useState<string | null>(null)

  const filtered = VOICES.filter((voice) => {
    if (language !== "all" && voice.language !== language) return false
    if (gender !== "all" && voice.gender !== gender) return false
    if (provider !== "all" && voice.provider !== provider) return false
    if (
      search &&
      !`${voice.name} ${voice.vibe}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false
    return true
  })

  const filtersActive =
    search !== "" ||
    language !== "all" ||
    gender !== "all" ||
    provider !== "all"

  if (state === "error") {
    return (
      <Alert variant="destructive">
        <LoadErrorIcon />
        <AlertTitle>Couldn&apos;t load the voice library</AlertTitle>
        <AlertDescription>
          Something went wrong fetching voices. Your personas keep their current
          voices in the meantime.
        </AlertDescription>
        <AlertAction>
          <Button variant="outline" size="sm">
            <RetryIcon />
            Retry
          </Button>
        </AlertAction>
      </Alert>
    )
  }

  if (state === "empty") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <VoiceWaveIcon />
          </EmptyMedia>
          <EmptyTitle>No voices yet</EmptyTitle>
          <EmptyDescription>
            Voices are added by an administrator. Once one exists for a
            language, personas in that language can use it.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="max-w-64">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search voices…"
            aria-label="Search voices"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger size="sm" aria-label="Filter by language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            {LANGUAGES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger size="sm" aria-label="Filter by gender">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genders</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
          </SelectContent>
        </Select>

        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger size="sm" aria-label="Filter by provider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            {PROVIDERS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {state === "loading"
          ? "Loading…"
          : filtersActive
            ? `${filtered.length} of ${VOICES.length} voices`
            : `${VOICES.length} voices`}
      </div>

      {/* --card-spacing: 0 lets the table reach the card's edges — the header
          band and row rules do the framing. */}
      <Card className="[--card-spacing:0px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">
                  Voice
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Language
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Gender
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Provider
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Status
                </TableHead>
                <TableHead className="text-end font-semibold text-foreground">
                  Preview
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {state === "loading" ? (
                Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-14" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-14" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ms-auto size-7" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        No voices match these filters.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearch("")
                          setLanguage("all")
                          setGender("all")
                          setProvider("all")
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((voice) => {
                  const playing = playingId === voice.id
                  return (
                    <TableRow
                      key={voice.id}
                      className="transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none"
                    >
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{voice.name}</span>
                          {/* self-start shrinks the box to its text, so short RTL
                          vibes sit at the cell edge instead of mid-column. */}
                          <span
                            dir="auto"
                            className="max-w-72 self-start truncate text-xs text-muted-foreground"
                          >
                            {voice.vibe}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-muted text-muted-foreground"
                        >
                          {voice.language}
                        </Badge>
                      </TableCell>
                      <TableCell>{voice.gender}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {voice.provider}
                      </TableCell>
                      <TableCell>
                        <Badge variant={voice.active ? "secondary" : "outline"}>
                          {voice.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={
                            playing
                              ? `Stop ${voice.name} sample`
                              : `Play ${voice.name} sample`
                          }
                          onClick={() =>
                            setPlayingId(playing ? null : voice.id)
                          }
                        >
                          {playing ? <StopPreviewIcon /> : <PlayPreviewIcon />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
