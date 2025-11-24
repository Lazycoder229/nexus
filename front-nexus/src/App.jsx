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
        <Route path="admin_department_managent" element={<DepartmentMngt />} />
        <Route path="students" element={<StudentInformation />} />
        <Route path="admin_manage_users" element={<UserManagement />} />
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
