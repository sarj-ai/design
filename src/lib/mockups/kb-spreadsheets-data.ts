import {
  SOURCES as BASE_SOURCES,
  type Source as BaseSource,
  type SourceKind as BaseKind,
} from "@/lib/mockups/knowledge-base-data";

export type { SourceStatus } from "@/lib/mockups/knowledge-base-data";

export type SourceKind = BaseKind | "xlsx" | "csv";

export const SOURCE_LABELS: Record<SourceKind, string> = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  markdown: "Markdown",
  url: "URL",
  text: "Text",
  xlsx: "XLSX",
  csv: "CSV",
};

export const SOURCE_KINDS: readonly SourceKind[] = [
  "pdf",
  "docx",
  "txt",
  "markdown",
  "url",
  "text",
  "xlsx",
  "csv",
];

export interface Sheet {
  columns: string[];
  rows: string[][];
}

export type Source = Omit<BaseSource, "kind"> & {
  kind: SourceKind;
  sheet?: Sheet;
  tokens?: number;
};

export const TOKEN_LIMIT = 20_000;
export const TOKEN_WARNING = 15_000;
export const SPREADSHEET_MAX_BYTES = 1024 * 1024;

export function isSpreadsheet(kind: SourceKind): boolean {
  return kind === "xlsx" || kind === "csv";
}

export function isFileSource(kind: SourceKind): boolean {
  return kind !== "url" && kind !== "text";
}

export function formatTokens(tokens: number): string {
  return tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : String(tokens);
}

export function sheetTokens(sheet: Sheet): number {
  const cells = [sheet.columns, ...sheet.rows].flat();
  const characters = cells.reduce((sum, cell) => sum + cell.length, 0);
  return Math.round(characters / 4 + cells.length * 1.5);
}

const BRANCHES: Sheet = {
  columns: ["Branch", "City", "Address", "Opening hours", "Phone"],
  rows: [
    [
      "Olaya",
      "Riyadh",
      "Olaya St, Al Olaya",
      "Sun–Thu 8:00–16:00",
      "011 210 4400",
    ],
    [
      "King Fahd Road",
      "Riyadh",
      "King Fahd Rd, Al Muruj",
      "Sun–Thu 8:00–16:00",
      "011 210 4410",
    ],
    [
      "Al Malqa",
      "Riyadh",
      "Anas Ibn Malik Rd, Al Malqa",
      "Sun–Thu 9:00–17:00",
      "011 210 4420",
    ],
    [
      "Tahlia",
      "Jeddah",
      "Prince Mohammed Bin Abdulaziz St",
      "Sun–Thu 8:00–16:00",
      "012 660 3100",
    ],
    [
      "Al Rawdah",
      "Jeddah",
      "Al Rawdah St, Al Khalidiyyah",
      "Sun–Thu 9:00–17:00",
      "012 660 3110",
    ],
    [
      "Corniche",
      "Dammam",
      "King Saud St, Al Shati",
      "Sun–Thu 8:00–16:00",
      "013 840 2200",
    ],
    [
      "Al Khobar Centre",
      "Al Khobar",
      "Prince Turki St, Al Yarmouk",
      "Sun–Thu 8:00–16:00",
      "013 840 2210",
    ],
    [
      "Al Aziziyah",
      "Makkah",
      "Third Ring Rd, Al Aziziyah",
      "Sat–Thu 8:00–16:00",
      "012 540 1800",
    ],
    [
      "Quba",
      "Madinah",
      "Quba Rd, Al Qiblatain",
      "Sun–Thu 8:00–16:00",
      "014 830 1500",
    ],
    [
      "Al Hamra",
      "Abha",
      "King Khalid Rd, Al Mansak",
      "Sun–Thu 8:00–15:00",
      "017 220 9100",
    ],
    [
      "Buraydah",
      "Qassim",
      "King Abdulaziz Rd, Al Rayyan",
      "Sun–Thu 8:00–15:00",
      "016 320 7700",
    ],
    [
      "Tabuk",
      "Tabuk",
      "Prince Fahd Bin Sultan Rd",
      "Sun–Thu 8:00–15:00",
      "014 420 6600",
    ],
  ],
};

const FEES: Sheet = {
  columns: ["Days overdue", "Fee (SAR)", "Can be waived", "Notes"],
  rows: [
    ["1–15", "0", "—", "Grace period. Remind, don't charge."],
    ["16–30", "50", "Yes", "Waive once per customer per year."],
    ["31–60", "100", "Yes", "Waive only with an agreed payment date."],
    ["61–90", "150", "Team lead", "Offer an instalment plan first."],
    ["91+", "200", "No", "Account moves to the recoveries team."],
  ],
};

const NOTES: readonly string[] = [
  "Standard plan.",
  "Needs a salary certificate.",
  "Offer only after the first missed payment.",
  "Team lead approves a deposit under the minimum.",
];

const RATES: Sheet = {
  columns: [
    "Balance from (SAR)",
    "Balance to (SAR)",
    "Months",
    "Monthly rate",
    "Minimum deposit",
    "Notes",
  ],
  rows: Array.from({ length: 212 }, (_, index) => {
    const from = 1000 + index * 500;
    const months = Math.min(36, 3 + Math.floor(index / 6));
    return [
      from.toLocaleString("en-US"),
      (from + 499).toLocaleString("en-US"),
      String(months),
      `${(0.9 + (index % 7) * 0.1).toFixed(1)}%`,
      `${String(10 + (index % 4) * 5)}%`,
      NOTES[index % NOTES.length] ?? "",
    ];
  }),
};

export const SPREADSHEETS: readonly Source[] = [
  {
    id: "src-xlsx-1",
    name: "Branch locations.xlsx",
    kind: "xlsx",
    status: "ready",
    size: "38 KB",
    addedBy: "malmasoudi@sarj.ai",
    addedAt: "Nov 10, 2026",
    sheet: BRANCHES,
    tokens: 640,
  },
  {
    id: "src-csv-1",
    name: "Late fee schedule.csv",
    kind: "csv",
    status: "ready",
    size: "2 KB",
    addedBy: "talzamel@sarj.ai",
    addedAt: "Nov 9, 2026",
    sheet: FEES,
    tokens: 310,
  },
  {
    id: "src-xlsx-2",
    name: "Instalment plan rates.xlsx",
    kind: "xlsx",
    status: "ready",
    size: "412 KB",
    addedBy: "fjanahi@sarj.ai",
    addedAt: "Nov 8, 2026",
    sheet: RATES,
    tokens: 16_210,
  },
  {
    id: "src-xlsx-3",
    name: "Collections targets 2026.xlsx",
    kind: "xlsx",
    status: "failed",
    size: "96 KB",
    addedBy: "talzamel@sarj.ai",
    addedAt: "Nov 8, 2026",
    problem: "This file has 3 sheets. Upload one sheet per file",
  },
  {
    id: "src-csv-2",
    name: "Customer FAQ export.csv",
    kind: "csv",
    status: "failed",
    size: "880 KB",
    addedBy: "malmasoudi@sarj.ai",
    addedAt: "Nov 7, 2026",
    problem:
      "About 26.4k tokens, over the 20k limit. Split it into smaller files",
  },
];

export const SOURCES: readonly Source[] = [...SPREADSHEETS, ...BASE_SOURCES];

const UPLOAD_KINDS: Readonly<Record<string, SourceKind>> = {
  xlsx: "xlsx",
  csv: "csv",
  docx: "docx",
  txt: "txt",
  md: "markdown",
};

export function pendingSource(id: string, name: string, size: string): Source {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";

  return {
    id,
    name,
    kind: UPLOAD_KINDS[extension] ?? "pdf",
    status: "extracting",
    size,
    addedBy: "talzamel@sarj.ai",
    addedAt: "Just now",
  };
}

export function parsedSheet(): { sheet: Sheet; tokens: number } {
  return { sheet: BRANCHES, tokens: sheetTokens(BRANCHES) };
}
