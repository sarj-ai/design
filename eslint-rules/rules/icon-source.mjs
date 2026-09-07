/**
 * Icons in authored UI come from HugeIcons. One set, one weight, one grid.
 *
 * Mixing icon libraries is the fastest way to make a design system look
 * assembled rather than built: stroke weights disagree, optical sizes disagree,
 * and the corner radius of a "settings" gear stops matching the corner radius
 * of everything around it. The tell is subtle per-icon and obvious per-screen.
 *
 * src/components/ui is exempt on purpose. Those files are generated — every
 * `npx shadcn@latest add <name>` writes lucide imports back in, so policing
 * them would mean re-patching the primitives forever for no visual gain.
 */

const BANNED = {
  "lucide-react":
    "lucide-react is the shadcn default and stays inside src/components/ui",
  "@tabler/icons-react":
    "@tabler/icons-react is not part of this design system",
  "react-icons": "react-icons is not part of this design system",
  "@heroicons/react": "@heroicons/react is not part of this design system",
  "@radix-ui/react-icons":
    "@radix-ui/react-icons is not part of this design system",
}

const iconSource = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Authored UI uses HugeIcons; lucide stays inside the generated shadcn primitives.",
    },
    schema: [],
    messages: {
      bannedIconLibrary:
        '{{reason}}. Use HugeIcons here:\n\n  import { HugeiconsIcon } from "@hugeicons/react"\n  import { Settings01Icon } from "@hugeicons/core-free-icons"\n\n  <HugeiconsIcon icon={Settings01Icon} />\n\nSee src/components/transfer-routing/icons.tsx for the pattern used in this repo.',
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const reason = BANNED[node.source.value]
        if (!reason) return
        context.report({
          node: node.source,
          messageId: "bannedIconLibrary",
          data: { reason },
        })
      },
    }
  },
}

export default iconSource
