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

export type CallCase = {
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
        content: "مرحباً، معك المساعد الآلي لخدمة العملاء. كيف أقدر أساعدك اليوم؟",
        startAt: T0 + 1,
      },
      {
        type: "message",
        role: "user",
        content: "فاتورة شهر سبتمبر فيها مبلغ ما أعرفه، أبغى أفهم وش هو.",
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
          "المبلغ الإضافي ١١٣٫٥٠ ريال رسوم تجوال في الإمارات. تبغى أحولك لموظف يراجعها معك؟",
        startAt: T0 + 14,
      },
      {
        type: "message",
        role: "user",
        content: "إيه لو سمحت، ما سافرت الإمارات أصلاً.",
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
        content: "تمام، بحولك الحين لأحد الموظفين. لحظة من فضلك.",
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
        content: "طيب، بس قل له إن الرقم مسجل باسم أخوي.",
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
        content: "أبشر، بوصل له المعلومة. بحاول أحولك مرة ثانية.",
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
        content: "للأسف ما رد أحد من الموظفين. تبغى أحاول مرة ثانية؟",
        startAt: T0 + 73,
      },
      {
        type: "message",
        role: "user",
        content: "إيه جرب مرة ثانية.",
        startAt: T0 + 79,
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
        content: "مرحباً، معك المساعد الآلي لخدمة العملاء. كيف أقدر أساعدك اليوم؟",
        startAt: T0 + 1,
      },
      {
        type: "message",
        role: "user",
        content: "الشريحة الجديدة ما تفعلت من أمس، أبغى أكلم موظف.",
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
        content: "أكيد، لحظة بحولك لأحد الموظفين.",
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
        content: "هلا، معك خدمة العملاء. شفت ملاحظة المساعد عن الشريحة، أبشر.",
        startAt: T0 + 28,
      },
      {
        type: "message",
        role: "user",
        content: "الله يعافيك. الرقم ينتهي بـ ٤٤٧١.",
        startAt: T0 + 34,
      },
    ],
  },
]
