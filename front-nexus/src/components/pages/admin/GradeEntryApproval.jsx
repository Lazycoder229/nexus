import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

const GradeEntryApproval = () => {
  const [gradeEntries, setGradeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    approval_status: "pending",
    course_id: "",
    period_id: "",
  });

  useEffect(() => {
    fetchGradeEntries();
  }, []);

  const fetchGradeEntries = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(
        `http://localhost:5000/api/grade-entries?${queryParams}`
      );
      const data = await response.json();
      if (data.success) {
        setGradeEntries(data.data);
      }
    } catch (error) {
      console.error("Error fetching grade entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchGradeEntries();
  };

  const handleApprove = async (entryId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/grade-entries/${entryId}/approve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approved_by: 1 }), // Replace with actual admin ID
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchGradeEntries();
      }
    } catch (error) {
      console.error("Error approving grade entry:", error);
    }
  };

  const handleReject = async (entryId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/grade-entries/${entryId}/reject`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approved_by: 1, rejection_reason: reason }),
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchGradeEntries();
      }
    } catch (error) {
      console.error("Error rejecting grade entry:", error);
    }
  };

  const getApprovalBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      revision_needed: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grade Entry Approval</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Pending Approval
            </h3>
            <Clock className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">48</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Approved Today
            </h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">156</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">12</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Entries</h3>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">1,248</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Filter Grade Entries</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={filters.approval_status}
            onChange={(e) =>
              setFilters({ ...filters, approval_status: e.target.value })
            }
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="revision_needed">Revision Needed</option>
          </select>
          <input
            type="text"
            placeholder="Course ID"
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={filters.course_id}
            onChange={(e) =>
              setFilters({ ...filters, course_id: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Period ID"
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={filters.period_id}
            onChange={(e) =>
              setFilters({ ...filters, period_id: e.target.value })
            }
          />
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Grade Entries Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Grade Entries for Approval
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : gradeEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No grade entries found
                  </td>
                </tr>
              ) : (
                gradeEntries.map((entry) => (
                  <tr key={entry.entry_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {entry.student_first_name} {entry.student_last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {entry.course_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {entry.component_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {entry.raw_score}/{entry.max_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {entry.percentage
                        ? `${entry.percentage.toFixed(2)}%`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {entry.faculty_first_name} {entry.faculty_last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getApprovalBadge(entry.approval_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.approval_status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(entry.entry_id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(entry.entry_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradeEntryApproval;
