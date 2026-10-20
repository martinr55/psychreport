"use client";

import { useState } from "react";
import { WaisCalculator } from "@/components/calculator/WaisCalculator";
import { useLocale } from "@/i18n/LocaleProvider";

type InstrumentTab = "wais3" | "wisc5" | "eek2";

interface AssessmentInstrumentsProps {
  age: number | "";
}

export function AssessmentInstruments({ age }: AssessmentInstrumentsProps) {
  const { t } = useLocale();
  const [tab, setTab] = useState<InstrumentTab>("wais3");

  const tabs: Array<{ id: InstrumentTab; label: string }> = [
    { id: "wais3", label: t.tabWais3 },
    { id: "wisc5", label: t.tabWisc5 },
    { id: "eek2", label: t.tabEek2 },
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label={t.instrumentsEyebrow}
        className="mb-4 flex flex-wrap gap-1 border-b border-slate-200"
      >
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`instrument-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`instrument-panel-${item.id}`}
              className={
                selected
                  ? "-mb-px border-b-2 border-teal-800 px-3 py-2 text-sm font-semibold text-teal-900"
                  : "-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
              }
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`instrument-panel-${tab}`}
        aria-labelledby={`instrument-tab-${tab}`}
      >
        {tab === "wais3" ? <WaisCalculator age={age} /> : null}
        {tab === "wisc5" ? (
          <PlaceholderPanel
            title={t.wiscPlaceholderTitle}
            body={t.wiscPlaceholderBody}
            items={t.wiscPlaceholderItems}
          />
        ) : null}
        {tab === "eek2" ? (
          <PlaceholderPanel
            title={t.eekPlaceholderTitle}
            body={t.eekPlaceholderBody}
            items={t.eekPlaceholderItems}
          />
        ) : null}
      </div>
    </div>
  );
}

function PlaceholderPanel({
  title,
  body,
  items,
}: {
  title: string;
  body: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-2">{body}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-500"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
