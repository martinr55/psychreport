import type { ReactNode } from "react";

interface FormSectionProps {
  eyebrow: string;
  title?: string;
  children: ReactNode;
}

export function FormSection({ eyebrow, title, children }: FormSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className={title ? "mb-5 border-b border-slate-100 pb-4" : "mb-4"}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
          {eyebrow}
        </p>
        {title ? (
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{title}</h2>
        ) : null}
      </header>
      {children}
    </section>
  );
}
