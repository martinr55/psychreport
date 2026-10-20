import { describe, expect, it } from "vitest";
import { calculateWais3, emptyWais3Input } from "@/scoring/wais3/calculate";
import { scaledScoreFromRaw } from "@/scoring/wais3/lookup";

const WORKBOOK_EXAMPLE = {
  age: 50,
  rawScores: [22, 56, 50, 28, 46, 12, 24, 12, 20, 15, 25, 15, 5, 30],
  longestForward: 6,
  longestBackward: 5,
};

describe("WAIS-III calculator", () => {
  it("matches the workbook example for complete valid inputs", () => {
    const result = calculateWais3(WORKBOOK_EXAMPLE);
    expect(result.valid).toBe(true);
    expect(result.ageGroup).toBe(7);
    expect(result.digitSpanAgeGroup).toBe(4);
    expect(result.subtests.map((item) => item.scaled)).toEqual([
      13, 14, 7, 12, 11, 8, 15, 7, 11, 12, 11, 5, 5, 10,
    ]);
    expect(result.viq).toMatchObject({ sum: 63, iq: 103, percentile: 58, ciLow: 97, ciHigh: 108 });
    expect(result.piq).toMatchObject({ sum: 58, iq: 110, percentile: 75, ciLow: 102, ciHigh: 117 });
    expect(result.fsiq).toMatchObject({ sum: 121, iq: 107, percentile: 68, ciLow: 102, ciHigh: 112 });
    expect(result.vci).toMatchObject({ sum: 37, iq: 114, percentile: 82, ciLow: 106, ciHigh: 120 });
    expect(result.poi).toMatchObject({ sum: 39, iq: 118, percentile: 88, ciLow: 108, ciHigh: 125 });
    expect(result.wmi).toMatchObject({ sum: 20, iq: 78, percentile: 7, ciLow: 72, ciHigh: 89 });
    expect(result.psi).toMatchObject({ sum: 12, iq: 77, percentile: 6, ciLow: 71, ciHigh: 87 });
    expect(result.strength.classificationsValid).toBe(true);
    expect(result.strength.useOverallMean).toBe(true);
    expect(result.strength.overallCount).toBe(14);
    expect(result.strength.rows[6]?.strength).toBe("N");
    expect(result.strength.rows[10]?.strength).toBe("T");
    expect(result.strength.rows[12]?.strength).toBe("N");
    expect(result.discrepancies[0]).toMatchObject({ difference: -7, critical: 9.91, baseRate: null });
    expect(result.discrepancies[2]).toMatchObject({ difference: 36, baseRate: 1.2, baseRateHalf: 0.6 });
    expect(result.discrepancies[3]?.baseRate).toBe("<0.8");
    expect(result.digitSpan).toMatchObject({
      forwardCumulative: 65.8,
      backwardCumulative: 60,
      difference: 1,
      differenceCumulative: 84.5,
    });
  });

  it("treats raw score 0 as a convertible score and missing as absent", () => {
    const zero = calculateWais3({
      ...WORKBOOK_EXAMPLE,
      rawScores: [0, ...WORKBOOK_EXAMPLE.rawScores.slice(1)],
    });
    const missing = calculateWais3({
      ...WORKBOOK_EXAMPLE,
      rawScores: [null, ...WORKBOOK_EXAMPLE.rawScores.slice(1)],
    });
    expect(zero.subtests[0]?.scaled).toBe(1);
    expect(zero.piq.available).toBe(true);
    expect(missing.subtests[0]?.scaled).toBeNull();
    expect(missing.piq.available).toBe(false);
    expect(missing.fsiq.available).toBe(false);
    expect(missing.viq.available).toBe(true);
  });

  it("converts at age-band and raw-score boundaries", () => {
    expect(scaledScoreFromRaw(0, 7, 21)).toBe(11);
    expect(scaledScoreFromRaw(0, 7, 22)).toBe(13);
    expect(scaledScoreFromRaw(1, 1, 0)).toBe(1);
    const age44 = calculateWais3({ ...WORKBOOK_EXAMPLE, age: 44 });
    const age45 = calculateWais3({ ...WORKBOOK_EXAMPLE, age: 45 });
    expect(age44.ageGroup).toBe(6);
    expect(age45.ageGroup).toBe(7);
    expect(age44.subtests[0]?.scaled).not.toBe(age45.subtests[0]?.scaled);
  });

  it("calculates VIQ/PIQ/FSIQ without optional subtests", () => {
    const withoutOptional = calculateWais3({
      ...WORKBOOK_EXAMPLE,
      rawScores: [...WORKBOOK_EXAMPLE.rawScores.slice(0, 11), null, null, null],
    });
    expect(withoutOptional.viq.iq).toBe(103);
    expect(withoutOptional.piq.iq).toBe(110);
    expect(withoutOptional.fsiq.iq).toBe(107);
    expect(withoutOptional.vci.available).toBe(true);
    expect(withoutOptional.poi.available).toBe(true);
    expect(withoutOptional.wmi.available).toBe(false);
    expect(withoutOptional.psi.available).toBe(false);
    expect(withoutOptional.strength.overallCount).toBe(11);
    expect(withoutOptional.strength.classificationsValid).toBe(false);
    expect(withoutOptional.strength.rows.every((row) => row.strength === null)).toBe(true);
    expect(withoutOptional.discrepancies.find((row) => row.id === "VCI-WMI")?.available).toBe(
      false,
    );
  });

  it("uses the number of administered subtests as the strength-analysis denominator", () => {
    const result = calculateWais3({
      ...WORKBOOK_EXAMPLE,
      rawScores: [...WORKBOOK_EXAMPLE.rawScores.slice(0, 13), null],
    });
    expect(result.strength.overallCount).toBe(13);
    expect(result.strength.overallMean).toBeCloseTo(131 / 13, 10);
    expect(result.strength.performanceCount).toBe(6);
    expect(result.strength.rows[13]?.administered).toBe(false);
    expect(result.strength.rows[13]?.deviation).toBeNull();
  });

  it("does not produce results for invalid numbers", () => {
    const tooYoung = calculateWais3({ ...WORKBOOK_EXAMPLE, age: 15 });
    const notInteger = calculateWais3({ ...WORKBOOK_EXAMPLE, age: 50.5 });
    const rawTooHigh = calculateWais3({
      ...WORKBOOK_EXAMPLE,
      rawScores: [201, ...WORKBOOK_EXAMPLE.rawScores.slice(1)],
    });
    expect(tooYoung.valid).toBe(false);
    expect(tooYoung.viq.available).toBe(false);
    expect(tooYoung.subtests.every((item) => item.scaled === null)).toBe(true);
    expect(notInteger.valid).toBe(false);
    expect(rawTooHigh.valid).toBe(false);
    expect(rawTooHigh.subtests.every((item) => item.scaled === null)).toBe(true);
  });

  it("recalculates dependent values when inputs change", () => {
    const first = calculateWais3(WORKBOOK_EXAMPLE);
    const changed = calculateWais3({
      ...WORKBOOK_EXAMPLE,
      rawScores: [24, ...WORKBOOK_EXAMPLE.rawScores.slice(1)],
    });
    expect(changed.subtests[0]?.scaled).not.toBe(first.subtests[0]?.scaled);
    expect(changed.piq.iq).not.toBe(first.piq.iq);
    expect(changed.fsiq.iq).not.toBe(first.fsiq.iq);
    expect(changed.poi.iq).not.toBe(first.poi.iq);
  });

  it("treats missing symbol search, letter-number sequencing, and object assembly independently", () => {
    const withoutSs = calculateWais3({
      ...WORKBOOK_EXAMPLE,
      rawScores: WORKBOOK_EXAMPLE.rawScores.map((value, index) =>
        index === 11 ? null : value,
      ),
    });
    const withoutLns = calculateWais3({
      ...WORKBOOK_EXAMPLE,
      rawScores: WORKBOOK_EXAMPLE.rawScores.map((value, index) =>
        index === 12 ? null : value,
      ),
    });
    const withoutOa = calculateWais3({
      ...WORKBOOK_EXAMPLE,
      rawScores: WORKBOOK_EXAMPLE.rawScores.map((value, index) =>
        index === 13 ? null : value,
      ),
    });
    expect(withoutSs.psi.available).toBe(false);
    expect(withoutSs.wmi.available).toBe(true);
    expect(withoutSs.fsiq.available).toBe(true);
    expect(withoutLns.wmi.available).toBe(false);
    expect(withoutLns.psi.available).toBe(true);
    expect(withoutLns.fsiq.available).toBe(true);
    expect(withoutOa.fsiq.available).toBe(true);
    expect(withoutOa.psi.available).toBe(true);
    expect(withoutOa.wmi.available).toBe(true);
    expect(withoutOa.strength.overallCount).toBe(13);
  });

  it("starts from an empty input without fabricating zeros", () => {
    const result = calculateWais3(emptyWais3Input());
    expect(result.viq.iq).toBeNull();
    expect(result.subtests.every((item) => item.scaled === null)).toBe(true);
    expect(result.digitSpan.difference).toBeNull();
  });
});
