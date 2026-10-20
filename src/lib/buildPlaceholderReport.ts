import { educationLabel } from "@/data/educationLevels";
import { waisSubtestName } from "@/data/waisSubtests";
import type { AppMessages } from "@/i18n/messages";
import type { AssessmentDraft } from "@/types/assessment";
import type { AppLocale } from "@/types/locale";
import {
  paragraphBlocksFromText,
  type ReportBlock,
  type ReportDocument,
} from "@/types/reportDocument";

function observed(value: boolean, t: AppMessages): string {
  return value ? t.reportPresent : t.reportNotObserved;
}

function displayValue(value: string): string {
  const trimmed = value.trim();
  return trimmed === "" ? "—" : trimmed;
}

function rating(value: number | null): string {
  return value === null ? "—" : `${value}/10`;
}

export function buildPlaceholderReport(
  draft: AssessmentDraft,
  locale: AppLocale,
  t: AppMessages,
): ReportDocument {
  const { info, scores, observations, conclusions } = draft;
  const age =
    info.examineeAgeYears === "" ? "—" : String(info.examineeAgeYears);
  const datePart = info.assessmentDate ? `-${info.assessmentDate}` : "";
  const fileBaseName = `${t.reportFileBase}${datePart}`;

  const observationRows: Array<[string, string]> = [
    [t.motivation, rating(observations.motivation)],
    [t.encouragementNeed, rating(observations.encouragementNeed)],
    [t.anxiety, rating(observations.anxiety)],
    [t.concentration, rating(observations.concentration)],
    [t.motorRestlessness, rating(observations.motorRestlessness)],
    [t.fatigue, rating(observations.fatigue)],
    [
      t.answeredBeforeInstructions,
      observed(observations.answeredBeforeInstructions, t),
    ],
    [t.hesitatedALot, observed(observations.hesitatedALot, t)],
  ];

  const blocks: ReportBlock[] = [
    { type: "title", runs: [{ text: t.reportDocumentTitle, bold: true }] },
    { type: "heading", runs: [{ text: t.reportIdentifying }] },
    {
      type: "table",
      headers: [t.reportField, t.reportValue],
      rows: [
        [t.reportExaminee, displayValue(info.examineeName)],
        [t.reportAge, age],
        [t.reportDate, displayValue(info.assessmentDate)],
        [t.reportExaminer, displayValue(info.clinicianName)],
        [t.reportReferrer, displayValue(info.referrer)],
        [
          t.reportEducation,
          educationLabel(info.education, locale, "—"),
        ],
      ],
    },
    { type: "heading", runs: [{ text: t.reportReferral }] },
    ...paragraphBlocksFromText(
      info.referralQuestion.trim() || t.reportNotProvided,
    ),
    { type: "heading", runs: [{ text: t.reportPsychosocial }] },
    ...paragraphBlocksFromText(
      info.psychosocialBackground.trim() || t.reportNoneRecorded,
    ),
    { type: "heading", runs: [{ text: t.reportCoping }] },
    ...paragraphBlocksFromText(
      info.copingDifficulties.trim() || t.reportNoneRecorded,
    ),
    { type: "heading", runs: [{ text: t.reportObservations }] },
    {
      type: "table",
      headers: [t.reportIndicator, t.reportStatus],
      rows: observationRows,
    },
    { type: "heading", runs: [{ text: t.reportOtherNotes }] },
    ...paragraphBlocksFromText(
      observations.otherNotes.trim() || t.reportNoneRecorded,
    ),
    { type: "heading", runs: [{ text: t.reportConclusions }] },
    { type: "heading", runs: [{ text: t.reportReferralOpinion }] },
    ...paragraphBlocksFromText(
      conclusions.referralOpinion.trim() || t.reportNoneRecorded,
    ),
    { type: "heading", runs: [{ text: t.reportRecommendations }] },
    ...paragraphBlocksFromText(
      conclusions.recommendations.trim() || t.reportNoneRecorded,
    ),
    { type: "heading", runs: [{ text: t.reportScores }] },
    {
      type: "table",
      headers: [t.reportSubtest, t.reportScaledScore],
      rows: scores.map((subtest) => [
        waisSubtestName(subtest.id, locale),
        subtest.scaledScore === "" ? "—" : String(subtest.scaledScore),
      ]),
    },
  ];

  return {
    title: t.reportDocumentTitle,
    fileBaseName,
    blocks,
  };
}
