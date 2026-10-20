import { EEK2_SCALES } from "@/data/eek2Scales";
import { EDUCATION_LEVELS } from "@/types/assessment";
import type {
  AssessmentInfo,
  Conclusions,
  EducationLevel,
  Eek2Scores,
  StructuredObservations,
} from "@/types/assessment";
import { SUBTEST_COUNT } from "@/scoring/wais3/tables";
import type { Wais3Input, Wais3Result } from "@/scoring/wais3/types";

const TEXT_LIMIT = 8000;
const NAME_LIMIT = 200;

export interface BilingualMessage {
  et: string;
  en: string;
}

export interface ParsedReportRequest {
  info: AssessmentInfo;
  observations: StructuredObservations;
  conclusions: Conclusions;
  eek2: Eek2Scores;
  waisInput: Wais3Input;
}

export type ParseReportResult =
  | { ok: true; value: ParsedReportRequest }
  | { ok: false; status: 400; error: "invalid_request"; messages: BilingualMessage[] };

const RATING_KEYS = [
  "motivation",
  "encouragementNeed",
  "anxiety",
  "concentration",
  "motorRestlessness",
  "fatigue",
] as const;

function fail(et: string, en: string): ParseReportResult {
  return {
    ok: false,
    status: 400,
    error: "invalid_request",
    messages: [{ et, en }],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readText(
  value: unknown,
  max: number,
  labelEt: string,
  labelEn: string,
): string | ParseReportResult {
  if (typeof value !== "string") {
    return fail(`${labelEt} peab olema tekst.`, `${labelEn} must be text.`);
  }
  if (value.length > max) {
    return fail(
      `${labelEt} on lubatust pikem.`,
      `${labelEn} is longer than allowed.`,
    );
  }
  return value.trim();
}

function readNullableInt(
  value: unknown,
  min: number,
  max: number,
): number | null | undefined {
  if (value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return undefined;
  }
  if (value < min || value > max) {
    return undefined;
  }
  return value;
}

function readAgeField(value: unknown): number | "" | undefined {
  if (value === "") {
    return "";
  }
  const age = readNullableInt(value, 16, 89);
  if (age === undefined || age === null) {
    return undefined;
  }
  return age;
}

export function parseReportRequest(body: unknown): ParseReportResult {
  if (!isRecord(body) || !isRecord(body.info) || !isRecord(body.observations) || !isRecord(body.conclusions) || !isRecord(body.eek2) || !isRecord(body.waisInput)) {
    return fail(
      "Aruande päring on puudulik või vigane.",
      "The report request is missing required fields.",
    );
  }

  const info = body.info;
  const observations = body.observations;
  const conclusions = body.conclusions;
  const wais = body.waisInput;

  const clinicianName = readText(info.clinicianName, NAME_LIMIT, "Hindaja nimi", "The clinician name");
  if (typeof clinicianName !== "string") return clinicianName;
  const examineeName = readText(info.examineeName, NAME_LIMIT, "Uuritava nimi", "The examinee name");
  if (typeof examineeName !== "string") return examineeName;
  const assessmentDate = readText(info.assessmentDate, 40, "Hindamise kuupäev", "The assessment date");
  if (typeof assessmentDate !== "string") return assessmentDate;
  const referrer = readText(info.referrer, NAME_LIMIT, "Suunaja", "The referrer");
  if (typeof referrer !== "string") return referrer;
  const psychosocialBackground = readText(info.psychosocialBackground, TEXT_LIMIT, "Psühhosotsiaalne taust", "The psychosocial background");
  if (typeof psychosocialBackground !== "string") return psychosocialBackground;
  const copingDifficulties = readText(info.copingDifficulties, TEXT_LIMIT, "Toimetulekuraskused", "The coping difficulties");
  if (typeof copingDifficulties !== "string") return copingDifficulties;
  const referralQuestion = readText(info.referralQuestion, TEXT_LIMIT, "Suunamise põhjus", "The referral question");
  if (typeof referralQuestion !== "string") return referralQuestion;

  const examineeAgeYears = readAgeField(info.examineeAgeYears);
  if (examineeAgeYears === undefined) {
    return fail(
      "Vanus peab olema tühi või täisarv vahemikus 16–89.",
      "Age must be empty or an integer from 16 to 89.",
    );
  }
  if (assessmentDate !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(assessmentDate)) {
    return fail(
      "Hindamise kuupäev peab olema kujul AAAA-KK-PP.",
      "The assessment date must use the YYYY-MM-DD format.",
    );
  }
  if (
    typeof info.education !== "string" ||
    (info.education !== "" &&
      !(EDUCATION_LEVELS as readonly string[]).includes(info.education))
  ) {
    return fail("Haridustase ei ole lubatud.", "The education level is not allowed.");
  }

  const waisAge = readNullableInt(wais.age, 16, 89);
  if (waisAge === undefined) {
    return fail(
      "WAIS-III vanus peab olema tühi või täisarv vahemikus 16–89.",
      "The WAIS-III age must be null or an integer from 16 to 89.",
    );
  }
  if (waisAge !== null && examineeAgeYears !== "" && waisAge !== examineeAgeYears) {
    return fail(
      "Vanus üldandmetes ja WAIS-III sisendis ei ühti.",
      "The age in the case information does not match the WAIS-III input.",
    );
  }
  const age = waisAge ?? (examineeAgeYears === "" ? null : examineeAgeYears);

  if (!Array.isArray(wais.rawScores) || wais.rawScores.length !== SUBTEST_COUNT) {
    return fail(
      "WAIS-III toorskooride loend peab sisaldama 14 väärtust.",
      "The WAIS-III raw score list must contain 14 values.",
    );
  }
  const rawScores: Array<number | null> = [];
  for (const raw of wais.rawScores) {
    const parsed = readNullableInt(raw, 0, 200);
    if (parsed === undefined) {
      return fail(
        "Iga toorskoor peab olema tühi või täisarv vahemikus 0–200.",
        "Each raw score must be null or an integer from 0 to 200.",
      );
    }
    rawScores.push(parsed);
  }
  const longestForward = readNullableInt(wais.longestForward, 0, 9);
  const longestBackward = readNullableInt(wais.longestBackward, 0, 9);
  if (longestForward === undefined || longestBackward === undefined) {
    return fail(
      "Arvumälu seeriad peavad olema tühjad või täisarvud vahemikus 0–9.",
      "Digit span lengths must be null or integers from 0 to 9.",
    );
  }

  const parsedObservations = {} as StructuredObservations;
  for (const key of RATING_KEYS) {
    const value = observations[key];
    if (value === null) {
      parsedObservations[key] = null;
      continue;
    }
    const rating = readNullableInt(value, 1, 10);
    if (rating === undefined || rating === null) {
      return fail(
        "Vaatlusskaala väärtus peab olema tühi või täisarv vahemikus 1–10.",
        "An observation rating must be null or an integer from 1 to 10.",
      );
    }
    parsedObservations[key] = rating;
  }
  if (typeof observations.answeredBeforeInstructions !== "boolean" || typeof observations.hesitatedALot !== "boolean") {
    return fail(
      "Vaatluse märkeruudud peavad olema tõeväärtused.",
      "Observation checkboxes must be boolean values.",
    );
  }
  const otherNotes = readText(observations.otherNotes, TEXT_LIMIT, "Muud märkused", "The other notes");
  if (typeof otherNotes !== "string") return otherNotes;

  const referralOpinion = readText(conclusions.referralOpinion, TEXT_LIMIT, "Seisukoht", "The referral opinion");
  if (typeof referralOpinion !== "string") return referralOpinion;
  const recommendations = readText(conclusions.recommendations, TEXT_LIMIT, "Soovitused", "The recommendations");
  if (typeof recommendations !== "string") return recommendations;

  const eek2 = {} as Eek2Scores;
  for (const scale of EEK2_SCALES) {
    const raw = body.eek2[scale.id];
    if (raw === null) {
      eek2[scale.id] = null;
      continue;
    }
    const score = readNullableInt(raw, 0, 100);
    if (score === undefined || score === null) {
      return fail(
        "EEK-2 skoor peab olema tühi või täisarv vahemikus 0–100.",
        "An EEK-2 score must be null or an integer from 0 to 100.",
      );
    }
    eek2[scale.id] = score;
  }

  return {
    ok: true,
    value: {
      info: {
        clinicianName,
        examineeName,
        examineeAgeYears: age ?? "",
        assessmentDate,
        referrer,
        education: info.education as EducationLevel,
        psychosocialBackground,
        copingDifficulties,
        referralQuestion,
      },
      observations: {
        ...parsedObservations,
        answeredBeforeInstructions: observations.answeredBeforeInstructions,
        hesitatedALot: observations.hesitatedALot,
        otherNotes,
      },
      conclusions: {
        referralOpinion,
        recommendations,
      },
      eek2,
      waisInput: {
        age,
        rawScores,
        longestForward,
        longestBackward,
      },
    },
  };
}

export function reportabilityMessages(result: Wais3Result): BilingualMessage[] | null {
  const invalid = result.issues.filter((issue) => issue.code === "invalid");
  if (!result.valid || invalid.length > 0) {
    const source = invalid.length > 0 ? invalid : result.issues;
    if (source.length === 0) {
      return [
        {
          et: "WAIS-III sisend ei ole arvutamiseks kõlblik.",
          en: "The WAIS-III input cannot be scored.",
        },
      ];
    }
    return source.map((issue) => ({ et: issue.messageEt, en: issue.messageEn }));
  }
  if (result.ageGroup === null) {
    return [
      {
        et: "Vanus on kohustuslik (16–89).",
        en: "Age is required (16–89).",
      },
    ];
  }
  const administered = result.subtests.some(
    (item) => item.administered && item.scaled !== null,
  );
  if (!administered) {
    return [
      {
        et: "Sisesta vähemalt ühe WAIS-III allskaala toorskoor.",
        en: "Enter a raw score for at least one WAIS-III subtest.",
      },
    ];
  }
  return null;
}
