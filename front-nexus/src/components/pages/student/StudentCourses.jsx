import { useState, useEffect } from "react";
import axios from "axios";
import {
  BookOpen,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  AlertCircle,
  Info,
  Download,
  Printer,
  FileText,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Map day abbreviations to full day names
const parseDayAbbreviations = (dayString) => {
  if (!dayString) return [];

  const dayMap = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    TH: "Thursday",
    F: "Friday",
    S: "Saturday",
  };

  const days = [];
  let i = 0;
  while (i < dayString.length) {
    if (dayString.substring(i, i + 2) === "TH") {
      days.push(dayMap["TH"]);
      i += 2;
    } else {
      const char = dayString[i];
      if (dayMap[char]) {
        days.push(dayMap[char]);
      }
      i += 1;
    }
  }

  return days;
};

const StudentCourses = () => {
  const [activeTab, setActiveTab] = useState("enlistment");

  // Enlistment state
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filterYear, setFilterYear] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");

  // Timetable state
  const [timetable, setTimetable] = useState([]);
  const [selectedDay, setSelectedDay] = useState("all");

  useEffect(() => {
    if (activeTab === "enlistment") {
      fetchEnlistmentData();
      fetchEnrollmentStatus();
    } else {
      fetchTimetable();
    }
  }, [activeTab]);

  const fetchEnrollmentStatus = async () => {
    try {
      const studentId = localStorage.getItem("userId");
      if (!studentId) return;
      const response = await axios.get(
        `${API_BASE}/api/enrollments/student/${studentId}`,
      );
      const enrollments = response.data || [];
      setEnrollmentStatus({
        isOpen: true,
        message: "Enrollment is currently open",
        maxUnits: 24,
        currentUnits: enrollments.reduce((sum, e) => sum + (e.units || 0), 0),
      });
    } catch (error) {
      console.error("Error fetching enrollment status:", error);
    }
  };

  const fetchEnlistmentData = async () => {
    try {
      const studentId = localStorage.getItem("userId");
      if (!studentId) return;
      const [coursesRes, enrolledRes] = await Promise.all([
        axios.get(`${API_BASE}/api/course/courses`),
        axios.get(`${API_BASE}/api/enrollments/student/${studentId}`),
      ]);
      const courses = coursesRes.data || [];
      const enrolled = enrolledRes.data || [];
      setAvailableSubjects(
        courses.map((c) => ({
          subject_id: c.course_id || c.id,
          subject_code: c.code || c.course_code,
          subject_name: c.title || c.course_name,
          units: c.units || 3,
          schedule: c.schedule || "TBA",
          instructor: c.instructor_name || "TBA",
          capacity: c.capacity || 40,
          enrolled: c.enrolled_count || 0,
          year_level: c.year_level,
          semester: c.semester,
          prerequisites: c.prerequisites,
        })),
      );
      setEnrolledSubjects(
        enrolled.map((e) => ({
          enrollment_id: e.enrollment_id,
          subject_id: e.course_id,
          subject_code: e.course_code,
          subject_name: e.course_title,
          units: e.units || 3,
          schedule: e.schedule || "TBA",
          instructor: e.instructor_name || "TBA",
        })),
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchTimetable = async () => {
    try {
      const studentId = localStorage.getItem("userId");
      if (!studentId) return;

      console.log("📅 Fetching timetable for student:", studentId);

      // Fetch student enrollments with schedule data
      const response = await axios.get(
        `${API_BASE}/api/enrollments/student/${studentId}`,
      );

      const enrollments = response.data || [];
      console.log("✅ Fetched enrollments:", enrollments);

      const scheduleData = [];

      enrollments.forEach((enrollment) => {
        // Use combined schedule fields (from sections or faculty assignments)
        const scheduleDay =
          enrollment.final_schedule_day || enrollment.schedule_day;
        const scheduleStart =
          enrollment.final_schedule_time_start ||
          enrollment.schedule_time_start;
        const scheduleEnd =
          enrollment.final_schedule_time_end || enrollment.schedule_time_end;

        console.log(
          `📚 ${enrollment.course_code}: Day=${scheduleDay}, Time=${scheduleStart}-${scheduleEnd}`,
        );

        if (scheduleDay && scheduleStart && scheduleEnd) {
          // Parse day abbreviations and create entries for each day
          const days = parseDayAbbreviations(scheduleDay);
          days.forEach((day) => {
            scheduleData.push({
              day: day,
              subject_name: enrollment.course_title,
              subject_code: enrollment.course_code,
              start_time: scheduleStart,
              end_time: scheduleEnd,
              room: enrollment.room || "TBA",
              instructor: enrollment.instructor_name || "TBA",
            });
          });
        } else {
          console.log(
            `⚠️ No schedule for ${enrollment.course_code}, using Monday fallback`,
          );
          // Fallback: add to Monday with TBA time
          scheduleData.push({
            day: "Monday",
            subject_name: enrollment.course_title,
            subject_code: enrollment.course_code,
            start_time: "TBA",
            end_time: "TBA",
            room: enrollment.room || "TBA",
            instructor: enrollment.instructor_name || "TBA",
          });
        }
      });

      console.log(
        `✅ Total schedule entries: ${scheduleData.length}`,
        scheduleData,
      );
      setTimetable(scheduleData);
    } catch (error) {
      console.error("❌ Error fetching timetable:", error);
      setTimetable([]);
    }
  };

  const handleEnlist = async (subject) => {
    setSelectedSubject(subject);
    setShowConfirmModal(true);
  };

  const confirmEnlist = async () => {
    try {
      await axios.post(`${API_BASE}/api/enrollments`, {
        course_id: selectedSubject.subject_id,
      });
      fetchEnlistmentData();
      fetchEnrollmentStatus();
      setShowConfirmModal(false);
      setSelectedSubject(null);
    } catch (error) {
      console.error("Error enlisting:", error);
    }
  };

  const handleDrop = async (enrollmentId) => {
    if (!confirm("Are you sure you want to drop this subject?")) return;

    try {
      await axios.delete(`${API_BASE}/api/enrollments/${enrollmentId}`);
      fetchEnlistmentData();
      fetchEnrollmentStatus();
    } catch (error) {
      console.error("Error dropping:", error);
    }
  };

  const handlePrintEnrollment = () => {
    window.print();
  };

  const handleDownloadEnrollment = () => {
    console.log("Downloading enrollment form...");
  };

  const filteredSubjects = availableSubjects.filter(
    (subject) =>
      subject.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const currentSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const groupedByDay = days.reduce((acc, day) => {
    acc[day] = timetable
      .filter((t) => t.day === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {});

  const tabs = [
    { id: "enlistment", label: "Subject Enlistment", icon: BookOpen },
    { id: "timetable", label: "Timetable", icon: Calendar },
  ];

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={24} className="text-indigo-600" />
            My Courses
          </h2>
          {activeTab === "enlistment" && (
            <div className="flex gap-2">
              <button
                onClick={handlePrintEnrollment}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors"
              >
                <Printer size={14} />
                Print
              </button>
              <button
                onClick={handleDownloadEnrollment}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "enlistment" ? (
          // Subject Enlistment Tab
          <div className="space-y-4">
            {/* Enrollment Status Banner */}
            {enrollmentStatus && (
              <div
                className={`rounded-lg p-4 border ${
                  enrollmentStatus.isOpen
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  {enrollmentStatus.isOpen ? (
                    <CheckCircle size={20} className="text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-amber-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                      {enrollmentStatus.isOpen
                        ? "Enrollment Period Active"
                        : "Enrollment Period Closed"}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {enrollmentStatus.message ||
                        "Check with the registrar for enrollment schedules"}
                    </p>
                    {enrollmentStatus.deadline && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Deadline:{" "}
                        {new Date(
                          enrollmentStatus.deadline,
                        ).toLocaleDateString()}
                      </p>
                    )}
                    {enrollmentStatus.maxUnits && (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Units:{" "}
                          {enrolledSubjects.reduce(
                            (sum, s) => sum + (s.units || 0),
                            0,
                          )}{" "}
                          / {enrollmentStatus.maxUnits}
                        </span>
                        <div className="flex-1 max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min((enrolledSubjects.reduce((sum, s) => sum + (s.units || 0), 0) / enrollmentStatus.maxUnits) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enrolled Subjects Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-5 text-white shadow-lg">
                <p className="text-xs font-medium text-indigo-100 uppercase mb-1">
                  Enrolled Subjects
                </p>
                <p className="text-3xl font-bold">{enrolledSubjects.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
                <p className="text-xs font-medium text-green-100 uppercase mb-1">
                  Total Units
                </p>
                <p className="text-3xl font-bold">
                  {enrolledSubjects.reduce((sum, s) => sum + (s.units || 0), 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
                <p className="text-xs font-medium text-blue-100 uppercase mb-1">
                  Available Subjects
                </p>
                <p className="text-3xl font-bold">{availableSubjects.length}</p>
              </div>
            </div>

            {/* Enrolled Subjects Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Currently Enrolled
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {enrolledSubjects.length} subject
                  {enrolledSubjects.length !== 1 ? "s" : ""}
                </span>
              </div>
              {enrolledSubjects.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-10">
                  No subjects enrolled yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50 text-left">
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 w-8">
                          #
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                          Subject Name
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                          Code
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-center">
                          Units
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                          Schedule
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                          Instructor
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-center">
                          Status
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {enrolledSubjects.map((subject, index) => (
                        <tr
                          key={subject.enrollment_id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                            {subject.subject_name}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                            {subject.subject_code}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                            {subject.units}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {subject.schedule || "TBA"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {subject.instructor || "TBA"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              <CheckCircle size={11} />
                              Enrolled
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDrop(subject.enrollment_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                            >
                              Drop
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right"
                        >
                          Total Units:
                        </td>
                        <td className="px-4 py-2 text-center font-bold text-slate-900 dark:text-white">
                          {enrolledSubjects.reduce(
                            (sum, s) => sum + (s.units || 0),
                            0,
                          )}
                        </td>
                        <td colSpan={4} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Timetable Tab with Day Selection
          <div className="space-y-4">
            {/* Day Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedDay === day
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Selected Day Table View */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar size={18} />
                  {selectedDay}
                </h3>
              </div>

              {groupedByDay[selectedDay]?.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    No classes scheduled
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          Subject
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          Room
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          Instructor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {groupedByDay[selectedDay]?.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {item.start_time?.substring(0, 5)}
                              </div>
                              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                {item.start_time} - {item.end_time}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {item.subject_name}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                              {item.subject_code}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <MapPin
                                size={14}
                                className="text-indigo-600 flex-shrink-0"
                              />
                              {item.room}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {item.instructor}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && selectedSubject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2">
                  <FileText size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Confirm Enrollment
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Review the subject details before enrolling
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4 space-y-2">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Subject Name
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedSubject.subject_name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Subject Code
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedSubject.subject_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Units
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedSubject.units}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Schedule
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedSubject.schedule}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instructor
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedSubject.instructor}
                  </p>
                </div>
                {selectedSubject.prerequisites &&
                  selectedSubject.prerequisites.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Prerequisites Required
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSubject.prerequisites.map((prereq, index) => (
                          <span
                            key={index}
                            className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded"
                          >
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {enrollmentStatus && !enrollmentStatus.isOpen && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Enrollment period is currently closed. Contact the
                      registrar for assistance.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedSubject(null);
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEnlist}
                  disabled={enrollmentStatus && !enrollmentStatus.isOpen}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Confirm Enlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;
