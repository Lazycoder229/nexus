import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  ClipboardList,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
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

const AdvisoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  faculty,
  students,
  periods,
  programs,
  resetTrigger,
}) => {
  const initialFormState = {
    faculty_id: null,
    student_id: null,
    period_id: null,
    advisory_type: "Academic",
    notes: "",
    program_id: null,
    year_level: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        faculty_id: initialData.faculty_id,
        student_id: initialData.student_id,
        period_id: initialData.period_id,
        program_id: initialData.program_id || null,
        year_level: initialData.year_level || "",
        advisory_type: initialData.advisory_type || "Academic",
        notes: initialData.notes || "",
        advisory_id: initialData.advisory_id,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen, resetTrigger]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // UI validation for required fields
    if (!formData.faculty_id || !formData.student_id || !formData.period_id) {
      setFormError(
        "Please select a faculty advisor, student, and academic period.",
      );
      return;
    }
    setFormError("");
    onSubmit(formData, () => setFormData(initialFormState));
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData(initialFormState);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {mode === "add"
              ? "New Advisory Assignment"
              : "Edit Advisory Assignment"}
          </h3>
          <button onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="text-red-600 text-sm mb-2">{formError}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              Faculty Advisor *
            </label>
            {/* Debug output for faculty select */}
            {console.log(
              "faculty_id:",
              formData.faculty_id,
              "faculty options:",
              faculty,
            )}
            <Select
              value={
                faculty.find(
                  (f) => String(f.value) === String(formData.faculty_id),
                ) || null
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  faculty_id: selected?.value || null,
                }))
              }
              options={faculty}
              placeholder="Select faculty..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Student *</label>
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

          <div>
            <label className="block text-sm font-medium mb-1">Program</label>
            <Select
              value={
                programs.find((p) => p.value === formData.program_id) || null
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  program_id: selected?.value || null,
                }))
              }
              options={programs}
              placeholder="Select program..."
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Year Level</label>
            <select
              value={formData.year_level}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  year_level: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select year level...</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Advisory Type
            </label>
            <select
              value={formData.advisory_type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  advisory_type: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Academic">Academic</option>
              <option value="Personal">Personal</option>
              <option value="Career">Career</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Additional notes..."
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

const FacultyAdvisoryAssignment = () => {
  const [advisories, setAdvisories] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [search, setSearch] = useState("");
  const [programs, setPrograms] = useState([]);
  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/programs`);
      const programList = (res.data || []).map((p) => ({
        value: p.id || p.program_id,
        label: `${p.code} - ${p.name}`,
      }));
      setPrograms(programList);
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };
  const [filterFaculty, setFilterFaculty] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchAdvisories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/faculty-advisory`);
      setAdvisories(res.data);
    } catch (err) {
      console.error("Error fetching advisories:", err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/faculty`);
      const facultyList = (res.data || []).map((f) => ({
        value: f.user_id || f.faculty_id || f.id, // Use the correct property for ID
        label: `${f.first_name} ${f.last_name} (${f.employee_id})`,
      }));
      setFaculty(facultyList);
    } catch (err) {
      console.error("Error fetching faculty:", err);
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
    fetchAdvisories();
    fetchFaculty();
    fetchStudents();
    fetchPeriods();
    fetchPrograms();
  }, []);

  const filtered = advisories.filter((a) => {
    const matchSearch =
      (a.faculty_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.student_name || "").toLowerCase().includes(search.toLowerCase());
    const matchFaculty = !filterFaculty || a.faculty_id === filterFaculty.value;
    return matchSearch && matchFaculty;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const displayed = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleSubmit = async (data) => {
    // Map faculty_id to faculty_user_id for backend compatibility
    const submitData = {
      ...data,
      faculty_user_id: data.faculty_id,
      academic_period_id: data.period_id,
      program_id: data.program_id,
      year_level: data.year_level,
    };
    delete submitData.faculty_id;
    delete submitData.period_id;
    try {
      if (modalMode === "add") {
        await axios.post(`${API_BASE}/api/faculty-advisory`, submitData);
      } else {
        await axios.put(
          `${API_BASE}/api/faculty-advisory/${data.advisory_id}`,
          submitData,
        );
      }
      fetchAdvisories();
      setModalOpen(false);
      setCurrentRecord(null);
    } catch (err) {
      console.error("Error saving advisory:", err);
      alert(
        err.response?.data?.message || "Failed to save advisory assignment",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this advisory assignment?")) return;
    try {
      await axios.delete(`${API_BASE}/api/faculty-advisory/${id}`);
      fetchAdvisories();
    } catch (err) {
      console.error("Error deleting advisory:", err);
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
          <ClipboardList size={24} /> Faculty Advisory Assignments
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Assign faculty advisors to students for academic guidance.
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
              placeholder="Search by faculty or student name..."
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
                Faculty Advisor
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Student
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Period
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Advisory Type
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Notes
              </th>
              <th className="px-3 py-2 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {displayed.length > 0 ? (
              displayed.map((advisory) => (
                <tr key={advisory.advisory_id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-sm">
                    {advisory.faculty_name || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {advisory.student_name || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {advisory.school_year} {advisory.semester}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {advisory.advisory_type || "-"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {advisory.notes
                      ? advisory.notes.substring(0, 50) + "..."
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openModal("edit", advisory)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(advisory.advisory_id)}
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
                  colSpan={6}
                  className="text-center py-4 text-slate-500 italic"
                >
                  No advisory assignments found.
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

      <AdvisoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentRecord(null);
        }}
        onSubmit={(data, resetForm) => {
          handleSubmit(data);
          if (resetForm) resetForm();
        }}
        mode={modalMode}
        initialData={currentRecord}
        faculty={faculty}
        students={students}
        periods={periods}
        programs={programs}
        resetTrigger={modalOpen === false}
      />
    </div>
  );
};

export default FacultyAdvisoryAssignment;
