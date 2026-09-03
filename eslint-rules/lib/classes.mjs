/**
 * Shared helpers for the `sarj/*` lint rules.
 *
 * Tailwind classes reach the AST in three shapes:
 *
 *   className="flex gap-4"                      → a plain string literal
 *   className={cn("flex", open && "gap-4")}     → strings scattered in a call
 *   cva("h-9 px-4", { variants: { … } })        → strings inside a variant map
 *
 * Rather than teach every rule about all three, these helpers walk the whole
 * subtree of a node and hand back each string inside it together with the AST
 * node to report against, so error locations stay precise.
 */

const CLASS_ATTRS = new Set(["className", "class"])
const CLASS_FNS = new Set(["cn", "clsx", "classNames", "cva", "twMerge", "tv"])

/** Collect every string-bearing node in an arbitrary AST subtree. */
export function collectStrings(node, out = []) {
  if (!node || typeof node !== "object") return out

  if (Array.isArray(node)) {
    for (const child of node) collectStrings(child, out)
    return out
  }
  if (typeof node.type !== "string") return out

  if (node.type === "Literal" && typeof node.value === "string") {
    out.push({ node, value: node.value })
    return out
  }
  if (node.type === "TemplateElement") {
    out.push({ node, value: node.value.cooked ?? node.value.raw })
    return out
  }

  for (const key of Object.keys(node)) {
    // `parent` would loop forever; loc/range hold no nodes.
    if (key === "parent" || key === "loc" || key === "range") continue
    collectStrings(node[key], out)
  }
  return out
}

/**
 * Split one Tailwind class into its variant prefixes and its base utility.
 *
 * Splits on `:` only at bracket depth 0, so `data-[state=open]:animate-in` and
 * `supports-[display:grid]:grid` survive intact. Strips the `!` important
 * marker from either end.
 */
export function splitVariants(cls) {
  const segments = []
  let depth = 0
  let start = 0

  for (let i = 0; i < cls.length; i++) {
    const ch = cls[i]
    if (ch === "[" || ch === "(") depth++
    else if (ch === "]" || ch === ")") depth--
    else if (ch === ":" && depth === 0) {
      segments.push(cls.slice(start, i))
      start = i + 1
    }
  }
  segments.push(cls.slice(start))

  let base = segments.pop()
  if (base.startsWith("!")) base = base.slice(1)
  if (base.endsWith("!")) base = base.slice(0, -1)

  return { variants: segments, base }
}

/** Parse a whitespace-separated class string into structured classes. */
export function parseClasses(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => ({ raw, ...splitVariants(raw) }))
}

/**
 * Return the contents of a trailing arbitrary value — `gap-[13px]` → `13px` —
 * or null when the utility has none.
 */
export function arbitraryValue(base) {
  const match = /\[([^\]]*)\]$/.exec(base)
  return match ? match[1] : null
}

/**
 * Build a visitor that fires `handle({ node, value, classes })` once per class
 * string in the file. A `cn()` nested inside a `className` is reached by both
 * selectors, so results are de-duplicated by node identity.
 */
export function createClassVisitor(handle) {
  const seen = new WeakSet()

  const emit = ({ node, value }) => {
    if (seen.has(node)) return
    seen.add(node)
    handle({ node, value, classes: parseClasses(value) })
  }

  return {
    JSXAttribute(node) {
      if (!CLASS_ATTRS.has(node.name?.name)) return
      for (const entry of collectStrings(node.value)) emit(entry)
    },
    CallExpression(node) {
      const name = node.callee?.name ?? node.callee?.property?.name
      if (!CLASS_FNS.has(name)) return
      for (const entry of collectStrings(node.arguments)) emit(entry)
    },
  }
}

/**
 * Build a visitor that fires once per `className` attribute with every class
 * in it flattened into one list. Use this when a rule needs to check whether
 * one class is accompanied by another (e.g. a `motion-reduce:` counterpart),
 * which a per-string visitor cannot see across `cn()` arguments.
 */
export function createAttributeVisitor(handle) {
  return {
    JSXAttribute(node) {
      if (!CLASS_ATTRS.has(node.name?.name)) return
      const classes = collectStrings(node.value).flatMap((entry) =>
        parseClasses(entry.value).map((cls) => ({ ...cls, node: entry.node })),
      )
      if (classes.length) handle({ node, classes })
    },
  }
}

/** The shadcn primitives are generated code — rules that police authored UI skip them. */
export function isPrimitiveFile(filename) {
  return /[/\\]src[/\\]components[/\\]ui[/\\]/.test(filename)
}
