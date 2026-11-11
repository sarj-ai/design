"use client";

import * as React from "react";

import { SecondaryTabs } from "@/components/design-system/tabs-preview";
import {
  CloseIcon,
  EditFromIcon,
} from "@/components/mockups/global-prompt-versioning/icons";
import { DiffStat, diffStat, FoldedDiff } from "@/components/shared/line-diff";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Item } from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Subject, Version } from "@/lib/mockups/config-versioning-data";
import type { CaseId } from "@/lib/mockups/global-prompt-versioning-data";
import { cn } from "@/lib/utils";

const PAGE = 5;

export type ApplyResult = "ok" | "failed";

export function HistoryDrawer({
  open,
  onOpenChange,
  subject,
  initial,
  caseId,
  canEdit,
  canPublish,
  editing,
  onApply,
  onEditFrom,
  approval,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject;
  initial: { n: number; against: number | null };
  caseId: CaseId;
  canEdit: boolean;
  canPublish: boolean;
  editing: number;
  onApply: (n: number) => Promise<ApplyResult>;
  onEditFrom: (n: number) => void;
  approval?: Approval;
}) {
  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-5xl!">
        <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="flex flex-col gap-0.5">
            <DrawerTitle>Version history</DrawerTitle>
            <DrawerDescription className="tabular-nums">
              {subject.name} · In use: v{subject.inUse}
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button aria-label="Close" size="icon-sm" variant="ghost">
              <CloseIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {open ? (
          <HistoryBody
            approval={approval}
            canEdit={canEdit}
            canPublish={canPublish}
            caseId={caseId}
            editing={editing}
            initial={initial}
            key={`${String(initial.n)}-${String(initial.against)}`}
            onApply={onApply}
            onEditFrom={onEditFrom}
            subject={subject}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

type Load = "loading" | "failed" | "ready";

interface Approval {
  by: string;
  pending: number | null;
  onRequest: (n: number) => void;
}

function HistoryBody({
  approval,
  subject,
  initial,
  caseId,
  canEdit,
  canPublish,
  editing,
  onApply,
  onEditFrom,
}: {
  approval?: Approval;
  subject: Subject;
  initial: { n: number; against: number | null };
  caseId: CaseId;
  canEdit: boolean;
  canPublish: boolean;
  editing: number;
  onApply: (n: number) => Promise<ApplyResult>;
  onEditFrom: (n: number) => void;
}) {
  const [load, setLoad] = React.useState<Load>("loading");
  const [attempt, setAttempt] = React.useState(0);
  const [selected, setSelected] = React.useState(initial.n);
  const [against, setAgainst] = React.useState<number | null>(initial.against);
  const [count, setCount] = React.useState(() => {
    const index = subject.versions.findIndex((item) => item.n === initial.n);
    return Math.max(PAGE, Math.ceil((index + 1) / PAGE) * PAGE);
  });
  const [loadingMore, setLoadingMore] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(
      () =>
        setLoad(
          caseId === "history-fails" && attempt === 0 ? "failed" : "ready",
        ),
      600,
    );
    return () => clearTimeout(timer);
  }, [attempt, caseId]);

  if (load === "loading") return <ListSkeleton />;

  if (load === "failed") {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Couldn’t load versions</EmptyTitle>
            <EmptyDescription>
              Nothing changed. The global prompt and the version in use are as
              they were.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => {
                setLoad("loading");
                setAttempt((current) => current + 1);
              }}
              size="lg"
              variant="outline"
            >
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const shown = subject.versions.slice(0, count);
  const more = subject.versions.length - shown.length;
  const version =
    subject.versions.find((item) => item.n === selected) ?? subject.versions[0];
  const find = (n: number | null) =>
    subject.versions.find((item) => item.n === n) ?? null;
  const compare =
    find(against === version.n ? null : against) ??
    find(version.editedFrom) ??
    subject.versions.find((item) => item.n < version.n) ??
    null;

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-80 shrink-0 flex-col border-e">
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <ol className="flex flex-col gap-1">
            {shown.map((item, index) => (
              <VersionRow
                inUse={item.n === subject.inUse}
                key={item.n}
                last={index === shown.length - 1}
                latest={item.n === subject.versions[0].n}
                onSelect={() => {
                  setSelected(item.n);
                  setAgainst(null);
                }}
                selected={item.n === version.n}
                version={item}
              />
            ))}
          </ol>
          {more > 0 ? (
            <Button
              className="mt-2 w-full"
              disabled={loadingMore}
              onClick={() => {
                setLoadingMore(true);
                setTimeout(() => {
                  setCount((current) => current + PAGE);
                  setLoadingMore(false);
                }, 500);
              }}
              variant="ghost"
            >
              {loadingMore ? <Spinner /> : null}
              Load more
            </Button>
          ) : null}
        </div>
      </aside>

      <VersionPane
        against={compare}
        approval={approval}
        canEdit={canEdit}
        canPublish={canPublish}
        editing={editing}
        key={version.n}
        onAgainst={setAgainst}
        onApply={onApply}
        onEditFrom={onEditFrom}
        subject={subject}
        version={version}
      />
    </div>
  );
}

function VersionRow({
  version,
  inUse,
  latest,
  last,
  selected,
  onSelect,
}: {
  version: Version;
  inUse: boolean;
  latest: boolean;
  last: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li className="relative">
      {last ? null : (
        <span
          aria-hidden
          className="absolute start-3.5 top-4.5 -bottom-5.5 w-px bg-border"
        />
      )}
      <Item
        aria-current={selected ? "true" : undefined}
        className={cn(
          "cursor-pointer flex-nowrap items-start text-start motion-reduce:transition-none",
          selected ? "bg-muted" : "hover:bg-muted/50",
        )}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onSelect();
        }}
        role="button"
        size="xs"
        tabIndex={0}
      >
        <span aria-hidden className="flex w-2 shrink-0 pt-1.5">
          <span
            className={cn(
              "relative size-2 rounded-full",
              inUse
                ? "bg-success"
                : selected
                  ? "bg-foreground"
                  : "border border-muted-foreground/50 bg-background",
            )}
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2 font-medium tabular-nums">
            v{version.n}
            {inUse ? (
              <Badge
                className="bg-success-tint text-success-tint-foreground"
                variant="secondary"
              >
                In use
              </Badge>
            ) : latest ? (
              <Badge variant="outline">Latest</Badge>
            ) : null}
            <span className="ms-auto text-xs font-normal text-muted-foreground">
              {version.at}
            </span>
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {version.author}
            {version.editedFrom ? ` · from v${String(version.editedFrom)}` : ""}
          </span>
        </span>
      </Item>
    </li>
  );
}

function VersionPane({
  approval,
  subject,
  version,
  against,
  onAgainst,
  canEdit,
  canPublish,
  editing,
  onApply,
  onEditFrom,
}: {
  approval?: Approval;
  subject: Subject;
  version: Version;
  against: Version | null;
  onAgainst: (n: number) => void;
  canEdit: boolean;
  canPublish: boolean;
  editing: number;
  onApply: (n: number) => Promise<ApplyResult>;
  onEditFrom: (n: number) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<ApplyResult | null>(null);
  const [confirming, setConfirming] = React.useState(false);
  const inUse = subject.inUse;
  const isInUse = version.n === inUse;

  const verb = version.n > inUse ? "Publish" : "Restore";
  const action = actionFor(isInUse, approval, `${verb} v${String(version.n)}`);
  const allowed = approval ? canEdit : canPublish;

  async function apply() {
    if (approval) {
      approval.onRequest(version.n);
      return;
    }
    setConfirming(false);
    setBusy(true);
    setResult(null);
    const outcome = await onApply(version.n);
    setBusy(false);
    if (outcome !== "ok") setResult(outcome);
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <VersionHeading isInUse={isInUse} subject={subject} version={version} />
        <div className="flex shrink-0 items-center gap-2">
          {approval && approval.pending !== null && !isInUse ? (
            <span className="text-sm text-muted-foreground tabular-nums">
              v{approval.pending} is waiting for approval
            </span>
          ) : null}
          {version.n === editing ? null : (
            <Permission allowed={canEdit}>
              <Button
                disabled={!canEdit || busy}
                onClick={() => onEditFrom(version.n)}
                variant="outline"
              >
                <EditFromIcon />
                Edit from here
              </Button>
            </Permission>
          )}
          {action ? (
            <Permission
              allowed={allowed}
              reason={
                canEdit
                  ? "Only people who can publish the global prompt can do this"
                  : undefined
              }
            >
              <Button
                disabled={!allowed || busy}
                onClick={
                  !approval && result === null
                    ? () => setConfirming(true)
                    : () => void apply()
                }
              >
                {busy ? <Spinner /> : null}
                {result === "failed" ? "Try again" : action}
              </Button>
            </Permission>
          ) : null}
        </div>
      </div>

      {result === "failed" ? (
        <Alert className="bg-destructive-tint" variant="destructive">
          <AlertTitle>
            Couldn’t {verb.toLowerCase()} v{version.n}
          </AlertTitle>
          <AlertDescription>
            v{inUse} is still in use. Nothing else changed.
          </AlertDescription>
        </Alert>
      ) : null}

      <Comparison
        against={against}
        onAgainst={onAgainst}
        subject={subject}
        version={version}
      />

      <AlertDialog onOpenChange={setConfirming} open={confirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verb} v{version.n}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Every scenario gets v{version.n} of the global prompt from the
              next call. Calls already running finish on v{inUse}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void apply()}>
              {verb} v{version.n}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function actionFor(
  isInUse: boolean,
  approval: Approval | undefined,
  apply: string,
) {
  if (isInUse || (approval && approval.pending !== null)) return null;
  return approval ? "Request approval" : apply;
}

function VersionHeading({
  subject,
  version,
  isInUse,
}: {
  subject: Subject;
  version: Version;
  isInUse: boolean;
}) {
  const record = subject.log.filter(
    (entry) => entry.n === version.n && entry.how !== "saved",
  );
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h2 className="flex items-center gap-2 text-lg font-semibold tabular-nums">
        v{version.n}
        {isInUse ? (
          <Badge
            className="bg-success-tint text-success-tint-foreground"
            variant="secondary"
          >
            In use
          </Badge>
        ) : null}
      </h2>
      {version.note ? <p className="text-sm">{version.note}</p> : null}
      <p className="text-sm text-muted-foreground tabular-nums">
        {version.author} · {version.at}
      </p>
      {record.map((entry) => (
        <p
          className="text-sm text-muted-foreground tabular-nums"
          key={`${entry.how}-${entry.at}`}
        >
          {entry.how === "published" ? "Published" : "Applied"} by{" "}
          {entry.by === "You" ? "you" : entry.by}, {entry.at}
        </p>
      ))}
    </div>
  );
}

const VIEWS = [
  { id: "changes", label: "Changes" },
  { id: "version", label: "Full version" },
] as const;

function Comparison({
  subject,
  version,
  against,
  onAgainst,
}: {
  subject: Subject;
  version: Version;
  against: Version | null;
  onAgainst: (n: number) => void;
}) {
  const [view, setView] =
    React.useState<(typeof VIEWS)[number]["id"]>("changes");
  const inUse = subject.inUse;
  if (!against) {
    return <FullVersion subject={subject} version={version} />;
  }
  return (
    <SecondaryTabs
      aside={
        view === "changes" ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Compared with</span>
            <Select
              onValueChange={(value) => onAgainst(Number(value))}
              value={String(against.n)}
            >
              <SelectTrigger aria-label="Changes from" size="sm">
                <SelectValue>v{against.n}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                {subject.versions
                  .filter((item) => item.n !== version.n)
                  .map((item) => (
                    <SelectItem key={item.n} value={String(item.n)}>
                      <span className="tabular-nums">v{item.n}</span>
                      {item.n === inUse ? (
                        <span className="text-muted-foreground">In use</span>
                      ) : null}
                      {item.n === version.editedFrom ? (
                        <span className="text-muted-foreground">
                          Edited from
                        </span>
                      ) : null}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : undefined
      }
      items={[...VIEWS]}
      onValueChange={(value) => {
        const picked = VIEWS.find((entry) => entry.id === value);
        if (picked) setView(picked.id);
      }}
      value={view}
    >
      {view === "changes" ? (
        <div className="flex flex-col gap-3">
          {subject.fields.map((field) => {
            const before = against.body[field.id];
            const after = version.body[field.id];
            const same = before === after;
            return (
              <div className="overflow-hidden rounded-lg border" key={field.id}>
                <FieldBand label={field.label} open={!same}>
                  {same ? (
                    <span className="font-normal text-muted-foreground">
                      Unchanged
                    </span>
                  ) : (
                    <DiffStat {...diffStat(before, after)} />
                  )}
                </FieldBand>
                {same ? null : (
                  <FoldedDiff
                    after={after}
                    bare
                    before={before}
                    key={against.n}
                    layout="split"
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <FullVersion subject={subject} version={version} />
      )}
    </SecondaryTabs>
  );
}

function FieldBand({
  label,
  open,
  children,
}: {
  label: string;
  open: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 bg-muted/60 px-3 py-2 text-xs font-medium",
        open && "border-b",
      )}
    >
      <span>{label}</span>
      {children}
    </div>
  );
}

function FullVersion({
  subject,
  version,
}: {
  subject: Subject;
  version: Version;
}) {
  return (
    <div className="flex flex-col gap-3">
      {subject.fields.map((field) => (
        <div className="overflow-hidden rounded-lg border" key={field.id}>
          <FieldBand label={field.label} open />
          <p className="px-3 py-2 text-xs whitespace-pre-wrap" dir="auto">
            {version.body[field.id]}
          </p>
        </div>
      ))}
    </div>
  );
}

function Permission({
  allowed,
  reason = "You can view versions but not change them",
  children,
}: {
  allowed: boolean;
  reason?: string;
  children: React.ReactNode;
}) {
  if (allowed) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

function ListSkeleton() {
  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-80 shrink-0 flex-col gap-2 border-e p-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton
            className="h-16 w-full motion-reduce:animate-none"
            key={index}
          />
        ))}
      </aside>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-5 w-40 motion-reduce:animate-none" />
        <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
        <Skeleton className="h-40 w-full motion-reduce:animate-none" />
      </div>
    </div>
  );
}
