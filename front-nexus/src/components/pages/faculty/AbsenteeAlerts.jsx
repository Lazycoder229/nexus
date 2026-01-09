import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, Users, Calendar, Mail, Phone, Search, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

const AbsenteeAlerts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data - load immediately
  const [absentees] = useState([
    {
      id: 1,
      studentId: '2024-00001',
      name: 'John Doe',
      course: 'CS101',
      absences: 5,
      consecutiveDays: 3,
      lastAttendance: dayjs().subtract(3, 'days').format('YYYY-MM-DD'),
      email: 'john.doe@example.com',
      phone: '09123456789',
      status: 'critical'
    },
    {
      id: 2,
      studentId: '2024-00003',
      name: 'Michael Johnson',
      course: 'MATH201',
      absences: 3,
      consecutiveDays: 2,
      lastAttendance: dayjs().subtract(2, 'days').format('YYYY-MM-DD'),
      email: 'michael.j@example.com',
      phone: '09123456788',
      status: 'warning'
    },
    {
      id: 3,
      studentId: '2024-00005',
      name: 'Sarah Williams',
      course: 'CS101',
      absences: 4,
      consecutiveDays: 2,
      lastAttendance: dayjs().subtract(2, 'days').format('YYYY-MM-DD'),
      email: 'sarah.w@example.com',
      phone: '09123456787',
      status: 'warning'
    },
    {
      id: 4,
      studentId: '2024-00007',
      name: 'David Brown',
      course: 'ENG102',
      absences: 6,
      consecutiveDays: 4,
      lastAttendance: dayjs().subtract(4, 'days').format('YYYY-MM-DD'),
      email: 'david.b@example.com',
      phone: '09123456786',
      status: 'critical'
    },
  ]);

  const sendNotification = (student) => {
    alert(`Sending notification to ${student.name}...`);
  };

  // Filter absentees
  const filteredAbsentees = absentees.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAbsentees = filteredAbsentees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAbsentees.length / itemsPerPage);

  return (
    <div className="bg-gray-50">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-indigo-600" />
          Absentee Alerts
        </h1>
        <p className="text-sm text-gray-600 mt-1">Monitor students with attendance concerns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Absentees</p>
              <p className="text-xl font-bold text-gray-900">{filteredAbsentees.length}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Critical Cases</p>
              <p className="text-xl font-bold text-red-600">
                {filteredAbsentees.filter(a => a.status === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Warnings</p>
              <p className="text-xl font-bold text-yellow-600">
                {filteredAbsentees.filter(a => a.status === 'warning').length}
              </p>
            </div>
            <Bell className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-40"
          >
            <option value="all">All Status</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Absences</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Consecutive</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Attendance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAbsentees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    No absentees found
                  </td>
                </tr>
              ) : (
                currentAbsentees.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.studentId}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{student.course}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      {student.absences} days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{student.consecutiveDays} days</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{dayjs(student.lastAttendance).format('MMM DD, YYYY')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      student.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {student.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => sendNotification(student)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-3 h-3" />
                      </button>
                      <button className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Call">
                        <Phone className="w-3 h-3" />
                      </button>
                    </div>
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
              <span className="font-semibold">{totalPages}</span> | Showing {currentAbsentees.length} of {filteredAbsentees.length} students
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenteeAlerts;
