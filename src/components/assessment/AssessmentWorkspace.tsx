"use client";

import { useState } from "react";
import { AssessmentInfoForm } from "@/components/assessment/AssessmentInfoForm";
import { AssessmentInstruments } from "@/components/assessment/AssessmentInstruments";
import { ConclusionsForm } from "@/components/assessment/ConclusionsForm";
import { ObservationsForm } from "@/components/assessment/ObservationsForm";
import { FormSection } from "@/components/layout/FormSection";
import { EMPTY_ASSESSMENT } from "@/data/emptyAssessment";
import { useLocale } from "@/i18n/LocaleProvider";
import { buildPlaceholderReport } from "@/lib/buildPlaceholderReport";
import { ReportPreview } from "@/components/report/ReportPreview";
import type { AssessmentDraft } from "@/types/assessment";
import type { ReportDocument } from "@/types/reportDocument";

export function AssessmentWorkspace() {
  const { locale, t } = useLocale();
  const [draft, setDraft] = useState<AssessmentDraft>(EMPTY_ASSESSMENT);
  const [report, setReport] = useState<ReportDocument | null>(null);

  function generatePreview() {
    setReport(buildPlaceholderReport(draft, locale, t));
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]">
      <div className="flex min-w-0 flex-col gap-5">
        <FormSection eyebrow={t.caseEyebrow}>
          <AssessmentInfoForm
            value={draft.info}
            onChange={(info) => setDraft((current) => ({ ...current, info }))}
          />
        </FormSection>
        <FormSection eyebrow={t.instrumentsEyebrow}>
          <AssessmentInstruments age={draft.info.examineeAgeYears} />
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
        <ReportPreview report={report} onGenerate={generatePreview} />
      </div>
    </div>
  );
}
