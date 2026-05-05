import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { Plus, Edit, Trash2, Search, FileText, ChevronLeft, ChevronRight, Users } from "lucide-react";

const STAFF_ROLES = ["Faculty", "Admin", "HR", "Accounting", "Staff"];

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    academic_period_id: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  const [staffFormData, setStaffFormData] = useState({
    user_id: "",
    academic_period_id: "",
    fee_label: "",
    amount: 0,
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
    fetchPeriods();
    fetchStudents();
    fetchStaffUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/api/users`);
      const allUsers = response.data.users || response.data.data || response.data || [];
      setStudents(allUsers.filter((u) => u.role === "Student"));
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const response = await api.get(`/api/users`);
      const allUsers = response.data.users || response.data.data || response.data || [];
      setStaffUsers(allUsers.filter((u) => STAFF_ROLES.includes(u.role)));
    } catch (error) {
      console.error("Error fetching staff users:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await api.get(`/api/invoices`, { params: filters });
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/api/invoices/summary`, {
        params: { academic_period_id: filters.academic_period_id },
      });
      setSummary(response.data.data || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchPeriods = async () => {
    try {
      const response = await api.get(`/api/academic-periods`);
      setPeriods(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStaffInputChange = (e) => {
    const { name, value } = e.target;
    setStaffFormData({ ...staffFormData, [name]: value });
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
        await api.put(`/api/invoices/${formData.invoice_id}`, invoiceData);
      } else {
        await api.post(`/api/invoices`, invoiceData);
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

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedUser = staffUsers.find(
        (u) => u.user_id?.toString() === staffFormData.user_id?.toString()
      );
      const amount = parseFloat(staffFormData.amount || 0);

      // 1. Create the invoice
      const invoiceData = {
        student_id: staffFormData.user_id,  // reuse student_id column for staff user
        academic_period_id: staffFormData.academic_period_id || null,
        tuition_fee: 0,
        laboratory_fee: 0,
        library_fee: 0,
        athletic_fee: 0,
        registration_fee: 0,
        id_fee: 0,
        miscellaneous_fee: 0,
        other_fees: amount,
        subtotal: amount,
        discount_amount: 0,
        scholarship_amount: 0,
        total_amount: amount,
        invoice_date: staffFormData.invoice_date,
        due_date: staffFormData.due_date || staffFormData.invoice_date,
        status: "Pending",
        notes: `[STAFF INVOICE] ${staffFormData.fee_label}${staffFormData.notes ? " — " + staffFormData.notes : ""}`,
      };
      await api.post(`/api/invoices`, invoiceData);

      // 2. Mirror as income transaction so IncomeExpensesReports reflects it
      await api.post(`/api/income-expenses`, {
        transaction_type: "Income",
        category: "Other Fees",
        amount: amount,
        transaction_date: staffFormData.invoice_date,
        department: selectedUser?.department || "General",
        description: `Staff invoice — ${staffFormData.fee_label} for ${selectedUser?.first_name ?? ""} ${selectedUser?.last_name ?? ""} (${selectedUser?.role ?? ""})`,
        reference_number: "",
        payment_method: "Cash",
        recorded_by: "Accounting",
      });

      setShowStaffModal(false);
      resetStaffForm();
      fetchInvoices();
      fetchSummary();
      alert("Staff invoice created and recorded as income successfully.");
    } catch (error) {
      console.error("Error saving staff invoice:", error);
      alert("Failed to save staff invoice: " + JSON.stringify(error.response?.data || error.message));
    }
  };

  const handleEdit = (invoice) => {
    setFormData(invoice);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await api.delete(`/api/invoices/${id}`);
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

  const resetStaffForm = () => {
    setStaffFormData({
      user_id: "",
      academic_period_id: "",
      fee_label: "",
      amount: 0,
      invoice_date: new Date().toISOString().split("T")[0],
      due_date: "",
      notes: "",
    });
  };

  // Filtered + paginated invoices
  const searchTerm = filters.search.toLowerCase();
  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoice_number?.toLowerCase().includes(searchTerm) ||
    invoice.student_name?.toLowerCase().includes(searchTerm) ||
    invoice.student_number?.toLowerCase().includes(searchTerm)
  );
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedData = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoice Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create and manage student invoices</p>
          </div>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Data Integrity: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Billed</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            ₱{parseFloat(summary.total_billed || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₱{parseFloat(summary.total_paid || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Outstanding Balance</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            ₱{parseFloat(summary.total_balance || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Invoices</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {summary.total_invoices || 0}
          </p>
        </div>
      </div>

      {/* Filters + Action Buttons */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search student, invoice..."
                  value={filters.search}
                  onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filters.status}
                onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
              <select
                value={filters.academic_period_id}
                onChange={(e) => { setFilters({ ...filters, academic_period_id: e.target.value }); setCurrentPage(1); }}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Periods</option>
                {periods.map((period) => (
                  <option key={period.period_id} value={period.period_id}>
                    {period.school_year} - {period.semester}
                  </option>
                ))}
              </select>
              {/* Staff Invoice Button */}
              <button
                onClick={() => { resetStaffForm(); setShowStaffModal(true); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors shadow-md shadow-amber-500/30"
              >
                <Users size={18} />
                Staff Invoice
              </button>
              {/* Student Invoice Button */}
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/30"
              >
                <Plus size={18} />
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              {["Invoice #", "Student / Staff", "Date", "Total", "Paid", "Balance", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No invoices found matching your search criteria.
                </td>
              </tr>
            ) : paginatedData.map((invoice) => {
              const isStaff = invoice.notes?.startsWith("[STAFF INVOICE]");
              return (
                <tr key={invoice.invoice_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-2 whitespace-nowrap font-mono text-sm text-slate-900 dark:text-white">
                    {invoice.invoice_number}
                    {isStaff && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded">
                        STAFF
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="font-medium text-sm text-slate-900 dark:text-white">{invoice.student_name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{invoice.student_number}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap font-semibold text-sm text-slate-900 dark:text-white">
                    ₱{parseFloat(invoice.total_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400">
                    ₱{parseFloat(invoice.amount_paid || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap font-semibold text-sm text-red-600 dark:text-red-400">
                    ₱{parseFloat(invoice.balance || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      invoice.status === "Paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : invoice.status === "Partially Paid" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      : invoice.status === "Overdue" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(invoice)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(invoice.invoice_id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700 dark:text-slate-200">
        <span className="text-xs sm:text-sm">
          Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span> | Total Records: {filteredInvoices.length}
        </span>
        <div className="flex gap-1 mt-2 sm:mt-0">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Student Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-2 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-t-lg z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {formData.invoice_id ? "Edit" : "Create"} Invoice
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Student *</label>
                  <select name="student_id" value={formData.student_id} onChange={handleInputChange} required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.student_number ? `${s.student_number} - ` : ""}{s.first_name} {s.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Period *</label>
                  <select name="academic_period_id" value={formData.academic_period_id} onChange={handleInputChange} required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select Period</option>
                    {periods.map((p) => (
                      <option key={p.period_id} value={p.period_id}>{p.school_year} - {p.semester}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Date *</label>
                  <input type="date" name="invoice_date" value={formData.invoice_date} onChange={handleInputChange} required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input type="date" name="due_date" value={formData.due_date} onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["tuition_fee","laboratory_fee","library_fee","athletic_fee","registration_fee","id_fee","miscellaneous_fee","other_fees"].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {field.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </label>
                    <input type="number" name={field} value={formData[field]} onChange={handleInputChange} step="0.01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Amount</label>
                  <input type="number" name="discount_amount" value={formData.discount_amount} onChange={handleInputChange} step="0.01"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Scholarship Amount</label>
                  <input type="number" name="scholarship_amount" value={formData.scholarship_amount} onChange={handleInputChange} step="0.01"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₱{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Total Discounts:</span>
                  <span className="text-red-600 dark:text-red-400">
                    -₱{(parseFloat(formData.discount_amount || 0) + parseFloat(formData.scholarship_amount || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-indigo-200 dark:border-indigo-800 pt-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total:</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">₱{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-md shadow-indigo-500/30">
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Invoice Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-2 z-50" onClick={() => setShowStaffModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20 rounded-t-lg z-10">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Staff / Faculty Invoice</h3>
              </div>
              <button onClick={() => { setShowStaffModal(false); resetStaffForm(); }} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleStaffSubmit} className="p-4 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded px-3 py-2">
                This invoice will also be recorded as an <strong>Income transaction</strong> in the Income &amp; Expenses report automatically.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Staff / Faculty Member *</label>
                <select name="user_id" value={staffFormData.user_id} onChange={handleStaffInputChange} required
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-amber-500 focus:border-amber-500">
                  <option value="">Select Member</option>
                  {STAFF_ROLES.map((role) => {
                    const group = staffUsers.filter((u) => u.role === role);
                    if (!group.length) return null;
                    return (
                      <optgroup key={role} label={role}>
                        {group.map((u) => (
                          <option key={u.user_id} value={u.user_id}>
                            {u.first_name} {u.last_name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Period</label>
                <select name="academic_period_id" value={staffFormData.academic_period_id} onChange={handleStaffInputChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-amber-500 focus:border-amber-500">
                  <option value="">None / Not Applicable</option>
                  {periods.map((p) => (
                    <option key={p.period_id} value={p.period_id}>{p.school_year} - {p.semester}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Fee / Charge Label *</label>
                <input type="text" name="fee_label" value={staffFormData.fee_label} onChange={handleStaffInputChange} required
                  placeholder="e.g. ID Replacement Fee, Training Fee..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount *</label>
                <input type="number" name="amount" value={staffFormData.amount} onChange={handleStaffInputChange} step="0.01" required min="0.01"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Date *</label>
                  <input type="date" name="invoice_date" value={staffFormData.invoice_date} onChange={handleStaffInputChange} required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-amber-500 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input type="date" name="due_date" value={staffFormData.due_date} onChange={handleStaffInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-amber-500 focus:border-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea name="notes" value={staffFormData.notes} onChange={handleStaffInputChange} rows="2"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Amount:</span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  ₱{parseFloat(staffFormData.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <button type="button" onClick={() => { setShowStaffModal(false); resetStaffForm(); }}
                  className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 shadow-md shadow-amber-500/30">
                  Create Staff Invoice
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