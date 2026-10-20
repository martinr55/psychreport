import type { AppLocale } from "@/types/locale";

export interface AppMessages {
  clinicalWorkspace: string;
  appTitle: string;
  languageLabel: string;
  languageEstonian: string;
  languageEnglish: string;
  instrumentsEyebrow: string;
  tabWais3: string;
  tabWisc5: string;
  tabEek2: string;
  wiscPlaceholderTitle: string;
  wiscPlaceholderBody: string;
  wiscPlaceholderItems: string[];
  eekPlaceholderTitle: string;
  eekPlaceholderBody: string;
  eekPlaceholderItems: string[];
  clearAll: string;
  mandatoryFieldsHint: string;
  caseEyebrow: string;
  clinician: string;
  examinee: string;
  ageYears: string;
  assessmentDate: string;
  referrer: string;
  education: string;
  educationPlaceholder: string;
  psychosocialBackground: string;
  copingDifficulties: string;
  referralQuestion: string;
  observationsEyebrow: string;
  conclusionsEyebrow: string;
  motivation: string;
  encouragementNeed: string;
  anxiety: string;
  concentration: string;
  motorRestlessness: string;
  fatigue: string;
  answeredBeforeInstructions: string;
  hesitatedALot: string;
  otherNotes: string;
  referralOpinion: string;
  recommendations: string;
  outputEyebrow: string;
  reportPreviewTitle: string;
  generateReport: string;
  downloadDocx: string;
  downloadPdf: string;
  downloadingDocx: string;
  downloadingPdf: string;
  downloadUnavailable: string;
  downloadFailed: string;
  reportEmpty: string;
  reportDocumentTitle: string;
  reportFileBase: string;
  reportField: string;
  reportValue: string;
  reportIndicator: string;
  reportStatus: string;
  reportSubtest: string;
  reportScaledScore: string;
  reportIdentifying: string;
  reportExaminee: string;
  reportAge: string;
  reportDate: string;
  reportExaminer: string;
  reportReferrer: string;
  reportEducation: string;
  reportReferral: string;
  reportPsychosocial: string;
  reportCoping: string;
  reportNotProvided: string;
  reportObservations: string;
  reportPresent: string;
  reportNotObserved: string;
  reportScores: string;
  reportOtherNotes: string;
  reportReferralOpinion: string;
  reportRecommendations: string;
  reportConclusions: string;
  reportNoneRecorded: string;
}

export const MESSAGES: Record<AppLocale, AppMessages> = {
  et: {
    clinicalWorkspace: "Kliiniline tööruum",
    appTitle: "Kognitiivse aruande rakendus",
    languageLabel: "Keel",
    languageEstonian: "Eesti keel",
    languageEnglish: "English",
    instrumentsEyebrow: "Hindamisvahendid",
    tabWais3: "WAIS-III",
    tabWisc5: "WISC-V",
    tabEek2: "EEK-2",
    wiscPlaceholderTitle: "WISC-V",
    wiscPlaceholderBody:
      "WISC-V skooride sisestus ja arvutus lisatakse siia hiljem. See vahekaart on praegu kohatäide.",
    wiscPlaceholderItems: [
      "Sarnasused",
      "Sõnavara",
      "Kuubikud",
      "Kujundite kaalumine",
    ],
    eekPlaceholderTitle: "EEK-2",
    eekPlaceholderBody:
      "EEK-2 (emotsionaalse enesetunde küsimustik) sisestus lisatakse siia hiljem. See vahekaart on praegu kohatäide.",
    eekPlaceholderItems: [
      "Depressioon",
      "Ärevus",
      "Agorafoobia-paanika",
      "Väsimus",
    ],
    clearAll: "tühjenda kõik",
    mandatoryFieldsHint: "* Tärniga märgitud väljad on kohustuslikud.",
    caseEyebrow: "Üldandmed",
    clinician: "Psühholoog",
    examinee: "Uuritav",
    ageYears: "Vanus",
    assessmentDate: "Hindamise kuupäev",
    referrer: "Suunaja",
    education: "Haridus",
    educationPlaceholder: "Vali",
    psychosocialBackground: "Psühhosotsiaalne taust",
    copingDifficulties: "Toimetulekuraskused ja sümptomid",
    referralQuestion: "Suunamise põhjus",
    observationsEyebrow: "Tähelepanekud",
    conclusionsEyebrow: "Järeldused ja soovitused",
    motivation: "Motiveeritus",
    encouragementNeed: "Julgustamisvajadus",
    anxiety: "Ärevus",
    concentration: "Keskendumine",
    motorRestlessness: "Motoorne rahutus",
    fatigue: "Väsimine",
    answeredBeforeInstructions: "Vastas enne ülesande ärakuulamist",
    hesitatedALot: "Kõhkles palju",
    otherNotes: "Muud märkused",
    referralOpinion: "Seisukoht suunamise põhjuse osas",
    recommendations: "Soovitused edasiseks raviks ja/või uuringuteks",
    outputEyebrow: "Väljund",
    reportPreviewTitle: "Aruande eelvaade",
    generateReport: "Koosta aruanne",
    downloadDocx: "Laadi alla DOCX",
    downloadPdf: "Laadi alla PDF",
    downloadingDocx: "Koostan DOCX-faili…",
    downloadingPdf: "Koostan PDF-faili…",
    downloadUnavailable: "Koosta aruanne enne allalaadimist.",
    downloadFailed: "Allalaadimine ebaõnnestus.",
    reportEmpty: "Koostatud aruanne ilmub siia.",
    reportDocumentTitle: "WAIS-III kognitiivne aruanne",
    reportFileBase: "kognitiivne-aruanne",
    reportField: "Väli",
    reportValue: "Väärtus",
    reportIndicator: "Näitaja",
    reportStatus: "Staatus",
    reportSubtest: "Allskaala",
    reportScaledScore: "Standardskoor",
    reportIdentifying: "Identifitseerivad andmed",
    reportExaminee: "Uuritav",
    reportAge: "vanus",
    reportDate: "Hindamise kuupäev",
    reportExaminer: "Hindaja",
    reportReferrer: "Suunaja",
    reportEducation: "Haridus",
    reportReferral: "Suunamise põhjus",
    reportPsychosocial: "Psühhosotsiaalne taust",
    reportCoping: "Toimetulekuraskused ja sümptomid",
    reportNotProvided: "Märkimata.",
    reportObservations: "Tähelepanekud",
    reportPresent: "täheldatud",
    reportNotObserved: "ei täheldatud",
    reportScores: "Testiskoorid",
    reportOtherNotes: "Muud märkused",
    reportReferralOpinion: "Seisukoht suunamise põhjuse osas",
    reportRecommendations: "Soovitused edasiseks raviks ja/või uuringuteks",
    reportConclusions: "Järeldused ja soovitused",
    reportNoneRecorded: "Märkimata.",
  },
  en: {
    clinicalWorkspace: "Clinical workspace",
    appTitle: "Cognitive Report App",
    languageLabel: "Language",
    languageEstonian: "Eesti keel",
    languageEnglish: "English",
    instrumentsEyebrow: "Assessment instruments",
    tabWais3: "WAIS-III",
    tabWisc5: "WISC-V",
    tabEek2: "EST-Q2",
    wiscPlaceholderTitle: "WISC-V",
    wiscPlaceholderBody:
      "WISC-V score entry and calculation will be added here later. This tab is a placeholder for now.",
    wiscPlaceholderItems: [
      "Similarities",
      "Vocabulary",
      "Block Design",
      "Figure Weights",
    ],
    eekPlaceholderTitle: "EST-Q2",
    eekPlaceholderBody:
      "EST-Q2 (Emotional State Questionnaire) entry will be added here later. This tab is a placeholder for now.",
    eekPlaceholderItems: [
      "Depression",
      "Anxiety",
      "Agoraphobia-panic",
      "Fatigue",
    ],
    clearAll: "clear all",
    mandatoryFieldsHint: "* Fields marked with an asterisk are mandatory.",
    caseEyebrow: "General information",
    clinician: "Clinician",
    examinee: "Examinee",
    ageYears: "Age",
    assessmentDate: "Assessment date",
    referrer: "Referrer",
    education: "Education",
    educationPlaceholder: "Select",
    psychosocialBackground: "Psychosocial background",
    copingDifficulties: "Coping difficulties and symptoms",
    referralQuestion: "Reason for referral",
    observationsEyebrow: "Observations",
    conclusionsEyebrow: "Conclusions and recommendations",
    motivation: "Motivation",
    encouragementNeed: "Need for encouragement",
    anxiety: "Anxiety",
    concentration: "Concentration",
    motorRestlessness: "Motor restlessness",
    fatigue: "Fatigue",
    answeredBeforeInstructions: "Responded before the task was fully explained",
    hesitatedALot: "Hesitated a lot",
    otherNotes: "Other notes",
    referralOpinion: "Opinion on the reason for referral",
    recommendations: "Recommendations for further treatment and/or assessment",
    outputEyebrow: "Output",
    reportPreviewTitle: "Report preview",
    generateReport: "Generate Report",
    downloadDocx: "Download DOCX",
    downloadPdf: "Download PDF",
    downloadingDocx: "Preparing DOCX…",
    downloadingPdf: "Preparing PDF…",
    downloadUnavailable: "Generate the report before downloading.",
    downloadFailed: "Download failed.",
    reportEmpty: "The generated report will appear here.",
    reportDocumentTitle: "WAIS-III Cognitive Report",
    reportFileBase: "cognitive-report",
    reportField: "Field",
    reportValue: "Value",
    reportIndicator: "Indicator",
    reportStatus: "Status",
    reportSubtest: "Subtest",
    reportScaledScore: "Scaled score",
    reportIdentifying: "Identifying information",
    reportExaminee: "Examinee",
    reportAge: "age",
    reportDate: "Date of assessment",
    reportExaminer: "Examiner",
    reportReferrer: "Referrer",
    reportEducation: "Education",
    reportReferral: "Reason for referral",
    reportPsychosocial: "Psychosocial background",
    reportCoping: "Coping difficulties and symptoms",
    reportNotProvided: "Not provided.",
    reportObservations: "Observations",
    reportPresent: "present",
    reportNotObserved: "not observed",
    reportScores: "Test scores",
    reportOtherNotes: "Other notes",
    reportReferralOpinion: "Opinion on the reason for referral",
    reportRecommendations: "Recommendations for further treatment and/or assessment",
    reportConclusions: "Conclusions and recommendations",
    reportNoneRecorded: "None recorded.",
  },
};
