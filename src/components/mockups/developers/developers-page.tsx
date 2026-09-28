"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/shell/app-shell"
import {
  ApiKeyIcon,
  ApiReferenceIcon,
  CopiedIcon,
  CopyCodeIcon,
  CreateIcon,
  DeleteKeyIcon,
  ExternalIcon,
  HideIcon,
  McpIcon,
  RevealIcon,
  WebhookLinkIcon,
} from "@/components/mockups/developers/icons"
import {
  API_KEYS,
  DOCS_URL,
  GETTING_STARTED_URL,
  MCP_URL,
  QUICKSTART,
  QUICKSTART_LABELS,
  VARIABLES,
  WEBHOOK_URL,
  type ApiKey,
  type QuickstartLanguage,
} from "@/lib/mockups/developers-data"

/**
 * Developers: everything someone building on Sarj needs, as tabs of one page
 * instead of four entries scattered through Configuration.
 *
 * The overview leads with the one thing every integration starts with —
 * placing a call through the public API — as code that runs, then links to
 * the rest. The other tabs carry the fields their product pages already have.
 */

type Tab = "overview" | "api-keys" | "webhooks" | "variables"

/** Nav entries that move into this page's tabs. */
const DEVELOPER_ONLY = ["API Keys", "Variables", "Webhooks", "Developer Docs"]

export function DevelopersPage({
  framed = false,
}: {
  /** Shown inside a frame on the design-system page, with no mockup shell
   *  header above it for the sidebar to clear. */
  framed?: boolean
}) {
  const [tab, setTab] = React.useState<Tab>("overview")

  return (
    <AppShell
      /* Nothing in the sidebar is this page any more: it opens from the
         Developers button in the top bar, and the four entries it gathers
         leave the nav — only developers need them, and they are its tabs. */
      active=""
      breadcrumb="Developers"
      developers="open"
      hiddenItems={DEVELOPER_ONLY}
      underShell={!framed}
    >
      <div className="flex flex-col gap-6 p-3 lg:p-4">
        <PageHeader
          title="Developers"
          aside={
            <Button asChild variant="outline">
              <a href={DOCS_URL} rel="noreferrer" target="_blank">
                API reference
                <ExternalIcon />
              </a>
            </Button>
          }
        />

        <Tabs
          value={tab}
          onValueChange={(next) => setTab(next as Tab)}
          className="gap-6"
        >
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api-keys">API keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Overview onOpenTab={setTab} />
          </TabsContent>
          <TabsContent value="api-keys">
            <ApiKeys />
          </TabsContent>
          <TabsContent value="webhooks">
            <Webhook />
          </TabsContent>
          <TabsContent value="variables">
            <Variables />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

/* ---------------------------------------------------------------- Overview */

function Overview({ onOpenTab }: { onOpenTab: (tab: Tab) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardContent className="grid items-center gap-6 md:grid-cols-3">
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-lg font-semibold">Developer quickstart</h2>
            <p className="text-sm text-muted-foreground">
              Place your first call with the Sarj API: one request with an API
              key, a phone number and a scenario.
            </p>
            <Button asChild className="mt-2">
              <a href={GETTING_STARTED_URL} rel="noreferrer" target="_blank">
                Get started
              </a>
            </Button>
          </div>
          <div className="md:col-span-2">
            <CodeBlock />
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickLink
            icon={<ApiKeyIcon />}
            title="Create an API key"
            detail="Every request is authenticated with one"
            onClick={() => onOpenTab("api-keys")}
          />
          <QuickLink
            icon={<ApiReferenceIcon />}
            title="API reference"
            detail="Every endpoint, request and error"
            href={DOCS_URL}
          />
          <QuickLink
            icon={<WebhookLinkIcon />}
            title="Set up a webhook"
            detail="Get each call's details when it ends"
            onClick={() => onOpenTab("webhooks")}
          />
          <QuickLink
            icon={<McpIcon />}
            title="Connect an AI agent"
            detail="The MCP server, for Claude Code or Cursor"
            href={MCP_URL}
          />
        </div>
      </section>
    </div>
  )
}

function QuickLink({
  icon,
  title,
  detail,
  href,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  detail: string
  href?: string
  onClick?: () => void
}) {
  const body = (
    <>
      <ItemMedia variant="icon">{icon}</ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{detail}</ItemDescription>
      </ItemContent>
      {href ? <ExternalIcon className="size-4 text-muted-foreground" /> : null}
    </>
  )

  const className =
    "text-start transition-colors duration-150 ease-out-cubic hover:bg-muted motion-reduce:transition-none"

  if (href) {
    return (
      <Item asChild variant="outline" className={className}>
        <a href={href} rel="noreferrer" target="_blank">
          {body}
        </a>
      </Item>
    )
  }

  return (
    <Item asChild variant="outline" className={className}>
      <button type="button" onClick={onClick}>
        {body}
      </button>
    </Item>
  )
}

/**
 * The request, with line numbers, a copy button, and the language switch in
 * the corner. Monochrome: syntax colour would need colours the token set
 * does not have, and the code reads fine without them.
 */
function CodeBlock() {
  const [language, setLanguage] = React.useState<QuickstartLanguage>("curl")
  const [copied, setCopied] = React.useState(false)
  const code = QUICKSTART[language]

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Could not copy — select the code instead")
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg border bg-muted/40">
      <pre className="overflow-x-auto py-4 pe-12 font-mono text-xs leading-relaxed">
        {code.split("\n").map((line, index) => (
          <div key={index} className="flex">
            <span className="w-10 shrink-0 pe-4 text-end text-muted-foreground select-none">
              {index + 1}
            </span>
            <span className="whitespace-pre">{line || " "}</span>
          </div>
        ))}
      </pre>

      <Button
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute end-2 top-2"
        size="icon-sm"
        variant="ghost"
        onClick={copy}
      >
        {copied ? <CopiedIcon /> : <CopyCodeIcon />}
      </Button>

      <div className="absolute end-2 bottom-2">
        <Select
          value={language}
          onValueChange={(next) => setLanguage(next as QuickstartLanguage)}
        >
          <SelectTrigger
            aria-label="Language"
            className="bg-background"
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="end">
            {(Object.keys(QUICKSTART_LABELS) as QuickstartLanguage[]).map(
              (key) => (
                <SelectItem key={key} value={key}>
                  {QUICKSTART_LABELS[key]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- API keys */

function ApiKeys() {
  const [keys, setKeys] = React.useState(API_KEYS)
  const [created, setCreated] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState<ApiKey | null>(null)

  function create() {
    const secret = `sk_live_${Math.random().toString(36).slice(2, 14)}`
    setKeys((current) => [
      { id: secret, prefix: secret.slice(0, 12), created: "Just now" },
      ...current,
    ])
    setCreated(secret)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          A key is shown once, when it is created.
        </p>
        <Button onClick={create}>
          <CreateIcon />
          Create API key
        </Button>
      </div>

      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Key</DataTableHead>
            <DataTableHead>Created</DataTableHead>
            <DataTableHead className="text-end">
              <span className="sr-only">Actions</span>
            </DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-mono">{key.prefix}…</TableCell>
              <TableCell className="text-muted-foreground">
                {key.created}
              </TableCell>
              <TableCell className="py-1.5 text-end">
                <Button
                  aria-label={`Delete ${key.prefix}`}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setDeleting(key)}
                >
                  <DeleteKeyIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      <Dialog
        open={created !== null}
        onOpenChange={(open) => (open ? null : setCreated(null))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your new API key</DialogTitle>
            <DialogDescription>
              Copy it now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <InputGroup>
            <InputGroupInput
              aria-label="API key"
              className="font-mono"
              readOnly
              value={created ?? ""}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Copy key"
                size="icon-xs"
                onClick={() =>
                  navigator.clipboard
                    .writeText(created ?? "")
                    .then(() => toast.success("Key copied"))
                    .catch(() => toast.error("Could not copy the key"))
                }
              >
                <CopyCodeIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <DialogFooter>
            <Button onClick={() => setCreated(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => (open ? null : setDeleting(null))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.prefix}…?</AlertDialogTitle>
            <AlertDialogDescription>
              Anything still using this key stops working straight away.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setKeys((current) =>
                  current.filter((key) => key.id !== deleting?.id),
                )
                setDeleting(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ---------------------------------------------------------------- Webhooks */

function Webhook() {
  const [url, setUrl] = React.useState(WEBHOOK_URL)
  const [saved, setSaved] = React.useState(WEBHOOK_URL)

  return (
    <Card className="max-w-2xl">
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="webhook-url">Webhook URL</FieldLabel>
          <FieldDescription>
            Receives a POST with the call&apos;s details when each call ends.
          </FieldDescription>
          <Input
            id="webhook-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("Test event sent")}
          >
            Send test
          </Button>
          <Button
            disabled={url === saved}
            onClick={() => {
              setSaved(url)
              toast.success("Webhook saved")
            }}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* --------------------------------------------------------------- Variables */

function Variables() {
  const [shown, setShown] = React.useState<Set<string>>(new Set())

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Available to every scenario and tool as{" "}
          <span className="font-mono">{"{{key}}"}</span>.
        </p>
        <Button>
          <CreateIcon />
          Add variable
        </Button>
      </div>

      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Key</DataTableHead>
            <DataTableHead>Value</DataTableHead>
            <DataTableHead>Description</DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {VARIABLES.map((variable) => {
            const visible = !variable.secret || shown.has(variable.key)
            return (
              <TableRow key={variable.key}>
                <TableCell className="font-mono">{variable.key}</TableCell>
                <TableCell className="py-1.5">
                  <span className="flex items-center gap-1">
                    <span className="font-mono text-muted-foreground">
                      {visible ? variable.value : "••••••••••"}
                    </span>
                    {variable.secret ? (
                      <Button
                        aria-label={visible ? "Hide value" : "Show value"}
                        size="icon-xs"
                        variant="ghost"
                        onClick={() =>
                          setShown((current) => {
                            const next = new Set(current)
                            if (next.has(variable.key))
                              next.delete(variable.key)
                            else next.add(variable.key)
                            return next
                          })
                        }
                      >
                        {visible ? <HideIcon /> : <RevealIcon />}
                      </Button>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {variable.description}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </DataTable>
    </div>
  )
}
