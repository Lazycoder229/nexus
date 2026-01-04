import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, DollarSign, TrendingDown } from "lucide-react";

const DeductionManagement = () => {
  const [deductions, setDeductions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    deduction_type: "",
    status: "",
    search: "",
  });

  const [formData, setFormData] = useState({
    deduction_id: null,
    employee_id: "",
    deduction_type: "SSS",
    amount: "",
    frequency: "Monthly",
    start_date: "",
    end_date: "",
    total_balance: "",
    remaining_balance: "",
    status: "Active",
    notes: "",
  });

  const deductionTypes = [
    "SSS",
    "PhilHealth",
    "Pag-IBIG",
    "Tax",
    "Loan",
    "Cash Advance",
    "Other Deduction",
    "Penalty",
  ];

  const frequencies = ["Monthly", "Semi-Monthly", "Weekly", "One-time"];
  const statuses = ["Active", "Inactive", "Completed"];

  useEffect(() => {
    fetchDeductions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchDeductions = async () => {
    try {
      const response = await axios.get("/api/deductions", { params: filters });
      setDeductions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching deductions:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.deduction_id) {
        await axios.put(`/api/deductions/${formData.deduction_id}`, formData);
      } else {
        await axios.post("/api/deductions", formData);
      }
      setShowModal(false);
      resetForm();
      fetchDeductions();
    } catch (error) {
      console.error("Error saving deduction:", error);
      alert("Failed to save deduction");
    }
  };

  const handleEdit = (deduction) => {
    setFormData(deduction);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this deduction?")) {
      try {
        await axios.delete(`/api/deductions/${id}`);
        fetchDeductions();
      } catch (error) {
        console.error("Error deleting deduction:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      deduction_id: null,
      employee_id: "",
      deduction_type: "SSS",
      amount: "",
      frequency: "Monthly",
      start_date: "",
      end_date: "",
      total_balance: "",
      remaining_balance: "",
      status: "Active",
      notes: "",
    });
  };

  const calculateProgress = (remaining, total) => {
    if (!total || total === 0) return 0;
    const paid = total - remaining;
    return (paid / total) * 100;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Deduction Management
          </h1>
          <p className="text-gray-600 mt-1">Manage employee deductions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Deduction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-2xl font-bold text-gray-800">
                {deductions.length}
              </p>
            </div>
            <TrendingDown className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active Deductions</p>
          <p className="text-2xl font-bold text-green-600">
            {deductions.filter((d) => d.status === "Active").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-blue-600">
            ₱
            {deductions
              .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
              .toLocaleString()}
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
              value={filters.deduction_type}
              onChange={(e) =>
                setFilters({ ...filters, deduction_type: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Deduction Types</option>
              {deductionTypes.map((type) => (
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
                Deduction Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Balance Progress
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
            {deductions.map((deduction) => (
              <tr key={deduction.deduction_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">
                      {deduction.first_name} {deduction.last_name}
                    </div>
                    <div className="text-sm text-gray-500 font-mono">
                      {deduction.employee_number}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {deduction.deduction_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  ₱{parseFloat(deduction.amount || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {deduction.frequency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {deduction.total_balance > 0 ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${calculateProgress(
                                deduction.remaining_balance,
                                deduction.total_balance
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {calculateProgress(
                            deduction.remaining_balance,
                            deduction.total_balance
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        ₱
                        {parseFloat(
                          deduction.remaining_balance || 0
                        ).toLocaleString()}{" "}
                        / ₱
                        {parseFloat(
                          deduction.total_balance || 0
                        ).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      deduction.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : deduction.status === "Completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {deduction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(deduction)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(deduction.deduction_id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8">
            <h2 className="text-2xl font-bold mb-4">
              {formData.deduction_id ? "Edit" : "Add"} Deduction
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
                    Deduction Type *
                  </label>
                  <select
                    name="deduction_type"
                    value={formData.deduction_type}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {deductionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Frequency *
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
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
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Balance
                  </label>
                  <input
                    type="number"
                    name="total_balance"
                    value={formData.total_balance}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="For loans/advances"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Remaining Balance
                  </label>
                  <input
                    type="number"
                    name="remaining_balance"
                    value={formData.remaining_balance}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="For loans/advances"
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
                  Save Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeductionManagement;
