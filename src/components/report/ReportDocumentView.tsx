import type {
  ReportBlock,
  ReportDocument,
  ReportTextRun,
} from "@/types/reportDocument";

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

function BlockView({ block }: { block: ReportBlock }) {
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
            <caption className="sr-only">
              {block.headers.join(" / ")}
            </caption>
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

export function ReportDocumentView({ report }: { report: ReportDocument }) {
  return (
    <article className="font-serif text-slate-800">
      {report.blocks.map((block, index) => (
        <BlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </article>
  );
}
