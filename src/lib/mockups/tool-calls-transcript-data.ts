/**
 * Mock transcripts for DES-205, in the platform's own shape.
 *
 * These mirror `TranscriptMessage` from `@sarj/precedent-node` field for field,
 * so the pairing in the component is the code the platform would run: a call
 * and its result are two items linked by `toolCallId`, `startAt` is epoch
 * seconds, and other speech can sit between them.
 *
 * The output strings are the agent's real ones from `transfer_to_human.py`
 * (TEL-263). `lookup_invoice` stands in for a client's custom tool, so the
 * mockup has arguments and a JSON output to show.
 */

export type TranscriptRole = "assistant" | "user" | "human agent"

export type TranscriptMessage =
  | {
      type: "message"
      role: TranscriptRole
      content: string
      startAt: number
    }
  | {
      type: "function_call"
      toolCallId: string
      toolName: string
      arguments: string
      startAt: number
    }
  | {
      type: "function_call_output"
      toolCallId: string
      toolName: string
      output: string
      isError: boolean
      durationMs: number | null
      startAt: number
    }

type CallCase = {
  id: string
  label: string
  startedAt: number
  messages: TranscriptMessage[]
}

const T0 = 1_760_520_000

const AVAILABLE = `AVAILABLE: Human transfer IS available right now. Current local time is Tuesday 14:32 (Asia/Riyadh).
Schedule (timezone: Asia/Riyadh):
  - Sunday: 09:00 - 17:00
  - Monday: 09:00 - 17:00
  - Tuesday: 09:00 - 17:00
  - Wednesday: 09:00 - 17:00
  - Thursday: 09:00 - 15:00
You may call transfer_call now.`

export const CALL_CASES: CallCase[] = [
  {
    id: "failed",
    label: "Transfer failed",
    startedAt: T0,
    messages: [
      {
        type: "message",
        role: "assistant",
        content:
          "Hi, you're through to the customer service assistant. How can I help today?",
        startAt: T0 + 1,
      },
      {
        type: "message",
        role: "user",
        content:
          "There's a charge on my September bill I don't recognise. What is it?",
        startAt: T0 + 6,
      },
      {
        type: "function_call",
        toolCallId: "call_a1",
        toolName: "lookup_invoice",
        arguments: '{"account_number":"4471 0928","month":"2026-09"}',
        startAt: T0 + 11,
      },
      {
        type: "function_call_output",
        toolCallId: "call_a1",
        toolName: "lookup_invoice",
        output:
          '{"total":"412.50 SAR","items":[{"label":"Monthly plan","amount":"299.00"},{"label":"Roaming, UAE","amount":"113.50"}]}',
        isError: false,
        durationMs: 640,
        startAt: T0 + 12,
      },
      {
        type: "message",
        role: "assistant",
        content:
          "The extra 113.50 SAR is a roaming charge from the UAE. Shall I transfer you to someone who can review it with you?",
        startAt: T0 + 14,
      },
      {
        type: "message",
        role: "user",
        content: "Yes please, I haven't even been to the UAE.",
        startAt: T0 + 22,
      },
      {
        type: "function_call",
        toolCallId: "call_a2",
        toolName: "check_transfer_availability",
        arguments: "{}",
        startAt: T0 + 25,
      },
      {
        type: "function_call_output",
        toolCallId: "call_a2",
        toolName: "check_transfer_availability",
        output: AVAILABLE,
        isError: false,
        durationMs: 38,
        startAt: T0 + 25,
      },
      {
        type: "message",
        role: "assistant",
        content:
          "Okay, transferring you to a colleague now. One moment please.",
        startAt: T0 + 27,
      },
      {
        type: "function_call",
        toolCallId: "call_a3",
        toolName: "transfer_call",
        arguments: "{}",
        startAt: T0 + 31,
      },
      {
        type: "message",
        role: "user",
        content: "Okay, but tell them the number is registered to my brother.",
        startAt: T0 + 34,
      },
      {
        type: "function_call_output",
        toolCallId: "call_a3",
        toolName: "transfer_call",
        output:
          "Transfer NOT COMPLETED: The caller spoke, which cancelled the transfer before anyone was reached.",
        isError: false,
        durationMs: 4210,
        startAt: T0 + 35,
      },
      {
        type: "message",
        role: "assistant",
        content: "Sure, I'll pass that on. Let me try the transfer again.",
        startAt: T0 + 37,
      },
      {
        type: "function_call",
        toolCallId: "call_a4",
        toolName: "transfer_call",
        arguments: "{}",
        startAt: T0 + 41,
      },
      {
        type: "function_call_output",
        toolCallId: "call_a4",
        toolName: "transfer_call",
        output: "Transfer FAILED: The human agent did not pick up.",
        isError: true,
        durationMs: 30120,
        startAt: T0 + 71,
      },
      {
        type: "message",
        role: "assistant",
        content: "Sorry, no one picked up. Would you like me to try again?",
        startAt: T0 + 73,
      },
      {
        type: "message",
        role: "user",
        content: "Yes, try again.",
        startAt: T0 + 79,
      },
      {
        type: "message",
        role: "assistant",
        content: "Sure, one moment while I transfer you again.",
        startAt: T0 + 80,
      },
      {
        type: "function_call",
        toolCallId: "call_a5",
        toolName: "transfer_call",
        arguments: "{}",
        startAt: T0 + 82,
      },
      /* The caller hung up while this rang. The agent fills the result in at
         call end, with the real start time on the call. */
      {
        type: "function_call_output",
        toolCallId: "call_a5",
        toolName: "transfer_call",
        output: "Transfer interrupted — caller disconnected before completion.",
        isError: true,
        durationMs: 24300,
        startAt: T0 + 106,
      },
    ],
  },
  {
    id: "connected",
    label: "Transfer connected",
    startedAt: T0,
    messages: [
      {
        type: "message",
        role: "assistant",
        content:
          "Hi, you're through to the customer service assistant. How can I help today?",
        startAt: T0 + 1,
      },
      {
        type: "message",
        role: "user",
        content:
          "My new SIM hasn't activated since yesterday. I'd like to speak to someone.",
        startAt: T0 + 5,
      },
      {
        type: "function_call",
        toolCallId: "call_b1",
        toolName: "check_transfer_availability",
        arguments: "{}",
        startAt: T0 + 9,
      },
      {
        type: "function_call_output",
        toolCallId: "call_b1",
        toolName: "check_transfer_availability",
        output: AVAILABLE,
        isError: false,
        durationMs: 41,
        startAt: T0 + 9,
      },
      {
        type: "message",
        role: "assistant",
        content: "Of course, one moment while I transfer you to a colleague.",
        startAt: T0 + 11,
      },
      {
        type: "function_call",
        toolCallId: "call_b2",
        toolName: "transfer_call",
        arguments: "{}",
        startAt: T0 + 15,
      },
      {
        type: "function_call_output",
        toolCallId: "call_b2",
        toolName: "transfer_call",
        output: "",
        isError: false,
        durationMs: 11840,
        startAt: T0 + 27,
      },
      {
        type: "message",
        role: "human agent",
        content:
          "Hi, customer service here. I saw the assistant's note about your SIM, I'll sort it out.",
        startAt: T0 + 28,
      },
      {
        type: "message",
        role: "user",
        content: "Thank you. The number ends in 4471.",
        startAt: T0 + 34,
      },
    ],
  },
]
