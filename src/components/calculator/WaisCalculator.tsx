"use client";

import { useMemo, type ReactNode } from "react";
import { displayMaybe } from "@/components/calculator/format";
import "@/components/calculator/wais-sheet.css";
import { CALCULATOR_COPY } from "@/i18n/calculatorCopy";
import { useLocale } from "@/i18n/LocaleProvider";
import { waisInputFromEntry, type WaisScoreEntry } from "@/lib/waisEntry";
import { calculateWais3 } from "@/scoring/wais3/calculate";
import { MANDATORY_COUNT, STRENGTH_ORDER } from "@/scoring/wais3/tables";
import type { OptionalNumber } from "@/scoring/wais3/types";

const SCALED_COLUMNS = ["C", "D", "E", "F", "G", "H"] as const;

const ACTIVE_COLUMNS: Record<number, string[]> = {
  0: ["D", "F"],
  1: ["C", "E"],
  2: ["D", "H"],
  3: ["C", "E"],
  4: ["D", "F"],
  5: ["C", "G"],
  6: ["D", "F"],
  7: ["C", "G"],
  8: ["C", "E"],
  9: ["D"],
  10: ["C"],
  11: ["D", "H"],
  12: ["C", "G"],
  13: ["D"],
};

function Output({
  value,
  digits,
  available = true,
}: {
  value: OptionalNumber | string;
  digits?: number;
  available?: boolean;
}) {
  const text = displayMaybe(available, value, digits);
  return (
    <span className={text === "—" ? "unavailable" : undefined}>{text}</span>
  );
}

function Sheet({ children }: { children: ReactNode }) {
  return (
    <div className="wais-part">
      <table className="wais-sheet">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

interface WaisCalculatorProps {
  age: number | "";
  entry: WaisScoreEntry;
  onChange: (entry: WaisScoreEntry) => void;
}

export function WaisCalculator({ age, entry, onChange }: WaisCalculatorProps) {
  const { locale, t } = useLocale();
  const copy = CALCULATOR_COPY[locale];
  const { rawScores, longestForward, longestBackward } = entry;

  const result = useMemo(
    () => calculateWais3(waisInputFromEntry(age, entry)),
    [age, entry],
  );

  const hasRawInput = rawScores.some((value) => value !== "");
  const visibleIssues = result.issues.filter((issue) => {
    if (issue.field.startsWith("raw-") && issue.code === "missing") {
      return false;
    }
    if (issue.field === "age" && issue.code === "missing" && !hasRawInput) {
      return false;
    }
    return true;
  });

  function updateRaw(index: number, value: string) {
    onChange({
      ...entry,
      rawScores: rawScores.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    });
  }

  function clearAll() {
    onChange({
      rawScores: rawScores.map(() => ""),
      longestForward: "",
      longestBackward: "",
    });
  }

  const composites = [
    result.viq,
    result.piq,
    result.fsiq,
    result.vci,
    result.poi,
    result.wmi,
    result.psi,
  ];
  const compositeHeaders = [
    copy.verbal,
    copy.performance,
    copy.fullScale,
    "VCI",
    "POI",
    "WMI",
    "PSI",
  ];
  const meanRuleLabel =
    result.strength.useOverallMean === true
      ? copy.meanOverall
      : result.strength.useOverallMean === false
        ? copy.meanSeparate
        : "";

  return (
    <div className="wais-calculator">
      <div className="wais-calculator-toolbar">
        <p className="wais-hint">{t.mandatoryFieldsHint}</p>
        <button type="button" className="wais-clear" onClick={clearAll}>
          {t.clearAll}
        </button>
      </div>

      {visibleIssues.length > 0 ? (
        <div className="wais-issues">
          <ul>
            {visibleIssues.map((issue) => (
              <li key={issue.field}>
                {locale === "et" ? issue.messageEt : issue.messageEn}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="wais-parts">
        <Sheet>
          <tr>
            <td className="col-label" />
            <td className="header-cell">{copy.rawScore}</td>
            <td className="header-cell">{copy.verbalCaps}</td>
            <td className="header-cell">{copy.performanceCaps}</td>
            <td className="header-cell">VCI</td>
            <td className="header-cell">POI</td>
            <td className="header-cell">WMI</td>
            <td className="header-cell">PSI</td>
          </tr>
          {copy.subtests.map((label, index) => (
            <tr key={label}>
              <td className="col-label">
                {label}
                {index < MANDATORY_COUNT ? (
                  <span className="mandatory-star"> *</span>
                ) : null}
              </td>
              <td className="input-cell">
                <input
                  aria-label={`${label} ${copy.rawScore}`}
                  inputMode="numeric"
                  value={rawScores[index]}
                  onChange={(event) => updateRaw(index, event.target.value)}
                />
              </td>
              {SCALED_COLUMNS.map((column) => {
                const active = ACTIVE_COLUMNS[index]?.includes(column);
                if (!active) {
                  return <td key={column} className="blocked-cell" />;
                }
                return (
                  <td key={column} className="center">
                    <Output value={result.subtests[index]?.scaled ?? null} />
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className="col-label" />
            <td />
            <td className="sum-cell">
              <Output value={result.viq.sum} available={result.viq.available} />
            </td>
            <td className="sum-cell">
              <Output value={result.piq.sum} available={result.piq.available} />
            </td>
            <td className="sum-cell">
              <Output value={result.vci.sum} available={result.vci.available} />
            </td>
            <td className="sum-cell">
              <Output value={result.poi.sum} available={result.poi.available} />
            </td>
            <td className="sum-cell">
              <Output value={result.wmi.sum} available={result.wmi.available} />
            </td>
            <td className="sum-cell">
              <Output value={result.psi.sum} available={result.psi.available} />
            </td>
          </tr>
          <tr>
            <td className="col-label" />
            <td />
            <td className="sum-cell" colSpan={2}>
              <Output value={result.fsiq.sum} available={result.fsiq.available} />
            </td>
            <td />
            <td />
            <td />
            <td />
          </tr>
        </Sheet>

        <Sheet>
          <tr>
            <td className="col-label" />
            {compositeHeaders.map((header) => (
              <td key={header} className="header-cell">
                {header}
              </td>
            ))}
          </tr>
          <tr>
            <td className="col-label">{copy.scaledSum}</td>
            {composites.map((item, index) => (
              <td key={`sum-${index}`} className="right">
                <Output value={item.sum} available={item.available} />
              </td>
            ))}
          </tr>
          <tr>
            <td className="col-label">{copy.iqIndexes}</td>
            {composites.map((item, index) => (
              <td
                key={`iq-${index}`}
                className={index === 2 ? "right fsiq-cell" : "right"}
              >
                <Output value={item.iq} available={item.available} />
              </td>
            ))}
          </tr>
          <tr>
            <td className="col-label">{copy.percentiles}</td>
            {composites.map((item, index) => (
              <td key={`pct-${index}`} className="right">
                <Output value={item.percentile} available={item.available} />
              </td>
            ))}
          </tr>
          <tr>
            <td className="col-label" rowSpan={2}>
              {copy.confidence95}
            </td>
            {composites.map((item, index) => (
              <td key={`low-${index}`} className="right">
                <Output value={item.ciLow} available={item.available} />
              </td>
            ))}
          </tr>
          <tr>
            {composites.map((item, index) => (
              <td key={`high-${index}`} className="right">
                <Output value={item.ciHigh} available={item.available} />
              </td>
            ))}
          </tr>
        </Sheet>

        <Sheet>
          <tr>
            <td className="col-label" />
            <td className="header-cell">{copy.verbal}</td>
            <td className="header-cell">{copy.performance}</td>
            <td className="header-cell">{copy.overall}</td>
            <td />
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td className="col-label">{copy.sum}</td>
            <td className="center">
              <Output value={result.strength.verbalSum} />
            </td>
            <td className="center">
              <Output value={result.strength.performanceSum} />
            </td>
            <td className="center">
              <Output value={result.strength.overallSum} />
            </td>
            <td />
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td className="col-label">{copy.mean}</td>
            <td className="center">
              <Output value={result.strength.verbalMean} digits={2} />
            </td>
            <td className="center">
              <Output value={result.strength.performanceMean} digits={2} />
            </td>
            <td className="center">
              <Output value={result.strength.overallMean} digits={2} />
            </td>
            <td />
            <td />
            <td />
            <td />
          </tr>
        </Sheet>

        <Sheet>
          <tr>
            <td className="col-label" />
            <td className="header-cell">{copy.scaledScore}</td>
            <td className="header-cell">{copy.mean}</td>
            <td className="header-cell">{copy.difference}</td>
            <td className="header-cell">{copy.critical}</td>
            <td className="header-cell">{copy.strength}</td>
            <td className="header-cell">{copy.weakness}</td>
            <td />
          </tr>
          {STRENGTH_ORDER.map((subtestIndex, order) => {
            const row = result.strength.rows[order];
            const extra =
              order === 0 ? (
                <>
                  <td className="small-label">{copy.viqPiqDiff}</td>
                  <td className="center">
                    <Output value={result.strength.viqPiqAbsDiff} />
                  </td>
                </>
              ) : order === 1 ? (
                <td colSpan={2}>{meanRuleLabel}</td>
              ) : null;
            return (
              <tr key={`strength-${subtestIndex}`}>
                <td className="col-label">{copy.subtests[subtestIndex]}</td>
                <td className="center">
                  <Output value={row.scaled} available={row.administered} />
                </td>
                <td className="center">
                  <Output
                    value={row.mean}
                    digits={2}
                    available={row.administered}
                  />
                </td>
                <td className="center">
                  <Output
                    value={row.deviation}
                    digits={2}
                    available={row.administered}
                  />
                </td>
                <td className="center">
                  <Output
                    value={row.critical}
                    digits={2}
                    available={result.strength.classificationsValid}
                  />
                </td>
                <td className="center">{row.strength === "T" ? "T" : ""}</td>
                <td className="center">{row.strength === "N" ? "N" : ""}</td>
                {extra}
              </tr>
            );
          })}
        </Sheet>

        <Sheet>
          <tr>
            <td className="col-label" />
            <td className="header-cell">{copy.score1}</td>
            <td className="header-cell">{copy.score2}</td>
            <td className="header-cell">{copy.difference}</td>
            <td className="header-cell">{copy.critical}</td>
            <td className="header-cell">{copy.percent}</td>
            <td className="header-cell">{copy.percentHalf}</td>
            <td />
          </tr>
          {result.discrepancies.map((row) => (
            <tr key={row.id}>
              <td className="col-label">{copy.discrepancies[row.id] ?? row.label}</td>
              <td className="center">
                <Output value={row.score1} available={row.available} />
              </td>
              <td className="center">
                <Output value={row.score2} available={row.available} />
              </td>
              <td className="center">
                <Output value={row.difference} available={row.available} />
              </td>
              <td className="center">
                <Output value={row.critical} digits={2} />
              </td>
              <td className="center">
                {row.available && row.baseRate != null ? (
                  <Output value={row.baseRate} />
                ) : (
                  ""
                )}
              </td>
              <td className="center">
                {row.available && row.baseRateHalf != null ? (
                  <Output value={row.baseRateHalf} />
                ) : (
                  ""
                )}
              </td>
              <td />
            </tr>
          ))}
        </Sheet>

        <Sheet>
          <tr>
            <td className="col-label">{copy.longestForward}</td>
            <td className="input-cell">
              <input
                aria-label={copy.longestForward}
                inputMode="numeric"
                value={longestForward}
                onChange={(event) =>
                  onChange({ ...entry, longestForward: event.target.value })
                }
              />
            </td>
            <td className="blocked-cell" />
            <td className="blocked-cell" />
            <td className="blocked-cell" />
            <td className="right">
              <Output value={result.digitSpan.forwardCumulative} digits={1} />
            </td>
            <td />
            <td />
          </tr>
          <tr>
            <td className="col-label">{copy.longestBackward}</td>
            <td className="input-cell">
              <input
                aria-label={copy.longestBackward}
                inputMode="numeric"
                value={longestBackward}
                onChange={(event) =>
                  onChange({ ...entry, longestBackward: event.target.value })
                }
              />
            </td>
            <td className="blocked-cell" />
            <td className="blocked-cell" />
            <td className="blocked-cell" />
            <td className="right">
              <Output value={result.digitSpan.backwardCumulative} digits={1} />
            </td>
            <td />
            <td />
          </tr>
          <tr>
            <td className="col-label">{copy.forwardMinusBackward}</td>
            <td className="center">
              <Output value={result.digitSpan.longestForward} />
            </td>
            <td className="center">
              <Output value={result.digitSpan.longestBackward} />
            </td>
            <td className="center">
              <Output value={result.digitSpan.difference} />
            </td>
            <td className="blocked-cell" />
            <td className="right">
              <Output
                value={result.digitSpan.differenceCumulative}
                digits={1}
              />
            </td>
            <td />
            <td />
          </tr>
        </Sheet>
      </div>
    </div>
  );
}
