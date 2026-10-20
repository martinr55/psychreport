"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import type { AppLocale } from "@/types/locale";

export function AppHeader() {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
            {t.clinicalWorkspace}
          </p>
          <h1 className="text-xl font-semibold text-slate-900">{t.appTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="ui-language" className="text-sm font-medium text-slate-700">
            {t.languageLabel}
          </label>
          <select
            id="ui-language"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            value={locale}
            onChange={(event) => setLocale(event.target.value as AppLocale)}
          >
            <option value="et">{t.languageEstonian}</option>
            <option value="en">{t.languageEnglish}</option>
          </select>
        </div>
      </div>
    </header>
  );
}
