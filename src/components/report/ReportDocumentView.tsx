"use client";

import { reportPlainText, type ReportBlock, type ReportDocument, type ReportTextRun } from "@/types/reportDocument";

function RichText({ runs }: { runs: ReportTextRun[] }) {
  return (
    <>
      {runs.map((run, index) => {
        const className = [
          run.bold ? "font-semibold" : "",
          run.italic ? "italic" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <span key={`${run.text}-${index}`} className={className || undefined}>
            {run.text}
          </span>
        );
      })}
    </>
  );
}

function editableClassName(kind: "title" | "heading" | "paragraph") {
  const shared =
    "w-full resize-y border border-transparent bg-transparent outline-none hover:border-slate-200 focus:border-teal-700 focus:bg-white";
  if (kind === "title") {
    return `${shared} text-[1.35rem] font-semibold leading-snug text-teal-900`;
  }
  if (kind === "heading") {
    return `${shared} mt-5 border-b border-slate-200 pb-1 text-[0.95rem] font-semibold tracking-wide text-teal-800`;
  }
  return `${shared} mt-2 px-1 py-1 font-serif text-[15px] leading-7 text-slate-800`;
}

function BlockView({
  block,
  index,
  label,
  onTextChange,
}: {
  block: ReportBlock;
  index: number;
  label: string;
  onTextChange?: (index: number, text: string) => void;
}) {
  const fieldId = `report-block-${index}`;
  if (
    onTextChange &&
    (block.type === "title" || block.type === "heading" || block.type === "paragraph")
  ) {
    const text = reportPlainText(block.runs);
    const rows =
      block.type === "paragraph"
        ? Math.min(14, Math.max(3, Math.ceil(text.length / 80)))
        : 1;
    return (
      <div>
        <label className="sr-only" htmlFor={fieldId}>
          {label}
        </label>
        {block.type === "paragraph" ? (
          <textarea
            id={fieldId}
            lang="et"
            rows={rows}
            className={editableClassName(block.type)}
            value={text}
            onChange={(event) => onTextChange(index, event.target.value)}
          />
        ) : (
          <input
            id={fieldId}
            lang="et"
            className={editableClassName(block.type)}
            value={text}
            onChange={(event) => onTextChange(index, event.target.value)}
          />
        )}
      </div>
    );
  }

  switch (block.type) {
    case "title":
      return (
        <p className="text-[1.35rem] font-semibold leading-snug text-teal-900">
          <RichText runs={block.runs} />
        </p>
      );
    case "heading":
      return (
        <h2 className="mt-5 border-b border-slate-200 pb-1 text-[0.95rem] font-semibold tracking-wide text-teal-800">
          <RichText runs={block.runs} />
        </h2>
      );
    case "paragraph":
      return (
        <p className="mt-2 text-[15px] leading-7 text-slate-800">
          <RichText runs={block.runs} />
        </p>
      );
    case "table":
      return (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <caption className="sr-only">{block.headers.join(" / ")}</caption>
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th
                    key={header}
                    className="border border-slate-200 bg-teal-800 px-2.5 py-1.5 font-semibold text-white"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="odd:bg-white even:bg-slate-50">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${cell}-${cellIndex}`}
                      className="border border-slate-200 px-2.5 py-1.5 text-slate-800"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function ReportDocumentView({
  report,
  onChange,
}: {
  report: ReportDocument;
  onChange?: (report: ReportDocument) => void;
}) {
  function updateText(index: number, text: string) {
    if (!onChange) {
      return;
    }
    const blocks = report.blocks.map((block, blockIndex) => {
      if (blockIndex !== index) {
        return block;
      }
      if (block.type !== "title" && block.type !== "heading" && block.type !== "paragraph") {
        return block;
      }
      const bold = block.runs.some((run) => run.bold);
      const italic = block.runs.some((run) => run.italic);
      return {
        ...block,
        runs: [{ text, bold: bold || undefined, italic: italic || undefined }],
      };
    });
    onChange({
      ...report,
      title:
        report.blocks[index]?.type === "title"
          ? text
          : report.title,
      blocks,
    });
  }

  const labels: string[] = [];
  let currentLabel = report.title;
  for (const block of report.blocks) {
    if (block.type === "heading" || block.type === "title") {
      currentLabel = reportPlainText(block.runs);
    }
    labels.push(
      block.type === "paragraph"
        ? currentLabel
        : block.type === "table"
          ? block.headers[0] ?? report.title
          : reportPlainText(block.runs),
    );
  }

  return (
    <article className="font-serif text-slate-800">
      {report.blocks.map((block, index) => (
        <BlockView
          key={`${block.type}-${index}`}
          block={block}
          index={index}
          label={labels[index] || report.title}
          onTextChange={onChange ? updateText : undefined}
        />
      ))}
    </article>
  );
}
