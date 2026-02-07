import React, { useState, useEffect } from "react";
import axios from "axios";
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
  });
  const [studentProfile, setStudentProfile] = useState(null);
  const [programs, setPrograms] = useState([]);

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
            address: studentProfile.address || "",
            program_applied: "",
            application_date: new Date().toISOString().split("T")[0],
            status: "Pending",
            previous_school: studentProfile.previous_school || "",
            year_graduated:
              studentProfile.year_graduated ||
              studentProfile.yearGraduated ||
              "",
            entrance_exam_score: studentProfile.entrance_exam_score || "",
          }
        : {};

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
        }),
      });
    } else if (!initialData && !studentProfile) {
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
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {mode === "add"
              ? "New Admission Application"
              : mode === "edit"
                ? "Edit Admission Application"
                : "View Admission Application"}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold mb-3 text-slate-700">
              Student Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  required
                  disabled={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  disabled={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  required
                  disabled={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  required
                  disabled={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  disabled={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  disabled={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gender: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  disabled={true}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md bg-gray-100"
                rows={2}
                disabled={true}
              />
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold mb-3 text-slate-700">
              Academic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={mode === "view" || (mode === "edit" && initialData)}
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
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  disabled={true}
                />
              </div>
            </div>

            {/* Previous Education Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g. SDS High School"
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g. 2024"
                  disabled={mode === "view"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g. 85.5"
                  disabled={mode === "view"}
                />
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold mb-3 text-slate-700">
              Application Status
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
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
          </div>

          {mode !== "view" && (
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {mode === "add" ? "Submit Application" : "Update Application"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default function StudentEnrollment() {
  const [admission, setAdmission] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmission = async () => {
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

    fetchAdmission();
  }, []);

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
              <div className="flex gap-2">
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
