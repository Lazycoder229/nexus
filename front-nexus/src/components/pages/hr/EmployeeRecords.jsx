import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Users, Briefcase, DollarSign, Search, ChevronLeft, ChevronRight } from "lucide-react";

const EmployeeRecords = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    department: "",
    employment_status: "",
    employment_type: "",
    search: "",
  });

  const [formData, setFormData] = useState({
    employee_id: null,
    user_id: "",
    department: "",
    position: "",
    employment_type: "Full-time",
    employment_status: "Active",
    hire_date: "",
    end_date: "",
    basic_salary: "",
    allowances: "",
    sss_number: "",
    tin_number: "",
    philhealth_number: "",
    pagibig_number: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    bank_name: "",
    bank_account_number: "",
    notes: "",
  });

  const employmentTypes = ["Full-time", "Part-time", "Contract", "Temporary"];
  const employmentStatuses = ["Active", "On Leave", "Terminated", "Retired"];
  const departments = [
    "Administration",
    "Academic Affairs",
    "Student Affairs",
    "Finance",
    "HR",
    "IT",
    "Facilities",
  ];

  useEffect(() => {
    fetchEmployees();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/api/employees", { params: filters });
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get("/api/employees/summary");
      setSummary(response.data.data || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.employee_id) {
        await axios.put(`/api/employees/${formData.employee_id}`, formData);
      } else {
        await axios.post("/api/employees", formData);
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
      fetchSummary();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Failed to save employee record");
    }
  };

  const handleEdit = (employee) => {
    setFormData(employee);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this employee record?")) {
      try {
        await axios.delete(`/api/employees/${id}`);
        fetchEmployees();
        fetchSummary();
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: null,
      user_id: "",
      department: "",
      position: "",
      employment_type: "Full-time",
      employment_status: "Active",
      hire_date: "",
      end_date: "",
      basic_salary: "",
      allowances: "",
      sss_number: "",
      tin_number: "",
      philhealth_number: "",
      pagibig_number: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      bank_name: "",
      bank_account_number: "",
      notes: "",
    });
  };

  return (
    <div className="dark:bg-slate-900 p-3 sm:p-4 transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto space-y-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users size={24} className="text-indigo-600" />
          Employee Records
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Data Integrity: Online
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-4 border-l-4 border-indigo-500 dark:border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Employees</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {summary.total_employees || 0}
              </p>
            </div>
            <Users className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-4 border-l-4 border-green-500 dark:border-green-600">
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {summary.active_employees || 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-4 border-l-4 border-blue-500 dark:border-blue-600">
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Full-time</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {summary.full_time || 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-4 border-l-4 border-purple-500 dark:border-purple-600">
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Part-time</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {summary.part_time || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input - LEFT */}
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search employees..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white text-sm transition-all shadow-inner"
          />
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
        </div>

        {/* Filters - RIGHT */}
        <div className="flex items-center gap-2">
          <select
            value={filters.department}
            onChange={(e) =>
              setFilters({ ...filters, department: e.target.value })
            }
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-40"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            value={filters.employment_status}
            onChange={(e) =>
              setFilters({ ...filters, employment_status: e.target.value })
            }
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-32"
          >
            <option value="">All Status</option>
            {employmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={filters.employment_type}
            onChange={(e) =>
              setFilters({ ...filters, employment_type: e.target.value })
            }
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white text-sm w-32"
          >
            <option value="">All Types</option>
            {employmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors shadow-sm border shadow-md shadow-indigo-500/30"
          >
            <Plus size={14} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-100 dark:bg-slate-700/70">
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <th className="px-4 py-2.5">
                Employee #
              </th>
              <th className="px-4 py-2.5">
                Name
              </th>
              <th className="px-4 py-2.5">
                Department
              </th>
              <th className="px-4 py-2.5">
                Position
              </th>
              <th className="px-4 py-2.5">
                Type
              </th>
              <th className="px-4 py-2.5">
                Basic Salary
              </th>
              <th className="px-4 py-2.5">
                Status
              </th>
              <th className="px-4 py-2.5 w-1/12 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
            {employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length ? (
              employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((employee) => (
                <tr key={employee.employee_id} className="text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition duration-150">
                  <td className="px-4 py-2 font-mono">
                    {employee.employee_number}
                  </td>
                  <td className="px-4 py-2">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {employee.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {employee.department}
                  </td>
                  <td className="px-4 py-2">
                    {employee.position}
                  </td>
                  <td className="px-4 py-2">
                    {employee.employment_type}
                  </td>
                  <td className="px-4 py-2 font-semibold">
                    ₱{parseFloat(employee.basic_salary || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        employee.employment_status === "Active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : employee.employment_status === "On Leave"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {employee.employment_status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      title="Edit Employee"
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.employee_id)}
                      title="Delete Employee"
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="p-4 text-center text-slate-500 italic"
                >
                  No employee records found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700 dark:text-slate-200">
        <span className="text-xs sm:text-sm">
          Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{Math.ceil(employees.length / itemsPerPage)}</span> | Total Records:{" "}
          {employees.length}
        </span>
        <div className="flex gap-1 items-center mt-2 sm:mt-0">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(employees.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(employees.length / itemsPerPage)}
            className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-2 z-50 transition-opacity duration-300" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl transform transition-transform duration-300 scale-100 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-t-lg z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {formData.employee_id ? "Edit" : "Add"} Employee
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    User ID *
                  </label>
                  <input
                    type="number"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Employment Type *
                  </label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    {employmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status *
                  </label>
                  <select
                    name="employment_status"
                    value={formData.employment_status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    {employmentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hire Date *
                  </label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Basic Salary *
                  </label>
                  <input
                    type="number"
                    name="basic_salary"
                    value={formData.basic_salary}
                    onChange={handleInputChange}
                    step="0.01"
                    required
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
                    value={formData.allowances}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    SSS Number
                  </label>
                  <input
                    type="text"
                    name="sss_number"
                    value={formData.sss_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    TIN Number
                  </label>
                  <input
                    type="text"
                    name="tin_number"
                    value={formData.tin_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    PhilHealth Number
                  </label>
                  <input
                    type="text"
                    name="philhealth_number"
                    value={formData.philhealth_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Pag-IBIG Number
                  </label>
                  <input
                    type="text"
                    name="pagibig_number"
                    value={formData.pagibig_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Relationship
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
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
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/30"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRecords;
