export const EEK2_SCALES = [
  { id: "depression", et: "Depressioon", en: "Depression" },
  { id: "generalAnxiety", et: "Üldine ärevus", en: "General anxiety" },
  { id: "panicAgoraphobia", et: "Paanika/agorafoobia", en: "Panic/agoraphobia" },
  { id: "socialPhobia", et: "Sotsiaalfoobia", en: "Social phobia" },
  { id: "asthenia", et: "Asteenia", en: "Asthenia" },
  { id: "insomnia", et: "Insomnia", en: "Insomnia" },
] as const;

export type Eek2ScaleId = (typeof EEK2_SCALES)[number]["id"];

export type Eek2Scores = Record<Eek2ScaleId, number | null>;

export const EMPTY_EEK2: Eek2Scores = {
  depression: null,
  generalAnxiety: null,
  panicAgoraphobia: null,
  socialPhobia: null,
  asthenia: null,
  insomnia: null,
};

export function enteredEek2Scores(
  scores: Eek2Scores,
): Array<{ scale: string; score: string }> {
  return EEK2_SCALES.flatMap((scale) => {
    const value = scores[scale.id];
    return value === null ? [] : [{ scale: scale.et, score: String(value) }];
  });
}
