import type { ReportDocument } from "@/types/reportDocument";
import type { BilingualMessage } from "@/lib/report/parseReportRequest";

function isReportDocument(value: unknown): value is ReportDocument {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const record = value as Partial<ReportDocument>;
  return (
    typeof record.title === "string" &&
    typeof record.fileBaseName === "string" &&
    Array.isArray(record.blocks)
  );
}

export async function requestClinicalReport(
  body: unknown,
): Promise<
  | { ok: true; report: ReportDocument }
  | { ok: false; messages: BilingualMessage[] }
> {
  const failed: BilingualMessage = {
    et: "Aruande koostamine ebaõnnestus. Proovi uuesti.",
    en: "Report generation failed. Try again.",
  };
  const network: BilingualMessage = {
    et: "Võrguühendus ebaõnnestus.",
    en: "The network request failed.",
  };

  let response: Response;
  try {
    response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, messages: [network] };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, messages: [failed] };
  }

  if (!response.ok) {
    const messages =
      payload !== null &&
      typeof payload === "object" &&
      Array.isArray((payload as { messages?: unknown }).messages)
        ? (payload as { messages: BilingualMessage[] }).messages.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.et === "string" &&
              typeof item.en === "string",
          )
        : [];
    return { ok: false, messages: messages.length > 0 ? messages : [failed] };
  }

  const report =
    payload !== null && typeof payload === "object"
      ? (payload as { report?: unknown }).report
      : undefined;
  if (!isReportDocument(report)) {
    return { ok: false, messages: [failed] };
  }
  return { ok: true, report };
}
