const CLASS_ATTRS = new Set(["className", "class"])
const CLASS_FNS = new Set(["cn", "clsx", "classNames", "cva", "twMerge", "tv"])

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

// Splits on `:` only at bracket depth 0, so `data-[state=open]:animate-in` survives.
function splitVariants(cls) {
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

export function parseClasses(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => ({ raw, ...splitVariants(raw) }))
}

export function arbitraryValue(base) {
  const match = /\[([^\]]*)\]$/.exec(base)
  return match ? match[1] : null
}

// A `cn()` inside a `className` is reached by both selectors, so results are de-duplicated by node.
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
