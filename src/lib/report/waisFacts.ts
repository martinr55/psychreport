import { formatReportNumber } from "@/lib/report/formatNumber";
import {
  SUBTEST_LABELS_ET,
} from "@/scoring/wais3/tables";
import type {
  CompositeResult,
  Wais3Result,
} from "@/scoring/wais3/types";

export interface CompositeFact {
  id: string;
  name: string;
  sum: string;
  indexScore: string;
  percentile: string;
  confidenceInterval95: string;
}

export interface SubtestFact {
  name: string;
  rawScore: string;
  scaledScore: string;
}

export interface DiscrepancyFact {
  comparison: string;
  score1: string;
  score2: string;
  difference: string;
  criticalValue: string;
  exceedsCriticalValue: boolean;
  baseRatePercent: string | null;
  baseRatePercentHalf: string | null;
}

export interface StrengthRowFact {
  name: string;
  scaledScore: string;
  deviationFromMean: string;
  criticalValue: string;
  classification: "strength" | "weakness";
}

export interface StrengthProfile {
  comparison: string;
  verbalMean: string | null;
  performanceMean: string | null;
  overallMean: string | null;
  viqPiqAbsoluteDifference: string | null;
  rows: StrengthRowFact[];
}

export interface DigitSpanFacts {
  longestForward: string | null;
  longestBackward: string | null;
  forwardCumulativePercent: string | null;
  backwardCumulativePercent: string | null;
  forwardMinusBackward: string | null;
  differenceCumulativePercent: string | null;
}

const COMPOSITE_SPECS: Array<{
  id: string;
  name: string;
  key: "fsiq" | "viq" | "piq" | "vci" | "poi" | "wmi" | "psi";
}> = [
  { id: "fsiq", name: "Üldine IQ (FSIQ)", key: "fsiq" },
  { id: "viq", name: "Sõnaline IQ (VIQ)", key: "viq" },
  { id: "piq", name: "Soorituslik IQ (PIQ)", key: "piq" },
  { id: "vci", name: "Sõnaline mõistmine (VCI)", key: "vci" },
  { id: "poi", name: "Tajupõhine töötlus (POI)", key: "poi" },
  { id: "wmi", name: "Töömälu (WMI)", key: "wmi" },
  { id: "psi", name: "Töötluskiirus (PSI)", key: "psi" },
];

function intervalText(composite: CompositeResult): string {
  const low = formatReportNumber(composite.ciLow);
  const high = formatReportNumber(composite.ciHigh);
  if (!low || !high) {
    return "—";
  }
  return `${low}–${high}`;
}

export function compositeFacts(result: Wais3Result): CompositeFact[] {
  return COMPOSITE_SPECS.flatMap((spec) => {
    const composite = result[spec.key];
    if (!composite.available || composite.iq === null) {
      return [];
    }
    return [
      {
        id: spec.id,
        name: spec.name,
        sum: formatReportNumber(composite.sum) ?? "—",
        indexScore: formatReportNumber(composite.iq) ?? "—",
        percentile: formatReportNumber(composite.percentile) ?? "—",
        confidenceInterval95: intervalText(composite),
      },
    ];
  });
}

export function subtestFacts(result: Wais3Result): SubtestFact[] {
  return result.subtests.flatMap((subtest) => {
    if (!subtest.administered || subtest.scaled === null) {
      return [];
    }
    return [
      {
        name: SUBTEST_LABELS_ET[subtest.index] ?? `allskaala ${subtest.index + 1}`,
        rawScore: formatReportNumber(subtest.raw) ?? "—",
        scaledScore: formatReportNumber(subtest.scaled) ?? "—",
      },
    ];
  });
}

export function discrepancyFacts(result: Wais3Result): DiscrepancyFact[] {
  return result.discrepancies.flatMap((row) => {
    if (!row.available || row.difference === null || row.score1 === null || row.score2 === null) {
      return [];
    }
    const critical = formatReportNumber(row.critical, 2);
    const exceeds =
      row.critical !== null && Math.abs(row.difference) >= row.critical;
    return [
      {
        comparison: row.label,
        score1: formatReportNumber(row.score1) ?? "—",
        score2: formatReportNumber(row.score2) ?? "—",
        difference: formatReportNumber(row.difference) ?? "—",
        criticalValue: critical ?? "—",
        exceedsCriticalValue: exceeds,
        baseRatePercent: formatReportNumber(row.baseRate),
        baseRatePercentHalf: formatReportNumber(row.baseRateHalf),
      },
    ];
  });
}

export function strengthProfile(result: Wais3Result): StrengthProfile | null {
  if (!result.strength.classificationsValid || result.strength.meanRuleLabel === null) {
    return null;
  }
  const rows = result.strength.rows.flatMap((row) => {
    if (row.strength !== "T" && row.strength !== "N") {
      return [];
    }
    return [
      {
        name: SUBTEST_LABELS_ET[row.index] ?? `allskaala ${row.index + 1}`,
        scaledScore: formatReportNumber(row.scaled) ?? "—",
        deviationFromMean: formatReportNumber(row.deviation, 2) ?? "—",
        criticalValue: formatReportNumber(row.critical, 2) ?? "—",
        classification: row.strength === "T" ? ("strength" as const) : ("weakness" as const),
      },
    ];
  });
  return {
    comparison: result.strength.meanRuleLabel,
    verbalMean: formatReportNumber(result.strength.verbalMean, 2),
    performanceMean: formatReportNumber(result.strength.performanceMean, 2),
    overallMean: formatReportNumber(result.strength.overallMean, 2),
    viqPiqAbsoluteDifference: formatReportNumber(result.strength.viqPiqAbsDiff),
    rows,
  };
}

export function digitSpanFacts(result: Wais3Result): DigitSpanFacts | null {
  const span = result.digitSpan;
  if (span.longestForward === null && span.longestBackward === null) {
    return null;
  }
  return {
    longestForward: formatReportNumber(span.longestForward),
    longestBackward: formatReportNumber(span.longestBackward),
    forwardCumulativePercent: formatReportNumber(span.forwardCumulative, 1),
    backwardCumulativePercent: formatReportNumber(span.backwardCumulative, 1),
    forwardMinusBackward: formatReportNumber(span.difference),
    differenceCumulativePercent: formatReportNumber(span.differenceCumulative, 1),
  };
}
