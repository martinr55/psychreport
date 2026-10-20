import { enteredEek2Scores } from "@/data/eek2Scales";
import { educationLabel } from "@/data/educationLevels";
import { formatAssessmentDate } from "@/lib/report/formatNumber";
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
  type SubtestFact,
} from "@/lib/report/waisFacts";
import type {
  AssessmentInfo,
  Conclusions,
  Eek2Scores,
  StructuredObservations,
} from "@/types/assessment";
import type { Wais3Result } from "@/scoring/wais3/types";

export interface ReportContext {
  language: "et";
  patient: {
    name: string | null;
    ageYears: number | null;
    education: string | null;
    assessmentDate: string | null;
    clinicianName: string | null;
    referrer: string | null;
  };
  referralQuestion: string | null;
  psychosocialBackground: string | null;
  reportedComplaints: string | null;
  observations: {
    structuredRatings: {
      scale: "1-10";
      anchorsDefined: false;
      items: Array<{ label: string; value: number }>;
    } | null;
    observedBehaviors: string[];
    freeText: string | null;
  };
  clinicianConclusions: {
    referralOpinion: string | null;
    recommendations: string | null;
  };
  notProvided: string[];
  notCollected: ["subtestSpecificObservations", "wisc5"];
  eek2: {
    instrument: "EEK-2";
    scores: Array<{ scale: string; score: string }>;
  } | null;
  wais3: {
    instrument: "WAIS-III";
    precalculated: true;
    composites: CompositeFact[];
    subtests: SubtestFact[];
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
  info: AssessmentInfo;
  observations: StructuredObservations;
  conclusions: Conclusions;
  result: Wais3Result;
  eek2: Eek2Scores;
}): ReportContext {
  const { info, observations, conclusions, result, eek2 } = args;
  const age = info.examineeAgeYears === "" ? null : info.examineeAgeYears;
  const education =
    info.education === "" ? null : educationLabel(info.education, "et", "");
  const ratings = RATING_LABELS.flatMap(([key, label]) => {
    const value = observations[key];
    return value === null ? [] : [{ label, value }];
  });
  const observedBehaviors = CHECKLIST.flatMap(([key, label]) =>
    observations[key] ? [label] : [],
  );
  const patient = {
    name: blankToNull(info.examineeName),
    ageYears: age,
    education: education === "" ? null : education,
    assessmentDate: formatAssessmentDate(info.assessmentDate),
    clinicianName: blankToNull(info.clinicianName),
    referrer: blankToNull(info.referrer),
  };
  const referralQuestion = blankToNull(info.referralQuestion);
  const psychosocialBackground = blankToNull(info.psychosocialBackground);
  const reportedComplaints = blankToNull(info.copingDifficulties);
  const freeText = blankToNull(observations.otherNotes);
  const referralOpinion = blankToNull(conclusions.referralOpinion);
  const recommendations = blankToNull(conclusions.recommendations);
  const strengths = strengthProfile(result);
  const eekScores = enteredEek2Scores(eek2);

  const notProvided = [
    patient.name ? null : "name",
    patient.education ? null : "education",
    patient.assessmentDate ? null : "assessmentDate",
    patient.clinicianName ? null : "clinicianName",
    patient.referrer ? null : "referrer",
    referralQuestion ? null : "referralQuestion",
    psychosocialBackground ? null : "psychosocialBackground",
    reportedComplaints ? null : "reportedComplaints",
    ratings.length > 0 ? null : "structuredRatings",
    observedBehaviors.length > 0 ? null : "observedBehaviors",
    freeText ? null : "observationFreeText",
    referralOpinion ? null : "clinicianReferralOpinion",
    recommendations ? null : "clinicianRecommendations",
    strengths ? null : "personalStrengthsAndWeaknesses",
    eekScores.length > 0 ? null : "eek2",
  ].filter((item): item is string => item !== null);

  return {
    language: "et",
    patient,
    referralQuestion,
    psychosocialBackground,
    reportedComplaints,
    observations: {
      structuredRatings:
        ratings.length === 0
          ? null
          : { scale: "1-10", anchorsDefined: false, items: ratings },
      observedBehaviors,
      freeText,
    },
    clinicianConclusions: {
      referralOpinion,
      recommendations,
    },
    notProvided,
    notCollected: ["subtestSpecificObservations", "wisc5"],
    eek2:
      eekScores.length === 0
        ? null
        : { instrument: "EEK-2", scores: eekScores },
    wais3: {
      instrument: "WAIS-III",
      precalculated: true,
      composites: compositeFacts(result),
      subtests: subtestFacts(result),
      personalStrengthsAndWeaknesses: strengths,
      discrepancies: discrepancyFacts(result),
      digitSpan: digitSpanFacts(result),
    },
  };
}
