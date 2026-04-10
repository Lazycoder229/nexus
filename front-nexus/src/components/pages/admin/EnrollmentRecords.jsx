import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  ClipboardList,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const colors = {
    Enrolled: "bg-green-100 text-green-800",
    Dropped: "bg-red-100 text-red-800",
    Completed: "bg-blue-100 text-blue-800",
    Failed: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        colors[status] || colors.Enrolled
      }`}
    >
      {status}
    </span>
  );
};

const Pagination = ({ currentPage, totalPages, setPage, totalItems }) => (
  <div className="flex justify-between items-center mt-4 text-sm text-slate-700">
    <span>
      Page {currentPage} of {totalPages} | Total: {totalItems}
    </span>
    <div className="flex gap-1">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="p-1.5 rounded-md border disabled:opacity-50 hover:bg-slate-100"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-2 py-1">{currentPage}</span>
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-md border disabled:opacity-50 hover:bg-slate-100"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

const EnrollmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  students,
  courses,
  periods,
}) => {
  const [formData, setFormData] = useState({
    student_id: null,
    course_id: null,
    period_id: null,
    section_id: null,
    year_level: "",
    enrollment_date: new Date().toISOString().split("T")[0],
    status: "Enrolled",
    midterm_grade: "",
    final_grade: "",
    remarks: "",
  });
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fetch sections when course or period changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!formData.course_id || !formData.period_id) {
        setSections([]);
        setFormData((prev) => ({ ...prev, section_id: null }));
        return;
      }
      setLoadingSections(true);
      try {
        const res = await axios.get(`${API_BASE}/api/sections`, {
          params: {
            course_id: formData.course_id,
            period_id: formData.period_id,
          },
        });
        setSections(
          (res.data || []).map((s) => ({
            value: s.section_id,
            label: `${s.section_name} (${s.current_enrolled || 0}/${s.max_capacity})`,
          })),
        );
      } catch (err) {
        setSections([]);
      }
      setLoadingSections(false);
    };
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.course_id, formData.period_id]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id,
        course_id: initialData.course_id,
        period_id: initialData.period_id,
        section_id: initialData.section_id || null,
        year_level: initialData.year_level || "",
        enrollment_date:
          initialData.enrollment_date || new Date().toISOString().split("T")[0],
        status: initialData.status || "Enrolled",
        midterm_grade: initialData.midterm_grade || "",
        final_grade: initialData.final_grade || "",
        remarks: initialData.remarks || "",
        enrollment_id: initialData.enrollment_id,
      });
    } else {
      setFormData({
        student_id: null,
        course_id: null,
        period_id: null,
        section_id: null,
        year_level: "",
        enrollment_date: new Date().toISOString().split("T")[0],
        status: "Enrolled",
        midterm_grade: "",
        final_grade: "",
        remarks: "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">
              {mode === "add" ? "New Enrollment" : "Edit Enrollment"}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Plus size={24} className="rotate-45" />
            </button>
          </div>
        </div>

        {/* Form Wrapper */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Student */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Student *
              </label>
              <Select
                value={
                  students.find((s) => s.value === formData.student_id) || null
                }
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    student_id: selected?.value || null,
                  }))
                }
                options={students}
                placeholder="Select student..."
                isDisabled={mode === "edit"}
                required
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#CBD5E1",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.875rem",
                    boxShadow: "none",
                    minHeight: "42px",
                    "&:hover": {
                      borderColor: "#CBD5E1",
                    },
                    "&:focus-within": {
                      borderColor: "#4F46E5",
                      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
                    },
                  }),
                  input: (base) => ({
                    ...base,
                    color: "#1E293B",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? "#4F46E5" : "#FFFFFF",
                    color: state.isSelected ? "#FFFFFF" : "#1E293B",
                    "&:hover": {
                      backgroundColor: "#EEF2FF",
                      color: "#1E293B",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Course *
                </label>
                <Select
                  value={
                    courses.find((c) => c.value === formData.course_id) || null
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      course_id: selected?.value || null,
                    }))
                  }
                  options={courses}
                  placeholder="Select course..."
                  isDisabled={mode === "edit"}
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#CBD5E1",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.875rem",
                      boxShadow: "none",
                      minHeight: "42px",
                      "&:hover": {
                        borderColor: "#CBD5E1",
                      },
                      "&:focus-within": {
                        borderColor: "#4F46E5",
                        boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
                      },
                    }),
                    input: (base) => ({
                      ...base,
                      color: "#1E293B",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? "#4F46E5" : "#FFFFFF",
                      color: state.isSelected ? "#FFFFFF" : "#1E293B",
                      "&:hover": {
                        backgroundColor: "#EEF2FF",
                        color: "#1E293B",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>

              {/* Academic Period */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Academic Period *
                </label>
                <Select
                  value={
                    periods.find((p) => p.value === formData.period_id) || null
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      period_id: selected?.value || null,
                    }))
                  }
                  options={periods}
                  placeholder="Select period..."
                  isDisabled={mode === "edit"}
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#CBD5E1",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.875rem",
                      boxShadow: "none",
                      minHeight: "42px",
                      "&:hover": {
                        borderColor: "#CBD5E1",
                      },
                      "&:focus-within": {
                        borderColor: "#4F46E5",
                        boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
                      },
                    }),
                    input: (base) => ({
                      ...base,
                      color: "#1E293B",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? "#4F46E5" : "#FFFFFF",
                      color: state.isSelected ? "#FFFFFF" : "#1E293B",
                      "&:hover": {
                        backgroundColor: "#EEF2FF",
                        color: "#1E293B",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Section */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Section *
                </label>
                <Select
                  value={
                    sections.find((s) => s.value === formData.section_id) ||
                    null
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      section_id: selected?.value || null,
                    }))
                  }
                  options={sections}
                  placeholder={
                    loadingSections ? "Loading..." : "Select section..."
                  }
                  isDisabled={
                    !formData.course_id ||
                    !formData.period_id ||
                    loadingSections
                  }
                  required
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#CBD5E1",
                      backgroundColor: "#FFFFFF",
                      fontSize: "0.875rem",
                      boxShadow: "none",
                      minHeight: "42px",
                      "&:hover": {
                        borderColor: "#CBD5E1",
                      },
                      "&:focus-within": {
                        borderColor: "#4F46E5",
                        boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
                      },
                    }),
                    input: (base) => ({
                      ...base,
                      color: "#1E293B",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? "#4F46E5" : "#FFFFFF",
                      color: state.isSelected ? "#FFFFFF" : "#1E293B",
                      "&:hover": {
                        backgroundColor: "#EEF2FF",
                        color: "#1E293B",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>

              {/* Year Level */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Year Level *
                </label>
                <select
                  value={formData.year_level}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      year_level: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select...</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Enrollment Date */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Enrollment Date *
                </label>
                <input
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      enrollment_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Enrolled">Enrolled</option>
                <option value="Dropped">Dropped</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Midterm Grade */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Midterm Grade
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.midterm_grade}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      midterm_grade: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>

              {/* Final Grade */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Final Grade
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.final_grade}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      final_grade: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-lg">
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                {mode === "add" ? "Create Enrollment" : "Update Enrollment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const EnrollmentRecords = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/enrollments`);
      setEnrollments(res.data);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/users`);
      const studentList = (res.data || [])
        .filter((u) => u.role === "Student")
        .map((s) => ({
          value: s.user_id,
          label: `${s.first_name} ${s.last_name} (${
            s.student_number || s.email
          })`,
        }));
      setStudents(studentList);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/course/courses`);
      console.log("Courses API response:", res.data);
      const courseList = (res.data || [])
        .filter((c) => c && (c.id || c.course_id))
        .map((c) => ({
          value: c.id || c.course_id,
          label: `${c.code || c.course_code || "N/A"} - ${
            c.title || c.course_title || "N/A"
          }`,
        }));
      console.log("Processed courses:", courseList);
      setCourses(courseList);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  const fetchPeriods = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/academic-periods`);
      console.log("Periods API response:", res.data);
      const periodList = (res.data || [])
        .filter((p) => p && (p.id || p.period_id))
        .map((p) => ({
          value: p.id || p.period_id,
          label: `${p.school_year || "N/A"} - ${p.semester || "N/A"}`,
        }));
      console.log("Processed periods:", periodList);
      setPeriods(periodList);
    } catch (err) {
      console.error("Error fetching periods:", err);
      setPeriods([]);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = enrollments.filter((e) => {
    const matchSearch =
      (e.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.course_title || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.course_code || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || e.status === filterStatus.value;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const displayed = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleSubmit = async (data) => {
    try {
      if (modalMode === "add") {
        await axios.post(`${API_BASE}/api/enrollments`, data);
      } else {
        await axios.put(
          `${API_BASE}/api/enrollments/${data.enrollment_id}`,
          data,
        );
      }
      fetchEnrollments();
      setModalOpen(false);
      setCurrentRecord(null);
    } catch (err) {
      console.error("Error saving enrollment:", err);
      alert(err.response?.data?.message || "Failed to save enrollment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this enrollment record?")) return;
    try {
      await axios.delete(`${API_BASE}/api/enrollments/${id}`);
      fetchEnrollments();
    } catch (err) {
      console.error("Error deleting enrollment:", err);
    }
  };

  const openModal = (mode, record = null) => {
    setModalMode(mode);
    setCurrentRecord(record);
    setModalOpen(true);
  };

  const statusOptions = [
    { value: "Enrolled", label: "Enrolled" },
    { value: "Dropped", label: "Dropped" },
    { value: "Completed", label: "Completed" },
    { value: "Failed", label: "Failed" },
  ];

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList size={24} /> Enrollment Records
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          View and manage all student enrollment records across academic
          periods.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by student or course..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select
            value={filterStatus}
            onChange={(selected) => {
              setFilterStatus(selected);
              setPage(1);
            }}
            options={statusOptions}
            placeholder="Status"
            isClearable
            className="w-40"
          />
          <button
            onClick={() => openModal("add")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={16} /> New Enrollment
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold">ID</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Student
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Course
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Period
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Year Level
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Enrollment Date
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-3 py-2 text-center text-sm font-semibold">
                Grades
              </th>
              <th className="px-3 py-2 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {displayed.length > 0 ? (
              displayed.map((enrollment) => (
                <tr
                  key={enrollment.enrollment_id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-sm">
                    {enrollment.enrollment_id}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {enrollment.student_name}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {enrollment.course_code} - {enrollment.course_title}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {enrollment.school_year && enrollment.semester
                      ? `${enrollment.school_year} - ${enrollment.semester}`
                      : "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {enrollment.year_level || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {enrollment.enrollment_date}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <StatusBadge status={enrollment.status} />
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    {enrollment.midterm_grade || "-"} /{" "}
                    {enrollment.final_grade || "-"}
                  </td>
                  <td className="px-3 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openModal("edit", enrollment)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(enrollment.enrollment_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-4 text-slate-500 italic"
                >
                  No enrollment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        setPage={setPage}
        totalItems={filtered.length}
      />

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentRecord(null);
        }}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={currentRecord}
        students={students}
        courses={courses}
        periods={periods}
      />
    </div>
  );
};

export default EnrollmentRecords;
