import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, DollarSign, FileText } from "lucide-react";

const PayslipGenerator = () => {
  const [activeTab, setActiveTab] = useState("setups");
  const [payrollSetups, setPayrollSetups] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState(null);

  const [setupFormData, setSetupFormData] = useState({
    setup_id: null,
    period_type: "Monthly",
    start_date: "",
    end_date: "",
    pay_date: "",
    status: "Draft",
    notes: "",
  });

  const [payslipFormData, setPayslipFormData] = useState({
    payslip_id: null,
    setup_id: "",
    employee_id: "",
    basic_pay: "",
    overtime_pay: "",
    holiday_pay: "",
    night_differential: "",
    allowances: "",
    bonus: "",
    sss_deduction: "",
    philhealth_deduction: "",
    pagibig_deduction: "",
    tax_deduction: "",
    loan_deduction: "",
    other_deductions: "",
    notes: "",
  });

  const periodTypes = ["Monthly", "Semi-Monthly", "Weekly", "Daily"];
  const setupStatuses = ["Draft", "Processing", "Completed", "Cancelled"];

  useEffect(() => {
    fetchPayrollSetups();
    if (selectedSetup) {
      fetchPayslips(selectedSetup);
    }
  }, [selectedSetup]);

  const fetchPayrollSetups = async () => {
    try {
      const response = await axios.get("/api/payroll/setups");
      setPayrollSetups(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payroll setups:", error);
    }
  };

  const fetchPayslips = async (setupId) => {
    try {
      const response = await axios.get(
        `/api/payroll/payslips?setup_id=${setupId}`
      );
      setPayslips(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payslips:", error);
    }
  };

  const handleSetupInputChange = (e) => {
    const { name, value } = e.target;
    setSetupFormData({ ...setupFormData, [name]: value });
  };

  const handlePayslipInputChange = (e) => {
    const { name, value } = e.target;
    setPayslipFormData({ ...payslipFormData, [name]: value });
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    try {
      if (setupFormData.setup_id) {
        await axios.put(
          `/api/payroll/setups/${setupFormData.setup_id}`,
          setupFormData
        );
      } else {
        await axios.post("/api/payroll/setups", setupFormData);
      }
      setShowSetupModal(false);
      resetSetupForm();
      fetchPayrollSetups();
    } catch (error) {
      console.error("Error saving payroll setup:", error);
      alert("Failed to save payroll setup");
    }
  };

  const handlePayslipSubmit = async (e) => {
    e.preventDefault();
    try {
      if (payslipFormData.payslip_id) {
        await axios.put(
          `/api/payroll/payslips/${payslipFormData.payslip_id}`,
          payslipFormData
        );
      } else {
        await axios.post("/api/payroll/payslips", payslipFormData);
      }
      setShowPayslipModal(false);
      resetPayslipForm();
      if (selectedSetup) {
        fetchPayslips(selectedSetup);
      }
    } catch (error) {
      console.error("Error saving payslip:", error);
      alert("Failed to save payslip");
    }
  };

  const handleEditSetup = (setup) => {
    setSetupFormData(setup);
    setShowSetupModal(true);
  };

  const handleEditPayslip = (payslip) => {
    setPayslipFormData(payslip);
    setShowPayslipModal(true);
  };

  const handleDeleteSetup = async (id) => {
    if (window.confirm("Delete this payroll setup?")) {
      try {
        await axios.delete(`/api/payroll/setups/${id}`);
        fetchPayrollSetups();
      } catch (error) {
        console.error("Error deleting payroll setup:", error);
      }
    }
  };

  const handleDeletePayslip = async (id) => {
    if (window.confirm("Delete this payslip?")) {
      try {
        await axios.delete(`/api/payroll/payslips/${id}`);
        if (selectedSetup) {
          fetchPayslips(selectedSetup);
        }
      } catch (error) {
        console.error("Error deleting payslip:", error);
      }
    }
  };

  const resetSetupForm = () => {
    setSetupFormData({
      setup_id: null,
      period_type: "Monthly",
      start_date: "",
      end_date: "",
      pay_date: "",
      status: "Draft",
      notes: "",
    });
  };

  const resetPayslipForm = () => {
    setPayslipFormData({
      payslip_id: null,
      setup_id: selectedSetup || "",
      employee_id: "",
      basic_pay: "",
      overtime_pay: "",
      holiday_pay: "",
      night_differential: "",
      allowances: "",
      bonus: "",
      sss_deduction: "",
      philhealth_deduction: "",
      pagibig_deduction: "",
      tax_deduction: "",
      loan_deduction: "",
      other_deductions: "",
      notes: "",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Payslip Generator
          </h1>
          <p className="text-gray-600 mt-1">
            Manage payroll periods and payslips
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-4">
            <button
              onClick={() => setActiveTab("setups")}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "setups"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Payroll Periods
            </button>
            <button
              onClick={() => setActiveTab("payslips")}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "payslips"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Payslips
            </button>
          </nav>
        </div>
      </div>

      {/* Payroll Setups Tab */}
      {activeTab === "setups" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                resetSetupForm();
                setShowSetupModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Payroll Period
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Period Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pay Date
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
                {payrollSetups.map((setup) => (
                  <tr
                    key={setup.setup_id}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedSetup === setup.setup_id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      setSelectedSetup(setup.setup_id);
                      setActiveTab("payslips");
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {setup.period_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(setup.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(setup.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(setup.pay_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          setup.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : setup.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : setup.status === "Draft"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {setup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleEditSetup(setup)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSetup(setup.setup_id)}
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
        </>
      )}

      {/* Payslips Tab */}
      {activeTab === "payslips" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Payroll Period
              </label>
              <select
                value={selectedSetup || ""}
                onChange={(e) => setSelectedSetup(e.target.value)}
                className="border rounded-lg px-3 py-2 min-w-[250px]"
              >
                <option value="">Select a period</option>
                {payrollSetups.map((setup) => (
                  <option key={setup.setup_id} value={setup.setup_id}>
                    {setup.period_type} -{" "}
                    {new Date(setup.start_date).toLocaleDateString()} to{" "}
                    {new Date(setup.end_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            {selectedSetup && (
              <button
                onClick={() => {
                  resetPayslipForm();
                  setShowPayslipModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Generate Payslip
              </button>
            )}
          </div>

          {selectedSetup && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payslip #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Gross Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Deductions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Net Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payslips.map((payslip) => (
                    <tr key={payslip.payslip_id}>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                        {payslip.payslip_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">
                            {payslip.first_name} {payslip.last_name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {payslip.employee_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                        ₱{parseFloat(payslip.gross_pay || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-red-600">
                        ₱
                        {parseFloat(
                          payslip.total_deductions || 0
                        ).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                        ₱{parseFloat(payslip.net_pay || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPayslip(payslip)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeletePayslip(payslip.payslip_id)
                            }
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
          )}
        </>
      )}

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">
              {setupFormData.setup_id ? "Edit" : "Add"} Payroll Period
            </h2>
            <form onSubmit={handleSetupSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Period Type *
                  </label>
                  <select
                    name="period_type"
                    value={setupFormData.period_type}
                    onChange={handleSetupInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {periodTypes.map((type) => (
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
                    value={setupFormData.status}
                    onChange={handleSetupInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {setupStatuses.map((status) => (
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
                    value={setupFormData.start_date}
                    onChange={handleSetupInputChange}
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
                    value={setupFormData.end_date}
                    onChange={handleSetupInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Pay Date *
                  </label>
                  <input
                    type="date"
                    name="pay_date"
                    value={setupFormData.pay_date}
                    onChange={handleSetupInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={setupFormData.notes}
                    onChange={handleSetupInputChange}
                    rows="2"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowSetupModal(false);
                    resetSetupForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {showPayslipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {payslipFormData.payslip_id ? "Edit" : "Generate"} Payslip
            </h2>
            <form onSubmit={handlePayslipSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="number"
                    name="employee_id"
                    value={payslipFormData.employee_id}
                    onChange={handlePayslipInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold text-lg mb-2 text-green-600">
                    Earnings
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Basic Pay *
                  </label>
                  <input
                    type="number"
                    name="basic_pay"
                    value={payslipFormData.basic_pay}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Overtime Pay
                  </label>
                  <input
                    type="number"
                    name="overtime_pay"
                    value={payslipFormData.overtime_pay}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Holiday Pay
                  </label>
                  <input
                    type="number"
                    name="holiday_pay"
                    value={payslipFormData.holiday_pay}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Night Differential
                  </label>
                  <input
                    type="number"
                    name="night_differential"
                    value={payslipFormData.night_differential}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Allowances
                  </label>
                  <input
                    type="number"
                    name="allowances"
                    value={payslipFormData.allowances}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bonus
                  </label>
                  <input
                    type="number"
                    name="bonus"
                    value={payslipFormData.bonus}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold text-lg mb-2 text-red-600">
                    Deductions
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    SSS Deduction
                  </label>
                  <input
                    type="number"
                    name="sss_deduction"
                    value={payslipFormData.sss_deduction}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    PhilHealth Deduction
                  </label>
                  <input
                    type="number"
                    name="philhealth_deduction"
                    value={payslipFormData.philhealth_deduction}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pag-IBIG Deduction
                  </label>
                  <input
                    type="number"
                    name="pagibig_deduction"
                    value={payslipFormData.pagibig_deduction}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tax Deduction
                  </label>
                  <input
                    type="number"
                    name="tax_deduction"
                    value={payslipFormData.tax_deduction}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Loan Deduction
                  </label>
                  <input
                    type="number"
                    name="loan_deduction"
                    value={payslipFormData.loan_deduction}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Other Deductions
                  </label>
                  <input
                    type="number"
                    name="other_deductions"
                    value={payslipFormData.other_deductions}
                    onChange={handlePayslipInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={payslipFormData.notes}
                    onChange={handlePayslipInputChange}
                    rows="2"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayslipModal(false);
                    resetPayslipForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Payslip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipGenerator;
