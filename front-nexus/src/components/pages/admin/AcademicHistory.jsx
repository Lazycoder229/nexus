import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  CalendarCheck,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const colors = {
    Regular: "bg-green-100 text-green-800",
    Irregular: "bg-yellow-100 text-yellow-800",
    Probation: "bg-red-100 text-red-800",
    "Dean's List": "bg-blue-100 text-blue-800",
    Dismissed: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        colors[status] || colors.Regular
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

const HistoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  students,
  periods,
  setLastSelectedPeriod,
}) => {
  const [formData, setFormData] = useState({
    student_id: null,
    period_id: null,
    year_level: "",
    semester_gpa: "",
    cumulative_gpa: "",
    units_taken: "",
    units_passed: "",
    academic_status: "Regular",
    honors: "",
    remarks: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id,
        period_id: initialData.period_id,
        year_level: initialData.year_level || "",
        semester_gpa: initialData.semester_gpa || "",
        cumulative_gpa: initialData.cumulative_gpa || "",
        units_taken: initialData.units_taken || "",
        units_passed: initialData.units_passed || "",
        academic_status: initialData.academic_status || "Regular",
        honors: initialData.honors || "",
        remarks: initialData.remarks || "",
        history_id: initialData.history_id,
      });
      console.log(
        "[HistoryModal] initialData set, period_id:",
        initialData.period_id,
      );
    } else {
      setFormData({
        student_id: null,
        period_id: null,
        year_level: "",
        semester_gpa: "",
        cumulative_gpa: "",
        units_taken: "",
        units_passed: "",
        academic_status: "Regular",
        honors: "",
        remarks: "",
      });
      console.log("[HistoryModal] reset to blank, period_id: null");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

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
            {mode === "add" ? "New Academic Record" : "Edit Academic Record"}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
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
                menuPortalTarget={document.body} // Add this
                menuPosition="fixed" // Add this
                styles={{
                  // Add this
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
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
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    period_id: selected?.value || null,
                  }));
                  if (mode === "add" && setLastSelectedPeriod) {
                    setLastSelectedPeriod(selected?.value || null);
                  }
                }}
                options={periods}
                placeholder="Select period..."
                isDisabled={mode === "edit"}
                required
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Year Level
              </label>
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
                <option value="">Select...</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Academic Status
              </label>
              <select
                value={formData.academic_status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    academic_status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Regular">Regular</option>
                <option value="Irregular">Irregular</option>
                <option value="Probation">Probation</option>
                <option value="Dean's List">Dean's List</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Semester GPA
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.semester_gpa}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    semester_gpa: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cumulative GPA
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cumulative_gpa}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cumulative_gpa: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Units Taken
              </label>
              <input
                type="number"
                value={formData.units_taken}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    units_taken: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Units Passed
              </label>
              <input
                type="number"
                value={formData.units_passed}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    units_passed: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Honors</label>
            <input
              type="text"
              value={formData.honors}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, honors: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g. Magna Cum Laude, Dean's Lister"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, remarks: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              rows={2}
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

const AcademicHistory = () => {
  const [history, setHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [lastSelectedPeriod, setLastSelectedPeriod] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/academic-history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching academic history:", err);
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

  // In AcademicHistory component, update fetchPeriods:
  const fetchPeriods = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/academic-periods`);
      const periodOptions = res.data.map((p) => ({
        value: p.period_id || p.id, // use p.id if period_id is not present
        label: `${p.school_year} - ${p.semester}`,
      }));
      setPeriods(periodOptions);
      console.log("[AcademicHistory] fetched periods:", res.data);
      // Do NOT set lastSelectedPeriod by default; keep blank until user selects
    } catch (err) {
      console.error("Error fetching periods:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchStudents();
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = history.filter((h) => {
    const matchSearch =
      (h.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (h.year_level || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      !filterStatus || h.academic_status === filterStatus.value;
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
        await axios.post(`${API_BASE}/api/academic-history`, data);
      } else {
        await axios.put(
          `${API_BASE}/api/academic-history/${data.history_id}`,
          data,
        );
      }
      fetchHistory();
      setModalOpen(false);
      setCurrentRecord(null);
    } catch (err) {
      console.error("Error saving academic history:", err);
      alert(err.response?.data?.message || "Failed to save academic history");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this academic record?")) return;
    try {
      await axios.delete(`${API_BASE}/api/academic-history/${id}`);
      fetchHistory();
    } catch (err) {
      console.error("Error deleting academic history:", err);
    }
  };

  const openModal = (mode, record = null) => {
    setModalMode(mode);
    setCurrentRecord(mode === "add" ? { period_id: null } : record);
    setModalOpen(true);
  };

  const statusOptions = [
    { value: "Regular", label: "Regular" },
    { value: "Irregular", label: "Irregular" },
    { value: "Probation", label: "Probation" },
    { value: "Dean's List", label: "Dean's List" },
    { value: "Dismissed", label: "Dismissed" },
  ];

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarCheck size={24} /> Academic History
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          View comprehensive academic records, GPA tracking, and student
          milestones.
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
              placeholder="Search by student name..."
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
            <Plus size={16} /> New Record
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
                Period
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Year Level
              </th>
              <th className="px-3 py-2 text-center text-sm font-semibold">
                Sem GPA
              </th>
              <th className="px-3 py-2 text-center text-sm font-semibold">
                Cum GPA
              </th>
              <th className="px-3 py-2 text-center text-sm font-semibold">
                Units
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-3 py-2 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {displayed.length > 0 ? (
              displayed.map((record) => (
                <tr key={record.history_id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-sm">{record.history_id}</td>
                  <td className="px-3 py-2 text-sm">{record.student_name}</td>
                  <td className="px-3 py-2 text-sm">{record.period_name}</td>
                  <td className="px-3 py-2 text-sm">
                    {record.year_level || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    {record.semester_gpa || "-"}
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    {record.cumulative_gpa || "-"}
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    {record.units_passed || 0}/{record.units_taken || 0}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <StatusBadge status={record.academic_status} />
                  </td>
                  <td className="px-3 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openModal("edit", record)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(record.history_id)}
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
                  No academic records found.
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

      <HistoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentRecord(null);
        }}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={currentRecord}
        students={students}
        periods={periods}
        setLastSelectedPeriod={setLastSelectedPeriod}
      />
    </div>
  );
};

export default AcademicHistory;
