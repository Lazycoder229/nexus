import { useState, useEffect } from "react";
import axios from "axios";
import { Download, FileText, Calendar, Search } from "lucide-react";

const PayrollReports = () => {
  const [payrollSetups, setPayrollSetups] = useState([]);
  const [selectedSetup, setSelectedSetup] = useState(null);
  const [reportType, setReportType] = useState("Summary");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    "Summary",
    "Detailed",
    "Department",
    "Tax Report",
    "Bank Transfer",
  ];

  useEffect(() => {
    fetchPayrollSetups();
  }, []);

  const fetchPayrollSetups = async () => {
    try {
      const response = await axios.get("/api/payroll/setups");
      setPayrollSetups(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payroll setups:", error);
    }
  };

  const generateReport = async () => {
    if (!selectedSetup) {
      alert("Please select a payroll period");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `/api/payroll/summary/${selectedSetup}`,
        {
          params: { report_type: reportType },
        }
      );
      setReportData(response.data.data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) {
      alert("Generate a report first");
      return;
    }

    // Create CSV content
    const csvContent = convertToCSV(reportData);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${reportType}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || !data.payslips || data.payslips.length === 0) {
      return "No data available";
    }

    // Headers
    const headers = [
      "Employee Number",
      "Employee Name",
      "Department",
      "Position",
      "Basic Pay",
      "Overtime",
      "Holiday Pay",
      "Night Diff",
      "Allowances",
      "Bonus",
      "Gross Pay",
      "SSS",
      "PhilHealth",
      "Pag-IBIG",
      "Tax",
      "Loan",
      "Other",
      "Total Deductions",
      "Net Pay",
      "Bank Name",
      "Account Number",
    ];

    // Rows
    const rows = data.payslips.map((p) => [
      p.employee_number || "",
      `"${p.first_name} ${p.last_name}"`,
      p.department || "",
      p.position || "",
      parseFloat(p.basic_pay || 0).toFixed(2),
      parseFloat(p.overtime_pay || 0).toFixed(2),
      parseFloat(p.holiday_pay || 0).toFixed(2),
      parseFloat(p.night_differential || 0).toFixed(2),
      parseFloat(p.allowances || 0).toFixed(2),
      parseFloat(p.bonus || 0).toFixed(2),
      parseFloat(p.gross_pay || 0).toFixed(2),
      parseFloat(p.sss_deduction || 0).toFixed(2),
      parseFloat(p.philhealth_deduction || 0).toFixed(2),
      parseFloat(p.pagibig_deduction || 0).toFixed(2),
      parseFloat(p.tax_deduction || 0).toFixed(2),
      parseFloat(p.loan_deduction || 0).toFixed(2),
      parseFloat(p.other_deductions || 0).toFixed(2),
      parseFloat(p.total_deductions || 0).toFixed(2),
      parseFloat(p.net_pay || 0).toFixed(2),
      p.bank_name || "",
      p.bank_account_number || "",
    ]);

    // Combine
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  };

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={24} className="text-indigo-600" />
            Payroll Reports
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Generate and download reports
          </span>
        </div>

        {/* Report Controls */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
            Generate Report
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payroll Period *
              </label>
              <select
                value={selectedSetup || ""}
                onChange={(e) => setSelectedSetup(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">Select a period</option>
                {payrollSetups.map((setup) => (
                  <option key={setup.setup_id} value={setup.setup_id}>
                    {setup.period_type} - {new Date(setup.start_date).toLocaleDateString()} to {new Date(setup.end_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Report Type *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {reportTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={generateReport}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors text-sm border shadow-sm whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700 dark:border-indigo-600 shadow-md shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={14} />
                {loading ? "Generating..." : "Generate"}
              </button>
              {reportData && (
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors text-sm border shadow-sm whitespace-nowrap bg-green-600 text-white hover:bg-green-700 border-green-700 dark:border-green-600 shadow-md shadow-green-500/30"
                >
                  <Download size={14} />
                  CSV
                </button>
              )}
            </div>
          </div>

          {/* Report Description */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">Report Types:</h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <li><strong>Summary:</strong> Overview of total payroll with gross pay, deductions, and net pay</li>
              <li><strong>Detailed:</strong> Complete breakdown of all earnings and deductions per employee</li>
              <li><strong>Department:</strong> Payroll summary grouped by department</li>
              <li><strong>Tax Report:</strong> Tax deductions summary for government compliance</li>
              <li><strong>Bank Transfer:</strong> Bank account details for payroll processing</li>
            </ul>
          </div>
        </div>

        {/* Report Preview */}
        {reportData && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Report Preview</h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Generated: {new Date().toLocaleString()}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4 border-l-4 border-l-indigo-600 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Total Employees</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {reportData.employee_count || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4 border-l-4 border-l-green-600 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Total Gross Pay</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ₱{parseFloat(reportData.total_gross_pay || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4 border-l-4 border-l-red-600 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  ₱{parseFloat(reportData.total_deductions || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4 border-l-4 border-l-blue-600 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Total Net Pay</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ₱{parseFloat(reportData.total_net_pay || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            {reportData.payslips && reportData.payslips.length > 0 && (
              <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-700/70">
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <th className="px-4 py-2.5">Employee</th>
                      <th className="px-4 py-2.5">Department</th>
                      <th className="px-4 py-2.5 text-right">Basic Pay</th>
                      <th className="px-4 py-2.5 text-right">Overtime</th>
                      <th className="px-4 py-2.5 text-right">Allowances</th>
                      <th className="px-4 py-2.5 text-right">Gross Pay</th>
                      <th className="px-4 py-2.5 text-right">Deductions</th>
                      <th className="px-4 py-2.5 text-right">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {reportData.payslips.map((payslip, index) => (
                      <tr key={index} className="text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition duration-150">
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium">{payslip.first_name} {payslip.last_name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{payslip.employee_number}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2">{payslip.department}</td>
                        <td className="px-4 py-2 text-right">₱{parseFloat(payslip.basic_pay || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">₱{parseFloat(payslip.overtime_pay || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">₱{parseFloat(payslip.allowances || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right font-semibold text-green-600 dark:text-green-400">₱{parseFloat(payslip.gross_pay || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right font-semibold text-red-600 dark:text-red-400">₱{parseFloat(payslip.total_deductions || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right font-bold text-indigo-600 dark:text-indigo-400">₱{parseFloat(payslip.net_pay || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 dark:bg-slate-700/70">
                    <tr className="text-sm font-bold text-slate-900 dark:text-white">
                      <td colSpan="5" className="px-4 py-2.5 text-right">TOTALS:</td>
                      <td className="px-4 py-2.5 text-right text-green-600 dark:text-green-400">
                        ₱{parseFloat(reportData.total_gross_pay || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right text-red-600 dark:text-red-400">
                        ₱{parseFloat(reportData.total_deductions || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right text-indigo-600 dark:text-indigo-400">
                        ₱{parseFloat(reportData.total_net_pay || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Bank Transfer Section (if applicable) */}
            {reportType === "Bank Transfer" && reportData.payslips && reportData.payslips.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Bank Transfer Details
                </h4>
                <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-100 dark:bg-slate-700/70">
                      <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        <th className="px-4 py-2.5">Employee</th>
                        <th className="px-4 py-2.5">Bank Name</th>
                        <th className="px-4 py-2.5">Account Number</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                      {reportData.payslips
                        .filter((p) => p.bank_name && p.bank_account_number)
                        .map((payslip, index) => (
                          <tr key={index} className="text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition duration-150">
                            <td className="px-4 py-2">{payslip.first_name} {payslip.last_name}</td>
                            <td className="px-4 py-2">{payslip.bank_name}</td>
                            <td className="px-4 py-2 font-mono">{payslip.bank_account_number}</td>
                            <td className="px-4 py-2 text-right font-semibold">₱{parseFloat(payslip.net_pay || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollReports;
