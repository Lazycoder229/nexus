import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import SharedLayout from "./layouts/SharedLayout";

import AdminDashboard from "./components/pages/admin/AdminDashboard";
import LoginLayout from "./components/shared/LoginLayout";
import DepartmentMngt from "./components/pages/admin/DepartmentMngt";
import UserManagement from "./components/pages/admin/UserManagement";
import StudentInformation from "./components/pages/admin/StudentInformation";
import Department from "./components/pages/admin/Department";
import CourseManagement from "./components/pages/admin/CourseManagement";
import Prerequisites from "./components/pages/admin/Prerequisites";
import ProgramsOffering from "./components/pages/admin/ProgramsOffering";
import AcademicSem from "./components/pages/admin/AcademicSem";
import AdminStudentMngt from "./components/pages/admin/AdminStudentMngt";
import Admission from "./components/pages/admin/Admission";
import EnrollmentRecords from "./components/pages/admin/EnrollmentRecords";
import CourseTransfer from "./components/pages/admin/CourseTransfer";
import AcademicHistory from "./components/pages/admin/AcademicHistory";
import IDGenerator from "./components/pages/admin/IDGenerator";
import ClearanceProcessing from "./components/pages/admin/ClearanceProcessing";
import FacultyManagement from "./components/pages/admin/FacultyManagement";
import FacultyAssignCourse from "./components/pages/admin/FacultyAssignCourse";
import FacultyAdvisoryAssignment from "./components/pages/admin/FacultyAdvisoryAssignment";
import FacultyEvaluation from "./components/pages/admin/FacultyEvaluation";
import FacultyScheduling from "./components/pages/admin/FacultyScheduling";
import SubjectSections from "./components/pages/admin/SubjectSections";
import TimetableBuilder from "./components/pages/admin/TimetableBuilder";
import AcademicCalendar from "./components/pages/admin/AcademicCalendar";
import ClassCapacityMonitor from "./components/pages/admin/ClassCapacityMonitor";
import GradeManagement from "./components/pages/admin/GradeManagement";
import SyllabusRepository from "./components/pages/admin/SyllabusRepository";
import StaffAttendance from "./components/pages/admin/StaffAttendance";
import StudentAttendance from "./components/pages/admin/StudentAttendance";
import RFIDIntegration from "./components/pages/admin/RFIDIntegration";
import AbsenteeAlerts from "./components/pages/admin/AbsenteeAlerts";
import ExamSetup from "./components/pages/admin/ExamSetup";
import GradeEntryApproval from "./components/pages/admin/GradeEntryApproval";
import GradeComputationSetup from "./components/pages/admin/GradeComputationSetup";
import ExamScheduleBuilder from "./components/pages/admin/ExamScheduleBuilder";
import TuitionFeeSetup from "./components/pages/admin/TuitionFeeSetup";
import PaymentCollection from "./components/pages/admin/PaymentCollection";
import InvoiceManagement from "./components/pages/admin/InvoiceManagement";
import ScholarshipFundAllocation from "./components/pages/admin/ScholarshipFundAllocation";
import IncomeExpensesReports from "./components/pages/admin/IncomeExpensesReports";
import EmployeeRecords from "./components/pages/admin/EmployeeRecords";
import StaffLeave from "./components/pages/admin/StaffLeave";
import PayslipGenerator from "./components/pages/admin/PayslipGenerator";
import DeductionManagement from "./components/pages/admin/DeductionManagement";
import PayrollReports from "./components/pages/admin/PayrollReports";
import PaymentGateway from "./components/pages/admin/PaymentGateway";

function AppWrapper() {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.clear(); // clear token/role info
    navigate("/", { replace: true });
  };

  // Function to navigate based on role
  const handleNavigateByRole = (role) => {
    if (role === "Admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (role === "Student") {
      navigate("/student/dashboard", { replace: true });
    }
  };

  return (
    <Routes>
      {/* Public Route: Login page */}
      <Route
        path="/"
        element={<LoginLayout onNavigateByRole={handleNavigateByRole} />}
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/*"
        element={<SharedLayout role="Admin" handleLogout={handleLogout} />}
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="admin_department_managent" element={<Department />} />
        <Route path="admin_course_management" element={<CourseManagement />} />
        <Route path="admin_prerequisite" element={<Prerequisites />} />
        <Route path="students" element={<StudentInformation />} />
        <Route path="admin_manage_users" element={<UserManagement />} />
        <Route path="admin_program_offerings" element={<ProgramsOffering />} />
        <Route path="admin_academic_year" element={<AcademicSem />} />
        <Route path="admin_student_management" element={<AdminStudentMngt />} />
        <Route path="admin_admission" element={<Admission />} />
        <Route path="admin_enrollment" element={<EnrollmentRecords />} />
        <Route path="admin_course_transfer" element={<CourseTransfer />} />
        <Route path="admin_academic_history" element={<AcademicHistory />} />
        <Route path="admin_id_generator" element={<IDGenerator />} />
        <Route
          path="admin_clearance_processing"
          element={<ClearanceProcessing />}
        />
        <Route
          path="admin_faculty_management"
          element={<FacultyManagement />}
        />
        <Route
          path="admin_faculty_assign_course"
          element={<FacultyAssignCourse />}
        />
        <Route
          path="admin_faculty_advisory_assignment"
          element={<FacultyAdvisoryAssignment />}
        />
        <Route
          path="admin_faculty_evaluation"
          element={<FacultyEvaluation />}
        />
        <Route
          path="admin_faculty_scheduling"
          element={<FacultyScheduling />}
        />
        <Route path="admin_subject_sections" element={<SubjectSections />} />
        <Route path="admin_timetable" element={<TimetableBuilder />} />
        <Route path="admin_academic_calendar" element={<AcademicCalendar />} />
        <Route
          path="admin_capacity_monitor"
          element={<ClassCapacityMonitor />}
        />
        <Route path="admin_grademanagement" element={<GradeManagement />} />
        <Route
          path="admin_syllabus_repository"
          element={<SyllabusRepository />}
        />
        <Route path="admin_staff_attendance" element={<StaffAttendance />} />
        <Route
          path="admin_student_attendance"
          element={<StudentAttendance />}
        />
        <Route path="admin_rfid_integration" element={<RFIDIntegration />} />
        <Route path="admin_absentee" element={<AbsenteeAlerts />} />
        <Route path="admin_exam_setup" element={<ExamSetup />} />
        <Route path="admin_grade_entry" element={<GradeEntryApproval />} />
        <Route
          path="admin_grade_computation"
          element={<GradeComputationSetup />}
        />
        <Route
          path="admin_exam_schedule_builder"
          element={<ExamScheduleBuilder />}
        />
        <Route path="admin_tuition_fee_setup" element={<TuitionFeeSetup />} />
        <Route
          path="admin_payment_collection"
          element={<PaymentCollection />}
        />
        <Route
          path="admin_invoice_management"
          element={<InvoiceManagement />}
        />
        <Route
          path="admin_scholarship_fund"
          element={<ScholarshipFundAllocation />}
        />
        <Route
          path="admin_income_expenses"
          element={<IncomeExpensesReports />}
        />
        <Route path="admin_payment_gateway" element={<PaymentGateway />} />
        <Route path="admin_employee_records" element={<EmployeeRecords />} />
        <Route path="admin_staff_leave" element={<StaffLeave />} />
        <Route path="admin_payslip_generator" element={<PayslipGenerator />} />
        <Route
          path="admin_deduction_management"
          element={<DeductionManagement />}
        />
        <Route path="admin_payroll_reports" element={<PayrollReports />} />
      </Route>

      {/* Example Student Routes */}
      <Route
        path="/student/*"
        element={<SharedLayout role="Student" handleLogout={handleLogout} />}
      >
        <Route path="dashboard" element={<StudentInformation />} />
        {/* Add more student routes here */}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
