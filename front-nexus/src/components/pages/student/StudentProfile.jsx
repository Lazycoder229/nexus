import { useState, useEffect, useMemo } from "react";
import api from "../../../api/axios";
import { Users, Edit, Save, X, AlertCircle } from "lucide-react";

const resolveStoredStudentId = () => {
  const directUserId = localStorage.getItem("userId");
  if (directUserId) return directUserId;

  const userObj = localStorage.getItem("user");
  if (!userObj) return null;

  try {
    const parsedUser = JSON.parse(userObj);
    return parsedUser.user_id || parsedUser.userId || parsedUser.id || null;
  } catch (e) {
    console.error("Error parsing user object:", e);
    return null;
  }
};

const pickValue = (obj, ...keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return "";
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const calculateAge = (value) => {
  if (!value) return "";
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return "";
  const diff = Date.now() - birthDate.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

const fieldToLabel = (field) =>
  field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
      {label}
    </p>
    <p className="text-sm font-semibold text-slate-800 ">
      {value || (
        <span className="text-slate-400 font-normal italic">Not provided</span>
      )}
    </p>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white  rounded-xl border border-slate-200  p-5">
    <h3 className="text-sm font-bold text-slate-500  uppercase tracking-wider mb-4">
      {title}
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

const FormField = ({ label, children, span, error }) => (
  <div className={span ? "col-span-2 md:col-span-3" : ""}>
    <label className="block text-xs font-medium text-slate-500  mb-1">
      {label}
    </label>
    {children}
    {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
  </div>
);

const inputCls =
  "w-full px-3 py-2 bg-slate-50  border border-slate-300  rounded-lg text-slate-900  text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const inputErrorCls =
  "w-full px-3 py-2 bg-slate-50  border border-red-400  rounded-lg text-slate-900  text-sm focus:outline-none focus:ring-2 focus:ring-red-500";
const readonlyCls =
  "w-full px-3 py-2 bg-slate-100  border border-slate-200  rounded-lg text-slate-500  text-sm cursor-not-allowed";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = resolveStoredStudentId();
      if (!userId) {
        setError("No logged-in user found. Please log in again.");
        return;
      }
      let u = null;

      try {
        const listResponse = await api.get("/api/users");
        const users = Array.isArray(listResponse.data) ? listResponse.data : [];
        u = users.find((user) => String(user.user_id) === String(userId)) || null;
      } catch (listErr) {
        console.warn("Falling back to single-user profile fetch:", listErr);
      }

      if (!u) {
        const response = await api.get(`/api/users/${userId}`);
        u = response.data || {};
      }

      const profileData = {
        user_id: pickValue(u, "user_id", "userId", "id"),
        student_number: pickValue(u, "student_number", "studentNumber"),
        student_type: pickValue(u, "student_type", "studentType"),
        first_name: pickValue(u, "first_name", "firstName"),
        middle_name: pickValue(u, "middle_name", "middleName"),
        last_name: pickValue(u, "last_name", "lastName"),
        suffix: pickValue(u, "suffix"),
        email: pickValue(u, "email"),
        phone: pickValue(u, "phone"),
        gender: pickValue(u, "gender"),
        date_of_birth: pickValue(u, "date_of_birth", "dateOfBirth"),
        permanent_address: pickValue(u, "permanent_address", "permanentAddress", "address"),
        mailing_address: pickValue(u, "mailing_address", "mailingAddress"),
        // Address parts
        permanent_sitio: pickValue(u, "permanent_sitio", "permanentSitio"),
        permanent_barangay: pickValue(u, "permanent_barangay", "permanentBarangay"),
        permanent_city_municipality: pickValue(u, "permanent_city_municipality", "permanentCityMunicipality"),
        permanent_province: pickValue(u, "permanent_province", "permanentProvince"),
        present_sitio: pickValue(u, "present_sitio", "presentSitio"),
        present_barangay: pickValue(u, "present_barangay", "presentBarangay"),
        present_city_municipality: pickValue(u, "present_city_municipality", "presentCityMunicipality"),
        present_province: pickValue(u, "present_province", "presentProvince"),
        // Personal details
        civil_status: pickValue(u, "civil_status", "civilStatus"),
        religion: pickValue(u, "religion"),
        is_pwd: pickValue(u, "is_pwd", "isPwd"),
        indigenous_people: pickValue(u, "indigenous_people", "indigenousPeople"),
        zip_code: pickValue(u, "zip_code", "zipCode"),
        birth_place: pickValue(u, "birth_place", "birthPlace"),
        citizenship: pickValue(u, "citizenship"),
        // Academic
        course: pickValue(u, "course"),
        major: pickValue(u, "major"),
        year_level: pickValue(u, "year_level", "yearLevel"),
        academic_year: pickValue(u, "academic_year", "academicYear"),
        semester: pickValue(u, "semester"),
        date_registered: pickValue(u, "date_registered", "dateRegistered"),
        previous_school: pickValue(u, "previous_school", "previousSchool"),
        year_graduated: pickValue(u, "year_graduated", "yearGraduated"),
        elementary_school_completed_at: pickValue(u, "elementary_school_completed_at", "elementarySchool"),
        elementary_school_year_graduated: pickValue(u, "elementary_school_year_graduated", "elementaryYearGraduated"),
        junior_high_school_completed_at: pickValue(u, "junior_high_school_completed_at", "juniorHighSchool"),
        junior_high_school_year_graduated: pickValue(u, "junior_high_school_year_graduated", "juniorHighYearGraduated"),
        senior_high_school_completed_at: pickValue(u, "senior_high_school_completed_at", "seniorHighSchool"),
        senior_high_school_year_graduated: pickValue(u, "senior_high_school_year_graduated", "seniorHighYearGraduated"),
        college_program_course_attended: pickValue(u, "college_program_course_attended", "collegeProgramAttended"),
        school_year_attended: pickValue(u, "school_year_attended", "schoolYearAttended"),
        // Family - Father
        father_name: pickValue(u, "father_name", "fatherName"),
        father_status: pickValue(u, "father_status", "fatherStatus"),
        father_residence_street: pickValue(u, "father_residence_street", "fatherResidenceStreet"),
        father_residence_barangay: pickValue(u, "father_residence_barangay", "fatherResidenceBarangay"),
        father_residence_city: pickValue(u, "father_residence_city", "fatherResidenceCity"),
        father_residence_province: pickValue(u, "father_residence_province", "fatherResidenceProvince"),
        father_residence_zip_code: pickValue(u, "father_residence_zip_code", "fatherResidenceZipCode"),
        father_occupation: pickValue(u, "father_occupation", "fatherOccupation"),
        father_phone: pickValue(u, "father_phone", "fatherPhone"),
        // Family - Mother
        mother_name: pickValue(u, "mother_name", "motherName"),
        mother_status: pickValue(u, "mother_status", "motherStatus"),
        mother_residence_street: pickValue(u, "mother_residence_street", "motherResidenceStreet"),
        mother_residence_barangay: pickValue(u, "mother_residence_barangay", "motherResidenceBarangay"),
        mother_residence_city: pickValue(u, "mother_residence_city", "motherResidenceCity"),
        mother_residence_province: pickValue(u, "mother_residence_province", "motherResidenceProvince"),
        mother_residence_zip_code: pickValue(u, "mother_residence_zip_code", "motherResidenceZipCode"),
        mother_occupation: pickValue(u, "mother_occupation", "motherOccupation"),
        mother_phone: pickValue(u, "mother_phone", "motherPhone"),
        // Family - Guardian
        guardian_name: pickValue(u, "guardian_name", "guardianName"),
        guardian_relationship: pickValue(u, "guardian_relationship", "guardianRelationship"),
        guardian_residence_street: pickValue(u, "guardian_residence_street", "guardianResidenceStreet"),
        guardian_residence_barangay: pickValue(u, "guardian_residence_barangay", "guardianResidenceBarangay"),
        guardian_residence_city: pickValue(u, "guardian_residence_city", "guardianResidenceCity"),
        guardian_residence_province: pickValue(u, "guardian_residence_province", "guardianResidenceProvince"),
        guardian_residence_zip_code: pickValue(u, "guardian_residence_zip_code", "guardianResidenceZipCode"),
        guardian_occupation: pickValue(u, "guardian_occupation", "guardianOccupation"),
        guardian_phone: pickValue(u, "guardian_phone", "guardianPhone"),
        // Parent legacy
        parent_phone: pickValue(u, "parent_phone", "parentPhone"),
        // Scholarship
        other_financial_assistance: pickValue(u, "other_financial_assistance", "otherFinancialAssistance"),
        scholarship_assistance_1: pickValue(u, "scholarship_assistance_1", "scholarshipAssistance1"),
        scholarship_assistance_2: pickValue(u, "scholarship_assistance_2", "scholarshipAssistance2"),
        scholarship_assistance_3: pickValue(u, "scholarship_assistance_3", "scholarshipAssistance3"),
        // Meta
        status: pickValue(u, "status"),
        role: pickValue(u, "role"),
        created_at: pickValue(u, "created_at", "createdAt"),
        profile_picture_url: pickValue(u, "profile_picture_url", "profilePictureUrl"),
      };
      setProfile(profileData);
      setFormData(profileData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const age = useMemo(() => calculateAge(formData.date_of_birth), [formData.date_of_birth]);

  const combinedPermanentAddress = useMemo(
    () =>
      [formData.permanent_sitio, formData.permanent_barangay, formData.permanent_city_municipality, formData.permanent_province]
        .filter(Boolean)
        .join(", "),
    [formData.permanent_sitio, formData.permanent_barangay, formData.permanent_city_municipality, formData.permanent_province],
  );

  const combinedPresentAddress = useMemo(
    () =>
      [formData.present_sitio, formData.present_barangay, formData.present_city_municipality, formData.present_province]
        .filter(Boolean)
        .join(", "),
    [formData.present_sitio, formData.present_barangay, formData.present_city_municipality, formData.present_province],
  );

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const f = (key) => (e) => updateField(key, e.target.value);

  // ── Validation matching StudentRegistrationForm ──
  const validate = () => {
    const nextErrors = {};

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    // Phone validation
    if (!formData.phone || !formData.phone.trim()) {
      nextErrors.phone = "Contact number is required.";
    } else if (formData.phone.trim().length < 7) {
      nextErrors.phone = "Phone number too short.";
    } else if (formData.phone.trim().length > 20) {
      nextErrors.phone = "Phone number too long.";
    }

    // Required personal fields (matching registration: firstName, lastName, dob, gender)
    if (!formData.first_name || !formData.first_name.trim()) {
      nextErrors.first_name = "First Name is required.";
    }
    if (!formData.last_name || !formData.last_name.trim()) {
      nextErrors.last_name = "Last Name is required.";
    }
    if (!formData.date_of_birth) {
      nextErrors.date_of_birth = "Date of Birth is required.";
    } else if (new Date(formData.date_of_birth) > new Date()) {
      nextErrors.date_of_birth = "Birthday cannot be in the future.";
    }
    if (!formData.gender) {
      nextErrors.gender = "Gender is required.";
    }

    // Permanent address validation (matching registration: all 4 parts required)
    if (!formData.permanent_sitio || !formData.permanent_barangay || !formData.permanent_city_municipality || !formData.permanent_province) {
      nextErrors.permanentAddress = "Complete permanent address is required.";
    }

    // Present address validation
    if (!formData.present_sitio || !formData.present_barangay || !formData.present_city_municipality || !formData.present_province) {
      nextErrors.presentAddress = "Complete present address is required.";
    }

    // Academic required fields (matching registration: courseProgram, yearLevel)
    if (!formData.course) {
      nextErrors.course = "Course / Program is required.";
    }
    if (!formData.year_level) {
      nextErrors.year_level = "Year Level is required.";
    }

    // Scholarship validation
    if (formData.other_financial_assistance === "Yes") {
      if (!formData.scholarship_assistance_1 || !formData.scholarship_assistance_1.trim()) {
        nextErrors.scholarship_assistance_1 = "Enter at least one assistance source.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      setSaveError(null);
      const userId = resolveStoredStudentId();
      if (!userId) {
        setSaveError("No logged-in user found. Please log in again.");
        return;
      }

      // Format date to YYYY-MM-DD to match database DATE type
      const formatDate = (dateValue) => {
        if (!dateValue) return null;
        const date = new Date(dateValue);
        return date.toISOString().split("T")[0];
      };

      await api.put(`/api/users/student/${userId}`, {
        email: formData.email,
        firstName: formData.first_name,
        middleName: formData.middle_name,
        lastName: formData.last_name,
        suffix: formData.suffix,
        dateOfBirth: formatDate(formData.date_of_birth),
        dob: formatDate(formData.date_of_birth),
        gender: formData.gender,
        phone: formData.phone,
        permanentAddress: combinedPermanentAddress || formData.permanent_address,
        mailingAddress: formData.mailing_address,
        studentNumber: formData.student_number,
        studentType: formData.student_type,
        courseProgram: formData.course,
        course: formData.course,
        major: formData.major,
        yearLevel: formData.year_level,
        academicYear: formData.academic_year,
        semester: formData.semester,
        dateRegistered: formData.date_registered,
        previousSchool: formData.previous_school,
        yearGraduated: formData.year_graduated,
        // Personal details
        civilStatus: formData.civil_status,
        religion: formData.religion,
        isPwd: formData.is_pwd,
        indigenousPeople: formData.indigenous_people,
        zipCode: formData.zip_code,
        birthPlace: formData.birth_place,
        citizenship: formData.citizenship,
        // Address parts
        permanentSitio: formData.permanent_sitio,
        permanentBarangay: formData.permanent_barangay,
        permanentCityMunicipality: formData.permanent_city_municipality,
        permanentProvince: formData.permanent_province,
        presentSitio: formData.present_sitio,
        presentBarangay: formData.present_barangay,
        presentCityMunicipality: formData.present_city_municipality,
        presentProvince: formData.present_province,
        // Academic history
        elementarySchool: formData.elementary_school_completed_at,
        elementaryYearGraduated: formData.elementary_school_year_graduated,
        juniorHighSchool: formData.junior_high_school_completed_at,
        juniorHighYearGraduated: formData.junior_high_school_year_graduated,
        seniorHighSchool: formData.senior_high_school_completed_at,
        seniorHighYearGraduated: formData.senior_high_school_year_graduated,
        collegeProgramAttended: formData.college_program_course_attended,
        schoolYearAttended: formData.school_year_attended,
        // Family - Father
        fatherName: formData.father_name,
        fatherStatus: formData.father_status,
        fatherResidenceStreet: formData.father_residence_street,
        fatherResidenceBarangay: formData.father_residence_barangay,
        fatherResidenceCity: formData.father_residence_city,
        fatherResidenceProvince: formData.father_residence_province,
        fatherResidenceZipCode: formData.father_residence_zip_code,
        fatherOccupation: formData.father_occupation,
        fatherPhone: formData.father_phone,
        // Family - Mother
        motherName: formData.mother_name,
        motherStatus: formData.mother_status,
        motherResidenceStreet: formData.mother_residence_street,
        motherResidenceBarangay: formData.mother_residence_barangay,
        motherResidenceCity: formData.mother_residence_city,
        motherResidenceProvince: formData.mother_residence_province,
        motherResidenceZipCode: formData.mother_residence_zip_code,
        motherOccupation: formData.mother_occupation,
        motherPhone: formData.mother_phone,
        // Family - Guardian
        guardianName: formData.guardian_name,
        guardianRelationship: formData.guardian_relationship,
        guardianResidenceStreet: formData.guardian_residence_street,
        guardianResidenceBarangay: formData.guardian_residence_barangay,
        guardianResidenceCity: formData.guardian_residence_city,
        guardianResidenceProvince: formData.guardian_residence_province,
        guardianResidenceZipCode: formData.guardian_residence_zip_code,
        guardianOccupation: formData.guardian_occupation,
        guardianPhone: formData.guardian_phone,
        parentPhone: formData.parent_phone,
        // Scholarship
        otherFinancialAssistance: formData.other_financial_assistance,
        scholarshipAssistance1: formData.scholarship_assistance_1,
        scholarshipAssistance2: formData.scholarship_assistance_2,
        scholarshipAssistance3: formData.scholarship_assistance_3,
      });
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setSaveError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
   <div className=" px-4 py-3 transition-colors duration-500">
      <div className="w-full space-y-2 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200  pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900  flex items-center gap-2">
            <Users size={24} className="text-indigo-600" />
            My Profile
          </h2>
          {!loading && profile && (
            <button
              onClick={() => {
                setFormData(profile);
                setIsEditing(true);
                setSaveError(null);
                setErrors({});
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <Edit size={14} /> Edit Profile
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">
            Loading profile...
          </div>
        ) : !profile ? null : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left — Avatar card */}
            <div className="lg:col-span-1">
              <div className="bg-white  rounded-xl border border-slate-200  p-6 flex flex-col items-center text-center">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-indigo-100"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {profile.first_name?.[0]}
                    {profile.last_name?.[0]}
                  </div>
                )}
                <h3 className="mt-4 text-lg font-bold text-slate-900  leading-snug">
                  {profile.first_name}{" "}
                  {profile.middle_name ? profile.middle_name + " " : ""}
                  {profile.last_name}
                  {profile.suffix ? ", " + profile.suffix : ""}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {profile.student_number || "No student number"}
                </p>
                <span className="mt-2 inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  {profile.status || "Active"}
                </span>
                <div className="mt-5 w-full divide-y divide-slate-100  text-sm">
                  {[
                    ["Role", profile.role],
                    ["Student Type", profile.student_type],
                    ["Course", profile.course],
                    ["Major", profile.major],
                    ["Year Level", profile.year_level],
                    ["Civil Status", profile.civil_status],
                    [
                      "Registered",
                      profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : null,
                    ],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between py-2">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-800  text-right max-w-[55%] truncate">
                        {val || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Info sections */}
            <div className="lg:col-span-2 space-y-4">
              <SectionCard title="Personal Information">
                <Field label="First Name" value={profile.first_name} />
                <Field label="Last Name" value={profile.last_name} />
                <Field label="Middle Name" value={profile.middle_name} />
                <Field label="Suffix" value={profile.suffix} />
                <Field
                  label="Date of Birth"
                  value={
                    profile.date_of_birth
                      ? new Date(profile.date_of_birth).toLocaleDateString()
                      : null
                  }
                />
                <Field label="Age" value={calculateAge(profile.date_of_birth) ? String(calculateAge(profile.date_of_birth)) : null} />
                <Field label="Gender" value={profile.gender} />
                <Field label="Civil Status" value={profile.civil_status} />
                <Field label="Religion" value={profile.religion} />
                <Field label="PWD" value={profile.is_pwd} />
                <Field label="Indigenous People (IP)" value={profile.indigenous_people} />
                <Field label="Birth Place" value={profile.birth_place} />
                <Field label="Citizenship" value={profile.citizenship} />
                <Field label="Zip Code" value={profile.zip_code} />
              </SectionCard>

              <SectionCard title="Contact Information">
                <Field label="Email" value={profile.email} />
                <Field label="Phone" value={profile.phone} />
                <Field label="Parent / Guardian Phone" value={profile.parent_phone} />
              </SectionCard>

              <SectionCard title="Permanent Address">
                <Field label="Sitio / Street" value={profile.permanent_sitio} />
                <Field label="Barangay" value={profile.permanent_barangay} />
                <Field label="City / Municipality" value={profile.permanent_city_municipality} />
                <Field label="Province" value={profile.permanent_province} />
                <div className="col-span-2 md:col-span-3">
                  <Field label="Full Address" value={profile.permanent_address || [profile.permanent_sitio, profile.permanent_barangay, profile.permanent_city_municipality, profile.permanent_province].filter(Boolean).join(", ")} />
                </div>
              </SectionCard>

              <SectionCard title="Present Address">
                <Field label="Sitio / Street" value={profile.present_sitio} />
                <Field label="Barangay" value={profile.present_barangay} />
                <Field label="City / Municipality" value={profile.present_city_municipality} />
                <Field label="Province" value={profile.present_province} />
              </SectionCard>

              <SectionCard title="Academic Information">
                <Field label="Student Number" value={profile.student_number} />
                <Field label="Student Type" value={profile.student_type} />
                <Field label="Course / Program" value={profile.course} />
                <Field label="Major" value={profile.major} />
                <Field label="Year Level" value={profile.year_level} />
                <Field label="Academic Year" value={profile.academic_year} />
                <Field label="Semester" value={profile.semester} />
                <Field label="Date Registered" value={profile.date_registered ? new Date(profile.date_registered).toLocaleDateString() : null} />
              </SectionCard>

              <SectionCard title="Educational Background">
                <Field label="Elementary School" value={profile.elementary_school_completed_at} />
                <Field label="Year Graduated" value={profile.elementary_school_year_graduated} />
                <div />
                <Field label="Junior High School" value={profile.junior_high_school_completed_at} />
                <Field label="Year Graduated" value={profile.junior_high_school_year_graduated} />
                <div />
                <Field label="Senior High School" value={profile.senior_high_school_completed_at} />
                <Field label="Year Graduated" value={profile.senior_high_school_year_graduated} />
                <div />
                <Field label="College Program Attended" value={profile.college_program_course_attended} />
                <Field label="School Year Attended" value={profile.school_year_attended} />
              </SectionCard>

              <SectionCard title="Father's Information">
                <Field label="Name" value={profile.father_name} />
                <Field label="Status" value={profile.father_status} />
                <Field label="Occupation" value={profile.father_occupation} />
                <Field label="Phone" value={profile.father_phone} />
                <Field label="Street" value={profile.father_residence_street} />
                <Field label="Barangay" value={profile.father_residence_barangay} />
                <Field label="City" value={profile.father_residence_city} />
                <Field label="Province" value={profile.father_residence_province} />
                <Field label="Zip Code" value={profile.father_residence_zip_code} />
              </SectionCard>

              <SectionCard title="Mother's Information">
                <Field label="Name" value={profile.mother_name} />
                <Field label="Status" value={profile.mother_status} />
                <Field label="Occupation" value={profile.mother_occupation} />
                <Field label="Phone" value={profile.mother_phone} />
                <Field label="Street" value={profile.mother_residence_street} />
                <Field label="Barangay" value={profile.mother_residence_barangay} />
                <Field label="City" value={profile.mother_residence_city} />
                <Field label="Province" value={profile.mother_residence_province} />
                <Field label="Zip Code" value={profile.mother_residence_zip_code} />
              </SectionCard>

              <SectionCard title="Guardian Information">
                <Field label="Name" value={profile.guardian_name} />
                <Field label="Relationship" value={profile.guardian_relationship} />
                <Field label="Occupation" value={profile.guardian_occupation} />
                <Field label="Phone" value={profile.guardian_phone} />
                <Field label="Street" value={profile.guardian_residence_street} />
                <Field label="Barangay" value={profile.guardian_residence_barangay} />
                <Field label="City" value={profile.guardian_residence_city} />
                <Field label="Province" value={profile.guardian_residence_province} />
                <Field label="Zip Code" value={profile.guardian_residence_zip_code} />
              </SectionCard>

              <SectionCard title="Scholarship / Financial Assistance">
                <Field label="Receiving Assistance?" value={profile.other_financial_assistance} />
                <Field label="Assistance #1" value={profile.scholarship_assistance_1} />
                <Field label="Assistance #2" value={profile.scholarship_assistance_2} />
                <Field label="Assistance #3" value={profile.scholarship_assistance_3} />
              </SectionCard>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white  rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200  shrink-0">
              <h2 className="text-lg font-bold text-slate-900  flex items-center gap-2">
                <Edit size={18} className="text-indigo-600" /> Edit Profile
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSaveError(null);
                  setErrors({});
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-6">
              {saveError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}

              {Object.keys(errors).length > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={16} /> Please fix the highlighted errors before saving.
                </div>
              )}

              {/* ── Personal Information ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField label="First Name *" error={errors.first_name}>
                    <input
                      type="text"
                      value={formData.first_name || ""}
                      onChange={f("first_name")}
                      className={errors.first_name ? inputErrorCls : inputCls}
                      placeholder="First name"
                    />
                  </FormField>
                  <FormField label="Last Name *" error={errors.last_name}>
                    <input
                      type="text"
                      value={formData.last_name || ""}
                      onChange={f("last_name")}
                      className={errors.last_name ? inputErrorCls : inputCls}
                      placeholder="Last name"
                    />
                  </FormField>
                  <FormField label="Middle Name">
                    <input
                      type="text"
                      value={formData.middle_name || ""}
                      onChange={f("middle_name")}
                      className={inputCls}
                      placeholder="Middle name"
                    />
                  </FormField>
                  <FormField label="Suffix">
                    <select
                      value={formData.suffix || ""}
                      onChange={f("suffix")}
                      className={inputCls}
                    >
                      <option value="">None</option>
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </FormField>
                  <FormField label="Date of Birth *" error={errors.date_of_birth}>
                    <input
                      type="date"
                      value={toDateInputValue(formData.date_of_birth)}
                      onChange={f("date_of_birth")}
                      className={errors.date_of_birth ? inputErrorCls : inputCls}
                    />
                  </FormField>
                  <FormField label="Age">
                    <input
                      type="text"
                      value={age ? String(age) : ""}
                      readOnly
                      className={readonlyCls}
                    />
                  </FormField>
                  <FormField label="Gender *" error={errors.gender}>
                    <select
                      value={formData.gender || ""}
                      onChange={f("gender")}
                      className={errors.gender ? inputErrorCls : inputCls}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </FormField>
                  <FormField label="Civil Status">
                    <select
                      value={formData.civil_status || "Single"}
                      onChange={f("civil_status")}
                      className={inputCls}
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                      <option value="Others">Others</option>
                    </select>
                  </FormField>
                  <FormField label="PWD">
                    <select
                      value={formData.is_pwd || "No"}
                      onChange={f("is_pwd")}
                      className={inputCls}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </FormField>
                  <FormField label="Indigenous People (IP)">
                    <select
                      value={formData.indigenous_people || "No"}
                      onChange={f("indigenous_people")}
                      className={inputCls}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </FormField>
                  <FormField label="Religion">
                    <input
                      type="text"
                      value={formData.religion || ""}
                      onChange={f("religion")}
                      className={inputCls}
                      placeholder="Roman Catholic"
                    />
                  </FormField>
                  <FormField label="Birth Place">
                    <input
                      type="text"
                      value={formData.birth_place || ""}
                      onChange={f("birth_place")}
                      className={inputCls}
                      placeholder="City, Province"
                    />
                  </FormField>
                  <FormField label="Citizenship">
                    <input
                      type="text"
                      value={formData.citizenship || ""}
                      onChange={f("citizenship")}
                      className={inputCls}
                      placeholder="Filipino"
                    />
                  </FormField>
                  <FormField label="Zip Code">
                    <input
                      type="text"
                      value={formData.zip_code || ""}
                      onChange={f("zip_code")}
                      className={inputCls}
                      placeholder="5201"
                    />
                  </FormField>
                </div>
              </div>

              {/* ── Contact ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Email *" error={errors.email}>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={f("email")}
                      className={errors.email ? inputErrorCls : inputCls}
                      placeholder="student@school.edu"
                    />
                  </FormField>
                  <FormField label="Phone Number *" error={errors.phone}>
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={f("phone")}
                      className={errors.phone ? inputErrorCls : inputCls}
                      placeholder="09xxxxxxxxx"
                    />
                  </FormField>
                  <FormField label="Parent / Guardian Phone">
                    <input
                      type="tel"
                      value={formData.parent_phone || ""}
                      onChange={f("parent_phone")}
                      className={inputCls}
                      placeholder="Phone number"
                    />
                  </FormField>
                </div>
              </div>

              {/* ── Permanent Address ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Permanent Address *
                </h3>
                {errors.permanentAddress && (
                  <p className="mb-2 text-xs text-red-500">{errors.permanentAddress}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Sitio / Street">
                    <input
                      type="text"
                      value={formData.permanent_sitio || ""}
                      onChange={f("permanent_sitio")}
                      className={errors.permanentAddress ? inputErrorCls : inputCls}
                      placeholder="Sitio name or street"
                    />
                  </FormField>
                  <FormField label="Barangay">
                    <input
                      type="text"
                      value={formData.permanent_barangay || ""}
                      onChange={f("permanent_barangay")}
                      className={errors.permanentAddress ? inputErrorCls : inputCls}
                      placeholder="Barangay"
                    />
                  </FormField>
                  <FormField label="City / Municipality">
                    <input
                      type="text"
                      value={formData.permanent_city_municipality || ""}
                      onChange={f("permanent_city_municipality")}
                      className={errors.permanentAddress ? inputErrorCls : inputCls}
                      placeholder="City or municipality"
                    />
                  </FormField>
                  <FormField label="Province">
                    <input
                      type="text"
                      value={formData.permanent_province || ""}
                      onChange={f("permanent_province")}
                      className={errors.permanentAddress ? inputErrorCls : inputCls}
                      placeholder="Province"
                    />
                  </FormField>
                  <FormField label="Address Summary" span>
                    <input
                      type="text"
                      value={combinedPermanentAddress}
                      readOnly
                      className={readonlyCls}
                    />
                  </FormField>
                </div>
              </div>

              {/* ── Present Address ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Present Address *
                </h3>
                {errors.presentAddress && (
                  <p className="mb-2 text-xs text-red-500">{errors.presentAddress}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Sitio / Street">
                    <input
                      type="text"
                      value={formData.present_sitio || ""}
                      onChange={f("present_sitio")}
                      className={errors.presentAddress ? inputErrorCls : inputCls}
                      placeholder="Sitio name or street"
                    />
                  </FormField>
                  <FormField label="Barangay">
                    <input
                      type="text"
                      value={formData.present_barangay || ""}
                      onChange={f("present_barangay")}
                      className={errors.presentAddress ? inputErrorCls : inputCls}
                      placeholder="Barangay"
                    />
                  </FormField>
                  <FormField label="City / Municipality">
                    <input
                      type="text"
                      value={formData.present_city_municipality || ""}
                      onChange={f("present_city_municipality")}
                      className={errors.presentAddress ? inputErrorCls : inputCls}
                      placeholder="City or municipality"
                    />
                  </FormField>
                  <FormField label="Province">
                    <input
                      type="text"
                      value={formData.present_province || ""}
                      onChange={f("present_province")}
                      className={errors.presentAddress ? inputErrorCls : inputCls}
                      placeholder="Province"
                    />
                  </FormField>
                  <FormField label="Address Summary" span>
                    <input
                      type="text"
                      value={combinedPresentAddress}
                      readOnly
                      className={readonlyCls}
                    />
                  </FormField>
                </div>
              </div>

              {/* ── Academic ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Student Number">
                    <input
                      type="text"
                      value={formData.student_number || ""}
                      readOnly
                      className={readonlyCls}
                    />
                  </FormField>
                  <FormField label="Student Type">
                    <select
                      value={formData.student_type || "New Student"}
                      onChange={f("student_type")}
                      className={inputCls}
                    >
                      <option value="New Student">New Student</option>
                      <option value="Old Student">Old Student</option>
                      <option value="Transferree">Transferree</option>
                    </select>
                  </FormField>
                  <FormField label="Course / Program *" error={errors.course}>
                    <input
                      type="text"
                      value={formData.course || ""}
                      onChange={f("course")}
                      className={errors.course ? inputErrorCls : inputCls}
                      placeholder="Course or program"
                    />
                  </FormField>
                  <FormField label="Major">
                    <input
                      type="text"
                      value={formData.major || ""}
                      onChange={f("major")}
                      className={inputCls}
                      placeholder="Major"
                    />
                  </FormField>
                  <FormField label="Year Level *" error={errors.year_level}>
                    <select
                      value={formData.year_level || ""}
                      onChange={f("year_level")}
                      className={errors.year_level ? inputErrorCls : inputCls}
                    >
                      <option value="">Select year level</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </FormField>
                  <FormField label="Academic Year">
                    <input
                      type="text"
                      value={formData.academic_year || ""}
                      readOnly
                      className={readonlyCls}
                    />
                  </FormField>
                  <FormField label="Semester">
                    <input
                      type="text"
                      value={formData.semester || ""}
                      readOnly
                      className={readonlyCls}
                    />
                  </FormField>
                  <FormField label="Date Registered">
                    <input
                      type="text"
                      value={formData.date_registered ? new Date(formData.date_registered).toLocaleDateString() : ""}
                      readOnly
                      className={readonlyCls}
                    />
                  </FormField>
                </div>
              </div>

              {/* ── Educational Background ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Educational Background
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Elementary School Completed At">
                    <input
                      type="text"
                      value={formData.elementary_school_completed_at || ""}
                      onChange={f("elementary_school_completed_at")}
                      className={inputCls}
                      placeholder="Elementary school name"
                    />
                  </FormField>
                  <FormField label="Year Graduated">
                    <input
                      type="text"
                      value={formData.elementary_school_year_graduated || ""}
                      onChange={f("elementary_school_year_graduated")}
                      className={inputCls}
                      placeholder="YYYY"
                    />
                  </FormField>
                  <FormField label="Junior High School Completed At">
                    <input
                      type="text"
                      value={formData.junior_high_school_completed_at || ""}
                      onChange={f("junior_high_school_completed_at")}
                      className={inputCls}
                      placeholder="Junior high school name"
                    />
                  </FormField>
                  <FormField label="Year Graduated">
                    <input
                      type="text"
                      value={formData.junior_high_school_year_graduated || ""}
                      onChange={f("junior_high_school_year_graduated")}
                      className={inputCls}
                      placeholder="YYYY"
                    />
                  </FormField>
                  <FormField label="Senior High School Completed At">
                    <input
                      type="text"
                      value={formData.senior_high_school_completed_at || ""}
                      onChange={f("senior_high_school_completed_at")}
                      className={inputCls}
                      placeholder="Senior high school name"
                    />
                  </FormField>
                  <FormField label="Year Graduated">
                    <input
                      type="text"
                      value={formData.senior_high_school_year_graduated || ""}
                      onChange={f("senior_high_school_year_graduated")}
                      className={inputCls}
                      placeholder="YYYY"
                    />
                  </FormField>
                  <FormField label="College / Program Course Attended">
                    <input
                      type="text"
                      value={formData.college_program_course_attended || ""}
                      onChange={f("college_program_course_attended")}
                      className={inputCls}
                      placeholder="Program or course"
                    />
                  </FormField>
                  <FormField label="School Year Attended">
                    <input
                      type="text"
                      value={formData.school_year_attended || ""}
                      onChange={f("school_year_attended")}
                      className={inputCls}
                      placeholder="YYYY - YYYY"
                    />
                  </FormField>
                </div>
              </div>

              {/* ── Father's Information ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Father&apos;s Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Father's Name">
                    <input
                      type="text"
                      value={formData.father_name || ""}
                      onChange={f("father_name")}
                      className={inputCls}
                      placeholder="Full name"
                    />
                  </FormField>
                  <FormField label="Status">
                    <select
                      value={formData.father_status || "Living"}
                      onChange={f("father_status")}
                      className={inputCls}
                    >
                      <option value="Living">Living</option>
                      <option value="Deceased">Deceased</option>
                    </select>
                  </FormField>
                  <FormField label="Residence Street">
                    <input
                      type="text"
                      value={formData.father_residence_street || ""}
                      onChange={f("father_residence_street")}
                      className={inputCls}
                      placeholder="Street"
                    />
                  </FormField>
                  <FormField label="Barangay">
                    <input
                      type="text"
                      value={formData.father_residence_barangay || ""}
                      onChange={f("father_residence_barangay")}
                      className={inputCls}
                      placeholder="Barangay"
                    />
                  </FormField>
                  <FormField label="Town / City">
                    <input
                      type="text"
                      value={formData.father_residence_city || ""}
                      onChange={f("father_residence_city")}
                      className={inputCls}
                      placeholder="Town or city"
                    />
                  </FormField>
                  <FormField label="Province">
                    <input
                      type="text"
                      value={formData.father_residence_province || ""}
                      onChange={f("father_residence_province")}
                      className={inputCls}
                      placeholder="Province"
                    />
                  </FormField>
                  <FormField label="Zip Code">
                    <input
                      type="text"
                      value={formData.father_residence_zip_code || ""}
                      onChange={f("father_residence_zip_code")}
                      className={inputCls}
                      placeholder="Zip code"
                    />
                  </FormField>
                  <FormField label="Occupation">
                    <input
                      type="text"
                      value={formData.father_occupation || ""}
                      onChange={f("father_occupation")}
                      className={inputCls}
                      placeholder="Occupation"
                    />
                  </FormField>
                  <FormField label="Phone Number">
                    <input
                      type="text"
                      value={formData.father_phone || ""}
                      onChange={f("father_phone")}
                      className={inputCls}
                      placeholder="Phone number"
                    />
                  </FormField>
                </div>
              </div>

              {/* ── Mother's Information ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Mother&apos;s Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Mother's Name">
                    <input
                      type="text"
                      value={formData.mother_name || ""}
                      onChange={f("mother_name")}
                      className={inputCls}
                      placeholder="Full name"
                    />
                  </FormField>
                  <FormField label="Status">
                    <select
                      value={formData.mother_status || "Living"}
                      onChange={f("mother_status")}
                      className={inputCls}
                    >
                      <option value="Living">Living</option>
                      <option value="Deceased">Deceased</option>
                    </select>
                  </FormField>
                  <FormField label="Residence Street">
                    <input
                      type="text"
                      value={formData.mother_residence_street || ""}
                      onChange={f("mother_residence_street")}
                      className={inputCls}
                      placeholder="Street"
                    />
                  </FormField>
                  <FormField label="Barangay">
                    <input
                      type="text"
                      value={formData.mother_residence_barangay || ""}
                      onChange={f("mother_residence_barangay")}
                      className={inputCls}
                      placeholder="Barangay"
                    />
                  </FormField>
                  <FormField label="Town / City">
                    <input
                      type="text"
                      value={formData.mother_residence_city || ""}
                      onChange={f("mother_residence_city")}
                      className={inputCls}
                      placeholder="Town or city"
                    />
                  </FormField>
                  <FormField label="Province">
                    <input
                      type="text"
                      value={formData.mother_residence_province || ""}
                      onChange={f("mother_residence_province")}
                      className={inputCls}
                      placeholder="Province"
                    />
                  </FormField>
                  <FormField label="Zip Code">
                    <input
                      type="text"
                      value={formData.mother_residence_zip_code || ""}
                      onChange={f("mother_residence_zip_code")}
                      className={inputCls}
                      placeholder="Zip code"
                    />
                  </FormField>
                  <FormField label="Occupation">
                    <input
                      type="text"
                      value={formData.mother_occupation || ""}
                      onChange={f("mother_occupation")}
                      className={inputCls}
                      placeholder="Occupation"
                    />
                  </FormField>
                  <FormField label="Phone Number">
                    <input
                      type="text"
                      value={formData.mother_phone || ""}
                      onChange={f("mother_phone")}
                      className={inputCls}
                      placeholder="Phone number"
                    />
                  </FormField>
                </div>
              </div>

              {/* ── Guardian Information ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Guardian Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Guardian's Name">
                    <input
                      type="text"
                      value={formData.guardian_name || ""}
                      onChange={f("guardian_name")}
                      className={inputCls}
                      placeholder="Full name"
                    />
                  </FormField>
                  <FormField label="Relationship to Student">
                    <input
                      type="text"
                      value={formData.guardian_relationship || ""}
                      onChange={f("guardian_relationship")}
                      className={inputCls}
                      placeholder="Aunt, uncle, etc."
                    />
                  </FormField>
                  <FormField label="Residence Street">
                    <input
                      type="text"
                      value={formData.guardian_residence_street || ""}
                      onChange={f("guardian_residence_street")}
                      className={inputCls}
                      placeholder="Street"
                    />
                  </FormField>
                  <FormField label="Barangay">
                    <input
                      type="text"
                      value={formData.guardian_residence_barangay || ""}
                      onChange={f("guardian_residence_barangay")}
                      className={inputCls}
                      placeholder="Barangay"
                    />
                  </FormField>
                  <FormField label="Town / City">
                    <input
                      type="text"
                      value={formData.guardian_residence_city || ""}
                      onChange={f("guardian_residence_city")}
                      className={inputCls}
                      placeholder="Town or city"
                    />
                  </FormField>
                  <FormField label="Province">
                    <input
                      type="text"
                      value={formData.guardian_residence_province || ""}
                      onChange={f("guardian_residence_province")}
                      className={inputCls}
                      placeholder="Province"
                    />
                  </FormField>
                  <FormField label="Zip Code">
                    <input
                      type="text"
                      value={formData.guardian_residence_zip_code || ""}
                      onChange={f("guardian_residence_zip_code")}
                      className={inputCls}
                      placeholder="Zip code"
                    />
                  </FormField>
                  <FormField label="Occupation">
                    <input
                      type="text"
                      value={formData.guardian_occupation || ""}
                      onChange={f("guardian_occupation")}
                      className={inputCls}
                      placeholder="Occupation"
                    />
                  </FormField>
                  <FormField label="Phone Number">
                    <input
                      type="text"
                      value={formData.guardian_phone || ""}
                      onChange={f("guardian_phone")}
                      className={inputCls}
                      placeholder="Phone number"
                    />
                  </FormField>
                </div>
              </div>

              {/* ── Scholarship / Financial Assistance ── */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Scholarship / Financial Assistance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Receiving Other Financial Assistance?">
                    <select
                      value={formData.other_financial_assistance || "No"}
                      onChange={f("other_financial_assistance")}
                      className={inputCls}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </FormField>
                  {formData.other_financial_assistance === "Yes" && (
                    <>
                      <FormField label="Assistance #1 *" error={errors.scholarship_assistance_1}>
                        <input
                          type="text"
                          value={formData.scholarship_assistance_1 || ""}
                          onChange={f("scholarship_assistance_1")}
                          className={errors.scholarship_assistance_1 ? inputErrorCls : inputCls}
                          placeholder="Program or sponsor"
                        />
                      </FormField>
                      <FormField label="Assistance #2">
                        <input
                          type="text"
                          value={formData.scholarship_assistance_2 || ""}
                          onChange={f("scholarship_assistance_2")}
                          className={inputCls}
                          placeholder="Optional"
                        />
                      </FormField>
                      <FormField label="Assistance #3">
                        <input
                          type="text"
                          value={formData.scholarship_assistance_3 || ""}
                          onChange={f("scholarship_assistance_3")}
                          className={inputCls}
                          placeholder="Optional"
                        />
                      </FormField>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200  shrink-0">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSaveError(null);
                  setErrors({});
                }}
                className="px-4 py-2 border border-slate-300  rounded-lg text-slate-600  font-medium text-sm hover:bg-slate-50  transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-sm transition-colors disabled:opacity-60"
              >
                <Save size={14} />
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
