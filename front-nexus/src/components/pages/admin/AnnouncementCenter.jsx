import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Bell,
  Eye,
} from "lucide-react";

const AnnouncementCenter = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    announcement_type: "General",
    priority: "Normal",
    target_audience: "All",
    target_year_levels: "",
    target_courses: "",
    status: "Draft",
    publish_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    is_pinned: false,
  });

  useEffect(() => {
    fetchData();
    // fetchStatistics(); // Temporarily disabled due to backend error
  }, []);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (searchTerm) params.append("search", searchTerm);
      const response = await axios.get(
        `http://localhost:5000/api/events/announcements?${params}`,
      );
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/events/announcements/statistics",
      );
      setStatistics(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    try {
      const userId = parseInt(localStorage.getItem("userId"));
      const submitData = current
        ? formData
        : { ...formData, created_by: userId };

      console.log("Submitting data:", submitData);

      let response;
      if (current) {
        response = await axios.put(
          `http://localhost:5000/api/events/announcements/${current.announcement_id}`,
          submitData,
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/events/announcements",
          submitData,
        );
      }
      console.log("Save successful, response:", response.data);
      alert("Announcement saved successfully!");
      console.log("Fetching updated data...");
      await fetchData();
      console.log("Data fetched, closing modal...");
      // fetchStatistics(); // Temporarily disabled
      closeModal();
      console.log("Modal closed");
    } catch (error) {
      console.error("Error details:", error);
      console.error("Error response:", error.response);
      if (error.code === "ECONNABORTED") {
        alert("Request timeout - server is not responding");
      } else {
        alert(
          error.response?.data?.error ||
            error.message ||
            "Error saving announcement",
        );
      }
    }
  };

  const handleEdit = (item) => {
    setCurrent(item);
    setFormData({
      title: item.title,
      content: item.content,
      announcement_type: item.announcement_type,
      priority: item.priority,
      target_audience: item.target_audience,
      target_year_levels: item.target_year_levels || "",
      target_courses: item.target_courses || "",
      status: item.status,
      publish_date: item.publish_date
        ? new Date(item.publish_date).toISOString().split("T")[0]
        : "",
      expiry_date: item.expiry_date
        ? new Date(item.expiry_date).toISOString().split("T")[0]
        : "",
      is_pinned: item.is_pinned,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this announcement?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/events/announcements/${id}`,
        );
        fetchData();
        // fetchStatistics(); // Temporarily disabled
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrent(null);
    setFormData({
      title: "",
      content: "",
      announcement_type: "General",
      priority: "Normal",
      target_audience: "All",
      target_year_levels: "",
      target_courses: "",
      status: "Draft",
      publish_date: new Date().toISOString().split("T")[0],
      expiry_date: "",
      is_pinned: false,
    });
  };

  const filtered = announcements.filter(
    (a) =>
      (!searchTerm ||
        a.title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterStatus || a.status === filterStatus),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getPriorityBadge = (priority) => {
    const badges = {
      Low: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
      Normal:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      High: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      Urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[priority] || badges.Normal;
  };

  const getStatusBadge = (status) => {
    const badges = {
      Draft: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
      Published:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Archived:
        "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
      Scheduled:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return badges[status] || badges.Draft;
  };

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={24} className="text-indigo-600" />
            Announcement Center
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Data Integrity: Online
          </span>
        </div>

        {statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Total
              </p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {statistics.total_announcements}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Published
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {statistics.published_count}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Draft
              </p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                {statistics.draft_count}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Views
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {statistics.total_views}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input - LEFT */}
          <div className="relative flex-grow max-w-xs">
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white text-sm transition-all shadow-inner"
            />
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
          </div>

          {/* Filters - RIGHT */}
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-40"
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Archived">Archived</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors shadow-sm border shadow-md shadow-indigo-500/30"
            >
              <Plus size={14} />
              New Announcement
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700/70">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <th className="px-4 py-2.5">Title</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Priority</th>
                <th className="px-4 py-2.5">Target</th>
                <th className="px-4 py-2.5">Publish Date</th>
                <th className="px-4 py-2.5">Views</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 w-1/12 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr
                    key={item.announcement_id}
                    className="text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition duration-150"
                  >
                    <td className="px-4 py-2">
                      <div className="font-semibold">
                        {item.is_pinned && "📌 "}
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">
                        {item.content}
                      </div>
                    </td>
                    <td className="px-4 py-2">{item.announcement_type}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadge(item.priority)}`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2">{item.target_audience}</td>
                    <td className="px-4 py-2">
                      {item.publish_date
                        ? new Date(item.publish_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <Eye size={12} className="text-slate-400" />
                        <span>{item.views_count}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        title="Edit"
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.announcement_id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="p-4 text-center text-slate-500 italic"
                  >
                    No announcements found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700 dark:text-slate-200">
          <span className="text-xs sm:text-sm">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages || 1}</span> | Total
            Records: {filtered.length}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-2 z-50 transition-opacity duration-300"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl transform transition-transform duration-300 scale-100 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-t-lg z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {current ? "Edit" : "Add"} Announcement
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    name="announcement_type"
                    value={formData.announcement_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="General">General</option>
                    <option value="Academic">Academic</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Event">Event</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="All">All</option>
                    <option value="Students">Students</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                    <option value="Parents">Parents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    name="publish_date"
                    value={formData.publish_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_pinned"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="is_pinned"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Pin to Top
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/30"
                >
                  {current ? "Update" : "Save"} Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementCenter;
