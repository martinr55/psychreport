interface GenerateReportButtonProps {
  label: string;
  disabled?: boolean;
  onGenerate: () => void;
}

export function GenerateReportButton({
  label,
  disabled,
  onGenerate,
}: GenerateReportButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onGenerate}
      className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {label}
    </button>
  );
}
