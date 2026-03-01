import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  BookOpen,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const colors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    full: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        colors[status] || colors.active
      }`}
    >
      {status?.toUpperCase()}
    </span>
  );
};

const Pagination = ({ currentPage, totalPages, setPage, totalItems }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700">
    <span className="text-xs sm:text-sm">
      Page {currentPage} of {totalPages} | Total Records: {totalItems}
    </span>
    <div className="flex gap-1 items-center mt-2 sm:mt-0">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="p-1.5 rounded-md border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-2 py-1 text-xs font-semibold text-indigo-600">
        {currentPage}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="p-1.5 rounded-md border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

const SubjectSections = () => {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    course_id: "",
    period_id: "",
    section_name: "",
    room: "",
    max_capacity: 40,
    schedule_day: "",
    schedule_time_start: "",
    schedule_time_end: "",
    status: "active",
  });
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  useEffect(() => {
    fetchSections();
    fetchCourses();
    fetchPeriods();
  }, []);
  const fetchSections = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sections");
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };
  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/course/courses",
      );
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  const fetchPeriods = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/academic-periods",
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/sections/${currentSection.section_id}`,
          formData,
        );
      } else {
        await axios.post("http://localhost:5000/api/sections", formData);
      }
      fetchSections();
      closeModal();
    } catch (error) {
      console.error("Error saving section:", error);
      alert(error.response?.data?.error || "Error saving section");
    }
  };
  const handleEdit = (section) => {
    setCurrentSection(section);
    setFormData({
      course_id: section.course_id,
      period_id: section.period_id,
      section_name: section.section_name,
      room: section.room,
      max_capacity: section.max_capacity,
      schedule_day: section.schedule_day,
      schedule_time_start: section.schedule_time_start,
      schedule_time_end: section.schedule_time_end,
      status: section.status,
    });
    setEditMode(true);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        await axios.delete(`http://localhost:5000/api/sections/${id}`);
        fetchSections();
      } catch (error) {
        console.error("Error deleting section:", error);
        alert(error.response?.data?.error || "Error deleting section");
      }
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentSection(null);
    setFormData({
      course_id: "",
      period_id: "",
      section_name: "",
      room: "",
      max_capacity: 40,
      schedule_day: "",
      schedule_time_start: "",
      schedule_time_end: "",
      status: "active",
    });
  };
  // Filter sections
  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.section_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.room?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      !filterCourse || section.course_id === filterCourse.value;
    const matchesPeriod =
      !filterPeriod || section.period_id === filterPeriod.value;
    return matchesSearch && matchesCourse && matchesPeriod;
  });
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSections.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const courseOptions = courses.map((course) => ({
    value: course.id,
    label: `${course.code} - ${course.title}`,
  }));
  const periodOptions = periods.map((period) => ({
    value: period.id,
    label: `${period.semester} ${period.school_year}`,
  }));
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "full", label: "Full" },
  ];
  // Calculate statistics
  const totalSections = sections.length;
  const activeSections = sections.filter((s) => s.status === "active").length;
  const fullSections = sections.filter(
    (s) => s.current_enrolled >= s.max_capacity,
  ).length;
  const totalStudents = sections.reduce(
    (sum, s) => sum + (s.current_enrolled || 0),
    0,
  );
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subject & Sections Management
          </h1>
          <p className="text-gray-600">
            Manage course sections, schedules, and enrollment capacity
          </p>
        </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Sections
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalSections}
                </p>
              </div>
              <BookOpen className="text-blue-500" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Sections
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {activeSections}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Full Sections
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {fullSections}
                </p>
              </div>
              <AlertCircle className="text-red-500" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalStudents}
                </p>
              </div>
              <Users className="text-purple-500" size={40} />
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="space-y-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input - LEFT */}
            <div className="relative flex-grow max-w-xs">
              <input
                type="text"
                placeholder="Search by section, course, or room..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all shadow-inner"
              />
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
            </div>
            {/* Filter & Action Buttons - RIGHT */}
            <div className="flex items-center gap-2">
              <div className="w-48">
                <Select
                  options={courseOptions}
                  value={filterCourse}
                  onChange={(option) => {
                    setFilterCourse(option);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter by Course"
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
              <div className="w-48">
                <Select
                  options={periodOptions}
                  value={filterPeriod}
                  onChange={(option) => {
                    setFilterPeriod(option);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter by Period"
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors text-sm border shadow-sm whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700 shadow-md shadow-indigo-500/30"
              >
                <Plus size={14} />
                New Section
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  <th className="px-4 py-2.5">Section</th>
                  <th className="px-4 py-2.5">Course</th>
                  <th className="px-4 py-2.5">Period</th>
                  <th className="px-4 py-2.5">Room</th>
                  <th className="px-4 py-2.5">Capacity</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentItems.length > 0 ? (
                  currentItems.map((section) => {
                    const capacityPercentage =
                      (section.current_enrolled / section.max_capacity) * 100;
                    return (
                      <tr
                        key={section.section_id}
                        className="text-sm text-slate-700 hover:bg-indigo-50/50 transition duration-150"
                      >
                        <td className="px-4 py-2">
                          <div className="font-semibold">
                            {section.section_name}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium">
                            {section.course_code}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {section.course_title}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {section.semester} {section.school_year}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-slate-400" />
                            {section.room || "N/A"}
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-slate-400" />
                              <span className="font-semibold">
                                {section.current_enrolled}/
                                {section.max_capacity}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  capacityPercentage >= 100
                                    ? "bg-red-500"
                                    : capacityPercentage >= 80
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(capacityPercentage, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge status={section.status} />
                        </td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(section)}
                            title="Edit"
                            className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded-full hover:bg-slate-200"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(section.section_id)}
                            title="Delete"
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-slate-200"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-4 text-center text-slate-500 italic"
                    >
                      No sections found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setPage={setCurrentPage}
            totalItems={filteredSections.length}
          />
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editMode ? "Edit Section" : "Add New Section"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                {/* Course Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-500" />
                    Course Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course <span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={courseOptions}
                        value={courseOptions.find(
                          (o) => o.value === formData.course_id,
                        )}
                        onChange={(option) =>
                          handleSelectChange(option, "course_id")
                        }
                        placeholder="Select Course"
                        required
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Period <span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={periodOptions}
                        value={periodOptions.find(
                          (o) => o.value === formData.period_id,
                        )}
                        onChange={(option) =>
                          handleSelectChange(option, "period_id")
                        }
                        placeholder="Select Period"
                        required
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                  </div>
                </div>
                {/* Section Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-green-500" />
                    Section Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="section_name"
                        value={formData.section_name}
                        onChange={handleInputChange}
                        placeholder="e.g., A, B, 1A, etc."
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="max_capacity"
                        value={formData.max_capacity}
                        onChange={handleInputChange}
                        min="1"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room
                      </label>
                      <input
                        type="text"
                        name="room"
                        value={formData.room}
                        onChange={handleInputChange}
                        placeholder="e.g., Room 301"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <Select
                        options={statusOptions}
                        value={statusOptions.find(
                          (o) => o.value === formData.status,
                        )}
                        onChange={(option) =>
                          handleSelectChange(option, "status")
                        }
                        placeholder="Select Status"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editMode ? "Update Section" : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectSections;
