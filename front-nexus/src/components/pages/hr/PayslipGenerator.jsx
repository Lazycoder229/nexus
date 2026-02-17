import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { Plus, Edit, Trash2, DollarSign, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PayslipGenerator = () => {
  const [activeTab, setActiveTab] = useState("setups");
  const [payrollSetups, setPayrollSetups] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState(null);
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isAutoCreating, setIsAutoCreating] = useState(false);

  // Fetch eligible employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get(`/api/users`);
        const users = (response.data.data || response.data || []).filter(
          (u) =>
            u.role &&
            ["admin", "faculty", "hr", "accounting", "staff", "employee"].includes(
              u.role.toLowerCase()
            )
        );
        setEligibleEmployees(users);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Pagination states
  const [setupCurrentPage, setSetupCurrentPage] = useState(1);
  const [payslipCurrentPage, setPayslipCurrentPage] = useState(1);
  const [setupSearch, setSetupSearch] = useState("");
  const [payslipSearch, setPayslipSearch] = useState("");
  const itemsPerPage = 10;

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
      const response = await api.get(`/api/payroll/setups`);
      setPayrollSetups(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payroll setups:", error);
    }
  };

  const fetchPayslips = async (setupId) => {
    try {
      if (!setupId) return;
      const response = await api.get(
        `/api/payroll/payslips/setup/${setupId}`
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

  const handlePayslipInputChange = async (e) => {
    const { name, value } = e.target;

    // Handle special user selection logic
    if (name === "user_selection") {
      setSelectedUserId(value);

      const selectedUser = eligibleEmployees.find(u => u.user_id.toString() === value.toString());

      if (selectedUser) {
        if (!selectedUser.employee_id) {
          // No employee record - Prepare for auto-creation
          setPayslipFormData(prev => ({
            ...prev,
            employee_id: "",
            basic_pay: "",
            allowances: "",
            sss_deduction: "",
            philhealth_deduction: "",
            pagibig_deduction: "",
            loan_deduction: "",
            other_deductions: ""
          }));
          return;
        }

        // Valid employee selected
        const empId = selectedUser.employee_id;
        setPayslipFormData(prev => ({ ...prev, employee_id: empId }));

        // Auto-fetch deductions
        try {
          const [employeeRes, deductionsRes] = await Promise.all([
            api.get(`/api/employees/${empId}`),
            api.get(`/api/deductions?employee_id=${empId}&status=Active`)
          ]);

          const employee = employeeRes.data.data;
          const deductions = deductionsRes.data.data || [];

          // Calculate deductions
          let sss = 0, philhealth = 0, pagibig = 0, loan = 0, other = 0;

          deductions.forEach(deduction => {
            const amount = parseFloat(deduction.amount || 0);
            switch (deduction.deduction_type) {
              case "SSS":
                sss += amount;
                break;
              case "PhilHealth":
                philhealth += amount;
                break;
              case "Pag-IBIG":
                pagibig += amount;
                break;
              case "Loan":
              case "Cash Advance":
                loan += amount;
                break;
              default:
                other += amount;
            }
          });

          // Update form with employee data and deductions
          setPayslipFormData(prev => ({
            ...prev,
            basic_pay: employee.basic_salary || "",
            allowances: employee.allowances || "",
            sss_deduction: sss.toFixed(2),
            philhealth_deduction: philhealth.toFixed(2),
            pagibig_deduction: pagibig.toFixed(2),
            loan_deduction: loan.toFixed(2),
            other_deductions: other.toFixed(2),
          }));
        } catch (error) {
          console.error("Error fetching employee deductions:", error);
        }
      } else {
        // Reset if no user selected
        setPayslipFormData(prev => ({ ...prev, employee_id: "" }));
      }
      return;
    }

    setPayslipFormData({ ...payslipFormData, [name]: value });
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    try {
      if (setupFormData.setup_id) {
        await api.put(
          `/api/payroll/setups/${setupFormData.setup_id}`,
          setupFormData
        );
      } else {
        await api.post(`/api/payroll/setups`, setupFormData);
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

    // Validate employee selection
    if (!selectedUserId) {
      alert("Please select an employee/user.");
      return;
    }

    try {
      let finalEmployeeId = payslipFormData.employee_id;

      // Auto-create employee record if missing
      if (!finalEmployeeId && selectedUserId) {
        setIsAutoCreating(true);
        const selectedUser = eligibleEmployees.find(u => u.user_id.toString() === selectedUserId.toString());

        try {
          const createRes = await api.post('/api/employees', {
            user_id: selectedUserId,
            department: "Unassigned",
            position: selectedUser?.role || "Employee",
            basic_salary: Number(payslipFormData.basic_pay) || 0,
            allowances: Number(payslipFormData.allowances) || 0,
            employment_status: "Active",
            employment_type: "Full-time",
            hire_date: new Date().toISOString().split('T')[0],
            emergency_contact_name: "N/A",
            emergency_contact_phone: "N/A",
            emergency_contact_relationship: "N/A",
            bank_name: "N/A",
            bank_account_number: "N/A",
            notes: "Auto-created from Payslip Generator"
          });

          if (createRes.data.success) {
            finalEmployeeId = createRes.data.employee_id;
            // Update the local list to reflect the new ID immediately (optional but good for UX)
            setEligibleEmployees(prev => prev.map(u =>
              u.user_id.toString() === selectedUserId.toString()
                ? { ...u, employee_id: finalEmployeeId, employee_number: "New" }
                : u
            ));
          } else {
            throw new Error("Failed to auto-create employee record.");
          }
        } catch (err) {
          console.error("Auto-create failed", err);
          alert("Failed to auto-create employee record: " + JSON.stringify(err.response?.data || err.message));
          setIsAutoCreating(false);
          return;
        }
      }

      const payload = {
        ...payslipFormData,
        employee_id: finalEmployeeId, // Use the (potentially new) ID
        payroll_setup_id: selectedSetup, // Use selectedSetup directly as it is the ID
      };

      if (payslipFormData.payslip_id) {
        await api.put(
          `/api/payroll/payslips/${payslipFormData.payslip_id}`,
          payload
        );
      } else {
        await api.post(`/api/payroll/payslips`, payload);
      }
      setShowPayslipModal(false);
      resetPayslipForm();
      fetchPayslips(selectedSetup);
    } catch (error) {
      console.error("Error saving payslip:", error);
      alert("Failed to save payslip: " + JSON.stringify(error.response?.data || error.message));
    } finally {
      setIsAutoCreating(false);
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
        await api.delete(`/api/payroll/setups/${id}`);
        fetchPayrollSetups();
      } catch (error) {
        console.error("Error deleting payroll setup:", error);
      }
    }
  };

  const handleDeletePayslip = async (id) => {
    if (window.confirm("Delete this payslip?")) {
      try {
        await api.delete(`/api/payroll/payslips/${id}`);
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
    setSelectedUserId(""); // Reset selected user ID for the form
  };

  // Filter and paginate setups
  const filteredSetups = payrollSetups.filter((setup) =>
    Object.values(setup).some((val) =>
      String(val).toLowerCase().includes(setupSearch.toLowerCase())
    )
  );
  const setupTotalPages = Math.ceil(filteredSetups.length / itemsPerPage);
  const displayedSetups = filteredSetups.slice(
    (setupCurrentPage - 1) * itemsPerPage,
    setupCurrentPage * itemsPerPage
  );

  // Filter and paginate payslips
  const filteredPayslips = payslips.filter((payslip) =>
    Object.values(payslip).some((val) =>
      String(val).toLowerCase().includes(payslipSearch.toLowerCase())
    )
  );
  const payslipTotalPages = Math.ceil(filteredPayslips.length / itemsPerPage);
  const displayedPayslips = filteredPayslips.slice(
    (payslipCurrentPage - 1) * itemsPerPage,
    payslipCurrentPage * itemsPerPage
  );

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign size={24} className="text-indigo-600" />
            Payslip Generator
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Manage payroll periods and payslips
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-300 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("setups")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-all duration-300 whitespace-nowrap border-b-2 ${activeTab === "setups"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 shadow-t-sm"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300"
              }`}
          >
            <FileText size={16} /> Payroll Periods
          </button>
          <button
            onClick={() => setActiveTab("payslips")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-all duration-300 whitespace-nowrap border-b-2 ${activeTab === "payslips"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 shadow-t-sm"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300"
              }`}
          >
            <DollarSign size={16} /> Payslips
          </button>
        </div>

        {/* Payroll Setups Tab */}
        {activeTab === "setups" && (
          <div className="space-y-3">
            {/* Search and Add Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-grow max-w-xs">
                <input
                  type="text"
                  placeholder="Search payroll periods..."
                  value={setupSearch}
                  onChange={(e) => {
                    setSetupSearch(e.target.value);
                    setSetupCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white text-sm transition-all shadow-inner"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              </div>

              {/* Add Button */}
              <button
                onClick={() => {
                  resetSetupForm();
                  setShowSetupModal(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors text-sm border shadow-sm whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700 dark:border-indigo-600 shadow-md shadow-indigo-500/30"
              >
                <Plus size={14} />
                Add Payroll Period
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-700/70">
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <th className="px-4 py-2.5">Period Type</th>
                    <th className="px-4 py-2.5">Start Date</th>
                    <th className="px-4 py-2.5">End Date</th>
                    <th className="px-4 py-2.5">Pay Date</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {displayedSetups.length > 0 ? (
                    displayedSetups.map((setup) => (
                      <tr
                        key={setup.payroll_setup_id}
                        className={`text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition duration-150 cursor-pointer ${selectedSetup === setup.payroll_setup_id ? "bg-indigo-50 dark:bg-slate-700/70" : ""
                          }`}
                        onClick={() => {
                          setSelectedSetup(setup.payroll_setup_id);
                          setActiveTab("payslips");
                        }}
                      >
                        <td className="px-4 py-2 font-medium">{setup.period_type}</td>
                        <td className="px-4 py-2">{new Date(setup.start_date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{new Date(setup.end_date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{new Date(setup.pay_date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${setup.status === "Completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : setup.status === "Processing"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : setup.status === "Draft"
                                  ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              }`}
                          >
                            {setup.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditSetup(setup)}
                              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSetup(setup.payroll_setup_id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                        No payroll periods found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700 dark:text-slate-200">
              <span className="text-xs sm:text-sm">
                Showing <span className="font-semibold">{Math.min((setupCurrentPage - 1) * itemsPerPage + 1, filteredSetups.length)}</span> to <span className="font-semibold">{Math.min(setupCurrentPage * itemsPerPage, filteredSetups.length)}</span> of <span className="font-semibold">{filteredSetups.length}</span> periods
              </span>
              <div className="flex gap-1 items-center mt-2 sm:mt-0">
                <button
                  onClick={() => setSetupCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={setupCurrentPage === 1}
                  className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {setupCurrentPage}
                </span>
                <button
                  onClick={() => setSetupCurrentPage((p) => Math.min(p + 1, setupTotalPages))}
                  disabled={setupCurrentPage === setupTotalPages || setupTotalPages === 0}
                  className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payslips Tab */}
        {activeTab === "payslips" && (
          <div className="space-y-3">
            {/* Period Selection and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Period Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payroll Period:
                </label>
                <select
                  value={selectedSetup || ""}
                  onChange={(e) => setSelectedSetup(e.target.value)}
                  className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 min-w-[280px]"
                >
                  <option value="">Select a period</option>
                  {payrollSetups.map((setup) => (
                    <option key={setup.payroll_setup_id} value={setup.payroll_setup_id}>
                      {setup.period_type} - {new Date(setup.start_date).toLocaleDateString()} to {new Date(setup.end_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search and Add Button */}
              {selectedSetup && (
                <div className="flex items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search payslips..."
                      value={payslipSearch}
                      onChange={(e) => {
                        setPayslipSearch(e.target.value);
                        setPayslipCurrentPage(1);
                      }}
                      className="pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white text-sm transition-all shadow-inner w-48"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={() => {
                      resetPayslipForm();
                      setShowPayslipModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors text-sm border shadow-sm whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700 dark:border-indigo-600 shadow-md shadow-indigo-500/30"
                  >
                    <Plus size={14} />
                    Generate Payslip
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            {selectedSetup ? (
              <>
                <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-100 dark:bg-slate-700/70">
                      <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        <th className="px-4 py-2.5">Payslip #</th>
                        <th className="px-4 py-2.5">Employee</th>
                        <th className="px-4 py-2.5 text-right">Gross Pay</th>
                        <th className="px-4 py-2.5 text-right">Deductions</th>
                        <th className="px-4 py-2.5 text-right">Net Pay</th>
                        <th className="px-4 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                      {displayedPayslips.length > 0 ? (
                        displayedPayslips.map((payslip) => (
                          <tr
                            key={payslip.payslip_id}
                            className="text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition duration-150"
                          >
                            <td className="px-4 py-2 font-mono text-sm">{payslip.payslip_number}</td>
                            <td className="px-4 py-2">
                              <div>
                                <div className="font-medium">
                                  {payslip.first_name} {payslip.last_name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  {payslip.employee_number}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-green-600 dark:text-green-400">
                              ₱{parseFloat(payslip.gross_pay || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-red-600 dark:text-red-400">
                              ₱{parseFloat(payslip.total_deductions || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-indigo-600 dark:text-indigo-400">
                              ₱{parseFloat(payslip.net_pay || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleEditPayslip(payslip)}
                                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeletePayslip(payslip.payslip_id)}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                            No payslips found matching your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700 dark:text-slate-200">
                  <span className="text-xs sm:text-sm">
                    Showing <span className="font-semibold">{Math.min((payslipCurrentPage - 1) * itemsPerPage + 1, filteredPayslips.length)}</span> to <span className="font-semibold">{Math.min(payslipCurrentPage * itemsPerPage, filteredPayslips.length)}</span> of <span className="font-semibold">{filteredPayslips.length}</span> payslips
                  </span>
                  <div className="flex gap-1 items-center mt-2 sm:mt-0">
                    <button
                      onClick={() => setPayslipCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={payslipCurrentPage === 1}
                      className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {payslipCurrentPage}
                    </span>
                    <button
                      onClick={() => setPayslipCurrentPage((p) => Math.min(p + 1, payslipTotalPages))}
                      disabled={payslipCurrentPage === payslipTotalPages || payslipTotalPages === 0}
                      className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                <FileText size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Please select a payroll period to view and manage payslips.
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  You can create a new payroll period from the "Payroll Periods" tab.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Setup Modal */}
        {showSetupModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-2 z-50 transition-opacity duration-300" onClick={() => setShowSetupModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl transform transition-transform duration-300 scale-100 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-t-lg">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {setupFormData.setup_id ? "Edit" : "Add"} Payroll Period
                </h3>
                <button
                  onClick={() => {
                    setShowSetupModal(false);
                    resetSetupForm();
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSetupSubmit} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Period Type *
                    </label>
                    <select
                      name="period_type"
                      value={setupFormData.period_type}
                      onChange={handleSetupInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      {periodTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={setupFormData.status}
                      onChange={handleSetupInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      {setupStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={setupFormData.start_date}
                      onChange={handleSetupInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={setupFormData.end_date}
                      onChange={handleSetupInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Pay Date *
                    </label>
                    <input
                      type="date"
                      name="pay_date"
                      value={setupFormData.pay_date}
                      onChange={handleSetupInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={setupFormData.notes}
                      onChange={handleSetupInputChange}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSetupModal(false);
                      resetSetupForm();
                    }}
                    className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/30"
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
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-2 z-50 transition-opacity duration-300 overflow-y-auto" onClick={() => setShowPayslipModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl my-8 transform transition-transform duration-300 scale-100 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-t-lg z-10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {payslipFormData.payslip_id ? "Edit" : "Generate"} Payslip
                </h3>
                <button
                  onClick={() => {
                    setShowPayslipModal(false);
                    resetPayslipForm();
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handlePayslipSubmit} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Employee ID *
                    </label>
                    <select
                      name="user_selection"
                      value={selectedUserId}
                      onChange={handlePayslipInputChange}
                      required
                      className={`w-full px-3 py-2 text-sm border rounded-md transition-colors border-slate-300 dark:border-slate-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700`}
                    >
                      <option value="">Select Employee</option>
                      {eligibleEmployees.map((emp) => (
                        <option
                          key={emp.user_id}
                          value={emp.user_id}
                        >
                          {emp.first_name} {emp.last_name} ({emp.role})
                          {emp.employee_id
                            ? ` - ${emp.employee_number || "No Emp ID"}`
                            : " - (Auto-create Record)"}
                        </option>
                      ))}
                    </select>
                    {!payslipFormData.employee_id && selectedUserId && (
                      <p className="mt-1 text-xs text-blue-600 font-medium">
                        Employee Record will be created automatically.
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <h3 className="font-semibold text-sm mb-2 text-green-600 dark:text-green-400 border-b border-green-200 dark:border-green-800 pb-1">
                      Earnings
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Basic Pay *
                    </label>
                    <input
                      type="number"
                      name="basic_pay"
                      value={payslipFormData.basic_pay}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Overtime Pay
                    </label>
                    <input
                      type="number"
                      name="overtime_pay"
                      value={payslipFormData.overtime_pay}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Holiday Pay
                    </label>
                    <input
                      type="number"
                      name="holiday_pay"
                      value={payslipFormData.holiday_pay}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Night Differential
                    </label>
                    <input
                      type="number"
                      name="night_differential"
                      value={payslipFormData.night_differential}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Allowances
                    </label>
                    <input
                      type="number"
                      name="allowances"
                      value={payslipFormData.allowances}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Bonus
                    </label>
                    <input
                      type="number"
                      name="bonus"
                      value={payslipFormData.bonus}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="col-span-2">
                    <h3 className="font-semibold text-sm mb-2 text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-800 pb-1">
                      Deductions
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      SSS Deduction
                    </label>
                    <input
                      type="number"
                      name="sss_deduction"
                      value={payslipFormData.sss_deduction}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      PhilHealth Deduction
                    </label>
                    <input
                      type="number"
                      name="philhealth_deduction"
                      value={payslipFormData.philhealth_deduction}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Pag-IBIG Deduction
                    </label>
                    <input
                      type="number"
                      name="pagibig_deduction"
                      value={payslipFormData.pagibig_deduction}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tax Deduction
                    </label>
                    <input
                      type="number"
                      name="tax_deduction"
                      value={payslipFormData.tax_deduction}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Loan Deduction
                    </label>
                    <input
                      type="number"
                      name="loan_deduction"
                      value={payslipFormData.loan_deduction}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Other Deductions
                    </label>
                    <input
                      type="number"
                      name="other_deductions"
                      value={payslipFormData.other_deductions}
                      onChange={handlePayslipInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={payslipFormData.notes}
                      onChange={handlePayslipInputChange}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPayslipModal(false);
                      resetPayslipForm();
                    }}
                    className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAutoCreating}
                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAutoCreating ? "Creating Record & Saving..." : "Save Payslip"}
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

export default PayslipGenerator;
