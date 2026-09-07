PRD Title
Agent Actions - Schedule Outbound Calls
Author
 Abdulrahman Al-Hashemi  fjanahi@sarj.ai
Reviewer
 hmansour@sarj.ai
Starting Date
 Jul 2, 2026
PRD Status
 Completed
Linear Ticket
 Linear Ticket


💡In this page we will discuss the way call-based outbound call scheduling happens, its configuration within scenario creation, how scheduled calls will be viewed by admins. 


Context
Customers might get called for multiple reasons, and picking up a call mid-meeting from a number you don’t know might happen, but once you know it is a call to remind you about a payment that you need to make, or to take an action, you might ask the caller to call you back in 30-minutes. 

Sounds familiar? This is exactly what is missing currently where we enable the agent to take an action and schedule an outbound call based on the call context and conversation. 
Problem
When customers needs to be called back either based on their request or based on the call context as a follow up, this doesn’t happen automatically, today, Agent QA members reviewing calls might spot this randomly and create an outbound call for it, with a huge number of calls happening, lots of calls will be skipped and the score of successfully addressing the need of the call is going to degrade. 
Tracked Metrics
Number of daily Agent scheduled calls 
Need to add error metrics here to track how well the agent is doing at rescheduling calls / pickup rate / success rate
Goals & Objectives
Met outcome score > 90%



High-Level Solution 
User Journeys and Trigger Types
A user requests a specific callback time (customer_requested)
The user receives a call from the agent → user is busy and says call me back in 30 minutes → agent detects the request → stores a timestamp → checks for an existing pending callback → confirms the callback time verbally using soft language (“around 3:30”) instead of exact-minute promise (to account for outbound call queue being under loads)  

User requests a vague or relative time (customer_requested)
The user says “call me next week” → agent asks a clarifying question to avoid hallucinated timings → stores timestamp, etc. same flow as above.

An agent infers a follow-up without an explicit request (agent_follow_up)
The user receives a call from the agent (for example for a debt collection) → says they will pay in a week, or they just hang up.. There’s no explicit ask but the context implies a need for a call back (meaning, it could be analyzed via call analyst and not live agent)

The user continues to reschedule
The user receives a rescheduled call from the agent → asks to reschedule again → and again .. Once they reschedule X amount of times, the agent stops rescheduling.

[Out of Scope] User calls back before a scheduled retry fires (missed_call_retry)
The user receives a missed call from an agent → a call retry is queued → user calls back 20 minutes later (currently goes nowhere) → agent receiving the call must have context of the caller → pending retry needs to be cancelled so the user does not get another call

A scheduled callback attempt fails and must retry or escalate
A scheduled call fails for any reason (carrier, etc.) → Need a mechanism ideally via the scheduling record to determine happens next: 
→ reattempt if it is customer_requested
→ any other cases, check if it’s under the configured retry limit
→ if continues to fail and  limit is reached, mark as failed in scheduled calls view

A scheduled call needs manual cancellation
An agent engineer identifies a bad scheduled call (hallucinated, or the issue was resolved) and can cancel it from the scheduled calls view. This is unlikely since it’s manual (so consider for possible v2)

Solution requirements
Agent must detect a follow up call requirement (may be a user asking to reschedule, may be a follow up because they said they will do X by X date, etc.)
Live agent (tool) must register the callback time and date If it’s a customer request, agent should confirm the callback time and date 
Agent must register call metadata (phone number, name, etc.) to for the post-call analyst to use in scheduling the outbound call (and any other schema details needed by the call queue)
Agent must register call transcript or context brief to provide context in the callback
Post-call analyst must schedule the outbound call
There should be a check / track previous rescheduled calls to the user (so we can limit rescheduled calls to X number of times)
There should also limit the number of retry calls (if someone doesn't pick up) before marking as failed.
Calls need a schedule_origin field (customer_requested / agent_follow_up / missed_call_retry) to handle different kinds of callbacks
Out of scope:
Agent performing the callback (meaning, the scope of this document is the scheduling part, not the calling part)
Agent performing postcall analysis (this will just be an addition to the existing feature)  

The implementation to this feature will cover multiple aspects as follows: 
The configuration within the Scenario details
The automated scheduling action taken by the Agent 
The view for Admins/Super Admins to check scheduled calls 
Configuring Automatic Outbound Call Scheduling 
There are two sources / triggers for scheduling a callback right now (and there may be more in the future). They have different requirements. For example, a customer requested callback needs the agent to verify the callback time with the user, while a follow up call to follow up on a promised debt can happen any time in an appropriate call window and doesn’t need to happen on the call itself. Therefore, we can separate them.
1. New Request Schedule Callback Tool in Scenario Configuration 
This is configurable per scenario (can be added as a tool) and will allow the agent to confirm call back time with the user. The scheduled call will be tagged with the ‘customer_requested’ tag when being stored as a scheduled call. The tool will not schedule the call, but flag the request for the post-call analyst to handle. It needs to be a tool so it can be handled live when a customer asks.

Details to configure by the Agent Engineers via setting:
Trigger conditions “Customer asks to be called back” “Customer is busy” etc.
Calling Window
Max reschedule attempts (maximum this field should be able to accept is like 10 as a limit from Sarj, I don’t think it should be unlimited)
Callback confirmation messages
(not in the mockup below) Add checkbox “does this callback need human agent support” which will only allow the call to be scheduled during the defined work hours

Mockup:




2. Extend Post-call Analyst to Infer Callbacks for Implicit Use Cases and perform call scheduling action

The postcall scheduler will analyze the call to know if the Schedule Callback Tool was used and what the user callback time was agreed on. It will then schedule the call (to the queue Zurez is working on)

Also, the post call analyst should analyze the transcript to infer if a callback is needed. For example, in some cases, like someone saying they’ll pay their debt in a week, we want the agent to infer this and still do the scheduling. It doesn’t need to be in the call itself, just needs to flag the follow up, include the confidence, and schedule the call with the needed metadata / context. 

The data to be collected should be:
Does there need to be a follow up / callback (yes/no)
The callback date / time (note there may be situations where a user doesn’t provide this so the postcall analyst will need to assign it)
Context brief for why the callback is needed (for example, customer promised to pay their debt by end of the month)

We can get more specific after the feature is used and we have more data collected (possibly user defined variables specific to callbacks)

Mockup:


Automatically Scheduling an Outbound Call
The request will be sent by the postcall analyst to the call schedule queue (Zurez’ work). Data schema should match what he needs to get the call scheduled.

Monitoring Automatically Scheduled Outbound Calls
This will be appended to the Conversations page since it has shared characteristics to other calls and can be more streamlined for the user. 
A new source filter will be added to filter through a callback, a follow up, and a failed call retry. This allows us the option to in the future add batch calls as a source as well or other types if needed.


Mockup:


There should be a cancel call manual button option where an agent engineer (superadmin user) can cancel a queued call. The request should be sent from conversations queue and interact with Zurez’ call scheduler to cancel the request. This could be needed if an agent hallucinates or there’s any other reason to cancel. 
Potential Upgrades
Manual callback ability if rescheduled call fails (we should collect this data to determine if this is truly needed)
Suggestion from @hmansour → feature where the agent calls back when payment is made? Automatically based on the CRM. Caller says will pay next Sunday => come Monday our agent checks if still unpaid and calls back if so. Or perhaps have it as an analytic that can be injected into the CRM and then the customer can automatically do it from their (overdue promises through Sarj). Might already be the case.
Configure what happens when the call fails due to customer actions? like customer hangup or customer didn't pickup? this also could use the retry mechanism feature to be built and might be considered for V2 of this feature
Right now, there is no manual callback as it will be set to retry up to X times until it is considered a failed call (consider this feature for V2 if failures are high)


Q&A

❓Questions
✔️ Answers
Is there a situation in which we need to cancel a scheduled call? If so, we need a mechanism
I believe this should be already part of the call scheduler, we need to check with Zurez, but, if the call went to some extent in the scheduler where cancellation is not possible, the status should show this and the cancel button gets deactivated. 
Handling the situation in which a user calls back, but a retry is already scheduled
I believe this is batch call functionality and can be considered out of scope, although it was part of the original request





