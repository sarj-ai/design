"use client"

import { MockupShell } from "@/components/mockup-shell"
import { CallActivityTab } from "@/components/phone-numbers/call-activity-tab"
import { OutboundTab } from "@/components/phone-numbers/outbound-tab"
import { ProvisionedTab } from "@/components/phone-numbers/provisioned-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * `/admin/phone-numbers` — the index INT-78 is about, per Fatma's comment on
 * the ticket: "Index page phone numbers (THIS ticket)".
 *
 * The three tabs already exist in the product. What does not is a consistent
 * table across them: on `vnagar/platform-consistency` only Call Activity had
 * been brought onto the shaded-header pattern, while Outbound Assignments and
 * Provisioned Numbers were still plain `<TableHead>` inside a `rounded-md
 * border`. All three use it here.
 */
export default function PhoneNumbersPage() {
  return (
    <MockupShell
      eyebrow="Platform admin"
      title="Self serve telephony — the phone numbers index"
    >
      <TooltipProvider>
        <main className="mx-auto flex w-full max-w-350 flex-col gap-6 p-8">
          <h1 className="text-2xl font-semibold">Phone numbers</h1>

          {/* Stock shadcn tabs, as `phone-numbers-tabs.tsx` uses them. The two
              size classes only pull this repo's generation up to bulbul's:
              its TabsList is h-9 to this one's h-8, and its TabsTrigger is
              px-2 py-1 to this one's px-1.5 py-0.5. */}
          <Tabs className="gap-6" defaultValue="call-activity">
            <TabsList className="h-9">
              <TabsTrigger className="px-2 py-1" value="call-activity">
                Call activity
              </TabsTrigger>
              <TabsTrigger className="px-2 py-1" value="outbound">
                Outbound numbers assignments
              </TabsTrigger>
              <TabsTrigger className="px-2 py-1" value="provisioned">
                Provisioned phone numbers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="call-activity">
              <CallActivityTab />
            </TabsContent>
            <TabsContent value="outbound">
              <OutboundTab />
            </TabsContent>
            <TabsContent value="provisioned">
              <ProvisionedTab />
            </TabsContent>
          </Tabs>
        </main>
      </TooltipProvider>
    </MockupShell>
  )
}
