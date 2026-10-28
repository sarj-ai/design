// The open menu is portalled out of the card, so it carries `data-tour-menu`, not `data-tour`.
const INSTALL = '[data-tour="install"]'
const INSTALL_ROWS = '[data-tour-menu="install"] [role="menuitem"]'

export type Beat = {
  id: string
  say: string
  target?: string
  advance: "reach" | "click" | "button"
  action?: string
}

export const TOUR: Beat[] = [
  {
    id: "hey",
    say: "Hey. Every screen here is published as a shadcn registry item, so taking one is a command rather than a copy of a dozen files.",
    advance: "button",
    action: "Go on",
  },
  {
    id: "open",
    say: "Every card carries the command for its own screen. Click this one.",
    target: INSTALL,
    advance: "click",
  },
  {
    id: "pick",
    say: "Same install, four ways to run it. Click yours and it lands on your clipboard.",
    target: INSTALL_ROWS,
    advance: "click",
  },
  {
    id: "run",
    say: "Copied. Run it at the platform repo root — the --cwd in it points shadcn at apps/web, the one package with a components.json.",
    advance: "button",
    action: "Got it",
  },
]
