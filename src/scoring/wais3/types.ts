export type OptionalNumber = number | null;

export interface Wais3Input {
  age: OptionalNumber;
  rawScores: OptionalNumber[];
  longestForward: OptionalNumber;
  longestBackward: OptionalNumber;
}

export interface ValidationIssue {
  field: string;
  code: "missing" | "invalid";
  messageEt: string;
  messageEn: string;
}

export interface ScaledSubtestResult {
  index: number;
  raw: OptionalNumber;
  scaled: OptionalNumber;
  mandatory: boolean;
  administered: boolean;
}

export interface CompositeResult {
  sum: OptionalNumber;
  iq: OptionalNumber;
  percentile: number | string | null;
  ciLow: OptionalNumber;
  ciHigh: OptionalNumber;
  available: boolean;
}

export interface StrengthRow {
  index: number;
  scaled: OptionalNumber;
  mean: OptionalNumber;
  deviation: OptionalNumber;
  critical: OptionalNumber;
  strength: "T" | "N" | null;
  administered: boolean;
}

export interface StrengthAnalysis {
  verbalSum: OptionalNumber;
  performanceSum: OptionalNumber;
  overallSum: OptionalNumber;
  verbalMean: OptionalNumber;
  performanceMean: OptionalNumber;
  overallMean: OptionalNumber;
  verbalCount: number;
  performanceCount: number;
  overallCount: number;
  viqPiqAbsDiff: OptionalNumber;
  useOverallMean: boolean | null;
  meanRuleLabel: string | null;
  classificationsValid: boolean;
  rows: StrengthRow[];
}

export interface DiscrepancyRow {
  id: string;
  label: string;
  score1: OptionalNumber;
  score2: OptionalNumber;
  difference: OptionalNumber;
  critical: OptionalNumber;
  baseRate: number | string | null;
  baseRateHalf: number | string | null;
  available: boolean;
}

export interface DigitSpanSupplementary {
  longestForward: OptionalNumber;
  longestBackward: OptionalNumber;
  forwardCumulative: OptionalNumber;
  backwardCumulative: OptionalNumber;
  difference: OptionalNumber;
  differenceCumulative: OptionalNumber;
}

export interface Wais3Result {
  valid: boolean;
  issues: ValidationIssue[];
  ageGroup: OptionalNumber;
  digitSpanAgeGroup: OptionalNumber;
  subtests: ScaledSubtestResult[];
  viq: CompositeResult;
  piq: CompositeResult;
  fsiq: CompositeResult;
  vci: CompositeResult;
  poi: CompositeResult;
  wmi: CompositeResult;
  psi: CompositeResult;
  strength: StrengthAnalysis;
  discrepancies: DiscrepancyRow[];
  digitSpan: DigitSpanSupplementary;
}
