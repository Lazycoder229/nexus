import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

const ExamScheduleBuilder = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    status: "",
    search: "",
  });
  const [formData, setFormData] = useState({
    exam_id: "",
    section_id: "",
    exam_date: "",
    start_time: "",
    end_time: "",
    venue: "",
    proctor_id: "",
    status: "scheduled",
    max_students: "",
  });

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(
        `http://localhost:5000/api/exam-schedules?${queryParams}`
      );
      const data = await response.json();
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (error) {
      console.error("Error fetching exam schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchSchedules();
  };

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        exam_id: schedule.exam_id || "",
        section_id: schedule.section_id || "",
        exam_date: schedule.exam_date ? schedule.exam_date.split('T')[0] : "",
        start_time: schedule.start_time || "",
        end_time: schedule.end_time || "",
        venue: schedule.venue || "",
        proctor_id: schedule.proctor_id || "",
        status: schedule.status || "scheduled",
        max_students: schedule.max_students || "",
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        exam_id: "",
        section_id: "",
        exam_date: "",
        start_time: "",
        end_time: "",
        venue: "",
        proctor_id: "",
        status: "scheduled",
        max_students: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSchedule
        ? `http://localhost:5000/api/exam-schedules/${editingSchedule.schedule_id}`
        : "http://localhost:5000/api/exam-schedules";
      const method = editingSchedule ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert(editingSchedule ? "Schedule updated successfully" : "Schedule created successfully");
        handleCloseModal();
        fetchSchedules();
      } else {
        alert("Error: " + (data.message || "Failed to save schedule"));
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Error saving schedule");
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/exam-schedules/${scheduleId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        alert("Schedule deleted successfully");
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Error deleting schedule");
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      scheduled: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
      rescheduled: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400",
      completed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          statusColors[status] || "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText size={24} className="text-indigo-600" />
          Exam Schedule Builder
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Data Integrity: Online
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Schedules</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">86</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Today</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">3</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">59</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input - LEFT */}
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search schedules..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white text-sm transition-all shadow-inner"
          />
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
        </div>

        {/* Filters - RIGHT */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) =>
              setFilters({ ...filters, date_from: e.target.value })
            }
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-40"
          />
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) =>
              setFilters({ ...filters, date_to: e.target.value })
            }
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-40"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-40"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm font-medium shadow-sm"
          >
            Apply Filters
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors shadow-sm border shadow-md shadow-indigo-500/30"
          >
            <Plus size={14} />
            Schedule Exam
          </button>
        </div>
      </div>

      {/* Schedules Table */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
          Exam Schedule List
        </h2>
        <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700/70">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <th className="px-4 py-2.5">
                  Exam Name
                </th>
                <th className="px-4 py-2.5">
                  Course
                </th>
                <th className="px-4 py-2.5">
                  Section
                </th>
                <th className="px-4 py-2.5">
                  Date
                </th>
                <th className="px-4 py-2.5">
                  Time
                </th>
                <th className="px-4 py-2.5">
                  Venue
                </th>
                <th className="px-4 py-2.5">
                  Proctor
                </th>
                <th className="px-4 py-2.5">
                  Status
                </th>
                <th className="px-4 py-2.5 w-1/12 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {(() => {
                if (loading) {
                  return (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-4 text-center text-slate-500 italic"
                      >
                        Loading...
                      </td>
                    </tr>
                  );
                }

                const searchTerm = filters.search.toLowerCase();
                const filtered = schedules.filter((schedule) => {
                  const matchesSearch =
                    schedule.exam_name?.toLowerCase().includes(searchTerm) ||
                    schedule.course_code?.toLowerCase().includes(searchTerm) ||
                    schedule.section_name?.toLowerCase().includes(searchTerm) ||
                    schedule.venue?.toLowerCase().includes(searchTerm);
                  return matchesSearch;
                });

                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

                if (paginatedData.length === 0) {
                  return (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-4 text-center text-slate-500 italic"
                      >
                        No exam schedules found matching your search criteria.
                      </td>
                    </tr>
                  );
                }

                return paginatedData.map((schedule) => (
                  <tr key={schedule.schedule_id} className="text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition duration-150">
                    <td className="px-4 py-2 font-medium">
                      {schedule.exam_name}
                    </td>
                    <td className="px-4 py-2">
                      {schedule.course_code}
                    </td>
                    <td className="px-4 py-2">
                      {schedule.section_name || "All"}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(schedule.exam_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {schedule.start_time} - {schedule.end_time}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        {schedule.venue || "TBA"}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {schedule.proctor_first_name ? (
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          {schedule.proctor_first_name}{" "}
                          {schedule.proctor_last_name}
                        </div>
                      ) : (
                        "Not assigned"
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(schedule)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.schedule_id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700 dark:text-slate-200">
          <span className="text-xs sm:text-sm">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{(() => {
              const searchTerm = filters.search.toLowerCase();
              const filtered = schedules.filter((schedule) => {
                const matchesSearch =
                  schedule.exam_name?.toLowerCase().includes(searchTerm) ||
                  schedule.course_code?.toLowerCase().includes(searchTerm) ||
                  schedule.section_name?.toLowerCase().includes(searchTerm) ||
                  schedule.venue?.toLowerCase().includes(searchTerm);
                return matchesSearch;
              });
              return Math.ceil(filtered.length / itemsPerPage) || 1;
            })()}</span> | Total Records:{" "}
            {(() => {
              const searchTerm = filters.search.toLowerCase();
              const filtered = schedules.filter((schedule) => {
                const matchesSearch =
                  schedule.exam_name?.toLowerCase().includes(searchTerm) ||
                  schedule.course_code?.toLowerCase().includes(searchTerm) ||
                  schedule.section_name?.toLowerCase().includes(searchTerm) ||
                  schedule.venue?.toLowerCase().includes(searchTerm);
                return matchesSearch;
              });
              return filtered.length;
            })()}
          </span>
          <div className="flex gap-1 items-center mt-2 sm:mt-0">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {currentPage}
            </span>
            <button
              onClick={() => {
                const searchTerm = filters.search.toLowerCase();
                const filtered = schedules.filter((schedule) => {
                  const matchesSearch =
                    schedule.exam_name?.toLowerCase().includes(searchTerm) ||
                    schedule.course_code?.toLowerCase().includes(searchTerm) ||
                    schedule.section_name?.toLowerCase().includes(searchTerm) ||
                    schedule.venue?.toLowerCase().includes(searchTerm);
                  return matchesSearch;
                });
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
              }}
              disabled={(() => {
                const searchTerm = filters.search.toLowerCase();
                const filtered = schedules.filter((schedule) => {
                  const matchesSearch =
                    schedule.exam_name?.toLowerCase().includes(searchTerm) ||
                    schedule.course_code?.toLowerCase().includes(searchTerm) ||
                    schedule.section_name?.toLowerCase().includes(searchTerm) ||
                    schedule.venue?.toLowerCase().includes(searchTerm);
                  return matchesSearch;
                });
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                return currentPage === totalPages;
              })()}
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-2 z-50 transition-opacity duration-300" onClick={handleCloseModal}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl transform transition-transform duration-300 scale-100 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-t-lg z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSchedule ? "Edit" : "Add"} Exam Schedule
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Exam ID *
                  </label>
                  <input
                    type="text"
                    value={formData.exam_id}
                    onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Section ID
                  </label>
                  <input
                    type="text"
                    value={formData.section_id}
                    onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Proctor ID
                  </label>
                  <input
                    type="text"
                    value={formData.proctor_id}
                    onChange={(e) => setFormData({ ...formData, proctor_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Max Students
                  </label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/30"
                >
                  {editingSchedule ? "Update" : "Save"} Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ExamScheduleBuilder;
