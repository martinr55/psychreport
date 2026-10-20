import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { downloadBlob } from "@/lib/export/downloadBlob";
import { loadReportFonts } from "@/lib/export/loadReportFonts";
import type { ReportDocument, ReportTextRun } from "@/types/reportDocument";

const FONT = "LiberationSerif";
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 18;
const MARGIN_TOP = 18;
const MARGIN_BOTTOM = 22;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const NAVY: [number, number, number] = [17, 94, 89];
const BODY: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [100, 116, 139];

type FontStyle = "normal" | "bold" | "italic" | "bolditalic";

function runStyle(run: ReportTextRun): FontStyle {
  if (run.bold && run.italic) {
    return "bolditalic";
  }
  if (run.bold) {
    return "bold";
  }
  if (run.italic) {
    return "italic";
  }
  return "normal";
}

function lastTableY(doc: jsPDF, fallback: number): number {
  const table = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable;
  return table?.finalY ?? fallback;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage();
    return MARGIN_TOP;
  }
  return y;
}

interface Segment {
  text: string;
  style: FontStyle;
}

function wrapRichText(
  doc: jsPDF,
  runs: ReportTextRun[],
  fontSize: number,
  maxWidth: number,
): Segment[][] {
  const tokens: Segment[] = [];
  for (const run of runs) {
    const style = runStyle(run);
    const parts = run.text.split(/(\n)/);
    for (const part of parts) {
      if (part === "\n") {
        tokens.push({ text: "\n", style });
        continue;
      }
      const words = part.split(/(\s+)/).filter((item) => item !== "");
      for (const word of words) {
        tokens.push({ text: word, style });
      }
    }
  }

  const lines: Segment[][] = [[]];
  let currentWidth = 0;

  const measure = (text: string, style: FontStyle) => {
    doc.setFont(FONT, style);
    doc.setFontSize(fontSize);
    return doc.getTextWidth(text);
  };

  for (const token of tokens) {
    if (token.text === "\n") {
      lines.push([]);
      currentWidth = 0;
      continue;
    }
    const width = measure(token.text, token.style);
    const line = lines[lines.length - 1];
    if (line.length > 0 && currentWidth + width > maxWidth) {
      lines.push([{ ...token }]);
      currentWidth = width;
      continue;
    }
    line.push(token);
    currentWidth += width;
  }

  return lines.filter((line, index) => line.length > 0 || index === 0);
}

function drawRichLines(
  doc: jsPDF,
  lines: Segment[][],
  startY: number,
  fontSize: number,
  lineHeight: number,
  color: [number, number, number],
): number {
  let y = startY;
  doc.setTextColor(...color);
  doc.setFontSize(fontSize);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    let x = MARGIN_X;
    for (const segment of line) {
      doc.setFont(FONT, segment.style);
      doc.text(segment.text, x, y);
      x += doc.getTextWidth(segment.text);
    }
    y += lineHeight;
  }
  return y;
}

export async function createReportPdfBlob(report: ReportDocument): Promise<Blob> {
  const fonts = await loadReportFonts();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("LiberationSerif-Regular.ttf", fonts.normal);
  doc.addFont("LiberationSerif-Regular.ttf", FONT, "normal");
  doc.addFileToVFS("LiberationSerif-Bold.ttf", fonts.bold);
  doc.addFont("LiberationSerif-Bold.ttf", FONT, "bold");
  doc.addFileToVFS("LiberationSerif-Italic.ttf", fonts.italic);
  doc.addFont("LiberationSerif-Italic.ttf", FONT, "italic");
  doc.addFileToVFS("LiberationSerif-BoldItalic.ttf", fonts.bolditalic);
  doc.addFont("LiberationSerif-BoldItalic.ttf", FONT, "bolditalic");
  doc.setFont(FONT, "normal");

  let y = MARGIN_TOP + 4;

  for (const block of report.blocks) {
    if (block.type === "title") {
      const lines = wrapRichText(doc, block.runs, 18, CONTENT_WIDTH);
      y = drawRichLines(doc, lines, y, 18, 8, NAVY);
      y += 4;
      continue;
    }
    if (block.type === "heading") {
      y += 4;
      const lines = wrapRichText(doc, block.runs, 13, CONTENT_WIDTH);
      y = drawRichLines(doc, lines, y, 13, 7, NAVY);
      y += 2;
      continue;
    }
    if (block.type === "paragraph") {
      const lines = wrapRichText(doc, block.runs, 11, CONTENT_WIDTH);
      y = drawRichLines(doc, lines, y, 11, 6, BODY);
      y += 2;
      continue;
    }

    y = ensureSpace(doc, y, 24);
    autoTable(doc, {
      startY: y,
      head: [block.headers],
      body: block.rows,
      margin: { left: MARGIN_X, right: MARGIN_X, bottom: MARGIN_BOTTOM },
      styles: {
        font: FONT,
        fontStyle: "normal",
        fontSize: 10,
        textColor: BODY,
        cellPadding: 2.2,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: NAVY,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.2,
    });
    y = lastTableY(doc, y) + 6;
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont(FONT, "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(
      `${report.title}  ·  ${page}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 10,
      { align: "center" },
    );
  }

  return doc.output("blob");
}

export async function downloadReportPdf(report: ReportDocument): Promise<void> {
  const blob = await createReportPdfBlob(report);
  downloadBlob(blob, `${report.fileBaseName}.pdf`);
}
