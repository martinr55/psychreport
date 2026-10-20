import { formatAssessmentDate } from "@/lib/report/formatNumber";
import type { ReportSections } from "@/lib/report/sections";
import {
  compositeFacts,
  digitSpanFacts,
  discrepancyFacts,
  strengthProfile,
  subtestFacts,
  type DigitSpanFacts,
  type StrengthProfile,
} from "@/lib/report/waisFacts";
import { enteredEek2Scores } from "@/data/eek2Scales";
import { educationLabel } from "@/data/educationLevels";
import type { AssessmentInfo, Eek2Scores } from "@/types/assessment";
import {
  paragraphBlocksFromText,
  type ReportBlock,
  type ReportDocument,
} from "@/types/reportDocument";
import type { Wais3Result } from "@/scoring/wais3/types";

export const REPORT_TITLE = "Kognitiivse hindamise aruanne";

export const REPORT_HEADINGS = {
  identity: "Üldandmed",
  background: "Taust ja suunamine",
  behavior: "Testikäitumine",
  results: "Kognitiivsed tulemused",
  eek2: "EEK-2",
  interpretation: "Tõlgendus",
  conclusions: "Järeldused",
  recommendations: "Soovitused",
} as const;

const SECTION_FALLBACK: Record<keyof ReportSections, string> = {
  background: "Taustaandmeid ei ole sisestatud.",
  testBehavior: "Testikäitumist ei ole kirjeldatud.",
  interpretation: "Tõlgendust ei õnnestunud koostada.",
  conclusions: "Järeldusi ei ole sisestatud.",
  recommendations: "Soovitusi ei ole sisestatud.",
};

function paragraphs(text: string[]): ReportBlock[] {
  const chunks = text.map((item) => item.trim()).filter(Boolean);
  return paragraphBlocksFromText(
    chunks.length > 0 ? chunks.join("\n\n") : "",
  );
}

function sectionParagraphs(
  sections: ReportSections,
  key: keyof ReportSections,
): ReportBlock[] {
  const blocks = paragraphs(sections[key]);
  if (blocks.length > 0) {
    return blocks;
  }
  return paragraphBlocksFromText(SECTION_FALLBACK[key]);
}

function heading(text: string): ReportBlock {
  return { type: "heading", runs: [{ text }] };
}

function label(text: string): ReportBlock {
  return { type: "paragraph", runs: [{ text, bold: true }] };
}

function identifyingRows(info: AssessmentInfo): string[][] {
  const education =
    info.education === "" ? null : educationLabel(info.education, "et", "");
  const candidates: Array<[string, string | null]> = [
    ["Uuritav", info.examineeName.trim() || null],
    [
      "Vanus",
      info.examineeAgeYears === "" ? null : String(info.examineeAgeYears),
    ],
    ["Hindamise kuupäev", formatAssessmentDate(info.assessmentDate)],
    ["Hindaja", info.clinicianName.trim() || null],
    ["Suunaja", info.referrer.trim() || null],
    ["Haridus", education || null],
  ];
  return candidates.flatMap(([field, value]) =>
    value ? [[field, value]] : [],
  );
}

function strengthIntro(profile: StrengthProfile): string {
  const parts = [`Isikupõhine võrdlus: ${profile.comparison}.`];
  if (profile.overallMean) {
    parts.push(`Üldkeskmine ${profile.overallMean}.`);
  }
  if (profile.verbalMean) {
    parts.push(`Sõnaline keskmine ${profile.verbalMean}.`);
  }
  if (profile.performanceMean) {
    parts.push(`Soorituslik keskmine ${profile.performanceMean}.`);
  }
  if (profile.viqPiqAbsoluteDifference) {
    parts.push(
      `Sõnalise ja sooritusliku IQ absoluutne vahe ${profile.viqPiqAbsoluteDifference}.`,
    );
  }
  if (profile.rows.length === 0) {
    parts.push(
      "Ükski allskaala ei erinenud isiku enda keskmisest üle kriitilise väärtuse.",
    );
  }
  return parts.join(" ");
}

function digitSpanRows(span: DigitSpanFacts): string[][] {
  const candidates: Array<[string, string | null]> = [
    ["Pikim edaspidi seeria", span.longestForward],
    ["Pikim tagurpidi seeria", span.longestBackward],
    ["Edaspidi kumulatiivne protsent", span.forwardCumulativePercent],
    ["Tagurpidi kumulatiivne protsent", span.backwardCumulativePercent],
    ["Edaspidi miinus tagurpidi", span.forwardMinusBackward],
    ["Erinevuse kumulatiivne protsent", span.differenceCumulativePercent],
  ];
  return candidates.flatMap(([field, value]) =>
    value ? [[field, value]] : [],
  );
}

export function assembleReport(args: {
  info: AssessmentInfo;
  result: Wais3Result;
  sections: ReportSections;
  eek2: Eek2Scores;
}): ReportDocument {
  const { info, result, sections, eek2 } = args;
  const composites = compositeFacts(result);
  const subtests = subtestFacts(result);
  const discrepancies = discrepancyFacts(result);
  const strengths = strengthProfile(result);
  const span = digitSpanFacts(result);
  const identity = identifyingRows(info);
  const datePart = info.assessmentDate.trim()
    ? `-${info.assessmentDate.trim()}`
    : "";

  const blocks: ReportBlock[] = [
    { type: "title", runs: [{ text: REPORT_TITLE, bold: true }] },
    heading(REPORT_HEADINGS.identity),
  ];

  if (identity.length > 0) {
    blocks.push({
      type: "table",
      headers: ["Väli", "Väärtus"],
      rows: identity,
    });
  } else {
    blocks.push(
      ...paragraphBlocksFromText("Identifitseerivaid andmeid ei ole sisestatud."),
    );
  }

  blocks.push(
    heading(REPORT_HEADINGS.background),
    ...sectionParagraphs(sections, "background"),
    heading(REPORT_HEADINGS.behavior),
    ...sectionParagraphs(sections, "testBehavior"),
    heading(REPORT_HEADINGS.results),
    ...paragraphBlocksFromText(
      "Järgmised skoorid on arvutatud WAIS-III kalkulaatoriga. Keelemudel skoore ei arvutanud ega muutnud.",
    ),
  );

  if (composites.length > 0) {
    blocks.push(label("Indeksid"), {
      type: "table",
      headers: [
        "Indeks",
        "Skooride summa",
        "Indeksskoor",
        "Protsentiil",
        "95% usaldusvahemik",
      ],
      rows: composites.map((item) => [
        item.name,
        item.sum,
        item.indexScore,
        item.percentile,
        item.confidenceInterval95,
      ]),
    });
  }

  if (subtests.length > 0) {
    blocks.push(label("Allskaalad"), {
      type: "table",
      headers: ["Allskaala", "Toorskoor", "Standardskoor"],
      rows: subtests.map((item) => [
        item.name,
        item.rawScore,
        item.scaledScore,
      ]),
    });
  }

  if (strengths) {
    blocks.push(
      label("Isikupõhised tugevused ja nõrkused"),
      ...paragraphBlocksFromText(strengthIntro(strengths)),
    );
    if (strengths.rows.length > 0) {
      blocks.push({
        type: "table",
        headers: [
          "Allskaala",
          "Standardskoor",
          "Erinevus keskmisest",
          "Kriitiline väärtus",
          "Hinnang",
        ],
        rows: strengths.rows.map((row) => [
          row.name,
          row.scaledScore,
          row.deviationFromMean,
          row.criticalValue,
          row.classification === "strength" ? "tugevus" : "nõrkus",
        ]),
      });
    }
  } else if (subtests.length > 0) {
    blocks.push(
      ...paragraphBlocksFromText(
        "Isikupõhiseid tugevaid ja nõrku külgi ei klassifitseeritud, sest selleks on vaja kõiki 14 allskaalat.",
      ),
    );
  }

  if (discrepancies.length > 0) {
    blocks.push(label("Indeksite lahknevused"), {
      type: "table",
      headers: [
        "Võrdlus",
        "Skoor 1",
        "Skoor 2",
        "Erinevus",
        "Kriitiline väärtus",
        "Ületab kriitilist väärtust",
        "Baassagedus %",
        "Baassagedus %/2",
      ],
      rows: discrepancies.map((row) => [
        row.comparison,
        row.score1,
        row.score2,
        row.difference,
        row.criticalValue,
        row.exceedsCriticalValue ? "jah" : "ei",
        row.baseRatePercent ?? "—",
        row.baseRatePercentHalf ?? "—",
      ]),
    });
  }

  if (span) {
    const rows = digitSpanRows(span);
    if (rows.length > 0) {
      blocks.push(label("Arvumälu lisaanalüüs"), {
        type: "table",
        headers: ["Näitaja", "Väärtus"],
        rows,
      });
    }
  }

  const eekRows = enteredEek2Scores(eek2);
  if (eekRows.length > 0) {
    blocks.push(
      heading(REPORT_HEADINGS.eek2),
      ...paragraphBlocksFromText(
        "Järgmised on kliiniku sisestatud EEK-2 alaskaalade skoorid. Rakendus neid ei arvutanud.",
      ),
      {
        type: "table",
        headers: ["Alaskaala", "Skoor"],
        rows: eekRows.map((row) => [row.scale, row.score]),
      },
    );
  }

  blocks.push(
    heading(REPORT_HEADINGS.interpretation),
    ...sectionParagraphs(sections, "interpretation"),
    heading(REPORT_HEADINGS.conclusions),
    ...sectionParagraphs(sections, "conclusions"),
    heading(REPORT_HEADINGS.recommendations),
    ...sectionParagraphs(sections, "recommendations"),
  );

  return {
    title: REPORT_TITLE,
    fileBaseName: `kognitiivne-aruanne${datePart}`,
    blocks,
  };
}
