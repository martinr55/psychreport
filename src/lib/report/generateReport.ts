import OpenAI from "openai";
import { REPORT_INSTRUCTIONS } from "@/lib/report/instructions";
import {
  parseReportSections,
  reportSectionSchema,
  type ReportSections,
} from "@/lib/report/sections";
import type { ReportContext } from "@/lib/report/buildReportContext";

const DEFAULT_MODEL = "gpt-4.1";

export class ReportGenerationError extends Error {
  readonly code: "not_configured" | "upstream" | "invalid_output";
  readonly status?: number;

  constructor(
    code: "not_configured" | "upstream" | "invalid_output",
    status?: number,
  ) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export function reportModel(): string {
  const configured = process.env.OPENAI_MODEL?.trim();
  return configured || DEFAULT_MODEL;
}

export async function generateReportSections(
  context: ReportContext,
): Promise<ReportSections> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new ReportGenerationError("not_configured");
  }

  const client = new OpenAI({ apiKey, timeout: 120_000 });
  let response: Awaited<ReturnType<typeof client.responses.create>>;
  try {
    response = await client.responses.create({
      model: reportModel(),
      store: false,
      stream: false,
      instructions: REPORT_INSTRUCTIONS,
      input: JSON.stringify(context),
      max_output_tokens: 8000,
      text: {
        format: {
          type: "json_schema",
          name: "cognitive_report_sections",
          strict: true,
          schema: reportSectionSchema,
        },
      },
    });
  } catch (error) {
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    throw new ReportGenerationError("upstream", status);
  }

  if (response.status && response.status !== "completed") {
    throw new ReportGenerationError("upstream");
  }

  try {
    return parseReportSections(response.output_text);
  } catch {
    throw new ReportGenerationError("invalid_output");
  }
}
