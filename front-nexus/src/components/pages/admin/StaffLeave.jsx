import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";

const StaffLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    leave_type: "",
    status: "",
    search: "",
  });

  const [formData, setFormData] = useState({
    leave_id: null,
    employee_id: "",
    leave_type: "Sick Leave",
    start_date: "",
    end_date: "",
    reason: "",
    status: "Pending",
    approved_by: "",
    approval_date: "",
    notes: "",
  });

  const leaveTypes = [
    "Sick Leave",
    "Vacation Leave",
    "Emergency Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Bereavement Leave",
    "Other",
  ];

  const statuses = ["Pending", "Approved", "Rejected"];

  useEffect(() => {
    fetchLeaves();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get("/api/staff-leave", { params: filters });
      setLeaves(response.data.data || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get("/api/staff-leave/summary");
      setSummary(response.data.data || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.leave_id) {
        await axios.put(`/api/staff-leave/${formData.leave_id}`, formData);
      } else {
        await axios.post("/api/staff-leave", formData);
      }
      setShowModal(false);
      resetForm();
      fetchLeaves();
      fetchSummary();
    } catch (error) {
      console.error("Error saving leave:", error);
      alert("Failed to save leave request");
    }
  };

  const handleEdit = (leave) => {
    setFormData(leave);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this leave request?")) {
      try {
        await axios.delete(`/api/staff-leave/${id}`);
        fetchLeaves();
        fetchSummary();
      } catch (error) {
        console.error("Error deleting leave:", error);
      }
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm("Approve this leave request?")) {
      try {
        await axios.patch(`/api/staff-leave/${id}/approve`, {
          approved_by: 1, // Replace with actual user ID
        });
        fetchLeaves();
        fetchSummary();
      } catch (error) {
        console.error("Error approving leave:", error);
        alert("Failed to approve leave request");
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Reject this leave request?")) {
      try {
        await axios.patch(`/api/staff-leave/${id}/reject`, {
          approved_by: 1, // Replace with actual user ID
        });
        fetchLeaves();
        fetchSummary();
      } catch (error) {
        console.error("Error rejecting leave:", error);
        alert("Failed to reject leave request");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      leave_id: null,
      employee_id: "",
      leave_type: "Sick Leave",
      start_date: "",
      end_date: "",
      reason: "",
      status: "Pending",
      approved_by: "",
      approval_date: "",
      notes: "",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Staff Leave</h1>
          <p className="text-gray-600 mt-1">Manage employee leave requests</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Leave Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.total_requests || 0}
              </p>
            </div>
            <Calendar className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {summary.pending_requests || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {summary.approved_requests || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {summary.rejected_requests || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search employee..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <select
              value={filters.leave_type}
              onChange={(e) =>
                setFilters({ ...filters, leave_type: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Leave Types</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.map((leave) => (
              <tr key={leave.leave_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">
                      {leave.first_name} {leave.last_name}
                    </div>
                    <div className="text-sm text-gray-500 font-mono">
                      {leave.employee_number}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {leave.leave_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(leave.start_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(leave.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  {leave.total_days}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      leave.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : leave.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {leave.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(leave.leave_id)}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(leave.leave_id)}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(leave)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(leave.leave_id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">
              {formData.leave_id ? "Edit" : "Add"} Leave Request
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="number"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Leave Type *
                  </label>
                  <select
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Reason *
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffLeave;
