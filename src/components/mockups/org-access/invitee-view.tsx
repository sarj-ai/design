"use client"

import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { INVITEE, ORG, type InviteeState } from "@/lib/mockups/org-access-data"

export function InviteeView({ state }: { state: InviteeState }) {
  const copy = {
    invite: {
      title: `Join ${ORG.name}`,
      body: `${INVITEE.inviter} invited ${INVITEE.invitedEmail} as ${INVITEE.group}.`,
    },
    "wrong-account": {
      title: "This invite is for another account",
      body: `It was sent to ${INVITEE.invitedEmail}. You're signed in as ${INVITEE.signedInAs}.`,
    },
    expired: {
      title: "This invite link has expired",
      body: `Ask an admin at ${ORG.name} for a new one.`,
    },
    "no-invite": {
      title: "You're not in an organization yet",
      body: `Ask an admin at your company to invite ${INVITEE.uninvited}.`,
    },
  }[state]

  return (
    <div className="flex min-h-full grow items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="gap-4">
          <Image alt="sarj.ai" height={32} src="/logo.png" width={56} />
          <div className="flex flex-col gap-1">
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.body}</CardDescription>
          </div>
        </CardHeader>
        {state === "invite" ? (
          <CardContent>
            <Button
              className="w-full"
              onClick={() => toast.success(`You joined ${ORG.name}`)}
            >
              Join {ORG.name}
            </Button>
          </CardContent>
        ) : null}
        <CardFooter>
          {state === "invite" ? (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              Not {INVITEE.invitedEmail}?
              <Button size="xs" variant="link">
                Sign out
              </Button>
            </div>
          ) : state === "wrong-account" ? (
            <Button className="w-full">Sign out and switch account</Button>
          ) : (
            <Button className="w-full" variant="outline">
              Sign out
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
