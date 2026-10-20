export function formatReportNumber(
  value: number | string | null | undefined,
  digits?: number,
): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "string") {
    return value.replaceAll(".", ",");
  }
  if (!Number.isFinite(value)) {
    return null;
  }
  const text =
    digits === undefined
      ? Number.isInteger(value)
        ? String(value)
        : String(value)
      : value.toFixed(digits);
  return text.replaceAll(".", ",");
}

export function formatAssessmentDate(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }
  return `${Number(match[3])}.${Number(match[2])}.${match[1]}`;
}
