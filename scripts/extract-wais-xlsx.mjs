import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = "tmp-xlsx/extracted/xl";

function parseAttrs(tag) {
  const attrs = {};
  const re = /([:\w]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(tag))) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function loadSharedStrings() {
  const xml = readFileSync(join(ROOT, "sharedStrings.xml"), "utf8");
  const strings = [];
  const re = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = re.exec(xml))) {
    const texts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) =>
      x[1]
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"'),
    );
    strings.push(texts.join(""));
  }
  return strings;
}

function colToIndex(col) {
  let n = 0;
  for (const ch of col) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

function parseSheet(name, file, sst) {
  const xml = readFileSync(join(ROOT, "worksheets", file), "utf8");
  const cells = {};
  const cellRe =
    /<c r="([A-Z]+)(\d+)"([^>]*)>([\s\S]*?)<\/c>|<c r="([A-Z]+)(\d+)"([^>]*)\/>/g;
  let m;
  while ((m = cellRe.exec(xml))) {
    const col = m[1] || m[5];
    const row = Number(m[2] || m[6]);
    const attr = parseAttrs(m[0].slice(0, m[0].indexOf(">") + 1));
    const inner = m[4] || "";
    const formulaMatch = inner.match(/<f([^>]*)>([\s\S]*?)<\/f>|<f([^>]*)\/>/);
    const valueMatch = inner.match(/<v>([\s\S]*?)<\/v>/);
    let value = valueMatch ? valueMatch[1] : null;
    if (attr.t === "s" && value !== null) {
      value = sst[Number(value)];
    } else if (attr.t === "str") {
      value = value ?? "";
    } else if (value !== null && value !== "" && !Number.isNaN(Number(value))) {
      value = Number(value);
    }
    let formula = null;
    if (formulaMatch) {
      const fAttrs = parseAttrs(formulaMatch[0].slice(0, formulaMatch[0].indexOf(">") + 1));
      formula = formulaMatch[2] || fAttrs.t || null;
      if (fAttrs.t === "shared" && !formulaMatch[2]) {
        formula = `(shared si=${fAttrs.si})`;
      }
    }
    cells[`${col}${row}`] = {
      col,
      row,
      style: attr.s ? Number(attr.s) : 0,
      type: attr.t || "n",
      formula,
      value,
    };
  }
  return { name, file, cells };
}

function grid(sheet, maxCol, maxRow) {
  const rows = [];
  for (let r = 1; r <= maxRow; r++) {
    const row = [];
    for (let c = 1; c <= maxCol; c++) {
      let col = "";
      let n = c;
      while (n > 0) {
        const rem = (n - 1) % 26;
        col = String.fromCharCode(65 + rem) + col;
        n = Math.floor((n - 1) / 26);
      }
      const cell = sheet.cells[`${col}${r}`];
      row.push(cell ? cell.value : null);
    }
    rows.push(row);
  }
  return rows;
}

const sst = loadSharedStrings();
const sheets = {
  Sheet1: parseSheet("Sheet1", "sheet1.xml", sst),
  a1: parseSheet("a1", "sheet2.xml", sst),
  a2: parseSheet("a2", "sheet3.xml", sst),
  a3: parseSheet("a3", "sheet4.xml", sst),
  a4: parseSheet("a4", "sheet5.xml", sst),
  a5: parseSheet("a5", "sheet6.xml", sst),
  a6: parseSheet("a6", "sheet7.xml", sst),
  a7: parseSheet("a7", "sheet8.xml", sst),
  a8: parseSheet("a8", "sheet9.xml", sst),
  a10: parseSheet("a10", "sheet10.xml", sst),
  b1: parseSheet("b1", "sheet11.xml", sst),
  b2: parseSheet("b2", "sheet12.xml", sst),
  b3: parseSheet("b3", "sheet13.xml", sst),
  b6: parseSheet("b6", "sheet14.xml", sst),
  b7: parseSheet("b7", "sheet15.xml", sst),
  vanusegrupp: parseSheet("vanusegrupp", "sheet16.xml", sst),
};

function dumpFormulas(sheet) {
  return Object.values(sheet.cells)
    .filter((c) => c.formula)
    .map((c) => ({
      addr: `${c.col}${c.row}`,
      formula: c.formula,
      value: c.value,
      style: c.style,
    }));
}

mkdirSync("tmp-xlsx/json", { recursive: true });

writeFileSync(
  "tmp-xlsx/json/sheet1-formulas.json",
  JSON.stringify(dumpFormulas(sheets.Sheet1), null, 2),
);

const dumps = {
  a1: grid(sheets.a1, 16, 230),
  a2: grid(sheets.a2, 8, 120),
  a3: grid(sheets.a3, 8, 100),
  a4: grid(sheets.a4, 8, 210),
  a5: grid(sheets.a5, 8, 60),
  a6: grid(sheets.a6, 8, 60),
  a7: grid(sheets.a7, 8, 60),
  a8: grid(sheets.a8, 8, 45),
  a10: grid(sheets.a10, 12, 80),
  b1: grid(sheets.b1, 8, 100),
  b2: grid(sheets.b2, 10, 50),
  b3: grid(sheets.b3, 6, 20),
  b6: grid(sheets.b6, 6, 60),
  b7: grid(sheets.b7, 6, 80),
  vanusegrupp: grid(sheets.vanusegrupp, 3, 74),
};

for (const [name, data] of Object.entries(dumps)) {
  writeFileSync(`tmp-xlsx/json/${name}.json`, JSON.stringify(data));
}

const a1Meta = Object.values(sheets.a1.cells)
  .filter((c) => c.row <= 3)
  .map((c) => `${c.col}${c.row}=${JSON.stringify(c.value)}`);
writeFileSync("tmp-xlsx/json/a1-header.txt", a1Meta.join("\n"));
writeFileSync("tmp-xlsx/json/a2-header.txt", Object.values(sheets.a2.cells).filter((c) => c.row <= 4).map((c) => `${c.col}${c.row}=${JSON.stringify(c.value)}`).join("\n"));
writeFileSync("tmp-xlsx/json/b1-header.txt", Object.values(sheets.b1.cells).filter((c) => c.row <= 12).map((c) => `${c.col}${c.row}=${JSON.stringify(c.value)}`).join("\n"));
writeFileSync("tmp-xlsx/json/b2-header.txt", Object.values(sheets.b2.cells).filter((c) => c.row <= 8).map((c) => `${c.col}${c.row}=${JSON.stringify(c.value)}`).join("\n"));
writeFileSync("tmp-xlsx/json/b3.txt", Object.values(sheets.b3.cells).map((c) => `${c.col}${c.row}=${JSON.stringify(c.value)}`).join("\n"));
writeFileSync("tmp-xlsx/json/b6-header.txt", Object.values(sheets.b6.cells).filter((c) => c.row <= 15).map((c) => `${c.col}${c.row}=${JSON.stringify(c.value)}`).join("\n"));
writeFileSync("tmp-xlsx/json/b7-header.txt", Object.values(sheets.b7.cells).filter((c) => c.row <= 15).map((c) => `${c.col}${c.row}=${JSON.stringify(c.value)}`).join("\n"));

console.log("done", Object.keys(dumps).map((k) => `${k}:${dumps[k].length}`).join(", "));
