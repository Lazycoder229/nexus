/**
 * exportHelpers.js
 * Comprehensive export helper functions (Excel .xlsx, CSV, and PDF)
 * featuring the official Baco Community College (BCC) letterhead and branding.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import XLSXStyle from "xlsx-js-style";
import { saveAs } from "file-saver";

// Official BCC Header Image URL from the public directory
const BCC_HEADER_IMG_URL = `${import.meta.env.BASE_URL}bccheader.jpg`;

// ─── Page / Layout constants matching exportRegistrationForm.js (all in pt) ──
const PW = 8.5 * 72;  // 612 pt  (Letter width)
const PH = 11  * 72;  // 792 pt  (Letter height)
const ML = 10;         // left/right margin (pt)

// Field label mappings for readable headers across all modules
const FIELD_LABELS = {
  // Student & Personal
  student_id: "Student ID",
  student_number: "Student Number",
  student_nu: "Student Number",
  student_na: "Student Name",
  student_name: "Student Name",
  full_name: "Full Name",
  first_name: "First Name",
  last_name: "Last Name",
  email: "Email",
  phone: "Phone Number",
  phone_number: "Phone Number",
  phone_num: "Phone Number",
  gender: "Gender",
  birth_date: "Birth Date",
  birthday: "Birth Date",
  age: "Age",
  address: "Address",
  civil_status: "Civil Status",
  religion: "Religion",
  nationality: "Nationality",
  year_level: "Year Level",
  status: "Status",
  role: "Role",

  // Academic & Courses
  program_applied: "Program Applied",
  program_name: "Program",
  program_n: "Program",
  program_code: "Program Code",
  program_c: "Program Code",
  degree_type: "Degree Type",
  duration_years: "Duration (Years)",
  course_id: "Course ID",
  course_code: "Course Code",
  code: "Course Code",
  course_name: "Course Name",
  course_title: "Course Title",
  title: "Title",
  subject_code: "Subject Code",
  subject_name: "Subject Name",
  section: "Section",
  section_name: "Section",
  room: "Room",
  schedule: "Schedule",
  units: "Units",
  total_units: "Units",
  academic_year: "Academic Year",
  academic_y: "Academic Year",
  school_year: "School Year",
  semester: "Semester",
  start_date: "Start Date",
  end_date: "End Date",
  is_active: "Is Active",
  enrollment_id: "Enrollment ID",
  enrollment: "Enrollment Status",
  instructor: "Instructor",
  instructor_name: "Instructor",
  students: "Enrolled Students",
  maxStudents: "Max Capacity",

  // Grades & Evaluation
  total_grade: "Total Grade",
  total_gpa: "GPA",
  gpa: "GPA",
  attendance_rate: "Attendance Rate",
  prelim_grade: "Prelim Grade",
  midterm_grade: "Midterm Grade",
  finals_grade: "Finals Grade",
  final_grade: "Final Grade",
  equivalent: "Equivalent",
  remarks: "Remarks",

  // Department & Faculty / Staff
  department: "Department",
  department_name: "Department",
  department_id: "Department ID",
  head: "Department Head",
  head_name: "Department Head",
  employee_id: "Employee ID",
  employee_name: "Employee Name",
  employee_number: "Emp. No.",
  position: "Position",
  position_title: "Position",
  date_hired: "Date Hired",
  salary: "Salary",

  // Payroll
  basic_pay: "Basic Pay",
  gross_pay: "Gross Pay",
  overtime_pay: "OT Pay",
  holiday_pay: "Holiday Pay",
  night_differential: "Night Diff.",
  allowances: "Allowances",
  bonus: "Bonus",
  sss_deduction: "SSS",
  philhealth_deduction: "PhilHealth",
  pagibig_deduction: "Pag-IBIG",
  tax_deduction: "W/Tax",
  loan_deduction: "Loan",
  other_deductions: "Other Ded.",
  total_deductions: "Total Ded.",
  net_pay: "Net Pay",
  bank_name: "Bank",
  bank_account_number: "Account No.",

  // System & Logs
  log_type: "Log Type",
  message: "Message",
  username: "Username",
  ip_address: "IP Address",
  module: "Module",
  created_at: "Created Date",
  updated_at: "Updated Date",
};

// Fields treated as currency/numeric — right-aligned + comma-formatted in PDF/Excel/CSV
const NUMERIC_FIELDS = new Set([
  "basic_pay",
  "gross_pay",
  "overtime_pay",
  "holiday_pay",
  "night_differential",
  "allowances",
  "bonus",
  "sss_deduction",
  "philhealth_deduction",
  "pagibig_deduction",
  "tax_deduction",
  "loan_deduction",
  "other_deductions",
  "total_deductions",
  "net_pay",
  "salary",
  "units",
  "total_units",
]);

/** Get readable header for a field */
export const getFieldLabel = (field) =>
  FIELD_LABELS[field] || field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Format a numeric value with thousands separators, 2 decimals */
export const formatNumber = (val) =>
  Number(val).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** Format date for display */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/** Format currency for display */
export const formatCurrency = (amount) => {
  if (!amount) return "₱0.00";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

/**
 * Cache for base64 loaded header image so repeated exports don't refetch
 */
let cachedHeaderBase64 = null;

/**
 * Fetch a remote or local image URL and convert it to a base64 data URL.
 */
export const fetchHeaderImageAsBase64 = async (url = BCC_HEADER_IMG_URL) => {
  if (cachedHeaderBase64 && url === BCC_HEADER_IMG_URL) {
    return cachedHeaderBase64;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(blob);
    });
    if (url === BCC_HEADER_IMG_URL) {
      cachedHeaderBase64 = base64;
    }
    return base64;
  } catch (e) {
    console.warn("BCC Export: failed to load header image –", e.message);
    return null;
  }
};

/**
 * Escape a single value for CSV.
 */
const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
};

/**
 * Generate CSV content from array data with official BCC letterhead rows.
 */
export const generateCSV = (data, options = {}) => {
  if (!Array.isArray(data) || data.length === 0) return "";

  const {
    headers = Object.keys(data[0]),
    includeTimestamps = false,
    title = "Report",
    programLabel = "",
    officeLabel: passedOfficeLabel = null,
  } = options;

  const officeLabel =
    passedOfficeLabel ||
    (/payroll/i.test(`${title} ${programLabel}`) ? "HR Office" : "Registrar Office");

  const cols = includeTimestamps
    ? headers
    : headers.filter(
        (h) => !["created_at", "updated_at", "deleted_at"].includes(h),
      );

  const totalCols = Math.max(cols.length, 3);

  const makeRow = (cells = []) =>
    Array.from({ length: totalCols }, (_, i) =>
      escapeCsvValue(cells[i] ?? ""),
    ).join(",");

  const subHeaderText = programLabel
    ? `LIST OF ENROLLED STUDENTS IN THE PROGRAM OF ${programLabel.toUpperCase()}`
    : title.toUpperCase();

  const generatedDateStr = new Date().toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const letterhead = [
    makeRow(["Republic of the Philippines"]),
    makeRow(["Region IV-B  MIMAROPA"]),
    makeRow(["BACO COMMUNITY COLLEGE"]),
    makeRow(["Poblacion, Baco, Oriental Mindoro, 5201"]),
    makeRow(["Email: bccbaco@gmail.com"]),
    makeRow([]), // divider line spacer
    makeRow([subHeaderText]),
    makeRow([
      `Generated: ${generatedDateStr}   |   Total Records: ${data.length}   |   ${officeLabel}`,
    ]),
    makeRow([]), // blank spacer before table
  ];

  const headerLine = cols
    .map((h) => escapeCsvValue(getFieldLabel(h)))
    .join(",");
  const rowLines = data.map((row) =>
    cols
      .map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "boolean") return val ? "Yes" : "No";
        if (NUMERIC_FIELDS.has(h) && !isNaN(val)) {
          return escapeCsvValue(formatNumber(val));
        }
        return escapeCsvValue(val);
      })
      .join(","),
  );

  return [...letterhead, headerLine, ...rowLines].join("\n");
};

/**
 * Download CSV content as a file.
 */
export const downloadCSV = (csvContent, filename = "export.csv") => {
  if (!csvContent) return;
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Draw the official BCC letterhead using bccheader.jpg from public folder.
 */
const drawLetterhead = (
  doc,
  { pageW, margin, headerImageBase64, title, programLabel, recordCount }
) => {
  let y = margin;
  const contentW = pageW - margin * 2;

  // Matching exportRegistrationForm.js: full width banner (BODY_W = 592pt), fixed height 50pt
  if (headerImageBase64) {
    try {
      const headerW = contentW;
      const headerH = 50; // exact height matching exportRegistrationForm.js
      const headerX = margin;

      doc.addImage(headerImageBase64, "JPEG", headerX, y, headerW, headerH);
      y += headerH + 10;
    } catch (e) {
      console.warn("BCC PDF: could not embed header image –", e.message);
    }
  } else {
    // Text fallback if image is unavailable
    const centerX = pageW / 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text("Republic of the Philippines", centerX, y, { align: "center" });
    y += 13;
    doc.text("Region IV-B MIMAROPA", centerX, y, { align: "center" });
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("BACO COMMUNITY COLLEGE", centerX, y, { align: "center" });
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Poblacion, Baco, Oriental Mindoro 5201", centerX, y, { align: "center" });
    y += 13;
    doc.text("Email: bccbaco@gmail.com", centerX, y, { align: "center" });
    y += 11;
  }

  // ── Divider ──
  doc.setLineWidth(0.6);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, pageW - margin, y);
  y += 13;

  // ── Sub-header: report title / program line ──
  const subText = programLabel
    ? `LIST OF ENROLLED STUDENTS IN THE PROGRAM OF ${programLabel.toUpperCase()}`
    : title.toUpperCase();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const titleLines = doc.splitTextToSize(subText, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 15;

  // ── Meta lines ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString("en-PH")}`, margin, y);
  y += 13;
  doc.text(`Total Records: ${recordCount}`, margin, y);
  y += 16;

  return y; // Y where table starts
};

/**
 * Download a professional PDF report with BCC official bccheader.jpg letterhead and footer.
 *
 * Supports both signatures:
 *   downloadPDF(data, options)
 *   downloadPDF(jsPDFLib, autoTableLib, data, options)
 */
export const downloadPDF = async (...args) => {
  let jsPDFLib = jsPDF;
  let autoTableLib = autoTable;
  let data;
  let options = {};

  if (typeof args[0] === "function" && typeof args[1] === "function") {
    jsPDFLib = args[0];
    autoTableLib = args[1];
    data = args[2];
    options = args[3] || {};
  } else {
    data = args[0];
    options = args[1] || {};
  }

  if (!data || data.length === 0) return;

  const {
    title = "Report",
    programLabel = "",
    orientation = "portrait",
    headers = Object.keys(data[0]),
    includeTimestamps = false,
    logoBase64: passedLogo = null,
    filename: customFilename = null,
    showTotals = true,
    headerFillColor = [128, 0, 32], // BCC maroon
    officeLabel: passedOfficeLabel = null,
  } = options;

  // Resolve office label for footer & letterhead
  const officeLabel =
    passedOfficeLabel ||
    (/payroll/i.test(`${title} ${programLabel}`) ? "HR Office" : "Registrar Office");

  // Load bccheader.jpg from public directory
  const headerImageBase64 = passedLogo ?? (await fetchHeaderImageAsBase64(BCC_HEADER_IMG_URL));

  const cols = includeTimestamps
    ? headers
    : headers.filter(
        (h) => !["created_at", "updated_at", "deleted_at"].includes(h),
      );

  const doc = new jsPDFLib({ orientation, unit: "pt", format: [PW, PH] });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = ML; // 10 pt — matches exportRegistrationForm.js

  const tableStartY = drawLetterhead(doc, {
    pageW,
    margin,
    headerImageBase64,
    title,
    programLabel,
    recordCount: data.length,
  });

  const columnStyles = Object.fromEntries(
    cols.map((h, i) => [
      i,
      NUMERIC_FIELDS.has(h)
        ? { halign: "right", cellWidth: "auto" }
        : { halign: "left", cellWidth: "auto" },
    ]),
  );

  const bodyRows = data.map((row) =>
    cols.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      if (typeof val === "boolean") return val ? "Yes" : "No";
      if (NUMERIC_FIELDS.has(h) && !isNaN(val)) return formatNumber(val);
      return String(val);
    }),
  );

  const hasNumericCol = cols.some((h) => NUMERIC_FIELDS.has(h));
  const includeTotalsRow = showTotals && hasNumericCol;

  if (includeTotalsRow) {
    const totalsRow = cols.map((h, i) => {
      if (!NUMERIC_FIELDS.has(h)) return i === 0 ? "TOTAL" : "";
      const sum = data.reduce((s, row) => s + (Number(row[h]) || 0), 0);
      return formatNumber(sum);
    });
    bodyRows.push(totalsRow);
  }

  const totalsRowIndex = includeTotalsRow ? bodyRows.length - 1 : -1;

  autoTableLib(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [cols.map((h) => getFieldLabel(h))],
    body: bodyRows,
    styles: {
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      overflow: "linebreak",
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      valign: "middle",
    },
    headStyles: {
      fillColor: headerFillColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      fontSize: 7.5,
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    columnStyles,
    tableWidth: "auto",
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.3,
    didParseCell: (hookData) => {
      if (
        includeTotalsRow &&
        hookData.section === "body" &&
        hookData.row.index === totalsRowIndex
      ) {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fillColor = [255, 255, 255];
        hookData.cell.styles.lineWidth = {
          top: 1.2,
          bottom: 0.3,
          left: 0.3,
          right: 0.3,
        };
      }
    },
    didAddPage: (hookData) => {
      if (hookData.pageNumber > 1) {
        drawLetterhead(doc, {
          pageW,
          margin,
          headerImageBase64,
          title,
          programLabel,
          recordCount: data.length,
        });
      }
    },
    didDrawPage: (hookData) => {
      const pg = hookData.pageNumber;
      const total = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text(`Page ${pg} of ${total}`, pageW / 2, pageH - 16, {
        align: "center",
      });
      // Dynamically display the correct office label in footer
      doc.text(`Baco Community College – ${officeLabel}`, margin, pageH - 16);
    },
  });

  const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const dateStr = new Date().toISOString().split("T")[0];
  const outFile = customFilename || `BCC_${safeTitle}_${dateStr}.pdf`;
  doc.save(outFile);
};

/**
 * Download a professional Excel (.xlsx) report with official BCC letterhead block.
 */
export const downloadExcel = (data, options = {}) => {
  if (!Array.isArray(data) || data.length === 0) return;

  const {
    headers = Object.keys(data[0]),
    includeTimestamps = false,
    title = "Report",
    programLabel = "",
    filename: customFilename = null,
    officeLabel: passedOfficeLabel = null,
    showTotals = true,
  } = options;

  const officeLabel =
    passedOfficeLabel ||
    (/payroll/i.test(`${title} ${programLabel}`) ? "HR Office" : "Registrar Office");

  const cols = includeTimestamps
    ? headers
    : headers.filter(
        (h) => !["created_at", "updated_at", "deleted_at"].includes(h),
      );

  const totalCols = Math.max(cols.length, 4);

  const wb = XLSXStyle.utils.book_new();
  const ws = {};

  const P = {
    SCHOOL_TEXT: { rgb: "1E293B" },
    SUB_TEXT:    { rgb: "475569" },
    HEADER_BG:   { fgColor: { rgb: "800020" } }, // BCC Maroon
    BORDER:      { style: "thin", color: { rgb: "CBD5E1" } },
    DIVIDER:     { style: "medium", color: { rgb: "000000" } },
    ALT_ROW:     { fgColor: { rgb: "F8FAFC" } },
    WHITE:       { fgColor: { rgb: "FFFFFF" } },
    TOTAL_BG:    { fgColor: { rgb: "F1F5F9" } },
  };

  const colLetter = (n) => {
    let result = "";
    while (n > 0) {
      result = String.fromCharCode(65 + ((n - 1) % 26)) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result;
  };

  const setCell = (r, c, cellObj) => {
    ws[`${colLetter(c)}${r}`] = cellObj;
  };

  const merge = (r1, c1, r2, c2) => {
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push({ s: { r: r1 - 1, c: c1 - 1 }, e: { r: r2 - 1, c: c2 - 1 } });
  };

  const fillRow = (r, fill) => {
    for (let c = 1; c <= totalCols; c++) {
      setCell(r, c, { v: "", t: "s", s: { fill: { patternType: "solid", ...fill } } });
    }
  };

  let row = 1;

  // ── Row 1: Republic of the Philippines (matching PDF letterhead) ──
  fillRow(row, P.WHITE);
  setCell(row, 1, {
    v: "Republic of the Philippines",
    t: "s",
    s: {
      fill: { patternType: "solid", ...P.WHITE },
      font: { name: "Arial", sz: 9, color: P.SCHOOL_TEXT },
      alignment: { horizontal: "center", vertical: "center" },
    },
  });
  merge(row, 1, row, totalCols);
  row++;

  // ── Row 2: Region IV-B MIMAROPA (matching PDF letterhead) ──
  fillRow(row, P.WHITE);
  setCell(row, 1, {
    v: "Region IV-B  MIMAROPA",
    t: "s",
    s: {
      fill: { patternType: "solid", ...P.WHITE },
      font: { name: "Arial", sz: 9, color: P.SCHOOL_TEXT },
      alignment: { horizontal: "center", vertical: "center" },
    },
  });
  merge(row, 1, row, totalCols);
  row++;

  // ── Row 3: BACO COMMUNITY COLLEGE (matching PDF letterhead) ──
  fillRow(row, P.WHITE);
  setCell(row, 1, {
    v: "BACO COMMUNITY COLLEGE",
    t: "s",
    s: {
      fill: { patternType: "solid", ...P.WHITE },
      font: { name: "Arial", sz: 14, bold: true, color: { rgb: "800020" } },
      alignment: { horizontal: "center", vertical: "center" },
    },
  });
  merge(row, 1, row, totalCols);
  row++;

  // ── Row 4: Poblacion, Baco, Oriental Mindoro, 5201 ──
  fillRow(row, P.WHITE);
  setCell(row, 1, {
    v: "Poblacion, Baco, Oriental Mindoro, 5201",
    t: "s",
    s: {
      fill: { patternType: "solid", ...P.WHITE },
      font: { name: "Arial", sz: 8.5, color: P.SUB_TEXT },
      alignment: { horizontal: "center", vertical: "center" },
    },
  });
  merge(row, 1, row, totalCols);
  row++;

  // ── Row 5: Email: bccbaco@gmail.com ──
  fillRow(row, P.WHITE);
  setCell(row, 1, {
    v: "Email: bccbaco@gmail.com",
    t: "s",
    s: {
      fill: { patternType: "solid", ...P.WHITE },
      font: { name: "Arial", sz: 8.5, color: P.SUB_TEXT },
      alignment: { horizontal: "center", vertical: "center" },
    },
  });
  merge(row, 1, row, totalCols);
  row++;

  // ── Row 6: Divider Line (matching PDF line) ──
  for (let c = 1; c <= totalCols; c++) {
    setCell(row, c, {
      v: "",
      t: "s",
      s: {
        fill: { patternType: "solid", ...P.WHITE },
        border: { bottom: P.DIVIDER },
      },
    });
  }
  merge(row, 1, row, totalCols);
  row++;

  // ── Row 7: Blank spacer ──
  fillRow(row, P.WHITE);
  merge(row, 1, row, totalCols);
  row++;

  // ── Row 8: Sub-header Report Title (matching PDF) ──
  const subHeaderText = programLabel
    ? `LIST OF ENROLLED STUDENTS IN THE PROGRAM OF ${programLabel.toUpperCase()}`
    : title.toUpperCase();
  setCell(row, 1, {
    v: subHeaderText,
    t: "s",
    s: {
      font: { name: "Arial", sz: 11, bold: true, color: { rgb: "0F172A" } },
      alignment: { horizontal: "left", vertical: "center" },
    },
  });
  merge(row, 1, row, totalCols);
  row++;

  // ── Row 9: Metadata (matching PDF date & format) ──
  const generatedDateStr = new Date().toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  setCell(row, 1, {
    v: `Generated: ${generatedDateStr}   |   Total Records: ${data.length}   |   ${officeLabel}`,
    t: "s",
    s: {
      font: { name: "Arial", sz: 8.5, color: { rgb: "64748B" } },
      alignment: { horizontal: "left", vertical: "center" },
    },
  });
  merge(row, 1, row, totalCols);
  row++;

  // ── Row 10: Blank spacer before table ──
  fillRow(row, P.WHITE);
  merge(row, 1, row, totalCols);
  row++;

  // Row 12: Column Headers
  const headerRow = row;
  const colWidths = cols.map((h) => ({ wch: Math.max(getFieldLabel(h).length + 4, 12) }));

  cols.forEach((h, idx) => {
    const colIdx = idx + 1;
    setCell(headerRow, colIdx, {
      v: getFieldLabel(h),
      t: "s",
      s: {
        fill: { patternType: "solid", ...P.HEADER_BG },
        font: { name: "Arial", sz: 9, bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: P.BORDER,
          bottom: P.BORDER,
          left: P.BORDER,
          right: P.BORDER,
        },
      },
    });
  });
  row++;

  // Data rows
  data.forEach((item, rIdx) => {
    const isEven = rIdx % 2 === 0;
    const rowFill = isEven ? P.WHITE : P.ALT_ROW;
    const dataRow = row;

    cols.forEach((h, cIdx) => {
      const colIdx = cIdx + 1;
      const rawVal = item[h];
      const isNum =
        NUMERIC_FIELDS.has(h) &&
        rawVal !== null &&
        rawVal !== undefined &&
        rawVal !== "" &&
        !isNaN(rawVal);
      const isBool = typeof rawVal === "boolean";
      let val = rawVal ?? "";
      if (isBool) val = rawVal ? "Yes" : "No";

      let displayCell;
      if (isNum) {
        const num = Number(rawVal);
        displayCell = {
          v: num,
          t: "n",
          z: "#,##0.00",
          s: {
            fill: { patternType: "solid", ...rowFill },
            font: { name: "Arial", sz: 8.5 },
            alignment: { horizontal: "right", vertical: "center" },
            border: { top: P.BORDER, bottom: P.BORDER, left: P.BORDER, right: P.BORDER },
          },
        };
        colWidths[cIdx].wch = Math.max(colWidths[cIdx].wch, formatNumber(num).length + 4);
      } else {
        const strVal = String(val);
        displayCell = {
          v: strVal,
          t: "s",
          s: {
            fill: { patternType: "solid", ...rowFill },
            font: { name: "Arial", sz: 8.5 },
            alignment: { horizontal: "left", vertical: "center" },
            border: { top: P.BORDER, bottom: P.BORDER, left: P.BORDER, right: P.BORDER },
          },
        };
        colWidths[cIdx].wch = Math.max(colWidths[cIdx].wch, Math.min(strVal.length + 3, 40));
      }

      setCell(dataRow, colIdx, displayCell);
    });

    row++;
  });

  // Grand Totals row
  const hasNumericCol = cols.some((h) => NUMERIC_FIELDS.has(h));
  if (showTotals && hasNumericCol) {
    const totalsRow = row;
    cols.forEach((h, cIdx) => {
      const colIdx = cIdx + 1;
      if (NUMERIC_FIELDS.has(h)) {
        const sum = data.reduce((s, item) => s + (Number(item[h]) || 0), 0);
        setCell(totalsRow, colIdx, {
          v: sum,
          t: "n",
          z: "#,##0.00",
          s: {
            fill: { patternType: "solid", ...P.TOTAL_BG },
            font: { name: "Arial", sz: 9, bold: true },
            alignment: { horizontal: "right", vertical: "center" },
            border: {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "double", color: { rgb: "000000" } },
              left: P.BORDER,
              right: P.BORDER,
            },
          },
        });
      } else {
        setCell(totalsRow, colIdx, {
          v: cIdx === 0 ? "TOTAL" : "",
          t: "s",
          s: {
            fill: { patternType: "solid", ...P.TOTAL_BG },
            font: { name: "Arial", sz: 9, bold: true },
            alignment: { horizontal: cIdx === 0 ? "center" : "left", vertical: "center" },
            border: {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "double", color: { rgb: "000000" } },
              left: P.BORDER,
              right: P.BORDER,
            },
          },
        });
      }
    });
    row++;
  }

  ws["!cols"] = colWidths;
  ws["!ref"] = `A1:${colLetter(totalCols)}${row}`;

  XLSXStyle.utils.book_append_sheet(wb, ws, "Report");
  const wbout = XLSXStyle.write(wb, { bookType: "xlsx", type: "binary" });

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const dateStr = new Date().toISOString().split("T")[0];
  let outFile = customFilename || `BCC_${safeTitle}_${dateStr}.xlsx`;
  if (!outFile.toLowerCase().endsWith(".xlsx")) {
    outFile = outFile.replace(/\.[^/.]+$/, "") + ".xlsx";
  }
  saveAs(
    new Blob([s2ab(wbout)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    outFile
  );
};