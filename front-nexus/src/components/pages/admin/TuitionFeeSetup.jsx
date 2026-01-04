import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, Edit, Trash2, DollarSign, Filter } from "lucide-react";

const TuitionFeeSetup = () => {
  const [fees, setFees] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    program_id: "",
    academic_period_id: "",
    year_level: "",
  });

  const [formData, setFormData] = useState({
    fee_setup_id: null,
    program_id: "",
    year_level: "1st Year",
    academic_period_id: "",
    tuition_fee: 0,
    laboratory_fee: 0,
    library_fee: 0,
    athletic_fee: 0,
    registration_fee: 0,
    id_fee: 0,
    miscellaneous_fee: 0,
    other_fees: 0,
    is_active: true,
  });

  const yearLevels = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
  ];

  useEffect(() => {
    fetchFees();
    fetchPrograms();
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchFees = async () => {
    try {
      const response = await axios.get("/api/tuition-fees", {
        params: filters,
      });
      setFees(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tuition fees:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await axios.get("/api/programs");
      setPrograms(response.data.data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchPeriods = async () => {
    try {
      const response = await axios.get("/api/academic-periods");
      setPeriods(response.data.data || []);
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.fee_setup_id) {
        await axios.put(`/api/tuition-fees/${formData.fee_setup_id}`, formData);
      } else {
        await axios.post("/api/tuition-fees", formData);
      }
      setShowModal(false);
      resetForm();
      fetchFees();
    } catch (error) {
      console.error("Error saving fee:", error);
      alert("Failed to save tuition fee setup");
    }
  };

  const handleEdit = (fee) => {
    setFormData(fee);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this fee setup?")) {
      try {
        await axios.delete(`/api/tuition-fees/${id}`);
        fetchFees();
      } catch (error) {
        console.error("Error deleting fee:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fee_setup_id: null,
      program_id: "",
      year_level: "1st Year",
      academic_period_id: "",
      tuition_fee: 0,
      laboratory_fee: 0,
      library_fee: 0,
      athletic_fee: 0,
      registration_fee: 0,
      id_fee: 0,
      miscellaneous_fee: 0,
      other_fees: 0,
      is_active: true,
    });
  };

  const calculateTotal = () => {
    return (
      parseFloat(formData.tuition_fee || 0) +
      parseFloat(formData.laboratory_fee || 0) +
      parseFloat(formData.library_fee || 0) +
      parseFloat(formData.athletic_fee || 0) +
      parseFloat(formData.registration_fee || 0) +
      parseFloat(formData.id_fee || 0) +
      parseFloat(formData.miscellaneous_fee || 0) +
      parseFloat(formData.other_fees || 0)
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Tuition Fee Setup
          </h1>
          <p className="text-gray-600 mt-1">
            Configure tuition fees for different programs and year levels
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Fee Setup
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <select
              value={filters.program_id}
              onChange={(e) =>
                setFilters({ ...filters, program_id: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Programs</option>
              {programs.map((prog) => (
                <option key={prog.program_id} value={prog.program_id}>
                  {prog.program_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Period
            </label>
            <select
              value={filters.academic_period_id}
              onChange={(e) =>
                setFilters({ ...filters, academic_period_id: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Periods</option>
              {periods.map((period) => (
                <option key={period.period_id} value={period.period_id}>
                  {period.school_year} - {period.semester}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Level
            </label>
            <select
              value={filters.year_level}
              onChange={(e) =>
                setFilters({ ...filters, year_level: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Year Levels</option>
              {yearLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
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
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Year Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Fee
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
            {fees.map((fee) => (
              <tr key={fee.fee_setup_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {fee.program_name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {fee.year_level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {fee.school_year} - {fee.semester}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  ₱{parseFloat(fee.total_fee || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      fee.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {fee.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(fee)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(fee.fee_setup_id)}
                      className="text-red-600 hover:text-red-800"
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
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {formData.fee_setup_id ? "Edit" : "Add"} Tuition Fee Setup
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Program *
                  </label>
                  <select
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog.program_id} value={prog.program_id}>
                        {prog.program_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Year Level *
                  </label>
                  <select
                    name="year_level"
                    value={formData.year_level}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {yearLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Academic Period *
                  </label>
                  <select
                    name="academic_period_id"
                    value={formData.academic_period_id}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Period</option>
                    {periods.map((period) => (
                      <option key={period.period_id} value={period.period_id}>
                        {period.school_year} - {period.semester}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tuition Fee
                  </label>
                  <input
                    type="number"
                    name="tuition_fee"
                    value={formData.tuition_fee}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Laboratory Fee
                  </label>
                  <input
                    type="number"
                    name="laboratory_fee"
                    value={formData.laboratory_fee}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Library Fee
                  </label>
                  <input
                    type="number"
                    name="library_fee"
                    value={formData.library_fee}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Athletic Fee
                  </label>
                  <input
                    type="number"
                    name="athletic_fee"
                    value={formData.athletic_fee}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Registration Fee
                  </label>
                  <input
                    type="number"
                    name="registration_fee"
                    value={formData.registration_fee}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID Fee
                  </label>
                  <input
                    type="number"
                    name="id_fee"
                    value={formData.id_fee}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Miscellaneous Fee
                  </label>
                  <input
                    type="number"
                    name="miscellaneous_fee"
                    value={formData.miscellaneous_fee}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Other Fees
                  </label>
                  <input
                    type="number"
                    name="other_fees"
                    value={formData.other_fees}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Fee:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₱{calculateTotal().toLocaleString()}
                  </span>
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TuitionFeeSetup;
