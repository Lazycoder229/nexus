import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { Plus, Edit, Trash2, Award, DollarSign, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";

const ScholarshipFundAllocation = () => {
  const [programs, setPrograms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    scholarship_type: "",
    academic_period_id: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [programForm, setProgramForm] = useState({
    scholarship_id: null,
    scholarship_name: "",
    scholarship_code: "",
    scholarship_type: "Merit-based",
    discount_type: "Percentage",
    discount_value: "",
    funding_source: "",
    total_budget: "",
    max_beneficiaries: "",
    academic_period_id: "",
    required_gpa: "",
    required_income_level: "",
    eligibility_criteria: "",
    description: "",
  });

  const [allocationForm, setAllocationForm] = useState({
    allocation_id: null,
    scholarship_id: "",
    student_id: "",
    amount_allocated: "",
    allocation_date: new Date().toISOString().split("T")[0],
    disbursement_status: "Pending",
    disbursement_date: "",
    remarks: "",
  });

  const scholarshipTypes = [
    "Merit-based",
    "Need-based",
    "Athletic",
    "Academic",
    "Leadership",
    "Community Service",
    "Government",
    "Private",
  ];

  const disbursementStatuses = [
    "Pending",
    "Approved",
    "Disbursed",
    "Cancelled",
  ];

  useEffect(() => {
    fetchPrograms();
    fetchAllocations();
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPeriods = async () => {
    try {
      const response = await api.get("/api/academic-periods");
      // Adjust based on common API response pattern
      const periodList = response.data.data || response.data || [];
      setPeriods(periodList);
    } catch (error) {
      console.error("Error fetching academic periods:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await api.get(`/api/scholarships/programs`, {
        params: filters,
      });
      setPrograms(response.data.data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await api.get(`/api/scholarships/allocations`, {
        params: filters,
      });
      setAllocations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching allocations:", error);
    }
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    try {
      if (programForm.scholarship_id) {
        await api.put(
          `/api/scholarships/programs/${programForm.scholarship_id}`,
          programForm
        );
      } else {
        await api.post(`/api/scholarships/programs`, programForm);
      }
      setShowProgramModal(false);
      resetProgramForm();
      fetchPrograms();
      alert("Scholarship program saved successfully!");
    } catch (error) {
      console.error("Error saving program:", error);
      alert("Failed to save scholarship program");
    }
  };

  const handleAllocationSubmit = async (e) => {
    e.preventDefault();
    try {
      if (allocationForm.allocation_id) {
        await api.put(
          `/api/scholarships/allocations/${allocationForm.allocation_id}`,
          allocationForm
        );
      } else {
        await api.post(`/api/scholarships/allocations`, allocationForm);
      }
      setShowAllocationModal(false);
      resetAllocationForm();
      fetchAllocations();
      fetchPrograms();
      alert("Allocation saved successfully!");
    } catch (error) {
      console.error("Error saving allocation:", error);
      alert("Failed to save allocation");
    }
  };

  const handleDeleteProgram = async (id) => {
    if (window.confirm("Delete this scholarship program?")) {
      try {
        await api.delete(`/api/scholarships/programs/${id}`);
        fetchPrograms();
      } catch (error) {
        console.error("Error deleting program:", error);
      }
    }
  };

  const handleDeleteAllocation = async (id) => {
    if (window.confirm("Delete this allocation?")) {
      try {
        await api.delete(`/api/scholarships/allocations/${id}`);
        fetchAllocations();
        fetchPrograms();
      } catch (error) {
        console.error("Error deleting allocation:", error);
      }
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm("Approve this scholarship allocation?")) {
      try {
        await api.patch(`/api/scholarships/allocations/${id}/approve`);
        fetchAllocations();
        fetchPrograms();
      } catch (error) {
        console.error("Error approving allocation:", error);
      }
    }
  };

  const resetProgramForm = () => {
    setProgramForm({
      scholarship_id: null,
      scholarship_name: "",
      scholarship_code: "",
      scholarship_type: "Merit-based",
      discount_type: "Percentage",
      discount_value: "",
      funding_source: "",
      total_budget: "",
      max_beneficiaries: "",
      academic_period_id: "",
      required_gpa: "",
      required_income_level: "",
      eligibility_criteria: "",
      description: "",
    });
  };

  const resetAllocationForm = () => {
    setAllocationForm({
      allocation_id: null,
      scholarship_id: "",
      student_id: "",
      amount_allocated: "",
      allocation_date: new Date().toISOString().split("T")[0],
      disbursement_status: "Pending",
      disbursement_date: "",
      remarks: "",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Scholarship Fund Allocation
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage scholarship programs and student allocations
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Data Integrity: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search programs, students..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filters.scholarship_type}
                onChange={(e) => {
                  setFilters({ ...filters, scholarship_type: e.target.value });
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Types</option>
                {scholarshipTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={filters.academic_period_id}
                onChange={(e) => {
                  setFilters({ ...filters, academic_period_id: e.target.value });
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Periods</option>
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.school_year} - {period.semester}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Status</option>
                {disbursementStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  resetProgramForm();
                  setShowProgramModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/30"
              >
                <Award size={18} />
                New Program
              </button>
              <button
                onClick={() => {
                  resetAllocationForm();
                  setShowAllocationModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/30"
              >
                <Plus size={18} />
                Allocate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scholarship Programs */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
          <Award className="text-purple-600 dark:text-purple-400" />
          Scholarship Programs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <div
              key={program.scholarship_id}
              className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {program.scholarship_name}
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {program.scholarship_code}
                  </div>
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setProgramForm(program);
                      setShowProgramModal(true);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProgram(program.scholarship_id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between gap-1 mb-2">
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded-full">
                  {program.scholarship_type}
                </span>
                {program.school_year && (
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs rounded-full">
                    {program.school_year} {program.semester}
                  </span>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Budget:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₱{parseFloat(program.total_budget || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Allocated:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ₱
                    {parseFloat(program.allocated_amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Available:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ₱
                    {parseFloat(program.available_amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Users size={14} />
                    Beneficiaries:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {program.total_recipients || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allocations Table */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
          <DollarSign className="text-emerald-600 dark:text-emerald-400" />
          Student Allocations
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Scholarship
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
              {(() => {
                const searchTerm = filters.search.toLowerCase();
                const filtered = allocations.filter((allocation) => {
                  const matchesSearch =
                    allocation.student_name?.toLowerCase().includes(searchTerm) ||
                    allocation.student_number?.toLowerCase().includes(searchTerm) ||
                    allocation.scholarship_name?.toLowerCase().includes(searchTerm);
                  return matchesSearch;
                });

                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

                if (paginatedData.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No allocations found matching your search criteria.
                      </td>
                    </tr>
                  );
                }

                return paginatedData.map((allocation) => (
                  <tr key={allocation.allocation_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-sm text-slate-900 dark:text-white">
                          {allocation.student_name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {allocation.student_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      {allocation.scholarship_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                      ₱{parseFloat(allocation.amount_allocated).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      {new Date(allocation.allocation_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${allocation.disbursement_status === "Disbursed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : allocation.disbursement_status === "Approved"
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : allocation.disbursement_status === "Cancelled"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                      >
                        {allocation.disbursement_status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        {allocation.disbursement_status === "Pending" && (
                          <button
                            onClick={() =>
                              handleApprove(allocation.allocation_id)
                            }
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setAllocationForm(allocation);
                            setShowAllocationModal(true);
                          }}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAllocation(allocation.allocation_id)
                          }
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700 dark:text-slate-200">
          <span className="text-xs sm:text-sm">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{(() => {
              const searchTerm = filters.search.toLowerCase();
              const filtered = allocations.filter((allocation) => {
                const matchesSearch =
                  allocation.student_name?.toLowerCase().includes(searchTerm) ||
                  allocation.student_number?.toLowerCase().includes(searchTerm) ||
                  allocation.scholarship_name?.toLowerCase().includes(searchTerm);
                return matchesSearch;
              });
              return Math.ceil(filtered.length / itemsPerPage) || 1;
            })()}</span> | Total Records:{" "}
            {(() => {
              const searchTerm = filters.search.toLowerCase();
              const filtered = allocations.filter((allocation) => {
                const matchesSearch =
                  allocation.student_name?.toLowerCase().includes(searchTerm) ||
                  allocation.student_number?.toLowerCase().includes(searchTerm) ||
                  allocation.scholarship_name?.toLowerCase().includes(searchTerm);
                return matchesSearch;
              });
              return filtered.length;
            })()}
          </span>
          <div className="flex gap-1 mt-2 sm:mt-0">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
            </button>
            {(() => {
              const searchTerm = filters.search.toLowerCase();
              const filtered = allocations.filter((allocation) => {
                const matchesSearch =
                  allocation.student_name?.toLowerCase().includes(searchTerm) ||
                  allocation.student_number?.toLowerCase().includes(searchTerm) ||
                  allocation.scholarship_name?.toLowerCase().includes(searchTerm);
                return matchesSearch;
              });
              const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

              return [...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 text-xs rounded border transition-colors ${currentPage === i + 1
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                >
                  {i + 1}
                </button>
              ));
            })()}
            <button
              onClick={() => {
                const searchTerm = filters.search.toLowerCase();
                const filtered = allocations.filter((allocation) => {
                  const matchesSearch =
                    allocation.student_name?.toLowerCase().includes(searchTerm) ||
                    allocation.student_number?.toLowerCase().includes(searchTerm) ||
                    allocation.scholarship_name?.toLowerCase().includes(searchTerm);
                  return matchesSearch;
                });
                const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
                setCurrentPage(Math.min(totalPages, currentPage + 1));
              }}
              disabled={(() => {
                const searchTerm = filters.search.toLowerCase();
                const filtered = allocations.filter((allocation) => {
                  const matchesSearch =
                    allocation.student_name?.toLowerCase().includes(searchTerm) ||
                    allocation.student_number?.toLowerCase().includes(searchTerm) ||
                    allocation.scholarship_name?.toLowerCase().includes(searchTerm);
                  return matchesSearch;
                });
                const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
                return currentPage === totalPages;
              })()}
              className="p-1.5 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Program Modal */}
      {showProgramModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowProgramModal(false);
            resetProgramForm();
          }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {programForm.scholarship_id ? "Edit" : "Create"} Scholarship Program
              </h2>
              <button
                onClick={() => {
                  setShowProgramModal(false);
                  resetProgramForm();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleProgramSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Scholarship Name *
                    </label>
                    <input
                      type="text"
                      value={programForm.scholarship_name}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          scholarship_name: e.target.value,
                        })
                      }
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Scholarship Code *
                    </label>
                    <input
                      type="text"
                      value={programForm.scholarship_code}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          scholarship_code: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g. MERIT-2024"
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Type *
                    </label>
                    <select
                      value={programForm.scholarship_type}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          scholarship_type: e.target.value,
                        })
                      }
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {scholarshipTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Academic Period *
                    </label>
                    <select
                      value={programForm.academic_period_id}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          academic_period_id: e.target.value,
                        })
                      }
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select Period</option>
                      {periods.map((period) => (
                        <option key={period.id} value={period.id}>
                          {period.school_year} - {period.semester}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={programForm.discount_type}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          discount_type: e.target.value,
                        })
                      }
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Percentage">Percentage</option>
                      <option value="Fixed Amount">Fixed Amount</option>
                      <option value="Full Scholarship">Full Scholarship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Discount Value {programForm.discount_type === 'Percentage' ? '(%)' : ''}
                    </label>
                    <input
                      type="number"
                      value={programForm.discount_value}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          discount_value: e.target.value,
                        })
                      }
                      disabled={programForm.discount_type === 'Full Scholarship'}
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Funding Source *
                    </label>
                    <input
                      type="text"
                      value={programForm.funding_source}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          funding_source: e.target.value,
                        })
                      }
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Total Budget *
                    </label>
                    <input
                      type="number"
                      value={programForm.total_budget}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          total_budget: e.target.value,
                        })
                      }
                      step="0.01"
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Max Beneficiaries
                    </label>
                    <input
                      type="number"
                      value={programForm.max_beneficiaries}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          max_beneficiaries: e.target.value,
                        })
                      }
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 col-span-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Required GPA
                      </label>
                      <input
                        type="number"
                        value={programForm.required_gpa}
                        onChange={(e) =>
                          setProgramForm({
                            ...programForm,
                            required_gpa: e.target.value,
                          })
                        }
                        step="0.01"
                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Income Level
                      </label>
                      <input
                        type="number"
                        value={programForm.required_income_level}
                        onChange={(e) =>
                          setProgramForm({
                            ...programForm,
                            required_income_level: e.target.value,
                          })
                        }
                        step="0.01"
                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Eligibility Criteria
                    </label>
                    <textarea
                      value={programForm.eligibility_criteria}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          eligibility_criteria: e.target.value,
                        })
                      }
                      rows="2"
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={programForm.description}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          description: e.target.value,
                        })
                      }
                      rows="2"
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-600 rounded-b-lg flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowProgramModal(false);
                    resetProgramForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocation Modal */}
      {showAllocationModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAllocationModal(false);
            resetAllocationForm();
          }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {allocationForm.allocation_id ? "Edit" : "Create"} Scholarship Allocation
              </h2>
              <button
                onClick={() => {
                  setShowAllocationModal(false);
                  resetAllocationForm();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleAllocationSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Scholarship Program *
                    </label>
                    <select
                      value={allocationForm.scholarship_id}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          scholarship_id: e.target.value,
                        })
                      }
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select Program</option>
                      {programs.map((prog) => (
                        <option
                          key={prog.scholarship_id}
                          value={prog.scholarship_id}
                        >
                          {prog.scholarship_name} (Available: ₱
                          {parseFloat(
                            prog.available_amount || 0
                          ).toLocaleString()}
                          )
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={allocationForm.student_id}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          student_id: e.target.value,
                        })
                      }
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter student ID"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Amount Allocated *
                    </label>
                    <input
                      type="number"
                      value={allocationForm.amount_allocated}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          amount_allocated: e.target.value,
                        })
                      }
                      step="0.01"
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Allocation Date *
                    </label>
                    <input
                      type="date"
                      value={allocationForm.allocation_date}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          allocation_date: e.target.value,
                        })
                      }
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status *
                    </label>
                    <select
                      value={allocationForm.disbursement_status}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          disbursement_status: e.target.value,
                        })
                      }
                      required
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {disbursementStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Disbursement Date
                    </label>
                    <input
                      type="date"
                      value={allocationForm.disbursement_date}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          disbursement_date: e.target.value,
                        })
                      }
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Remarks
                    </label>
                    <textarea
                      value={allocationForm.remarks}
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          remarks: e.target.value,
                        })
                      }
                      rows="2"
                      className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-600 rounded-b-lg flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllocationModal(false);
                    resetAllocationForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipFundAllocation;
