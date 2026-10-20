import type { AppLocale } from "@/types/locale";

export interface CalculatorCopy {
  rawScore: string;
  verbalCaps: string;
  performanceCaps: string;
  verbal: string;
  performance: string;
  fullScale: string;
  scaledSum: string;
  iqIndexes: string;
  percentiles: string;
  confidence95: string;
  overall: string;
  sum: string;
  mean: string;
  scaledScore: string;
  difference: string;
  critical: string;
  strength: string;
  weakness: string;
  viqPiqDiff: string;
  meanOverall: string;
  meanSeparate: string;
  score1: string;
  score2: string;
  percent: string;
  percentHalf: string;
  longestForward: string;
  longestBackward: string;
  forwardMinusBackward: string;
  subtests: string[];
  discrepancies: Record<string, string>;
}

export const CALCULATOR_COPY: Record<AppLocale, CalculatorCopy> = {
  et: {
    rawScore: "toorskoor",
    verbalCaps: "SÕNALINE",
    performanceCaps: "SOORITUSLIK",
    verbal: "sõnaline",
    performance: "soorituslik",
    fullScale: "koguskaala",
    scaledSum: "standardiseeritud skooride summa",
    iqIndexes: "IQ indeksskoorid",
    percentiles: "protsentiilid",
    confidence95: "usaldusvahemik 95%",
    overall: "üld",
    sum: "summa",
    mean: "keskmine",
    scaledScore: "st skoor",
    difference: "erinevus",
    critical: "piir",
    strength: "tugev külg",
    weakness: "nõrk külg",
    viqPiqDiff: "VIQPIQ vahe:",
    meanOverall: "erinevus üldkeskmisest",
    meanSeparate: "erinevus sõnalisest keskmisest ja soorituslikust keskmisest",
    score1: "skoor 1",
    score2: "skoor 2",
    percent: "%",
    percentHalf: "%/2",
    longestForward: "pikim edaspidi seeria",
    longestBackward: "pikim tagurpidi seeria",
    forwardMinusBackward: "edaspidi - tagurpidi",
    subtests: [
      "piltide täiendamine",
      "sõnavara",
      "šifreering",
      "sarnasused",
      "kuubikud",
      "aritmeetika",
      "maatriksid",
      "arvumälu",
      "informeeritus",
      "pildiseeriad",
      "taibukus",
      "sümbolite otsimine",
      "täht-number järjestus",
      "kujundite moodustamine",
    ],
    discrepancies: {
      "VIQ-PIQ": "sõnaline IQ - soorituslik IQ",
      "VCI-POI": "sõnaline taibukus - tajupõhine töötlus",
      "VCI-WMI": "sõnaline taibukus - töömälu",
      "POI-PSI": "tajupõhine töötlus - töötluskiirus",
      "VCI-PSI": "sõnaline taibukus - töötluskiirus",
      "POI-WMI": "tajupõhine töötlus - töömälu",
      "WMI-PSI": "töömälu - töötluskiirus",
    },
  },
  en: {
    rawScore: "raw score",
    verbalCaps: "VERBAL",
    performanceCaps: "PERFORMANCE",
    verbal: "verbal",
    performance: "performance",
    fullScale: "full scale",
    scaledSum: "sum of scaled scores",
    iqIndexes: "IQ index scores",
    percentiles: "percentiles",
    confidence95: "95% confidence interval",
    overall: "overall",
    sum: "sum",
    mean: "mean",
    scaledScore: "scaled score",
    difference: "difference",
    critical: "critical value",
    strength: "strength",
    weakness: "weakness",
    viqPiqDiff: "VIQ–PIQ difference:",
    meanOverall: "difference from the overall mean",
    meanSeparate: "difference from the verbal mean and the performance mean",
    score1: "score 1",
    score2: "score 2",
    percent: "%",
    percentHalf: "%/2",
    longestForward: "longest forward span",
    longestBackward: "longest backward span",
    forwardMinusBackward: "forward − backward",
    subtests: [
      "Picture Completion",
      "Vocabulary",
      "Digit Symbol–Coding",
      "Similarities",
      "Block Design",
      "Arithmetic",
      "Matrix Reasoning",
      "Digit Span",
      "Information",
      "Picture Arrangement",
      "Comprehension",
      "Symbol Search",
      "Letter–Number Sequencing",
      "Object Assembly",
    ],
    discrepancies: {
      "VIQ-PIQ": "Verbal IQ − Performance IQ",
      "VCI-POI": "Verbal Comprehension − Perceptual Organization",
      "VCI-WMI": "Verbal Comprehension − Working Memory",
      "POI-PSI": "Perceptual Organization − Processing Speed",
      "VCI-PSI": "Verbal Comprehension − Processing Speed",
      "POI-WMI": "Perceptual Organization − Working Memory",
      "WMI-PSI": "Working Memory − Processing Speed",
    },
  },
};
