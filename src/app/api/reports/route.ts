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
import { reserveReportCall } from "@/lib/report/usageLimit";

function jsonError(
  status: number,
  error: string,
  messages: BilingualMessage[],
  retryAfterSeconds?: number,
) {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (retryAfterSeconds !== undefined) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }
  return Response.json({ error, messages }, { status, headers });
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

  const reservation = reserveReportCall();
  if (!reservation.ok) {
    if (reservation.reason === "daily_limit") {
      return jsonError(
        429,
        "daily_limit",
        [
          {
            et: "Päevane piir on 25 aruannet. Uusi aruandeid saab koostada homme.",
            en: "The daily limit is 25 reports. New reports can be generated tomorrow.",
          },
        ],
        reservation.retryAfterSeconds,
      );
    }
    return jsonError(
      429,
      "rate_limit",
      [
        {
          et: "Liiga palju aruandepäringuid. Proovi minuti pärast uuesti.",
          en: "Too many report requests. Try again in a minute.",
        },
      ],
      reservation.retryAfterSeconds,
    );
  }

  let succeeded = false;
  try {
    const sections = await generateReportSections(
      buildReportContext({
        observations: parsed.value.observations,
        conclusions: parsed.value.conclusions,
        result,
        eek2: parsed.value.eek2,
      }),
    );
    const report = assembleReport({
      info: parsed.value.info,
      result,
      sections,
      eek2: parsed.value.eek2,
    });
    succeeded = true;
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
  } finally {
    reservation.finish(succeeded);
  }
}
