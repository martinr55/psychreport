import type {
  CompositeResult,
  DigitSpanSupplementary,
  DiscrepancyRow,
  OptionalNumber,
  ScaledSubtestResult,
  StrengthAnalysis,
  StrengthRow,
  Wais3Input,
  Wais3Result,
} from "@/scoring/wais3/types";
import {
  DISCREPANCY_DEFS,
  MANDATORY_COUNT,
  OVERALL_MEAN_LABEL,
  PERFORMANCE_INDEXES,
  PIQ_INDEXES,
  POI_INDEXES,
  PSI_INDEXES,
  SEPARATE_MEAN_LABEL,
  STRENGTH_ORDER,
  SUBTEST_COUNT,
  VCI_INDEXES,
  VERBAL_INDEXES,
  VIQ_INDEXES,
  WAIS3_TABLES,
  WMI_INDEXES,
} from "@/scoring/wais3/tables";
import {
  lookupAgeGroup,
  lookupComposite,
  matchExact,
  scaledScoreFromRaw,
} from "@/scoring/wais3/lookup";
import { validateWais3Input } from "@/scoring/wais3/validate";

const EMPTY_COMPOSITE: CompositeResult = {
  sum: null,
  iq: null,
  percentile: null,
  ciLow: null,
  ciHigh: null,
  available: false,
};

function emptyStrength(): StrengthAnalysis {
  return {
    verbalSum: null,
    performanceSum: null,
    overallSum: null,
    verbalMean: null,
    performanceMean: null,
    overallMean: null,
    verbalCount: 0,
    performanceCount: 0,
    overallCount: 0,
    viqPiqAbsDiff: null,
    useOverallMean: null,
    meanRuleLabel: null,
    classificationsValid: false,
    rows: STRENGTH_ORDER.map((index) => ({
      index,
      scaled: null,
      mean: null,
      deviation: null,
      critical: null,
      strength: null,
      administered: false,
    })),
  };
}

function emptyDigitSpan(): DigitSpanSupplementary {
  return {
    longestForward: null,
    longestBackward: null,
    forwardCumulative: null,
    backwardCumulative: null,
    difference: null,
    differenceCumulative: null,
  };
}

function emptyResult(issues: Wais3Result["issues"], valid: boolean): Wais3Result {
  return {
    valid,
    issues,
    ageGroup: null,
    digitSpanAgeGroup: null,
    subtests: Array.from({ length: SUBTEST_COUNT }, (_, index) => ({
      index,
      raw: null,
      scaled: null,
      mandatory: index < MANDATORY_COUNT,
      administered: false,
    })),
    viq: { ...EMPTY_COMPOSITE },
    piq: { ...EMPTY_COMPOSITE },
    fsiq: { ...EMPTY_COMPOSITE },
    vci: { ...EMPTY_COMPOSITE },
    poi: { ...EMPTY_COMPOSITE },
    wmi: { ...EMPTY_COMPOSITE },
    psi: { ...EMPTY_COMPOSITE },
    strength: emptyStrength(),
    discrepancies: DISCREPANCY_DEFS.map((def) => ({
      id: def.id,
      label: def.label,
      score1: null,
      score2: null,
      difference: null,
      critical: null,
      baseRate: null,
      baseRateHalf: null,
      available: false,
    })),
    digitSpan: emptyDigitSpan(),
  };
}

function sumScaled(
  subtests: ScaledSubtestResult[],
  indexes: readonly number[],
): OptionalNumber {
  const values = indexes.map((index) => subtests[index]?.scaled ?? null);
  if (values.some((value) => value === null)) {
    return null;
  }
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function toComposite(
  sum: OptionalNumber,
  table: (typeof WAIS3_TABLES.composites)["viq"],
): CompositeResult {
  if (sum === null) {
    return { ...EMPTY_COMPOSITE };
  }
  const row = lookupComposite(sum, table);
  if (!row) {
    return { ...EMPTY_COMPOSITE, sum, available: false };
  }
  return {
    sum,
    iq: row.iq,
    percentile: row.percentile,
    ciLow: row.ciLow,
    ciHigh: row.ciHigh,
    available: true,
  };
}

function meanOf(values: number[]): OptionalNumber {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatHalfRate(value: number | string): number | string {
  if (typeof value === "string") {
    return value;
  }
  const half = value / 2;
  return Number(half.toFixed(10));
}

function lookupBaseRate(
  absDiff: number,
  comparisonIndex: number,
): { rate: number | string | null; half: number | string | null } {
  const table = WAIS3_TABLES.baseRates;
  if (absDiff > 40) {
    const floor = table[0]?.rates[comparisonIndex];
    if (floor == null) {
      return { rate: null, half: null };
    }
    return { rate: `<${floor}`, half: `<${formatHalfRate(floor)}` };
  }
  const row = table.find((item) => item.diff === absDiff);
  const rate = row?.rates[comparisonIndex] ?? null;
  if (rate == null) {
    return { rate: null, half: null };
  }
  return { rate, half: formatHalfRate(rate) };
}

function buildStrength(
  subtests: ScaledSubtestResult[],
  viq: CompositeResult,
  piq: CompositeResult,
): StrengthAnalysis {
  const administered = subtests.filter((item) => item.administered && item.scaled !== null);
  const verbalValues = VERBAL_INDEXES.map((index) => subtests[index])
    .filter((item) => item.administered && item.scaled !== null)
    .map((item) => item.scaled as number);
  const performanceValues = PERFORMANCE_INDEXES.map((index) => subtests[index])
    .filter((item) => item.administered && item.scaled !== null)
    .map((item) => item.scaled as number);
  const overallValues = administered.map((item) => item.scaled as number);

  const verbalMean = meanOf(verbalValues);
  const performanceMean = meanOf(performanceValues);
  const overallMean = meanOf(overallValues);
  const classificationsValid = administered.length === SUBTEST_COUNT;

  let useOverallMean: boolean | null = null;
  let meanRuleLabel: string | null = null;
  let viqPiqAbsDiff: OptionalNumber = null;
  if (viq.available && piq.available && viq.iq !== null && piq.iq !== null) {
    viqPiqAbsDiff = Math.abs(viq.iq - piq.iq);
    useOverallMean = viqPiqAbsDiff < 17;
    meanRuleLabel = useOverallMean ? OVERALL_MEAN_LABEL : SEPARATE_MEAN_LABEL;
  } else if (overallMean !== null) {
    useOverallMean = true;
    meanRuleLabel = OVERALL_MEAN_LABEL;
  }

  const rows: StrengthRow[] = STRENGTH_ORDER.map((index, order) => {
    const subtest = subtests[index];
    const isVerbal = (VERBAL_INDEXES as readonly number[]).includes(index);
    const comparisonMean =
      useOverallMean === false
        ? isVerbal
          ? verbalMean
          : performanceMean
        : overallMean;
    const administeredRow = subtest.administered && subtest.scaled !== null;
    const deviation =
      administeredRow && subtest.scaled !== null && comparisonMean !== null
        ? subtest.scaled - comparisonMean
        : null;
    const critical = classificationsValid
      ? useOverallMean
        ? WAIS3_TABLES.strengthCriticals[order]?.vsOverall ?? null
        : WAIS3_TABLES.strengthCriticals[order]?.vsSeparate ?? null
      : null;
    let strength: StrengthRow["strength"] = null;
    if (classificationsValid && deviation !== null && critical !== null) {
      if (deviation > critical) {
        strength = "T";
      } else if (deviation * -1 > critical) {
        strength = "N";
      }
    }
    return {
      index,
      scaled: administeredRow ? subtest.scaled : null,
      mean: administeredRow ? comparisonMean : null,
      deviation,
      critical,
      strength,
      administered: administeredRow,
    };
  });

  return {
    verbalSum: verbalValues.length ? verbalValues.reduce((a, b) => a + b, 0) : null,
    performanceSum: performanceValues.length
      ? performanceValues.reduce((a, b) => a + b, 0)
      : null,
    overallSum: overallValues.length ? overallValues.reduce((a, b) => a + b, 0) : null,
    verbalMean,
    performanceMean,
    overallMean,
    verbalCount: verbalValues.length,
    performanceCount: performanceValues.length,
    overallCount: overallValues.length,
    viqPiqAbsDiff,
    useOverallMean,
    meanRuleLabel,
    classificationsValid,
    rows,
  };
}

function buildDiscrepancies(
  composites: Record<"viq" | "piq" | "vci" | "poi" | "wmi" | "psi", CompositeResult>,
  ageGroup: number,
): DiscrepancyRow[] {
  const criticals = WAIS3_TABLES.discrepancyCriticals[ageGroup - 1] ?? [];
  return DISCREPANCY_DEFS.map((def, index) => {
    const left = composites[def.left];
    const right = composites[def.right];
    const available =
      left.available &&
      right.available &&
      left.iq !== null &&
      right.iq !== null;
    if (!available) {
      return {
        id: def.id,
        label: def.label,
        score1: left.iq,
        score2: right.iq,
        difference: null,
        critical: criticals[index] ?? null,
        baseRate: null,
        baseRateHalf: null,
        available: false,
      };
    }
    const difference = (left.iq as number) - (right.iq as number);
    const critical = criticals[index] ?? null;
    const absDiff = Math.abs(difference);
    let baseRate: number | string | null = null;
    let baseRateHalf: number | string | null = null;
    if (critical !== null && absDiff >= critical) {
      const lookedUp = lookupBaseRate(absDiff, index);
      baseRate = lookedUp.rate;
      baseRateHalf = lookedUp.half;
    }
    return {
      id: def.id,
      label: def.label,
      score1: left.iq,
      score2: right.iq,
      difference,
      critical,
      baseRate,
      baseRateHalf,
      available: true,
    };
  });
}

function buildDigitSpan(
  input: Wais3Input,
  digitSpanAgeGroup: OptionalNumber,
  issues: Wais3Result["issues"],
): DigitSpanSupplementary {
  const digitSpan: DigitSpanSupplementary = {
    longestForward: input.longestForward,
    longestBackward: input.longestBackward,
    forwardCumulative: null,
    backwardCumulative: null,
    difference: null,
    differenceCumulative: null,
  };
  const invalid = issues.some(
    (issue) =>
      issue.code === "invalid" &&
      (issue.field === "longestForward" || issue.field === "longestBackward"),
  );
  if (invalid || digitSpanAgeGroup === null) {
    return digitSpan;
  }
  const table = WAIS3_TABLES.digitSpanCumulative[digitSpanAgeGroup - 1];
  const diffTable = WAIS3_TABLES.digitSpanDifference[digitSpanAgeGroup - 1];
  if (input.longestForward !== null && table) {
    digitSpan.forwardCumulative = matchExact(
      input.longestForward,
      table.keys,
      table.forward,
    );
  }
  if (input.longestBackward !== null && table) {
    digitSpan.backwardCumulative = matchExact(
      input.longestBackward,
      table.keys,
      table.backward,
    );
  }
  if (input.longestForward !== null && input.longestBackward !== null) {
    digitSpan.difference = input.longestForward - input.longestBackward;
    if (diffTable) {
      digitSpan.differenceCumulative = matchExact(
        digitSpan.difference,
        diffTable.keys,
        diffTable.rates,
      );
    }
  }
  return digitSpan;
}

function hasInvalidCoreValues(issues: Wais3Result["issues"]): boolean {
  return issues.some(
    (issue) =>
      issue.code === "invalid" &&
      issue.field !== "longestForward" &&
      issue.field !== "longestBackward",
  );
}

export function calculateWais3(input: Wais3Input): Wais3Result {
  const issues = validateWais3Input(input);
  if (hasInvalidCoreValues(issues)) {
    const result = emptyResult(issues, false);
    result.digitSpan = buildDigitSpan(
      input,
      input.age === null
        ? null
        : lookupAgeGroup(input.age, WAIS3_TABLES.ageToDigitSpanGroup),
      issues,
    );
    return result;
  }

  const ageGroup =
    input.age === null ? null : lookupAgeGroup(input.age, WAIS3_TABLES.ageToScaledGroup);
  const digitSpanAgeGroup =
    input.age === null
      ? null
      : lookupAgeGroup(input.age, WAIS3_TABLES.ageToDigitSpanGroup);

  const result = emptyResult(issues, !hasInvalidCoreValues(issues));
  result.ageGroup = ageGroup;
  result.digitSpanAgeGroup = digitSpanAgeGroup;
  result.digitSpan = buildDigitSpan(input, digitSpanAgeGroup, issues);

  if (ageGroup === null) {
    return result;
  }

  const subtests: ScaledSubtestResult[] = input.rawScores.map((raw, index) => {
    const administered = raw !== null;
    return {
      index,
      raw,
      scaled:
        administered && raw !== null
          ? scaledScoreFromRaw(index, ageGroup, raw)
          : null,
      mandatory: index < MANDATORY_COUNT,
      administered,
    };
  });
  result.subtests = subtests;

  result.viq = toComposite(sumScaled(subtests, VIQ_INDEXES), WAIS3_TABLES.composites.viq);
  result.piq = toComposite(sumScaled(subtests, PIQ_INDEXES), WAIS3_TABLES.composites.piq);
  result.fsiq = toComposite(
    result.viq.sum !== null && result.piq.sum !== null
      ? result.viq.sum + result.piq.sum
      : null,
    WAIS3_TABLES.composites.fsiq,
  );
  result.vci = toComposite(sumScaled(subtests, VCI_INDEXES), WAIS3_TABLES.composites.vci);
  result.poi = toComposite(sumScaled(subtests, POI_INDEXES), WAIS3_TABLES.composites.poi);
  result.wmi = toComposite(sumScaled(subtests, WMI_INDEXES), WAIS3_TABLES.composites.wmi);
  result.psi = toComposite(sumScaled(subtests, PSI_INDEXES), WAIS3_TABLES.composites.psi);

  result.strength = buildStrength(subtests, result.viq, result.piq);
  result.discrepancies = buildDiscrepancies(
    {
      viq: result.viq,
      piq: result.piq,
      vci: result.vci,
      poi: result.poi,
      wmi: result.wmi,
      psi: result.psi,
    },
    ageGroup,
  );

  return result;
}

export function emptyWais3Input(): Wais3Input {
  return {
    age: null,
    rawScores: Array.from({ length: SUBTEST_COUNT }, () => null),
    longestForward: null,
    longestBackward: null,
  };
}
