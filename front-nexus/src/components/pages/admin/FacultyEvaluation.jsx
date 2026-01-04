import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  CheckSquare,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react";

const RatingStars = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ))}
      <span className="text-sm ml-1">{rating.toFixed(1)}</span>
    </div>
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

const EvaluationModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  faculty,
  students,
  periods,
}) => {
  const [formData, setFormData] = useState({
    faculty_id: null,
    student_id: null,
    period_id: null,
    teaching_effectiveness: 5,
    subject_mastery: 5,
    communication_skills: 5,
    professionalism: 5,
    student_engagement: 5,
    comments: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        faculty_id: initialData.faculty_id,
        student_id: initialData.student_id,
        period_id: initialData.period_id,
        teaching_effectiveness: initialData.teaching_effectiveness || 5,
        subject_mastery: initialData.subject_mastery || 5,
        communication_skills: initialData.communication_skills || 5,
        professionalism: initialData.professionalism || 5,
        student_engagement: initialData.student_engagement || 5,
        comments: initialData.comments || "",
        evaluation_id: initialData.evaluation_id,
      });
    } else {
      setFormData({
        faculty_id: null,
        student_id: null,
        period_id: null,
        teaching_effectiveness: 5,
        subject_mastery: 5,
        communication_skills: 5,
        professionalism: 5,
        student_engagement: 5,
        comments: "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const criteriaFields = [
    { name: "teaching_effectiveness", label: "Teaching Effectiveness" },
    { name: "subject_mastery", label: "Subject Mastery" },
    { name: "communication_skills", label: "Communication Skills" },
    { name: "professionalism", label: "Professionalism" },
    { name: "student_engagement", label: "Student Engagement" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {mode === "add"
              ? "New Faculty Evaluation"
              : mode === "edit"
              ? "Edit Evaluation"
              : "View Evaluation"}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Faculty Member *
              </label>
              <Select
                value={
                  faculty.find((f) => f.value === formData.faculty_id) || null
                }
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    faculty_id: selected?.value || null,
                  }))
                }
                options={faculty}
                placeholder="Select faculty..."
                isDisabled={mode === "view"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Evaluator (Student) *
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
                isDisabled={mode === "view"}
              />
            </div>
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
              isDisabled={mode === "view"}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">
              Evaluation Criteria (1-5 Stars)
            </h4>
            {criteriaFields.map((field) => (
              <div key={field.name} className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData[field.name]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.name]: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full"
                    disabled={mode === "view"}
                  />
                  <span className="text-sm font-semibold w-12">
                    {formData[field.name].toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comments: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Additional feedback..."
              disabled={mode === "view"}
            />
          </div>

          {mode !== "view" && (
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
                {mode === "add" ? "Submit Evaluation" : "Update"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const FacultyEvaluation = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [search, setSearch] = useState("");
  const [filterFaculty, setFilterFaculty] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchEvaluations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/faculty-evaluations`);
      setEvaluations(res.data);
    } catch (err) {
      console.error("Error fetching evaluations:", err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/faculty`);
      const facultyList = (res.data || []).map((f) => ({
        value: f.faculty_id,
        label: `${f.first_name} ${f.last_name}`,
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
          label: `${s.first_name} ${s.last_name}`,
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
    fetchEvaluations();
    fetchFaculty();
    fetchStudents();
    fetchPeriods();
  }, []);

  const filtered = evaluations.filter((e) => {
    const matchSearch =
      (e.faculty_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.student_name || "").toLowerCase().includes(search.toLowerCase());
    const matchFaculty = !filterFaculty || e.faculty_id === filterFaculty.value;
    return matchSearch && matchFaculty;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const displayed = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSubmit = async (data) => {
    try {
      if (modalMode === "add") {
        await axios.post(`${API_BASE}/api/faculty-evaluations`, data);
      } else {
        await axios.put(
          `${API_BASE}/api/faculty-evaluations/${data.evaluation_id}`,
          data
        );
      }
      fetchEvaluations();
      setModalOpen(false);
      setCurrentRecord(null);
    } catch (err) {
      console.error("Error saving evaluation:", err);
      alert(err.response?.data?.message || "Failed to save evaluation");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this evaluation?")) return;
    try {
      await axios.delete(`${API_BASE}/api/faculty-evaluations/${id}`);
      fetchEvaluations();
    } catch (err) {
      console.error("Error deleting evaluation:", err);
    }
  };

  const openModal = (mode, record = null) => {
    setModalMode(mode);
    setCurrentRecord(record);
    setModalOpen(true);
  };

  const calculateAverage = (evaluation) => {
    const ratings = [
      evaluation.teaching_effectiveness,
      evaluation.subject_mastery,
      evaluation.communication_skills,
      evaluation.professionalism,
      evaluation.student_engagement,
    ].filter((r) => r != null);

    return ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare size={24} /> Faculty Evaluation
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage faculty performance evaluations from students.
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
            <Plus size={16} /> New Evaluation
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
                Evaluator
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Period
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Average Rating
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-3 py-2 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {displayed.length > 0 ? (
              displayed.map((evaluation) => (
                <tr
                  key={evaluation.evaluation_id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-sm">
                    {evaluation.faculty_name || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {evaluation.student_name || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {evaluation.school_year} {evaluation.semester}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <RatingStars rating={calculateAverage(evaluation)} />
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {evaluation.evaluation_date || "-"}
                  </td>
                  <td className="px-3 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openModal("view", evaluation)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openModal("edit", evaluation)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(evaluation.evaluation_id)}
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
                  No evaluations found.
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

      <EvaluationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentRecord(null);
        }}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={currentRecord}
        faculty={faculty}
        students={students}
        periods={periods}
      />
    </div>
  );
};

export default FacultyEvaluation;
