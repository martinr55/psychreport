import { enteredEek2Scores, type Eek2Scores } from "@/data/eek2Scales";
import {
  compositeFacts,
  digitSpanFacts,
  discrepancyFacts,
  strengthProfile,
  subtestFacts,
  type CompositeFact,
  type DigitSpanFacts,
  type DiscrepancyFact,
  type StrengthProfile,
} from "@/lib/report/waisFacts";
import type { Conclusions, StructuredObservations } from "@/types/assessment";
import type { Wais3Result } from "@/scoring/wais3/types";

export interface ReportContext {
  language: "et";
  observations: {
    structuredRatings: {
      scale: "1-10";
      anchorsDefined: false;
      items: Array<{ label: string; value: number }>;
    } | null;
    checklist: Array<{ label: string; checked: boolean }>;
    freeText: string | null;
  };
  clinicianConclusions: {
    referralOpinion: string | null;
    recommendations: string | null;
  };
  eek2: {
    instrument: "EEK-2";
    scores: Array<{ scale: string; score: string }>;
  } | null;
  wais3: {
    instrument: "WAIS-III";
    precalculated: true;
    composites: CompositeFact[];
    subtests: Array<{ name: string; scaledScore: string }>;
    personalStrengthsAndWeaknesses: StrengthProfile | null;
    discrepancies: DiscrepancyFact[];
    digitSpan: DigitSpanFacts | null;
  };
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const RATING_LABELS = [
  ["motivation", "Motiveeritus"],
  ["encouragementNeed", "Julgustamisvajadus"],
  ["anxiety", "Ärevus"],
  ["concentration", "Keskendumine"],
  ["motorRestlessness", "Motoorne rahutus"],
  ["fatigue", "Väsimine"],
] as const;

const CHECKLIST = [
  ["answeredBeforeInstructions", "Vastas enne ülesande ärakuulamist"],
  ["hesitatedALot", "Kõhkles palju"],
] as const;

export function buildReportContext(args: {
  observations: StructuredObservations;
  conclusions: Conclusions;
  result: Wais3Result;
  eek2: Eek2Scores;
}): ReportContext {
  const { observations, conclusions, result, eek2 } = args;
  const ratings = RATING_LABELS.flatMap(([key, label]) => {
    const value = observations[key];
    return value === null ? [] : [{ label, value }];
  });
  const strengths = strengthProfile(result);
  const eekScores = enteredEek2Scores(eek2);

  return {
    language: "et",
    observations: {
      structuredRatings:
        ratings.length === 0
          ? null
          : { scale: "1-10", anchorsDefined: false, items: ratings },
      checklist: CHECKLIST.map(([key, label]) => ({
        label,
        checked: observations[key],
      })),
      freeText: blankToNull(observations.otherNotes),
    },
    clinicianConclusions: {
      referralOpinion: blankToNull(conclusions.referralOpinion),
      recommendations: blankToNull(conclusions.recommendations),
    },
    eek2:
      eekScores.length === 0
        ? null
        : { instrument: "EEK-2", scores: eekScores },
    wais3: {
      instrument: "WAIS-III",
      precalculated: true,
      composites: compositeFacts(result),
      subtests: subtestFacts(result).map(({ name, scaledScore }) => ({
        name,
        scaledScore,
      })),
      personalStrengthsAndWeaknesses: strengths,
      discrepancies: discrepancyFacts(result),
      digitSpan: digitSpanFacts(result),
    },
  };
}
