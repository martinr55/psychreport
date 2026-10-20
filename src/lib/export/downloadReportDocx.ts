import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  convertMillimetersToTwip,
} from "docx";
import { downloadBlob } from "@/lib/export/downloadBlob";
import {
  reportPlainText,
  type ReportBlock,
  type ReportDocument,
  type ReportTextRun,
} from "@/types/reportDocument";

const FONT = "Times New Roman";
const NAVY = "115E59";
const HEADER_TEXT = "FFFFFF";
const BORDER_COLOR = "CBD5E1";
const MUTED = "64748B";

const cellBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: BORDER_COLOR,
};

const tableBorders = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
  insideHorizontal: cellBorder,
  insideVertical: cellBorder,
};

function runsToText(
  runs: ReportTextRun[],
  extras?: { size?: number; color?: string },
): TextRun[] {
  return runs.map(
    (run) =>
      new TextRun({
        text: run.text,
        bold: run.bold,
        italics: run.italic,
        font: FONT,
        size: extras?.size ?? 22,
        color: extras?.color,
      }),
  );
}

function tableCell(text: string, header: boolean, widthPct: number): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: header
      ? { type: ShadingType.CLEAR, fill: NAVY }
      : { type: ShadingType.CLEAR, fill: "FFFFFF" },
    margins: {
      top: convertMillimetersToTwip(1.6),
      bottom: convertMillimetersToTwip(1.6),
      left: convertMillimetersToTwip(2.5),
      right: convertMillimetersToTwip(2.5),
    },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: header,
            font: FONT,
            size: header ? 20 : 21,
            color: header ? HEADER_TEXT : "0F172A",
          }),
        ],
      }),
    ],
  });
}

function blockToDocx(block: ReportBlock): Paragraph | Table {
  switch (block.type) {
    case "title":
      return new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { after: 240 },
        children: runsToText(block.runs, { size: 36, color: NAVY }),
      });
    case "heading":
      return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 280, after: 120 },
        children: runsToText(block.runs, { size: 26, color: NAVY }),
      });
    case "paragraph":
      return new Paragraph({
        spacing: { after: 160 },
        children: runsToText(block.runs),
      });
    case "table": {
      const columnCount = Math.max(block.headers.length, 1);
      const widthPct = Math.floor(100 / columnCount);
      const headerRow = new TableRow({
        tableHeader: true,
        children: block.headers.map((header) =>
          tableCell(header, true, widthPct),
        ),
      });
      const bodyRows = block.rows.map(
        (row) =>
          new TableRow({
            children: row.map((cell) => tableCell(cell, false, widthPct)),
          }),
      );
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorders,
        rows: [headerRow, ...bodyRows],
      });
    }
  }
}

export async function createReportDocxBlob(
  report: ReportDocument,
): Promise<Blob> {
  const children = report.blocks.flatMap((block) => {
    const item = blockToDocx(block);
    if (block.type === "table") {
      return [
        item,
        new Paragraph({ text: "", spacing: { after: 160 } }),
      ];
    }
    return [item];
  });

  const document = new Document({
    creator: "Cognitive Report App",
    title: report.title,
    description: reportPlainText(report.blocks[0]?.type === "title" ? report.blocks[0].runs : [{ text: report.title }]),
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(18),
              bottom: convertMillimetersToTwip(18),
              left: convertMillimetersToTwip(20),
              right: convertMillimetersToTwip(20),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${report.title}  ·  `,
                    font: FONT,
                    size: 16,
                    color: MUTED,
                    italics: true,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT,
                    size: 16,
                    color: MUTED,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}

export async function downloadReportDocx(report: ReportDocument): Promise<void> {
  const blob = await createReportDocxBlob(report);
  downloadBlob(blob, `${report.fileBaseName}.docx`);
}
