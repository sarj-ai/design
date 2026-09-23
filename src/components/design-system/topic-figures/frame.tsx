/**
 * The sheet every topic tile's drawing is cut from: a square, drawn at about
 * 1.6x the ~150px tile it lands in, so a `text-xs` label reads at roughly 7px
 * — annotation only.
 *
 * The tile prints its number in the top-left corner, so a drawing keeps the
 * box `x < 64, y < 48` clear and centres its subject in what is left.
 */
export const TOPIC_FIGURE_VIEWBOX = "0 0 240 240"
