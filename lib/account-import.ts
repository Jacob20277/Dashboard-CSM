import * as XLSX from "xlsx";

export interface ParsedAccountRow {
  rowNumber: number;
  accountName: string;
  csm: string;
}

const EXPECTED_HEADERS = ["account name", "csm"];

export function parseAccountSpreadsheet(buffer: ArrayBuffer): {
  rows: ParsedAccountRow[];
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

  const rows: ParsedAccountRow[] = raw.slice(1).map((row, i) => ({
    rowNumber: i + 2, // 1-indexed + header row
    accountName: String(row[colIndex("account name")] ?? "").trim(),
    csm: String(row[colIndex("csm")] ?? "").trim(),
  }));

  return { rows: rows.filter((r) => r.accountName) };
}
