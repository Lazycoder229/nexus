import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Award, DollarSign, Users } from "lucide-react";

const ScholarshipFundAllocation = () => {
  const [programs, setPrograms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    scholarship_type: "",
    search: "",
  });

  const [programForm, setProgramForm] = useState({
    scholarship_id: null,
    scholarship_name: "",
    scholarship_type: "Merit-based",
    funding_source: "",
    total_budget: "",
    academic_year: new Date().getFullYear(),
    semester: "1st Semester",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get("/api/scholarships/programs", {
        params: filters,
      });
      setPrograms(response.data.data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await axios.get("/api/scholarships/allocations", {
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
        await axios.put(
          `/api/scholarships/programs/${programForm.scholarship_id}`,
          programForm
        );
      } else {
        await axios.post("/api/scholarships/programs", programForm);
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
        await axios.put(
          `/api/scholarships/allocations/${allocationForm.allocation_id}`,
          allocationForm
        );
      } else {
        await axios.post("/api/scholarships/allocations", allocationForm);
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
        await axios.delete(`/api/scholarships/programs/${id}`);
        fetchPrograms();
      } catch (error) {
        console.error("Error deleting program:", error);
      }
    }
  };

  const handleDeleteAllocation = async (id) => {
    if (window.confirm("Delete this allocation?")) {
      try {
        await axios.delete(`/api/scholarships/allocations/${id}`);
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
        await axios.patch(`/api/scholarships/allocations/${id}/approve`);
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
      scholarship_type: "Merit-based",
      funding_source: "",
      total_budget: "",
      academic_year: new Date().getFullYear(),
      semester: "1st Semester",
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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Scholarship Fund Allocation
          </h1>
          <p className="text-gray-600 mt-1">
            Manage scholarship programs and student allocations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetProgramForm();
              setShowProgramModal(true);
            }}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Award size={20} />
            New Program
          </button>
          <button
            onClick={() => {
              resetAllocationForm();
              setShowAllocationModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Allocate Scholarship
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search programs, students..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <select
              value={filters.scholarship_type}
              onChange={(e) =>
                setFilters({ ...filters, scholarship_type: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Types</option>
              {scholarshipTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
              {disbursementStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scholarship Programs */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="text-purple-600" />
          Scholarship Programs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <div
              key={program.scholarship_id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">
                  {program.scholarship_name}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setProgramForm(program);
                      setShowProgramModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProgram(program.scholarship_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full mb-2">
                {program.scholarship_type}
              </span>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-semibold">
                    ₱{parseFloat(program.total_budget || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Allocated:</span>
                  <span className="text-blue-600">
                    ₱
                    {parseFloat(program.allocated_amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="text-green-600 font-semibold">
                    ₱
                    {parseFloat(program.available_amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Users size={14} />
                    Beneficiaries:
                  </span>
                  <span className="font-semibold">
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
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="text-green-600" />
          Student Allocations
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Scholarship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
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
              {allocations.map((allocation) => (
                <tr key={allocation.allocation_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">
                        {allocation.student_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {allocation.student_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {allocation.scholarship_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                    ₱{parseFloat(allocation.amount_allocated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(allocation.allocation_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        allocation.disbursement_status === "Disbursed"
                          ? "bg-green-100 text-green-800"
                          : allocation.disbursement_status === "Approved"
                          ? "bg-blue-100 text-blue-800"
                          : allocation.disbursement_status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {allocation.disbursement_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {allocation.disbursement_status === "Pending" && (
                        <button
                          onClick={() =>
                            handleApprove(allocation.allocation_id)
                          }
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setAllocationForm(allocation);
                          setShowAllocationModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteAllocation(allocation.allocation_id)
                        }
                        className="text-red-600 hover:text-red-800"
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
      </div>

      {/* Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {programForm.scholarship_id ? "Edit" : "Create"} Scholarship
              Program
            </h2>
            <form onSubmit={handleProgramSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {scholarshipTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Academic Year *
                  </label>
                  <input
                    type="number"
                    value={programForm.academic_year}
                    onChange={(e) =>
                      setProgramForm({
                        ...programForm,
                        academic_year: e.target.value,
                      })
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Semester *
                  </label>
                  <select
                    value={programForm.semester}
                    onChange={(e) =>
                      setProgramForm({
                        ...programForm,
                        semester: e.target.value,
                      })
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option>1st Semester</option>
                    <option>2nd Semester</option>
                    <option>Summer</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowProgramModal(false);
                    resetProgramForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">
              {allocationForm.allocation_id ? "Edit" : "Create"} Scholarship
              Allocation
            </h2>
            <form onSubmit={handleAllocationSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
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
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter student ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {disbursementStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllocationModal(false);
                    resetAllocationForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
