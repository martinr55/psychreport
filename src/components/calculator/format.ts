import type { OptionalNumber } from "@/scoring/wais3/types";

export function displayNumber(
  value: OptionalNumber | string,
  digits?: number,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "string") {
    return value;
  }
  if (digits === undefined) {
    return Number.isInteger(value) ? String(value) : String(value);
  }
  return value.toFixed(digits);
}

export function displayMaybe(
  available: boolean,
  value: OptionalNumber | string,
  digits?: number,
): string {
  if (!available) {
    return "—";
  }
  return displayNumber(value, digits);
}

export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  return Number(trimmed);
}
