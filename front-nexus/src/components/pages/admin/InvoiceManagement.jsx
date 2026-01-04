import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2 } from "lucide-react";

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    academic_period_id: "",
    search: "",
  });

  const [formData, setFormData] = useState({
    invoice_id: null,
    student_id: "",
    academic_period_id: "",
    tuition_fee: 0,
    laboratory_fee: 0,
    library_fee: 0,
    athletic_fee: 0,
    registration_fee: 0,
    id_fee: 0,
    miscellaneous_fee: 0,
    other_fees: 0,
    discount_amount: 0,
    scholarship_amount: 0,
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get("/api/invoices", { params: filters });
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get("/api/invoices/summary", {
        params: { academic_period_id: filters.academic_period_id },
      });
      setSummary(response.data.data || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculateSubtotal = () => {
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

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return (
      subtotal -
      parseFloat(formData.discount_amount || 0) -
      parseFloat(formData.scholarship_amount || 0)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        subtotal: calculateSubtotal(),
        total_amount: calculateTotal(),
        status: "Pending",
      };

      if (formData.invoice_id) {
        await axios.put(`/api/invoices/${formData.invoice_id}`, invoiceData);
      } else {
        await axios.post("/api/invoices", invoiceData);
      }
      setShowModal(false);
      resetForm();
      fetchInvoices();
      fetchSummary();
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice");
    }
  };

  const handleEdit = (invoice) => {
    setFormData(invoice);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await axios.delete(`/api/invoices/${id}`);
        fetchInvoices();
        fetchSummary();
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_id: null,
      student_id: "",
      academic_period_id: "",
      tuition_fee: 0,
      laboratory_fee: 0,
      library_fee: 0,
      athletic_fee: 0,
      registration_fee: 0,
      id_fee: 0,
      miscellaneous_fee: 0,
      other_fees: 0,
      discount_amount: 0,
      scholarship_amount: 0,
      invoice_date: new Date().toISOString().split("T")[0],
      due_date: "",
      notes: "",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Invoice Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage student invoices
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
          Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Billed</p>
          <p className="text-2xl font-bold text-blue-600">
            ₱{parseFloat(summary.total_billed || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">
            ₱{parseFloat(summary.total_paid || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Outstanding Balance</p>
          <p className="text-2xl font-bold text-red-600">
            ₱{parseFloat(summary.total_balance || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-800">
            {summary.total_invoices || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search student, invoice..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
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
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div>
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Balance
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
            {invoices.map((invoice) => (
              <tr key={invoice.invoice_id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono">
                  {invoice.invoice_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{invoice.student_name}</div>
                    <div className="text-sm text-gray-500">
                      {invoice.student_number}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  ₱{parseFloat(invoice.total_amount).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600">
                  ₱{parseFloat(invoice.amount_paid).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                  ₱{parseFloat(invoice.balance).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : invoice.status === "Partially Paid"
                        ? "bg-yellow-100 text-yellow-800"
                        : invoice.status === "Overdue"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(invoice)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(invoice.invoice_id)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
            <h2 className="text-2xl font-bold mb-4">
              {formData.invoice_id ? "Edit" : "Create"} Invoice
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Student *
                  </label>
                  <select
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Student</option>
                    {/* Populate with students */}
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    name="invoice_date"
                    value={formData.invoice_date}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  "tuition_fee",
                  "laboratory_fee",
                  "library_fee",
                  "athletic_fee",
                  "registration_fee",
                  "id_fee",
                  "miscellaneous_fee",
                  "other_fees",
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1">
                      {field
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </label>
                    <input
                      type="number"
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    name="discount_amount"
                    value={formData.discount_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Scholarship Amount
                  </label>
                  <input
                    type="number"
                    name="scholarship_amount"
                    value={formData.scholarship_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    ₱{calculateSubtotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Total Discounts:</span>
                  <span className="text-red-600">
                    -₱
                    {(
                      parseFloat(formData.discount_amount || 0) +
                      parseFloat(formData.scholarship_amount || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-lg font-semibold">Total:</span>
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
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
