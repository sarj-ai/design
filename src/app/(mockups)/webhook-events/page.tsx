"use client";

import * as React from "react";

import {
  WebhooksPage,
  type WebhookState,
} from "@/components/mockups/webhook-events/webhooks-page";
import { ReviewerSwitch } from "@/components/shared/reviewer-switch";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";

const STATES: readonly { id: WebhookState; label: string }[] = [
  { id: "configured", label: "Configured" },
  { id: "unset", label: "No URL yet" },
  { id: "read-only", label: "Read only" },
  { id: "loading", label: "Loading" },
  { id: "error", label: "Error" },
];

export default function WebhookEventsPage() {
  const [state, setState] = React.useState<WebhookState>("configured");

  return (
    <MockupShell
      actions={
        <ReviewerSwitch
          label="State"
          onChange={setState}
          options={STATES}
          value={state}
        />
      }
      title="Webhook events"
    >
      <AppShell active="Webhooks" breadcrumb="Webhooks">
        <WebhooksPage state={state} />
      </AppShell>
    </MockupShell>
  );
}
