"use client";

import * as React from "react";

import {
  BulkReruns,
  OrganizationScope,
} from "@/components/mockups/webhook-reruns/bulk-reruns";
import { CallWebhook } from "@/components/mockups/webhook-reruns/call-webhook";
import { RerunsNavIcon } from "@/components/mockups/webhook-reruns/icons";
import { ReviewerSwitch } from "@/components/shared/reviewer-switch";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";
import {
  SINGLE_CALLS,
  type SingleCallState,
} from "@/lib/mockups/webhook-reruns-data";

type View = "bulk" | SingleCallState;

const VIEWS: readonly { id: View; label: string }[] = [
  { id: "bulk", label: "Bulk" },
  { id: "failed", label: "Call · failed" },
  { id: "delivered", label: "Call · delivered" },
  { id: "old", label: "Call · failed, 47 days ago" },
];

const RERUNS_NAV = [
  { after: "Tasks", item: { icon: RerunsNavIcon, title: "Webhook reruns" } },
] as const;

export default function WebhookRerunsPage() {
  const [view, setView] = React.useState<View>("bulk");

  return (
    <MockupShell
      actions={
        <ReviewerSwitch
          label="View"
          onChange={setView}
          options={VIEWS}
          value={view}
        />
      }
      title="Rerun webhooks on past calls"
    >
      {view === "bulk" ? (
        <AppShell
          active="Webhook reruns"
          addedItems={RERUNS_NAV}
          scope={<OrganizationScope />}
        >
          <BulkReruns />
        </AppShell>
      ) : (
        <AppShell
          active="Conversations"
          addedItems={RERUNS_NAV}
          breadcrumb={["Conversations", SINGLE_CALLS[view].id.slice(0, 13)]}
        >
          <CallWebhook call={SINGLE_CALLS[view]} key={view} />
        </AppShell>
      )}
    </MockupShell>
  );
}
