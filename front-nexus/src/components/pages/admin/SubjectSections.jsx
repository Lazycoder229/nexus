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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/sections/${currentSection.section_id}`,
          formData
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
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);

  const courseOptions = courses.map((course) => ({
    value: course.course_id,
    label: `${course.course_code} - ${course.course_title}`,
  }));

  const periodOptions = periods.map((period) => ({
    value: period.period_id,
    label: `${period.period_name} ${period.year}`,
  }));

  const dayOptions = daysOfWeek.map((day) => ({ value: day, label: day }));

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "full", label: "Full" },
  ];

  // Calculate statistics
  const totalSections = sections.length;
  const activeSections = sections.filter((s) => s.status === "active").length;
  const fullSections = sections.filter(
    (s) => s.current_enrolled >= s.max_capacity
  ).length;
  const totalStudents = sections.reduce(
    (sum, s) => sum + (s.current_enrolled || 0),
    0
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
                  placeholder="Search by section, course code, course title, or room..."
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

              {/* Add Button */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <Plus size={20} />
                Add Section
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((section) => {
                    const capacityPercentage =
                      (section.current_enrolled / section.max_capacity) * 100;
                    return (
                      <tr
                        key={section.section_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {section.section_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {section.course_code}
                            </div>
                            <div className="text-gray-500">
                              {section.course_title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {section.period_name} {section.year}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <MapPin size={16} className="text-gray-400" />
                            {section.room || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {section.schedule_day &&
                          section.schedule_time_start ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {section.schedule_day}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock size={14} />
                                {section.schedule_time_start} -{" "}
                                {section.schedule_time_end}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Not set
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Users size={16} className="text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                {section.current_enrolled}/
                                {section.max_capacity}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  capacityPercentage >= 100
                                    ? "bg-red-500"
                                    : capacityPercentage >= 80
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    capacityPercentage,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={section.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(section)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(section.section_id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen size={48} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          No sections found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your search or filters
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                          (o) => o.value === formData.course_id
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
                          (o) => o.value === formData.period_id
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
                          (o) => o.value === formData.status
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

                {/* Schedule Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-purple-500" />
                    Schedule Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule Day
                      </label>
                      <Select
                        options={dayOptions}
                        value={dayOptions.find(
                          (o) => o.value === formData.schedule_day
                        )}
                        onChange={(option) =>
                          handleSelectChange(option, "schedule_day")
                        }
                        placeholder="Select Day"
                        isClearable
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="schedule_time_start"
                        value={formData.schedule_time_start}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="schedule_time_end"
                        value={formData.schedule_time_end}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
