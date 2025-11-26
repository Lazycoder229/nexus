import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Plus,
  Pencil,
  Trash2,
  File,
  FileArchive,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  BookAIcon,
  BookOpenText,
  BookAlert,
  EyeIcon,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";

// --- Status Badge Component ---
const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs font-semibold ${
      status === "Active"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    {status}
  </span>
);

// --- Pagination ---
const Pagination = ({ currentPage, totalPages, setPage, totalItems }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700">
    <span className="text-xs sm:text-sm">
      Page <span className="font-semibold">{currentPage}</span> of{" "}
      <span className="font-semibold">{totalPages}</span> | Total Records:{" "}
      {totalItems}
    </span>
    <div className="flex gap-1 items-center mt-2 sm:mt-0">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="p-1.5 rounded-md border border-slate-300 bg-white disabled:opacity-50 hover:bg-slate-100 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-2 py-1 text-xs font-semibold text-indigo-600">
        {currentPage}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="p-1.5 rounded-md border border-slate-300 bg-white disabled:opacity-50 hover:bg-slate-100 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

// --- Modal Component ---
const CourseModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  departments,
  instructors,
}) => {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    units: 3,
    department_id: null,
    instructor_id: null,
    status: "Active",
  });
  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || "",
        title: initialData.title || "",
        description: initialData.description || "",
        units: initialData.units || 3,
        department_id: initialData.department_id || null,
        instructor_id: initialData.instructor_id || null,
        status: initialData?.status || "Active",
        id: initialData.id, // <-- use id
      });
    } else {
      setFormData({
        code: "",
        title: "",
        description: "",
        units: 3,
        department_id: null,
        instructor_id: null,
        status: "Active",
        id: null,
      });
    }
  }, [initialData]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    console.log("Form data being submitted:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpenText size={24} />
            {mode === "add" ? "Add Course" : "Edit Course"}
          </h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Code */}
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="ex. CCS-2025"
              required
              className="w-full px-3 py-1 rounded-md border border-slate-300"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="ex. Introduction to Programming"
              required
              className="w-full px-3 py-1 rounded-md border border-slate-300"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-small mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              placeholder="Focus on INTRO"
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-1 border rounded-md  border-slate-300"
            />
          </div>

          {/* Units */}
          <div>
            <label className="block text-sm font-medium mb-1">Units</label>
            <input
              name="units"
              type="number"
              min={1}
              value={formData.units}
              onChange={handleChange}
              className="w-full px-3 py-1  rounded-md border border-slate-300 "
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Select
              value={
                formData.department_id
                  ? departments
                      .map((d) => ({
                        value: d.department_id || d.id,
                        label: d.name,
                      }))
                      .find((o) => o.value === formData.department_id)
                  : null
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  department_id: selected ? selected.value : null,
                }))
              }
              options={departments.map((d) => ({
                value: d.department_id || d.id,
                label: d.name,
              }))}
              placeholder="Select department..."
              isClearable
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: "#CBD5E1", // slate-300
                  boxShadow: state.isFocused ? "0 0 0 1px #CBD5E1" : "none",
                  "&:hover": { borderColor: "#CBD5E1" },
                  minHeight: "20px",
                  padding: "0px",
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 4px",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "#2563EB"
                    : base.backgroundColor, // blue on hover
                  color: state.isFocused ? "white" : "black",
                }),
              }}
            />
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium mb-1">Instructor</label>
            <Select
              value={
                formData.instructor_id
                  ? instructors
                      .map((i) => ({
                        value: i.user_id,
                        label: `${i.first_name} ${i.last_name}`,
                      }))
                      .find((o) => o.value === formData.instructor_id)
                  : null
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  instructor_id: selected ? selected.value : null,
                }))
              }
              options={instructors.map((i) => ({
                value: i.user_id,
                label: `${i.first_name} ${i.last_name}`,
              }))}
              placeholder="Select instructor..."
              isClearable
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: "#CBD5E1", // slate-300
                  boxShadow: state.isFocused ? "0 0 0 1px #CBD5E1" : "none",
                  "&:hover": { borderColor: "#CBD5E1" },
                  minHeight: "20px",
                  padding: "0px",
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 4px",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "#2563EB"
                    : base.backgroundColor, // blue on hover
                  color: state.isFocused ? "white" : "black",
                }),
              }}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-1 rounded-md border border-slate-300"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              {mode === "add" ? "Add" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- Course View Modal ---
const CourseViewModal = ({ isOpen, onClose, course }) => {
  if (!isOpen || !course) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-100 rounded-full p-4 mb-3">
            <BookOpenText className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
          <p className="text-sm text-gray-600">{course.code}</p>
        </div>

        {/* Course Details */}
        <div className="flex flex-col gap-4 border p-4 rounded-lg bg-gray-50">
          {/* Department */}
          <div>
            <span className="font-semibold text-gray-700">Department:</span>
            <p className="text-gray-900 mt-1">
              {course.department_name || "N/A"}
            </p>
          </div>

          {/* Instructor */}
          <div>
            <span className="font-semibold text-gray-700">Instructor:</span>
            <p className="text-gray-900 mt-1">
              {course.instructor_name || "N/A"}
            </p>
          </div>

          {/* Units */}
          <div>
            <span className="font-semibold text-gray-700">Units:</span>
            <p className="text-gray-900 mt-1">{course.units}</p>
          </div>

          {/* Status */}
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <div className="mt-1">
              <StatusBadge status={course.status} />
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="font-semibold text-gray-700">Description:</span>
            <p className="text-gray-900 mt-1">
              {course.description || "No description"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Fetch data
  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/course/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dept/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/dept/departments/eligible-heads"
      );
      setInstructors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchInstructors();
  }, []);

  // Filter & paginate
  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (c.code || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.title || "").toLowerCase().includes(search.toLowerCase())
      ),
    [courses, search]
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const displayed = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Export
  const exportCSV = (data) => {
    const csv = [
      ["ID", "Code", "Title", "Department", "Instructor", "Units"],
      ...data.map((c) => [
        c.course_id,
        c.code,
        c.title,
        c.department_name,
        c.instructor_name || "N/A",
        c.units,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "courses.csv");
  };

  const exportPDF = (data) => {
    const doc = new jsPDF();
    doc.text("Courses", 14, 16);
    doc.autoTable({
      head: [["ID", "Code", "Title", "Department", "Instructor", "Units"]],
      body: data.map((c) => [
        c.course_id,
        c.code,
        c.title,
        c.department_name,
        c.instructor_name || "N/A",
        c.units,
      ]),
      startY: 20,
    });
    doc.save("courses.pdf");
  };

  // CRUD
  const handleSubmit = async (data) => {
    try {
      let res;
      if (modalMode === "add") {
        res = await axios.post(
          "http://localhost:5000/api/course/courses",
          data
        );
        setCourses((prev) => [...prev, res.data]);
      } else {
        res = await axios.put(
          `http://localhost:5000/api/course/courses/${data.id}`,
          data
        );
        setCourses((prev) =>
          prev.map((c) =>
            c.id === data.id
              ? {
                  ...c, // keep department_name, instructor_name
                  ...data, // update code, title, units, status, etc.
                }
              : c
          )
        );
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/course/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.course_id !== id));
    } catch (err) {
      console.error(err);
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
          <BookOpenText size={24} /> Course Management
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage all courses, their departments, instructors, and status here.
          You can add, edit, view, or export course records.
        </p>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-2 py-1 border border-slate-400 rounded-md w-full sm:w-1/3 focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => exportCSV(filtered)}
            className="p-2 border rounded-md text-sm border-slate-400 hover:bg-gray-100 transition"
            title="Export CSV"
          >
            <FileArchive size={16} />
          </button>
          <button
            onClick={() => exportPDF(filtered)}
            className="p-2 border rounded-md text-sm border-slate-400 hover:bg-gray-100 transition"
            title="Export PDF"
          >
            <File size={16} />
          </button>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={16} /> Course
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold">ID</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Code
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Title
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Department
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
                Instructor
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold">
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
          <tbody className="bg-white divide-y divide-slate-200">
            {displayed.length ? (
              displayed.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 text-sm">{c.id}</td>
                  <td className="px-3 py-2 text-sm">{c.code}</td>
                  <td className="px-3 py-2 text-sm">{c.title}</td>
                  <td className="px-3 py-2 text-sm">{c.department_name}</td>
                  <td className="px-3 py-2 text-sm">
                    {c.instructor_name || "N/A"}
                  </td>

                  <td className="px-3 py-2 text-sm">{c.units}</td>
                  <td className="px-3 py-2 text-sm">
                    {" "}
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-3 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setViewCourse(c);
                        setViewModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => openModal("edit", c)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr key="no-courses">
                <td
                  colSpan={7}
                  className="text-center py-4 text-slate-500 italic"
                >
                  No courses found.
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

      {/* Modal */}
      <CourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={currentRecord}
        departments={departments}
        instructors={instructors}
      />
      <CourseViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        course={viewCourse}
      />
    </div>
  );
};

export default CourseManagement;
