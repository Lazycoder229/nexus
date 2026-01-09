import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Users, Calendar, Search, Filter, FileText, Download } from "lucide-react";

const AssignedSubjects = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const fetchAssignedCourses = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API
      // const response = await axios.get('/api/faculty/assigned-courses');
      
      // Mock data
      setTimeout(() => {
        setCourses([
          {
            id: 1,
            code: 'CS101',
            name: 'Introduction to Programming',
            section: 'A',
            schedule: 'Mon/Wed 8:00 AM - 10:00 AM',
            room: 'Room 301',
            students: 35,
            semester: 'First Semester 2024',
            status: 'active'
          },
          {
            id: 2,
            code: 'CS102',
            name: 'Data Structures',
            section: 'B',
            schedule: 'Tue/Thu 10:00 AM - 12:00 PM',
            room: 'Room 302',
            students: 40,
            semester: 'First Semester 2024',
            status: 'active'
          },
          {
            id: 3,
            code: 'MATH201',
            name: 'Calculus II',
            section: 'A',
            schedule: 'Tue/Thu 2:00 PM - 4:00 PM',
            room: 'Room 205',
            students: 38,
            semester: 'First Semester 2024',
            status: 'active'
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
        <p className="text-gray-600 mt-2">View and manage your assigned courses</p>
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
              <option value="First Semester 2024">First Semester 2024</option>
              <option value="Second Semester 2024">Second Semester 2024</option>
            </select>
          </div>
          <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xl font-bold">{course.code}</h3>
                  <p className="text-sm opacity-90">Section {course.section}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  course.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`}>
                  {course.status.toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="font-semibold text-gray-900 text-lg mb-4">{course.name}</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>{course.schedule}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>{course.room}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>{course.students} Students Enrolled</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">
                    View Details
                  </button>
                  <button className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
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
          <p className="text-gray-500 text-lg">No courses found matching your filters</p>
        </div>
      )}
    </div>
  );
};

export default AssignedSubjects;
