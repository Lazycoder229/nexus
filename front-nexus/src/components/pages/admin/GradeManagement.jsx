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
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
      >
        {remarks || "N/A"}
      </span>
    );
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-700">
        Page <span className="font-medium">{currentPage}</span> of{" "}
        <span className="font-medium">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Grade Management
          </h1>
          <p className="text-gray-600">
            Manage student grades and academic performance
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Grades
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalGrades}
                </p>
              </div>
              <BookOpen className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {approvedGrades}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Passed Students
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {passedStudents}
                </p>
              </div>
              <Award className="text-purple-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Grade
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {averageGrade}
                </p>
              </div>
              <TrendingUp className="text-orange-500" size={40} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Controls Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by student name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="w-full lg:w-48">
                <Select
                  options={courseOptions}
                  value={filterCourse}
                  onChange={setFilterCourse}
                  placeholder="Filter by Course"
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="w-full lg:w-48">
                <Select
                  options={periodOptions}
                  value={filterPeriod}
                  onChange={setFilterPeriod}
                  placeholder="Filter by Period"
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="w-full lg:w-40">
                <Select
                  options={statusOptions}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  placeholder="Status"
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <Plus size={20} />
                Add Grade
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Prelim
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Midterm
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Finals
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Final Grade
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((grade) => (
                    <tr
                      key={grade.grade_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {grade.student_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.first_name} {grade.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {grade.course_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.course_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {grade.period_name} {grade.year}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="font-semibold"
                          style={{ color: getGradeColor(grade.prelim_grade) }}
                        >
                          {grade.prelim_grade || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="font-semibold"
                          style={{ color: getGradeColor(grade.midterm_grade) }}
                        >
                          {grade.midterm_grade || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="font-semibold"
                          style={{ color: getGradeColor(grade.finals_grade) }}
                        >
                          {grade.finals_grade || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="text-lg font-bold"
                          style={{ color: getGradeColor(grade.final_grade) }}
                        >
                          {grade.final_grade || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <RemarksBadge remarks={grade.remarks} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={grade.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {grade.status !== "approved" && (
                            <>
                              <button
                                onClick={() => handleEdit(grade)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleApprove(grade.grade_id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(grade.grade_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen size={48} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          No grades found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h2>{editMode ? "Edit Grade" : "Add New Grade"}</h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>
                    Student <span className="required">*</span>
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
                  />
                </div>

                <div className="form-group">
                  <label>
                    Course <span className="required">*</span>
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
                  />
                </div>

                <div className="form-group">
                  <label>
                    Academic Period <span className="required">*</span>
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
                  />
                </div>

                <div className="form-group">
                  <label>Prelim Grade</label>
                  <input
                    type="number"
                    name="prelim_grade"
                    value={formData.prelim_grade}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Midterm Grade</label>
                  <input
                    type="number"
                    name="midterm_grade"
                    value={formData.midterm_grade}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Finals Grade</label>
                  <input
                    type="number"
                    name="finals_grade"
                    value={formData.finals_grade}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Final Grade (Auto-calculated)</label>
                  <input
                    type="text"
                    name="final_grade"
                    value={formData.final_grade}
                    readOnly
                    style={{
                      background: "#f0f0f0",
                      fontWeight: "bold",
                      color: getGradeColor(formData.final_grade),
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Remarks (Auto-generated)</label>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    readOnly
                    style={{ background: "#f0f0f0" }}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <Select
                    options={statusOptions}
                    value={statusOptions.find(
                      (o) => o.value === formData.status
                    )}
                    onChange={(option) => handleSelectChange(option, "status")}
                    placeholder="Select Status"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editMode ? "Update Grade" : "Create Grade"}
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
