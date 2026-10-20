import { afterEach, describe, expect, it, vi } from "vitest";
import { SYNTHETIC_ASSESSMENT, SYNTHETIC_WAIS_ENTRY } from "@/data/syntheticCase";
import { assembleReport, REPORT_HEADINGS } from "@/lib/report/assembleReport";
import { buildReportContext } from "@/lib/report/buildReportContext";
import { parseReportSections } from "@/lib/report/sections";
import {
  parseReportRequest,
  reportabilityMessages,
} from "@/lib/report/parseReportRequest";
import { requestClinicalReport } from "@/lib/report/requestClinicalReport";
import { waisInputFromEntry } from "@/lib/waisEntry";
import { calculateWais3, emptyWais3Input } from "@/scoring/wais3/calculate";
import type { ReportDocument } from "@/types/reportDocument";

const workbookInput = waisInputFromEntry(
  SYNTHETIC_ASSESSMENT.info.examineeAgeYears,
  SYNTHETIC_WAIS_ENTRY,
);

function syntheticBody() {
  return {
    info: SYNTHETIC_ASSESSMENT.info,
    observations: SYNTHETIC_ASSESSMENT.observations,
    conclusions: SYNTHETIC_ASSESSMENT.conclusions,
    eek2: SYNTHETIC_ASSESSMENT.eek2,
    waisInput: workbookInput,
  };
}

describe("report generation data", () => {
  it("sends calculator results and omits data the case does not contain", () => {
    const result = calculateWais3(workbookInput);
    const context = buildReportContext({
      info: SYNTHETIC_ASSESSMENT.info,
      observations: {
        ...SYNTHETIC_ASSESSMENT.observations,
        motivation: null,
      },
      conclusions: SYNTHETIC_ASSESSMENT.conclusions,
      eek2: { ...SYNTHETIC_ASSESSMENT.eek2, insomnia: null },
      result,
    });

    expect(context.language).toBe("et");
    expect(context.notCollected).toEqual([
      "subtestSpecificObservations",
      "wisc5",
    ]);
    expect(context.eek2?.scores).toEqual(
      expect.arrayContaining([{ scale: "Depressioon", score: "14" }]),
    );
    expect(context.eek2?.scores.map((item) => item.scale)).not.toContain("Insomnia");
    expect(context.wais3.precalculated).toBe(true);
    expect(context.wais3.composites.find((item) => item.id === "fsiq")).toMatchObject({
      indexScore: "107",
      percentile: "68",
      confidenceInterval95: "102–112",
    });
    expect(context.wais3.composites.find((item) => item.id === "wmi")?.indexScore).toBe(
      "78",
    );
    expect(
      context.wais3.discrepancies.find((item) => item.comparison.includes("töömälu")),
    ).toMatchObject({
      difference: "36",
      exceedsCriticalValue: true,
      baseRatePercent: "1,2",
    });
    expect(context.wais3.personalStrengthsAndWeaknesses?.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "maatriksid", classification: "strength" }),
      ]),
    );
    expect(context.wais3.subtests.map((item) => item.scaledScore)).not.toContain("—");
    expect(context.observations.structuredRatings?.items.map((item) => item.label)).not.toContain(
      "Motiveeritus",
    );
    expect(context.observations.observedBehaviors).toEqual(["Kõhkles palju"]);
    expect(context.notProvided).not.toContain("reportedComplaints");
    expect(context.notProvided).not.toContain("structuredRatings");
  });

  it("keeps score tables independent of the model text", () => {
    const result = calculateWais3(workbookInput);
    const report = assembleReport({
      info: SYNTHETIC_ASSESSMENT.info,
      result,
      sections: {
        background: ["Taustalõik."],
        testBehavior: ["Vaatluslõik."],
        interpretation: ["Tõlgenduslõik näidis."],
        conclusions: ["Järelduslõik."],
        recommendations: ["Soovituslõik."],
      },
      eek2: { ...SYNTHETIC_ASSESSMENT.eek2, insomnia: null },
    });

    expect(report.fileBaseName).toBe("kognitiivne-aruanne-2026-10-20");
    const headings = report.blocks.flatMap((block) =>
      block.type === "heading" ? [block.runs[0]?.text] : [],
    );
    expect(headings).toEqual([
      REPORT_HEADINGS.identity,
      REPORT_HEADINGS.background,
      REPORT_HEADINGS.behavior,
      REPORT_HEADINGS.results,
      REPORT_HEADINGS.eek2,
      REPORT_HEADINGS.interpretation,
      REPORT_HEADINGS.conclusions,
      REPORT_HEADINGS.recommendations,
    ]);
    const scoreTable = report.blocks.find(
      (block) => block.type === "table" && block.headers[0] === "Indeks",
    );
    expect(scoreTable).toMatchObject({
      type: "table",
      rows: expect.arrayContaining([
        ["Üldine IQ (FSIQ)", "121", "107", "68", "102–112"],
      ]),
    });
    const prose = report.blocks.flatMap((block) =>
      block.type === "paragraph" ? [block.runs.map((run) => run.text).join("")] : [],
    );
    expect(prose).toContain("Tõlgenduslõik näidis.");
    expect(prose.join(" ")).toContain("Keelemudel skoore ei arvutanud");
    expect(prose.join(" ")).not.toContain("keelemudeli koostatud mustandiga");
    const eekTable = report.blocks.find(
      (block) => block.type === "table" && block.headers[0] === "Alaskaala",
    );
    expect(eekTable).toMatchObject({
      type: "table",
      rows: expect.arrayContaining([["Depressioon", "14"]]),
    });
    expect(
      eekTable && eekTable.type === "table"
        ? eekTable.rows.map((row) => row[0])
        : [],
    ).not.toContain("Insomnia");
  });

  it("rejects malformed input and blocks an empty score sheet", () => {
    const parsed = parseReportRequest(syntheticBody());
    expect(parsed.ok).toBe(true);

    const fractional = syntheticBody();
    fractional.waisInput = {
      ...fractional.waisInput,
      rawScores: fractional.waisInput.rawScores.map((score, index) =>
        index === 0 ? 1.5 : score,
      ),
    };
    expect(parseReportRequest(fractional).ok).toBe(false);

    const rating = syntheticBody();
    rating.observations = { ...rating.observations, anxiety: 11 };
    expect(parseReportRequest(rating).ok).toBe(false);

    const eek = syntheticBody();
    eek.eek2 = { ...eek.eek2, depression: 101 };
    expect(parseReportRequest(eek).ok).toBe(false);

    expect(reportabilityMessages(calculateWais3(emptyWais3Input()))?.[0]?.et).toMatch(
      /Vanus/,
    );
  });

  it("parses the model JSON without keeping blank paragraphs", () => {
    expect(
      parseReportSections(
        JSON.stringify({
          background: ["  Esimene lõik.  ", ""],
          testBehavior: ["Käitumine."],
          interpretation: ["Tõlgendus."],
          conclusions: ["Järeldus."],
          recommendations: ["Soovitus."],
        }),
      ).background,
    ).toEqual(["Esimene lõik."]);
  });
});

describe("requestClinicalReport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the document from a successful response", async () => {
    const report: ReportDocument = {
      title: "Pealkiri",
      fileBaseName: "aruanne",
      blocks: [{ type: "paragraph", runs: [{ text: "Tekst" }] }],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ report }),
      ),
    );
    const outcome = await requestClinicalReport({ info: {} });
    expect(outcome).toEqual({ ok: true, report });
  });
});
