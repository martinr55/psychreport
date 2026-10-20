import { calculateWais3 } from "@/scoring/wais3/calculate";
import { assembleReport } from "@/lib/report/assembleReport";
import { buildReportContext } from "@/lib/report/buildReportContext";
import {
  ReportGenerationError,
  generateReportSections,
} from "@/lib/report/generateReport";
import {
  parseReportRequest,
  reportabilityMessages,
  type BilingualMessage,
} from "@/lib/report/parseReportRequest";

function jsonError(
  status: number,
  error: string,
  messages: BilingualMessage[],
) {
  return Response.json(
    { error, messages },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_request", [
      {
        et: "Päring ei ole korrektne JSON.",
        en: "The request is not valid JSON.",
      },
    ]);
  }

  const parsed = parseReportRequest(body);
  if (!parsed.ok) {
    return jsonError(parsed.status, parsed.error, parsed.messages);
  }

  const result = calculateWais3(parsed.value.waisInput);
  const blocked = reportabilityMessages(result);
  if (blocked) {
    return jsonError(422, "incomplete_scores", blocked);
  }

  try {
    const sections = await generateReportSections(
      buildReportContext({
        info: parsed.value.info,
        observations: parsed.value.observations,
        conclusions: parsed.value.conclusions,
        eek2: parsed.value.eek2,
        result,
      }),
    );
    const report = assembleReport({
      info: parsed.value.info,
      result,
      sections,
      eek2: parsed.value.eek2,
    });
    return Response.json(
      { report },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ReportGenerationError && error.code === "not_configured") {
      return jsonError(500, "not_configured", [
        {
          et: "Aruande teenus ei ole seadistatud.",
          en: "Report generation is not configured.",
        },
      ]);
    }
    console.error("report generation failed", {
      status: error instanceof ReportGenerationError ? error.status : undefined,
    });
    return jsonError(502, "generation_failed", [
      {
        et: "Aruande koostamine ebaõnnestus. Proovi uuesti.",
        en: "Report generation failed. Try again.",
      },
    ]);
  }
}
