import React, { useState, useEffect } from "react";
import axios from "axios";
import { CalendarCheck, Users, Save, Search, Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

const MarkAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCoursesAndStudents();
  }, []);

  const fetchCoursesAndStudents = async () => {
    setLoading(true);
    // TODO: Replace with actual API
    const mockCourses = [
      { id: 1, code: 'CS101', name: 'Introduction to Programming', section: 'A', schedule: 'Mon/Wed 8:00 AM' },
      { id: 2, code: 'CS102', name: 'Data Structures', section: 'B', schedule: 'Tue/Thu 10:00 AM' },
      { id: 3, code: 'MATH201', name: 'Calculus II', section: 'A', schedule: 'Tue/Thu 2:00 PM' },
    ];
    setCourses(mockCourses);

    // Fetch all students from all courses
    const mockStudents = [
      { id: 1, studentId: '2024-00001', firstName: 'John', lastName: 'Doe', courseId: 1, course: 'CS101' },
      { id: 2, studentId: '2024-00002', firstName: 'Jane', lastName: 'Smith', courseId: 1, course: 'CS101' },
      { id: 3, studentId: '2024-00003', firstName: 'Michael', lastName: 'Johnson', courseId: 2, course: 'CS102' },
      { id: 4, studentId: '2024-00004', firstName: 'Sarah', lastName: 'Williams', courseId: 2, course: 'CS102' },
      { id: 5, studentId: '2024-00005', firstName: 'David', lastName: 'Brown', courseId: 3, course: 'MATH201' },
      { id: 6, studentId: '2024-00006', firstName: 'Emily', lastName: 'Davis', courseId: 1, course: 'CS101' },
      { id: 7, studentId: '2024-00007', firstName: 'Robert', lastName: 'Miller', courseId: 3, course: 'MATH201' },
    ];
    
    setStudents(mockStudents);
    
    // Initialize attendance status
    const initialAttendance = {};
    const initialRemarks = {};
    mockStudents.forEach(student => {
      initialAttendance[student.id] = 'present';
      initialRemarks[student.id] = '';
    });
    setAttendance(initialAttendance);
    setRemarks(initialRemarks);
    setLoading(false);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setRemarks(prev => ({
      ...prev,
      [studentId]: remark
    }));
  };

  const markAllPresent = () => {
    const allPresent = {};
    students.forEach(student => {
      allPresent[student.id] = 'present';
    });
    setAttendance(allPresent);
  };

  const markAllAbsent = () => {
    const allAbsent = {};
    students.forEach(student => {
      allAbsent[student.id] = 'absent';
    });
    setAttendance(allAbsent);
  };

  const handleSubmit = async () => {
    const studentIds = filteredStudents.map(s => s.id);
    if (studentIds.length === 0) {
      alert('No students to save attendance for');
      return;
    }

    try {
      setLoading(true);
      
      const attendanceData = studentIds.map(studentId => ({
        studentId: studentId,
        status: attendance[studentId],
        remarks: remarks[studentId] || '',
        date: selectedDate,
        courseId: selectedCourse || null,
      }));

      // TODO: Replace with actual API
      // await axios.post('/api/faculty/attendance/mark', {
      //   date: selectedDate,
      //   attendance: attendanceData
      // });

      alert('Attendance saved successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
      setLoading(false);
    }
  };

  // Filter students based on search and course
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = !selectedCourse || student.courseId === parseInt(selectedCourse);
    
    return matchesSearch && matchesCourse;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const selectedCourseData = courses.find(c => c.id === parseInt(selectedCourse));

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-indigo-600" />
          Mark Attendance
        </h1>
        <p className="text-sm text-gray-600 mt-1">Record student attendance for your classes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-grow max-w-xs">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all shadow-inner"
            />
          </div>

          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-52"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={dayjs().format('YYYY-MM-DD')}
              className="pl-9 pr-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-40"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={markAllPresent}
              className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs"
            >
              <CheckCircle className="w-3 h-3" />
              All Present
            </button>
            <button
              onClick={markAllAbsent}
              className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs"
            >
              <XCircle className="w-3 h-3" />
              All Absent
            </button>
          </div>
        </div>

        {/* Selected Info */}
        {selectedCourseData && (
          <div className="mt-3 p-2 bg-indigo-50 rounded border border-indigo-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-600">Course: </span>
              <span className="font-semibold text-gray-900">{selectedCourseData.code} - {selectedCourseData.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Schedule: </span>
              <span className="font-semibold text-gray-900">{selectedCourseData.schedule}</span>
            </div>
            <div>
              <span className="text-gray-600">Date: </span>
              <span className="font-semibold text-gray-900">{dayjs(selectedDate).format('MMM DD, YYYY')}</span>
            </div>
          </div>
        )}

        {/* Attendance Summary */}
        <div className="mt-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Present: {Object.values(attendance).filter(s => s === 'present').length}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Absent: {Object.values(attendance).filter(s => s === 'absent').length}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Late: {Object.values(attendance).filter(s => s === 'late').length}</span>
          </div>
          <div className="ml-auto">
            <span className="text-gray-600">Total Students: </span>
            <span className="font-semibold">{filteredStudents.length}</span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">\n        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    No students found
                  </td>
                </tr>
              ) : (
                currentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-indigo-600">{student.studentId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <span className="text-indigo-600 font-semibold text-xs">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{student.course}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'present')}
                          className={`px-3 py-1.5 rounded text-xs transition-colors ${
                            attendance[student.id] === 'present'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Present
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'late')}
                          className={`px-3 py-1.5 rounded text-xs transition-colors ${
                            attendance[student.id] === 'late'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'
                          }`}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          Late
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'absent')}
                          className={`px-3 py-1.5 rounded text-xs transition-colors ${
                            attendance[student.id] === 'absent'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                          }`}
                        >
                          <XCircle className="w-3 h-3 inline mr-1" />
                          Absent
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={remarks[student.id] || ''}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        placeholder="Add remarks..."
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs sm:text-sm text-slate-700">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">{totalPages}</span> | Showing {currentStudents.length} of {filteredStudents.length} students
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border border-slate-300 bg-white disabled:opacity-50 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 py-1 text-xs font-semibold text-indigo-600">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-md border border-slate-300 bg-white disabled:opacity-50 hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCourse("");
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white transition-colors text-xs"
                >
                  Reset
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 flex items-center gap-1 text-xs"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MarkAttendance;
