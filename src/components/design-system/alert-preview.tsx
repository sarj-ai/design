"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { AdminViewSwitcher } from "@/components/design-system/admin-view-preview"
import {
  CompletedIcon,
  ErrorAlertIcon,
  HintIcon,
  WarningIcon,
} from "@/components/design-system/icons"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TabsContent } from "@/components/ui/tabs"

/**
 * Alerts, from every place the platform uses one.
 *
 * The platform has alerts in forty files and four intents, but the primitive
 * ships two variants, so the other two are hand-mixed on each screen:
 * `border-warning/30 bg-warning/10`, `border-primary/15 bg-primary/5`,
 * `bg-primary/10`, `border-primary/30 bg-primary/10` — four recipes for
 * "info" alone. Half have no icon. Several are not alerts at all: a field's
 * error, an empty list, a save bar, a connection toast, the admin banner.
 *
 * Decided here:
 *
 *  - The primitive as shadcn ships it, and nothing mixed on top: a card,
 *    a border, an icon, a title and a muted description. Neutral, success
 *    and warning are all the default variant and differ only by icon, as
 *    shadcn's own examples do; error is the destructive variant. No tints,
 *    no brand purple — every hand-mixed "info" becomes the default alert.
 *  - Always an icon, one per intent: it is the only thing that tells a
 *    warning from a note, so it is never left off.
 *  - The title says what happened and the description says what to do.
 *    One line is enough when there is nothing to do.
 *  - One short action sits in the corner (`AlertAction`). A longer one — a
 *    verb and its object — goes under the text, because the corner slot is
 *    72px and "Go to connections" does not fit it.
 *  - A raw error from a server goes under a human title, in mono, never as
 *    the title.
 *  - A list longer than three stops and says how many more.
 *  - Partly failed is a warning, not an error: the page still works, some of
 *    it may be stale.
 */

type Intent = "neutral" | "success" | "warning" | "error"

const INTENTS: Record<
  Intent,
  { Icon: React.ComponentType; variant: "default" | "destructive" }
> = {
  neutral: { Icon: HintIcon, variant: "default" },
  success: { Icon: CompletedIcon, variant: "default" },
  warning: { Icon: WarningIcon, variant: "default" },
  error: { Icon: ErrorAlertIcon, variant: "destructive" },
}

/** An alert in one of the four intents. */
function Notice({
  intent,
  children,
  className,
}: {
  intent: Intent
  children: React.ReactNode
  className?: string
}) {
  const { Icon, variant } = INTENTS[intent]
  return (
    <Alert className={className} variant={variant}>
      <Icon />
      {children}
    </Alert>
  )
}

/** One case: what it is, where the platform has it, and the thing itself. */
function Case({
  children,
  label,
  where,
}: {
  children: React.ReactNode
  label: string
  where: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{where}</span>
      </div>
      {children}
    </div>
  )
}

const GRID = "grid gap-x-10 gap-y-8 md:grid-cols-2"

/** The words a server sent back, kept apart from the sentence about them. */
function Raw({ children }: { children: React.ReactNode }) {
  return (
    <code className="mt-1.5 block rounded-sm bg-muted px-2 py-1 font-mono text-xs">
      {children}
    </code>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-xs">{children}</span>
}

function Intents() {
  return (
    <div className={GRID}>
      <Case label="Neutral" where="Reports dialog">
        <Notice intent="neutral">
          <AlertTitle>Reports run in the background</AlertTitle>
          <AlertDescription>
            You&apos;ll be told when the file is ready to download.
          </AlertDescription>
        </Notice>
      </Case>

      <Case label="Success" where="New connection · collision check">
        <Notice intent="success">
          <AlertTitle>No collisions found</AlertTitle>
          <AlertDescription>
            None of these addresses belong to another connection.
          </AlertDescription>
        </Notice>
      </Case>

      <Case label="Warning" where="API keys">
        <Notice intent="warning">
          <AlertTitle>5 of 5 API keys in use</AlertTitle>
          <AlertDescription>
            Revoke a key you no longer use to create another.
          </AlertDescription>
        </Notice>
      </Case>

      <Case label="Error" where="Provisioned numbers">
        <Notice intent="error">
          <AlertTitle>Could not load phone numbers</AlertTitle>
          <AlertDescription>
            Something went wrong on our side. Nothing was changed.
          </AlertDescription>
          <AlertAction>
            <Button size="xs" variant="outline">
              Retry
            </Button>
          </AlertAction>
        </Notice>
      </Case>
    </div>
  )
}

function Content() {
  return (
    <div className={GRID}>
      <Case label="Title only" where="Call detail">
        <Notice intent="warning">
          <AlertTitle>Call not completed</AlertTitle>
        </Notice>
      </Case>

      <Case label="Description only" where="Zoho webhook conditions">
        <Notice intent="neutral">
          <AlertDescription>
            Conditions only see the fields included in the webhook payload.
          </AlertDescription>
        </Notice>
      </Case>

      <Case label="With a link" where="Developer webhooks">
        <Notice intent="neutral">
          <AlertTitle>Set a webhook URL first</AlertTitle>
          <AlertDescription>
            <p>
              Add it on the{" "}
              <a href="#webhooks" onClick={(e) => e.preventDefault()}>
                Webhooks
              </a>{" "}
              page, then come back to send a test event.
            </p>
          </AlertDescription>
        </Notice>
      </Case>

      <Case label="A longer action" where="New connection · verification">
        <Notice intent="success">
          <AlertTitle>Connection is active</AlertTitle>
          <AlertDescription>Its numbers can take calls now.</AlertDescription>
          {/* Under the text, in the text column, and out of the
              description so it keeps the button's own colour. */}
          <div className="col-start-2 mt-2">
            <Button size="sm" variant="outline">
              Go to connections
            </Button>
          </div>
        </Notice>
      </Case>

      <Case label="With a list" where="New connection · collision check">
        <Notice intent="warning">
          <AlertTitle>These addresses are already in use</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            They belong to the Unifonic connection. Edit that one instead of
            adding another.
            <ul className="flex flex-col gap-0.5">
              <li>
                <Mono>185.12.40.8</Mono>
              </li>
              <li>
                <Mono>185.12.40.9</Mono>
              </li>
            </ul>
          </AlertDescription>
        </Notice>
      </Case>

      <Case label="A long list, cut short" where="Batch calls · file check">
        <Notice intent="error">
          <AlertTitle>Fix 12 rows before submitting</AlertTitle>
          <AlertDescription className="flex flex-col gap-1.5">
            <div>
              Duplicate numbers: <Mono>+966 55 123 4567</Mono>,{" "}
              <Mono>+966 50 987 6543</Mono>, <Mono>+966 53 222 1100</Mono> and 6
              more
            </div>
            <div>Missing phone number: rows 2, 31 and 47</div>
          </AlertDescription>
        </Notice>
      </Case>

      <Case label="A server error" where="SIP connection · outbound pings">
        <Notice intent="error">
          <AlertTitle>Could not reach the SIP router</AlertTitle>
          <AlertDescription>
            Check the connection is up, then try again.
            <Raw>connect ETIMEDOUT 10.0.4.12:5060</Raw>
          </AlertDescription>
          <AlertAction>
            <Button size="xs" variant="outline">
              Retry
            </Button>
          </AlertAction>
        </Notice>
      </Case>

      <Case label="Blocking a save" where="Global prompts">
        <Notice intent="error">
          <AlertTitle>Known variables can&apos;t be used inline</AlertTitle>
          <AlertDescription>
            <p>
              Remove <Mono>{"{{customer_name}}"}</Mono> and{" "}
              <Mono>{"{{account_number}}"}</Mono> before saving.
            </p>
          </AlertDescription>
        </Notice>
      </Case>

      <Case label="Partly failed" where="Kamailio state">
        <Notice intent="warning">
          <AlertTitle>Some reads failed</AlertTitle>
          <AlertDescription>
            The dispatcher did not answer, so its rows below may be out of date.
          </AlertDescription>
        </Notice>
      </Case>

      <Case label="A setting that can't apply" where="Turn detection">
        <Notice intent="error">
          <AlertTitle>The Sarj EOU model only runs on Arabic</AlertTitle>
          <AlertDescription>
            It won&apos;t run on English or Urdu.
          </AlertDescription>
        </Notice>
      </Case>
    </div>
  )
}

/**
 * The platform's alerts that are really something else, each shown as what
 * it should be.
 */
function NotAnAlert() {
  const [phone, setPhone] = React.useState("0551234567")
  const invalid = !phone.startsWith("+")

  return (
    <div className={GRID}>
      <Case label="Under a field" where="Playground · phone number">
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor="alert-phone">Phone number</FieldLabel>
          <Input
            aria-invalid={invalid}
            id="alert-phone"
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
          />
          {invalid ? (
            <FieldError>Start with the country code, like +966.</FieldError>
          ) : null}
        </Field>
      </Case>

      <Case label="Nothing here yet" where="Webhooks">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No webhook yet</EmptyTitle>
            <EmptyDescription>
              Add one to get call events as they happen.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Add webhook</Button>
          </EmptyContent>
        </Empty>
      </Case>

      <Case label="Connection lost" where="Every page">
        <div>
          <Button
            onClick={() =>
              toast.error("Connection lost", {
                description: "Trying to reconnect.",
                action: { label: "Retry", onClick: () => undefined },
              })
            }
            size="sm"
            variant="outline"
          >
            Show the toast
          </Button>
        </div>
      </Case>

      <Case label="Unsaved changes" where="Global settings · global prompts">
        <div>
          <Button asChild size="sm" variant="outline">
            <Link href="/design-system/product-components/unsaved-changes">
              Open Unsaved changes
            </Link>
          </Button>
        </div>
      </Case>

      <Case label="Reading as another organisation" where="Scenarios">
        <div>
          <AdminViewSwitcher />
        </div>
      </Case>
    </div>
  )
}

const VIEWS = [
  { id: "intents", label: "Intents" },
  { id: "content", label: "Content" },
  { id: "not-an-alert", label: "Not an alert" },
]

export function AlertPreview() {
  const [view, setView] = React.useState("intents")

  return (
    <SecondaryTabs items={VIEWS} onValueChange={setView} value={view}>
      <TabsContent value="intents">
        <Intents />
      </TabsContent>
      <TabsContent value="content">
        <Content />
      </TabsContent>
      <TabsContent value="not-an-alert">
        <NotAnAlert />
      </TabsContent>
    </SecondaryTabs>
  )
}
