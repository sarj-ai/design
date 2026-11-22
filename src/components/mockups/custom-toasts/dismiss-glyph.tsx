const STROKE =
  "origin-center transition-transform duration-200 ease-out-cubic motion-reduce:transition-none group-hover/dismiss:scale-x-125 group-focus-visible/dismiss:scale-x-125";

export function DismissGlyph() {
  return (
    <svg
      aria-hidden="true"
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
