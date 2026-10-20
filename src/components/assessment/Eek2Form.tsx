import { controlClassName, Field } from "@/components/ui/Field";
import { EEK2_SCALES, type Eek2ScaleId, type Eek2Scores } from "@/data/eek2Scales";
import { useLocale } from "@/i18n/LocaleProvider";

interface Eek2FormProps {
  value: Eek2Scores;
  onChange: (value: Eek2Scores) => void;
}

export function Eek2Form({ value, onChange }: Eek2FormProps) {
  const { locale, t } = useLocale();

  function update(id: Eek2ScaleId, next: number | null) {
    onChange({ ...value, [id]: next });
  }

  return (
    <div>
      <p className="mb-4 text-sm leading-6 text-slate-600">{t.eekScoreHint}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {EEK2_SCALES.map((scale) => (
          <Field key={scale.id} id={`eek-${scale.id}`} label={scale[locale]}>
            <input
              id={`eek-${scale.id}`}
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              className={controlClassName}
              value={value[scale.id] ?? ""}
              onChange={(event) => {
                const next = event.target.value;
                if (next === "") {
                  update(scale.id, null);
                  return;
                }
                const parsed = Number(next);
                if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 100) {
                  update(scale.id, parsed);
                }
              }}
            />
          </Field>
        ))}
      </div>
    </div>
  );
}
