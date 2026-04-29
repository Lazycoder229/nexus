import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  GraduationCap,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  BookOpen,
  ClipboardCheck,
  Star,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadPDF } from "../../../utils/exportHelpers";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TABS = [
  { id: "students",    label: "Students",    icon: Users },
  { id: "enrollments", label: "Enrollments", icon: GraduationCap },
  { id: "grades",      label: "Grades",      icon: Star },
  { id: "attendance",  label: "Attendance",  icon: UserCheck },
  { id: "library",     label: "Library",     icon: BookOpen },
  { id: "clearances",  label: "Clearances",  icon: ClipboardCheck },
];

const COLUMNS = {
  students:    ["Student No.", "Name", "Program", "Year Level", "GPA", "Status"],
  enrollments: ["Enrollment ID", "Student", "Program", "Academic Year", "Units", "Status"],
  grades:      ["Student", "Course", "Period", "Raw Grade", "Final Grade", "Status"],
  attendance:  ["Date", "Name", "Course / Dept", "Time In", "Status"],
  library:     ["Transaction ID", "Borrower", "Book Title", "Borrow Date", "Due Date", "Return Date", "Status"],
  clearances:  ["Student", "Academic Year", "Semester", "Status", "Updated"],
};

const STATUS_OPTIONS = {
  students:    [["Active","Active"],["Inactive","Inactive"],["Graduated","Graduated"]],
  enrollments: [["enrolled","Enrolled"],["pending","Pending"],["dropped","Dropped"]],
  grades:      [["approved","Approved"],["pending","Pending"],["failed","Failed"]],
  attendance:  [["present","Present"],["absent","Absent"],["late","Late"]],
  library:     [["active","Active"],["returned","Returned"],["overdue","Overdue"]],
  clearances:  [["cleared","Cleared"],["pending","Pending"],["rejected","Rejected"]],
};

// Map tab → human-readable report title
const REPORT_TITLES = {
  students:    "Students Report",
  enrollments: "Enrollments Report",
  grades:      "Grades Report",
  attendance:  "Attendance Report",
  library:     "Library Transactions Report",
  clearances:  "Clearances Report",
};

const normalizeTrendCount = (row) => Number(row?.enrollment_count ?? row?.total_enrollment_count ?? 0);

const StudentReports = () => {
  const [activeTab,        setActiveTab]        = useState("students");
  const [data,             setData]             = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [statistics,       setStatistics]       = useState({ students: {}, enrollments: {}, attendance: {} });
  const [programs,         setPrograms]         = useState([]);
  const [selectedProgramId,setSelectedProgramId] = useState("all");
  const [trendData,        setTrendData]        = useState([]);
  const [trendForecast,    setTrendForecast]    = useState(null);
  const [trendLoading,     setTrendLoading]     = useState(false);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [statusFilter,     setStatusFilter]     = useState("all");
  const [yearLevelFilter,  setYearLevelFilter]  = useState("all");
  const [attendanceType,   setAttendanceType]   = useState("student");
  const [currentPage,      setCurrentPage]      = useState(1);
  const [pdfLoading,       setPdfLoading]       = useState(false);
  const itemsPerPage = 10;

  // Fetch statistics once on mount
  useEffect(() => {
    fetch(`${BASE}/api/reports/statistics`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setStatistics(j.data); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${BASE}/api/programs`)
      .then((r) => r.json())
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : rows?.data || [];
        setPrograms(Array.isArray(list) ? list : []);
      })
      .catch(console.error);
  }, []);

  // Fetch table data on tab / filter change
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (activeTab === "students" && yearLevelFilter !== "all") params.set("year_level", yearLevelFilter);
    if (activeTab === "enrollments" && selectedProgramId !== "all") params.set("program_id", selectedProgramId);
    if (activeTab === "attendance") params.set("type", attendanceType);

    const ENDPOINTS = {
      students:    `/api/reports/students`,
      enrollments: `/api/reports/enrollments`,
      grades:      `/api/grades`,
      attendance:  `/api/reports/attendance`,
      library:     `/api/library/transactions`,
      clearances:  `/api/clearances`,
    };

    setLoading(true);
    setCurrentPage(1);

    fetch(`${BASE}${ENDPOINTS[activeTab]}?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((j) => {
        const rows = j.data ?? j.grades ?? j.transactions ?? j.clearances ?? (Array.isArray(j) ? j : []);
        setData(Array.isArray(rows) ? rows : []);
      })
      .catch((e) => { if (e.name !== "AbortError") { console.error(e); setData([]); } })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [activeTab, statusFilter, yearLevelFilter, attendanceType, selectedProgramId]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (selectedProgramId !== "all") params.set("program_id", selectedProgramId);

    setTrendLoading(true);
    fetch(`${BASE}/api/reports/enrollment-trends?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error(j.message || "Failed to load enrollment trends");
        setTrendData(Array.isArray(j.data?.series) ? j.data.series : []);
        setTrendForecast(j.data?.forecast || null);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          console.error(e);
          setTrendData([]);
          setTrendForecast(null);
        }
      })
      .finally(() => setTrendLoading(false));

    return () => controller.abort();
  }, [selectedProgramId]);

  // Reset page & filters when tab changes
  useEffect(() => {
    setStatusFilter("all");
    setYearLevelFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // Client-side search filter
  const filtered = data.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageData   = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const selectedProgram = programs.find((program) => String(program.id) === String(selectedProgramId));

  const trendChartData = trendData.map((row, index) => ({
    label: row.period_label || `Period ${index + 1}`,
    actual_enrollment: normalizeTrendCount(row),
    forecast_enrollment: null,
  }));

  if (trendForecast?.predicted_next_enrollment !== undefined && trendForecast?.predicted_next_enrollment !== null) {
    trendChartData.push({
      label: trendForecast.target_period_label || "Next period",
      actual_enrollment: null,
      forecast_enrollment: Number(trendForecast.predicted_next_enrollment || 0),
    });
  }

  // Windowed pagination (max 7 visible page buttons)
  const pageWindow = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = new Set([1, totalPages, currentPage]);
    for (let d = -2; d <= 2; d++) {
      const p = currentPage + d;
      if (p >= 1 && p <= totalPages) pages.add(p);
    }
    return [...pages].sort((a, b) => a - b);
  };

  // Build the "program of" label from the filtered data (for students/enrollments)
  const getProgramLabel = () => {
    if (activeTab === "students" || activeTab === "enrollments") {
      const programs = [...new Set(filtered.map((r) => r.program_name || r.program_code).filter(Boolean))];
      if (programs.length === 1) return programs[0];
      if (programs.length > 1)   return programs.join(", ");
    }
    return "";
  };

  // PDF Export
  const exportPDF = async () => {
    if (!filtered.length || pdfLoading) return;
    setPdfLoading(true);
    try {
      const tabLabel    = TABS.find((t) => t.id === activeTab)?.label || activeTab;
      const reportTitle = REPORT_TITLES[activeTab] || `${tabLabel} Report`;
      const program     = getProgramLabel();

      if (activeTab === "students") {
        const studentPdfData = filtered.map((row) => ({
          student_number: row.student_number || row.student_id || "",
          full_name: row.student_name || `${row.first_name || ""} ${row.last_name || ""}`.trim(),
          program_applied: row.program_name || row.program_code || "",
        }));

        downloadPDF(jsPDF, autoTable, studentPdfData, {
          title: reportTitle,
          programLabel: program,
          orientation: "portrait",
          headers: ["student_number", "full_name", "program_applied"],
          includeTimestamps: false,
        });
        return;
      }

      downloadPDF(jsPDF, autoTable, filtered, {
        title:        reportTitle,
        programLabel: program,
        orientation:  "portrait",
        headers:      Object.keys(filtered[0]),
        includeTimestamps: false,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // Status badge helper
  const badge = (status) => {
    const s = String(status || "").toLowerCase();
    const color = ["active","present","enrolled","paid","approved","cleared","completed","returned"].includes(s)
      ? "bg-green-100 text-green-800"
      : ["pending","late","processing"].includes(s)
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>
        {status || "—"}
      </span>
    );
  };

  // Row renderer
  const renderRow = (item, i) => {
    let cells;
    switch (activeTab) {
      case "students":
        cells = (
          <>
            <td className="px-4 py-2">{item.student_number}</td>
            <td className="px-4 py-2 font-semibold text-slate-900">{item.student_name}</td>
            <td className="px-4 py-2">{item.program_code}</td>
            <td className="px-4 py-2">{item.year_level}</td>
            <td className="px-4 py-2">{item.gpa ? parseFloat(item.gpa).toFixed(2) : "N/A"}</td>
            <td className="px-4 py-2">{badge(item.status)}</td>
          </>
        );
        break;
      case "enrollments":
        cells = (
          <>
            <td className="px-4 py-2">{item.enrollment_id}</td>
            <td className="px-4 py-2 font-semibold text-slate-900">{item.student_name}</td>
            <td className="px-4 py-2">{item.program_code}</td>
            <td className="px-4 py-2">{item.academic_year} – {item.semester}</td>
            <td className="px-4 py-2">{item.total_units || 0}</td>
            <td className="px-4 py-2">{badge(item.enrollment_status)}</td>
          </>
        );
        break;
      case "grades":
        cells = (
          <>
            <td className="px-4 py-2 font-semibold text-slate-900">{item.student_name || item.student_user_id}</td>
            <td className="px-4 py-2">{item.course_code || item.course_id}</td>
            <td className="px-4 py-2">{item.period_name || item.period_id}</td>
            <td className="px-4 py-2">{item.raw_grade ?? "—"}</td>
            <td className="px-4 py-2">{item.final_grade ?? "—"}</td>
            <td className="px-4 py-2">{badge(item.status)}</td>
          </>
        );
        break;
      case "attendance":
        cells = (
          <>
            <td className="px-4 py-2">{item.attendance_date ? new Date(item.attendance_date).toLocaleDateString() : "—"}</td>
            <td className="px-4 py-2 font-semibold text-slate-900">{item.student_name || item.staff_name}</td>
            <td className="px-4 py-2">{item.course_code || item.department}</td>
            <td className="px-4 py-2">{item.time_in || "—"}</td>
            <td className="px-4 py-2">{badge(item.status)}</td>
          </>
        );
        break;
      case "library":
        cells = (
          <>
            <td className="px-4 py-2">{item.transaction_id}</td>
            <td className="px-4 py-2 font-semibold text-slate-900">{item.borrower_name || item.student_name}</td>
            <td className="px-4 py-2">{item.book_title}</td>
            <td className="px-4 py-2">{item.borrow_date  ? new Date(item.borrow_date).toLocaleDateString()  : "—"}</td>
            <td className="px-4 py-2">{item.due_date     ? new Date(item.due_date).toLocaleDateString()     : "—"}</td>
            <td className="px-4 py-2">{item.return_date  ? new Date(item.return_date).toLocaleDateString()  : "—"}</td>
            <td className="px-4 py-2">{badge(item.status)}</td>
          </>
        );
        break;
      case "clearances":
        cells = (
          <>
            <td className="px-4 py-2 font-semibold text-slate-900">{item.student_name}</td>
            <td className="px-4 py-2">{item.academic_year}</td>
            <td className="px-4 py-2">{item.semester}</td>
            <td className="px-4 py-2">{badge(item.status)}</td>
            <td className="px-4 py-2">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "—"}</td>
          </>
        );
        break;
      default:
        cells = null;
    }
    return (
      <tr key={i} className="text-sm text-slate-700 hover:bg-indigo-50/50 transition duration-150">
        {cells}
      </tr>
    );
  };

  const pages = pageWindow();

  return (
    <div className="p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={24} className="text-indigo-600" />
            Reports &amp; Analytics
          </h2>
          <span className="text-sm text-slate-500 font-medium">Data Integrity: Online</span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <Users size={20} className="text-indigo-600" />
              <span className="text-2xl font-bold text-indigo-600">{statistics.students?.total_students || 0}</span>
            </div>
            <p className="text-sm font-medium text-slate-600">Total Students</p>
            <p className="text-xs text-green-600 mt-0.5">{statistics.students?.active_students || 0} active</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <GraduationCap size={20} className="text-green-600" />
              <span className="text-2xl font-bold text-green-600">{statistics.enrollments?.total_enrollments || 0}</span>
            </div>
            <p className="text-sm font-medium text-slate-600">Total Enrollments</p>
            <p className="text-xs text-green-600 mt-0.5">{statistics.enrollments?.enrolled || 0} enrolled</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <UserCheck size={20} className="text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{statistics.attendance?.present || 0}</span>
            </div>
            <p className="text-sm font-medium text-slate-600">Present Today</p>
            <p className="text-xs text-slate-500 mt-0.5">{statistics.attendance?.total_attendance_records || 0} records</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <ClipboardCheck size={20} className="text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{statistics.attendance?.total_attendance_records || 0}</span>
            </div>
            <p className="text-sm font-medium text-slate-600">Total Attendance</p>
            <p className="text-xs text-slate-500 mt-0.5">All-time records</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0.5 border-b border-slate-200 overflow-x-auto">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <TabIcon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-grow max-w-xs">
            <input
              type="text"
              placeholder={`Search ${TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-inner"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === "enrollments" && (
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">All Programs</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.code ? `${program.code} - ` : ""}{program.name}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "students" && (
              <select
                value={yearLevelFilter}
                onChange={(e) => setYearLevelFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">All Year Levels</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            )}

            {activeTab === "attendance" && (
              <select
                value={attendanceType}
                onChange={(e) => setAttendanceType(e.target.value)}
                className="px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="student">Student Attendance</option>
                <option value="staff">Staff Attendance</option>
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">All Status</option>
              {(STATUS_OPTIONS[activeTab] || []).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>

            <div className="relative group">
              <button
                onClick={exportPDF}
                disabled={pdfLoading || filtered.length === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                <Download size={14} />
                {pdfLoading ? "Generating…" : "Export PDF"}
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded shadow whitespace-nowrap z-10">
                Download professional PDF report
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Enrollment Trends & Forecast</h3>
              <p className="text-sm text-slate-500">
                {selectedProgram ? `${selectedProgram.code ? `${selectedProgram.code} - ` : ""}${selectedProgram.name}` : "All programs"}
              </p>
            </div>
            <div className="text-sm text-slate-600">
              Next predicted enrollment: <span className="font-semibold text-indigo-600">{trendForecast?.predicted_next_enrollment ?? 0}</span>
              {typeof trendForecast?.confidence === "number" ? (
                <span className="ml-2 text-xs text-slate-500">Confidence {Math.round(trendForecast.confidence * 100)}%</span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 h-72">
            {trendLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400 italic">
                Loading enrollment trend...
              </div>
            ) : trendChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400 italic">
                No trend data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    formatter={(value, name) => [value, name === "actual_enrollment" ? "Actual" : "Forecast"]}
                    labelStyle={{ color: "#0f172a" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual_enrollment"
                    name="Actual Enrollment"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast_enrollment"
                    name="Forecast"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    dot={{ r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                {(COLUMNS[activeTab] || []).map((col) => (
                  <th key={col} className="px-4 py-2.5">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-slate-400 italic">
                    Loading records…
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-slate-500 italic">
                    No records found.
                  </td>
                </tr>
              ) : (
                pageData.map((item, i) => renderRow(item, i))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700">
          <span className="text-xs sm:text-sm">
            Showing{" "}
            <span className="font-semibold">
              {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>
            –
            <span className="font-semibold">
              {Math.min(currentPage * itemsPerPage, filtered.length)}
            </span>{" "}
            of <span className="font-semibold">{filtered.length}</span> records
          </span>
          <div className="flex gap-1 mt-2 sm:mt-0 flex-wrap justify-end">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            {pages.map((page, idx) => (
              <React.Fragment key={page}>
                {pages[idx - 1] !== undefined && page - pages[idx - 1] > 1 && (
                  <span className="px-2 py-1.5 text-xs text-slate-400 select-none">…</span>
                )}
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                    currentPage === page
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentReports;