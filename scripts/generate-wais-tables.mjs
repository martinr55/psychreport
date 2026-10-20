import { readFileSync, writeFileSync } from "node:fs";

const a1 = JSON.parse(readFileSync("tmp-xlsx/json/a1.json", "utf8"));
const a2 = JSON.parse(readFileSync("tmp-xlsx/json/a2.json", "utf8"));
const a3 = JSON.parse(readFileSync("tmp-xlsx/json/a3.json", "utf8"));
const a4 = JSON.parse(readFileSync("tmp-xlsx/json/a4.json", "utf8"));
const a5 = JSON.parse(readFileSync("tmp-xlsx/json/a5.json", "utf8"));
const a6 = JSON.parse(readFileSync("tmp-xlsx/json/a6.json", "utf8"));
const a7 = JSON.parse(readFileSync("tmp-xlsx/json/a7.json", "utf8"));
const a8 = JSON.parse(readFileSync("tmp-xlsx/json/a8.json", "utf8"));
const b1 = JSON.parse(readFileSync("tmp-xlsx/json/b1.json", "utf8"));
const b2 = JSON.parse(readFileSync("tmp-xlsx/json/b2.json", "utf8"));
const b3 = JSON.parse(readFileSync("tmp-xlsx/json/b3.json", "utf8"));
const b6 = JSON.parse(readFileSync("tmp-xlsx/json/b6.json", "utf8"));
const b7 = JSON.parse(readFileSync("tmp-xlsx/json/b7.json", "utf8"));
const vanusegrupp = JSON.parse(readFileSync("tmp-xlsx/json/vanusegrupp.json", "utf8"));

const SHEET1_TO_A1_COL = [8, 1, 9, 2, 10, 3, 11, 4, 5, 12, 6, 13, 7, 14];

function rawTables() {
  const tables = [];
  for (const a1Col of SHEET1_TO_A1_COL) {
    const byAge = [];
    for (let g = 0; g < 11; g++) {
      const start = 1 + g * 20;
      const values = [];
      for (let i = 0; i < 19; i++) {
        const v = a1[start + i][a1Col];
        values.push(v == null ? null : v);
      }
      byAge.push(values);
    }
    tables.push(byAge);
  }
  return tables;
}

function compositeTable(grid, startRow = 2) {
  const rows = [];
  for (let i = startRow; i < grid.length; i++) {
    const sum = grid[i][0];
    if (typeof sum !== "number") continue;
    rows.push({
      sum,
      iq: grid[i][1],
      percentile: grid[i][2],
      ciLow: grid[i][5],
      ciHigh: grid[i][6],
    });
  }
  return rows;
}

function discrepancyCriticals() {
  const groups = [];
  for (let g = 0; g < 11; g++) {
    const start = 1 + g * 8;
    const values = [];
    for (let i = 0; i < 7; i++) {
      values.push(b1[start + i][1]);
    }
    groups.push(values);
  }
  return groups;
}

function baseRates() {
  const rows = [];
  for (let i = 1; i < b2.length; i++) {
    if (typeof b2[i][0] !== "number") continue;
    rows.push({
      diff: b2[i][0],
      rates: b2[i].slice(1, 8),
    });
  }
  return rows;
}

function strengthCriticals() {
  const rows = [];
  for (let i = 1; i <= 14; i++) {
    rows.push({
      vsSeparate: b3[i][1],
      vsOverall: b3[i][2],
    });
  }
  return rows;
}

function digitSpanCumulative() {
  const groups = [];
  for (let g = 0; g < 5; g++) {
    const start = 1 + g * 10;
    const keys = [];
    const forward = [];
    const backward = [];
    for (let i = 0; i < 9; i++) {
      keys.push(b6[1 + i][0]);
      forward.push(b6[start + i][1]);
      backward.push(b6[start + i][2]);
    }
    groups.push({ keys, forward, backward });
  }
  return groups;
}

function digitSpanDifference() {
  const groups = [];
  for (let g = 0; g < 5; g++) {
    const start = g * 13;
    const keys = [];
    const rates = [];
    for (let i = 0; i < 12; i++) {
      keys.push(b7[i][0]);
      rates.push(b7[start + i][1]);
    }
    groups.push({ keys, rates });
  }
  return groups;
}

const data = {
  ageToScaledGroup: vanusegrupp.map((r) => r[1]),
  ageToDigitSpanGroup: vanusegrupp.map((r) => r[2]),
  rawMaxBySubtestAge: rawTables(),
  composites: {
    viq: compositeTable(a2),
    piq: compositeTable(a3),
    fsiq: compositeTable(a4),
    vci: compositeTable(a5),
    poi: compositeTable(a6),
    wmi: compositeTable(a7),
    psi: compositeTable(a8),
  },
  discrepancyCriticals: discrepancyCriticals(),
  baseRates: baseRates(),
  strengthCriticals: strengthCriticals(),
  digitSpanCumulative: digitSpanCumulative(),
  digitSpanDifference: digitSpanDifference(),
};

writeFileSync(
  "src/scoring/wais3/tables/data.json",
  JSON.stringify(data),
);
console.log("wrote src/scoring/wais3/tables/data.json", Buffer.byteLength(JSON.stringify(data)));
