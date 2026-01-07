import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const GradeManagement = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    student_user_id: "",
    course_id: "",
    period_id: "",
    prelim_grade: "",
    midterm_grade: "",
    finals_grade: "",
    final_grade: "",
    remarks: "",
    status: "draft",
  });

  useEffect(() => {
    fetchGrades();
    fetchStudents();
    fetchCourses();
    fetchPeriods();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/grades");
      setGrades(response.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      const studentsList = response.data.filter(
        (user) => user.role === "Student"
      );
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/course/courses"
      );
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchPeriods = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/academic-periods"
      );
      setPeriods(response.data);
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  const calculateFinalGrade = (prelim, midterm, finals) => {
    const p = parseFloat(prelim) || 0;
    const m = parseFloat(midterm) || 0;
    const f = parseFloat(finals) || 0;

    if (p === 0 && m === 0 && f === 0) return "";

    // Calculate weighted average (30% prelim, 30% midterm, 40% finals)
    const finalGrade = p * 0.3 + m * 0.3 + f * 0.4;
    return finalGrade.toFixed(2);
  };

  const getRemarks = (grade) => {
    const g = parseFloat(grade);
    if (!g) return "";
    if (g >= 75) return "PASSED";
    return "FAILED";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    // Auto-calculate final grade when component grades change
    if (["prelim_grade", "midterm_grade", "finals_grade"].includes(name)) {
      const finalGrade = calculateFinalGrade(
        name === "prelim_grade" ? value : updatedData.prelim_grade,
        name === "midterm_grade" ? value : updatedData.midterm_grade,
        name === "finals_grade" ? value : updatedData.finals_grade
      );
      updatedData.final_grade = finalGrade;
      updatedData.remarks = getRemarks(finalGrade);
    }

    setFormData(updatedData);
  };

  const handleSelectChange = (selectedOption, field) => {
    setFormData({ ...formData, [field]: selectedOption?.value || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/grades/${currentGrade.grade_id}`,
          formData
        );
      } else {
        await axios.post("http://localhost:5000/api/grades", formData);
      }
      fetchGrades();
      closeModal();
    } catch (error) {
      console.error("Error saving grade:", error);
      alert(error.response?.data?.error || "Error saving grade");
    }
  };

  const handleEdit = (grade) => {
    setCurrentGrade(grade);
    setFormData({
      student_user_id: grade.student_user_id,
      course_id: grade.course_id,
      period_id: grade.period_id,
      prelim_grade: grade.prelim_grade || "",
      midterm_grade: grade.midterm_grade || "",
      finals_grade: grade.finals_grade || "",
      final_grade: grade.final_grade || "",
      remarks: grade.remarks || "",
      status: grade.status,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await axios.delete(`http://localhost:5000/api/grades/${id}`);
        fetchGrades();
      } catch (error) {
        console.error("Error deleting grade:", error);
        alert(error.response?.data?.error || "Error deleting grade");
      }
    }
  };

  const handleApprove = async (gradeId) => {
    if (window.confirm("Are you sure you want to approve this grade?")) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        await axios.post(
          `http://localhost:5000/api/grades/${gradeId}/approve`,
          {
            approved_by: user.user_id,
          }
        );
        fetchGrades();
      } catch (error) {
        console.error("Error approving grade:", error);
        alert(error.response?.data?.error || "Error approving grade");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentGrade(null);
    setFormData({
      student_user_id: "",
      course_id: "",
      period_id: "",
      prelim_grade: "",
      midterm_grade: "",
      finals_grade: "",
      final_grade: "",
      remarks: "",
      status: "draft",
    });
  };

  // Filter grades
  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.course_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      !filterCourse || grade.course_id === filterCourse.value;
    const matchesPeriod =
      !filterPeriod || grade.period_id === filterPeriod.value;
    const matchesStatus = !filterStatus || grade.status === filterStatus.value;

    return matchesSearch && matchesCourse && matchesPeriod && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGrades.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage);

  const studentOptions = students.map((student) => ({
    value: student.user_id,
    label: `${student.student_id} - ${student.first_name} ${student.last_name}`,
  }));

  const courseOptions = courses.map((course) => ({
    value: course.course_id,
    label: `${course.course_code} - ${course.course_title}`,
  }));

  const periodOptions = periods.map((period) => ({
    value: period.period_id,
    label: `${period.period_name} ${period.year}`,
  }));

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "approved", label: "Approved" },
  ];

  const getGradeColor = (grade) => {
    const g = parseFloat(grade);
    if (!g) return "#95a5a6";
    if (g >= 90) return "#27ae60";
    if (g >= 80) return "#2ecc71";
    if (g >= 75) return "#3498db";
    return "#e74c3c";
  };

  // Helper Components
  const StatusBadge = ({ status }) => {
    const colorMap = {
      draft: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
      submitted: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
      approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          colorMap[status] || colorMap.draft
        }`}
      >
        {status}
      </span>
    );
  };

  const RemarksBadge = ({ remarks }) => {
    const colorClass =
      remarks === "PASSED"
        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {remarks || "N/A"}
      </span>
    );
  };

  const Pagination = ({ currentPage, totalPages, setPage, totalItems }) => (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700 dark:text-slate-200">
      <span className="text-xs sm:text-sm">
        Page <span className="font-semibold">{currentPage}</span> of{" "}
        <span className="font-semibold">{totalPages}</span> | Total Records:{" "}
        {totalItems}
      </span>
      <div className="flex gap-1 items-center mt-2 sm:mt-0">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          {currentPage}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  // Calculate statistics
  const totalGrades = grades.length;
  const approvedGrades = grades.filter((g) => g.status === "approved").length;
  const passedStudents = grades.filter((g) => g.remarks === "PASSED").length;
  const averageGrade =
    grades.length > 0
      ? (
          grades.reduce((sum, g) => sum + (parseFloat(g.final_grade) || 0), 0) /
          grades.filter((g) => g.final_grade).length
        ).toFixed(2)
      : 0;

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award size={24} className="text-indigo-600" />
            Grade Management
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Academic Performance Tracking
          </span>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Grades</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalGrades}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedGrades}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Passed Students</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{passedStudents}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Average Grade</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{averageGrade}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input - LEFT */}
            <div className="relative flex-grow max-w-xs">
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white text-sm transition-all shadow-inner"
              />
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
            </div>

            {/* Filters and Action Buttons - RIGHT */}
            <div className="flex items-center gap-2">
              <div className="w-40">
                <Select
                  options={courseOptions}
                  value={filterCourse}
                  onChange={setFilterCourse}
                  placeholder="Course"
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="w-40">
                <Select
                  options={periodOptions}
                  value={filterPeriod}
                  onChange={setFilterPeriod}
                  placeholder="Period"
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="w-32">
                <Select
                  options={statusOptions}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  placeholder="Status"
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium border border-indigo-700 dark:border-indigo-600 shadow-md shadow-indigo-500/30 whitespace-nowrap"
              >
                <Plus size={14} />
                Add Grade
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-100 dark:bg-slate-700/70">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="px-4 py-2.5">
                    Student
                  </th>
                  <th className="px-4 py-2.5">
                    Course
                  </th>
                  <th className="px-4 py-2.5">
                    Period
                  </th>
                  <th className="px-4 py-2.5 text-center">
                    Prelim
                  </th>
                  <th className="px-4 py-2.5 text-center">
                    Midterm
                  </th>
                  <th className="px-4 py-2.5 text-center">
                    Finals
                  </th>
                  <th className="px-4 py-2.5 text-center">
                    Final Grade
                  </th>
                  <th className="px-4 py-2.5 text-center">
                    Remarks
                  </th>
                  <th className="px-4 py-2.5 text-center">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {currentItems.length > 0 ? (
                  currentItems.map((grade) => (
                    <tr
                      key={grade.grade_id}
                      className="text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition duration-150"
                    >
                      <td className="px-4 py-2">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {grade.student_id}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {grade.first_name} {grade.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {grade.course_code}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {grade.course_title}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {grade.period_name} {grade.year}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className="font-semibold"
                          style={{ color: getGradeColor(grade.prelim_grade) }}
                        >
                          {grade.prelim_grade || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className="font-semibold"
                          style={{ color: getGradeColor(grade.midterm_grade) }}
                        >
                          {grade.midterm_grade || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className="font-semibold"
                          style={{ color: getGradeColor(grade.finals_grade) }}
                        >
                          {grade.finals_grade || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className="text-base font-bold"
                          style={{ color: getGradeColor(grade.final_grade) }}
                        >
                          {grade.final_grade || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <RemarksBadge remarks={grade.remarks} />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <StatusBadge status={grade.status} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {grade.status !== "approved" && (
                            <>
                              <button
                                onClick={() => handleEdit(grade)}
                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleApprove(grade.grade_id)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                title="Approve"
                              >
                                <CheckCircle size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(grade.grade_id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-4 text-center text-slate-500 dark:text-slate-400 italic">
                      No grades found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setPage={setCurrentPage}
            totalItems={filteredGrades.length}
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-2 z-50 transition-opacity duration-300" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl transform transition-transform duration-300 scale-100 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-t-lg z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editMode ? "Edit" : "Add"} Grade
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Student *
                  </label>
                  <Select
                    options={studentOptions}
                    value={studentOptions.find(
                      (o) => o.value === formData.student_user_id
                    )}
                    onChange={(option) =>
                      handleSelectChange(option, "student_user_id")
                    }
                    placeholder="Select Student"
                    required
                    isDisabled={editMode}
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Course *
                  </label>
                  <Select
                    options={courseOptions}
                    value={courseOptions.find(
                      (o) => o.value === formData.course_id
                    )}
                    onChange={(option) =>
                      handleSelectChange(option, "course_id")
                    }
                    placeholder="Select Course"
                    required
                    isDisabled={editMode}
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Academic Period *
                  </label>
                  <Select
                    options={periodOptions}
                    value={periodOptions.find(
                      (o) => o.value === formData.period_id
                    )}
                    onChange={(option) =>
                      handleSelectChange(option, "period_id")
                    }
                    placeholder="Select Period"
                    required
                    isDisabled={editMode}
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prelim Grade</label>
                  <input
                    type="number"
                    name="prelim_grade"
                    value={formData.prelim_grade}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Midterm Grade</label>
                  <input
                    type="number"
                    name="midterm_grade"
                    value={formData.midterm_grade}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Finals Grade</label>
                  <input
                    type="number"
                    name="finals_grade"
                    value={formData.finals_grade}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Final Grade (Auto-calculated)</label>
                  <input
                    type="text"
                    name="final_grade"
                    value={formData.final_grade}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-700/50 font-bold transition-colors"
                    style={{ color: getGradeColor(formData.final_grade) }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks (Auto-generated)</label>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-700/50 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <Select
                    options={statusOptions}
                    value={statusOptions.find(
                      (o) => o.value === formData.status
                    )}
                    onChange={(option) => handleSelectChange(option, "status")}
                    placeholder="Select Status"
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/30"
                >
                  {editMode ? "Update" : "Create"} Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeManagement;
