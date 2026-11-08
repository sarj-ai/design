"use client";

import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CopiedIcon,
  CopyIcon,
  ExpandIcon,
  KnowledgeCategoryIcon,
  OtherCategoryIcon,
  PlatformCategoryIcon,
  PromptCategoryIcon,
  ToolCategoryIcon,
} from "@/components/mockups/opportunity-triage/icons";
import {
  CATEGORIES,
  CURRENT_USER,
  callsFor,
  hasRecurred,
  statusOf,
  type Call,
  type Category,
  type DecisionKind,
  type Opportunity,
  type Status,
} from "@/lib/mockups/opportunity-triage-data";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<Category, React.ComponentType> = {
  tool: ToolCategoryIcon,
  knowledge: KnowledgeCategoryIcon,
  prompt: PromptCategoryIcon,
  platform: PlatformCategoryIcon,
  other: OtherCategoryIcon,
};

const VIEWS: { id: Status; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "dismissed", label: "Dismissed" },
];

const EMPTY_VIEW: Record<Status, { title: string; description?: string }> = {
  open: {
    title: "Nothing open",
    description:
      "A resolved or dismissed opportunity comes back here if newer calls show it again.",
  },
  resolved: { title: "Nothing resolved yet" },
  dismissed: { title: "Nothing dismissed yet" },
};

const DECISION_VERB: Record<DecisionKind, string> = {
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export function OpportunitiesPanel({
  loading,
  onChange,
  opportunities,
  showNew,
}: {
  loading: boolean;
  onChange: (next: Opportunity[]) => void;
  opportunities: Opportunity[];
  /** New badges hold until the person leaves the tab. */
  showNew: boolean;
}) {
  const [view, setView] = React.useState<Status>("open");

  if (loading) return <PanelSkeleton />;

  if (opportunities.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No insights detected for this scenario yet.
      </div>
    );
  }

  const counts: Record<Status, number> = { open: 0, resolved: 0, dismissed: 0 };
  for (const opportunity of opportunities) counts[statusOf(opportunity)] += 1;

  const inView = opportunities.filter(
    (opportunity) => statusOf(opportunity) === view,
  );
  const sections = CATEGORIES.map((category) => ({
    ...category,
    items: inView.filter(
      (opportunity) => opportunity.category === category.key,
    ),
  })).filter((section) => section.items.length > 0);

  const replace = (next: Opportunity) =>
    onChange(
      opportunities.map((opportunity) =>
        opportunity.id === next.id ? next : opportunity,
      ),
    );

  const decide = (opportunity: Opportunity, kind: DecisionKind | null) => {
    const before = opportunity;
    replace({
      ...opportunity,
      decision:
        kind === null
          ? null
          : {
              kind,
              by: CURRENT_USER,
              at: new Date().toISOString().slice(0, 10),
            },
      callsSinceDecision: 0,
      isNew: false,
    });
    const undo = {
      label: "Undo",
      onClick: () =>
        onChange(
          opportunities.map((each) => (each.id === before.id ? before : each)),
        ),
    };
    if (kind === null) {
      toast("Reopened", { action: undo });
    } else {
      toast(DECISION_VERB[kind], {
        action: undo,
        description: "It comes back if newer calls show it again.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          aria-label="Show"
          onValueChange={(next) => {
            if (next) setView(next as Status);
          }}
          size="sm"
          type="single"
          value={view}
          variant="outline"
        >
          {VIEWS.map((entry) => (
            <ToggleGroupItem key={entry.id} value={entry.id}>
              {entry.label}
              <span className="text-muted-foreground tabular-nums">
                {counts[entry.id]}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {inView.length > 0 ? (
          <CopyButton
            getText={() => inView.map(copyText).join("\n\n")}
            label="Copy all"
            tooltip="Copy every insight in this view as text: title, category, call count, and description"
          />
        ) : null}
      </div>

      <div
        className="flex animate-pane-in flex-col gap-8 motion-reduce:animate-none"
        key={view}
      >
        {sections.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{EMPTY_VIEW[view].title}</EmptyTitle>
              {EMPTY_VIEW[view].description ? (
                <EmptyDescription>
                  {EMPTY_VIEW[view].description}
                </EmptyDescription>
              ) : null}
            </EmptyHeader>
          </Empty>
        ) : (
          sections.map((section) => {
            const SectionIcon = CATEGORY_ICONS[section.key];
            return (
              <section className="flex flex-col gap-3" key={section.key}>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground [&_svg]:size-4">
                    <SectionIcon />
                  </span>
                  <h3 className="text-sm font-semibold">{section.label}</h3>
                  <Badge className="tabular-nums" variant="secondary">
                    {section.items.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {section.items.map((opportunity) => (
                    <OpportunityRow
                      key={opportunity.id}
                      onDecide={(kind) => decide(opportunity, kind)}
                      opportunity={opportunity}
                      showNew={showNew}
                      view={view}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

function OpportunityRow({
  onDecide,
  opportunity,
  showNew,
  view,
}: {
  onDecide: (kind: DecisionKind | null) => void;
  opportunity: Opportunity;
  showNew: boolean;
  view: Status;
}) {
  const recurred = hasRecurred(opportunity);
  const { decision } = opportunity;
  const [leaving, setLeaving] = React.useState(false);

  const leave = (kind: DecisionKind | null) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDecide(kind);
      return;
    }
    setLeaving(true);
    window.setTimeout(() => onDecide(kind), 150);
  };

  return (
    <Collapsible
      className={cn(
        "overflow-hidden rounded-lg border bg-card",
        leaving &&
          "pointer-events-none animate-out fill-mode-forwards fade-out-0 zoom-out-95 duration-150 ease-out-cubic motion-reduce:animate-none",
      )}
    >
      <div className="flex h-14 items-center gap-1 pe-2 transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none">
        <CollapsibleTrigger className="group flex h-full min-w-0 flex-1 items-center gap-3 px-4 text-start">
          <span className="shrink-0 text-muted-foreground [&_svg]:size-4 transition-transform duration-200 ease-out-cubic group-data-[state=open]:rotate-90 motion-reduce:transition-none rtl:-scale-x-100">
            <ExpandIcon />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {opportunity.title}
          </span>
          {showNew && opportunity.isNew ? (
            <Badge className="shrink-0 bg-primary-tint text-primary-tint-foreground">
              New
            </Badge>
          ) : null}
          {recurred ? (
            <Badge className="shrink-0 bg-warning-tint text-warning-tint-foreground">
              Came back
            </Badge>
          ) : null}
          {view !== "open" && decision ? (
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              {decision.by} · {formatDay(decision.at)}
            </span>
          ) : null}
          <Badge className="shrink-0 tabular-nums" variant="secondary">
            {opportunity.callCount}{" "}
            {opportunity.callCount === 1 ? "call" : "calls"}
          </Badge>
        </CollapsibleTrigger>
        <CopyButton
          ariaLabel="Copy insight"
          getText={() => copyText(opportunity)}
          tooltip="Copy title, category, call count, and description"
        />
      </div>

      <CollapsibleContent className="overflow-hidden border-t data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
        <div className="flex flex-col gap-3 px-4 py-3">
          {recurred && decision ? (
            <p className="text-sm">
              {DECISION_VERB[decision.kind]} by {decision.by} on{" "}
              {formatDay(decision.at)}. Came back in{" "}
              {opportunity.callsSinceDecision}{" "}
              {opportunity.callsSinceDecision === 1 ? "call" : "calls"} since.
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {opportunity.description}
          </p>
          <CallList
            callCount={opportunity.callCount}
            calls={callsFor(opportunity)}
          />
          <div className="flex justify-end gap-2">
            {view === "open" ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => leave("dismissed")}
                      size="sm"
                      variant="ghost"
                    >
                      Dismiss
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Not worth fixing</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => leave("resolved")}
                      size="sm"
                      variant="outline"
                    >
                      Mark resolved
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fixed in the scenario</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <Button onClick={() => leave(null)} size="sm" variant="outline">
                Reopen
              </Button>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CallList({ callCount, calls }: { callCount: number; calls: Call[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">
        {callCount > calls.length
          ? `Showing latest ${calls.length} of ${callCount} calls`
          : `${calls.length} ${calls.length === 1 ? "call" : "calls"}`}
      </span>
      <div className="divide-y overflow-hidden rounded-md border">
        {calls.map((call) => (
          <div
            className="flex h-10 items-center gap-3 px-3 text-xs transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none"
            key={call.id}
          >
            <span className="w-32 shrink-0 text-muted-foreground tabular-nums">
              {formatCallDate(call.createdAt)}
            </span>
            <span className="truncate font-mono" dir="ltr">
              {call.phoneNumber}
            </span>
            <span className="ms-auto shrink-0 text-muted-foreground tabular-nums">
              {formatDuration(call.durationSeconds)}
            </span>
            <CallStatusBadge status={call.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CallStatusBadge({ status }: { status: Call["status"] }) {
  if (status === "completed") {
    return (
      <Badge className="shrink-0 bg-success-tint text-success-tint-foreground">
        Completed
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge className="shrink-0" variant="destructive">
        Failed
      </Badge>
    );
  }
  return (
    <Badge className="shrink-0" variant="secondary">
      No answer
    </Badge>
  );
}

function CopyButton({
  ariaLabel,
  getText,
  label,
  tooltip,
}: {
  ariaLabel?: string;
  getText: () => string;
  label?: string;
  tooltip: string;
}) {
  const [copied, setCopied] = React.useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={ariaLabel}
          onClick={() => {
            void navigator.clipboard?.writeText(getText());
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
          size={label === undefined ? "icon-xs" : "sm"}
          variant="ghost"
        >
          <span
            className={cn(
              copied &&
                "animate-in text-primary duration-150 ease-out-cubic fade-in-0 zoom-in-75 motion-reduce:animate-none",
            )}
            key={String(copied)}
          >
            {copied ? <CopiedIcon /> : <CopyIcon />}
          </span>
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        {copied ? "Copied" : tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      <Skeleton className="h-7 w-64 rounded-lg motion-reduce:animate-none" />
      <Skeleton className="h-5 w-44 motion-reduce:animate-none" />
      <Skeleton className="h-14 w-full rounded-lg motion-reduce:animate-none" />
      <Skeleton className="h-14 w-full rounded-lg motion-reduce:animate-none" />
      <Skeleton className="h-14 w-2/3 rounded-lg motion-reduce:animate-none" />
    </div>
  );
}

function copyText(opportunity: Opportunity): string {
  const category =
    CATEGORIES.find((entry) => entry.key === opportunity.category)?.label ??
    "Other";
  return `${opportunity.title} (${category}, ${opportunity.callCount} calls)\n${opportunity.description}`;
}

function formatDay(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function formatCallDate(createdAt: string): string {
  return new Date(createdAt).toLocaleString("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
