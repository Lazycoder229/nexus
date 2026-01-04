import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Eye,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";

const PaymentCollection = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    payment_method: "",
    payment_status: "",
    start_date: "",
    end_date: "",
    search: "",
  });

  const [formData, setFormData] = useState({
    invoice_id: "",
    student_id: "",
    amount_paid: "",
    payment_method: "Cash",
    payment_date: new Date().toISOString().split("T")[0],
    bank_name: "",
    check_number: "",
    reference_number: "",
    notes: "",
  });

  const paymentMethods = [
    "Cash",
    "Check",
    "Bank Transfer",
    "Credit Card",
    "Debit Card",
    "Online Payment",
    "GCash",
    "PayMaya",
  ];

  useEffect(() => {
    fetchPayments();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get("/api/payments", { params: filters });
      setPayments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get("/api/payments/summary", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date,
        },
      });
      setSummary(response.data.data || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchInvoices = async (studentId = null) => {
    try {
      const url = studentId
        ? `/api/invoices/student/${studentId}`
        : "/api/invoices";
      const response = await axios.get(url, {
        params: { status: "Pending,Partially Paid" },
      });
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "student_id" && value) {
      fetchInvoices(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/payments", formData);
      setShowModal(false);
      resetForm();
      fetchPayments();
      fetchSummary();
      alert("Payment recorded successfully!");
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Failed to record payment");
    }
  };

  const handleVerify = async (id) => {
    if (window.confirm("Verify this payment?")) {
      try {
        await axios.patch(`/api/payments/${id}/verify`);
        fetchPayments();
      } catch (error) {
        console.error("Error verifying payment:", error);
      }
    }
  };

  const viewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const resetForm = () => {
    setFormData({
      invoice_id: "",
      student_id: "",
      amount_paid: "",
      payment_method: "Cash",
      payment_date: new Date().toISOString().split("T")[0],
      bank_name: "",
      check_number: "",
      reference_number: "",
      notes: "",
    });
    setInvoices([]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Payment Collection
          </h1>
          <p className="text-gray-600 mt-1">
            Record and manage student payments
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
          Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Collected</p>
          <p className="text-2xl font-bold text-green-600">
            ₱{parseFloat(summary.total_collected || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Verified</p>
          <p className="text-2xl font-bold text-blue-600">
            ₱{parseFloat(summary.verified_amount || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-600">
            ₱{parseFloat(summary.pending_amount || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-800">
            {summary.total_payments || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <select
              value={filters.payment_method}
              onChange={(e) =>
                setFilters({ ...filters, payment_method: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Methods</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.payment_status}
              onChange={(e) =>
                setFilters({ ...filters, payment_status: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Cleared">Cleared</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) =>
                setFilters({ ...filters, start_date: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) =>
                setFilters({ ...filters, end_date: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
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
            {payments.map((payment) => (
              <tr key={payment.payment_id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                  {payment.payment_reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{payment.student_name}</div>
                    <div className="text-sm text-gray-500">
                      {payment.student_number}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.invoice_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  ₱{parseFloat(payment.amount_paid).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.payment_method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(payment.payment_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      payment.payment_status === "Verified"
                        ? "bg-green-100 text-green-800"
                        : payment.payment_status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {payment.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewReceipt(payment)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Receipt"
                    >
                      <Eye size={18} />
                    </button>
                    {payment.payment_status === "Pending" && (
                      <button
                        onClick={() => handleVerify(payment.payment_id)}
                        className="text-green-600 hover:text-green-800"
                        title="Verify Payment"
                      >
                        <FileText size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Invoice *
                  </label>
                  <select
                    name="invoice_id"
                    value={formData.invoice_id}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Invoice</option>
                    {invoices.map((inv) => (
                      <option key={inv.invoice_id} value={inv.invoice_id}>
                        {inv.invoice_number} - {inv.student_name} (Balance: ₱
                        {parseFloat(inv.balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount Paid *
                  </label>
                  <input
                    type="number"
                    name="amount_paid"
                    value={formData.amount_paid}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Method *
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Check/Reference Number
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleInputChange}
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
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Payment Receipt</h2>
              <p className="text-gray-600">
                {selectedPayment.payment_reference}
              </p>
            </div>
            <div className="border-t border-b py-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="font-semibold">
                    {selectedPayment.student_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student Number</p>
                  <p className="font-semibold">
                    {selectedPayment.student_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Invoice</p>
                  <p className="font-semibold">
                    {selectedPayment.invoice_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(
                      selectedPayment.payment_date
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold">
                    {selectedPayment.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="font-semibold text-green-600 text-xl">
                    ₱{parseFloat(selectedPayment.amount_paid).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowReceiptModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCollection;
