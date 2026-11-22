// The dismiss button's glyph: two strokes lying on top of each other read as a
// dash; pointing at the button turns them ±45° into an X. Rotate and scale only,
// so it stays on the compositor. Needs a `group/dismiss` parent.

const STROKE =
  "origin-center transition-transform duration-200 ease-out-cubic motion-reduce:transition-none group-hover/dismiss:scale-x-125 group-focus-visible/dismiss:scale-x-125";

export function DismissGlyph() {
  return (
    <svg
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <line
        className={`${STROKE} group-hover/dismiss:rotate-45 group-focus-visible/dismiss:rotate-45`}
        x1="6"
        x2="18"
        y1="12"
        y2="12"
      />
      <line
        className={`${STROKE} group-hover/dismiss:-rotate-45 group-focus-visible/dismiss:-rotate-45`}
        x1="6"
        x2="18"
        y1="12"
        y2="12"
      />
    </svg>
  );
}
