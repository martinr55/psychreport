import type { AppLocale } from "@/types/locale";

export interface WaisSubtest {
  id: string;
  et: string;
  en: string;
}

export const WAIS_SUBTESTS: WaisSubtest[] = [
  { id: "picture-completion", et: "piltide täiendamine", en: "Picture Completion" },
  { id: "vocabulary", et: "sõnavara", en: "Vocabulary" },
  { id: "digit-symbol-coding", et: "šifreering", en: "Digit Symbol–Coding" },
  { id: "similarities", et: "sarnasused", en: "Similarities" },
  { id: "block-design", et: "kuubikud", en: "Block Design" },
  { id: "arithmetic", et: "aritmeetika", en: "Arithmetic" },
  { id: "matrix-reasoning", et: "maatriksid", en: "Matrix Reasoning" },
  { id: "digit-span", et: "arvumälu", en: "Digit Span" },
  { id: "information", et: "informeeritus", en: "Information" },
  { id: "picture-arrangement", et: "pildiseeriad", en: "Picture Arrangement" },
  { id: "comprehension", et: "taibukus", en: "Comprehension" },
  { id: "symbol-search", et: "sümbolite otsimine", en: "Symbol Search" },
  {
    id: "letter-number-sequencing",
    et: "täht-number järjestus",
    en: "Letter–Number Sequencing",
  },
  { id: "object-assembly", et: "kujundite moodustamine", en: "Object Assembly" },
];

export function waisSubtestName(id: string, locale: AppLocale): string {
  const subtest = WAIS_SUBTESTS.find((item) => item.id === id);
  if (!subtest) {
    return id;
  }
  return subtest[locale];
}
