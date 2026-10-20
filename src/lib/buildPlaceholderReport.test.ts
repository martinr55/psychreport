import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { EMPTY_ASSESSMENT } from "@/data/emptyAssessment";
import { SYNTHETIC_ASSESSMENT, SYNTHETIC_WAIS_ENTRY } from "@/data/syntheticCase";
import { MESSAGES } from "@/i18n/messages";
import { buildPlaceholderReport } from "@/lib/buildPlaceholderReport";
import { assembleReport } from "@/lib/report/assembleReport";
import { waisInputFromEntry } from "@/lib/waisEntry";
import { calculateWais3 } from "@/scoring/wais3/calculate";
import { createReportDocxBlob } from "@/lib/export/downloadReportDocx";
import { createReportPdfBlob } from "@/lib/export/downloadReportPdf";

const originalFetch = globalThis.fetch;

globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = String(input);
  const relative = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relative);
  const buffer = readFileSync(filePath);
  return new Response(buffer, {
    status: 200,
    headers: { "Content-Type": "font/ttf" },
  });
}) as typeof fetch;

describe("buildPlaceholderReport", () => {
  it("builds a structured document with headings, tables, and emphasis", () => {
    const report = buildPlaceholderReport(
      {
        ...EMPTY_ASSESSMENT,
        info: {
          ...EMPTY_ASSESSMENT.info,
          examineeName: "Test Examinee",
          examineeAgeYears: 50,
          assessmentDate: "2026-10-20",
          clinicianName: "Dr Example",
          referrer: "Family doctor",
          education: "secondary",
          referralQuestion: "Memory concerns.",
          psychosocialBackground: "Lives independently.",
          copingDifficulties: "Forgetfulness at work.",
        },
        conclusions: {
          referralOpinion: "Findings are consistent.",
          recommendations: "Follow-up in six months.",
        },
      },
      "en",
      MESSAGES.en,
    );

    expect(report.title).toBe("WAIS-III Cognitive Report");
    expect(report.fileBaseName).toBe("cognitive-report-2026-10-20");
    expect(
      report.blocks.filter((block) => block.type === "heading").length,
    ).toBeGreaterThanOrEqual(8);
    const tables = report.blocks.filter((block) => block.type === "table");
    expect(tables).toHaveLength(3);
    expect(tables[0]?.headers).toEqual(["Field", "Value"]);
    expect(tables[0]?.rows[0]).toEqual(["Examinee", "Test Examinee"]);
    expect(tables[0]?.rows).toContainEqual(["Referrer", "Family doctor"]);
    expect(tables[0]?.rows).toContainEqual(["Education", "Secondary education"]);
  });

  it("creates an OOXML document blob locally", async () => {
    const report = buildPlaceholderReport(EMPTY_ASSESSMENT, "et", MESSAGES.et);
    const blob = await createReportDocxBlob(report);
    expect(blob.size).toBeGreaterThan(2000);
    const header = await blob.slice(0, 2).text();
    expect(header).toBe("PK");
  });

  it("creates a DOCX blob from a calculator-backed report", async () => {
    const report = assembleReport({
      info: SYNTHETIC_ASSESSMENT.info,
      result: calculateWais3(
        waisInputFromEntry(
          SYNTHETIC_ASSESSMENT.info.examineeAgeYears,
          SYNTHETIC_WAIS_ENTRY,
        ),
      ),
      sections: {
        background: ["Taust."],
        testBehavior: ["Käitumine."],
        interpretation: ["Tõlgendus."],
        conclusions: ["Järeldus."],
        recommendations: ["Soovitus."],
      },
      eek2: SYNTHETIC_ASSESSMENT.eek2,
    });
    const blob = await createReportDocxBlob(report);
    expect(blob.size).toBeGreaterThan(2000);
    const header = await blob.slice(0, 2).text();
    expect(header).toBe("PK");
  });

  it("creates a PDF blob locally with embedded fonts", async () => {
    const report = buildPlaceholderReport(EMPTY_ASSESSMENT, "et", MESSAGES.et);
    const blob = await createReportPdfBlob(report);
    expect(blob.size).toBeGreaterThan(5000);
    const header = await blob.slice(0, 5).text();
    expect(header.startsWith("%PDF-")).toBe(true);
  });
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});
