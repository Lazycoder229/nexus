/**
 * Export helper functions (CSV + PDF)
 */

// Field label mappings for readable headers
const FIELD_LABELS = {
  student_id: "Student ID",
  student_number: "Student Number",
  full_name: "Full Name",
  program_applied: "Program Applied",
  student_name: "Student Name",
  student_nu: "Student Number",
  student_na: "Student Name",
  email: "Email",
  phone_number: "Phone Number",
  phone_num: "Phone Number",
  gender: "Gender",
  birth_date: "Birth Date",
  year_level: "Year Level",
  status: "Status",
  program_name: "Program",
  program_n: "Program",
  program_code: "Program Code",
  program_c: "Program Code",
  enrollment: "Enrollment Status",
  academic_year: "Academic Year",
  academic_y: "Academic Year",
  semester: "Semester",
  total_grade: "Total Grade",
  total_gpa: "GPA",
  gpa: "GPA",
  department: "Department",
  employee_id: "Employee ID",
  employee_name: "Employee Name",
  position: "Position",
  salary: "Salary",
  date_hired: "Date Hired",
  course_code: "Course Code",
  course_name: "Course Name",
  instructor: "Instructor",
  section: "Section",
  attendance_rate: "Attendance Rate",
  prelim_grade: "Prelim Grade",
  midterm_grade: "Midterm Grade",
  finals_grade: "Finals Grade",
  final_grade: "Final Grade",
  remarks: "Remarks",
  created_at: "Created Date",
  updated_at: "Updated Date",
};

/** Get readable header for a field */
const getFieldLabel = (field) =>
  FIELD_LABELS[field] || field.replace(/_/g, " ").toUpperCase();

/**
 * Generate CSV content from array data.
 */
export const generateCSV = (data, options = {}) => {
  if (!Array.isArray(data) || data.length === 0) return "";

  const {
    headers = Object.keys(data[0]),
    includeTimestamps = false,
  } = options;

  const cols = includeTimestamps
    ? headers
    : headers.filter(
        (h) => !["created_at", "updated_at", "deleted_at"].includes(h),
      );

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    const escaped = stringValue.replace(/"/g, '""');
    if (/[",\n\r]/.test(escaped)) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  const headerLine = cols.map((h) => escapeCsvValue(getFieldLabel(h))).join(",");
  const rowLines = data.map((row) =>
    cols.map((h) => escapeCsvValue(row[h])).join(","),
  );

  return [headerLine, ...rowLines].join("\n");
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
 * Download a professional PDF report with school letterhead.
 *
 * @param {Function} jsPDFLib   – jsPDF constructor
 * @param {Function} autoTableLib – jspdf-autotable function
 * @param {Array}    data        – array of row objects
 * @param {Object}   options
 *   @param {string}   options.title         – report sub-title, e.g. "Students Report"
 *   @param {string}   options.programLabel  – shown in "List of Enrolled Students in the Program of …"
 *                                             leave blank to omit that line
 *   @param {string}   options.orientation   – "landscape" | "portrait" (default "landscape")
 *   @param {string[]} options.headers       – field keys to include (default: all keys)
 *   @param {boolean}  options.includeTimestamps – include created_at / updated_at (default false)
 *   @param {string}   options.logoBase64    – optional base64 PNG/JPEG for the school logo
 *   @param {string}   options.filename      – override auto-generated filename
 */
export const downloadPDF = (jsPDFLib, autoTableLib, data, options = {}) => {
  if (!data || data.length === 0) return;

  const {
    title = "Report",
    programLabel = "",
    orientation = "landscape",
    headers = Object.keys(data[0]),
    includeTimestamps = false,
    logoBase64 = null,
    filename: customFilename = null,
  } = options;

  // Filter timestamp columns unless requested
  const cols = includeTimestamps
    ? headers
    : headers.filter(
        (h) => !["created_at", "updated_at", "deleted_at"].includes(h),
      );

  const doc = new jsPDFLib({ orientation, unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;

  // ── Colours ──────────────────────────────────────────────────────────────
  const NAVY   = [30, 58, 138];   // header bar background
  const WHITE  = [255, 255, 255];
  const GRAY   = [100, 116, 139];
  const LIGHT  = [241, 245, 249];

  // ── Header band ──────────────────────────────────────────────────────────
  const headerH = 28;
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, headerH, "F");

  // Logo (if supplied)
  const logoSize = 20;
  const logoX = pageW - margin - logoSize;
  const logoY = (headerH - logoSize) / 2;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", logoX, logoY, logoSize, logoSize);
    } catch {
      // silently skip bad image
    }
  } else {
    // Placeholder circle for logo area
    doc.setDrawColor(...WHITE);
    doc.setLineWidth(0.5);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, "S");
    doc.setTextColor(...WHITE);
    doc.setFontSize(6);
    doc.text("LOGO", logoX + logoSize / 2, logoY + logoSize / 2 + 2, {
      align: "center",
    });
  }

  // School name (left of logo)
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Baco Community College", margin, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Baco, Oriental Mindoro | bcc.edu.ph", margin, 17);

  // ── Sub-header strip ─────────────────────────────────────────────────────
  const subH = programLabel ? 16 : 10;
  doc.setFillColor(...LIGHT);
  doc.rect(0, headerH, pageW, subH, "F");

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  if (programLabel) {
    doc.text(`List of Enrolled Students in the Program of ${programLabel}`, margin, headerH + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(
      `Generated: ${new Date().toLocaleString("en-PH")}   |   Total Records: ${data.length}`,
      margin,
      headerH + 12,
    );
  } else {
    doc.text(title, margin, headerH + 6.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(
      `Generated: ${new Date().toLocaleString("en-PH")}   |   Total Records: ${data.length}`,
      pageW - margin,
      headerH + 6.5,
      { align: "right" },
    );
  }

  // ── Table ─────────────────────────────────────────────────────────────────
  const tableStartY = headerH + subH + 3;

  autoTableLib(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [cols.map((h) => getFieldLabel(h))],
    body: data.map((row) =>
      cols.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "boolean") return val ? "Yes" : "No";
        return String(val);
      }),
    ),
    styles: {
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      overflow: "linebreak",
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: "bold",
      halign: "left",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    tableLineColor: [203, 213, 225],
    tableLineWidth: 0.2,
    // Footer with page numbers
    didDrawPage: (hookData) => {
      const pg = hookData.pageNumber;
      const total = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(
        `Page ${pg} of ${total}`,
        pageW / 2,
        pageH - 6,
        { align: "center" },
      );
      doc.text("Baco Community College – Confidential", margin, pageH - 6);
    },
  });

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const dateStr = new Date().toISOString().split("T")[0];
  const outFile = customFilename || `BCC_${safeTitle}_${dateStr}.pdf`;
  doc.save(outFile);
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
  if (!amount) return "₱0.00";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};