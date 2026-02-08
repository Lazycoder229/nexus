import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Users, Save, Search, ChevronLeft, ChevronRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const GradeEncoding = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("midterm");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCoursesAndStudents();
  }, []);

  const fetchCoursesAndStudents = async () => {
    setLoading(true);
    try {
      // Fetch courses from API
      const coursesRes = await axios.get(`${API_BASE}/api/course/courses`);
      const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data.data || []);
      const mappedCourses = coursesData.map(c => ({
        id: c.course_id || c.id,
        code: c.code || c.course_code,
        name: c.title || c.name || c.course_name,
        section: c.section || 'A',
      }));
      setCourses(mappedCourses);

      // Fetch students/enrollments from API
      const studentsRes = await axios.get(`${API_BASE}/api/enrollments`);
      const enrollmentsData = studentsRes.data.data || studentsRes.data || [];
      const mappedStudents = enrollmentsData.map((e, idx) => ({
        id: e.enrollment_id || e.student_id || e.user_id || idx + 1,
        studentId: e.student_number || e.student_id || `STU-${idx + 1}`,
        firstName: e.first_name || e.student_name?.split(' ')[0] || 'Student',
        lastName: e.last_name || e.student_name?.split(' ')[1] || '',
        courseId: e.course_id,
        course: e.course_code || mappedCourses.find(c => c.id === e.course_id)?.code || 'N/A',
      }));
      setStudents(mappedStudents);

      // Initialize grades
      const initialGrades = {};
      mappedStudents.forEach(student => {
        initialGrades[student.id] = {
          quiz: '',
          assignment: '',
          exam: '',
          project: ''
        };
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error('Error fetching courses and students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, component, value) => {
    // Validate numeric input (0-100)
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
      setGrades(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [component]: value
        }
      }));
    }
  };

  const calculateAverage = (studentId) => {
    const studentGrades = grades[studentId];
    if (!studentGrades) return '-';

    const values = Object.values(studentGrades).filter(v => v !== '').map(Number);
    if (values.length === 0) return '-';

    const sum = values.reduce((a, b) => a + b, 0);
    return (sum / values.length).toFixed(2);
  };

  const handleSubmit = async () => {
    const studentIds = filteredStudents.map(s => s.id);
    if (studentIds.length === 0) {
      alert('No students to save grades for');
      return;
    }

    try {
      setLoading(true);

      const gradeData = studentIds.map(studentId => ({
        studentId: studentId,
        assessment: selectedAssessment,
        grades: grades[studentId],
        average: calculateAverage(studentId),
        courseId: selectedCourse || null,
      }));

      // Save grades to API
      await axios.post(`${API_BASE}/api/grades`, {
        assessment: selectedAssessment,
        grades: gradeData
      });

      alert('Grades saved successfully!');
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Failed to save grades');
    } finally {
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
          <FileText className="w-6 h-6 text-indigo-600" />
          Grade Encoding
        </h1>
        <p className="text-sm text-gray-600 mt-1">Enter and submit student grades</p>
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

          {/* Assessment Type */}
          <select
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
            className="px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-40"
          >
            <option value="midterm">Midterm</option>
            <option value="finals">Finals</option>
            <option value="prelim">Prelim</option>
          </select>
        </div>

        {/* Selected Info */}
        {selectedCourseData && (
          <div className="mt-3 p-2 bg-indigo-50 rounded border border-indigo-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-600">Course: </span>
              <span className="font-semibold text-gray-900">{selectedCourseData.code} - {selectedCourseData.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Assessment: </span>
              <span className="font-semibold text-gray-900">{selectedAssessment.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Students: </span>
              <span className="font-semibold">{filteredStudents.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Quiz</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Assignment</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Exam</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Project</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
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
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grades[student.id]?.quiz || ''}
                        onChange={(e) => handleGradeChange(student.id, 'quiz', e.target.value)}
                        placeholder="0-100"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grades[student.id]?.assignment || ''}
                        onChange={(e) => handleGradeChange(student.id, 'assignment', e.target.value)}
                        placeholder="0-100"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grades[student.id]?.exam || ''}
                        onChange={(e) => handleGradeChange(student.id, 'exam', e.target.value)}
                        placeholder="0-100"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grades[student.id]?.project || ''}
                        onChange={(e) => handleGradeChange(student.id, 'project', e.target.value)}
                        placeholder="0-100"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-indigo-600">
                        {calculateAverage(student.id)}
                      </span>
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
                    Save Grades
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

export default GradeEncoding;
