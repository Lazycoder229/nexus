import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BookOpen,
  Users,
  Calendar,
  Search,
  Filter,
  FileText,
  Download,
  AlertCircle,
  X,
  Clock,
  MapPin,
  GraduationCap,
  Mail,
  Phone,
  User,
  Award,
} from "lucide-react";

const AssignedSubjects = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [semesters, setSemesters] = useState([]);
  const [error, setError] = useState(null);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Get the faculty user ID from your auth context/storage
  const facultyUserId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId");

  // Get API base URL from environment
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (facultyUserId) {
      fetchAssignedCourses();
    } else {
      setError("User ID not found. Please log in again.");
      setLoading(false);
    }
  }, [facultyUserId]);

  const fetchAssignedCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assignments for the logged-in faculty member
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/faculty-assignments/faculty/${facultyUserId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      // Use response.data.data (API returns { success, data })
      const apiData = response.data;
      const coursesArray = Array.isArray(apiData.data) ? apiData.data : [];
      console.log("Fetched courses from API:", coursesArray);
      const transformedCourses = transformAPIData(coursesArray);
      setCourses(transformedCourses);

      // Extract unique semesters for filter
      const uniqueSemesters = [
        ...new Set(
          transformedCourses.map(
            (course) => `${course.semester} ${course.school_year}`,
          ),
        ),
      ];
      setSemesters(uniqueSemesters);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load assigned courses. Please try again.");
      setLoading(false);
    }
  };

  const transformAPIData = (apiData) => {
    // Group assignments by assignment_id to handle multiple schedules
    const groupedData = apiData.reduce((acc, item) => {
      const key = item.assignment_id;

      if (!acc[key]) {
        acc[key] = {
          id: item.assignment_id,
          code: item.course_code,
          name: item.course_title,
          section: item.section,
          room: item.room || "TBA",
          students: item.current_enrolled || 0,
          maxStudents: item.max_students,
          semester: item.semester,
          school_year: item.school_year,
          status: item.assignment_status || "active",
          units: item.units,
          schedules: [],
        };
      }

      // Add schedule if it exists
      if (
        item.schedule_day &&
        item.schedule_time_start &&
        item.schedule_time_end
      ) {
        acc[key].schedules.push({
          day: item.schedule_day,
          timeStart: item.schedule_time_start,
          timeEnd: item.schedule_time_end,
        });
      }

      return acc;
    }, {});

    // Convert grouped data back to array and format schedule display
    return Object.values(groupedData).map((course) => ({
      ...course,
      schedule: formatSchedule(course.schedules),
    }));
  };

  const formatSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) {
      return "Schedule TBA";
    }

    // Group schedules by time to combine days
    const timeGroups = {};
    schedules.forEach((schedule) => {
      const timeKey = `${schedule.timeStart}-${schedule.timeEnd}`;
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = {
          days: [],
          timeStart: schedule.timeStart,
          timeEnd: schedule.timeEnd,
        };
      }
      timeGroups[timeKey].days.push(schedule.day);
    });

    // Format each time group
    return Object.values(timeGroups)
      .map((group) => {
        const days = group.days.join("/");
        const startTime = formatTime(group.timeStart);
        const endTime = formatTime(group.timeEnd);
        return `${days} ${startTime} - ${endTime}`;
      })
      .join(", ");
  };

  const formatTime = (time) => {
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const semesterString = `${course.semester} ${course.school_year}`;
    const matchesSemester =
      filterSemester === "all" || semesterString === filterSemester;
    return matchesSearch && matchesSemester;
  });

  const handleExportList = () => {
    // Create CSV content
    const headers = [
      "Course Code",
      "Course Name",
      "Section",
      "Schedule",
      "Room",
      "Enrolled Students",
      "Max Students",
      "Units",
      "Semester",
      "Status",
    ];
    const rows = filteredCourses.map((course) => [
      course.code,
      course.name,
      course.section,
      course.schedule,
      course.room,
      course.students,
      course.maxStudents,
      course.units,
      `${course.semester} ${course.school_year}`,
      course.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assigned-courses-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  const handleViewStudentList = async (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    setSelectedCourse(course);
    setShowStudentsModal(true);
    await fetchStudentList(courseId);
  };

  const fetchStudentList = async (assignmentId) => {
    try {
      setLoadingStudents(true);
      const token = localStorage.getItem("token");

      // Use the actual API endpoint for fetching students by assignment
      const response = await axios.get(
        `${API_BASE}/api/enrollments/assignment/${assignmentId}/students`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      setStudents(response.data.data || []);
      setLoadingStudents(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
      setLoadingStudents(false);
    }
  };

  const exportStudentList = () => {
    if (!students.length) return;

    const headers = ["Student ID", "Name", "Email", "Phone", "Status"];
    const rows = students.map((student) => [
      student.student_id,
      student.name,
      student.email,
      student.phone || "N/A",
      student.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${selectedCourse?.code}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchAssignedCourses}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-indigo-600" />
          Assigned Subjects & Sections
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage your assigned courses
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by course code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Semesters</option>
              {semesters.map((semester, index) => (
                <option key={index} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportList}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xl font-bold">{course.code}</h3>
                  <p className="text-sm opacity-90">Section {course.section}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.status === "active" ? "bg-green-400" : "bg-gray-400"
                  }`}
                >
                  {course.status.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="font-semibold text-gray-900 text-lg mb-4">
                {course.name}
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                  <span className="break-words">{course.schedule}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                  <span>{course.room}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                  <span>
                    {course.students}/{course.maxStudents} Students Enrolled
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(course.id)}
                    className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleViewStudentList(course.id)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    Student List
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No courses found matching your filters
          </p>
        </div>
      )}

      {/* Course Details Modal */}
      {showDetailsModal && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-white sticky top-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCourse.code}</h2>
                  <p className="text-indigo-100 mt-1">{selectedCourse.name}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                    <span className="text-sm font-medium">Section</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedCourse.section}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Award className="w-5 h-5 mr-2 text-indigo-500" />
                    <span className="text-sm font-medium">Units</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedCourse.units}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                    <span className="text-sm font-medium">Room</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedCourse.room}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Users className="w-5 h-5 mr-2 text-indigo-500" />
                    <span className="text-sm font-medium">Enrollment</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedCourse.students}/{selectedCourse.maxStudents}
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-3">
                  <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                  <span className="font-semibold">Class Schedule</span>
                </div>
                <div className="space-y-2">
                  {selectedCourse.schedules.map((sched, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg flex justify-between items-center"
                    >
                      <span className="font-medium text-gray-900">
                        {sched.day}
                      </span>
                      <span className="text-gray-600">
                        {formatTime(sched.timeStart)} -{" "}
                        {formatTime(sched.timeEnd)}
                      </span>
                    </div>
                  ))}
                  {selectedCourse.schedules.length === 0 && (
                    <p className="text-gray-500 text-center py-2">
                      No schedule available
                    </p>
                  )}
                </div>
              </div>

              {/* Academic Period */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-2">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  <span className="font-semibold">Academic Period</span>
                </div>
                <p className="text-gray-900">
                  {selectedCourse.semester} {selectedCourse.school_year}
                </p>
              </div>

              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-2">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  <span className="font-semibold">Status</span>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedCourse.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedCourse.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student List Modal */}
      {showStudentsModal && selectedCourse && (
        <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white sticky top-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <Users className="w-7 h-7 mr-2" />
                    Student List
                  </h2>
                  <p className="text-green-100 mt-1">
                    {selectedCourse.code} - Section {selectedCourse.section}
                  </p>
                </div>
                <button
                  onClick={() => setShowStudentsModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-blue-600 font-medium">
                    Total Enrolled
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {students.length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-600 font-medium">Capacity</p>
                  <p className="text-2xl font-bold text-green-900">
                    {selectedCourse.maxStudents}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-purple-600 font-medium">
                    Available Slots
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {selectedCourse.maxStudents - students.length}
                  </p>
                </div>
              </div>

              {/* Student Table */}
              {loadingStudents ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading students...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student, index) => (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <GraduationCap className="w-5 h-5 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {student.student_id}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="w-5 h-5 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Mail className="w-5 h-5 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                {student.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Phone className="w-5 h-5 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                {student.phone || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                student.status === "enrolled"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No students enrolled</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {students.length} student(s)
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={exportStudentList}
                  disabled={students.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => setShowStudentsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedSubjects;
