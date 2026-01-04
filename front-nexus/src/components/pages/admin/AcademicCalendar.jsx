import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AcademicCalendar = () => {
  const [events, setEvents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    period_id: "",
    event_name: "",
    event_type: "other",
    start_date: "",
    end_date: "",
    description: "",
    location: "",
    target_audience: "all",
  });

  const eventTypes = [
    { value: "enrollment", label: "Enrollment", color: "#3498db" },
    { value: "exam", label: "Examination", color: "#e74c3c" },
    { value: "holiday", label: "Holiday", color: "#27ae60" },
    { value: "meeting", label: "Meeting", color: "#9b59b6" },
    { value: "deadline", label: "Deadline", color: "#e67e22" },
    { value: "activity", label: "Activity", color: "#1abc9c" },
    { value: "other", label: "Other", color: "#95a5a6" },
  ];

  const audienceOptions = [
    { value: "all", label: "Everyone" },
    { value: "students", label: "Students Only" },
    { value: "faculty", label: "Faculty Only" },
    { value: "staff", label: "Staff Only" },
    { value: "admin", label: "Admin Only" },
  ];

  useEffect(() => {
    fetchEvents();
    fetchPeriods();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/academic-events"
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOption, field) => {
    setFormData({ ...formData, [field]: selectedOption?.value || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/academic-events/${currentEvent.event_id}`,
          formData
        );
      } else {
        await axios.post("http://localhost:5000/api/academic-events", formData);
      }
      fetchEvents();
      closeModal();
    } catch (error) {
      console.error("Error saving event:", error);
      alert(error.response?.data?.error || "Error saving event");
    }
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      period_id: event.period_id || "",
      event_name: event.event_name,
      event_type: event.event_type,
      start_date: event.start_date,
      end_date: event.end_date || "",
      description: event.description || "",
      location: event.location || "",
      target_audience: event.target_audience,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://localhost:5000/api/academic-events/${id}`);
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        alert(error.response?.data?.error || "Error deleting event");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentEvent(null);
    setFormData({
      period_id: "",
      event_name: "",
      event_type: "other",
      start_date: "",
      end_date: "",
      description: "",
      location: "",
      target_audience: "all",
    });
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPeriod =
      !filterPeriod || event.period_id === filterPeriod.value;
    const matchesType = !filterType || event.event_type === filterType.value;

    return matchesSearch && matchesPeriod && matchesType;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const periodOptions = periods.map((period) => ({
    value: period.period_id,
    label: `${period.period_name} ${period.year}`,
  }));

  const getEventColor = (eventType) => {
    return eventTypes.find((t) => t.value === eventType)?.color || "#95a5a6";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper Components
  const StatusBadge = ({ type }) => {
    const eventTypeObj = eventTypes.find((t) => t.value === type);
    const colorMap = {
      enrollment: "bg-blue-100 text-blue-800",
      exam: "bg-red-100 text-red-800",
      holiday: "bg-green-100 text-green-800",
      meeting: "bg-purple-100 text-purple-800",
      deadline: "bg-orange-100 text-orange-800",
      activity: "bg-teal-100 text-teal-800",
      other: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          colorMap[type] || colorMap.other
        }`}
      >
        {eventTypeObj?.label || type}
      </span>
    );
  };

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

  // Calculate statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e) => new Date(e.start_date) > new Date()
  ).length;
  const thisWeekEvents = events.filter((e) => {
    const eventDate = new Date(e.start_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= weekFromNow;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Academic Calendar
          </h1>
          <p className="text-gray-600">
            Manage academic events, deadlines, and important dates
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Events
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalEvents}
                </p>
              </div>
              <CalendarIcon className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Upcoming Events
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {upcomingEvents}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {thisWeekEvents}
                </p>
              </div>
              <Clock className="text-orange-500" size={40} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Controls Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter by Period */}
              <div className="w-full lg:w-64">
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

              {/* Filter by Type */}
              <div className="w-full lg:w-64">
                <Select
                  options={eventTypes}
                  value={filterType}
                  onChange={setFilterType}
                  placeholder="Filter by Type"
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <Plus size={20} />
                Add Event
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Audience
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((event) => (
                    <tr
                      key={event.event_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1 h-12 rounded-full"
                            style={{
                              backgroundColor: getEventColor(event.event_type),
                            }}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {event.event_name}
                            </div>
                            {event.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {event.description.substring(0, 60)}
                                {event.description.length > 60 && "..."}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge type={event.event_type} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <CalendarIcon size={16} className="text-gray-400" />
                          <div>
                            <div>{formatDate(event.start_date)}</div>
                            {event.end_date &&
                              event.end_date !== event.start_date && (
                                <div className="text-gray-500 text-xs">
                                  to {formatDate(event.end_date)}
                                </div>
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {event.period_name
                          ? `${event.period_name} ${event.year}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {event.location ? (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <MapPin size={14} className="text-gray-400" />
                            {event.location}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Users size={14} className="text-gray-400" />
                          <span className="capitalize">
                            {event.target_audience}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.event_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CalendarIcon size={48} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          No events found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editMode ? "Edit Event" : "Add New Event"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                {/* Event Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-blue-500" />
                    Event Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="event_name"
                        value={formData.event_name}
                        onChange={handleInputChange}
                        placeholder="e.g., First Semester Enrollment"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Type <span className="text-red-500">*</span>
                        </label>
                        <Select
                          options={eventTypes}
                          value={eventTypes.find(
                            (o) => o.value === formData.event_type
                          )}
                          onChange={(option) =>
                            handleSelectChange(option, "event_type")
                          }
                          placeholder="Select Type"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Academic Period
                        </label>
                        <Select
                          options={periodOptions}
                          value={periodOptions.find(
                            (o) => o.value === formData.period_id
                          )}
                          onChange={(option) =>
                            handleSelectChange(option, "period_id")
                          }
                          placeholder="Select Period (Optional)"
                          isClearable
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date & Location */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-green-500" />
                    Date & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Auditorium, Online"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-purple-500" />
                    Additional Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <Select
                        options={audienceOptions}
                        value={audienceOptions.find(
                          (o) => o.value === formData.target_audience
                        )}
                        onChange={(option) =>
                          handleSelectChange(option, "target_audience")
                        }
                        placeholder="Select Audience"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Event description..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editMode ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;
