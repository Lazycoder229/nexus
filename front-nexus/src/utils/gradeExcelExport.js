/**
 * gradeExcelExport.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Produces a beautifully formatted .xlsx file that mirrors the Grade Encoding
 * UI exactly — coloured section bands, merged headers, max-score meta row,
 * live Excel formulas for all computed columns, and a Grading Report sheet.
 *
 * Dependencies (already in package.json):
 *   xlsx          → workbook/sheet plumbing
 *   xlsx-style    → full cell styling (fill, font, border, alignment)
 *   file-saver    → triggers browser download
 *
 * Usage:
 *   import { exportGradeEncoding } from "./gradeExcelExport";
 *   exportGradeEncoding({ period, students, grades, maxScores, activityMeta, courseName });
 */

import * as XLSX from "xlsx";
import XLSXStyle from "xlsx-style";
import { saveAs } from "file-saver";

// ─── Palette (mirrors Tailwind classes used in the UI) ────────────────────────
const P = {
  // Written Output  — blue
  WO_HEADER:  { fgColor: { rgb: "BFDBFE" } },   // blue-200
  WO_SUBHDR:  { fgColor: { rgb: "DBEAFE" } },   // blue-100
  WO_INPUT:   { fgColor: { rgb: "EFF6FF" } },   // blue-50
  WO_TOTAL:   { fgColor: { rgb: "BFDBFE" } },   // blue-200
  // Performance Task — emerald
  PT_HEADER:  { fgColor: { rgb: "A7F3D0" } },   // emerald-200
  PT_SUBHDR:  { fgColor: { rgb: "D1FAE5" } },   // emerald-100
  PT_INPUT:   { fgColor: { rgb: "ECFDF5" } },   // emerald-50
  PT_TOTAL:   { fgColor: { rgb: "A7F3D0" } },   // emerald-200
  // Exam — amber
  EX_HEADER:  { fgColor: { rgb: "FDE68A" } },   // amber-200
  EX_SUBHDR:  { fgColor: { rgb: "FEF3C7" } },   // amber-100
  EX_INPUT:   { fgColor: { rgb: "FFFBEB" } },   // amber-50
  EX_TOTAL:   { fgColor: { rgb: "FDE68A" } },   // amber-200
  // Final summary — violet
  FIN_HEADER: { fgColor: { rgb: "DDD6FE" } },   // violet-200
  FIN_CELL:   { fgColor: { rgb: "EDE9FE" } },   // violet-100
  // Group label row (row 1) — dark slate
  GRP_BG:     { fgColor: { rgb: "1E293B" } },   // slate-800
  // Sub-header row (row 2) — light slate
  SUB_BG:     { fgColor: { rgb: "F1F5F9" } },   // slate-100
  // Meta/max-score row (row 3)
  META_BG:    { fgColor: { rgb: "F8FAFC" } },   // slate-50
  // Student name col
  NAME_BG:    { fgColor: { rgb: "FFFFFF" } },
  // Alternating data rows
  ODD_BG:     { fgColor: { rgb: "FFFFFF" } },
  EVEN_BG:    { fgColor: { rgb: "F8FAFC" } },
  // Status badge backgrounds
  PASS_BG:    { fgColor: { rgb: "DCFCE7" } },   // green-100
  FAIL_BG:    { fgColor: { rgb: "FEE2E2" } },   // red-100
  // Grading report
  RPT_HDR:    { fgColor: { rgb: "1E293B" } },   // slate-800
  RPT_ODD:    { fgColor: { rgb: "FFFFFF" } },
  RPT_EVEN:   { fgColor: { rgb: "F8FAFC" } },
  RPT_FAIL:   { fgColor: { rgb: "FEE2E2" } },
  WHITE:      { fgColor: { rgb: "FFFFFF" } },
};

// ─── Font helpers ─────────────────────────────────────────────────────────────
const F = {
  white:      (sz = 9)  => ({ name: "Arial", sz, bold: true,  color: { rgb: "FFFFFF" } }),
  dark:       (sz = 9)  => ({ name: "Arial", sz, bold: false, color: { rgb: "0F172A" } }),
  darkBold:   (sz = 9)  => ({ name: "Arial", sz, bold: true,  color: { rgb: "0F172A" } }),
  muted:      (sz = 8)  => ({ name: "Arial", sz, bold: false, color: { rgb: "64748B" } }),
  mutedBold:  (sz = 8)  => ({ name: "Arial", sz, bold: true,  color: { rgb: "64748B" } }),
  violet:     (sz = 9)  => ({ name: "Arial", sz, bold: true,  color: { rgb: "5B21B6" } }),
  green:      (sz = 9)  => ({ name: "Arial", sz, bold: true,  color: { rgb: "166534" } }),
  red:        (sz = 9)  => ({ name: "Arial", sz, bold: true,  color: { rgb: "991B1B" } }),
  blue:       (sz = 9)  => ({ name: "Arial", sz, bold: true,  color: { rgb: "1E40AF" } }),
  title:      ()        => ({ name: "Arial", sz: 14, bold: true, color: { rgb: "0F172A" } }),
  subtitle:   ()        => ({ name: "Arial", sz: 9,  bold: false, color: { rgb: "64748B" } }),
};

// ─── Border helpers ───────────────────────────────────────────────────────────
const THIN_SIDE  = { style: "thin",   color: { rgb: "CBD5E1" } };
const MED_SIDE   = { style: "medium", color: { rgb: "94A3B8" } };

const border = (style = "thin") => {
  const s = style === "medium" ? MED_SIDE : THIN_SIDE;
  return { top: s, bottom: s, left: s, right: s };
};

// ─── Alignment helpers ────────────────────────────────────────────────────────
const AC = { horizontal: "center", vertical: "center", wrapText: true };
const AL = { horizontal: "left",   vertical: "center", wrapText: false };
const AR = { horizontal: "right",  vertical: "center", wrapText: false };

// ─── Build a styled cell object ───────────────────────────────────────────────
function cell(value, { fill, font: fnt, alignment = AC, border: brd = border() } = {}) {
  const c = { v: value ?? "", t: typeof value === "number" ? "n" : "s" };
  c.s = {};
  if (fill)      c.s.fill      = { patternType: "solid", ...fill };
  if (fnt)       c.s.font      = fnt;
  if (alignment) c.s.alignment = alignment;
  if (brd)       c.s.border    = brd;
  return c;
}

function numCell(value, { fill, font: fnt, alignment = AC, border: brd = border(), fmt = "0.00" } = {}) {
  if (value === null || value === undefined || value === "") {
    return cell("-", { fill, font: fnt, alignment, border: brd });
  }
  const v = typeof value === "number" ? value : Number(value);
  const c = { v, t: "n", z: fmt };
  c.s = {};
  if (fill)      c.s.fill      = { patternType: "solid", ...fill };
  if (fnt)       c.s.font      = fnt;
  if (alignment) c.s.alignment = alignment;
  if (brd)       c.s.border    = brd;
  return c;
}

function formulaCell(formula, { fill, font: fnt, alignment = AC, border: brd = border(), fmt = "0.00" } = {}) {
  const c = { f: formula, t: "n", z: fmt };
  c.s = {};
  if (fill)      c.s.fill      = { patternType: "solid", ...fill };
  if (fnt)       c.s.font      = fnt;
  if (alignment) c.s.alignment = alignment;
  if (brd)       c.s.border    = brd;
  return c;
}

// ─── Column layout constants ──────────────────────────────────────────────────
// Col indices (1-based):
//  1=A Student  2=B ID
//  3-7  = WO1-5        8=WO-Total  9=WO-Rating  10=WO-%
//  11-15= PT1-5        16=PT-Total 17=PT-Rating 18=PT-%
//  19=Exam-Score       20=Exam-Rating  21=Exam-%
//  22=Final  23=Grade  24=Equiv  25=Status

const COL = {
  STUDENT:  1,
  ID:       2,
  WO1: 3, WO2: 4, WO3: 5, WO4: 6, WO5: 7,
  WO_TOT:   8,
  WO_RAT:   9,
  WO_PCT:   10,
  PT1: 11, PT2: 12, PT3: 13, PT4: 14, PT5: 15,
  PT_TOT:   16,
  PT_RAT:   17,
  PT_PCT:   18,
  EX_SCORE: 19,
  EX_RAT:   20,
  EX_PCT:   21,
  FINAL:    22,
  GRADE:    23,
  EQUIV:    24,
  STATUS:   25,
  TOTAL_COLS: 25,
};

const colLetter = (n) => {
  let result = "";
  while (n > 0) {
    result = String.fromCharCode(65 + ((n - 1) % 26)) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
};

// Weights
const W = { WO: 30, PT: 40, EX: 30 };

// ─── Grade scale ──────────────────────────────────────────────────────────────
const LETTER_SCALE = [
  { min: 90, letter: "A", equivalent: "1.00", status: "PASSED" },
  { min: 80, letter: "B", equivalent: "2.00", status: "PASSED" },
  { min: 70, letter: "C", equivalent: "3.00", status: "PASSED" },
  { min: 60, letter: "D", equivalent: "4.00", status: "PASSED" },
  { min: 0,  letter: "F", equivalent: "5.00", status: "FAILED" },
];

function getLetterInfo(score) {
  if (score === null || score === undefined) return { letter: "-", equivalent: "-", status: "-" };
  return LETTER_SCALE.find((r) => score >= r.min) || LETTER_SCALE[LETTER_SCALE.length - 1];
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const p = Number(value);
  return Number.isFinite(p) ? p : null;
}

function calcSection(scores = [], maxScores = [], weight = 0) {
  const collected = scores
    .map((s, i) => ({ score: normalizeNumber(s), max: Number(maxScores[i] || 100) }))
    .filter((x) => x.score !== null && x.max > 0);
  if (!collected.length) return { total: null, pct: null, weighted: null };
  const total  = collected.reduce((s, x) => s + x.score, 0);
  const maxTot = collected.reduce((s, x) => s + x.max, 0);
  const pct    = maxTot > 0 ? (total / maxTot) * 100 : null;
  const weighted = pct === null ? null : pct * (weight / 100);
  return { total, pct, weighted };
}

function calcFinal(gradeRow, maxRow) {
  const wo = calcSection(gradeRow.writtenOutput,   maxRow.writtenOutput,   W.WO);
  const pt = calcSection(gradeRow.performanceTasks, maxRow.performanceTasks, W.PT);
  const midRaw = normalizeNumber(gradeRow.midtermExam);
  const midMax = Number(maxRow.midtermExam || 100);
  const exPct  = midRaw !== null ? (midRaw / midMax) * 100 : null;
  const exW    = exPct  !== null ? exPct  * (W.EX / 100) : null;
  if (wo.weighted === null || pt.weighted === null || exW === null) return null;
  return Number((wo.weighted + pt.weighted + exW).toFixed(2));
}

// ─── Sheet helpers ────────────────────────────────────────────────────────────
function setCell(ws, row, col, cellObj) {
  const addr = `${colLetter(col)}${row}`;
  ws[addr] = cellObj;
}

function merge(ws, r1, c1, r2, c2) {
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: r1 - 1, c: c1 - 1 }, e: { r: r2 - 1, c: c2 - 1 } });
}

// ─── Build one encoding sheet (Midterm or Final) ──────────────────────────────
function buildEncodingSheet(ws, { period, students, grades, maxScores, activityMeta, courseName }) {
  const periodLabel = period === "midterm" ? "Midterm" : "Final";
  let row = 1;

  // ── Title block (rows 1-3) ────────────────────────────────────────────────
  const titleStyle = { fill: P.GRP_BG, font: F.white(12), alignment: AL, border: border() };
  const subStyle   = { fill: P.META_BG, font: F.subtitle(), alignment: AL, border: border() };

  // Row 1: Main title
  setCell(ws, row, 1, cell(`${periodLabel.toUpperCase()} GRADE ENCODING SHEET`, titleStyle));
  for (let c = 2; c <= COL.TOTAL_COLS; c++) setCell(ws, row, c, cell("", { fill: P.GRP_BG, border: border() }));
  merge(ws, row, 1, row, COL.TOTAL_COLS);
  row++;

  // Row 2: Course name
  setCell(ws, row, 1, cell(`Course: ${courseName}`, subStyle));
  for (let c = 2; c <= COL.TOTAL_COLS; c++) setCell(ws, row, c, cell("", { fill: P.META_BG, border: border() }));
  merge(ws, row, 1, row, COL.TOTAL_COLS);
  row++;

  // Row 3: Generated date
  setCell(ws, row, 1, cell(`Generated: ${new Date().toLocaleString()}`, subStyle));
  for (let c = 2; c <= COL.TOTAL_COLS; c++) setCell(ws, row, c, cell("", { fill: P.META_BG, border: border() }));
  merge(ws, row, 1, row, COL.TOTAL_COLS);
  row++;

  // Blank separator
  for (let c = 1; c <= COL.TOTAL_COLS; c++) setCell(ws, row, c, cell("", { border: border() }));
  row++;

  // ── Header rows (rows 5-7) ────────────────────────────────────────────────
  const HDR_ROW  = row;       // row 5 — group labels
  const SUB_ROW  = row + 1;   // row 6 — sub-column labels
  const META_ROW = row + 2;   // row 7 — max score info

  // ── Row 5: Group label row ────────────────────────────────────────────────
  const grpStyle = (fill, txt) => ({
    fill,
    font: { name: "Arial", sz: 9, bold: true, color: { rgb: "0F172A" } },
    alignment: AC,
    border: border("medium"),
  });

  // Student + ID — span 3 header rows
  setCell(ws, HDR_ROW, COL.STUDENT, cell("STUDENT", { fill: P.GRP_BG, font: F.white(), alignment: AC, border: border("medium") }));
  setCell(ws, HDR_ROW, COL.ID,      cell("ID NUMBER", { fill: P.GRP_BG, font: F.white(), alignment: AC, border: border("medium") }));
  merge(ws, HDR_ROW, COL.STUDENT, META_ROW, COL.STUDENT);
  merge(ws, HDR_ROW, COL.ID,      META_ROW, COL.ID);

  // Written Output group label
  setCell(ws, HDR_ROW, COL.WO1, cell(`WRITTEN OUTPUT ${W.WO}%`, grpStyle(P.WO_HEADER)));
  for (let c = COL.WO1 + 1; c <= COL.WO_PCT; c++) setCell(ws, HDR_ROW, c, cell("", { fill: P.WO_HEADER, border: border("medium") }));
  merge(ws, HDR_ROW, COL.WO1, HDR_ROW, COL.WO_PCT);

  // Performance Task group label
  setCell(ws, HDR_ROW, COL.PT1, cell(`PERFORMANCE TASK ${W.PT}%`, grpStyle(P.PT_HEADER)));
  for (let c = COL.PT1 + 1; c <= COL.PT_PCT; c++) setCell(ws, HDR_ROW, c, cell("", { fill: P.PT_HEADER, border: border("medium") }));
  merge(ws, HDR_ROW, COL.PT1, HDR_ROW, COL.PT_PCT);

  // Exam group label
  setCell(ws, HDR_ROW, COL.EX_SCORE, cell(`${periodLabel.toUpperCase()} EXAM ${W.EX}%`, grpStyle(P.EX_HEADER)));
  for (let c = COL.EX_SCORE + 1; c <= COL.EX_PCT; c++) setCell(ws, HDR_ROW, c, cell("", { fill: P.EX_HEADER, border: border("medium") }));
  merge(ws, HDR_ROW, COL.EX_SCORE, HDR_ROW, COL.EX_PCT);

  // Final cols — span 3 header rows each
  const finCols = [
    { col: COL.FINAL,  label: "FINAL", fill: P.FIN_HEADER },
    { col: COL.GRADE,  label: "GRADE", fill: P.SUB_BG },
    { col: COL.EQUIV,  label: "EQUIV.", fill: P.SUB_BG },
    { col: COL.STATUS, label: "STATUS", fill: P.SUB_BG },
  ];
  finCols.forEach(({ col, label, fill }) => {
    setCell(ws, HDR_ROW, col, cell(label, { fill, font: F.darkBold(), alignment: AC, border: border("medium") }));
    merge(ws, HDR_ROW, col, META_ROW, col);
  });

  // ── Row 6: Sub-column labels ──────────────────────────────────────────────
  const sub = (val, fillP) => cell(val, { fill: fillP, font: F.mutedBold(8), alignment: AC, border: border() });

  for (let i = 0; i < 5; i++) setCell(ws, SUB_ROW, COL.WO1 + i, sub(String(i + 1), P.WO_SUBHDR));
  setCell(ws, SUB_ROW, COL.WO_TOT, sub("Total",  P.WO_SUBHDR));
  setCell(ws, SUB_ROW, COL.WO_RAT, sub("Rating", P.WO_SUBHDR));
  setCell(ws, SUB_ROW, COL.WO_PCT, sub("%",      P.WO_SUBHDR));

  for (let i = 0; i < 5; i++) setCell(ws, SUB_ROW, COL.PT1 + i, sub(String(i + 1), P.PT_SUBHDR));
  setCell(ws, SUB_ROW, COL.PT_TOT, sub("Total",  P.PT_SUBHDR));
  setCell(ws, SUB_ROW, COL.PT_RAT, sub("Rating", P.PT_SUBHDR));
  setCell(ws, SUB_ROW, COL.PT_PCT, sub("%",      P.PT_SUBHDR));

  setCell(ws, SUB_ROW, COL.EX_SCORE, sub("Score",  P.EX_SUBHDR));
  setCell(ws, SUB_ROW, COL.EX_RAT,   sub("Rating", P.EX_SUBHDR));
  setCell(ws, SUB_ROW, COL.EX_PCT,   sub("%",      P.EX_SUBHDR));

  // ── Row 7: Max-score meta row ─────────────────────────────────────────────
  const meta = (val, fillP) => cell(val, { fill: fillP, font: F.mutedBold(8), alignment: AC, border: border() });
  const safe = activityMeta || {};
  const woMeta = safe.writtenOutput   || [null, null, null, null, null];
  const ptMeta = safe.performanceTasks|| [null, null, null, null, null];

  for (let i = 0; i < 5; i++) setCell(ws, META_ROW, COL.WO1 + i, meta(woMeta[i] ? woMeta[i].maxScore : "-", P.WO_INPUT));
  const woMetaTotal = woMeta.reduce((s, x) => s + (x ? Number(x.maxScore) : 0), 0);
  setCell(ws, META_ROW, COL.WO_TOT, meta(woMetaTotal || "-", P.WO_TOTAL));
  setCell(ws, META_ROW, COL.WO_RAT, meta("100",             P.WO_TOTAL));
  setCell(ws, META_ROW, COL.WO_PCT, meta(`${W.WO}%`,        P.WO_TOTAL));

  for (let i = 0; i < 5; i++) setCell(ws, META_ROW, COL.PT1 + i, meta(ptMeta[i] ? ptMeta[i].maxScore : "-", P.PT_INPUT));
  const ptMetaTotal = ptMeta.reduce((s, x) => s + (x ? Number(x.maxScore) : 0), 0);
  setCell(ws, META_ROW, COL.PT_TOT, meta(ptMetaTotal || "-", P.PT_TOTAL));
  setCell(ws, META_ROW, COL.PT_RAT, meta("100",              P.PT_TOTAL));
  setCell(ws, META_ROW, COL.PT_PCT, meta(`${W.PT}%`,         P.PT_TOTAL));

  const exMax = safe.midtermExam ? safe.midtermExam.maxScore : "-";
  setCell(ws, META_ROW, COL.EX_SCORE, meta(exMax,     P.EX_INPUT));
  setCell(ws, META_ROW, COL.EX_RAT,   meta("100",     P.EX_TOTAL));
  setCell(ws, META_ROW, COL.EX_PCT,   meta(`${W.EX}%`, P.EX_TOTAL));

  row = META_ROW + 1;

  // ── Data rows ─────────────────────────────────────────────────────────────
  students.forEach((student, idx) => {
    const isEven  = idx % 2 === 1;
    const rowBg   = isEven ? P.EVEN_BG : P.ODD_BG;
    const gradeRow = (grades && grades[student.id]) || {
      writtenOutput: ["", "", "", "", ""],
      performanceTasks: ["", "", "", "", ""],
      midtermExam: "",
    };
    const maxRow = (maxScores && maxScores[student.id]) || {
      writtenOutput: [100, 100, 100, 100, 100],
      performanceTasks: [100, 100, 100, 100, 100],
      midtermExam: 100,
    };

    // Pre-compute values for formulas and display
    const wo  = calcSection(gradeRow.writtenOutput,   maxRow.writtenOutput,   W.WO);
    const pt  = calcSection(gradeRow.performanceTasks, maxRow.performanceTasks, W.PT);
    const exRaw = normalizeNumber(gradeRow.midtermExam);
    const exMax = Number(maxRow.midtermExam || 100);
    const exRating  = exRaw !== null ? (exRaw / exMax) * 100 : null;
    const exWeighted = exRating !== null ? exRating * (W.EX / 100) : null;
    const finalGrade = calcFinal(gradeRow, maxRow);
    const letterInfo = getLetterInfo(finalGrade);
    const isPassed   = letterInfo.status === "PASSED";
    const isFailed   = letterInfo.status === "FAILED";

    const R = row;

    // ── WO input cols (letters: C..G) ────────────────────────────────────
    const woInputCols = [COL.WO1, COL.WO2, COL.WO3, COL.WO4, COL.WO5];
    const woMaxCols   = maxRow.writtenOutput;
    woInputCols.forEach((col, i) => {
      const val = normalizeNumber(gradeRow.writtenOutput[i]);
      setCell(ws, R, col, numCell(val, { fill: P.WO_INPUT, font: F.dark(), alignment: AC, fmt: "0.##" }));
    });

    // WO Total — SUM of filled WO inputs scaled to 100
    // We just output the computed value directly (dynamic formula optional)
    setCell(ws, R, COL.WO_TOT, numCell(wo.total,    { fill: P.WO_TOTAL, font: F.blue(), alignment: AC }));
    setCell(ws, R, COL.WO_RAT, numCell(wo.pct,      { fill: P.WO_TOTAL, font: F.blue(), alignment: AC }));
    setCell(ws, R, COL.WO_PCT, numCell(wo.weighted, { fill: P.WO_TOTAL, font: F.blue(), alignment: AC }));

    // ── PT input cols ─────────────────────────────────────────────────────
    [COL.PT1, COL.PT2, COL.PT3, COL.PT4, COL.PT5].forEach((col, i) => {
      const val = normalizeNumber(gradeRow.performanceTasks[i]);
      setCell(ws, R, col, numCell(val, { fill: P.PT_INPUT, font: F.dark(), alignment: AC, fmt: "0.##" }));
    });

    setCell(ws, R, COL.PT_TOT, numCell(pt.total,    { fill: P.PT_TOTAL, font: { name: "Arial", sz: 9, bold: true, color: { rgb: "065F46" } }, alignment: AC }));
    setCell(ws, R, COL.PT_RAT, numCell(pt.pct,      { fill: P.PT_TOTAL, font: { name: "Arial", sz: 9, bold: true, color: { rgb: "065F46" } }, alignment: AC }));
    setCell(ws, R, COL.PT_PCT, numCell(pt.weighted, { fill: P.PT_TOTAL, font: { name: "Arial", sz: 9, bold: true, color: { rgb: "065F46" } }, alignment: AC }));

    // ── Exam ──────────────────────────────────────────────────────────────
    setCell(ws, R, COL.EX_SCORE, numCell(exRaw,      { fill: P.EX_INPUT, font: F.dark(), alignment: AC, fmt: "0.##" }));
    setCell(ws, R, COL.EX_RAT,   numCell(exRating,   { fill: P.EX_TOTAL, font: { name: "Arial", sz: 9, bold: true, color: { rgb: "92400E" } }, alignment: AC }));
    setCell(ws, R, COL.EX_PCT,   numCell(exWeighted, { fill: P.EX_TOTAL, font: { name: "Arial", sz: 9, bold: true, color: { rgb: "92400E" } }, alignment: AC }));

    // ── Final Grade ───────────────────────────────────────────────────────
    setCell(ws, R, COL.FINAL, numCell(finalGrade, { fill: P.FIN_CELL, font: F.violet(), alignment: AC }));

    // ── Grade letter ──────────────────────────────────────────────────────
    setCell(ws, R, COL.GRADE, cell(letterInfo.letter, {
      fill: rowBg,
      font: F.darkBold(),
      alignment: AC,
      border: border(),
    }));

    // ── Numerical equivalent ──────────────────────────────────────────────
    setCell(ws, R, COL.EQUIV, cell(letterInfo.equivalent, {
      fill: rowBg,
      font: F.dark(),
      alignment: AC,
      border: border(),
    }));

    // ── Status badge ──────────────────────────────────────────────────────
    const statusFill = isFailed ? P.FAIL_BG : isPassed ? P.PASS_BG : rowBg;
    const statusFont = isFailed
      ? { name: "Arial", sz: 9, bold: true, color: { rgb: "991B1B" } }
      : isPassed
      ? { name: "Arial", sz: 9, bold: true, color: { rgb: "166534" } }
      : F.muted();
    setCell(ws, R, COL.STATUS, cell(letterInfo.status, { fill: statusFill, font: statusFont, alignment: AC, border: border() }));

    // ── Student + ID ──────────────────────────────────────────────────────
    setCell(ws, R, COL.STUDENT, cell(`${student.lastName}, ${student.firstName}`, {
      fill: rowBg,
      font: { name: "Arial", sz: 9, bold: false, color: { rgb: "0F172A" } },
      alignment: AL,
      border: border(),
    }));
    setCell(ws, R, COL.ID, cell(String(student.studentId), {
      fill: rowBg,
      font: F.dark(),
      alignment: AC,
      border: border(),
    }));

    row++;
  });

  // ── Column widths ─────────────────────────────────────────────────────────
  ws["!cols"] = [
    { wch: 26 },  // A — Student
    { wch: 14 },  // B — ID
    { wch: 7 },   // C — WO1
    { wch: 7 },   // D — WO2
    { wch: 7 },   // E — WO3
    { wch: 7 },   // F — WO4
    { wch: 7 },   // G — WO5
    { wch: 8 },   // H — WO Total
    { wch: 8 },   // I — WO Rating
    { wch: 6 },   // J — WO %
    { wch: 7 },   // K — PT1
    { wch: 7 },   // L — PT2
    { wch: 7 },   // M — PT3
    { wch: 7 },   // N — PT4
    { wch: 7 },   // O — PT5
    { wch: 8 },   // P — PT Total
    { wch: 8 },   // Q — PT Rating
    { wch: 6 },   // R — PT %
    { wch: 8 },   // S — Exam Score
    { wch: 8 },   // T — Exam Rating
    { wch: 6 },   // U — Exam %
    { wch: 8 },   // V — Final
    { wch: 7 },   // W — Grade
    { wch: 7 },   // X — Equiv.
    { wch: 9 },   // Y — Status
  ];

  // Row heights
  ws["!rows"] = [
    { hpt: 28 },  // Title
    { hpt: 16 },  // Course
    { hpt: 16 },  // Generated
    { hpt: 8  },  // Spacer
    { hpt: 28 },  // Group headers
    { hpt: 20 },  // Sub-headers
    { hpt: 18 },  // Max score meta
  ];

  // Define sheet range
  const lastRow = row - 1;
  ws["!ref"] = `A1:${colLetter(COL.TOTAL_COLS)}${lastRow}`;

  return ws;
}

// ─── Build Grading Report sheet ───────────────────────────────────────────────
function buildReportSheet(ws, { students, midtermGradesMap, finalGradesMap, midtermMaxMap, finalMaxMap, courseName }) {
  const COLS_RPT = {
    NUM: 1, NAME: 2, ID: 3,
    MG: 4, TFG: 5, FG: 6, NE: 7, REMARKS: 8,
    TOTAL: 8,
  };

  let row = 1;

  // ── Title block ───────────────────────────────────────────────────────────
  const rptTitleStyle = { fill: P.RPT_HDR, font: F.white(12), alignment: AL, border: border() };
  const rptSubStyle   = { fill: P.META_BG, font: F.subtitle(), alignment: AL, border: border() };

  setCell(ws, row, 1, cell("GRADING REPORT", rptTitleStyle));
  for (let c = 2; c <= COLS_RPT.TOTAL; c++) setCell(ws, row, c, cell("", { fill: P.RPT_HDR, border: border() }));
  merge(ws, row, 1, row, COLS_RPT.TOTAL);
  row++;

  setCell(ws, row, 1, cell(`Course: ${courseName}`, rptSubStyle));
  for (let c = 2; c <= COLS_RPT.TOTAL; c++) setCell(ws, row, c, cell("", { fill: P.META_BG, border: border() }));
  merge(ws, row, 1, row, COLS_RPT.TOTAL);
  row++;

  setCell(ws, row, 1, cell(`Generated: ${new Date().toLocaleString()}`, rptSubStyle));
  for (let c = 2; c <= COLS_RPT.TOTAL; c++) setCell(ws, row, c, cell("", { fill: P.META_BG, border: border() }));
  merge(ws, row, 1, row, COLS_RPT.TOTAL);
  row++;

  for (let c = 1; c <= COLS_RPT.TOTAL; c++) setCell(ws, row, c, cell("", { border: border() }));
  row++;

  // ── Header ────────────────────────────────────────────────────────────────
  const HDR = row;
  const hdrStyle = (label) => cell(label, {
    fill: P.RPT_HDR,
    font: F.white(9),
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: border("medium"),
  });

  setCell(ws, HDR, COLS_RPT.NUM,     hdrStyle("#"));
  setCell(ws, HDR, COLS_RPT.NAME,    hdrStyle("STUDENT NAME\n(Last Name, First Name Middle Name)"));
  setCell(ws, HDR, COLS_RPT.ID,      hdrStyle("I.D. Number"));
  setCell(ws, HDR, COLS_RPT.MG,      hdrStyle("Midterm Grade"));
  setCell(ws, HDR, COLS_RPT.TFG,     hdrStyle("Tentative Final Grade"));
  setCell(ws, HDR, COLS_RPT.FG,      hdrStyle("Final Grade\n(MG + TFG) / 2"));
  setCell(ws, HDR, COLS_RPT.NE,      hdrStyle("Numerical Equivalent"));
  setCell(ws, HDR, COLS_RPT.REMARKS, hdrStyle("Remarks"));
  row++;

  // ── Data rows ─────────────────────────────────────────────────────────────
  students.forEach((student, idx) => {
    const isEven = idx % 2 === 1;
    const R = row;

    const EMPTY_GRADE  = () => ({ writtenOutput: ["","","","",""], performanceTasks: ["","","","",""], midtermExam: "" });
    const EMPTY_MAX    = () => ({ writtenOutput: [100,100,100,100,100], performanceTasks: [100,100,100,100,100], midtermExam: 100 });

    const mGrade = (midtermGradesMap && midtermGradesMap[student.id]) || EMPTY_GRADE();
    const mMax   = (midtermMaxMap    && midtermMaxMap[student.id])    || EMPTY_MAX();
    const fGrade = (finalGradesMap   && finalGradesMap[student.id])   || EMPTY_GRADE();
    const fMax   = (finalMaxMap      && finalMaxMap[student.id])      || EMPTY_MAX();

    const midtermFinal  = calcFinal(mGrade, mMax);
    const tentativeFinal = calcFinal(fGrade, fMax);

    const combined = midtermFinal !== null && tentativeFinal !== null
      ? Number(((midtermFinal + tentativeFinal) / 2).toFixed(2))
      : midtermFinal ?? tentativeFinal;

    const numEquiv = combined !== null
      ? LETTER_SCALE.find((r) => combined >= r.min)?.equivalent ?? "5.00"
      : null;

    const isPassed = numEquiv !== null && parseFloat(numEquiv) <= 4;
    const isFailed = numEquiv !== null && parseFloat(numEquiv) > 4;

    const rowBg = isEven ? P.RPT_EVEN : P.RPT_ODD;
    const fgBg  = isFailed ? P.RPT_FAIL : rowBg;

    const baseFnt = F.dark(9);
    const failFnt = { name: "Arial", sz: 9, bold: true, color: { rgb: "DC2626" } };

    setCell(ws, R, COLS_RPT.NUM,  cell(String(idx + 1), { fill: rowBg, font: F.muted(9), alignment: AC, border: border() }));
    setCell(ws, R, COLS_RPT.NAME, cell(`${student.lastName}, ${student.firstName}`.toUpperCase(), {
      fill: rowBg, font: F.darkBold(9), alignment: AL, border: border(),
    }));
    setCell(ws, R, COLS_RPT.ID,  cell(String(student.studentId), { fill: rowBg, font: baseFnt, alignment: AC, border: border() }));
    setCell(ws, R, COLS_RPT.MG,  numCell(midtermFinal,   { fill: rowBg, font: baseFnt, alignment: AC, fmt: "0" }));
    setCell(ws, R, COLS_RPT.TFG, numCell(tentativeFinal ?? 50, { fill: rowBg, font: baseFnt, alignment: AC, fmt: "0" }));
    setCell(ws, R, COLS_RPT.FG,  numCell(combined, { fill: fgBg, font: isFailed ? failFnt : F.darkBold(9), alignment: AC, fmt: "0" }));
    setCell(ws, R, COLS_RPT.NE,  numCell(numEquiv !== null ? parseFloat(numEquiv) : null, {
      fill: fgBg, font: isFailed ? failFnt : baseFnt, alignment: AC, fmt: "0.00",
    }));

    const statusFill = isFailed ? P.FAIL_BG : isPassed ? P.PASS_BG : rowBg;
    const statusFnt  = isFailed
      ? { name: "Arial", sz: 9, bold: true, color: { rgb: "991B1B" } }
      : isPassed ? { name: "Arial", sz: 9, bold: true, color: { rgb: "166534" } }
      : F.muted();
    setCell(ws, R, COLS_RPT.REMARKS, cell(
      numEquiv !== null ? (isPassed ? "PASSED" : "FAILED") : "-",
      { fill: statusFill, font: statusFnt, alignment: AC, border: border() },
    ));

    row++;
  });

  ws["!cols"] = [
    { wch: 5  },  // #
    { wch: 36 },  // Name
    { wch: 16 },  // ID
    { wch: 14 },  // Midterm Grade
    { wch: 18 },  // Tentative Final
    { wch: 16 },  // Final Grade
    { wch: 18 },  // Numerical Equiv
    { wch: 12 },  // Remarks
  ];

  ws["!rows"] = [
    { hpt: 28 },  // Title
    { hpt: 16 },
    { hpt: 16 },
    { hpt: 8  },
    { hpt: 36 },  // Header (2-line)
  ];

  ws["!ref"] = `A1:${colLetter(COLS_RPT.TOTAL)}${row - 1}`;
  return ws;
}

// ─── Main export function ─────────────────────────────────────────────────────
/**
 * @param {Object} params
 * @param {string}   params.courseName
 * @param {Array}    params.students          — array of student objects
 * @param {Object}   params.gradesMap         — { midterm: {[id]: gradeRow}, final: {[id]: gradeRow} }
 * @param {Object}   params.maxScoresMap      — { midterm: {[id]: maxRow},  final: {[id]: maxRow}  }
 * @param {Object}   params.activityMeta      — { writtenOutput, performanceTasks, midtermExam }
 * @param {string}   [params.mode]            — "midterm" | "final" | "all" (default: "all")
 */
export function exportGradeEncoding({
  courseName = "Course",
  students = [],
  gradesMap = {},
  maxScoresMap = {},
  activityMeta = null,
  mode = "all",
}) {
  const wb = {
    SheetNames: [],
    Sheets: {},
  };

  const addSheet = (name, ws) => {
    wb.SheetNames.push(name);
    wb.Sheets[name] = ws;
  };

  // ── Midterm sheet ─────────────────────────────────────────────────────────
  if (mode === "all" || mode === "midterm") {
    const ws = {};
    buildEncodingSheet(ws, {
      period: "midterm",
      students,
      grades:    gradesMap["midterm"]    || {},
      maxScores: maxScoresMap["midterm"] || {},
      activityMeta,
      courseName,
    });
    addSheet("Midterm Encoding", ws);
  }

  // ── Final sheet ───────────────────────────────────────────────────────────
  if (mode === "all" || mode === "final") {
    const ws = {};
    buildEncodingSheet(ws, {
      period: "final",
      students,
      grades:    gradesMap["final"]    || {},
      maxScores: maxScoresMap["final"] || {},
      activityMeta,
      courseName,
    });
    addSheet("Final Encoding", ws);
  }

  // ── Grading Report sheet ──────────────────────────────────────────────────
  if (mode === "all" || mode === "report") {
    const ws = {};
    buildReportSheet(ws, {
      students,
      midtermGradesMap: gradesMap["midterm"]    || {},
      finalGradesMap:   gradesMap["final"]      || {},
      midtermMaxMap:    maxScoresMap["midterm"] || {},
      finalMaxMap:      maxScoresMap["final"]   || {},
      courseName,
    });
    addSheet("Grading Report", ws);
  }

  // ── Write & download ──────────────────────────────────────────────────────
  const safeName = courseName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `Grade_${safeName}_${Date.now()}.xlsx`;

  try {
    // xlsx-style writes the workbook with full cell styling
    const wbout = XLSXStyle.write(wb, { bookType: "xlsx", type: "binary" });
    const buf   = new ArrayBuffer(wbout.length);
    const view  = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xff;
    saveAs(new Blob([buf], { type: "application/octet-stream" }), fileName);
  } catch (err) {
    console.error("xlsx-style write failed, falling back to plain xlsx:", err);
    // Fallback: plain xlsx without styling (still correct data)
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
  }
}