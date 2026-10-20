export const REPORT_SECTION_KEYS = [
  "background",
  "testBehavior",
  "interpretation",
  "conclusions",
  "recommendations",
] as const;

export type ReportSectionKey = (typeof REPORT_SECTION_KEYS)[number];

export type ReportSections = Record<ReportSectionKey, string[]>;

export const reportSectionSchema: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [...REPORT_SECTION_KEYS],
  properties: Object.fromEntries(
    REPORT_SECTION_KEYS.map((key) => [
      key,
      {
        type: "array",
        items: { type: "string" },
      },
    ]),
  ),
};

export function parseReportSections(text: string): ReportSections {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("invalid_output");
  }
  if (value === null || typeof value !== "object") {
    throw new Error("invalid_output");
  }
  const record = value as Record<string, unknown>;
  const sections = {} as ReportSections;
  for (const key of REPORT_SECTION_KEYS) {
    const items = record[key];
    if (!Array.isArray(items)) {
      throw new Error("invalid_output");
    }
    sections[key] = items
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter((item) => item.length > 0)
      .slice(0, 12);
  }
  return sections;
}
