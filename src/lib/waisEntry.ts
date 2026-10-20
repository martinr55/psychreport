import { parseOptionalNumber } from "@/components/calculator/format";
import { SUBTEST_COUNT } from "@/scoring/wais3/tables";
import type { Wais3Input } from "@/scoring/wais3/types";

export interface WaisScoreEntry {
  rawScores: string[];
  longestForward: string;
  longestBackward: string;
}

export function emptyWaisScoreEntry(): WaisScoreEntry {
  return {
    rawScores: Array.from({ length: SUBTEST_COUNT }, () => ""),
    longestForward: "",
    longestBackward: "",
  };
}

export function waisInputFromEntry(
  age: number | "",
  entry: WaisScoreEntry,
): Wais3Input {
  return {
    age: age === "" ? null : age,
    rawScores: Array.from({ length: SUBTEST_COUNT }, (_, index) =>
      parseOptionalNumber(entry.rawScores[index] ?? ""),
    ),
    longestForward: parseOptionalNumber(entry.longestForward),
    longestBackward: parseOptionalNumber(entry.longestBackward),
  };
}
