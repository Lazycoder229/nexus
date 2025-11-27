import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "Under Review": "bg-blue-100 text-blue-800",
    Accepted: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Enrolled: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        colors[status] || colors.Pending
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
        className="p-1.5 rounded-md border disabled:opacity-50"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-2 py-1">{currentPage}</span>
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-md border disabled:opacity-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

const AdmissionModal = ({ isOpen, onClose, onSubmit, mode, initialData }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    previous_school: "",
    year_graduated: "",
    program_applied: "",
    application_date: new Date().toISOString().split("T")[0],
    entrance_exam_score: "",
    status: "Pending",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || "",
        middle_name: initialData.middle_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        date_of_birth: initialData.date_of_birth || "",
        gender: initialData.gender || "",
        address: initialData.address || "",
        previous_school: initialData.previous_school || "",
        year_graduated: initialData.year_graduated || "",
        program_applied: initialData.program_applied || "",
        application_date:
          initialData.application_date ||
          new Date().toISOString().split("T")[0],
        entrance_exam_score: initialData.entrance_exam_score || "",
        status: initialData.status || "Pending",
        admission_id: initialData.admission_id,
      });
    } else {
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        address: "",
        previous_school: "",
        year_graduated: "",
        program_applied: "",
        application_date: new Date().toISOString().split("T")[0],
        entrance_exam_score: "",
        status: "Pending",
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
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {mode === "add"
              ? "New Application"
              : mode === "edit"
              ? "Edit Application"
              : "View Application"}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={formData.middle_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    middle_name: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={mode === "view"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    date_of_birth: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              rows={2}
              disabled={mode === "view"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Previous School
              </label>
              <input
                type="text"
                value={formData.previous_school}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    previous_school: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Year Graduated
              </label>
              <input
                type="number"
                value={formData.year_graduated}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    year_graduated: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Program Applied *
              </label>
              <input
                type="text"
                value={formData.program_applied}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    program_applied: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g. BSIT"
                required
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Application Date *
              </label>
              <input
                type="date"
                value={formData.application_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    application_date: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Entrance Exam Score
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.entrance_exam_score}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    entrance_exam_score: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              disabled={mode === "view"}
            >
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Enrolled">Enrolled</option>
            </select>
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
                {mode === "add" ? "Create" : "Update"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const Admission = () => {
  const [admissions, setAdmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchAdmissions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admissions`);
      setAdmissions(res.data);
    } catch (err) {
      console.error("Error fetching admissions:", err);
    }
  };

  useEffect(() => {
    fetchAdmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = admissions.filter(
    (a) =>
      (a.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.last_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const displayed = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSubmit = async (data) => {
    try {
      if (modalMode === "add") {
        await axios.post(`${API_BASE}/api/admissions`, data);
      } else {
        await axios.put(
          `${API_BASE}/api/admissions/${data.admission_id}`,
          data
        );
      }
      fetchAdmissions();
      setModalOpen(false);
      setCurrentRecord(null);
    } catch (err) {
      console.error("Error saving admission:", err);
      alert(err.response?.data?.message || "Failed to save admission");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admission record?")) return;
    try {
      await axios.delete(`${API_BASE}/api/admissions/${id}`);
      fetchAdmissions();
    } catch (err) {
      console.error("Error deleting admission:", err);
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
          <FileText size={24} /> Admissions
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage student admission applications and status.
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 border rounded-md"
          />
        </div>
        <button
          onClick={() => openModal("add")}
          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={16} /> New Application
        </button>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold">ID</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Email
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Program Applied
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Application Date
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
              displayed.map((admission) => (
                <tr key={admission.admission_id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-sm">
                    {admission.admission_id}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {admission.first_name} {admission.last_name}
                  </td>
                  <td className="px-3 py-2 text-sm">{admission.email}</td>
                  <td className="px-3 py-2 text-sm">
                    {admission.program_applied || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {admission.application_date}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <StatusBadge status={admission.status} />
                  </td>
                  <td className="px-3 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openModal("view", admission)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openModal("edit", admission)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(admission.admission_id)}
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
                  No admissions found.
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

      <AdmissionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentRecord(null);
        }}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={currentRecord}
      />
    </div>
  );
};

export default Admission;
