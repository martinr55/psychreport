import type { EducationLevel } from "@/types/assessment";
import type { AppLocale } from "@/types/locale";

export const EDUCATION_OPTIONS: Array<{
  id: Exclude<EducationLevel, "">;
  et: string;
  en: string;
}> = [
  { id: "primary", et: "Algharidus", en: "Primary education" },
  { id: "basic", et: "Põhiharidus", en: "Basic education" },
  { id: "secondary", et: "Keskharidus", en: "Secondary education" },
  { id: "vocational", et: "Kutseharidus", en: "Vocational education" },
  { id: "bachelor", et: "Bakalaureusekraad", en: "Bachelor's degree" },
  { id: "master", et: "Magistrikraad", en: "Master's degree" },
  { id: "doctoral", et: "Doktorikraad", en: "Doctoral degree" },
  { id: "other", et: "Muu", en: "Other" },
];

export function educationLabel(
  value: EducationLevel,
  locale: AppLocale,
  fallback: string,
): string {
  if (value === "") {
    return fallback;
  }
  const option = EDUCATION_OPTIONS.find((item) => item.id === value);
  return option ? option[locale] : fallback;
}
