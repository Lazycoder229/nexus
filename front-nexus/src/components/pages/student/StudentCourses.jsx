import { useState, useEffect } from "react";
import { BookOpen, Plus, Search, ChevronLeft, ChevronRight, Calendar, Users, CheckCircle, XCircle, Clock, MapPin, AlertCircle, Info, Download, Printer, FileText, GraduationCap, ArrowRight } from "lucide-react";

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
      const response = await fetch("http://localhost:5000/api/student/enrollment/status");
      const data = await response.json();
      if (data.success) setEnrollmentStatus(data.data);
    } catch (error) {
      console.error("Error fetching enrollment status:", error);
    }
  };

  const fetchEnlistmentData = async () => {
    try {
      const [availableRes, enrolledRes] = await Promise.all([
        fetch("http://localhost:5000/api/student/enlistment/available"),
        fetch("http://localhost:5000/api/student/enlistment/enrolled"),
      ]);
      const [availableData, enrolledData] = await Promise.all([availableRes.json(), enrolledRes.json()]);
      if (availableData.success) setAvailableSubjects(availableData.data);
      if (enrolledData.success) setEnrolledSubjects(enrolledData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchTimetable = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/timetable");
      const data = await response.json();
      if (data.success) setTimetable(data.data);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const handleEnlist = async (subject) => {
    setSelectedSubject(subject);
    setShowConfirmModal(true);
  };

  const confirmEnlist = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/enlistment/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_id: selectedSubject.subject_id }),
      });
      if (response.ok) {
        fetchEnlistmentData();
        fetchEnrollmentStatus();
        setShowConfirmModal(false);
        setSelectedSubject(null);
      }
    } catch (error) {
      console.error("Error enlisting:", error);
    }
  };

  const handleDrop = async (enrollmentId) => {
    if (!confirm("Are you sure you want to drop this subject?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/student/enlistment/${enrollmentId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchEnlistmentData();
        fetchEnrollmentStatus();
      }
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

  const filteredSubjects = availableSubjects.filter((subject) =>
    subject.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subject_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const currentSubjects = filteredSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const groupedByDay = days.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
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
              <div className={`rounded-lg p-4 border ${
                enrollmentStatus.isOpen 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex items-start gap-3">
                  {enrollmentStatus.isOpen ? (
                    <CheckCircle size={20} className="text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-amber-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                      {enrollmentStatus.isOpen ? 'Enrollment Period Active' : 'Enrollment Period Closed'}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {enrollmentStatus.message || 'Check with the registrar for enrollment schedules'}
                    </p>
                    {enrollmentStatus.deadline && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Deadline: {new Date(enrollmentStatus.deadline).toLocaleDateString()}
                      </p>
                    )}
                    {enrollmentStatus.maxUnits && (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Units: {enrolledSubjects.reduce((sum, s) => sum + (s.units || 0), 0)} / {enrollmentStatus.maxUnits}
                        </span>
                        <div className="flex-1 max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min((enrolledSubjects.reduce((sum, s) => sum + (s.units || 0), 0) / enrollmentStatus.maxUnits) * 100, 100)}%` 
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
                <p className="text-xs font-medium text-indigo-100 uppercase mb-1">Enrolled Subjects</p>
                <p className="text-3xl font-bold">{enrolledSubjects.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
                <p className="text-xs font-medium text-green-100 uppercase mb-1">Total Units</p>
                <p className="text-3xl font-bold">{enrolledSubjects.reduce((sum, s) => sum + (s.units || 0), 0)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
                <p className="text-xs font-medium text-blue-100 uppercase mb-1">Available Subjects</p>
                <p className="text-3xl font-bold">{availableSubjects.length}</p>
              </div>
            </div>

            {/* Enrolled Subjects */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Currently Enrolled</h3>
              {enrolledSubjects.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No subjects enrolled yet</p>
              ) : (
                <div className="space-y-2">
                  {enrolledSubjects.map((subject) => (
                    <div
                      key={subject.enrollment_id}
                      className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={18} className="text-green-600" />
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{subject.subject_name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {subject.subject_code} • {subject.units} units • {subject.schedule}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDrop(subject.enrollment_id)}
                        className="text-red-600 hover:text-red-700 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        Drop
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Subjects */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Available Subjects</h3>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Filters */}
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                  >
                    <option value="">All Year Levels</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  <select
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                  >
                    <option value="">All Semesters</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {currentSubjects.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">No available subjects found</p>
                ) : (
                  currentSubjects.map((subject) => (
                    <div
                      key={subject.subject_id}
                      className="flex items-center justify-between p-3 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900 dark:text-white">{subject.subject_name}</h4>
                          {subject.prerequisites && subject.prerequisites.length > 0 && (
                            <span className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                              <Info size={12} />
                              Has Prerequisites
                            </span>
                          )}
                          {subject.enrolled >= subject.capacity && (
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded">
                              Full
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {subject.subject_code} • {subject.units} units • {subject.schedule}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Users size={12} />
                            {subject.enrolled}/{subject.capacity}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">{subject.instructor}</span>
                          {subject.year_level && (
                            <span className="text-slate-600 dark:text-slate-400">
                              Year {subject.year_level}
                            </span>
                          )}
                          {subject.semester && (
                            <span className="text-slate-600 dark:text-slate-400">
                              Sem {subject.semester}
                            </span>
                          )}
                        </div>
                        {subject.prerequisites && subject.prerequisites.length > 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Prerequisites: {subject.prerequisites.join(', ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleEnlist(subject)}
                        disabled={subject.enrolled >= subject.capacity}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {subject.enrolled >= subject.capacity ? "Full" : "Enlist"}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubjects.length)} of {filteredSubjects.length}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Timetable Tab
          <div className="space-y-4">
            {/* Day Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedDay("all")}
                className={`px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap ${
                  selectedDay === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                All Days
              </button>
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap ${
                    selectedDay === day
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Timetable Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {days.map((day) => {
                const classes = groupedByDay[day];
                if (selectedDay !== "all" && selectedDay !== day) return null;

                return (
                  <div key={day} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Calendar size={18} className="text-indigo-600" />
                      {day}
                    </h3>
                    <div className="space-y-2">
                      {classes.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4 text-sm">No classes scheduled</p>
                      ) : (
                        classes.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
                                {item.start_time?.substring(0, 5)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.subject_name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.subject_code}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {item.start_time} - {item.end_time}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {item.room}
                                  </span>
                                </div>
                                {item.instructor && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {item.instructor}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">Subject Name</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedSubject.subject_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Subject Code</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedSubject.subject_code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Units</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedSubject.units}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Schedule</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedSubject.schedule}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Instructor</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedSubject.instructor}</p>
                </div>
                {selectedSubject.prerequisites && selectedSubject.prerequisites.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Prerequisites Required</p>
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
                      Enrollment period is currently closed. Contact the registrar for assistance.
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
