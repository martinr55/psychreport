import { controlClassName, Field } from "@/components/ui/Field";
import { EDUCATION_OPTIONS } from "@/data/educationLevels";
import { useLocale } from "@/i18n/LocaleProvider";
import type { AssessmentInfo, EducationLevel } from "@/types/assessment";

interface AssessmentInfoFormProps {
  value: AssessmentInfo;
  onChange: (value: AssessmentInfo) => void;
}

export function AssessmentInfoForm({ value, onChange }: AssessmentInfoFormProps) {
  const { locale, t } = useLocale();

  function update<K extends keyof AssessmentInfo>(key: K, next: AssessmentInfo[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="clinician-name" label={t.clinician}>
        <input
          id="clinician-name"
          className={controlClassName}
          value={value.clinicianName}
          onChange={(event) => update("clinicianName", event.target.value)}
        />
      </Field>
      <Field id="examinee-name" label={t.examinee}>
        <input
          id="examinee-name"
          className={controlClassName}
          value={value.examineeName}
          onChange={(event) => update("examineeName", event.target.value)}
        />
      </Field>
      <Field id="examinee-age" label={t.ageYears}>
        <input
          id="examinee-age"
          type="number"
          min={16}
          max={89}
          className={controlClassName}
          value={value.examineeAgeYears}
          onChange={(event) => {
            const next = event.target.value;
            update("examineeAgeYears", next === "" ? "" : Number(next));
          }}
        />
      </Field>
      <Field id="education" label={t.education}>
        <select
          id="education"
          className={controlClassName}
          value={value.education}
          onChange={(event) =>
            update("education", event.target.value as EducationLevel)
          }
        >
          <option value="">{t.educationPlaceholder}</option>
          {EDUCATION_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option[locale]}
            </option>
          ))}
        </select>
      </Field>
      <Field id="referrer" label={t.referrer}>
        <input
          id="referrer"
          className={controlClassName}
          value={value.referrer}
          onChange={(event) => update("referrer", event.target.value)}
        />
      </Field>
      <Field id="assessment-date" label={t.assessmentDate}>
        <input
          id="assessment-date"
          type="date"
          className={controlClassName}
          value={value.assessmentDate}
          onChange={(event) => update("assessmentDate", event.target.value)}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field id="referral" label={t.referralQuestion}>
          <textarea
            id="referral"
            rows={3}
            className={`${controlClassName} resize-y`}
            value={value.referralQuestion}
            onChange={(event) => update("referralQuestion", event.target.value)}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="psychosocial-background" label={t.psychosocialBackground}>
          <textarea
            id="psychosocial-background"
            rows={4}
            className={`${controlClassName} resize-y`}
            value={value.psychosocialBackground}
            onChange={(event) =>
              update("psychosocialBackground", event.target.value)
            }
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="coping-difficulties" label={t.copingDifficulties}>
          <textarea
            id="coping-difficulties"
            rows={4}
            className={`${controlClassName} resize-y`}
            value={value.copingDifficulties}
            onChange={(event) =>
              update("copingDifficulties", event.target.value)
            }
          />
        </Field>
      </div>
    </div>
  );
}
