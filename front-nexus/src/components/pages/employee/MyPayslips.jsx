import { useState, useEffect } from "react";
import api from "../../../api/axios";
import {
  DollarSign,
  Download,
  Eye,
  Building2,
  Briefcase,
  Calendar,
} from "lucide-react";

const MyPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingPayslipId, setDownloadingPayslipId] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    console.log("🚀 MyPayslips component mounted");
    fetchMyPayslips();
  }, []);

  useEffect(() => {
    console.log("📌 Payslips state updated:", payslips);
    console.log(`📊 Total payslips: ${payslips.length}`);
  }, [payslips]);

  const fetchMyPayslips = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching payslips for current user...");
      const response = await api.get(`/api/payroll/my-payslips`);
      console.log("📊 API Response:", response.data);
      console.log("📋 Payslips Data:", response.data.data);
      console.log("✅ Number of payslips:", response.data.data?.length || 0);
      setPayslips(response.data.data || []);
    } catch (error) {
      console.error("❌ Error fetching payslips:", error);
      console.error("Response Status:", error.response?.status);
      console.error("Response Data:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setShowModal(true);
  };

  const handleDownloadPDF = async (payslip) => {
    try {
      setDownloadingPayslipId(payslip.payslip_id);
      console.log("📥 Starting PDF download for:", payslip.payslip_number);

      // Wait for library to be available
      if (!window.html2pdf) {
        console.error("❌ html2pdf library not loaded");
        setDownloadingPayslipId(null);
        alert("PDF library is loading. Please try again in a moment.");
        return;
      }

      // Check if we need to open the modal first
      if (
        !showModal ||
        !selectedPayslip ||
        selectedPayslip.payslip_id !== payslip.payslip_id
      ) {
        // Open modal with selected payslip
        setSelectedPayslip(payslip);
        setShowModal(true);

        // Wait for modal and element to render (increased timeout for DOM render)
        await new Promise((resolve) => {
          setTimeout(() => {
            performPDFGeneration(payslip);
            resolve();
          }, 800); // Increased wait time for DOM to fully render
        });
      } else {
        // Modal is already open, generate PDF immediately
        performPDFGeneration(payslip);
      }
    } catch (error) {
      console.error("❌ Error downloading PDF:", error);
      setDownloadingPayslipId(null);
      alert("Failed to download payslip");
    }
  };

  const performPDFGeneration = (payslip) => {
    // Defer PDF generation to next event loop cycle to keep UI responsive
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          console.log(
            "🔍 Creating clean PDF HTML for:",
            `payslip-${payslip.payslip_id}`,
          );

          // Create a clean container with simple CSS (no Tailwind)
          const pdfContainer = document.createElement("div");
          pdfContainer.style.cssText = `
            width: 210mm;
            height: 297mm;
            padding: 20px;
            background-color: white;
            color: #333;
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
          `;

          // Build clean HTML content
          pdfContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #000;">PAYSLIP</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Professional Payroll System</p>
            </div>

            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; background-color: #f5f5f5; border: 1px solid #ddd; vertical-align: top;">
                  <p style="margin: 0 0 5px 0; font-size: 11px; font-weight: bold; color: #666; text-transform: uppercase;">EMPLOYEE</p>
                  <p style="margin: 0 0 3px 0; font-size: 14px; font-weight: bold; color: #000;">${payslip.first_name || ""} ${
                    payslip.last_name || ""
                  }</p>
                  <p style="margin: 0; font-size: 12px; color: #666;">${payslip.employee_number || "N/A"}</p>
                </td>
                <td style="padding: 10px; background-color: #f5f5f5; border: 1px solid #ddd; vertical-align: top;">
                  <p style="margin: 0 0 5px 0; font-size: 11px; font-weight: bold; color: #666; text-transform: uppercase;">PERIOD</p>
                  <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000;">
                    ${
                      payslip.start_date
                        ? new Date(payslip.start_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "N/A"
                    } to ${
                      payslip.end_date
                        ? new Date(payslip.end_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "N/A"
                    }
                  </p>
                </td>
              </tr>
            </table>

            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 8px; color: #000;">EARNINGS</p>
              <table style="width: 100%; margin-bottom: 10px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; border-bottom: 1px solid #ddd; color: #333;">Basic Salary</td>
                  <td style="padding: 5px 0; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #000;">₱${parseFloat(
                    payslip.basic_salary || 0,
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                </tr>
              </table>
              <div style="padding: 10px; background-color: #e8f5e9; border: 1px solid #4caf50; border-radius: 3px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold; color: #2e7d32; font-size: 13px;">GROSS PAY</span>
                <span style="font-weight: bold; color: #2e7d32; font-size: 13px;">₱${parseFloat(
                  payslip.gross_pay || 0,
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 8px; color: #000;">DEDUCTIONS</p>
              <div style="padding: 10px; background-color: #ffebee; border: 1px solid #f44336; border-radius: 3px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold; color: #c62828; font-size: 13px;">TOTAL DEDUCTIONS</span>
                <span style="font-weight: bold; color: #c62828; font-size: 13px;">₱${parseFloat(
                  payslip.total_deductions || 0,
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
              </div>
            </div>

            <div style="padding: 20px; background-color: #e3f2fd; border: 2px solid #1976d2; border-radius: 8px; margin-top: 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: bold; color: #1565c0; text-transform: uppercase;">NET PAY</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1565c0;">₱${parseFloat(
                payslip.net_pay || 0,
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 11px; color: #999;">
              <p style="margin: 0;">This is a confidential document. Keep it safe.</p>
            </div>
          `;

          // Temporarily add to DOM
          document.body.appendChild(pdfContainer);

          const opt = {
            margin: 5,
            filename: `Payslip_${payslip.payslip_number}_${
              new Date().toISOString().split("T")[0]
            }.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: "#ffffff",
              async: true,
              logging: false,
            },
            jsPDF: {
              orientation: "portrait",
              unit: "mm",
              format: "a4",
            },
          };

          console.log("📄 Starting clean PDF generation...");

          // Use async PDF generation
          window
            .html2pdf()
            .set(opt)
            .from(pdfContainer)
            .save()
            .then(() => {
              // Remove temporary container
              document.body.removeChild(pdfContainer);
              setDownloadingPayslipId(null);
              console.log("✅ PDF generated successfully");
            })
            .catch((error) => {
              // Remove temporary container
              if (document.body.contains(pdfContainer)) {
                document.body.removeChild(pdfContainer);
              }
              console.error("❌ Error in PDF save:", error);
              setDownloadingPayslipId(null);
              alert("Failed to save PDF: " + (error.message || error));
            });
        } catch (error) {
          console.error("❌ Error during PDF generation:", error);
          setDownloadingPayslipId(null);
          alert("Failed to generate PDF: " + error.message);
        }
      }, 50); // Small delay to ensure UI updates first
    });
  };

  // Filter payslips
  const filteredPayslips = payslips.filter((payslip) =>
    Object.values(payslip).some(
      (val) =>
        val && String(val).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const paginatedPayslips = filteredPayslips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredPayslips.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign size={24} className="text-indigo-600" />
            My Payslips
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            View and download your payslips
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search payslips by period, amount..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white text-sm"
          />
        </div>

        {/* Payslips List */}
        <div className="space-y-3">
          {paginatedPayslips.length > 0 ? (
            paginatedPayslips.map((payslip) => (
              <div
                key={payslip.payslip_id}
                className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Payslip Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {payslip.payslip_number}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        Period
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          GROSS PAY
                        </p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          ₱{parseFloat(payslip.gross_pay || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          DEDUCTIONS
                        </p>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          ₱
                          {parseFloat(
                            payslip.total_deductions || 0,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          NET PAY
                        </p>
                        <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                          ₱{parseFloat(payslip.net_pay || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          PERIOD
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {payslip.start_date
                            ? new Date(payslip.start_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => handleViewPayslip(payslip)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(payslip)}
                      disabled={downloadingPayslipId === payslip.payslip_id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors border ${
                        downloadingPayslipId === payslip.payslip_id
                          ? "bg-indigo-400 text-white border-indigo-500 cursor-not-allowed opacity-75"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700"
                      }`}
                    >
                      {downloadingPayslipId === payslip.payslip_id ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Download size={14} />
                      )}
                      <span className="hidden sm:inline">
                        {downloadingPayslipId === payslip.payslip_id
                          ? "Generating..."
                          : "PDF"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm
                  ? "No payslips found matching your search"
                  : "No payslips available yet"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Payslip Details Modal */}
        {showModal && selectedPayslip && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedPayslip.payslip_number}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPDF(selectedPayslip)}
                    disabled={
                      downloadingPayslipId === selectedPayslip.payslip_id
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors border ${
                      downloadingPayslipId === selectedPayslip.payslip_id
                        ? "bg-indigo-400 text-white border-indigo-500 cursor-not-allowed opacity-75"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700"
                    }`}
                  >
                    {downloadingPayslipId === selectedPayslip.payslip_id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Download PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Payslip Content - Printable */}
              <div
                id={`payslip-${selectedPayslip.payslip_id}`}
                className="p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {/* Header */}
                <div className="text-center mb-8 border-b pb-4">
                  <h1 className="text-2xl font-bold">PAYSLIP</h1>
                  <p className="text-sm text-slate-600">
                    Professional Payroll System
                  </p>
                </div>

                {/* Employee Info Row */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      EMPLOYEE
                    </p>
                    <p className="font-semibold">
                      {selectedPayslip.first_name} {selectedPayslip.last_name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {selectedPayslip.employee_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      PERIOD
                    </p>
                    <p className="font-semibold">
                      {selectedPayslip.start_date
                        ? new Date(
                            selectedPayslip.start_date,
                          ).toLocaleDateString()
                        : "N/A"}{" "}
                      to{" "}
                      {selectedPayslip.end_date
                        ? new Date(
                            selectedPayslip.end_date,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      DEPARTMENT
                    </p>
                    <p className="font-semibold">
                      {selectedPayslip.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      POSITION
                    </p>
                    <p className="font-semibold">{selectedPayslip.position}</p>
                  </div>
                </div>

                {/* Earnings Section */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2 border-b-2 pb-1">
                    EARNINGS
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-1">Basic Salary</td>
                        <td className="text-right">
                          ₱
                          {parseFloat(
                            selectedPayslip.basic_salary || 0,
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      {(selectedPayslip.allowances || 0) > 0 && (
                        <tr className="border-b">
                          <td className="py-1">Allowances</td>
                          <td className="text-right">
                            ₱
                            {parseFloat(
                              selectedPayslip.allowances,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                      {(selectedPayslip.overtime_pay || 0) > 0 && (
                        <tr className="border-b">
                          <td className="py-1">Overtime Pay</td>
                          <td className="text-right">
                            ₱
                            {parseFloat(
                              selectedPayslip.overtime_pay,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                      {(selectedPayslip.bonus || 0) > 0 && (
                        <tr className="border-b">
                          <td className="py-1">Bonus</td>
                          <td className="text-right">
                            ₱
                            {parseFloat(selectedPayslip.bonus).toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 },
                            )}
                          </td>
                        </tr>
                      )}
                      <tr className="font-bold bg-green-50 dark:bg-green-900/20">
                        <td className="py-2">GROSS PAY</td>
                        <td className="text-right text-green-600 dark:text-green-400">
                          ₱
                          {parseFloat(
                            selectedPayslip.gross_pay || 0,
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions Section */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2 border-b-2 pb-1">
                    DEDUCTIONS
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {(selectedPayslip.sss_deduction || 0) > 0 && (
                        <tr className="border-b">
                          <td className="py-1">SSS</td>
                          <td className="text-right">
                            ₱
                            {parseFloat(
                              selectedPayslip.sss_deduction,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                      {(selectedPayslip.philhealth_deduction || 0) > 0 && (
                        <tr className="border-b">
                          <td className="py-1">PhilHealth</td>
                          <td className="text-right">
                            ₱
                            {parseFloat(
                              selectedPayslip.philhealth_deduction,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                      {(selectedPayslip.pagibig_deduction || 0) > 0 && (
                        <tr className="border-b">
                          <td className="py-1">Pag-IBIG</td>
                          <td className="text-right">
                            ₱
                            {parseFloat(
                              selectedPayslip.pagibig_deduction,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                      {(selectedPayslip.tax_deduction || 0) > 0 && (
                        <tr className="border-b">
                          <td className="py-1">Withholding Tax</td>
                          <td className="text-right">
                            ₱
                            {parseFloat(
                              selectedPayslip.tax_deduction,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                      {(selectedPayslip.loan_deduction || 0) > 0 && (
                        <tr className="border-b">
                          <td className="py-1">Loan Deduction</td>
                          <td className="text-right">
                            ₱
                            {parseFloat(
                              selectedPayslip.loan_deduction,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                      {(selectedPayslip.other_deductions || 0) > 0 && (
                        <tr className="border-b">
                          <td className="py-1">Other Deductions</td>
                          <td className="text-right">
                            ₱
                            {parseFloat(
                              selectedPayslip.other_deductions,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                      <tr className="font-bold bg-red-50 dark:bg-red-900/20">
                        <td className="py-2">TOTAL DEDUCTIONS</td>
                        <td className="text-right text-red-600 dark:text-red-400">
                          ₱
                          {parseFloat(
                            selectedPayslip.total_deductions || 0,
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Net Pay Section */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-2 border-indigo-600">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    NET PAY
                  </p>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    ₱
                    {parseFloat(selectedPayslip.net_pay || 0).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t text-xs text-slate-600 dark:text-slate-400 text-center">
                  <p>This is a confidential document. Keep it safe.</p>
                  <p>
                    Generated on {new Date().toLocaleDateString()} at{" "}
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadPDF(selectedPayslip)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPayslips;
