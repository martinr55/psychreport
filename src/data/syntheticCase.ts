import { EMPTY_ASSESSMENT } from "@/data/emptyAssessment";
import type { WaisScoreEntry } from "@/lib/waisEntry";
import type { AssessmentDraft } from "@/types/assessment";

/** Fictional case for local testing. The raw scores match the calculator workbook example. */
export const SYNTHETIC_WAIS_ENTRY: WaisScoreEntry = {
  rawScores: [
    "22",
    "56",
    "50",
    "28",
    "46",
    "12",
    "24",
    "12",
    "20",
    "15",
    "25",
    "15",
    "5",
    "30",
  ],
  longestForward: "6",
  longestBackward: "5",
};

export const SYNTHETIC_ASSESSMENT: AssessmentDraft = {
  ...EMPTY_ASSESSMENT,
  info: {
    clinicianName: "Näidis Psühholoog",
    examineeName: "Näidis Uuritav",
    examineeAgeYears: 50,
    assessmentDate: "2026-10-20",
    referrer: "perearst",
    education: "secondary",
    referralQuestion:
      "Perearst palus hinnata mälu- ja keskendumisraskuste iseloomu seoses tööülesannete täitmisega.",
    psychosocialBackground:
      "Uuritav elab koos abikaasaga ja töötab raamatupidajana. Keskkooli lõpetas tähtajaliselt. Varasemat psühhiaatrilist ravi ei ole uuritava sõnul olnud.",
    copingDifficulties:
      "Uuritav kirjeldab viimase aasta jooksul nimede ununemist ja raskust mitut ülesannet korraga jälgida. Magab enda hinnangul ebaühtlaselt. Meeleolu kirjeldab stabiilsena. Ärevus on seotud töökoormusega.",
  },
  observations: {
    motivation: 8,
    encouragementNeed: 4,
    anxiety: 6,
    concentration: 4,
    motorRestlessness: 3,
    fatigue: 7,
    answeredBeforeInstructions: false,
    hesitatedALot: true,
    otherNotes:
      "Juhiseid palus mitmel korral korrata. Aritmeetikaülesannete ajal ütles, et peast arvutamine väsitab. Kuubikute ja maatriksite ajal töötas rahulikult ja parandas ise üksikuid vigu.",
  },
  conclusions: {
    referralOpinion:
      "Kaebused puudutavad eelkõige tähelepanu hoidmist ja töömälu igapäevatöös. Testitulemusi tuleb lugeda koos kaebuste ja vaatlusega. Diagnoosi selle hinnangu alusel ei panda.",
    recommendations:
      "Arutada perearstiga und ja töökorraldust. Konkreetset lisauuringut ei ole ette nähtud.",
  },
  eek2: {
    depression: 14,
    generalAnxiety: 11,
    panicAgoraphobia: 3,
    socialPhobia: 2,
    asthenia: 10,
    insomnia: 8,
  },
};
