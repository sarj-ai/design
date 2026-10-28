"use client"

import { MockupShell } from "@/components/shell/mockup-shell"
import { CallActivityTab } from "@/components/mockups/phone-numbers/call-activity-tab"
import { OutboundTab } from "@/components/mockups/phone-numbers/outbound-tab"
import { ProvisionedTab } from "@/components/mockups/phone-numbers/provisioned-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function PhoneNumbersPage() {
  return (
    <MockupShell
      eyebrow="Platform admin"
      title="Self serve telephony — the phone numbers index"
    >
      <TooltipProvider>
        <main className="mx-auto flex w-full max-w-350 flex-col gap-6 p-8">
          <h1 className="text-2xl font-semibold">Phone numbers</h1>

          {/* The size classes match the platform's TabsList (h-9) and TabsTrigger (px-2 py-1). */}
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
