export interface ReportTextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export type ReportBlock =
  | { type: "title"; runs: ReportTextRun[] }
  | { type: "heading"; runs: ReportTextRun[] }
  | { type: "paragraph"; runs: ReportTextRun[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface ReportDocument {
  title: string;
  fileBaseName: string;
  blocks: ReportBlock[];
}

export function reportPlainText(runs: ReportTextRun[]): string {
  return runs.map((run) => run.text).join("");
}

export function paragraphBlocksFromText(text: string): ReportBlock[] {
  const chunks = text
    .split(/\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (chunks.length === 0) {
    return [];
  }
  return chunks.map((chunk) => ({
    type: "paragraph" as const,
    runs: [{ text: chunk }],
  }));
}
