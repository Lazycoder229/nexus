/**
 * exportTimetable.js
 * Baco Community College – Class Schedule (Timetable) PDF Exporter
 *
 * Page size: 8.5 x 11 inch (Letter) — unit: points (pt)
 * 1 inch = 72 pt
 */

import { jsPDF } from "jspdf";

// Official BCC Header Image URL from the public directory
const HEADER_IMG_URL = `${import.meta.env.BASE_URL}bccheader.jpg`;

// ─── Page / Layout constants (all in pt) ─────────────────────────────────────
const PW = 8.5 * 72; // 612 pt
const PH = 11 * 72;  // 792 pt
const ML = 10;
const MR = PW - 10;
const BODY_W = MR - ML; // 592 pt

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Helper to load image as HTMLImageElement
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// ─── Cell drawing helper ──────────────────────────────────────────────────────
function cell(doc, text, x, y, w, h, opts = {}) {
  const {
    align = "left",
    bold = false,
    fontSize = 8,
    fill = null,
    border = true,
    padding = 3,
    valign = "middle",
  } = opts;

  if (fill) {
    doc.setFillColor(...fill);
    doc.rect(x, y, w, h, "F");
  }
  if (border) {
    doc.setLineWidth(0.4);
    doc.setDrawColor(0);
    doc.rect(x, y, w, h, "S");
  }

  doc.setFontSize(fontSize);
  doc.setFont("helvetica", bold ? "bold" : "normal");

  const textY =
    valign === "middle"
      ? y + h / 2 + fontSize * 0.35
      : y + padding + fontSize * 0.52;

  const maxW = w - padding * 2;
  const str = String(text ?? "");

  if (align === "center") {
    doc.text(str, x + w / 2, textY, { align: "center", maxWidth: maxW });
  } else if (align === "right") {
    doc.text(str, x + w - padding, textY, { align: "right", maxWidth: maxW });
  } else {
    doc.text(str, x + padding, textY, { align: "left", maxWidth: maxW });
  }
}

function safe(val) {
  if (val === null || val === undefined) return "";
  const s = String(val).trim();
  return s === "0" ? "" : s;
}

// ─── Main export function ─────────────────────────────────────────────────────
/**
 * @param {Object} studentInfo - { full_name, student_number }
 * @param {Object} periodMeta  - { school_year, semester, year_level }
 * @param {Array}  timetable   - flat array of { day, subject_code, subject_name,
 *                                start_time, end_time, room, instructor }
 */
export async function exportTimetablePDF(
  studentInfo = {},
  periodMeta = {},
  timetable = [],
) {
  const doc = new jsPDF({
    unit: "pt",
    format: [PW, PH],
    orientation: "portrait",
  });

  let headerImg = null;
  try {
    headerImg = await loadImage(HEADER_IMG_URL);
  } catch (e) {
    console.warn("BCC Timetable: could not load header image –", e.message);
  }

  let y = 30;

  // ── HEADER WITH bccheader.jpg (matching exportRegistrationForm.js) ─────────
  if (headerImg) {
    const HEADER_H = 50; // exact height matching exportRegistrationForm.js
    doc.addImage(headerImg, "JPEG", ML, y, BODY_W, HEADER_H);
    y += HEADER_H + 10;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("BACO COMMUNITY COLLEGE", PW / 2, y, { align: "center" });
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Poblacion Baco, Oriental Mindoro", PW / 2, y, { align: "center" });
    y += 18;
  }

  // Divider line
  doc.setLineWidth(0.4);
  doc.setDrawColor(0);
  doc.line(ML, y, MR, y);
  y += 12;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("OFFICIAL CLASS SCHEDULE", PW / 2, y, { align: "center" });
  y += 18;

  // ── STUDENT INFO BOX ────────────────────────────────────────────────────────
  const infoStartY = y;
  doc.setFontSize(8.5);

  doc.setFont("helvetica", "bold");
  doc.text("Student Name:", ML, y);
  doc.setFont("helvetica", "normal");
  doc.text(safe(studentInfo.full_name) || "N/A", ML + 80, y);

  doc.setFont("helvetica", "bold");
  doc.text("Student No.:", ML + 300, y);
  doc.setFont("helvetica", "normal");
  doc.text(safe(studentInfo.student_number) || "N/A", ML + 380, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.text("Academic Year:", ML, y);
  doc.setFont("helvetica", "normal");
  doc.text(safe(periodMeta.school_year) || "N/A", ML + 80, y);

  doc.setFont("helvetica", "bold");
  doc.text("Semester:", ML + 300, y);
  doc.setFont("helvetica", "normal");
  doc.text(safe(periodMeta.semester) || "N/A", ML + 380, y);
  y += 14;

  if (periodMeta.year_level) {
    doc.setFont("helvetica", "bold");
    doc.text("Year Level:", ML, y);
    doc.setFont("helvetica", "normal");
    doc.text(safe(periodMeta.year_level), ML + 80, y);
    y += 14;
  }

  y += 6;

  // ── TIMETABLE TABLE ─────────────────────────────────────────────────────────
  const colWidths = [70, 95, 75, 140, 75, 85];
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const scale = BODY_W / totalW;
  const scaledWidths = colWidths.map((w) => Math.round(w * scale));

  const headers = [
    "DAY",
    "TIME",
    "CODE",
    "SUBJECT TITLE",
    "ROOM",
    "INSTRUCTOR",
  ];

  // Header row (BCC Maroon)
  let cx = ML;
  headers.forEach((h, i) => {
    cell(doc, h, cx, y, scaledWidths[i], 18, {
      align: "center",
      bold: true,
      fontSize: 8,
      fill: [128, 0, 32],
      valign: "middle",
    });
    doc.setTextColor(255, 255, 255);
    doc.text(h, cx + scaledWidths[i] / 2, y + 18 / 2 + 8 * 0.35, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);
    cx += scaledWidths[i];
  });
  y += 18;

  // Body rows
  const sorted = [...timetable].sort((a, b) => {
    const da = DAY_ORDER.indexOf(a.day);
    const db = DAY_ORDER.indexOf(b.day);
    return (da === -1 ? 99 : da) - (db === -1 ? 99 : db);
  });

  const ROW_H = 17;

  if (sorted.length === 0) {
    cell(doc, "No scheduled subjects found.", ML, y, BODY_W, ROW_H * 2, {
      align: "center",
      fontSize: 9,
      valign: "middle",
    });
    y += ROW_H * 2;
  } else {
    sorted.forEach((item, rIdx) => {
      const isEven = rIdx % 2 === 0;
      const fill = isEven ? null : [248, 248, 248];

      let cx = ML;
      const rowVals = [
        safe(item.day),
        `${safe(item.start_time)} - ${safe(item.end_time)}`.trim(),
        safe(item.subject_code),
        safe(item.subject_name),
        safe(item.room) || "TBA",
        safe(item.instructor) || "TBA",
      ];
      rowVals.forEach((v, i) => {
        cell(doc, v, cx, y, scaledWidths[i], ROW_H, {
          align: i === 3 ? "left" : "center",
          fontSize: 7.5,
          fill,
          valign: "middle",
        });
        cx += scaledWidths[i];
      });
      y += ROW_H;
    });
  }

  // ── FOOTER / GENERATED DATE ─────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Generated on ${new Date().toLocaleString("en-PH")}`,
    ML,
    PH - 24,
  );
  doc.text(
    "Page 1 of 1",
    PW / 2,
    PH - 24,
    { align: "center" },
  );
  doc.text(
    "Baco Community College – Registrar Office",
    MR,
    PH - 24,
    { align: "right" },
  );
  doc.setTextColor(0, 0, 0);

  const safeName =
    (studentInfo.full_name || "student")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "") || "student";
  doc.save(`BCC_ClassSchedule_${safeName}.pdf`);
}