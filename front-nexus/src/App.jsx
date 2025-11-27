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
