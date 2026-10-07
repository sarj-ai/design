/**
 * What the coach walks a first-time reader through, beat by beat.
 *
 * The `</>` on a card is the one control here nobody guesses: it looks like a
 * decoration until it is pressed, and what it copies only makes sense if you
 * already know these screens are published as shadcn registry items. So the
 * walkthrough does not describe it — it goes and stands next to it, and waits
 * for the reader to do the thing themselves. Four beats, the middle two of
 * them the reader's own clicks.
 *
 * A beat is data, not DOM: `hey-click.tsx` owns every rectangle it measures
 * and every spring it rides. Adding a beat here is a line of copy and a
 * selector.
 */

/* The index marks the install menu of whichever card is first after the
   search. The trigger carries `data-tour`; the open menu is portalled out of
   the card, so it carries `data-tour-menu` instead. Until the menu is open
   its rows are not in the DOM, so there is nothing to point at and the coach
   keeps riding the pointer. */
const INSTALL = '[data-tour="install"]'
const INSTALL_ROWS = '[data-tour-menu="install"] [role="menuitem"]'

export type Beat = {
  id: string
  /** The one line the coach says. Sentence case, and one idea. */
  say: string
  /**
   * Everything this beat is about. The loop is drawn around all of them at
   * once, so a selector matching four drops circles the four as a group. A
   * beat with no target, or one whose target is not on screen, is a beat the
   * coach rides the pointer through instead of parking.
   */
  target?: string
  /**
   * What moves it on. `reach` is the pointer arriving, for a target that
   * acts on hover. `click` is a real click on the target. `button` is the
   * coach's own, for a beat with nothing on the page to press.
   */
  advance: "reach" | "click" | "button"
  /** The button's words, when the coach's own button is what advances it. */
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
