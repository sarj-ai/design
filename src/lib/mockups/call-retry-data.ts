export type TimeOfDay = { hour: number; meridiem: "am" | "pm"; minute: number }

export type WaitDuration = { days: number; hours: number; minutes: number }

export type RetryConfig = {
  attempts: number
  enabled: boolean
  timezone: string
  wait: WaitDuration
  windowEnd: TimeOfDay
  windowStart: TimeOfDay
}

export const ATTEMPTS_MIN = 1
export const ATTEMPTS_MAX = 10
export const WAIT_DAYS_MAX = 30

export const TIMEZONES = [
  "Asia/Riyadh",
  "Asia/Dubai",
  "Asia/Kuwait",
  "Africa/Cairo",
  "Europe/London",
  "America/New_York",
]

export const SCENARIO_NAME = "Service booking reminder"
export const BATCH_NAME = "March service reminders — Jeddah"

export const SCENARIO_RETRY: RetryConfig = {
  enabled: true,
  attempts: 3,
  wait: { days: 0, hours: 2, minutes: 0 },
  windowStart: { hour: 9, meridiem: "am", minute: 0 },
  windowEnd: { hour: 8, meridiem: "pm", minute: 0 },
  timezone: "Asia/Riyadh",
}

export const QUEUED_CALLS = 1240
export const SCHEDULED_CALLS = 3180

/** Minutes since midnight, 0–1439. */
function timeOfDayToMinutes(time: TimeOfDay) {
  const hour = time.hour % 12
  return (time.meridiem === "pm" ? hour + 12 : hour) * 60 + time.minute
}

function waitToMinutes(wait: WaitDuration) {
  return wait.days * 1440 + wait.hours * 60 + wait.minutes
}

type RetryErrors = {
  wait: null | string
  window: null | string
}

/** Only start === end is an invalid window; overnight windows (10 PM → 6 AM) are legal. */
export function retryConfigErrors(config: RetryConfig): RetryErrors {
  if (!config.enabled) {
    return { wait: null, window: null }
  }

  return {
    wait:
      waitToMinutes(config.wait) === 0
        ? "Retries need at least one minute between them."
        : null,
    window:
      timeOfDayToMinutes(config.windowStart) ===
      timeOfDayToMinutes(config.windowEnd)
        ? "Start and end cannot be the same time. The window must be shorter than 24 hours."
        : null,
  }
}

export function hasRetryErrors(errors: RetryErrors) {
  return Object.values(errors).some((message) => message !== null)
}
