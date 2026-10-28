// Structural rules key off names imported from `@/components/ui/*`, never the bare JSX name:
// a mockup may define its own `Button`.

import { collectStrings, parseClasses } from "./classes.mjs"

const UI_SOURCE = /^@\/components\/ui\//

/** `ui(name)` maps a local JSX name to the primitive it was imported as, or null. */
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

export function getAttr(opening, name) {
  return opening.attributes.find(
    (attr) => attr.type === "JSXAttribute" && attr.name?.name === name,
  )
}

export function hasSpread(opening) {
  return opening.attributes.some((attr) => attr.type === "JSXSpreadAttribute")
}

/** A plain-string attribute value, or null when it is computed. */
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

export function classesOf(opening) {
  const attr = getAttr(opening, "className")
  if (!attr) return []
  return collectStrings(attr.value).flatMap((entry) =>
    parseClasses(entry.value).map((cls) => ({ ...cls, node: entry.node })),
  )
}

/** Text of an element and its descendants; `dynamic` is true when any part is computed. */
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

export function* jsxAncestors(node) {
  let cursor = node.parent
  while (cursor) {
    if (
      cursor.type === "FunctionDeclaration" ||
      cursor.type === "FunctionExpression" ||
      cursor.type === "ArrowFunctionExpression"
    ) {
      /* Inline render props are still nested where written; only a named component declaration ends the walk. */
      if (cursor.type === "FunctionDeclaration") return
      const holder = cursor.parent
      if (holder?.type === "VariableDeclarator") return
    }
    if (cursor.type === "JSXElement") yield cursor
    cursor = cursor.parent
  }
}

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

/** True when a `className` holds something lint cannot read, so a rule must not answer "absent". */
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
