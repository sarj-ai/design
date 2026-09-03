/**
 * Global call retry — the one configuration both surfaces read.
 *
 * The scenario owns it and every trigger source inherits it, so the scenario's
 * saved values and a source's override are the same shape. That is the whole
 * point: an override is only checkable if it is the same set of fields, in the
 * same order, with the same bounds.
 *
 * Every field here maps to one on `ScheduleConfigPolicy`, the platform's retry
 * contract — `enabled`, `maxRetries`, `waitBetween`, `retryWindow`, `timezone`.
 * Platform confirmed on 30 Aug 2026 what the contract carries. A concurrency
 * cap and a final-status picker are not supported, and a per-outcome picker is
 * still being built — none of the three is today's problem, so none is drawn.
 * Add a field here only once `ScheduleConfigPolicy` has somewhere to put it.
 */

/* -------------------------------------------------------- the two durations */

/** A wall-clock moment, in the AM/PM form the retry window is written in. */
export type TimeOfDay = { hour: number; meridiem: "am" | "pm"; minute: number }

/** A span, which is why it carries days and the window does not. */
export type WaitDuration = { days: number; hours: number; minutes: number }

export type RetryConfig = {
  attempts: number
  enabled: boolean
  timezone: string
  wait: WaitDuration
  windowEnd: TimeOfDay
  windowStart: TimeOfDay
}

/* -------------------------------------------------------------- the bounds */

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

/* --------------------------------------------------------------- the world */

export const SCENARIO_NAME = "Service booking reminder"
export const BATCH_NAME = "March service reminders — Jeddah"

/** What the scenario has saved, and therefore what every source inherits. */
export const SCENARIO_RETRY: RetryConfig = {
  enabled: true,
  attempts: 3,
  wait: { days: 0, hours: 2, minutes: 0 },
  windowStart: { hour: 9, meridiem: "am", minute: 0 },
  windowEnd: { hour: 8, meridiem: "pm", minute: 0 },
  timezone: "Asia/Riyadh",
}

/** What a save would move, and what the confirmation counts. */
export const QUEUED_CALLS = 1240
export const SCHEDULED_CALLS = 3180

/* -------------------------------------------------------------- conversion */

/** Minutes since midnight, 0–1439. */
export function timeOfDayToMinutes(time: TimeOfDay) {
  const hour = time.hour % 12
  return (time.meridiem === "pm" ? hour + 12 : hour) * 60 + time.minute
}

/** The wait as the single number the platform stores it as. */
export function waitToMinutes(wait: WaitDuration) {
  return wait.days * 1440 + wait.hours * 60 + wait.minutes
}

/* ------------------------------------------------------------- the rules */

export type RetryErrors = {
  wait: null | string
  window: null | string
}

/**
 * The two things that can be wrong, each returned against the field that
 * caused it. There is no form library here and no schema — two rules do not
 * need one, and a message that lives next to its own field does not need a
 * banner either.
 *
 * The window rule reduces to one case. `(end - start + 1440) % 1440` is always
 * under 24 hours once the two are times of day, so the PRD's "less than 24
 * hours" only bites when they are equal — where the answer is simultaneously
 * "no window" and "all day". An overnight 10 PM → 6 AM window is legal.
 */
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
