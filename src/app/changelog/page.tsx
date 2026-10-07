import Link from "next/link"

import { SiteNav } from "@/components/shell/site-nav"
import {
  CHANGELOG,
  type ChangeKind,
  type ChangelogEntry,
} from "@/lib/design-system/changelog"
import { docsHref, docsPage } from "@/lib/design-system/nav"

export const metadata = {
  title: "Changelog",
  description: "What changed in the Sarj design system, newest first.",
}

const KIND_LABEL: Record<ChangeKind, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
}

/* UTC so the prerendered date never shifts a day with the build machine. */
const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

/** Entries that share a date, in the order the log lists them. */
function byDate(entries: ChangelogEntry[]) {
  const days: { date: string; entries: ChangelogEntry[] }[] = []
  for (const entry of entries) {
    const last = days.at(-1)
    if (last?.date === entry.date) last.entries.push(entry)
    else days.push({ date: entry.date, entries: [entry] })
  }
  return days
}

/**
 * The design system's changelog.
 *
 * One column of dates, one of what changed. Every line starts with its kind
 * in a fixed-width column, so a reader can run down Added or Fixed without
 * reading the sentences, and each entry links the topics it touched.
 */
export default function ChangelogPage() {
  return (
    <>
      <SiteNav />

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-8 pb-16 pt-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Changelog</h1>
          <p className="text-sm text-muted-foreground">
            What changed in the design system, newest first.
          </p>
        </div>

        <ol className="flex flex-col">
          {byDate(CHANGELOG).map(({ date, entries }) => (
            <li className="flex gap-8 border-t py-8" id={date} key={date}>
              <time
                className="w-28 shrink-0 text-sm text-muted-foreground"
                dateTime={date}
              >
                {DATE.format(new Date(date))}
              </time>

              <div className="flex min-w-0 flex-1 flex-col gap-8">
                {entries.map((entry) => (
                  <Entry entry={entry} key={entry.title} />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </main>
    </>
  )
}

function Entry({ entry }: { entry: ChangelogEntry }) {
  const topics = (entry.topics ?? []).flatMap((id) => {
    const page = docsPage(id)
    return page ? [{ href: docsHref(id), title: page.title }] : []
  })

  return (
    <article className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{entry.title}</h2>
        {entry.summary ? (
          <p className="text-sm text-muted-foreground">{entry.summary}</p>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2">
        {entry.changes.map((change) => (
          <li className="flex gap-3 text-sm" key={change.text}>
            <span className="w-16 shrink-0 text-muted-foreground">
              {KIND_LABEL[change.kind]}
            </span>
            <span>{change.text}</span>
          </li>
        ))}
      </ul>

      {topics.length ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {topics.map((topic) => (
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href={topic.href}
              key={topic.href}
            >
              {topic.title}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  )
}
