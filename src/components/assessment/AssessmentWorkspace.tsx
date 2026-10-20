"use client";

import { useState } from "react";
import { AssessmentInfoForm } from "@/components/assessment/AssessmentInfoForm";
import { AssessmentInstruments } from "@/components/assessment/AssessmentInstruments";
import { ConclusionsForm } from "@/components/assessment/ConclusionsForm";
import { ObservationsForm } from "@/components/assessment/ObservationsForm";
import { FormSection } from "@/components/layout/FormSection";
import { ReportPreview } from "@/components/report/ReportPreview";
import { EMPTY_ASSESSMENT } from "@/data/emptyAssessment";
import {
  SYNTHETIC_ASSESSMENT,
  SYNTHETIC_WAIS_ENTRY,
} from "@/data/syntheticCase";
import { useLocale } from "@/i18n/LocaleProvider";
import { requestClinicalReport } from "@/lib/report/requestClinicalReport";
import {
  reportabilityMessages,
  type BilingualMessage,
} from "@/lib/report/parseReportRequest";
import { emptyWaisScoreEntry, waisInputFromEntry, type WaisScoreEntry } from "@/lib/waisEntry";
import { calculateWais3 } from "@/scoring/wais3/calculate";
import type { AssessmentDraft } from "@/types/assessment";
import type { AppLocale } from "@/types/locale";
import type { ReportDocument } from "@/types/reportDocument";

function messagesForLocale(messages: BilingualMessage[], locale: AppLocale): string[] {
  return messages.map((message) => (locale === "en" ? message.en : message.et));
}

function isPristine(draft: AssessmentDraft, entry: WaisScoreEntry): boolean {
  return (
    JSON.stringify(draft) === JSON.stringify(EMPTY_ASSESSMENT) &&
    entry.rawScores.every((score) => score === "") &&
    entry.longestForward === "" &&
    entry.longestBackward === ""
  );
}

export function AssessmentWorkspace() {
  const { locale, t } = useLocale();
  const [draft, setDraft] = useState<AssessmentDraft>(EMPTY_ASSESSMENT);
  const [waisEntry, setWaisEntry] = useState<WaisScoreEntry>(emptyWaisScoreEntry);
  const [report, setReport] = useState<ReportDocument | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateErrors, setGenerateErrors] = useState<string[]>([]);

  async function generatePreview() {
    const waisInput = waisInputFromEntry(draft.info.examineeAgeYears, waisEntry);
    const blocked = reportabilityMessages(calculateWais3(waisInput));
    if (blocked) {
      setGenerateErrors(messagesForLocale(blocked, locale));
      return;
    }
    if (report && !window.confirm(t.regenerateConfirm)) {
      return;
    }

    setGenerating(true);
    setGenerateErrors([]);
    const outcome = await requestClinicalReport({
      info: draft.info,
      observations: draft.observations,
      conclusions: draft.conclusions,
      eek2: draft.eek2,
      waisInput,
    });
    setGenerating(false);
    if (!outcome.ok) {
      setGenerateErrors(messagesForLocale(outcome.messages, locale));
      return;
    }
    setReport(outcome.report);
  }

  function loadSyntheticCase() {
    if (
      !isPristine(draft, waisEntry) &&
      !window.confirm(t.loadSyntheticConfirm)
    ) {
      return;
    }
    setDraft(SYNTHETIC_ASSESSMENT);
    setWaisEntry(SYNTHETIC_WAIS_ENTRY);
    setReport(null);
    setGenerateErrors([]);
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(36rem,1.05fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        <FormSection eyebrow={t.caseEyebrow}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              {t.syntheticCaseHint}
            </p>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center rounded-md border border-teal-800 bg-white px-3 py-2 text-sm font-semibold text-teal-900 shadow-sm transition hover:bg-teal-50"
              onClick={loadSyntheticCase}
            >
              {t.loadSyntheticCase}
            </button>
          </div>
          <AssessmentInfoForm
            value={draft.info}
            onChange={(info) => setDraft((current) => ({ ...current, info }))}
          />
        </FormSection>
        <FormSection eyebrow={t.instrumentsEyebrow}>
          <AssessmentInstruments
            age={draft.info.examineeAgeYears}
            waisEntry={waisEntry}
            onWaisEntryChange={setWaisEntry}
            eek2={draft.eek2}
            onEek2Change={(eek2) => setDraft((current) => ({ ...current, eek2 }))}
          />
        </FormSection>
        <FormSection eyebrow={t.observationsEyebrow}>
          <ObservationsForm
            value={draft.observations}
            onChange={(observations) =>
              setDraft((current) => ({ ...current, observations }))
            }
          />
        </FormSection>
        <FormSection eyebrow={t.conclusionsEyebrow}>
          <ConclusionsForm
            value={draft.conclusions}
            onChange={(conclusions) =>
              setDraft((current) => ({ ...current, conclusions }))
            }
          />
        </FormSection>
      </div>
      <div className="xl:sticky xl:top-6">
        <ReportPreview
          report={report}
          generating={generating}
          errors={generateErrors}
          onGenerate={() => void generatePreview()}
          onReportChange={setReport}
        />
      </div>
    </div>
  );
}
