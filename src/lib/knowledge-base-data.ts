/**
 * KB Experience Upgrade — the knowledge base as a tool, not prompt text.
 *
 * The whole point of V1 is that the agent stops carrying this content on every
 * turn and fetches it only when it needs it. Two things follow from that, and
 * both are on this screen:
 *
 *   Sources — a knowledge base is now built from documents. Text is pulled out
 *             of each one at upload, once, so a document has a state before it
 *             is usable rather than being instantly live the way pasted text was.
 *   Summary — with the content out of the prompt, the only thing left in the
 *             prompt is a description of what this knowledge base covers. That
 *             is what tells the agent the tool exists and when it applies, so
 *             it is a field a client writes, not a detail under the hood.
 *
 * Folders are deliberately absent: the PRD puts organising and navigating a
 * large corpus in V2.
 */

/** What V1 can pull text out of. Everything else is V2. */
export type SourceKind = "pdf" | "docx" | "txt" | "markdown" | "url" | "text"

export const SOURCE_LABELS: Record<SourceKind, string> = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  markdown: "Markdown",
  url: "URL",
  text: "Text",
}

/**
 * Extraction happens once, on upload, and it can fail — a scanned PDF is
 * images, so there is no text V1 can read. So a document is not simply present
 * or absent; it is on its way, usable, or stuck.
 */
export type SourceStatus = "ready" | "extracting" | "failed"

export type Source = {
  id: string
  name: string
  kind: SourceKind
  /** On a URL source, the address behind the title. Nothing else has one. */
  url?: string
  status: SourceStatus
  /** The original is kept whatever happens to the extraction. */
  size: string
  addedBy: string
  addedAt: string
  /** Only on a failure — says why the text could not be pulled out. */
  problem?: string
  /** Pasted text keeps its content, so a row can show what was actually saved. */
  body?: string
}

/**
 * Did this arrive as an uploaded document?
 *
 * A URL and a pasted note have no original file behind them, so there is
 * nothing to hand back — only these can be downloaded again.
 */
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
  /**
   * Up to ten sentences. This is the only part of the knowledge base that
   * still sits in the agent's prompt.
   */
  summary:
    "Covers instalment plans, how a customer settles an overdue balance, and what counts as a hardship case. Includes the current late-fee schedule and the wording the team uses when a payment date is promised. Use it for anything about balances, payment dates, or fees.",
}

/** One that has just been created — no summary, nothing in it. */
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

/* -------------------------------------------------------------------------
   The index of knowledge bases.

   The page already exists; what changes is that a knowledge base is now made
   of documents, so a row can say how much is in it.
------------------------------------------------------------------------- */

export type KnowledgeBaseRow = {
  id: string
  name: string
  /** Null until something has been added — a fresh KB is genuinely empty. */
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

/** Sentences the client has written, against the ten the prompt will carry. */
export function sentenceCount(summary: string): number {
  return summary.split(/[.!?]+\s|[.!?]+$/).filter((part) => part.trim()).length
}

export const SUMMARY_SENTENCE_LIMIT = 10

/** What a picked file arrives as, before anything has been pulled out of it. */
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
