"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DataTableHead, DataTableHeaderRow } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  daysUntil,
  formatDate,
  NEAR_EXPIRY_DAYS,
  relativeSince,
  scopeSummary,
  TOKEN_CAP,
  tokenStatus,
  type Token,
} from "@/lib/connected-apps-data"
import { RevokeTokenIcon } from "@/components/connected-apps/icons"

/**
 * An app's tokens, newest first.
 *
 * The order is fixed and there is no re-sort control: the whole create flow
 * ends with the reader looking for the token they just made, and it should be
 * the first row every time.
 */
export function TokenTable({
  onRevoke,
  tokens,
}: {
  onRevoke: (token: Token) => void
  tokens: Token[]
}) {
  return (
    <Table
      // Cells keep their inset; the rules run the full width of the card.
      className="[&_tbody_tr:last-child]:border-0 [&_td]:px-4 [&_th]:px-4"
    >
      <TableHeader>
        <DataTableHeaderRow>
          <DataTableHead>Name</DataTableHead>
          <DataTableHead>Scopes</DataTableHead>
          <DataTableHead>Expires</DataTableHead>
          <DataTableHead>Last used</DataTableHead>
          <DataTableHead>Status</DataTableHead>
          <TableHead className="text-end font-semibold text-foreground" />
        </DataTableHeaderRow>
      </TableHeader>

      <TableBody>
        {tokens.map((token) => (
          <TokenRow key={token.id} onRevoke={onRevoke} token={token} />
        ))}
      </TableBody>
    </Table>
  )
}

function TokenRow({
  onRevoke,
  token,
}: {
  onRevoke: (token: Token) => void
  token: Token
}) {
  const status = tokenStatus(token)
  const live = status === "active"

  return (
    <TableRow className="transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none">
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span
            className={cn("font-medium", !live && "text-muted-foreground")}
            dir="auto"
          >
            {token.name}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              {/* Left-to-right whatever the row around it does: a base64
                  credential reordered next to Arabic text is a different
                  string. */}
              <span
                className="w-fit font-mono text-xs text-muted-foreground"
                dir="ltr"
              >
                {token.prefix}…
              </span>
            </TooltipTrigger>
            <TooltipContent>
              The first 8 characters — all Sarj stores of this token.
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline">{scopeSummary(token.scopes)}</Badge>
          </TooltipTrigger>
          {/* The platform's own strings, unedited — a scope a customer cannot
              quote back is a scope they cannot debug against. */}
          <TooltipContent className="font-mono">
            {token.scopes.join(", ")}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell>
        <ExpiryCell token={token} />
      </TableCell>

      <TableCell className="text-muted-foreground">
        {relativeSince(token.lastUsedAt)}
      </TableCell>

      <TableCell>
        <StatusBadge status={status} />
      </TableCell>

      <TableCell className="text-end">
        {status === "revoked" ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <RevokeDialog onRevoke={onRevoke} token={token} />
        )}
      </TableCell>
    </TableRow>
  )
}

function StatusBadge({ status }: { status: "active" | "expired" | "revoked" }) {
  if (status === "active") {
    return (
      <Badge
        className="bg-success-tint text-success-tint-foreground"
        variant="secondary"
      >
        Active
      </Badge>
    )
  }

  /* Grey, both of them. Neither an expiry nor a deliberate revoke is a
     failure, and colouring them as one would misread the risk. The two words
     are different enough without a second signal. */
  return (
    <Badge className="bg-muted text-muted-foreground" variant="secondary">
      {status === "expired" ? "Expired" : "Revoked"}
    </Badge>
  )
}

function ExpiryCell({ token }: { token: Token }) {
  if (!token.expiresAt) {
    return <span className="text-muted-foreground">Never</span>
  }

  const days = daysUntil(token.expiresAt)

  if (days > 0 && days <= NEAR_EXPIRY_DAYS) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className="bg-warning-tint text-warning-tint-foreground"
            variant="secondary"
          >
            In {days} {days === 1 ? "day" : "days"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{formatDate(token.expiresAt)}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <span className="text-muted-foreground">{formatDate(token.expiresAt)}</span>
  )
}

/**
 * Revoking, with the consequence spelled out from what the row already knows.
 *
 * "Last used two hours ago" is the only number on this screen that answers the
 * question actually being asked — am I about to break something that is
 * running right now — so when it is recent it leads.
 */
function RevokeDialog({
  onRevoke,
  token,
}: {
  onRevoke: (token: Token) => void
  token: Token
}) {
  const expired = tokenStatus(token) === "expired"
  /* `daysUntil` reads negative for a past date, so this is "used within the
     last week". Measured against the frozen clock, like everything else, so a
     screenshot does not drift. */
  const recentlyUsed =
    token.lastUsedAt !== null && -daysUntil(token.lastUsedAt) <= 7

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button aria-label={`Revoke ${token.name}`} size="xs" variant="outline">
          <RevokeTokenIcon />
          Revoke
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <RevokeTokenIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Revoke <span dir="auto">{token.name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {expired && token.expiresAt ? (
              <>
                It expired on {formatDate(token.expiresAt)} and can no longer
                authenticate, so nothing will break. Revoking frees one of your{" "}
                {TOKEN_CAP} token slots.
              </>
            ) : (
              <>
                {recentlyUsed ? (
                  <>
                    It was last used {relativeSince(token.lastUsedAt)}, so
                    something is almost certainly calling Sarj with it right
                    now.{" "}
                  </>
                ) : null}
                Anything using this token immediately loses access, and this
                cannot be undone. If it is still in production, create a
                replacement and switch over first.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onRevoke(token)}
            variant="destructive"
          >
            Revoke token
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
