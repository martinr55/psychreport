import data from "./tables/data.json";

export interface CompositeLookupRow {
  sum: number;
  iq: number;
  percentile: number | string;
  ciLow: number;
  ciHigh: number;
}

export interface Wais3Tables {
  ageToScaledGroup: number[];
  ageToDigitSpanGroup: number[];
  rawMaxBySubtestAge: (number | null)[][][];
  composites: Record<
    "viq" | "piq" | "fsiq" | "vci" | "poi" | "wmi" | "psi",
    CompositeLookupRow[]
  >;
  discrepancyCriticals: number[][];
  baseRates: { diff: number; rates: number[] }[];
  strengthCriticals: { vsSeparate: number; vsOverall: number }[];
  digitSpanCumulative: {
    keys: (number | null)[];
    forward: (number | null)[];
    backward: (number | null)[];
  }[];
  digitSpanDifference: {
    keys: number[];
    rates: (number | null)[];
  }[];
}

export const WAIS3_TABLES = data as Wais3Tables;

export const SUBTEST_COUNT = 14;
export const MANDATORY_COUNT = 11;

export const SUBTEST_LABELS_ET = [
  "piltide täiendamine",
  "sõnavara",
  "šifreering",
  "sarnasused",
  "kuubikud",
  "aritmeetika",
  "maatriksid",
  "arvumälu",
  "informeeritus",
  "pildiseeriad",
  "taibukus",
  "sümbolite otsimine",
  "täht-number järjestus",
  "kujundite moodustamine",
] as const;

export const VERBAL_INDEXES = [1, 3, 5, 7, 8, 10, 12] as const;
export const PERFORMANCE_INDEXES = [0, 2, 4, 6, 9, 11, 13] as const;
export const STRENGTH_ORDER = [
  1, 3, 5, 7, 8, 10, 12, 0, 2, 4, 6, 9, 11, 13,
] as const;

export const VIQ_INDEXES = [1, 3, 5, 7, 8, 10] as const;
export const PIQ_INDEXES = [0, 2, 4, 6, 9] as const;
export const VCI_INDEXES = [1, 3, 8] as const;
export const POI_INDEXES = [0, 4, 6] as const;
export const WMI_INDEXES = [5, 7, 12] as const;
export const PSI_INDEXES = [2, 11] as const;

export const DISCREPANCY_DEFS = [
  { id: "VIQ-PIQ", label: "sõnaline IQ - soorituslik IQ", left: "viq", right: "piq" },
  {
    id: "VCI-POI",
    label: "sõnaline taibukus - tajupõhine töötlus",
    left: "vci",
    right: "poi",
  },
  {
    id: "VCI-WMI",
    label: "sõnaline taibukus - töömälu",
    left: "vci",
    right: "wmi",
  },
  {
    id: "POI-PSI",
    label: "tajupõhine töötlus - töötluskiirus",
    left: "poi",
    right: "psi",
  },
  {
    id: "VCI-PSI",
    label: "sõnaline taibukus - töötluskiirus",
    left: "vci",
    right: "psi",
  },
  {
    id: "POI-WMI",
    label: "tajupõhine töötlus - töömälu",
    left: "poi",
    right: "wmi",
  },
  {
    id: "WMI-PSI",
    label: "töömälu - töötluskiirus",
    left: "wmi",
    right: "psi",
  },
] as const;

export const OVERALL_MEAN_LABEL =
  "erinevus üldkeskmisest";
export const SEPARATE_MEAN_LABEL =
  "erinevus sõnalisest keskmisest ja soorituslikust keskmisest";
