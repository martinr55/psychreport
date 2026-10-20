import type { CompositeLookupRow, Wais3Tables } from "@/scoring/wais3/tables";
import { WAIS3_TABLES } from "@/scoring/wais3/tables";

export function matchType1(lookup: number, values: (number | null)[]): number | null {
  let last: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value == null) {
      continue;
    }
    if (value <= lookup) {
      last = i + 1;
    } else {
      break;
    }
  }
  return last;
}

export function matchExact<T>(
  lookup: number,
  keys: (number | null)[],
  values: T[],
): T | null {
  const index = keys.findIndex((key) => key === lookup);
  if (index < 0) {
    return null;
  }
  return values[index] ?? null;
}

export function scaledScoreFromRaw(
  subtestIndex: number,
  ageGroup: number,
  raw: number,
  tables: Wais3Tables = WAIS3_TABLES,
): number | null {
  const thresholds = tables.rawMaxBySubtestAge[subtestIndex]?.[ageGroup - 1];
  if (!thresholds) {
    return null;
  }
  return matchType1(raw, thresholds);
}

export function lookupComposite(
  sum: number,
  rows: CompositeLookupRow[],
): CompositeLookupRow | null {
  return rows.find((row) => row.sum === sum) ?? null;
}

export function lookupAgeGroup(
  age: number,
  groups: number[],
): number | null {
  return groups[age - 16] ?? null;
}
