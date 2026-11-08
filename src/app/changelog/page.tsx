import Link from "next/link";

import { SiteNav } from "@/components/shell/site-nav";
import { ChangelogRail } from "@/components/site/changelog-rail";
import { ChangelogShare } from "@/components/site/changelog-share";
import {
  CHANGELOG,
  type ChangeKind,
  type ChangelogEntry,
} from "@/lib/design-system/changelog";
import { docsHref, docsPage } from "@/lib/design-system/nav";

export const metadata = {
  title: "Changelog",
  description: "What changed in the Sarj design system, newest first.",
};

const KIND_LABEL: Record<ChangeKind, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
};

/* UTC so the prerendered date never shifts a day with the build machine. */
const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const MONTH = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  timeZone: "UTC",
});

const MONTH_YEAR = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const FIRST = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/* The dot beside each kind, so a run of removals or fixes stands out on a scan. */
const KIND_DOT: Record<ChangeKind, string> = {
  added: "bg-success",
  changed: "bg-primary",
  fixed: "bg-warning",
  removed: "bg-destructive",
};

type Day = { date: string; entries: ChangelogEntry[] };
type Month = { id: string; date: Date; days: Day[]; count: number };

function byMonth(entries: ChangelogEntry[]) {
  const months: Month[] = [];
  for (const entry of entries) {
    const id = entry.date.slice(0, 7);
    let month = months.at(-1);
    if (month?.id !== id) {
      month = { id, date: new Date(entry.date), days: [], count: 0 };
      months.push(month);
    }
    month.count += 1;
    const day = month.days.at(-1);
    if (day?.date === entry.date) day.entries.push(entry);
    else month.days.push({ date: entry.date, entries: [entry] });
  }
  return months;
}

export default function ChangelogPage() {
  const months = byMonth(CHANGELOG);
  const lines = CHANGELOG.flatMap((entry) => entry.changes);
  const kinds = (Object.keys(KIND_LABEL) as ChangeKind[])
    .map((kind) => ({
      kind,
      count: lines.filter((change) => change.kind === kind).length,
    }))
    .filter(({ count }) => count);
  const first = CHANGELOG.at(-1)?.date;

  return (
    <>
      <SiteNav />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-8 pb-24 pt-8">
        <header className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold">Changelog</h1>
          <p className="text-6xl font-semibold tracking-tight tabular-nums">
            {lines.length} changes
            <span className="block text-muted-foreground">
              {first ? `since ${FIRST.format(new Date(first))}` : null}
            </span>
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {kinds.map(({ kind, count }) => (
              <span className="flex items-center gap-2" key={kind}>
                <span className={`size-1.5 rounded-full ${KIND_DOT[kind]}`} />
                <span className="tabular-nums text-foreground">{count}</span>
                {KIND_LABEL[kind].toLowerCase()}
              </span>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-[10rem_1fr] gap-12">
          <aside>
            <ChangelogRail
              months={months.map((month) => ({
                id: month.id,
                label: MONTH_YEAR.format(month.date),
                count: month.count,
              }))}
            />
          </aside>

          <div className="flex min-w-0 flex-col gap-24">
            {months.map((month) => (
              <section
                className="flex scroll-mt-28 flex-col gap-10"
                id={month.id}
                key={month.id}
              >
                <h2 className="flex items-baseline justify-between gap-6 border-b pb-6">
                  <span className="text-7xl font-semibold tracking-tight">
                    {MONTH.format(month.date)}
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {month.count} {month.count === 1 ? "update" : "updates"}
                  </span>
                </h2>

                <ol className="flex flex-col gap-12">
                  {month.days.map(({ date, entries }) => (
                    <li className="flex gap-8" id={date} key={date}>
                      <time
                        className="w-16 shrink-0 pt-0.5 text-sm text-muted-foreground"
                        dateTime={date}
                      >
                        {DATE.format(new Date(date))}
                      </time>

                      <div className="flex min-w-0 flex-1 flex-col gap-10">
                        {entries.map((entry) => (
                          <Entry entry={entry} key={entry.title} />
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

/** A stable address for one update: its date and title, so a shared link survives new entries above it. */
function entryId(entry: ChangelogEntry) {
  const slug = entry.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${entry.date}-${slug}`;
}

function toMarkdown(entry: ChangelogEntry) {
  return [
    `**${entry.title}**`,
    entry.summary ?? "",
    ...entry.changes.map(
      (change) => `- ${KIND_LABEL[change.kind]}: ${change.text}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

function Entry({ entry }: { entry: ChangelogEntry }) {
  const topics = (entry.topics ?? []).flatMap((id) => {
    const page = docsPage(id);
    return page ? [{ href: docsHref(id), title: page.title }] : [];
  });

  return (
    <article
      className="changelog-entry group/entry relative isolate flex scroll-mt-32 flex-col gap-3"
      id={entryId(entry)}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold">{entry.title}</h3>
          <div className="opacity-0 transition-opacity duration-150 ease-out-cubic group-hover/entry:opacity-100 group-focus-within/entry:opacity-100 has-[[data-state=open]]:opacity-100 motion-reduce:transition-none">
            <ChangelogShare
              id={entryId(entry)}
              markdown={toMarkdown(entry)}
              title={entry.title}
            />
          </div>
        </div>
        {entry.summary ? (
          <p className="text-sm text-muted-foreground">{entry.summary}</p>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2">
        {entry.changes.map((change) => (
          <li className="flex gap-3 text-sm" key={change.text}>
            <span className="flex w-20 shrink-0 items-center gap-2 self-start text-muted-foreground">
              <span
                className={`size-1.5 shrink-0 rounded-full ${KIND_DOT[change.kind]}`}
              />
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
  );
}
