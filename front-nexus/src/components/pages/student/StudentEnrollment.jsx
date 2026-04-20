import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { GraduationCap, Plus, Pencil, X } from "lucide-react";

const StatusBadge = ({ status }) => {
  const colors = {
    Pending:
      "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md",
    "Under Review":
      "bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-md",
    Accepted:
      "bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md",
    Rejected: "bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-md",
    Enrolled:
      "bg-gradient-to-r from-purple-400 to-indigo-400 text-white shadow-md",
  };
  const icons = {
    Pending: "⏳",
    "Under Review": "👀",
    Accepted: "✅",
    Rejected: "❌",
    Enrolled: "🎓",
  };
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
        colors[status] || colors.Pending
      }`}
    >
      <span>{icons[status] || icons.Pending}</span>
      {status}
    </span>
  );
};

const EnrollmentModal = ({ isOpen, onClose, onSubmit, mode, initialData }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    program_applied: "",
    application_date: new Date().toISOString().split("T")[0],
    status: "Pending",
    previous_school: "",
    year_graduated: "",
    entrance_exam_score: "",
    interview_date: "",
    interview_notes: "",
    documents_submitted: "",
  });
  const [studentProfile, setStudentProfile] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const documentOptions = [
    { value: "Birth Certificate", label: "Birth Certificate" },
    { value: "High School Diploma", label: "High School Diploma" },
    { value: "Transcript", label: "Transcript" },
    { value: "ID Card", label: "ID Card" },
    { value: "Medical Certificate", label: "Medical Certificate" },
    { value: "NBI Clearance", label: "NBI Clearance" },
    { value: "Good Moral Certificate", label: "Good Moral Certificate" },
    { value: "NCAE Score", label: "NCAE Score" },
    { value: "Proof of Income", label: "Proof of Income" },
    { value: "Parent/Guardian ID", label: "Parent/Guardian ID" },
  ];

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const API_BASE =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await axios.get(`${API_BASE}/api/programs`);
        console.log("Programs API response:", res.data);
        setPrograms(res.data);
      } catch (err) {
        console.error("Error fetching programs:", err);
      }
    };

    const fetchStudentProfile = async () => {
      try {
        const API_BASE =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const userId = localStorage.getItem("userId");
        const userObj = localStorage.getItem("user");
        let studentId = userId;

        if (!studentId && userObj) {
          try {
            const parsedUser = JSON.parse(userObj);
            studentId = parsedUser.user_id;
          } catch (e) {
            console.error("Error parsing user object:", e);
          }
        }

        if (studentId) {
          const res = await axios.get(`${API_BASE}/api/users/${studentId}`);
          setStudentProfile(res.data);
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    };

    if (isOpen) {
      fetchPrograms();
      fetchStudentProfile();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData || studentProfile) {
      const baseData = studentProfile
        ? {
            first_name: studentProfile.first_name || "",
            middle_name: studentProfile.middle_name || "",
            last_name: studentProfile.last_name || "",
            email: studentProfile.email || "",
            phone: studentProfile.phone || "",
            date_of_birth: studentProfile.date_of_birth
              ? studentProfile.date_of_birth.split("T")[0]
              : "",
            gender: studentProfile.gender || "",
            address:
              studentProfile.permanent_address || studentProfile.address || "",
            program_applied: "",
            application_date: new Date().toISOString().split("T")[0],
            status: "Pending",
            previous_school: studentProfile.previous_school || "",
            year_graduated:
              studentProfile.year_graduated ||
              studentProfile.yearGraduated ||
              "",
            entrance_exam_score: studentProfile.entrance_exam_score || "",
            interview_date: "",
            interview_notes: "",
            documents_submitted: "",
          }
        : {};

      const documentsArray = initialData?.documents_submitted
        ? initialData.documents_submitted
            .split(",")
            .map((doc) => ({
              value: doc.trim(),
              label: doc.trim(),
            }))
        : [];
      setSelectedDocuments(documentsArray);

      setFormData({
        ...baseData,
        ...(initialData && {
          admission_id: initialData.admission_id,
          first_name: initialData.first_name || baseData.first_name,
          middle_name: initialData.middle_name || baseData.middle_name,
          last_name: initialData.last_name || baseData.last_name,
          email: initialData.email || baseData.email,
          phone: initialData.phone || baseData.phone,
          date_of_birth: initialData.date_of_birth
            ? initialData.date_of_birth.split("T")[0]
            : baseData.date_of_birth || "",
          gender: initialData.gender || baseData.gender,
          address: initialData.address || baseData.address,
          program_applied:
            initialData.program_applied || baseData.program_applied,
          application_date: initialData.application_date
            ? initialData.application_date.split("T")[0]
            : baseData.application_date,
          status: initialData.status || baseData.status,
          previous_school:
            initialData.previous_school || baseData.previous_school,
          year_graduated: initialData.year_graduated || baseData.year_graduated,
          entrance_exam_score:
            initialData.entrance_exam_score || baseData.entrance_exam_score,
          interview_date: initialData.interview_date
            ? initialData.interview_date.split("T")[0]
            : "",
          interview_notes: initialData.interview_notes || "",
          documents_submitted: initialData.documents_submitted || "",
        }),
      });
    } else if (!initialData && !studentProfile) {
      setSelectedDocuments([]);
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        address: "",
        program_applied: "",
        application_date: new Date().toISOString().split("T")[0],
        status: "Pending",
        previous_school: "",
        year_graduated: "",
        entrance_exam_score: "",
        interview_date: "",
        interview_notes: "",
        documents_submitted: "",
      });
    }
  }, [initialData, studentProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-2.5 flex justify-between items-center z-10 rounded-t-xl">
          <h3 className="text-lg font-bold text-gray-800">
            {mode === "add"
              ? "New Admission Application"
              : mode === "edit"
                ? "Edit Admission Application"
                : "View Admission Application"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3">
          <form onSubmit={handleSubmit} className="space-y-3 px-3 pb-3">
            {/* Student Information Section */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold mb-2 text-slate-700 uppercase tracking-wider">
                Student Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        middle_name: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date_of_birth: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={true}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-xs font-medium mb-0.5 text-slate-600">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  disabled={true}
                />
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold mb-2 text-slate-700 uppercase tracking-wider">
                Academic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Program Applied *
                  </label>
                  <select
                    value={formData.program_applied}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        program_applied: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={
                      mode === "view" || (mode === "edit" && initialData)
                    }
                  >
                    <option value="">Select Program...</option>
                    {programs.map((program) => (
                      <option
                        key={program.id || program.program_id}
                        value={program.name || program.program_name}
                      >
                        {program.code
                          ? `${program.code} - ${program.name}`
                          : program.name || program.program_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Application Date
                  </label>
                  <input
                    type="date"
                    value={formData.application_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        application_date: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={true}
                  />
                </div>
              </div>

              {/* Previous Education Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Previous School
                  </label>
                  <input
                    type="text"
                    value={formData.previous_school}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        previous_school: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. SDS High School"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Year Graduated
                  </label>
                  <input
                    type="text"
                    value={formData.year_graduated}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        year_graduated: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 2024"
                    disabled={mode === "view"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-2">
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Entrance Exam Score
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.entrance_exam_score}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        entrance_exam_score: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 85.5"
                    disabled={mode === "view"}
                  />
                </div>
              </div>
            </div>

            {/* Interview Information */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold mb-2 text-slate-700 uppercase tracking-wider">
                Interview Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    value={formData.interview_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        interview_date: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-0.5 text-slate-600">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={true}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Enrolled">Enrolled</option>
                  </select>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium mb-0.5 text-slate-600">
                  Interview Notes
                </label>
                <textarea
                  value={formData.interview_notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      interview_notes: e.target.value,
                    }))
                  }
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  disabled={mode === "view"}
                />
              </div>
            </div>

            {/* Documents Submitted */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold mb-2 text-slate-700 uppercase tracking-wider">
                Documents to Submit
              </h4>
              <Select
                isMulti
                options={documentOptions}
                value={selectedDocuments}
                onChange={(options) => {
                  setSelectedDocuments(options || []);
                  setFormData((prev) => ({
                    ...prev,
                    documents_submitted: options
                      ? options.map((opt) => opt.value).join(", ")
                      : "",
                  }));
                }}
                isDisabled={mode === "view"}
                placeholder="Select documents..."
                className="text-sm"
              />
            </div>

            {mode !== "view" && (
              <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-medium"
                >
                  {mode === "add" ? "Submit Application" : "Update Application"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default function StudentEnrollment() {
  const [admission, setAdmission] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(true);

  const fetchAdmissionData = async () => {
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const userId = localStorage.getItem("userId");
      const userObj = localStorage.getItem("user");
      let studentId = userId;

      if (!studentId && userObj) {
        try {
          const parsedUser = JSON.parse(userObj);
          studentId = parsedUser.user_id;
        } catch (e) {
          console.error("Error parsing user object:", e);
        }
      }

      if (studentId) {
        // Fetch admission by user email or ID
        const userRes = await axios.get(`${API_BASE}/api/users/${studentId}`);
        const userEmail = userRes.data.email;

        // Try to get admission by email
        const res = await axios.get(
          `${API_BASE}/api/admissions?email=${userEmail}`,
        );

        if (res.data && res.data.length > 0) {
          setAdmission(res.data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching admission:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissionData();
  }, []);

  // Auto-refresh admission status every 5 seconds to detect enrollment changes
  useEffect(() => {
    if (!admission) return;
    
    const interval = setInterval(() => {
      fetchAdmissionData();
    }, 5000); // Refresh every 5 seconds

    // Also refresh when page becomes visible (tab focus)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAdmissionData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [admission]);

  const openModal = (mode) => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      if (modalMode === "add") {
        const res = await axios.post(`${API_BASE}/api/admissions`, formData);
        setAdmission(res.data);
      } else if (modalMode === "edit") {
        const res = await axios.put(
          `${API_BASE}/api/admissions/${formData.admission_id}`,
          formData,
        );
        setAdmission(res.data);
      }

      setModalOpen(false);

      // Refresh admission status after a short delay to see enrollment updates
      setTimeout(() => {
        fetchAdmissionData();
      }, 500);
    } catch (err) {
      console.error("Error submitting admission:", err);
      alert("Failed to submit application. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {!admission ? (
        <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 p-12 shadow-sm">
          <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-6 shadow-md">
            <GraduationCap size={48} className="mx-auto text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-3">
            No Admission Application Found
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            You haven't submitted an admission application yet. Start your
            journey with us by completing your application below.
          </p>
          <button
            onClick={() => openModal("add")}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-3 mx-auto shadow-md hover:shadow-lg"
          >
            <Plus size={20} /> Start Your Application
          </button>
          <p className="text-sm text-slate-500 mt-4">
            The application process typically takes 5-10 minutes to complete
          </p>
        </div>
      ) : admission.status === "Enrolled" ? (
        <div className="text-center bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 p-12 shadow-sm">
          <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-6 shadow-md">
            <GraduationCap size={48} className="mx-auto text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-3">
            You are already enrolled in this semester
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Your application has been approved and you are officially enrolled.
            Please check your courses and schedule in the My Courses section.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Application Status
                </h2>
                <p className="text-sm text-slate-600">
                  Submitted on:{" "}
                  {admission.application_date
                    ? new Date(admission.application_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Not specified"}
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <button
                  onClick={fetchAdmissionData}
                  className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Refresh status"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <StatusBadge status={admission.status} />
                {admission.status === "Pending" && (
                  <button
                    onClick={() => openModal("edit")}
                    className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-white/80 transition-colors"
                    title="Edit application"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-slate-500">Program Applied</p>
                <p className="font-medium text-slate-700">
                  {admission.program_applied || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Previous School</p>
                <p className="font-medium text-slate-700">
                  {admission.previous_school || "Not specified"}
                </p>
              </div>
              {admission.entrance_exam_score && (
                <div>
                  <p className="text-sm text-slate-500">Entrance Exam Score</p>
                  <p className="font-medium text-slate-700">
                    {admission.entrance_exam_score}
                  </p>
                </div>
              )}
            </div>
          </div>

          {admission.status === "Pending" && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600">
                Your application is currently under review. We'll notify you
                once there's an update.
              </p>
            </div>
          )}

          {admission.status === "Accepted" && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600">
                Congratulations! Your application has been accepted. Please
                proceed to the enrollment process.
              </p>
            </div>
          )}

          {admission.status === "Rejected" && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600">
                Unfortunately, your application was not accepted at this time.
                {admission.remarks && ` Reason: ${admission.remarks}`}
              </p>
            </div>
          )}
        </div>
      )}

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialData={admission}
      />
    </div>
  );
}
