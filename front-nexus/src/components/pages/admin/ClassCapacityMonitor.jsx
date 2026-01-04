import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Users,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ClassCapacityMonitor = () => {
  const [sections, setSections] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState(null);
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    fetchSections();
    fetchPeriods();
    fetchCourses();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sections");
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
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

  const getCapacityPercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  const getCapacityStatus = (current, max) => {
    const percentage = getCapacityPercentage(current, max);
    if (percentage >= 100) return "full";
    if (percentage >= 80) return "near-full";
    if (percentage >= 50) return "moderate";
    return "low";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "full":
        return "#e74c3c";
      case "near-full":
        return "#f39c12";
      case "moderate":
        return "#3498db";
      case "low":
        return "#27ae60";
      default:
        return "#95a5a6";
    }
  };

  // Filter sections
  const filteredSections = sections.filter((section) => {
    const matchesPeriod =
      !filterPeriod || section.period_id === filterPeriod.value;
    const matchesCourse =
      !filterCourse || section.course_id === filterCourse.value;

    let matchesStatus = true;
    if (filterStatus) {
      const status = getCapacityStatus(
        section.current_enrolled,
        section.max_capacity
      );
      matchesStatus = status === filterStatus.value;
    }

    return matchesPeriod && matchesCourse && matchesStatus;
  });

  // Calculate statistics
  const totalSections = filteredSections.length;
  const fullSections = filteredSections.filter(
    (s) => getCapacityStatus(s.current_enrolled, s.max_capacity) === "full"
  ).length;
  const nearFullSections = filteredSections.filter(
    (s) => getCapacityStatus(s.current_enrolled, s.max_capacity) === "near-full"
  ).length;
  const totalCapacity = filteredSections.reduce(
    (sum, s) => sum + s.max_capacity,
    0
  );
  const totalEnrolled = filteredSections.reduce(
    (sum, s) => sum + s.current_enrolled,
    0
  );
  const overallUtilization =
    totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  const periodOptions = periods.map((period) => ({
    value: period.period_id,
    label: `${period.period_name} ${period.year}`,
  }));

  const courseOptions = courses.map((course) => ({
    value: course.course_id,
    label: `${course.course_code} - ${course.course_title}`,
  }));

  const statusFilterOptions = [
    { value: "full", label: "Full (100%)" },
    { value: "near-full", label: "Near Full (80-99%)" },
    { value: "moderate", label: "Moderate (50-79%)" },
    { value: "low", label: "Available (<50%)" },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Class Capacity Monitor
          </h1>
          <p className="text-gray-600">
            Real-time monitoring of class enrollment and capacity utilization
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Total Sections
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalSections}
                </p>
              </div>
              <BookOpen className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Total Enrolled
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalEnrolled}
                </p>
              </div>
              <Users className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Total Capacity
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalCapacity}
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {overallUtilization}%
                </p>
              </div>
              <Clock className="text-orange-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Full Sections
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {fullSections}
                </p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Near Full</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {nearFullSections}
                </p>
              </div>
              <TrendingUp className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Period
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                options={statusFilterOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Filter by Status"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => {
              const status = getCapacityStatus(
                section.current_enrolled,
                section.max_capacity
              );
              const percentage = getCapacityPercentage(
                section.current_enrolled,
                section.max_capacity
              );
              const statusColor = getStatusColor(status);

              const borderColorClass =
                status === "full"
                  ? "border-l-red-500"
                  : status === "near-full"
                  ? "border-l-yellow-500"
                  : status === "moderate"
                  ? "border-l-blue-500"
                  : "border-l-green-500";

              return (
                <div
                  key={section.section_id}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColorClass} hover:shadow-lg transition-shadow`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {section.course_code} - {section.section_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {section.course_title}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: statusColor }}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Users size={14} />
                        Enrolled
                      </span>
                      <span className="font-bold text-gray-900">
                        {section.current_enrolled} / {section.max_capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: statusColor,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">Period:</span>{" "}
                      {section.period_name} {section.year}
                    </div>
                    {section.room && (
                      <div>
                        <span className="font-semibold">Room:</span>{" "}
                        {section.room}
                      </div>
                    )}
                    {section.schedule_day && (
                      <div>
                        <span className="font-semibold">Schedule:</span>{" "}
                        {section.schedule_day} {section.schedule_time_start} -{" "}
                        {section.schedule_time_end}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {status === "full" && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={16} />
                        <span className="text-xs font-medium">
                          Section is full
                        </span>
                      </div>
                    )}
                    {status === "near-full" && (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <TrendingUp size={16} />
                        <span className="text-xs font-medium">Almost full</span>
                      </div>
                    )}
                    {status === "low" && (
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingDown size={16} />
                        <span className="text-xs font-medium">
                          Seats available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No sections found</p>
              <p className="text-gray-400 text-sm">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassCapacityMonitor;
