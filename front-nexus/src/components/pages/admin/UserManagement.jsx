// UserManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  X,
  ListChecks,
  Eye,
  FileText,
  FileDown,
  ChevronRight,
  ChevronLeft,
  Search,
  User2Icon,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { generateCSV, downloadCSV, downloadPDF } from "../../../utils/exportHelpers";

/* -------------------------
   UTILITY FUNCTIONS
   ------------------------- */
const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";
  if (typeof dateValue === "string") {
    if (dateValue.includes("T")) return dateValue.split("T")[0];
    return dateValue;
  }
  return "";
};

/* -------------------------
   INITIAL STATE TEMPLATES
   ------------------------- */
const initialCommonState = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  permanentAddress: "",
  profilePicture: "",
};

const studentSpecifics = {
  parentPhone: "",
  mailingAddress: "",
  fatherName: "",
  motherName: "",
  studentNumber: "",
  course: "",
  major: "",
  yearLevel: "",
  previousSchool: "",
  yearGraduated: "",
};

const employeeCommon = {
  employeeId: "",
  department: "",
  positionTitle: "",
  status: "Active",
  dateHired: "",
};

const adminSpecifics = {
  accessLevel: "Standard Admin",
  specialization: "",
  educationalAttainment: "",
  licenseNumber: "",
};

const facultySpecifics = {
  specialization: "",
  educationalAttainment: "",
  licenseNumber: "",
};

const ROLE_CONFIG = {
  Student: {
    icon: GraduationCap,
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
  Admin: { icon: ShieldCheck, color: "bg-red-100 text-red-800 border-red-300" },
  Faculty: {
    icon: Briefcase,
    color: "bg-green-100 text-green-800 border-green-300",
  },
  Staff: {
    icon: Users,
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  HR: {
    icon: Briefcase,
    color: "bg-pink-100 text-pink-800 border-pink-300",
  },
  Accounting: {
    icon: FileText,
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
};

const PERMISSIONS_LIST = [
  {
    id: "C1",
    name: "Can Manage Courses",
    description: "Create, edit, and delete course offerings.",
  },
  {
    id: "S1",
    name: "Can View Student Grades",
    description: "Access student academic performance records.",
  },
  {
    id: "U1",
    name: "Can Manage User Accounts",
    description: "Create, edit, and delete non-Admin user accounts.",
  },
  {
    id: "A1",
    name: "Can Access Audit Logs",
    description: "View system activity and security logs.",
  },
];

const INITIAL_RBAC_STATE = {
  Admin: PERMISSIONS_LIST.map((p) => ({ ...p, allowed: true })),
  Faculty: PERMISSIONS_LIST.map((p) => ({ ...p, allowed: p.id === "S1" })),
  Staff: PERMISSIONS_LIST.map((p) => ({ ...p, allowed: p.id === "U1" })),
  Student: PERMISSIONS_LIST.map((p) => ({ ...p, allowed: false })),
  HR: PERMISSIONS_LIST.map((p) => ({ ...p, allowed: false })),
  Accounting: PERMISSIONS_LIST.map((p) => ({ ...p, allowed: false })),
};

/* -------------------------
   REUSABLE INPUT COMPONENTS
   ------------------------- */
const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500";

const FieldLabel = ({ children }) => (
  <label className="block text-xs font-medium text-slate-700 mb-1.5">
    {children}
  </label>
);

const TextInput = ({
  name,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  label = "",
  disabled = false,
}) => (
  <div>
    {label && <FieldLabel>{label}</FieldLabel>}
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={inputClass}
    />
  </div>
);

const NativeSelect = ({ name, value, onChange, children, label = "", required = false, disabled = false }) => (
  <div>
    {label && <FieldLabel>{label}</FieldLabel>}
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`${inputClass} appearance-none`}
    >
      {children}
    </select>
  </div>
);

const ReactSelectInput = ({
  name,
  placeholder,
  value,
  onChange,
  options,
  label = "",
  isMulti = false,
  isClearable = true,
  isDisabled = false,
}) => {
  let selectedValue = null;
  if (isMulti && Array.isArray(value)) {
    selectedValue = options.filter((opt) => value.includes(opt.value));
  } else if (value) {
    selectedValue = options.find((opt) => opt.value === value) || null;
  }

  const handleChange = (selected) => {
    if (isMulti) {
      onChange({ target: { name, value: selected ? selected.map((s) => s.value) : [] } });
    } else {
      onChange({ target: { name, value: selected ? selected.value : "" } });
    }
  };

  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Select
        name={name}
        options={options}
        value={selectedValue}
        onChange={handleChange}
        placeholder={placeholder || `Select ${name}`}
        isMulti={isMulti}
        isClearable={isClearable}
        isSearchable
        isDisabled={isDisabled}
        className="text-sm"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "38px",
            borderColor: "rgb(203 213 225)",
            "&:hover": { borderColor: "rgb(148 163 184)" },
            borderRadius: "0.5rem",
            fontSize: "14px",
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "rgb(79 70 229)"
              : state.isFocused
              ? "rgb(229 231 235)"
              : "white",
            color: state.isSelected ? "white" : "rgb(15 23 42)",
            cursor: "pointer",
            fontSize: "14px",
          }),
          menuList: (base) => ({ ...base, maxHeight: "200px" }),
        }}
      />
    </div>
  );
};

const TextAreaInput = ({ name, placeholder, value, onChange, label = "" }) => (
  <div>
    {label && <FieldLabel>{label}</FieldLabel>}
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={2}
      className={inputClass}
    />
  </div>
);

const SectionDivider = ({ title }) => (
  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-200 mt-1 mb-3">
    {title}
  </p>
);

/* -------------------------
   VIEW USER MODAL
   ------------------------- */
const ViewUserModal = ({ isOpen, onClose, user }) => {
  const formatDOB = (dob) => {
    if (!dob) return "N/A";
    const date = new Date(dob);
    if (isNaN(date)) return "N/A";
    return date.toLocaleDateString("en-GB");
  };

  const roleSpecificDetails = useMemo(() => {
    if (!user) return [];
    const fields = [];
    if (user.role === "Student") {
      fields.push(
        { label: "Student Number", value: user.student_number },
        { label: "Course / Major", value: `${user.course || "N/A"} / ${user.major || "N/A"}` },
        { label: "Year Level", value: user.year_level },
        { label: "Previous School", value: user.previous_school },
        { label: "Parent / Guardian", value: user.father_name || user.mother_name },
        { label: "Parent Phone", value: user.parent_phone },
        { label: "Mailing Address", value: user.mailing_address },
      );
    } else {
      fields.push(
        { label: "Employee ID", value: user.employee_id },
        { label: "Department", value: user.department },
        { label: "Position Title", value: user.position_title },
        { label: "Date Hired", value: formatDOB(user.date_hired) },
        { label: "Employment Status", value: user.status },
      );
      if (user.role === "Faculty" || user.role === "Admin") {
        fields.push(
          { label: "Specialization", value: user.specialization },
          { label: "Educational Attainment", value: user.educational_attainment },
          { label: "License Number", value: user.license_number },
        );
      }
      if (user.role === "Admin") {
        fields.push({ label: "Access Level", value: user.access_level });
      }
    }
    return fields;
  }, [user]);

  if (!user) return null;
  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.Staff;
  const RoleIcon = roleConfig.icon;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">
            Viewing: {user.first_name} {user.last_name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex flex-col items-center pb-4 border-b border-slate-200">
                <div className="h-16 w-16 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 text-2xl font-bold mb-3">
                  {user.first_name?.[0] || "?"}{user.last_name?.[0] || "?"}
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  {user.first_name} {user.last_name}
                </h4>
                <p className="text-sm text-slate-600">{user.email}</p>
                <span className={`mt-2 px-3 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-full ${roleConfig.color} border`}>
                  <RoleIcon className="w-3 h-3" />
                  {user.role}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase">Phone</p>
                  <p className="font-semibold text-slate-900 text-sm">{user.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase">DOB / Gender</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {formatDOB(user.date_of_birth)} / {user.gender || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase">Permanent Address</p>
                  <p className="font-semibold text-slate-900 text-sm">{user.permanent_address || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-50 rounded-lg border border-slate-200 p-4">
              <h5 className="font-bold text-slate-800 pb-3 border-b border-slate-200 flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4" /> Role Specific Details
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleSpecificDetails.length > 0 ? (
                  roleSpecificDetails.map((item, idx) => (
                    <div key={idx}>
                      <p className="text-xs font-medium text-slate-600 uppercase">{item.label}</p>
                      <p className="font-semibold text-slate-900 text-sm">{item.value || "N/A"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 py-4 col-span-2">
                    No specific role details available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------
   CREATE / EDIT MODAL
   ------------------------- */
const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  selectedRole,
  onRoleChange,
  formData,
  onInputChange,
  departments,
  programs,
}) => {
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (isOpen) setActiveTab("personal");
  }, [isOpen]);

  if (!isOpen) return null;

  const roleOptions = [
    { value: "Student", label: "Student" },
    { value: "Admin", label: "Admin" },
    { value: "Faculty", label: "Faculty" },
    { value: "Staff", label: "Staff" },
    { value: "HR", label: "HR" },
    { value: "Accounting", label: "Accounting" },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Leave", label: "On Leave" },
    { value: "Terminated", label: "Terminated" },
  ];

  const yearLevelOptions = [
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" },
  ];

  const isEmployee = ["Admin", "Faculty", "Staff", "HR", "Accounting"].includes(selectedRole);

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">
            {isEditing ? "Edit user record" : "Create new user account"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">

            {/* Tab bar */}
            <div className="flex border-b border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "personal"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-indigo-600"
                }`}
              >
                Personal info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("role")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "role"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-indigo-600"
                }`}
              >
                Role details
              </button>
            </div>

            {/* ── TAB: PERSONAL INFO ── */}
            {activeTab === "personal" && (
              <div className="space-y-5">
                <div>
                  <SectionDivider title="Role & account" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReactSelectInput
                      name="role"
                      label="User role *"
                      value={selectedRole}
                      onChange={onRoleChange}
                      options={roleOptions}
                      isDisabled={isEditing}
                      isClearable={false}
                      placeholder="Select role"
                    />
                    <TextInput
                      type="email"
                      name="email"
                      label="Email address *"
                      value={formData.email}
                      onChange={onInputChange}
                      required
                    />
                    <TextInput
                      type="password"
                      name="password"
                      label={isEditing ? "Password (leave blank to keep)" : "Password *"}
                      value={formData.password}
                      onChange={onInputChange}
                      required={!isEditing}
                    />
                    <TextInput
                      type="password"
                      name="confirmPassword"
                      label={isEditing ? "Confirm password (leave blank to keep)" : "Confirm password *"}
                      value={formData.confirmPassword}
                      onChange={onInputChange}
                      required={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <SectionDivider title="Personal information" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput
                      name="firstName"
                      label="First name *"
                      value={formData.firstName}
                      onChange={onInputChange}
                      required
                    />
                    <TextInput
                      name="middleName"
                      label="Middle name"
                      value={formData.middleName}
                      onChange={onInputChange}
                    />
                    <TextInput
                      name="lastName"
                      label="Last name *"
                      value={formData.lastName}
                      onChange={onInputChange}
                      required
                    />
                    <TextInput
                      name="suffix"
                      label="Suffix (Jr., Sr.)"
                      value={formData.suffix}
                      onChange={onInputChange}
                    />
                    <TextInput
                      type="date"
                      name="dateOfBirth"
                      label="Date of birth"
                      value={formData.dateOfBirth}
                      onChange={onInputChange}
                    />
                    <ReactSelectInput
                      name="gender"
                      label="Gender"
                      value={formData.gender}
                      onChange={onInputChange}
                      options={genderOptions}
                      placeholder="Select gender"
                    />
                    <TextInput
                      type="tel"
                      name="phone"
                      label="Phone number"
                      value={formData.phone}
                      onChange={onInputChange}
                    />
                    <div className="md:col-span-2">
                      <TextAreaInput
                        name="permanentAddress"
                        label="Permanent address"
                        value={formData.permanentAddress}
                        onChange={onInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: ROLE DETAILS ── */}
            {activeTab === "role" && selectedRole === "Student" && (
              <div className="space-y-5">
                <div>
                  <SectionDivider title="Student academic details" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput
                      name="studentNumber"
                      label="Student number *"
                      value={formData.studentNumber}
                      onChange={onInputChange}
                      required
                    />
                    <ReactSelectInput
                      name="course"
                      label="Course / program *"
                      value={formData.course}
                      onChange={onInputChange}
                      placeholder="Select program"
                      options={programs.map((p) => ({
                        value: p.code,
                        label: `${p.code} - ${p.name}`,
                      }))}
                    />
                    <ReactSelectInput
                      name="yearLevel"
                      label="Year level *"
                      value={formData.yearLevel}
                      onChange={onInputChange}
                      options={yearLevelOptions}
                      placeholder="Select year"
                    />
                    <TextInput
                      name="major"
                      label="Major"
                      value={formData.major}
                      onChange={onInputChange}
                    />
                    <TextInput
                      name="previousSchool"
                      label="Previous school"
                      value={formData.previousSchool}
                      onChange={onInputChange}
                    />
                    <TextInput
                      name="yearGraduated"
                      label="Year graduated"
                      value={formData.yearGraduated}
                      onChange={onInputChange}
                    />
                    <div className="md:col-span-3">
                      <TextAreaInput
                        name="mailingAddress"
                        label="Mailing address (if different from permanent)"
                        value={formData.mailingAddress}
                        onChange={onInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionDivider title="Parent / guardian information" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput
                      name="fatherName"
                      label="Father's name"
                      value={formData.fatherName}
                      onChange={onInputChange}
                    />
                    <TextInput
                      name="motherName"
                      label="Mother's name"
                      value={formData.motherName}
                      onChange={onInputChange}
                    />
                    <TextInput
                      type="tel"
                      name="parentPhone"
                      label="Parent's phone"
                      value={formData.parentPhone}
                      onChange={onInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "role" && isEmployee && (
              <div className="space-y-5">
                <div>
                  <SectionDivider title="Employment details" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput
                      name="employeeId"
                      label="Employee ID *"
                      value={formData.employeeId}
                      onChange={onInputChange}
                      required
                    />
                    <ReactSelectInput
                      name="department"
                      label="Department *"
                      value={formData.department}
                      onChange={onInputChange}
                      placeholder="Select department"
                      options={departments.map((d) => ({
                        value: d.name,
                        label: d.name,
                      }))}
                    />
                    <TextInput
                      name="positionTitle"
                      label="Position title *"
                      value={formData.positionTitle}
                      onChange={onInputChange}
                      required
                      placeholder="e.g., Professor, Instructor"
                    />
                    <TextInput
                      type="date"
                      name="dateHired"
                      label="Date hired"
                      value={formData.dateHired}
                      onChange={onInputChange}
                    />
                    <ReactSelectInput
                      name="status"
                      label="Employment status"
                      value={formData.status}
                      onChange={onInputChange}
                      options={statusOptions}
                      placeholder="Select status"
                    />
                    {selectedRole === "Admin" && (
                      <ReactSelectInput
                        name="accessLevel"
                        label="Access level"
                        value={formData.accessLevel}
                        onChange={onInputChange}
                        options={[
                          { value: "Standard Admin", label: "Standard Admin" },
                          { value: "Super Admin", label: "Super Admin" },
                        ]}
                        placeholder="Select access level"
                        isClearable={false}
                      />
                    )}
                  </div>
                </div>

                {(selectedRole === "Faculty" || selectedRole === "Admin") && (
                  <div>
                    <SectionDivider title="Academic credentials" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <TextInput
                        name="specialization"
                        label="Specialization"
                        value={formData.specialization}
                        onChange={onInputChange}
                        placeholder="e.g., Software Engineering"
                      />
                      <NativeSelect
                        name="educationalAttainment"
                        label="Educational attainment"
                        value={formData.educationalAttainment}
                        onChange={onInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Doctorate">Doctorate</option>
                        <option value="PhD">PhD</option>
                      </NativeSelect>
                      <TextInput
                        name="licenseNumber"
                        label="License number (PRC)"
                        value={formData.licenseNumber}
                        onChange={onInputChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-lg flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              {isEditing ? "Save changes" : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------
   MAIN COMPONENT
   ------------------------- */
function UserManagement() {
  const [currentPage, setCurrentPage] = useState("users");

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [rbac, setRbac] = useState(INITIAL_RBAC_STATE);
  const [rbacSaving, setRbacSaving] = useState(false);
  const [rbacSaved, setRbacSaved] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Student");
  const [formData, setFormData] = useState(getInitialFormState("Student"));

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  const [query, setQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  /* ── Data fetching ── */
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/dept/departments`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/programs`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchRbac = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/rbac`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const fetched = response.data;
      setRbac((prev) => {
        const merged = { ...prev };
        for (const role of Object.keys(prev)) {
          if (fetched[role]) merged[role] = fetched[role];
        }
        return merged;
      });
    } catch (error) {
      console.error("Error fetching RBAC config:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchPrograms();
    fetchRbac();
  }, []);

  /* ── Helpers ── */
  function getInitialFormState(role) {
    let specific = {};
    if (role === "Student") specific = studentSpecifics;
    else if (role === "Admin") specific = { ...employeeCommon, ...adminSpecifics };
    else if (role === "Faculty") specific = { ...employeeCommon, ...facultySpecifics };
    else specific = { ...employeeCommon };
    return { ...initialCommonState, ...specific, role };
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData(getInitialFormState("Student"));
    setSelectedRole("Student");
  };

  const handleRoleChange = (e) => {
    const newRole = e.target?.value || e.value;
    setSelectedRole(newRole);
    setFormData(getInitialFormState(newRole));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData(getInitialFormState("Student"));
    setSelectedRole("Student");
    setIsFormModalOpen(true);
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentId(user.user_id);
    setSelectedRole(user.role);
    setFormData({
      ...getInitialFormState(user.role),
      email: user.email || "",
      firstName: user.first_name || "",
      middleName: user.middle_name || "",
      lastName: user.last_name || "",
      suffix: user.suffix || "",
      dateOfBirth: formatDateForInput(user.date_of_birth),
      gender: user.gender || "",
      phone: user.phone || "",
      permanentAddress: user.permanent_address || "",
      studentNumber: user.student_number || "",
      course: user.course || "",
      major: user.major || "",
      yearLevel: user.year_level || "",
      previousSchool: user.previous_school || "",
      yearGraduated: user.year_graduated || "",
      mailingAddress: user.mailing_address || "",
      fatherName: user.father_name || "",
      motherName: user.mother_name || "",
      parentPhone: user.parent_phone || "",
      employeeId: user.employee_id || "",
      department: user.department || "",
      positionTitle: user.position_title || "",
      dateHired: formatDateForInput(user.date_hired),
      status: user.status || "Active",
      accessLevel: user.access_level || "",
      specialization: user.specialization || "",
      educationalAttainment: user.educational_attainment || "",
      licenseNumber: user.license_number || "",
    });
    setIsFormModalOpen(true);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Delete this user? This action cannot be undone.")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}`,
      );
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      alert("User deleted successfully");
    } catch (err) {
      console.error(err);
      alert(`Error deleting user: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      const submitData = { ...formData, role: selectedRole };

      if (!isEditing) {
        if (!submitData.password || submitData.password !== submitData.confirmPassword) {
          alert("Password and Confirm Password must match and cannot be empty.");
          return;
        }
        if (selectedRole !== "Student") {
          const required = ["email", "firstName", "lastName", "employeeId"];
          const missing = required.filter((f) => !submitData[f]?.trim());
          if (missing.length) {
            alert(`Please fill required fields: ${missing.join(", ")}`);
            return;
          }
        }
        if (selectedRole === "Student") {
          response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/student`,
            submitData,
          );
        } else {
          response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/employee`,
            submitData,
          );
        }
      } else {
        if (selectedRole === "Student") {
          response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/student/${currentId}`,
            submitData,
          );
        } else {
          response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/employee/${currentId}`,
            submitData,
          );
        }
      }

      alert(response.data.message || "Success!");
      fetchUsers();
      if (response.data.token) localStorage.setItem("token", response.data.token);
      closeFormModal();
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Something went wrong.");
    }
  };

  const handleSaveRbac = async () => {
    setRbacSaving(true);
    setRbacSaved(false);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/rbac`, rbac, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRbacSaved(true);
      setTimeout(() => setRbacSaved(false), 3000);
    } catch (error) {
      console.error("Error saving RBAC:", error);
      alert(error.response?.data?.message || "Failed to save RBAC configuration.");
    } finally {
      setRbacSaving(false);
    }
  };

  const handlePermissionChange = (role, permissionId, isAllowed) => {
    setRbac((prev) => ({
      ...prev,
      [role]: prev[role].map((p) =>
        p.id === permissionId ? { ...p, allowed: isAllowed } : p,
      ),
    }));
  };

  /* ── Search / filter / paginate ── */
  const filteredSorted = useMemo(() => {
    const userList = Array.isArray(users) ? users : [];
    let result = [...userList];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (u) =>
          (u.first_name || "").toLowerCase().includes(q) ||
          (u.last_name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.student_number || "").toLowerCase().includes(q) ||
          (u.employee_id || "").toLowerCase().includes(q),
      );
    }
    if (filterRole) result = result.filter((u) => u.role === filterRole);
    return result;
  }, [users, query, filterRole]);

  const pageCount = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page]);

  /* ── Export ── */
  const exportCSV = () => {
    if (users.length === 0) {
      alert("No users to export.");
      return;
    }

    const exportData = users.map((u) => ({
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "",
      employee_id: u.employee_id || "",
      student_number: u.student_number || "",
      department: u.department || "",
      position_title: u.position_title || "",
      date_hired: u.date_hired || "",
      status: u.status || "",
    }));

    const csv = generateCSV(exportData, {
      headers: [
        "first_name",
        "last_name",
        "email",
        "phone",
        "role",
        "employee_id",
        "student_number",
        "department",
        "position_title",
        "date_hired",
        "status",
      ],
      includeTimestamps: false,
    });

    const filename = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const exportPDF = () => {
    if (users.length === 0) {
      alert("No users to export.");
      return;
    }

    const exportData = users.map((u) => ({
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      email: u.email || "",
      role: u.role || "",
      id_number:
        u.role === "Student" ? u.student_number || "" : u.employee_id || "",
      department:
        u.role === "Student" ? u.course || "" : u.department || "",
      status: u.status || "",
    }));

    const filename = `Users Export`;
    downloadPDF(jsPDF, autoTable, exportData, {
      title: filename,
      orientation: "landscape",
      headers: ["first_name", "last_name", "email", "role", "id_number", "department", "status"],
      includeTimestamps: false,
    });
  };

  /* ── Derived stats ── */
  const totalStudents = users.filter((u) => u.role === "Student").length;
  const totalFacultyStaff = users.filter((u) =>
    ["Faculty", "Staff", "HR", "Accounting"].includes(u.role),
  ).length;
  const totalAdmins = users.filter((u) => u.role === "Admin").length;

  /* ── RBAC view ── */
  const renderAccessControl = () => (
    <div className="p-3 md:p-4 shadow rounded border border-gray-200">
      <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-indigo-600" /> Role-Based Access Control (RBAC)
      </h2>
      <p className="text-gray-600 mb-4 text-sm">
        Define which roles have access to specific system features and permissions.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal border-collapse">
          <thead className="bg-gray-50 border-b-2 border-indigo-200">
            <tr className="text-left text-gray-700 uppercase text-xs tracking-wider">
              <th className="px-3 py-1.5 w-1/4">Permission Module</th>
              {Object.keys(ROLE_CONFIG).map((role) => {
                const RoleIcon = ROLE_CONFIG[role].icon;
                return (
                  <th key={role} className="px-3 py-1.5 text-center">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full ${ROLE_CONFIG[role].color}`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {role}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS_LIST.map((permission) => (
              <tr key={permission.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">
                  <p className="font-semibold text-gray-800 text-sm">{permission.name}</p>
                  <p className="text-xs text-gray-500">{permission.description}</p>
                </td>
                {Object.keys(ROLE_CONFIG).map((role) => {
                  const isAllowed = rbac[role].find((p) => p.id === permission.id)?.allowed;
                  return (
                    <td key={`${role}-${permission.id}`} className="px-3 py-2 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={(e) => handlePermissionChange(role, permission.id, e.target.checked)}
                          className="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300"
                          disabled={role === "Student" && permission.id === "A1"}
                        />
                        <span className={`ml-2 text-xs font-medium hidden sm:inline ${isAllowed ? "text-green-600" : "text-red-500"}`}>
                          {isAllowed ? "Allowed" : "Denied"}
                        </span>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-3 border-t text-right flex items-center justify-end gap-3">
        {rbacSaved && <span className="text-sm text-green-600 font-medium">✓ Configuration saved!</span>}
        <button
          onClick={handleSaveRbac}
          disabled={rbacSaving}
          className="px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm disabled:opacity-60"
        >
          {rbacSaving ? "Saving..." : "Save RBAC Configuration"}
        </button>
      </div>
    </div>
  );

  /* ── User list view ── */
  const renderUserList = () => (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search name, email, id..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-inner"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-36"
          >
            <option value="">All Roles</option>
            <option value="Student">Student</option>
            <option value="Admin">Admin</option>
            <option value="Faculty">Faculty</option>
            <option value="Staff">Staff</option>
            <option value="HR">HR</option>
            <option value="Accounting">Accounting</option>
          </select>

          <div className="relative group">
            <button onClick={exportCSV} className="p-2 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100">
              <FileDown size={16} />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
              Export CSV
            </span>
          </div>

          <div className="relative group">
            <button onClick={exportPDF} className="p-2 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100">
              <FileText size={16} />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
              Export PDF
            </span>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md font-medium text-sm shadow-md shadow-indigo-500/30"
          >
            <UserPlus size={14} /> New User
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 text-slate-800">User List</h2>
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-700">
              <th className="px-4 py-2.5">Name & Email</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">ID / Title</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right w-1/12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paged.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-500 italic">
                  No user accounts found.
                </td>
              </tr>
            ) : (
              paged.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.Staff;
                const RoleIcon = roleConfig.icon;
                return (
                  <tr
                    key={user.user_id}
                    className="text-sm text-slate-700 hover:bg-indigo-50/50 transition duration-150"
                  >
                    <td className="px-4 py-2">
                      <p className="font-semibold text-slate-900 whitespace-nowrap">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-indigo-600 text-xs">{user.email}</p>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 inline-flex items-center gap-1 text-xs font-bold rounded-full ${roleConfig.color} border`}>
                        <RoleIcon className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-slate-800">
                        {user.role === "Student" ? user.student_number : user.employee_id}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {user.position_title || user.course || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-1">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-slate-200"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-slate-200"
                        title="Edit Record"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-slate-200"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-sm text-slate-700">
        <span className="text-xs sm:text-sm">
          Showing{" "}
          <span className="font-semibold">{(page - 1) * pageSize + 1}</span>–
          <span className="font-semibold">{Math.min(page * pageSize, filteredSorted.length)}</span>{" "}
          of <span className="font-semibold">{filteredSorted.length}</span> users
        </span>
        <div className="flex gap-1 mt-2 sm:mt-0">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          {[...Array(pageCount)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                page === i + 1
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="p-1.5 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </div>
      </div>
    </>
  );

  /* ── Main render ── */
  return (
    <div className="w-full overflow-hidden bg-slate-50 sm:p-4 flex flex-col">
      <div className="w-full mx-auto flex flex-col gap-3 font-sans flex-1 min-h-0">

        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center border-b border-slate-200 pb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User2Icon className="w-6 h-6 text-indigo-600" />
            User Management
          </h2>
          <span className="text-sm text-slate-500 font-medium">Data Integrity: Online</span>
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600">Total Users</p>
            <p className="text-2xl font-bold text-indigo-600">{users.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600">Students</p>
            <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600">Faculty &amp; Staff</p>
            <p className="text-2xl font-bold text-green-600">{totalFacultyStaff}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600">Admins</p>
            <p className="text-2xl font-bold text-purple-600">{totalAdmins}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex border-b border-slate-200">
          <button
            onClick={() => setCurrentPage("users")}
            className={`flex items-center gap-2 px-3 py-1.5 font-semibold text-sm transition duration-150 ${
              currentPage === "users"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            <Users className="w-4 h-4" /> Manage Users
          </button>
          <button
            onClick={() => setCurrentPage("roles")}
            className={`flex items-center gap-2 px-3 py-1.5 font-semibold text-sm transition duration-150 ${
              currentPage === "roles"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            <ListChecks className="w-4 h-4" /> Access Control (RBAC)
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {currentPage === "users" && renderUserList()}
          {currentPage === "roles" && renderAccessControl()}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        formData={formData}
        onInputChange={handleInputChange}
        departments={departments}
        programs={programs}
      />

      {/* View Modal */}
      {viewingUser && (
        <ViewUserModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setViewingUser(null); }}
          user={viewingUser}
        />
      )}
    </div>
  );
}

export default UserManagement;