import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Award,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const colors = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-800",
    OnLeave: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        colors[status] || colors.Active
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

const FacultyModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  departments,
}) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    position: "",
    specialization: "",
    educational_attainment: "",
    license_number: "",
    date_hired: new Date().toISOString().split("T")[0],
    employment_status: "Active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        employee_id: initialData.employee_id || "",
        first_name: initialData.first_name || "",
        middle_name: initialData.middle_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        password: "", // Only for add mode
        phone: initialData.phone || "",
        department: initialData.department || "",
        position: initialData.position_title || initialData.position || "",
        specialization: initialData.specialization || "",
        educational_attainment: initialData.educational_attainment || "",
        license_number: initialData.license_number || "",
        date_hired: initialData.date_hired || "",
        employment_status:
          initialData.status || initialData.employment_status || "Active",
        faculty_id: initialData.faculty_id,
        user_id: initialData.user_id,
      });
    } else {
      setFormData({
        employee_id: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        department: "",
        position: "",
        specialization: "",
        educational_attainment: "",
        license_number: "",
        date_hired: new Date().toISOString().split("T")[0],
        employment_status: "Active",
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
              ? "Add New Faculty"
              : mode === "edit"
                ? "Edit Faculty"
                : "View Faculty"}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mode === "add" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={mode === "view"}
                  autoComplete="new-password"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employee_id: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={mode === "view"}
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium mb-1">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={mode === "view"}
              >
                <option value="">Select...</option>
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Position *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, position: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={mode === "view"}
                placeholder="e.g., Professor, Instructor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specialization: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Educational Attainment
              </label>
              <select
                value={formData.educational_attainment}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    educational_attainment: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              >
                <option value="">Select...</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctorate">Doctorate</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                License Number
              </label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    license_number: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Date Hired *
              </label>
              <input
                type="date"
                value={formData.date_hired}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    date_hired: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={mode === "view"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Employment Status
              </label>
              <select
                value={formData.employment_status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employment_status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={mode === "view"}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="OnLeave">On Leave</option>
              </select>
            </div>
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

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/faculty`);
      setFaculty(res.data);
    } catch (err) {
      console.error("Error fetching faculty:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/dept/departments`);
      const deptList = (res.data || []).map((d) => ({
        value: d.id,
        label: d.name,
      }));
      setDepartments(deptList);
      console.log("[FacultyManagement] fetched departments:", deptList);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const filtered = faculty.filter((f) => {
    const matchSearch =
      (f.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.last_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.employee_id || "").toLowerCase().includes(search.toLowerCase());
    const matchDept =
      !filterDepartment || f.department === filterDepartment.label;
    return matchSearch && matchDept;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const displayed = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleSubmit = async (data) => {
    try {
      if (modalMode === "add") {
        await axios.post(`${API_BASE}/api/faculty`, data);
      } else {
        // Use user_id for edit requests
        await axios.put(
          `${API_BASE}/api/faculty/${data.user_id || data.faculty_id}`,
          data,
        );
      }
      fetchFaculty();
      setModalOpen(false);
      setCurrentRecord(null);
    } catch (err) {
      console.error("Error saving faculty:", err);
      alert(err.response?.data?.message || "Failed to save faculty");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this faculty member?")) return;
    try {
      await axios.delete(`${API_BASE}/api/faculty/${id}`);
      fetchFaculty();
    } catch (err) {
      console.error("Error deleting faculty:", err);
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
          <Users size={24} /> Faculty Management
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage faculty members, their departments, and employment details.
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
              placeholder="Search by name, email, or employee ID..."
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
            value={filterDepartment}
            onChange={(selected) => {
              setFilterDepartment(selected);
              setPage(1);
            }}
            options={departments}
            placeholder="Department"
            isClearable
            className="w-56"
          />
          <button
            onClick={() => openModal("add")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={16} /> Add Faculty
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Employee ID
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Email
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Department
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Position
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
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-4 text-slate-500 italic"
                >
                  Loading...
                </td>
              </tr>
            ) : displayed.length > 0 ? (
              displayed.map((fac) => (
                <tr
                  key={fac.faculty_id || fac.employee_id || Math.random()}
                  className="hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-sm">{fac.employee_id}</td>
                  <td className="px-3 py-2 text-sm">
                    {fac.first_name} {fac.last_name}
                  </td>
                  <td className="px-3 py-2 text-sm">{fac.email}</td>
                  <td className="px-3 py-2 text-sm">
                    {fac.department || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm">{fac.position || "N/A"}</td>
                  <td className="px-3 py-2 text-sm">
                    <StatusBadge status={fac.employment_status || "Active"} />
                  </td>
                  <td className="px-3 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openModal("view", fac)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openModal("edit", fac)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(fac.faculty_id)}
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
                  No faculty members found.
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

      <FacultyModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentRecord(null);
        }}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={currentRecord}
        departments={departments}
      />
    </div>
  );
};

export default FacultyManagement;
