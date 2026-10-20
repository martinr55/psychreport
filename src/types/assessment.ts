import type { Eek2Scores } from "@/data/eek2Scales";

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
  motivation: number | null;
  encouragementNeed: number | null;
  anxiety: number | null;
  concentration: number | null;
  motorRestlessness: number | null;
  fatigue: number | null;
  answeredBeforeInstructions: boolean;
  hesitatedALot: boolean;
  otherNotes: string;
}

export interface Conclusions {
  referralOpinion: string;
  recommendations: string;
}

export type { Eek2Scores };

export interface AssessmentDraft {
  info: AssessmentInfo;
  scores: SubtestScore[];
  eek2: Eek2Scores;
  observations: StructuredObservations;
  conclusions: Conclusions;
}
