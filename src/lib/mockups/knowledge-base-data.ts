export type SourceKind = "pdf" | "docx" | "txt" | "markdown" | "url" | "text"

export const SOURCE_LABELS: Record<SourceKind, string> = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  markdown: "Markdown",
  url: "URL",
  text: "Text",
}

export type SourceStatus = "ready" | "extracting" | "failed"

export type Source = {
  id: string
  name: string
  kind: SourceKind
  url?: string
  status: SourceStatus
  size: string
  addedBy: string
  addedAt: string
  problem?: string
  body?: string
}

export function isFileSource(kind: SourceKind): boolean {
  return kind !== "url" && kind !== "text"
}

/** Rows store the address without a scheme; a link still needs one. */
export function sourceHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export const KNOWLEDGE_BASE = {
  name: "Quara Collections Handbook",
  updatedAt: "Jul 20, 2026, 5:00 PM",
  updatedBy: "talzamel@sarj.ai",
  summary:
    "Covers instalment plans, how a customer settles an overdue balance, and what counts as a hardship case. Includes the current late-fee schedule and the wording the team uses when a payment date is promised. Use it for anything about balances, payment dates, or fees.",
}

export const NEW_KNOWLEDGE_BASE = {
  name: "Untitled Knowledge Base",
  updatedAt: "just now",
  updatedBy: "talzamel@sarj.ai",
  summary: "",
}

export const SOURCES: Source[] = [
  {
    id: "src-1",
    name: "Collections policy 2026.pdf",
    kind: "pdf",
    status: "ready",
    size: "1.2 MB",
    addedBy: "talzamel@sarj.ai",
    addedAt: "Jul 20, 2026",
  },
  {
    id: "src-2",
    name: "Instalment plans and hardship cases.docx",
    kind: "docx",
    status: "ready",
    size: "284 KB",
    addedBy: "malmasoudi@sarj.ai",
    addedAt: "Jul 18, 2026",
  },
  {
    id: "src-3",
    name: "Late payment fees",
    kind: "url",
    url: "sarj.ai/help/late-payment-fees",
    status: "ready",
    size: "—",
    addedBy: "malmasoudi@sarj.ai",
    addedAt: "Jul 18, 2026",
  },
  {
    id: "src-4",
    name: "Escalation wording",
    kind: "text",
    status: "ready",
    size: "—",
    addedBy: "fjanahi@sarj.ai",
    addedAt: "Jul 15, 2026",
    body: "If the customer disputes the balance, do not argue the figure. Say the account will be reviewed and a colleague will call back within two working days.\n\nIf the customer says they have already paid, ask for the payment date and the last four digits of the account it came from, then log it and close the call politely.\n\nNever threaten legal action, and never name a third party the customer has not mentioned first.",
  },
  {
    id: "src-5",
    name: "Branch procedures.pdf",
    kind: "pdf",
    status: "extracting",
    size: "4.8 MB",
    addedBy: "talzamel@sarj.ai",
    addedAt: "Jul 20, 2026",
  },
  {
    id: "src-7",
    name: "Signed agreement scan.pdf",
    kind: "pdf",
    status: "failed",
    size: "2.1 MB",
    addedBy: "fjanahi@sarj.ai",
    addedAt: "Jul 14, 2026",
    problem: "This PDF is scanned images, so there is no text to pull out",
  },
]

export type KnowledgeBaseRow = {
  id: string
  name: string
  documents: number | null
  created: string
  updatedAt: string
  updatedBy: string
}

export const KNOWLEDGE_BASES: KnowledgeBaseRow[] = [
  {
    id: "kb-1",
    name: "Quara Collections Handbook",
    documents: 6,
    created: "Jun 2, 2026",
    updatedAt: "Jul 20, 2026",
    updatedBy: "talzamel@sarj.ai",
  },
  {
    id: "kb-2",
    name: "ZATCA",
    documents: 5,
    created: "Jun 2, 2026",
    updatedAt: "Jun 20, 2026",
    updatedBy: "malmasoudi@sarj.ai",
  },
  {
    id: "kb-3",
    name: "NHC",
    documents: 5,
    created: "May 30, 2026",
    updatedAt: "Jun 18, 2026",
    updatedBy: "malmasoudi@sarj.ai",
  },
  {
    id: "kb-4",
    name: "Saudi Energy",
    documents: 12,
    created: "May 18, 2026",
    updatedAt: "Jun 15, 2026",
    updatedBy: "malmasoudi@sarj.ai",
  },
  {
    id: "kb-5",
    name: "Ministry of Tourism",
    documents: 3,
    created: "May 17, 2026",
    updatedAt: "May 17, 2026",
    updatedBy: "galhabib@sarj.ai",
  },
  {
    id: "kb-6",
    name: "Untitled Knowledge Base",
    documents: null,
    created: "Jul 20, 2026",
    updatedAt: "Jul 20, 2026",
    updatedBy: "talzamel@sarj.ai",
  },
]

export function sentenceCount(summary: string): number {
  return summary.split(/[.!?]+\s|[.!?]+$/).filter((part) => part.trim()).length
}

export const SUMMARY_SENTENCE_LIMIT = 10

export function pendingSource(id: string, name: string, size: string): Source {
  const extension = name.split(".").pop()?.toLowerCase() ?? ""
  const kind: SourceKind =
    extension === "docx"
      ? "docx"
      : extension === "txt"
        ? "txt"
        : extension === "md"
          ? "markdown"
          : "pdf"

  return {
    id,
    name,
    kind,
    status: "extracting",
    size,
    addedBy: "talzamel@sarj.ai",
    addedAt: "Just now",
  }
}
