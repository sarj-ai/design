"use client"

import { useSyncExternalStore } from "react"

import { VercelToolbar } from "@vercel/toolbar/next"

/** Survives a reload, so a reviewer opts in once rather than per link. */
const STORAGE_KEY = "sarj-mockups:toolbar"

/* Two components read this store — the toolbar itself and the toggle in the
   shell header — and a write from one has to reach the other. `storage` only
   fires in the *other* tabs, so same-tab writes are fanned out here. */
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

let applied = false

/**
 * Applies `?toolbar=1` / `?toolbar=0` to the stored value, once per load
 * rather than once per subscriber — the flag is a property of the URL, not of
 * whichever component happened to mount first.
 *
 * Returns whether there was a flag to apply, since React reads the snapshot
 * before it subscribes and needs telling if that read is already stale.
 */
function applyUrlFlag() {
  if (applied) return false
  applied = true

  const flag = new URLSearchParams(window.location.search).get("toolbar")

  if (flag === "1") window.localStorage.setItem(STORAGE_KEY, "on")
  if (flag === "0") window.localStorage.removeItem(STORAGE_KEY)

  return Boolean(flag)
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)

  if (applyUrlFlag()) onStoreChange()

  /* Another tab changing the flag turns the toolbar on here too. */
  window.addEventListener("storage", onStoreChange)

  return () => {
    listeners.delete(onStoreChange)
    window.removeEventListener("storage", onStoreChange)
  }
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "on"
}

/** Nothing is opted in on the server, so the static HTML never carries it. */
function getServerSnapshot() {
  return false
}

function getSuppressedSnapshot() {
  return new URLSearchParams(window.location.search).get("toolbar") === "0"
}

function getSuppressedServerSnapshot() {
  return false
}

/** Whether the toolbar is on, for anything that has to reflect that state. */
export function useToolbarEnabled() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * `?toolbar=0` hides the toggle as well as the toolbar: no toolbar, and nothing
 * offering to turn one on. `npm run shots` and `npm run thumbs` drive every
 * route with it, so a capture carries the design and not the chrome around it.
 */
export function useToolbarSuppressed() {
  return useSyncExternalStore(
    subscribe,
    getSuppressedSnapshot,
    getSuppressedServerSnapshot,
  )
}

/**
 * Turns the toolbar on or off from inside the page.
 *
 * `replaceState` rather than a navigation: the store already drives the
 * toolbar, so a reload would buy nothing but a round trip. The flag still goes
 * into the address bar, because that is what makes the URL worth copying — the
 * next reviewer gets a link that arrives already opted in.
 */
export function setToolbar(on: boolean) {
  if (on) window.localStorage.setItem(STORAGE_KEY, "on")
  else window.localStorage.removeItem(STORAGE_KEY)

  const url = new URL(window.location.href)

  if (on) url.searchParams.set("toolbar", "1")
  else url.searchParams.delete("toolbar")

  window.history.replaceState(null, "", url)

  emit()
}

/**
 * The Vercel toolbar — and with it Comments — on the deployed site.
 *
 * Preview deployments get the toolbar for free; this is for the production
 * URL, which is the one people are actually sent. It is deliberately behind a
 * flag: mounting the toolbar unconditionally prompts *every* visitor to log in
 * to Vercel, and this site answers unauthenticated requests. A reviewer turns
 * it on from the shell header; nobody else is asked for anything.
 *
 * Read through `useSyncExternalStore` rather than an effect so no route has to
 * give up static rendering, and so the flag is read the way any other external
 * store would be.
 */
export function StaffToolbar() {
  const enabled = useToolbarEnabled()

  return enabled ? <VercelToolbar /> : null
}
