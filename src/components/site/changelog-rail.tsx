"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type RailMonth = { id: string; label: string; count: number };

/** The month index beside the changelog. The month being read is in full ink; the rest are muted, and each one jumps to its section. */
export function ChangelogRail({ months }: { months: RailMonth[] }) {
  const [active, setActive] = React.useState(months[0]?.id);

  React.useEffect(() => {
    const sections = months
      .map((month) => document.getElementById(month.id))
      .filter((el): el is HTMLElement => Boolean(el));

    /* The active month is the last one whose top has passed a line a third of the way down. */
    const update = () => {
      const line = window.innerHeight / 3;
      let current = sections[0]?.id;
      for (const section of sections)
        if (section.getBoundingClientRect().top <= line) current = section.id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [months]);

  return (
    <nav aria-label="Months" className="sticky top-28 flex flex-col">
      {months.map((month) => (
        <a
          aria-current={month.id === active ? "location" : undefined}
          className={cn(
            "flex items-baseline justify-between gap-4 py-1 text-sm transition-colors duration-150 ease-out-cubic motion-reduce:transition-none",
            month.id === active
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          data-no-transition
          href={`#${month.id}`}
          key={month.id}
        >
          {month.label}
          <span className="text-xs tabular-nums text-muted-foreground">
            {month.count}
          </span>
        </a>
      ))}
    </nav>
  );
}
