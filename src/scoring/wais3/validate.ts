import type { OptionalNumber, ValidationIssue, Wais3Input } from "@/scoring/wais3/types";
import { MANDATORY_COUNT, SUBTEST_COUNT } from "@/scoring/wais3/tables";

function isIntegerInRange(
  value: OptionalNumber,
  min: number,
  max: number,
): boolean {
  return value !== null && Number.isInteger(value) && value >= min && value <= max;
}

export function validateWais3Input(input: Wais3Input): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (input.age === null) {
    issues.push({
      field: "age",
      code: "missing",
      messageEt: "Vanus on kohustuslik (16–89).",
      messageEn: "Age is required (16–89).",
    });
  } else if (!isIntegerInRange(input.age, 16, 89)) {
    issues.push({
      field: "age",
      code: "invalid",
      messageEt: "Vanus peab olema täisarv vahemikus 16–89.",
      messageEn: "Age must be an integer between 16 and 89.",
    });
  }

  if (input.rawScores.length !== SUBTEST_COUNT) {
    issues.push({
      field: "rawScores",
      code: "invalid",
      messageEt: "Sisestada tuleb 14 allskaala toorskoori.",
      messageEn: "Fourteen subtest raw scores are required.",
    });
  }

  input.rawScores.forEach((raw, index) => {
    const mandatory = index < MANDATORY_COUNT;
    if (raw === null) {
      if (mandatory) {
        issues.push({
          field: `raw-${index}`,
          code: "missing",
          messageEt: `Allskaala ${index + 1} toorskoor on kohustuslik.`,
          messageEn: `Subtest ${index + 1} raw score is required.`,
        });
      }
      return;
    }
    if (!isIntegerInRange(raw, 0, 200)) {
      issues.push({
        field: `raw-${index}`,
        code: "invalid",
        messageEt: `Allskaala ${index + 1} toorskoor peab olema täisarv 0–200.`,
        messageEn: `Subtest ${index + 1} raw score must be an integer from 0 to 200.`,
      });
    }
  });

  for (const [field, value, labelEt, labelEn] of [
    ["longestForward", input.longestForward, "Pikim edaspidi seeria", "Longest forward span"],
    ["longestBackward", input.longestBackward, "Pikim tagurpidi seeria", "Longest backward span"],
  ] as const) {
    if (value === null) {
      continue;
    }
    if (!isIntegerInRange(value, 0, 9)) {
      issues.push({
        field,
        code: "invalid",
        messageEt: `${labelEt} peab olema täisarv 0–9.`,
        messageEn: `${labelEn} must be an integer from 0 to 9.`,
      });
    }
  }

  return issues;
}

export function hasInvalidValues(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.code === "invalid");
}
