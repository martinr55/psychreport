import { controlClassName, Field } from "@/components/ui/Field";
import { useLocale } from "@/i18n/LocaleProvider";
import type { AppMessages } from "@/i18n/messages";
import type { StructuredObservations } from "@/types/assessment";

interface ObservationsFormProps {
  value: StructuredObservations;
  onChange: (value: StructuredObservations) => void;
}

const SLIDER_KEYS = [
  "motivation",
  "encouragementNeed",
  "anxiety",
  "concentration",
  "motorRestlessness",
  "fatigue",
] as const;

const CHECKBOX_KEYS = ["answeredBeforeInstructions", "hesitatedALot"] as const;

export function ObservationsForm({ value, onChange }: ObservationsFormProps) {
  const { t } = useLocale();

  function update<K extends keyof StructuredObservations>(
    key: K,
    next: StructuredObservations[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {SLIDER_KEYS.map((key) => (
          <Field
            key={key}
            id={`observation-${key}`}
            label={`${t[key as keyof AppMessages]}: ${
              value[key] === null ? t.notRated : `${value[key]}/10`
            }`}
          >
            <input
              id={`observation-${key}`}
              type="range"
              min={1}
              max={10}
              className="w-full accent-teal-800"
              aria-valuetext={value[key] === null ? t.notRated : String(value[key])}
              value={value[key] ?? 5}
              onChange={(event) => update(key, Number(event.target.value))}
            />
            {value[key] !== null ? (
              <button
                type="button"
                className="self-start text-xs font-medium text-teal-800 underline-offset-2 hover:underline"
                onClick={() => update(key, null)}
              >
                {t.clearRating}
              </button>
            ) : null}
          </Field>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {CHECKBOX_KEYS.map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
          >
            <input
              type="checkbox"
              className="size-4 accent-teal-800"
              checked={value[key]}
              onChange={(event) => update(key, event.target.checked)}
            />
            {t[key as keyof AppMessages]}
          </label>
        ))}
      </div>

      <Field id="other-notes" label={t.otherNotes}>
        <textarea
          id="other-notes"
          rows={4}
          className={`${controlClassName} resize-y`}
          value={value.otherNotes}
          onChange={(event) => update("otherNotes", event.target.value)}
        />
      </Field>
    </div>
  );
}
