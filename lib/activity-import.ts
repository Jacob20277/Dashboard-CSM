import * as XLSX from "xlsx";

export interface ParsedImportRow {
  rowNumber: number;
  title: string;
  member: string;
  account: string;
  date: string;
  notes: string;
  duration: string;
  kpiTags: string;
}

const EXPECTED_HEADERS = ["title", "member", "account", "date", "notes", "duration (min)", "kpi tags"];

export function parseSpreadsheet(buffer: ArrayBuffer): {
  rows: ParsedImportRow[];
  headerError?: string;
} {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (raw.length === 0) {
    return { rows: [], headerError: "The file is empty." };
  }

  const header = raw[0].map((h) => String(h).trim().toLowerCase());
  const missing = EXPECTED_HEADERS.filter((h) => !header.includes(h));
  if (missing.length > 0) {
    return {
      rows: [],
      headerError: `Missing column(s): ${missing.join(", ")}. Expected: ${EXPECTED_HEADERS.join(", ")}`,
    };
  }

  const colIndex = (name: string) => header.indexOf(name);

  const rows: ParsedImportRow[] = raw.slice(1).map((row, i) => ({
    rowNumber: i + 2, // 1-indexed + header row
    title: String(row[colIndex("title")] ?? "").trim(),
    member: String(row[colIndex("member")] ?? "").trim(),
    account: String(row[colIndex("account")] ?? "").trim(),
    date: excelCellToDateString(row[colIndex("date")]),
    notes: String(row[colIndex("notes")] ?? "").trim(),
    duration: String(row[colIndex("duration (min)")] ?? "").trim(),
    kpiTags: String(row[colIndex("kpi tags")] ?? "").trim(),
  }));

  return { rows: rows.filter((r) => r.title || r.member || r.account || r.date) };
}

function excelCellToDateString(cell: unknown): string {
  if (typeof cell === "number") {
    const parsed = XLSX.SSF.parse_date_code(cell);
    if (!parsed) return "";
    const mm = String(parsed.m).padStart(2, "0");
    const dd = String(parsed.d).padStart(2, "0");
    return `${parsed.y}-${mm}-${dd}`;
  }
  return String(cell ?? "").trim();
}
