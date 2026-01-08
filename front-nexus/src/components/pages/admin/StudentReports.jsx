import { useState, useEffect } from "react";
import { Users, UserCheck, GraduationCap, DollarSign, Download, Search, ChevronLeft, ChevronRight, Filter, FileText, BarChart3 } from "lucide-react";

const StudentReports = () => {
  const [activeTab, setActiveTab] = useState("student");
  const [studentReports, setStudentReports] = useState([]);
  const [enrollmentReports, setEnrollmentReports] = useState([]);
  const [attendanceReports, setAttendanceReports] = useState([]);
  const [payrollReports, setPayrollReports] = useState([]);
  const [statistics, setStatistics] = useState({
    students: {},
    enrollments: {},
    attendance: {},
    payroll: {},
  });
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [yearLevelFilter, setYearLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState("student");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tabs = [
    { id: "student", label: "Student Reports", icon: Users },
    { id: "enrollment", label: "Enrollment Reports", icon: GraduationCap },
    { id: "attendance", label: "Attendance Reports", icon: UserCheck },
    { id: "payroll", label: "HR & Payroll", icon: DollarSign },
  ];

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await fetchStatistics();
      if (activeTab === "student") {
        await fetchStudentReports();
      } else if (activeTab === "enrollment") {
        await fetchEnrollmentReports();
      } else if (activeTab === "attendance") {
        await fetchAttendanceReports();
      } else if (activeTab === "payroll") {
        await fetchPayrollReports();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/reports/statistics");
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };



  const fetchStudentReports = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (yearLevelFilter !== "all") params.append("year_level", yearLevelFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`http://localhost:5000/api/reports/students?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setStudentReports(data.data);
      }
    } catch (error) {
      console.error("Error fetching student reports:", error);
    }
  };

  const fetchEnrollmentReports = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`http://localhost:5000/api/reports/enrollments?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setEnrollmentReports(data.data);
      }
    } catch (error) {
      console.error("Error fetching enrollment reports:", error);
    }
  };

  const fetchAttendanceReports = async () => {
    try {
      const params = new URLSearchParams();
      params.append("type", attendanceTypeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`http://localhost:5000/api/reports/attendance?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setAttendanceReports(data.data);
      }
    } catch (error) {
      console.error("Error fetching attendance reports:", error);
    }
  };

  const fetchPayrollReports = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`http://localhost:5000/api/reports/payroll?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setPayrollReports(data.data);
      }
    } catch (error) {
      console.error("Error fetching payroll reports:", error);
    }
  };

  const handleExport = async (type) => {
    try {
      const params = new URLSearchParams();
      if (type === "attendance") {
        params.append("type", attendanceTypeFilter);
      }
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      if (yearLevelFilter !== "all") params.append("year_level", yearLevelFilter);

      const response = await fetch(`http://localhost:5000/api/reports/export/${type}?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const csv = convertToCSV(result.data);
        downloadCSV(csv, `${type}_report_${new Date().toISOString().split("T")[0]}.csv`);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    const csvRows = data.map((row) => {
      return headers.map((header) => {
        const value = row[header];
        return `"${value !== null && value !== undefined ? value : ""}"`;
      }).join(",");
    });
    return [csvHeaders, ...csvRows].join("\n");
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get filtered data
  const getFilteredData = () => {
    let data = [];
    if (activeTab === "student") data = studentReports;
    else if (activeTab === "enrollment") data = enrollmentReports;
    else if (activeTab === "attendance") data = attendanceReports;
    else if (activeTab === "payroll") data = payrollReports;
    return data;
  };

  const filteredData = getFilteredData();

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, yearLevelFilter, attendanceTypeFilter, activeTab]);

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={24} className="text-indigo-600" />
            Reports & Analytics
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Data Integrity: Online
          </span>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {statistics.students?.total_students || 0}
              </span>
            </div>
            <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Students</h3>
            <p className="text-xs text-green-600 dark:text-green-400">
              {statistics.students?.active_students || 0} active
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {statistics.enrollments?.total_enrollments || 0}
              </span>
            </div>
            <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Enrollments</h3>
            <p className="text-xs text-green-600 dark:text-green-400">
              {statistics.enrollments?.enrolled || 0} enrolled
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {statistics.attendance?.present || 0}
              </span>
            </div>
            <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">Present Today</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {statistics.attendance?.total_attendance_records || 0} records
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">Payroll (Monthly)</h3>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              ₱{(statistics.payroll?.total_net || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input - LEFT */}
          <div className="relative flex-grow max-w-xs">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white text-sm transition-all shadow-inner"
            />
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
          </div>

          {/* Filters - RIGHT */}
          <div className="flex items-center gap-2">
                {activeTab === "student" && (
                  <select
                    value={yearLevelFilter}
                    onChange={(e) => setYearLevelFilter(e.target.value)}
                    className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-40"
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
                    value={attendanceTypeFilter}
                    onChange={(e) => setAttendanceTypeFilter(e.target.value)}
                    className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-40"
                  >
                    <option value="student">Student Attendance</option>
                    <option value="staff">Staff Attendance</option>
                  </select>
                )}

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-40"
                >
                  <option value="all">All Status</option>
                  {activeTab === "student" && (
                    <>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Graduated">Graduated</option>
                    </>
                  )}
                  {activeTab === "enrollment" && (
                    <>
                      <option value="enrolled">Enrolled</option>
                      <option value="pending">Pending</option>
                      <option value="dropped">Dropped</option>
                    </>
                  )}
                  {activeTab === "attendance" && (
                    <>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </>
                  )}
                  {activeTab === "payroll" && (
                    <>
                      <option value="processed">Processed</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </>
                  )}
                </select>

                {activeTab === "student" && (
                  <button
                    onClick={() => handleExport("students")}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors shadow-sm border shadow-md shadow-indigo-500/30"
                  >
                    <Download size={14} />
                    Export Students
                  </button>
                )}
                {activeTab === "enrollment" && (
                  <button
                    onClick={() => handleExport("enrollments")}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors shadow-sm border shadow-md shadow-indigo-500/30"
                  >
                    <Download size={14} />
                    Export Enrollments
                  </button>
                )}
                {activeTab === "attendance" && (
                  <button
                    onClick={() => handleExport("attendance")}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors shadow-sm border shadow-md shadow-indigo-500/30"
                  >
                    <Download size={14} />
                    Export Attendance
                  </button>
                )}
                {activeTab === "payroll" && (
                  <button
                    onClick={() => handleExport("payroll")}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors shadow-sm border shadow-md shadow-indigo-500/30"
                  >
                    <Download size={14} />
                    Export Payroll
                  </button>
                )}
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="overflow-hidden rounded border border-slate-200 dark:border-slate-700">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-100 dark:bg-slate-700/70">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {activeTab === "student" && (
                    <>
                      <th className="px-4 py-2.5">Student No.</th>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Program</th>
                      <th className="px-4 py-2.5">Year Level</th>
                      <th className="px-4 py-2.5">GPA</th>
                      <th className="px-4 py-2.5">Status</th>
                    </>
                  )}
                  {activeTab === "enrollment" && (
                    <>
                      <th className="px-4 py-2.5">Enrollment ID</th>
                      <th className="px-4 py-2.5">Student</th>
                      <th className="px-4 py-2.5">Program</th>
                      <th className="px-4 py-2.5">Academic Year</th>
                      <th className="px-4 py-2.5">Units</th>
                      <th className="px-4 py-2.5">Status</th>
                    </>
                  )}
                  {activeTab === "attendance" && (
                    <>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">{attendanceTypeFilter === "student" ? "Student" : "Staff"}</th>
                      <th className="px-4 py-2.5">{attendanceTypeFilter === "student" ? "Course" : "Department"}</th>
                      <th className="px-4 py-2.5">Time In</th>
                      <th className="px-4 py-2.5">Status</th>
                    </>
                  )}
                  {activeTab === "payroll" && (
                    <>
                      <th className="px-4 py-2.5">Employee</th>
                      <th className="px-4 py-2.5">Department</th>
                      <th className="px-4 py-2.5">Period</th>
                      <th className="px-4 py-2.5">Gross</th>
                      <th className="px-4 py-2.5">Deductions</th>
                      <th className="px-4 py-2.5">Net Salary</th>
                      <th className="px-4 py-2.5">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr
                      key={index}
                      className="text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition duration-150"
                    >
                      {activeTab === "student" && (
                        <>
                          <td className="px-4 py-2">{item.student_number}</td>
                          <td className="px-4 py-2">
                            <div className="font-semibold">{item.student_name}</div>
                          </td>
                          <td className="px-4 py-2">{item.program_code}</td>
                          <td className="px-4 py-2">{item.year_level}</td>
                          <td className="px-4 py-2">
                            {item.gpa ? parseFloat(item.gpa).toFixed(2) : "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                              item.status === "Active" || item.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : item.status === "Inactive" || item.status === "inactive"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}
                      {activeTab === "enrollment" && (
                        <>
                          <td className="px-4 py-2">{item.enrollment_id}</td>
                          <td className="px-4 py-2 font-semibold">{item.student_name}</td>
                          <td className="px-4 py-2">{item.program_code}</td>
                          <td className="px-4 py-2">{item.academic_year} - {item.semester}</td>
                          <td className="px-4 py-2">{item.total_units || 0}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                              item.enrollment_status === "enrolled"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : item.enrollment_status === "pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {item.enrollment_status}
                            </span>
                          </td>
                        </>
                      )}
                      {activeTab === "attendance" && (
                        <>
                          <td className="px-4 py-2">
                            {new Date(item.attendance_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            {item.student_name || item.staff_name}
                          </td>
                          <td className="px-4 py-2">
                            {item.course_code || item.department}
                          </td>
                          <td className="px-4 py-2">{item.time_in}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                              item.status === "present"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : item.status === "late"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}
                      {activeTab === "payroll" && (
                        <>
                          <td className="px-4 py-2 font-semibold">{item.employee_name}</td>
                          <td className="px-4 py-2">{item.department}</td>
                          <td className="px-4 py-2">
                            {new Date(item.pay_period_start).toLocaleDateString()} - {new Date(item.pay_period_end).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            ₱{parseFloat(item.gross_salary).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            ₱{parseFloat(item.total_deductions).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            ₱{parseFloat(item.net_salary).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                              item.status === "paid"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : item.status === "processed"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700 dark:text-slate-200">
          <span className="text-xs sm:text-sm">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages || 1}</span> | Total Records:{" "}
            {filteredData.length}
          </span>
          <div className="flex gap-1 items-center mt-2 sm:mt-0">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReports;
