import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  BookOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
} from "lucide-react";

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

const AssignmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  subjectSections,
  faculty,
  courses,
  periods,
}) => {
  const [formData, setFormData] = useState({
    faculty_id: null,
    course_id: null,
    period_id: null,
    section: "",
    room: "",
    max_students: "",
    schedules: [
      { schedule_day: "", schedule_time_start: "", schedule_time_end: "" },
    ],
  });

  // Section and Room options from subjectSections prop
  const sectionOptions = Array.from(
    new Set((subjectSections || []).map((s) => s.section_name).filter(Boolean)),
  ).map((name) => ({ value: name, label: name }));
  const roomOptions = Array.from(
    new Set((subjectSections || []).map((s) => s.room).filter(Boolean)),
  ).map((room) => ({ value: room, label: room }));

  // Debug: log faculty options when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("Faculty options in modal:", faculty);
    }
  }, [isOpen, faculty]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        faculty_id: initialData.faculty_id ?? null,
        course_id: initialData.course_id ?? null,
        period_id: initialData.period_id ?? null,
        section: initialData.section || "",
        room: initialData.room || "",
        max_students: initialData.max_students || "",
        schedules: Array.isArray(initialData.schedules)
          ? initialData.schedules.map((s) => ({
              schedule_day: s.schedule_day || "",
              schedule_time_start: s.schedule_time_start || "",
              schedule_time_end: s.schedule_time_end || "",
            }))
          : [
              {
                schedule_day: initialData.schedule_day || "",
                schedule_time_start: initialData.schedule_time_start || "",
                schedule_time_end: initialData.schedule_time_end || "",
              },
            ],
        assignment_id: initialData.assignment_id,
      });
    } else if (mode === "edit") {
      setFormData({
        faculty_id: null,
        course_id: null,
        period_id: null,
        section: "",
        room: "",
        max_students: "",
        schedules: [
          { schedule_day: "", schedule_time_start: "", schedule_time_end: "" },
        ],
      });
    }
    // Do NOT reset formData when adding, so selection stays until modal is closed or submitted
    // Only reset on close or after submit
    // eslint-disable-next-line
  }, [initialData, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("formData before submit:", formData);
    const dataToSend = {
      ...formData,
      faculty_user_id: formData.faculty_id,
      academic_period_id: formData.period_id,
      max_students: formData.max_students
        ? Number(formData.max_students)
        : null,
    };
    delete dataToSend.faculty_id;
    delete dataToSend.period_id;
    onSubmit(dataToSend);
    // Reset form after submit (add mode)
    if (mode === "add") {
      setFormData({
        faculty_id: null,
        course_id: null,
        period_id: null,
        section: "",
        room: "",
        max_students: "",
        schedules: [
          { schedule_day: "", schedule_time_start: "", schedule_time_end: "" },
        ],
      });
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen && mode === "add") {
      setFormData({
        faculty_id: null,
        course_id: null,
        period_id: null,
        section: "",
        room: "",
        max_students: "",
        schedules: [
          { schedule_day: "", schedule_time_start: "", schedule_time_end: "" },
        ],
      });
    }
    // eslint-disable-next-line
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {mode === "add"
              ? "New Course Assignment"
              : "Edit Course Assignment"}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Faculty Member *
            </label>
            <Select
              value={
                faculty.find((f) => f.value === formData.faculty_id) || null
              }
              onChange={(selected) => {
                setFormData((prev) => ({
                  ...prev,
                  faculty_id: selected ? selected.value : null,
                }));
              }}
              options={faculty}
              placeholder="Select faculty..."
              isDisabled={mode === "edit"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Course *</label>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <Select
                options={sectionOptions}
                value={
                  sectionOptions.find((o) => o.value === formData.section) ||
                  null
                }
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    section: selected ? selected.value : "",
                  }))
                }
                placeholder="Select section..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room</label>
              <Select
                options={roomOptions}
                value={
                  roomOptions.find((o) => o.value === formData.room) || null
                }
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    room: selected ? selected.value : "",
                  }))
                }
                placeholder="Select room..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Schedules</label>
            {formData.schedules.map((sched, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 mb-2">
                <input
                  type="text"
                  value={sched.schedule_day}
                  onChange={(e) => {
                    const newSchedules = [...formData.schedules];
                    newSchedules[idx].schedule_day = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      schedules: newSchedules,
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., MWF"
                />
                <input
                  type="time"
                  value={sched.schedule_time_start}
                  onChange={(e) => {
                    const newSchedules = [...formData.schedules];
                    newSchedules[idx].schedule_time_start = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      schedules: newSchedules,
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={sched.schedule_time_end}
                    onChange={(e) => {
                      const newSchedules = [...formData.schedules];
                      newSchedules[idx].schedule_time_end = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        schedules: newSchedules,
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {formData.schedules.length > 1 && (
                    <button
                      type="button"
                      className="px-2 py-2 bg-red-100 text-red-600 rounded-md ml-2"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          schedules: prev.schedules.filter((_, i) => i !== idx),
                        }));
                      }}
                      title="Remove schedule"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-md"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  schedules: [
                    ...prev.schedules,
                    {
                      schedule_day: "",
                      schedule_time_start: "",
                      schedule_time_end: "",
                    },
                  ],
                }))
              }
            >
              + Add Schedule
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Max Students
            </label>
            <input
              type="number"
              value={formData.max_students}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  max_students: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 40"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {mode === "add" ? "Create" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FacultyAssignCourse = () => {
  const [assignments, setAssignments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [subjectSections, setSubjectSections] = useState([]);
  const [search, setSearch] = useState("");
  const [filterFaculty, setFilterFaculty] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fetch Subject Sections
  const fetchSubjectSections = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/sections`);
      setSubjectSections(res.data || []);
    } catch (err) {
      console.error("Error fetching subject sections:", err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/faculty-assignments`);
      setAssignments(res.data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/faculty`);
      const facultyList = (res.data || []).map((f) => ({
        value: f.user_id, // Use user_id as the unique identifier
        label: `${f.first_name} ${f.last_name} (${f.employee_id})`,
      }));
      setFaculty(facultyList);
    } catch (err) {
      console.error("Error fetching faculty:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/course/courses`);
      const courseList = (res.data || []).map((c) => ({
        value: c.id || c.course_id,
        label: `${c.code || c.course_code} - ${c.title || c.course_title}`,
      }));
      setCourses(courseList);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchPeriods = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/academic-periods`);
      const periodList = (res.data || []).map((p) => ({
        value: p.id || p.period_id,
        label: `${p.school_year} - ${p.semester}`,
      }));
      setPeriods(periodList);
    } catch (err) {
      console.error("Error fetching periods:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchFaculty();
    fetchCourses();
    fetchPeriods();
    fetchSubjectSections();
  }, []);

  const filtered = assignments.filter((a) => {
    const matchSearch =
      (a.faculty_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.course_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.course_title || "").toLowerCase().includes(search.toLowerCase());
    const matchFaculty = !filterFaculty || a.faculty_id === filterFaculty.value;
    return matchSearch && matchFaculty;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const displayed = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleSubmit = async (data) => {
    try {
      if (modalMode === "add") {
        await axios.post(`${API_BASE}/api/faculty-assignments`, data);
      } else {
        await axios.put(
          `${API_BASE}/api/faculty-assignments/${data.assignment_id}`,
          data,
        );
      }
      fetchAssignments();
      setModalOpen(false);
      setCurrentRecord(null);
    } catch (err) {
      console.error("Error saving assignment:", err);
      alert(err.response?.data?.message || "Failed to save assignment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await axios.delete(`${API_BASE}/api/faculty-assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  const openModal = (mode, record = null) => {
    setModalMode(mode);
    setCurrentRecord(record);
    setModalOpen(true);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen size={24} /> Faculty Course Assignments
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Assign courses to faculty members for each academic period.
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
              placeholder="Search by faculty or course..."
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
            value={filterFaculty}
            onChange={(selected) => {
              setFilterFaculty(selected);
              setPage(1);
            }}
            options={faculty}
            placeholder="Filter by Faculty"
            isClearable
            className="w-56"
          />
          <button
            onClick={() => openModal("add")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={16} /> New Assignment
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Faculty
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Course
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Period
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Section
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Room
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Schedule
              </th>
              <th className="px-3 py-2 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {displayed.length > 0 ? (
              displayed.map((assignment) => (
                <tr
                  key={assignment.assignment_id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-sm">
                    {assignment.faculty_name || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {assignment.course_code} - {assignment.course_title}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {assignment.school_year} {assignment.semester}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {assignment.section || "-"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {assignment.room || "-"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {Array.isArray(assignment.schedules)
                      ? assignment.schedules.map((s, i) => (
                          <div key={i}>
                            {s.schedule_day} {s.schedule_time_start} -{" "}
                            {s.schedule_time_end}
                          </div>
                        ))
                      : assignment.schedule
                        ? assignment.schedule
                        : "-"}
                  </td>
                  <td className="px-3 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openModal("edit", assignment)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.assignment_id)}
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
                  colSpan={7}
                  className="text-center py-4 text-slate-500 italic"
                >
                  No course assignments found.
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

      <AssignmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentRecord(null);
        }}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={currentRecord}
        subjectSections={subjectSections}
        faculty={faculty}
        courses={courses}
        periods={periods}
      />
    </div>
  );
};

export default FacultyAssignCourse;
