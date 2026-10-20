import { WAIS_SUBTESTS } from "@/data/waisSubtests";
import type { AssessmentDraft } from "@/types/assessment";

export const EMPTY_ASSESSMENT: AssessmentDraft = {
  info: {
    clinicianName: "",
    examineeName: "",
    examineeAgeYears: "",
    assessmentDate: "",
    referrer: "",
    education: "",
    psychosocialBackground: "",
    copingDifficulties: "",
    referralQuestion: "",
  },
  scores: WAIS_SUBTESTS.map((subtest) => ({
    id: subtest.id,
    scaledScore: "",
  })),
  observations: {
    motivation: 5,
    encouragementNeed: 5,
    anxiety: 5,
    concentration: 5,
    motorRestlessness: 5,
    fatigue: 5,
    answeredBeforeInstructions: false,
    hesitatedALot: false,
    otherNotes: "",
  },
  conclusions: {
    referralOpinion: "",
    recommendations: "",
  },
};
