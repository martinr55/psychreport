import { WAIS_SUBTESTS } from "@/data/waisSubtests";
import { EMPTY_EEK2 } from "@/data/eek2Scales";
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
  eek2: EMPTY_EEK2,
  observations: {
    motivation: null,
    encouragementNeed: null,
    anxiety: null,
    concentration: null,
    motorRestlessness: null,
    fatigue: null,
    answeredBeforeInstructions: false,
    hesitatedALot: false,
    otherNotes: "",
  },
  conclusions: {
    referralOpinion: "",
    recommendations: "",
  },
};
