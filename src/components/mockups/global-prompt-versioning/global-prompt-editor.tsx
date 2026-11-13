"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  type ApplyResult,
  HistoryDrawer,
} from "@/components/mockups/global-prompt-versioning/history-drawer";
import {
  BackToNewestIcon,
  HistoryIcon,
} from "@/components/mockups/global-prompt-versioning/icons";
import { RequestDialog } from "@/components/mockups/global-prompt-versioning/request-dialog";
import { ReviewDrawer } from "@/components/mockups/global-prompt-versioning/review-drawer";
import { SaveReview } from "@/components/mockups/global-prompt-versioning/save-review";
import { SaveBar } from "@/components/shared/save-bar";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Subject, Version } from "@/lib/mockups/config-versioning-data";
import {
  type CaseId,
  changesBetween,
  GLOBAL_PROMPT,
  mainRequest,
  type Mode,
  type Person,
  REJECTION,
  RIVAL,
  SECTIONS,
} from "@/lib/mockups/global-prompt-versioning-data";
import {
  type ApprovalRequest,
  canDecide,
  forViewer,
  who,
} from "@/lib/mockups/publish-approval-data";

function real(name: string) {
  return name === "You" ? "Ahmad Khalil" : name;
}

function named(subject: Subject): Subject {
  return {
    ...subject,
    versions: subject.versions.map((version) => ({
      ...version,
      author: real(version.author),
      mine: false,
    })),
    log: subject.log.map((entry) => ({ ...entry, by: real(entry.by) })),
  };
}

function initialRequests(caseId: CaseId): ApprovalRequest[] {
  if (caseId === "pending" || caseId === "approve-fails")
    return [mainRequest("pending")];
  if (caseId === "rejected") return [mainRequest("rejected", REJECTION)];
  return [];
}

export function GlobalPromptEditor({
  mode,
  person,
  caseId,
  openAt,
}: {
  mode: Mode;
  person: Person;
  caseId: CaseId;
  openAt?: number;
}) {
  const [stored, setStored] = React.useState(() => named(GLOBAL_PROMPT));
  const [requests, setRequests] = React.useState(() =>
    mode === "approval" ? initialRequests(caseId) : [],
  );
  const subject = forViewer(stored, person);
  const newest = subject.versions[0];

  const [base, setBase] = React.useState(newest.n);
  const [draft, setDraft] = React.useState(newest.body);
  const [reviewing, setReviewing] = React.useState(false);
  const [reviewKey, setReviewKey] = React.useState(0);
  const [saveFailed, setSaveFailed] = React.useState(false);
  const [rival, setRival] = React.useState<Version | null>(null);
  const [history, setHistory] = React.useState<{
    n: number;
    against: number | null;
  } | null>(openAt ? { n: openAt, against: null } : null);
  const [requestFor, setRequestFor] = React.useState<number | null>(null);
  const [openRequest, setOpenRequest] = React.useState<string | null>(null);

  const approval = mode === "approval";
  const { canEdit, canPublish } = person;
  const inUse = subject.inUse;
  const ahead = subject.versions.filter((version) => version.n > inUse);
  const baseVersion =
    subject.versions.find((version) => version.n === base) ?? newest;
  const editingFrom = base !== newest.n && !rival;
  const changes = SECTIONS.filter(
    (section) => draft[section.id] !== newest.body[section.id],
  ).length;
  const pending = requests.find((request) => request.status === "pending");
  const rejected =
    !pending && requests[0]?.status === "rejected" ? requests[0] : null;
  const [applied] = subject.log;

  function openReview() {
    if (caseId === "conflict" && !rival) {
      const theirs: Version = {
        ...RIVAL,
        n: newest.n + 1,
        editedFrom: newest.n,
        body: {
          ...newest.body,
          tools: newest.body.tools.replace(
            "If a tool fails, apologise once and offer to call back.",
            "If a tool fails, offer to call back.",
          ),
        },
      };
      setRival(theirs);
      setStored((current) => ({
        ...current,
        versions: [theirs, ...current.versions],
      }));
    }
    setSaveFailed(false);
    setReviewKey((current) => current + 1);
    setReviewing(true);
  }

  function save(note: string) {
    if (caseId === "save-fails" && !saveFailed) {
      setSaveFailed(true);
      return;
    }
    const n = stored.versions[0].n + 1;
    setStored((current) => ({
      ...current,
      versions: [
        {
          n,
          author: person.name,
          mine: true,
          at: "Just now",
          editedFrom: base,
          note: note === "" ? null : note,
          body: draft,
        },
        ...current.versions,
      ],
    }));
    setBase(n);
    setRival(null);
    setSaveFailed(false);
    setReviewing(false);
    toast.success(`Saved as v${String(n)}`, {
      description: pending
        ? `It isn’t in the request for v${String(pending.version)}. Every scenario keeps using v${String(inUse)}.`
        : `Every scenario keeps using v${String(inUse)} until it’s published.`,
    });
  }

  function discard() {
    const before = { draft, base };
    setDraft(newest.body);
    setBase(newest.n);
    toast("Changes discarded", {
      action: {
        label: "Undo",
        onClick: () => {
          setDraft(before.draft);
          setBase(before.base);
        },
      },
    });
  }

  function editFrom(n: number) {
    const version = subject.versions.find((item) => item.n === n);
    if (!version) return;
    setBase(n);
    setDraft(version.body);
    setHistory(null);
  }

  function putInUse(n: number, how: "published" | "applied") {
    setStored((current) => ({
      ...current,
      inUse: n,
      log: [{ n, by: person.name, at: "just now", how }, ...current.log],
    }));
  }

  async function apply(n: number): Promise<ApplyResult> {
    await new Promise((resolve) => {
      setTimeout(resolve, 900);
    });
    if (caseId === "publish-fails") return "failed";
    const version = subject.versions.find((item) => item.n === n);
    if (!version) return "failed";
    putInUse(n, n > inUse ? "published" : "applied");
    setBase(n);
    setDraft(version.body);
    setHistory(null);
    toast.success(`v${String(n)} is in use`, {
      description: "Every scenario gets it from the next call.",
    });
    return "ok";
  }

  async function send(input: { summary: string; note: string }) {
    if (requestFor === null) return false;
    await new Promise((resolve) => {
      setTimeout(resolve, 900);
    });
    const made: ApprovalRequest = {
      ...mainRequest("pending"),
      id: `gp-${String(requestFor)}-${String(requests.length)}`,
      version: requestFor,
      live: inUse,
      by: person.name,
      raised: "Just now",
      waiting: "under a minute",
      summary: input.summary,
      note: input.note,
      changes: changesBetween(stored, inUse, requestFor),
    };
    setRequests((current) => [
      made,
      ...current.map((item) =>
        item.status === "pending"
          ? {
              ...item,
              status: "withdrawn" as const,
              decision: { by: person.name, at: "Just now" },
            }
          : item,
      ),
    ]);
    toast.success("Request sent", {
      description: `Every scenario gets v${String(requestFor)} once it’s approved.`,
    });
    setRequestFor(null);
    return true;
  }

  function decide(id: string, change: Partial<ApprovalRequest>) {
    setRequests((current) =>
      current.map((item) => (item.id === id ? { ...item, ...change } : item)),
    );
  }

  async function approve(id: string) {
    await new Promise((resolve) => {
      setTimeout(resolve, 900);
    });
    const target = requests.find((item) => item.id === id);
    if (!target) return false;
    decide(id, {
      status: "approved",
      decision: { by: person.name, at: "Just now" },
    });
    putInUse(target.version, "published");
    setOpenRequest(null);
    toast.success(`v${String(target.version)} is in use`, {
      description: "Every scenario gets it from the next call.",
    });
    return true;
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 p-8 pb-4">
      <header className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold">Global prompts</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            <span className="whitespace-nowrap">
              v{inUse} in use, {applied.how} by {applied.by},
            </span>{" "}
            <span className="whitespace-nowrap">{applied.at}</span>
          </p>
        </div>
        <Button
          onClick={() => setHistory({ n: newest.n, against: null })}
          variant="outline"
        >
          <HistoryIcon />
          History
        </Button>
      </header>

      {approval ? (
        <ApprovalStatus
          ahead={ahead}
          canRequest={canEdit}
          inUse={inUse}
          newest={newest.n}
          onOpenRequest={setOpenRequest}
          onRequest={setRequestFor}
          pending={pending ?? null}
          rejected={rejected}
          viewer={person}
        />
      ) : (
        <DirectStatus
          ahead={ahead}
          canEdit={canEdit}
          canPublish={canPublish}
          inUse={inUse}
          onReview={() => setHistory({ n: newest.n, against: inUse })}
        />
      )}

      {editingFrom ? (
        <Alert>
          <AlertTitle className="tabular-nums">
            Editing v{baseVersion.n}, an older version
          </AlertTitle>
          <AlertDescription>
            {baseVersion.author}, {baseVersion.at}. Saving makes it the latest;
            nothing is lost.
          </AlertDescription>
          <AlertAction>
            <Button onClick={discard} size="sm" variant="outline">
              <BackToNewestIcon />
              Back to latest
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4">
        {SECTIONS.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="font-normal text-muted-foreground tabular-nums">
                  #{section.order}
                </span>
                <Label htmlFor={section.id}>{section.label}</Label>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant="secondary">{section.scope}</Badge>
                <Badge variant="secondary">
                  {section.language ?? "Any language"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                dir="auto"
                disabled={!canEdit}
                id={section.id}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [section.id]: event.target.value,
                  }))
                }
                rows={4}
                value={draft[section.id]}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <SaveBar
        changes={changes}
        onDiscard={discard}
        onSave={openReview}
        saveLabel="Review and save"
      />

      <SaveReview
        base={base}
        draft={draft}
        failed={saveFailed}
        key={reviewKey}
        liveLine={liveLineFor(newest.n + 1, inUse, approval, pending)}
        onOpenChange={setReviewing}
        onSave={save}
        open={reviewing}
        rival={rival}
        subject={subject}
      />

      <HistoryDrawer
        approval={
          approval
            ? {
                by: "an approver",
                pending: pending?.version ?? null,
                onRequest: (n) => {
                  setHistory(null);
                  setRequestFor(n);
                },
              }
            : undefined
        }
        canEdit={canEdit}
        canPublish={canPublish}
        caseId={caseId}
        editing={base}
        initial={history ?? { n: newest.n, against: null }}
        onApply={apply}
        onEditFrom={editFrom}
        onOpenChange={(open) => {
          if (!open) setHistory(null);
        }}
        open={history !== null}
        subject={subject}
      />

      {approval ? (
        <>
          <RequestDialog
            caseId={caseId}
            live={inUse}
            onOpenChange={(open) => {
              if (!open) setRequestFor(null);
            }}
            onSend={send}
            open={requestFor !== null}
            replacing={pending?.version ?? null}
            version={requestFor ?? newest.n}
          />
          <ReviewDrawer
            failApprove={caseId === "approve-fails"}
            list={openRequest ? [openRequest] : []}
            onApprove={approve}
            onClose={() => setOpenRequest(null)}
            onReject={(id, reason) => {
              const target = requests.find((item) => item.id === id);
              decide(id, {
                status: "rejected",
                decision: { by: person.name, at: "Just now", reason },
              });
              setOpenRequest(null);
              toast(`Rejected v${String(target?.version)}`, {
                description: `${target ? who(target.by, person) : "The requester"} sees your reason. Every scenario keeps using v${String(inUse)}.`,
              });
            }}
            onStep={setOpenRequest}
            onWithdraw={(id) => {
              const target = requests.find((item) => item.id === id);
              decide(id, {
                status: "withdrawn",
                decision: { by: person.name, at: "Just now" },
              });
              setOpenRequest(null);
              toast(`Request for v${String(target?.version)} withdrawn`, {
                action: {
                  label: "Undo",
                  onClick: () =>
                    decide(id, { status: "pending", decision: null }),
                },
              });
            }}
            request={requests.find((item) => item.id === openRequest) ?? null}
            viewer={person}
          />
        </>
      ) : null}
    </div>
  );
}

function liveLineFor(
  next: number,
  inUse: number,
  approval: boolean,
  pending: ApprovalRequest | undefined,
) {
  const saving = `Saving makes v${String(next)}.`;
  if (pending)
    return `${saving} It isn’t added to the request for v${String(pending.version)}, and every scenario keeps using v${String(inUse)}.`;
  if (approval)
    return `${saving} Every scenario keeps using v${String(inUse)} until an approver approves a newer version.`;
  return `${saving} Every scenario keeps using v${String(inUse)} until it’s published.`;
}

function DirectStatus({
  ahead,
  inUse,
  canEdit,
  canPublish,
  onReview,
}: {
  ahead: Version[];
  inUse: number;
  canEdit: boolean;
  canPublish: boolean;
  onReview: () => void;
}) {
  if (ahead.length === 0) return null;
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle className="tabular-nums">
          {ahead.length === 1
            ? `v${String(ahead[0].n)} isn’t in use yet`
            : `v${String(ahead.at(-1)?.n)} to v${String(ahead[0].n)} aren’t in use yet`}
        </ItemTitle>
        <ItemDescription className="tabular-nums">
          Every scenario uses v{inUse} until a newer version is published.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Gate
          allowed={canPublish}
          reason={
            canEdit
              ? "Only people who can publish the global prompt can publish it"
              : "You can view the global prompt but not change it"
          }
        >
          <Button disabled={!canPublish} onClick={onReview}>
            Review and publish
          </Button>
        </Gate>
      </ItemActions>
    </Item>
  );
}

function ApprovalStatus({
  ahead,
  inUse,
  newest,
  pending,
  rejected,
  viewer,
  canRequest,
  onRequest,
  onOpenRequest,
}: {
  ahead: Version[];
  inUse: number;
  newest: number;
  pending: ApprovalRequest | null;
  rejected: ApprovalRequest | null;
  viewer: Person;
  canRequest: boolean;
  onRequest: (n: number) => void;
  onOpenRequest: (id: string) => void;
}) {
  const request = (label: string) => (
    <Gate
      allowed={canRequest}
      reason="You can view the global prompt but not change it"
    >
      <Button disabled={!canRequest} onClick={() => onRequest(newest)}>
        {label}
      </Button>
    </Gate>
  );

  if (pending) {
    const decides = canDecide(pending, viewer);
    const newer = newest > pending.version;
    return (
      <Item variant="outline">
        <ItemContent>
          <ItemTitle className="tabular-nums">
            v{pending.version} is waiting for {decides ? "your " : ""}approval
          </ItemTitle>
          <ItemDescription className="tabular-nums">
            {newer
              ? `v${String(newest)} was saved after the request and isn’t in it. Every scenario uses v${String(inUse)}.`
              : `Requested by ${who(pending.by, viewer, true)}, ${pending.raised} · waiting ${pending.waiting}. Every scenario uses v${String(inUse)}.`}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            onClick={() => onOpenRequest(pending.id)}
            variant={decides || newer ? "outline" : "default"}
          >
            {decides ? "Review" : "View request"}
          </Button>
          {newer && !decides
            ? request(`Request v${String(newest)} instead`)
            : null}
        </ItemActions>
      </Item>
    );
  }

  if (rejected?.decision) {
    return (
      <Item variant="outline">
        <ItemContent>
          <ItemTitle className="tabular-nums">
            {who(rejected.decision.by, viewer)} rejected v{rejected.version}
          </ItemTitle>
          <ItemDescription className="tabular-nums" dir="auto">
            “{rejected.decision.reason}” Every scenario uses v{inUse}.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button onClick={() => onOpenRequest(rejected.id)} variant="outline">
            View request
          </Button>
          {ahead.length > 0 && !canDecide(rejected, viewer)
            ? request("Request approval")
            : null}
        </ItemActions>
      </Item>
    );
  }

  if (ahead.length === 0) return null;

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle className="tabular-nums">
          {ahead.length === 1
            ? `v${String(ahead[0].n)} isn’t in use yet`
            : `v${String(ahead.at(-1)?.n)} to v${String(ahead[0].n)} aren’t in use yet`}
        </ItemTitle>
        <ItemDescription className="tabular-nums">
          Every scenario uses v{inUse} until an approver approves a newer
          version.
        </ItemDescription>
      </ItemContent>
      <ItemActions>{request("Request approval")}</ItemActions>
    </Item>
  );
}

function Gate({
  allowed,
  reason,
  children,
}: {
  allowed: boolean;
  reason: string;
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
