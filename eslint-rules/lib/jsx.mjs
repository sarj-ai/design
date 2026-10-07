/**
 * JSX helpers for the `sarj/*` rules that read structure rather than classes.
 *
 * The class rules (`lib/classes.mjs`) only need strings. The design-system
 * rules added after them need to know which primitive an element is, what it
 * is nested in, and what its label says — "a Dialog inside a DrawerContent",
 * "a Cancel after the primary", "an icon in a DrawerHeader". These helpers
 * answer those three questions once.
 *
 * Every structural rule keys off names imported from `@/components/ui/*`, never
 * off the bare JSX name: a mockup is free to define its own `Button` or
 * `Empty`, and the rules are about the shadcn primitives, not the word.
 */

import { collectStrings, parseClasses } from "./classes.mjs"

const UI_SOURCE = /^@\/components\/ui\//

/**
 * Track the primitives a file imports. Returns a visitor to merge into the
 * rule's own, and `ui(name)`, which maps a local JSX name back to the
 * primitive it was imported as — so `import { Button as Btn }` still reads as
 * `Button`. Anything not imported from `@/components/ui/*` maps to null.
 */
export function trackUiImports() {
  const local = new Map()

  return {
    visitor: {
      ImportDeclaration(node) {
        if (!UI_SOURCE.test(node.source.value)) return
        for (const spec of node.specifiers) {
          if (spec.type !== "ImportSpecifier") continue
          local.set(spec.local.name, spec.imported.name ?? spec.imported.value)
        }
      },
    },
    ui(name) {
      return local.get(name) ?? null
    },
  }
}

/** `Button` for `<Button>`, `Foo.Bar` for `<Foo.Bar>`, null for anything else. */
export function jsxName(opening) {
  const name = opening?.name
  if (!name) return null
  if (name.type === "JSXIdentifier") return name.name
  if (name.type === "JSXMemberExpression") {
    const parts = []
    let cursor = name
    while (cursor?.type === "JSXMemberExpression") {
      parts.unshift(cursor.property.name)
      cursor = cursor.object
    }
    if (cursor?.type === "JSXIdentifier") parts.unshift(cursor.name)
    return parts.join(".")
  }
  return null
}

/** The named attribute on an opening element, if it is there. */
export function getAttr(opening, name) {
  return opening.attributes.find(
    (attr) => attr.type === "JSXAttribute" && attr.name?.name === name,
  )
}

/** A `{...props}` spread could be carrying anything, so some rules stand down. */
export function hasSpread(opening) {
  return opening.attributes.some((attr) => attr.type === "JSXSpreadAttribute")
}

/**
 * The value of an attribute when it is a plain string — `size="sm"`,
 * `size={"sm"}`, or a template with no expressions. Null when it is computed,
 * so a rule never guesses at a value it cannot see.
 */
export function attrString(attr) {
  const value = attr?.value
  if (!value) return null
  if (value.type === "Literal" && typeof value.value === "string") {
    return value.value
  }
  if (value.type === "JSXExpressionContainer") {
    const expr = value.expression
    if (expr.type === "Literal" && typeof expr.value === "string") {
      return expr.value
    }
    if (expr.type === "TemplateLiteral" && expr.expressions.length === 0) {
      return expr.quasis[0].value.cooked
    }
  }
  return null
}

/** Every Tailwind class on an element's `className`, as `{ raw, base, variants, node }`. */
export function classesOf(opening) {
  const attr = getAttr(opening, "className")
  if (!attr) return []
  return collectStrings(attr.value).flatMap((entry) =>
    parseClasses(entry.value).map((cls) => ({ ...cls, node: entry.node })),
  )
}

/**
 * What an element says: its text children, string literals inside `{}`, and
 * the same from every element nested in it — so `<Button><PlusIcon /> Create
 * persona</Button>` reads "Create persona". `dynamic` is true when any part of
 * it is computed; a rule that judges wording should skip those.
 */
export function textOf(element) {
  const parts = []
  let dynamic = false

  const walk = (node) => {
    for (const child of node.children ?? []) {
      if (child.type === "JSXText") {
        parts.push(child.value)
      } else if (child.type === "JSXExpressionContainer") {
        const expr = child.expression
        if (expr.type === "JSXEmptyExpression") continue
        if (expr.type === "Literal" && typeof expr.value === "string") {
          parts.push(expr.value)
        } else if (
          expr.type === "TemplateLiteral" &&
          expr.expressions.length === 0
        ) {
          parts.push(expr.quasis[0].value.cooked)
        } else {
          dynamic = true
        }
      } else if (child.type === "JSXElement" || child.type === "JSXFragment") {
        walk(child)
      }
    }
  }

  walk(element)
  return { text: parts.join(" ").replace(/\s+/g, " ").trim(), dynamic }
}

/**
 * Walk up from a node through its enclosing JSX elements, nearest first.
 * Yields each ancestor's `JSXElement`. Stops at a function boundary, because
 * a component defined in the same file is not nested where it is declared.
 */
export function* jsxAncestors(node) {
  let cursor = node.parent
  while (cursor) {
    if (
      cursor.type === "FunctionDeclaration" ||
      cursor.type === "FunctionExpression" ||
      cursor.type === "ArrowFunctionExpression"
    ) {
      /* An inline render prop (`render={() => …}`, `.map(row => …)`) is still
         nested where it is written, so keep climbing through those. Only a
         named component declaration ends the walk. */
      if (cursor.type === "FunctionDeclaration") return
      const holder = cursor.parent
      if (holder?.type === "VariableDeclarator") return
    }
    if (cursor.type === "JSXElement") yield cursor
    cursor = cursor.parent
  }
}

/** Every JSX element under `element`, in source order, depth first. */
export function* jsxDescendants(element) {
  for (const child of element.children ?? []) {
    if (child.type === "JSXElement") {
      yield child
      yield* jsxDescendants(child)
    } else if (child.type === "JSXFragment") {
      yield* jsxDescendants(child)
    } else if (child.type === "JSXExpressionContainer") {
      yield* jsxInExpression(child.expression)
    }
  }
}

/** JSX elements reachable inside an expression: `cond && <X/>`, `a ? <X/> : <Y/>`, `list.map(() => <X/>)`. */
function* jsxInExpression(expr) {
  if (!expr || typeof expr !== "object") return
  if (expr.type === "JSXElement") {
    yield expr
    yield* jsxDescendants(expr)
    return
  }
  if (expr.type === "JSXFragment") {
    yield* jsxDescendants(expr)
    return
  }
  for (const key of ["consequent", "alternate", "left", "right", "body"]) {
    if (expr[key]) yield* jsxInExpression(expr[key])
  }
  if (expr.type === "CallExpression") {
    for (const arg of expr.arguments) yield* jsxInExpression(arg)
  }
  if (expr.type === "BlockStatement") {
    for (const statement of expr.body) {
      if (statement.type === "ReturnStatement") {
        yield* jsxInExpression(statement.argument)
      }
    }
  }
}

const CLASS_FNS = new Set(["cn", "clsx", "classNames", "twMerge"])

/**
 * True when a `className` holds something lint cannot read — a variable, a
 * prop passed through, a helper's return value. A rule asking "is X among
 * the classes?" should not answer no when it cannot see them all.
 */
export function isOpaqueClassName(attr) {
  if (!attr?.value || attr.value.type === "Literal") return false
  let opaque = false
  const walk = (node) => {
    if (opaque || !node || typeof node !== "object") return
    if (Array.isArray(node)) return node.forEach(walk)
    if (node.type === "Identifier" || node.type === "MemberExpression") {
      opaque = true
      return
    }
    if (node.type === "CallExpression") {
      if (!CLASS_FNS.has(node.callee?.name)) {
        opaque = true
        return
      }
      return node.arguments.forEach(walk)
    }
    if (
      node.type === "LogicalExpression" ||
      node.type === "ConditionalExpression"
    ) {
      /* `open && "…"`: the test is a condition, not a class. */
      walk(node.consequent ?? node.right)
      walk(node.alternate)
      return
    }
    if (node.type === "TemplateLiteral") return node.expressions.forEach(walk)
    if (node.type === "JSXExpressionContainer") return walk(node.expression)
  }
  walk(attr.value)
  return opaque
}
