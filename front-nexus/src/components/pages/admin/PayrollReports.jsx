import { useState, useEffect } from "react";
import axios from "axios";
import { Download, FileText, Calendar } from "lucide-react";

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payroll Reports</h1>
          <p className="text-gray-600 mt-1">
            Generate and download payroll reports
          </p>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Payroll Period *
            </label>
            <select
              value={selectedSetup || ""}
              onChange={(e) => setSelectedSetup(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
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
          <div>
            <label className="block text-sm font-medium mb-1">
              Report Type *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FileText size={20} />
              {loading ? "Generating..." : "Generate Report"}
            </button>
            {reportData && (
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Download size={20} />
                Download CSV
              </button>
            )}
          </div>
        </div>

        {/* Report Description */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Report Types:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <strong>Summary:</strong> Overview of total payroll with gross
              pay, deductions, and net pay
            </li>
            <li>
              <strong>Detailed:</strong> Complete breakdown of all earnings and
              deductions per employee
            </li>
            <li>
              <strong>Department:</strong> Payroll summary grouped by department
            </li>
            <li>
              <strong>Tax Report:</strong> Tax deductions summary for government
              compliance
            </li>
            <li>
              <strong>Bank Transfer:</strong> Bank account details for payroll
              processing
            </li>
          </ul>
        </div>
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Report Preview</h2>
            <div className="text-sm text-gray-600">
              Generated: {new Date().toLocaleString()}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">
                Total Employees
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {reportData.employee_count || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">
                Total Gross Pay
              </p>
              <p className="text-2xl font-bold text-green-700">
                ₱{parseFloat(reportData.total_gross_pay || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">
                Total Deductions
              </p>
              <p className="text-2xl font-bold text-red-700">
                ₱{parseFloat(reportData.total_deductions || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">
                Total Net Pay
              </p>
              <p className="text-2xl font-bold text-purple-700">
                ₱{parseFloat(reportData.total_net_pay || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          {reportData.payslips && reportData.payslips.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Basic Pay
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Overtime
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Allowances
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Gross Pay
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Deductions
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Net Pay
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.payslips.map((payslip, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-sm">
                            {payslip.first_name} {payslip.last_name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {payslip.employee_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {payslip.department}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        ₱{parseFloat(payslip.basic_pay || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        ₱
                        {parseFloat(payslip.overtime_pay || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        ₱{parseFloat(payslip.allowances || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                        ₱{parseFloat(payslip.gross_pay || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                        ₱
                        {parseFloat(
                          payslip.total_deductions || 0
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                        ₱{parseFloat(payslip.net_pay || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-3 text-right font-bold text-gray-700"
                    >
                      TOTALS:
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-600">
                      ₱
                      {parseFloat(
                        reportData.total_gross_pay || 0
                      ).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-red-600">
                      ₱
                      {parseFloat(
                        reportData.total_deductions || 0
                      ).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                      ₱
                      {parseFloat(
                        reportData.total_net_pay || 0
                      ).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Bank Transfer Section (if applicable) */}
          {reportType === "Bank Transfer" &&
            reportData.payslips &&
            reportData.payslips.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Bank Transfer Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Bank Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Account Number
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.payslips
                        .filter((p) => p.bank_name && p.bank_account_number)
                        .map((payslip, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {payslip.first_name} {payslip.last_name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {payslip.bank_name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                              {payslip.bank_account_number}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold">
                              ₱
                              {parseFloat(
                                payslip.net_pay || 0
                              ).toLocaleString()}
                            </td>
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
  );
};

export default PayrollReports;
