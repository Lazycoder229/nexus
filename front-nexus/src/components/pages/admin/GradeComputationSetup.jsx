import { useState, useEffect } from "react";
import { Settings, Plus, Edit, Trash2, AlertCircle } from "lucide-react";

const GradeComputationSetup = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    course_id: "",
    period_id: "",
    section_id: "",
  });
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(
        `http://localhost:5000/api/grade-computation-settings?${queryParams}`
      );
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        // Calculate total weight
        const total = data.data.reduce(
          (sum, setting) => sum + parseFloat(setting.weight || 0),
          0
        );
        setTotalWeight(total);
      }
    } catch (error) {
      console.error("Error fetching grade computation settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchSettings();
  };

  const getComponentTypeBadge = (type) => {
    const typeColors = {
      exam: "bg-red-100 text-red-800",
      quiz: "bg-yellow-100 text-yellow-800",
      assignment: "bg-blue-100 text-blue-800",
      project: "bg-purple-100 text-purple-800",
      attendance: "bg-green-100 text-green-800",
      participation: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          typeColors[type] || "bg-gray-100 text-gray-800"
        }`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grade Computation Setup</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Component
        </button>
      </div>

      {/* Weight Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Weight</h3>
            <div className="flex items-center gap-4 mt-2">
              <p
                className={`text-3xl font-bold ${
                  totalWeight === 100 ? "text-green-600" : "text-red-600"
                }`}
              >
                {totalWeight.toFixed(2)}%
              </p>
              {totalWeight !== 100 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {totalWeight < 100
                      ? `${(100 - totalWeight).toFixed(2)}% remaining`
                      : `${(totalWeight - 100).toFixed(2)}% over limit`}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Settings className="text-blue-500" size={48} />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Filter Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <input
            type="text"
            placeholder="Section ID"
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={filters.section_id}
            onChange={(e) =>
              setFilters({ ...filters, section_id: e.target.value })
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

      {/* Settings Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Grade Component Settings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
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
              ) : settings.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No grade computation settings found
                  </td>
                </tr>
              ) : (
                settings.map((setting) => (
                  <tr key={setting.setting_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {setting.component_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getComponentTypeBadge(setting.component_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {setting.course_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {setting.section_name || "All Sections"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                      {setting.weight}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">
                      {setting.computation_method.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          setting.is_required
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {setting.is_required ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

export default GradeComputationSetup;
