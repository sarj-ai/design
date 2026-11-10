"use client";

import * as React from "react";

import {
  BatchList,
  BatchPage,
} from "@/components/mockups/batch-cancel/batch-views";
import { ReviewerSwitch } from "@/components/shared/reviewer-switch";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";
import { DETAIL, LIST, type Batch } from "@/lib/mockups/batch-cancel-data";

const VIEWS = [
  { id: "page", label: "Batch page" },
  { id: "list", label: "Batch list" },
] as const;

const ACCESS = [
  { id: "write", label: "Can edit" },
  { id: "read", label: "Read only" },
] as const;

type View = (typeof VIEWS)[number]["id"];
type Access = (typeof ACCESS)[number]["id"];

export default function BatchCancelPage() {
  const [view, setView] = React.useState<View>("page");
  const [access, setAccess] = React.useState<Access>("write");
  const [list, setList] = React.useState<readonly Batch[]>(LIST);
  const detail = list.find((batch) => batch.id === DETAIL.id) ?? DETAIL;
  const update = (next: Batch) =>
    setList((all) => all.map((each) => (each.id === next.id ? next : each)));
  const canWrite = access === "write";

  return (
    <MockupShell
      actions={
        <>
          <ReviewerSwitch
            label="View"
            onChange={setView}
            options={VIEWS}
            value={view}
          />
          <ReviewerSwitch
            label="Access"
            onChange={setAccess}
            options={ACCESS}
            value={access}
          />
        </>
      }
      title="Cancel a batch"
    >
      <AppShell
        active="Batch Calls"
        breadcrumb={
          view === "page" ? ["Batch calls", detail.name] : "Batch calls"
        }
      >
        {view === "page" ? (
          <BatchPage batch={detail} canWrite={canWrite} onChange={update} />
        ) : (
          <BatchList batches={list} canWrite={canWrite} onChange={update} />
        )}
      </AppShell>
    </MockupShell>
  );
}
