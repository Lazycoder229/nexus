import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  FileText,
  Download,
  Upload,
  BookOpen,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SyllabusRepository = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [courses, setCourses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSyllabus, setCurrentSyllabus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    course_id: "",
    period_id: "",
    file_name: "",
    file_path: "",
    file_type: "",
    file_size: 0,
    description: "",
    uploaded_by: "",
  });

  useEffect(() => {
    fetchSyllabi();
    fetchCourses();
    fetchPeriods();

    // Get current user
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData((prev) => ({ ...prev, uploaded_by: user.user_id }));
    }
  }, []);

  const fetchSyllabi = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/syllabus");
      setSyllabi(response.data);
    } catch (error) {
      console.error("Error fetching syllabi:", error);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOption, field) => {
    setFormData({ ...formData, [field]: selectedOption?.value || "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real implementation, you would upload this to a server
      // For now, we'll simulate with local file info
      setFormData({
        ...formData,
        file_name: file.name,
        file_path: `/uploads/syllabus/${file.name}`, // Simulated path
        file_type: file.type,
        file_size: file.size,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/syllabus/${currentSyllabus.syllabus_id}`,
          formData
        );
      } else {
        await axios.post("http://localhost:5000/api/syllabus", formData);
      }
      fetchSyllabi();
      closeModal();
    } catch (error) {
      console.error("Error saving syllabus:", error);
      alert(error.response?.data?.error || "Error saving syllabus");
    }
  };

  const handleEdit = (syllabus) => {
    setCurrentSyllabus(syllabus);
    setFormData({
      course_id: syllabus.course_id,
      period_id: syllabus.period_id || "",
      file_name: syllabus.file_name,
      file_path: syllabus.file_path,
      file_type: syllabus.file_type || "",
      file_size: syllabus.file_size || 0,
      description: syllabus.description || "",
      uploaded_by: syllabus.uploaded_by,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this syllabus?")) {
      try {
        await axios.delete(`http://localhost:5000/api/syllabus/${id}`);
        fetchSyllabi();
      } catch (error) {
        console.error("Error deleting syllabus:", error);
        alert(error.response?.data?.error || "Error deleting syllabus");
      }
    }
  };

  const handleDownload = (syllabus) => {
    // In a real implementation, this would download the actual file
    alert(`Downloading: ${syllabus.file_name}`);
    // window.open(syllabus.file_path, '_blank');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentSyllabus(null);
    const user = JSON.parse(localStorage.getItem("user"));
    setFormData({
      course_id: "",
      period_id: "",
      file_name: "",
      file_path: "",
      file_type: "",
      file_size: 0,
      description: "",
      uploaded_by: user?.user_id || "",
    });
  };

  // Filter syllabi
  const filteredSyllabi = syllabi.filter((syllabus) => {
    const matchesSearch =
      syllabus.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      syllabus.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      syllabus.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      syllabus.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      !filterCourse || syllabus.course_id === filterCourse.value;
    const matchesPeriod =
      !filterPeriod || syllabus.period_id === filterPeriod.value;

    return matchesSearch && matchesCourse && matchesPeriod;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSyllabi.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSyllabi.length / itemsPerPage);

  const courseOptions = courses.map((course) => ({
    value: course.course_id,
    label: `${course.course_code} - ${course.course_title}`,
  }));

  const periodOptions = periods.map((period) => ({
    value: period.period_id,
    label: `${period.period_name} ${period.year}`,
  }));

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper Components
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
  const totalFiles = syllabi.length;
  const totalSize = syllabi.reduce((sum, s) => sum + (s.file_size || 0), 0);
  const recentUploads = syllabi.filter((s) => {
    const uploadDate = new Date(s.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return uploadDate >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Syllabus Repository
          </h1>
          <p className="text-gray-600">
            Centralized repository for course syllabi and materials
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalFiles}
                </p>
              </div>
              <FileText className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Storage
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatFileSize(totalSize)}
                </p>
              </div>
              <BookOpen className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Recent Uploads (7d)
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {recentUploads}
                </p>
              </div>
              <Clock className="text-purple-500" size={40} />
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
                  placeholder="Search syllabus files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter by Course */}
              <div className="w-full lg:w-64">
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

              {/* Filter by Period */}
              <div className="w-full lg:w-64">
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

              {/* Upload Button */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <Upload size={20} />
                Upload Syllabus
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((syllabus) => (
                    <tr
                      key={syllabus.syllabus_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="text-blue-500" size={24} />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {syllabus.file_name}
                            </div>
                            {syllabus.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {syllabus.description.substring(0, 60)}
                                {syllabus.description.length > 60 && "..."}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {syllabus.course_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {syllabus.course_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {syllabus.period_name
                          ? `${syllabus.period_name} ${syllabus.year}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatFileSize(syllabus.file_size)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Users size={14} className="text-gray-400" />
                          {syllabus.first_name} {syllabus.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Clock size={14} className="text-gray-400" />
                          {formatDate(syllabus.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownload(syllabus)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(syllabus)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(syllabus.syllabus_id)}
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
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={48} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          No syllabus files found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Upload your first syllabus to get started
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
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h2>{editMode ? "Edit Syllabus" : "Upload New Syllabus"}</h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
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
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Academic Period</label>
                  <Select
                    options={periodOptions}
                    value={periodOptions.find(
                      (o) => o.value === formData.period_id
                    )}
                    onChange={(option) =>
                      handleSelectChange(option, "period_id")
                    }
                    placeholder="Select Period (Optional)"
                    isClearable
                  />
                </div>

                {!editMode && (
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>
                      Upload File <span className="required">*</span>
                    </label>
                    <div
                      style={{
                        border: "2px dashed #bdc3c7",
                        borderRadius: "8px",
                        padding: "30px",
                        textAlign: "center",
                        background: "#ecf0f1",
                      }}
                    >
                      <Upload
                        size={40}
                        color="#7f8c8d"
                        style={{ margin: "0 auto" }}
                      />
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        style={{ marginTop: "10px" }}
                        required={!editMode}
                      />
                      <p style={{ margin: "10px 0 0", color: "#7f8c8d" }}>
                        Accepted formats: PDF, DOC, DOCX
                      </p>
                    </div>
                    {formData.file_name && (
                      <div style={{ marginTop: "10px", color: "#27ae60" }}>
                        <FileText size={16} /> Selected: {formData.file_name}
                      </div>
                    )}
                  </div>
                )}

                {editMode && (
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Current File</label>
                    <div
                      style={{
                        padding: "10px",
                        background: "#ecf0f1",
                        borderRadius: "4px",
                      }}
                    >
                      <FileText size={16} /> {formData.file_name} (
                      {formatFileSize(formData.file_size)})
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Brief description of the syllabus content..."
                    style={{ resize: "vertical" }}
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
                  {editMode ? "Update Syllabus" : "Upload Syllabus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyllabusRepository;
