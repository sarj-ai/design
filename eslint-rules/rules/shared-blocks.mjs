/**
 * Where a shared block exists, the primitive under it is not the answer.
 *
 * `@/components/ui/pagination` draws page numbers. The design system's lists
 * page by cursor — First, Previous, Next and a page size, under the table —
 * because a jump-to-page control over a list that is being written to is a
 * promise the data cannot keep. That footer is `ListFooter`, already built.
 */

const REPLACED = {
  "@/components/ui/pagination":
    "Lists page by cursor, not by number. Use `ListFooter` from @/components/shared/list-footer — “1–10 of 12” at the start, the page size and First / Previous / Next at the end.",
}

const sharedBlocks = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Use the shared block (ListFooter) instead of the primitive it replaces (ui/pagination).",
    },
    schema: [],
    messages: {
      replaced: "{{why}}",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const why = REPLACED[node.source.value]
        if (why)
          context.report({
            node: node.source,
            messageId: "replaced",
            data: { why },
          })
      },
    }
  },
}

export default sharedBlocks
