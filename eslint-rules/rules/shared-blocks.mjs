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
