"use client";

import { useState } from "react";
import { GenerateReportButton } from "@/components/report/GenerateReportButton";
import { ReportDocumentView } from "@/components/report/ReportDocumentView";
import { useLocale } from "@/i18n/LocaleProvider";
import type { ReportDocument } from "@/types/reportDocument";

interface ReportPreviewProps {
  report: ReportDocument | null;
  onGenerate: () => void;
}

const secondaryButtonClassName =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-teal-800 bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 shadow-sm transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white";

export function ReportPreview({ report, onGenerate }: ReportPreviewProps) {
  const { t } = useLocale();
  const [downloading, setDownloading] = useState<"docx" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = downloading !== null;
  const canDownload = report !== null && !busy;

  async function download(kind: "docx" | "pdf") {
    if (!report) {
      return;
    }
    setDownloading(kind);
    setError(null);
    try {
      if (kind === "docx") {
        const { downloadReportDocx } = await import(
          "@/lib/export/downloadReportDocx"
        );
        await downloadReportDocx(report);
      } else {
        const { downloadReportPdf } = await import(
          "@/lib/export/downloadReportPdf"
        );
        await downloadReportPdf(report);
      }
    } catch (caught) {
      console.error(caught);
      setError(t.downloadFailed);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <aside className="flex h-full min-h-[640px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
              {t.outputEyebrow}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {t.reportPreviewTitle}
            </h2>
          </div>
          <GenerateReportButton label={t.generateReport} onGenerate={onGenerate} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={!canDownload}
            aria-busy={downloading === "docx"}
            title={report ? undefined : t.downloadUnavailable}
            onClick={() => void download("docx")}
          >
            {downloading === "docx" ? t.downloadingDocx : t.downloadDocx}
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={!canDownload}
            aria-busy={downloading === "pdf"}
            title={report ? undefined : t.downloadUnavailable}
            onClick={() => void download("pdf")}
          >
            {downloading === "pdf" ? t.downloadingPdf : t.downloadPdf}
          </button>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
      <div className="flex-1 overflow-auto bg-[#fbfaf6] px-5 py-4">
        {report ? (
          <ReportDocumentView report={report} />
        ) : (
          <p className="font-serif text-[15px] leading-7 text-slate-600">
            {t.reportEmpty}
          </p>
        )}
      </div>
    </aside>
  );
}
