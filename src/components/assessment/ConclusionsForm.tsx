import { controlClassName, Field } from "@/components/ui/Field";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Conclusions } from "@/types/assessment";

interface ConclusionsFormProps {
  value: Conclusions;
  onChange: (value: Conclusions) => void;
}

export function ConclusionsForm({ value, onChange }: ConclusionsFormProps) {
  const { t } = useLocale();

  return (
    <div className="grid gap-5">
      <Field id="referral-opinion" label={t.referralOpinion}>
        <textarea
          id="referral-opinion"
          rows={5}
          className={`${controlClassName} resize-y`}
          value={value.referralOpinion}
          onChange={(event) =>
            onChange({ ...value, referralOpinion: event.target.value })
          }
        />
      </Field>
      <Field id="recommendations" label={t.recommendations}>
        <textarea
          id="recommendations"
          rows={5}
          className={`${controlClassName} resize-y`}
          value={value.recommendations}
          onChange={(event) =>
            onChange({ ...value, recommendations: event.target.value })
          }
        />
      </Field>
    </div>
  );
}
