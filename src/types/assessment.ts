export const EDUCATION_LEVELS = [
  "primary",
  "basic",
  "secondary",
  "vocational",
  "bachelor",
  "master",
  "doctoral",
  "other",
] as const;

export type EducationLevel = "" | (typeof EDUCATION_LEVELS)[number];

export interface AssessmentInfo {
  clinicianName: string;
  examineeName: string;
  examineeAgeYears: number | "";
  assessmentDate: string;
  referrer: string;
  education: EducationLevel;
  psychosocialBackground: string;
  copingDifficulties: string;
  referralQuestion: string;
}

export interface SubtestScore {
  id: string;
  scaledScore: number | "";
}

export interface StructuredObservations {
  motivation: number;
  encouragementNeed: number;
  anxiety: number;
  concentration: number;
  motorRestlessness: number;
  fatigue: number;
  answeredBeforeInstructions: boolean;
  hesitatedALot: boolean;
  otherNotes: string;
}

export interface Conclusions {
  referralOpinion: string;
  recommendations: string;
}

export interface AssessmentDraft {
  info: AssessmentInfo;
  scores: SubtestScore[];
  observations: StructuredObservations;
  conclusions: Conclusions;
}
